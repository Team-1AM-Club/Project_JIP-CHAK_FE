import { Bookmark } from 'lucide-react';
import { Card, Header } from '../components/ui';
import type { SavedReportPreview } from '../types/domain';

interface SavedPageProps {
  savedReports?: SavedReportPreview[];
  onToggleBookmark?: (id: string) => void;
  pendingBookmarkId?: string | null;
  errorMessage?: string;
}

export function SavedPage({
  savedReports = [],
  onToggleBookmark,
  pendingBookmarkId = null,
  errorMessage = '',
}: SavedPageProps) {
  return (
    <div className="screen saved-screen">
      <Header title="저장 목록" action={<span />} />

      {errorMessage && <p className="inline-error">{errorMessage}</p>}

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
            return (
              <Card key={item.id} className="address-row">
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
                <div>
                  <strong>{item.address}</strong>
                  <small>
                    {item.detail}
                    {item.savedAtLabel ? ` · ${item.savedAtLabel}` : ''}
                  </small>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
