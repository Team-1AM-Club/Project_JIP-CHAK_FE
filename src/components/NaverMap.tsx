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

type NaverMapStatus = 'missing-key' | 'loading' | 'ready' | 'error';

interface NaverMapProps {
  address: AddressCandidate | null;
  onLocationSelect?: (lat: number, lng: number) => void;
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
      };
    };
  }
}

export function NaverMap({ address, onLocationSelect }: NaverMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<NaverMapInstance | null>(null);
  const markerRef = useRef<NaverMarkerInstance | null>(null);
  const [status, setStatus] = useState<NaverMapStatus>('loading');
  const clientId = (import.meta.env.VITE_NAVER_MAP_CLIENT_ID as string | undefined)?.trim();

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

        window.naver.maps.Event.addListener(map, 'click', (event) => {
          const nextCenter = event.coord;
          marker.setPosition(nextCenter);
          map.setCenter(nextCenter);
          onLocationSelect?.(nextCenter.lat(), nextCenter.lng());
        });

        window.naver.maps.Event.addListener(map, 'center_changed', () => {
          const nextCenter = map.getCenter();
          marker.setPosition(nextCenter);
          onLocationSelect?.(nextCenter.lat(), nextCenter.lng());
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
  }, [clientId]);

  useEffect(() => {
    if (!window.naver?.maps || !mapRef.current || !markerRef.current) {
      return;
    }

    const nextCenter = new window.naver.maps.LatLng(center.lat, center.lng);
    mapRef.current.setCenter(nextCenter);
    markerRef.current.setPosition(nextCenter);
    mapRef.current.refresh?.();
  }, [center.lat, center.lng]);

  const moveToCurrentLocation = () => {
    if (!navigator.geolocation || !window.naver?.maps || !mapRef.current || !markerRef.current) {
      return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
      const nextCenter = new window.naver!.maps.LatLng(position.coords.latitude, position.coords.longitude);
      mapRef.current!.setCenter(nextCenter);
      markerRef.current!.setPosition(nextCenter);
      mapRef.current!.refresh?.();
      onLocationSelect?.(position.coords.latitude, position.coords.longitude);
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
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(clientId)}`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Naver Maps SDK'));
    document.head.appendChild(script);
  });
}
