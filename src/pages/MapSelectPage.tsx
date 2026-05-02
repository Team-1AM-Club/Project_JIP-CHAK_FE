import { Search } from 'lucide-react';
import { MockMap } from '../components/MockMap';
import { Button, Header } from '../components/ui';
import type { AddressCandidate } from '../types/domain';

export function MapSelectPage({
  address,
  onBack,
  analyze,
}: {
  address: AddressCandidate;
  onBack: () => void;
  analyze: () => void;
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
      <MockMap />
      <div className="map-confirm-card">
        <span>현재 선택</span>
        <h1>{address.roadAddress}</h1>
        <p>{address.detailAddress}</p>
        <div className="dual-actions">
          <Button variant="secondary">다시 찍기</Button>
          <Button onClick={analyze}>이 위치 분석하기</Button>
        </div>
      </div>
    </div>
  );
}
