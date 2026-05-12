import { useMemo, useState } from 'react';
import { Bookmark, Check, Scale } from 'lucide-react';
import { Button, Card, Header, IconButton } from '../components/ui';
import type { SavedReportPreview } from '../types/domain';

interface SavedPageProps {
  savedReports?: SavedReportPreview[];
  onToggleBookmark?: (id: string) => void;
  onOpenReport?: (reportId: string) => void;
  onStartCompare?: (reportIds: string[]) => void;
  pendingBookmarkId?: string | null;
  errorMessage?: string;
}

const MAX_COMPARE = 2;

export function SavedPage({
  savedReports = [],
  onToggleBookmark,
  onOpenReport,
  onStartCompare,
  pendingBookmarkId = null,
  errorMessage = '',
}: SavedPageProps) {
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const comparableReports = useMemo(
    () => savedReports.filter((item) => Boolean(item.reportId)),
    [savedReports],
  );

  const toggleSelected = (reportId: string) => {
    setSelectedIds((current) => {
      if (current.includes(reportId)) {
        return current.filter((id) => id !== reportId);
      }
      if (current.length >= MAX_COMPARE) {
        return current;
      }
      return [...current, reportId];
    });
  };

  const exitCompareMode = () => {
    setCompareMode(false);
    setSelectedIds([]);
  };

  const enterCompareMode = () => {
    setCompareMode(true);
    setSelectedIds([]);
  };

  const canCompare = selectedIds.length === MAX_COMPARE;
  const compareDisabled = comparableReports.length < 2 || !onStartCompare;

  const handleCompare = () => {
    if (!onStartCompare || !canCompare) return;
    onStartCompare(selectedIds);
    exitCompareMode();
  };

  return (
    <div className={`screen saved-screen ${compareMode ? 'is-compare-mode' : ''}`}>
      <Header
        title="저장 목록"
        action={
          compareMode ? (
            <button type="button" className="text-button" onClick={exitCompareMode}>
              취소
            </button>
          ) : (
            <IconButton label="비교 모드" onClick={compareDisabled ? undefined : enterCompareMode}>
              <Scale size={18} />
            </IconButton>
          )
        }
      />

      {errorMessage && <p className="inline-error">{errorMessage}</p>}

      {compareMode && (
        <p className="inline-status">비교할 매물을 2개 선택하세요 ({selectedIds.length}/{MAX_COMPARE})</p>
      )}

      {savedReports.length === 0 ? (
        <Card className="empty-home-card saved-empty-card">
          <Bookmark size={22} />
          <strong>저장한 집이 없습니다</strong>
          <p>리포트 화면에서 저장하면 여기에 표시됩니다.</p>
        </Card>
      ) : (
        <div className="list-stack">
          {savedReports.map((item) => {
            const pending = pendingBookmarkId === item.id;
            const reportId = item.reportId;
            const selected = reportId ? selectedIds.includes(reportId) : false;
            const selectable = compareMode && Boolean(reportId);
            const canOpen = !compareMode && Boolean(onOpenReport && reportId);

            const handleRowClick = () => {
              if (selectable && reportId) {
                toggleSelected(reportId);
              } else if (canOpen && reportId) {
                onOpenReport?.(reportId);
              }
            };

            return (
              <Card key={item.id} className="address-row">
                {compareMode ? (
                  <span
                    className={`compare-checkbox ${selected ? 'is-selected' : ''}`}
                    aria-hidden
                  >
                    {selected && <Check size={14} />}
                  </span>
                ) : (
                  <button
                    type="button"
                    className="bookmark-toggle"
                    onClick={() => onToggleBookmark?.(item.id)}
                    disabled={pending || !onToggleBookmark}
                    aria-label="저장 해제"
                    aria-pressed="true"
                  >
                    <Bookmark size={18} fill="currentColor" />
                  </button>
                )}
                <button
                  type="button"
                  className="saved-row-open"
                  onClick={selectable || canOpen ? handleRowClick : undefined}
                  disabled={!selectable && !canOpen}
                  aria-label={
                    selectable
                      ? `${item.address} 비교 ${selected ? '해제' : '선택'}`
                      : `${item.address} 리포트 열기`
                  }
                  aria-pressed={selectable ? selected : undefined}
                >
                  <strong>{item.address}</strong>
                  <small>
                    {item.detail}
                    {item.savedAtLabel ? ` · ${item.savedAtLabel}` : ''}
                  </small>
                </button>
              </Card>
            );
          })}
        </div>
      )}

      {compareMode && (
        <div className="compare-cta-bar">
          <Button variant="primary" onClick={handleCompare} disabled={!canCompare}>
            비교하기 ({selectedIds.length}/{MAX_COMPARE})
          </Button>
        </div>
      )}
    </div>
  );
}
