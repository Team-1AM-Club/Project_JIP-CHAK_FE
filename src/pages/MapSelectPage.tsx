import { Search } from 'lucide-react';
import { NaverMap } from '../components/NaverMap';
import { Button, Header } from '../components/ui';
import type { AddressCandidate } from '../types/domain';

export function MapSelectPage({
  address,
  onBack,
  confirm,
  onPickLocation,
}: {
  address: AddressCandidate | null;
  onBack: () => void;
  confirm: () => void;
  onPickLocation: (lat: number, lng: number) => void;
}) {
  return (
    <div className="screen map-screen">
      <div className="map-topbar">
        <Header title="" onBack={onBack} action={<span />} />
        <label className="map-search-input">
          <Search size={16} />
          <input value="지도에서 위치를 선택하세요" readOnly />
        </label>
      </div>
      <NaverMap address={address} onLocationSelect={onPickLocation} />
      <div className="map-confirm-card">
        <span>현재 선택</span>
        <h1>{address?.roadAddress ?? '선택된 위치가 없습니다'}</h1>
        <p>{address?.detailAddress ?? '백엔드 지도 검색 API 연결 전까지는 좌표 기준으로 위치를 선택합니다.'}</p>
        <div className="dual-actions">
          <Button variant="secondary" onClick={onBack}>다시 찾기</Button>
          <Button onClick={confirm} disabled={!address}>이 위치 선택하기</Button>
        </div>
      </div>
    </div>
  );
}
