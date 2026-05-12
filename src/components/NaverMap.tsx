import { useEffect, useRef, useState } from 'react';
import { LocateFixed, SlidersHorizontal } from 'lucide-react';
import type { AddressCandidate } from '../types/domain';
import { MockMap } from './MockMap';
import { IconButton } from './ui';

const DEFAULT_CENTER = {
  lat: 37.5561,
  lng: 126.9056,
};

const NAVER_MAP_SCRIPT_ID = 'naver-map-sdk';
const COORD_EPSILON = 0.00001;
const MAP_DRIVEN_CENTER_LOCK_MS = 5000;

type NaverMapStatus = 'missing-key' | 'loading' | 'ready' | 'error';

export interface ResolvedMapAddress {
  lat: number;
  lng: number;
  roadAddress: string;
  jibunAddress: string;
  dong: string;
  gu: string;
  dongCode?: string;
}

interface NaverMapProps {
  address: AddressCandidate | null;
  onLocationSelect?: (lat: number, lng: number) => void;
  onAddressResolved?: (result: ResolvedMapAddress) => void;
}

interface NaverLatLng {
  lat(): number;
  lng(): number;
}

interface NaverMapEvent {
  coord: NaverLatLng;
}

interface NaverMapInstance {
  setCenter: (latlng: NaverLatLng) => void;
  getCenter: () => NaverLatLng;
  refresh?: () => void;
}

interface NaverMarkerInstance {
  setPosition: (latlng: NaverLatLng) => void;
}

interface NaverReverseGeocodeRegionPart {
  name?: string;
}

interface NaverReverseGeocodeRegion {
  area1?: NaverReverseGeocodeRegionPart;
  area2?: NaverReverseGeocodeRegionPart;
  area3?: NaverReverseGeocodeRegionPart;
  area4?: NaverReverseGeocodeRegionPart;
}

interface NaverReverseGeocodeResult {
  name?: string;
  code?: { id?: string };
  region?: NaverReverseGeocodeRegion;
}

interface NaverReverseGeocodeResponse {
  v2?: {
    address?: { roadAddress?: string; jibunAddress?: string };
    results?: NaverReverseGeocodeResult[];
  };
}

declare global {
  interface Window {
    naver?: {
      maps: {
        Event: {
          addListener: (target: unknown, eventName: string, listener: (event: NaverMapEvent) => void) => void;
          trigger?: (target: unknown, eventName: string) => void;
        };
        LatLng: new (lat: number, lng: number) => NaverLatLng;
        Map: new (
          element: HTMLElement,
          options: {
            center: NaverLatLng;
            zoom: number;
            minZoom?: number;
            maxZoom?: number;
            scaleControl?: boolean;
            logoControl?: boolean;
            mapDataControl?: boolean;
            zoomControl?: boolean;
          },
        ) => NaverMapInstance;
        Marker: new (options: { position: NaverLatLng; map: NaverMapInstance }) => NaverMarkerInstance;
        Service?: {
          Status: { OK: number };
          reverseGeocode: (
            options: { coords: NaverLatLng; orders?: string },
            callback: (status: number, response: NaverReverseGeocodeResponse) => void,
          ) => void;
        };
      };
    };
  }
}

export function NaverMap({ address, onLocationSelect, onAddressResolved }: NaverMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<NaverMapInstance | null>(null);
  const markerRef = useRef<NaverMarkerInstance | null>(null);
  const onAddressResolvedRef = useRef(onAddressResolved);
  const lastNotifiedCenterRef = useRef(DEFAULT_CENTER);
  const mapDrivenCenterLockUntilRef = useRef(0);
  const idleTimerRef = useRef<number | null>(null);
  const [status, setStatus] = useState<NaverMapStatus>('loading');
  const clientId = (import.meta.env.VITE_NAVER_MAP_CLIENT_ID as string | undefined)?.trim();

  useEffect(() => {
    onAddressResolvedRef.current = onAddressResolved;
  }, [onAddressResolved]);

  const center = getCenter(address);

  useEffect(() => {
    if (!clientId) {
      setStatus('missing-key');
      return;
    }

    setStatus('loading');

    loadNaverMapScript(clientId)
      .then(() => {
        if (!containerRef.current || !window.naver?.maps) {
          setStatus('error');
          return;
        }

        const initialCenter = new window.naver.maps.LatLng(center.lat, center.lng);
        const map = new window.naver.maps.Map(containerRef.current, {
          center: initialCenter,
          zoom: 16,
          minZoom: 12,
          maxZoom: 20,
          scaleControl: false,
          logoControl: true,
          mapDataControl: false,
          zoomControl: false,
        });
        const marker = new window.naver.maps.Marker({
          position: initialCenter,
          map,
        });
        lastNotifiedCenterRef.current = { lat: center.lat, lng: center.lng };

        const handlePickedLocation = (lat: number, lng: number) => {
          if (isSameCoordinate(lastNotifiedCenterRef.current, { lat, lng })) {
            return;
          }

          lastNotifiedCenterRef.current = { lat, lng };
          mapDrivenCenterLockUntilRef.current = Date.now() + MAP_DRIVEN_CENTER_LOCK_MS;
          onLocationSelect?.(lat, lng);
          resolveAddressFromCoord(lat, lng, onAddressResolvedRef.current);
        };

        window.naver.maps.Event.addListener(map, 'click', (event) => {
          const nextCenter = event.coord;
          marker.setPosition(nextCenter);
          map.setCenter(nextCenter);
          lastNotifiedCenterRef.current = {
            lat: nextCenter.lat(),
            lng: nextCenter.lng(),
          };
          mapDrivenCenterLockUntilRef.current = Date.now() + MAP_DRIVEN_CENTER_LOCK_MS;
          onLocationSelect?.(nextCenter.lat(), nextCenter.lng());
          resolveAddressFromCoord(nextCenter.lat(), nextCenter.lng(), onAddressResolvedRef.current);
        });

        window.naver.maps.Event.addListener(map, 'idle', () => {
          if (idleTimerRef.current) {
            window.clearTimeout(idleTimerRef.current);
          }

          idleTimerRef.current = window.setTimeout(() => {
            const nextCenter = map.getCenter();
            marker.setPosition(nextCenter);
            handlePickedLocation(nextCenter.lat(), nextCenter.lng());
            idleTimerRef.current = null;
          }, 180);
        });

        mapRef.current = map;
        markerRef.current = marker;
        setStatus('ready');

        window.setTimeout(() => {
          map.refresh?.();
          window.naver?.maps.Event.trigger?.(map, 'resize');
          map.setCenter(initialCenter);
        }, 0);
      })
      .catch(() => {
        setStatus('error');
      });

    return () => {
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
    };
  }, [clientId]);

  useEffect(() => {
    if (!window.naver?.maps || !mapRef.current || !markerRef.current) {
      return;
    }

    const nextCenter = new window.naver.maps.LatLng(center.lat, center.lng);
    const currentCenter = mapRef.current.getCenter();
    const current = { lat: currentCenter.lat(), lng: currentCenter.lng() };
    const next = { lat: center.lat, lng: center.lng };

    if (Date.now() < mapDrivenCenterLockUntilRef.current || isSameCoordinate(current, next)) {
      markerRef.current.setPosition(currentCenter);
      return;
    }

    lastNotifiedCenterRef.current = next;
    mapRef.current.setCenter(nextCenter);
    markerRef.current.setPosition(nextCenter);
    mapRef.current.refresh?.();
  }, [center.lat, center.lng]);

  const moveToCurrentLocation = () => {
    if (!navigator.geolocation || !window.naver?.maps || !mapRef.current || !markerRef.current) {
      return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      const nextCenter = new window.naver!.maps.LatLng(latitude, longitude);
      lastNotifiedCenterRef.current = { lat: latitude, lng: longitude };
      mapDrivenCenterLockUntilRef.current = Date.now() + MAP_DRIVEN_CENTER_LOCK_MS;
      mapRef.current!.setCenter(nextCenter);
      markerRef.current!.setPosition(nextCenter);
      mapRef.current!.refresh?.();
      onLocationSelect?.(latitude, longitude);
      resolveAddressFromCoord(latitude, longitude, onAddressResolvedRef.current);
    });
  };

  if (status === 'missing-key' || status === 'error') {
    return (
      <div className="naver-map-fallback">
        <MockMap />
        <div className="map-sdk-notice">
          {status === 'missing-key'
            ? 'VITE_NAVER_MAP_CLIENT_ID가 설정되지 않아 임시 지도를 표시 중입니다.'
            : '네이버 지도 SDK를 불러오지 못해 임시 지도를 표시 중입니다.'}
        </div>
      </div>
    );
  }

  return (
    <div className="naver-map">
      <div ref={containerRef} className="naver-map-node" />
      {status === 'loading' && <div className="map-sdk-loading">네이버 지도를 불러오는 중입니다.</div>}
      <div className="map-controls">
        <IconButton label="현재 위치" onClick={moveToCurrentLocation}>
          <LocateFixed size={18} />
        </IconButton>
        <IconButton label="지도 필터">
          <SlidersHorizontal size={18} />
        </IconButton>
      </div>
    </div>
  );
}

function isSameCoordinate(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  return Math.abs(a.lat - b.lat) < COORD_EPSILON && Math.abs(a.lng - b.lng) < COORD_EPSILON;
}

function getCenter(address: AddressCandidate | null) {
  if (address && Number.isFinite(address.lat) && Number.isFinite(address.lng) && address.lat !== 0 && address.lng !== 0) {
    return {
      lat: address.lat,
      lng: address.lng,
    };
  }

  return DEFAULT_CENTER;
}

function loadNaverMapScript(clientId: string) {
  if (window.naver?.maps) {
    return Promise.resolve();
  }

  const existingScript = document.getElementById(NAVER_MAP_SCRIPT_ID) as HTMLScriptElement | null;
  if (existingScript) {
    return new Promise<void>((resolve, reject) => {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Naver Maps SDK')), { once: true });
    });
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.id = NAVER_MAP_SCRIPT_ID;
    script.async = true;
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(clientId)}&submodules=geocoder`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Naver Maps SDK'));
    document.head.appendChild(script);
  });
}

function resolveAddressFromCoord(
  lat: number,
  lng: number,
  onResolved: ((result: ResolvedMapAddress) => void) | undefined,
) {
  if (!onResolved) return;
  const naver = window.naver?.maps;
  if (!naver?.Service?.reverseGeocode) return;

  const coords = new naver.LatLng(lat, lng);

  naver.Service.reverseGeocode(
    { coords, orders: 'legalcode,admcode,addr,roadaddr' },
    (status, response) => {
      if (status !== naver.Service!.Status.OK) return;
      const v2 = response.v2;
      const legal = v2?.results?.find((item) => item.name === 'legalcode');
      const fallback = v2?.results?.[0];
      const region = legal?.region ?? fallback?.region;

      onResolved({
        lat,
        lng,
        roadAddress: v2?.address?.roadAddress ?? '',
        jibunAddress: v2?.address?.jibunAddress ?? '',
        dong: region?.area3?.name ?? '',
        gu: region?.area2?.name ?? '',
        dongCode: legal?.code?.id,
      });
    },
  );
}
