import { LocateFixed, MapPin, SlidersHorizontal } from 'lucide-react';
import { IconButton } from './ui';

export function MockMap({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`mock-map ${compact ? 'compact' : ''}`} aria-label="지도 미리보기">
      <div className="map-road vertical a" />
      <div className="map-road vertical b" />
      <div className="map-road horizontal a" />
      <div className="map-road horizontal b" />
      <div className="map-block block-a" />
      <div className="map-block block-b" />
      <div className="map-block block-c" />
      <div className="map-water" />
      <MapPin className="map-pin" size={38} />
      {!compact && (
        <div className="map-controls">
          <IconButton label="현재 위치">
            <LocateFixed size={18} />
          </IconButton>
          <IconButton label="지도 필터">
            <SlidersHorizontal size={18} />
          </IconButton>
        </div>
      )}
    </div>
  );
}
