import { ArrowRight, Map, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, Header } from '../components/ui';
import type { AddressCandidate } from '../types/domain';

export function SearchPage({
  selectAddress,
  onBack,
  openMap,
  searchAddresses,
}: {
  selectAddress: (address: AddressCandidate) => void;
  onBack: () => void;
  openMap: () => void;
  searchAddresses: (query: string) => Promise<AddressCandidate[]>;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AddressCandidate[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setErrorMessage('');
      return;
    }

    let ignore = false;
    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      setErrorMessage('');

      try {
        const nextResults = await searchAddresses(query);
        if (!ignore) {
          setResults(nextResults.slice(0, 6));
        }
      } catch {
        if (!ignore) {
          setErrorMessage('주소 검색 API 연결에 실패했습니다.');
          setResults([]);
        }
      } finally {
        if (!ignore) {
          setIsSearching(false);
        }
      }
    }, 250);

    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, [query, searchAddresses]);

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
          <small>현재 위치 기준으로 주소를 찾습니다</small>
        </div>
        <ArrowRight size={16} />
      </Card>

      <h2 className="subhead">검색 결과</h2>
      {isSearching && <p className="inline-status">주소 검색 중...</p>}
      {errorMessage && <p className="inline-error">{errorMessage}</p>}
      {!query.trim() && <p className="empty-message">검색어를 입력하면 주소 검색 API 결과가 표시됩니다.</p>}
      {query.trim() && !isSearching && !errorMessage && results.length === 0 && (
        <p className="empty-message">검색 결과가 없습니다.</p>
      )}
      <div className="search-results">
        {results.map((candidate) => (
          <button key={candidate.id} onClick={() => selectAddress(candidate)}>
            <span className="pin-dot" />
            <span>
              <strong>{candidate.roadAddress}</strong>
              <small>{candidate.detailAddress}</small>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
