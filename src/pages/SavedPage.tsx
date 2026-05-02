import { Bookmark, SlidersHorizontal } from 'lucide-react';
import { Card, Header, IconButton, RiskBadge, ScorePill } from '../components/ui';
import type { SavedReport, Screen } from '../types/domain';

export function SavedPage({
  savedReports,
  navigate,
}: {
  savedReports: SavedReport[];
  navigate: (screen: Screen) => void;
}) {
  return (
    <div className="screen saved-screen">
      <Header
        title="저장 목록"
        action={
          <IconButton label="필터">
            <SlidersHorizontal size={18} />
          </IconButton>
        }
      />
      <div className="chips strong">
        {['전체 5', '안심 2', '주의 2', '위험 1'].map((chip, index) => (
          <button key={chip} className={index === 0 ? 'active' : ''}>{chip}</button>
        ))}
      </div>

      <div className="list-stack">
        {savedReports.map((saved) => (
          <Card key={saved.report.reportId} className="saved-row" onClick={() => navigate('report')}>
            <ScorePill score={saved.report.totalScore} grade={saved.report.totalGrade} />
            <div>
              <strong>{saved.report.address.roadAddress}</strong>
              <small>{saved.report.address.detailAddress}</small>
              <span>
                <RiskBadge grade={saved.report.totalGrade} />
                {saved.tags.map((tag) => (
                  <em key={tag}>{tag}</em>
                ))}
              </span>
            </div>
            <Bookmark size={18} fill="currentColor" />
          </Card>
        ))}
      </div>
    </div>
  );
}
