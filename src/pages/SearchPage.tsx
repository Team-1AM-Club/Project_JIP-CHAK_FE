import { ArrowRight, Map, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Card, Header } from '../components/ui';
import type { AddressCandidate } from '../types/domain';

export function SearchPage({
  candidates,
  selectAddress,
  onBack,
  openMap,
}: {
  candidates: AddressCandidate[];
  selectAddress: (address: AddressCandidate) => void;
  onBack: () => void;
  openMap: () => void;
}) {
  const [query, setQuery] = useState('망원동');
  const filtered = useMemo(
    () =>
      candidates.filter((item) => item.roadAddress.includes(query) || item.dong.includes(query)).slice(0, 4),
    [candidates, query],
  );

  return (
    <div className="screen search-screen">
      <Header title="" onBack={onBack} action={<span />} />
      <label className="search-input">
        <Search size={18} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="주소를 입력해주세요" />
        <button onClick={() => setQuery('')} aria-label="검색어 삭제">
          <X size={16} />
        </button>
      </label>

      <Card className="map-search-card" onClick={openMap}>
        <Map size={22} />
        <div>
          <strong>지도에서 직접 찾기</strong>
          <small>주소가 정확하지 않을 때</small>
        </div>
        <ArrowRight size={16} />
      </Card>

      <h2 className="subhead">자동완성</h2>
      <div className="search-results">
        {filtered.map((candidate) => (
          <button key={candidate.id} onClick={() => selectAddress(candidate)}>
            <span className="pin-dot" />
            <span>
              <strong>{candidate.roadAddress.replace('서울 마포구 ', '')}</strong>
              <small>{candidate.detailAddress}</small>
            </span>
          </button>
        ))}
      </div>

      <h2 className="subhead">최근 검색어</h2>
      <div className="chips">
        {['연남동', '성수동1가', '봉천동', '아현동'].map((tag) => (
          <button key={tag}>{tag}</button>
        ))}
      </div>
    </div>
  );
}
