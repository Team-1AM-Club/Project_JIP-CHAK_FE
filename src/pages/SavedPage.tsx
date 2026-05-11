import { Bookmark } from 'lucide-react';
import { Card, Header } from '../components/ui';

export function SavedPage() {
  return (
    <div className="screen saved-screen">
      <Header title="저장 목록" action={<span />} />

      <Card className="empty-home-card saved-empty-card">
        <Bookmark size={22} />
        <strong>저장한 집이 없습니다</strong>
        <p>저장 목록 API 연동 후 리포트/북마크한 집이 여기에 표시됩니다.</p>
      </Card>
    </div>
  );
}
