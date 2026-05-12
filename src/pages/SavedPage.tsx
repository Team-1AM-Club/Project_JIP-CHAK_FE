import { Bookmark } from 'lucide-react';
import { Card, Header } from '../components/ui';
import type { SavedReportPreview } from '../types/domain';

export function SavedPage({ savedReports = [] }: { savedReports?: SavedReportPreview[] }) {
  return (
    <div className="screen saved-screen">
      <Header title="저장 목록" action={<span />} />

      {savedReports.length === 0 ? (
        <Card className="empty-home-card saved-empty-card">
          <Bookmark size={22} />
          <strong>저장한 집이 없습니다</strong>
          <p>저장 목록 API 연동 후 리포트 북마크가 여기에 표시됩니다.</p>
        </Card>
      ) : (
        <div className="list-stack">
          {savedReports.map((item) => (
            <Card key={item.id} className="address-row">
              <Bookmark size={18} fill="currentColor" />
              <div>
                <strong>{item.address}</strong>
                <small>
                  {item.detail}
                  {item.savedAtLabel ? ` · ${item.savedAtLabel}` : ''}
                </small>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
