import { ArrowRight, BarChart2, Bell, Map, TrendingUp } from 'lucide-react';
import { Card, Header, IconButton, ScorePill } from '../components/ui';
import type { SavedReport, Screen } from '../types/domain';

export function HomePage({
  recentReports,
  savedReports,
  navigate,
}: {
  recentReports: SavedReport[];
  savedReports: SavedReport[];
  navigate: (screen: Screen) => void;
}) {
  return (
    <div className="screen home-screen">
      <Header
        title=""
        action={
          <IconButton label="알림">
            <Bell size={18} />
          </IconButton>
        }
      />

      <Card className="hero-card" onClick={() => navigate('search')}>
        <div>
          <span>NEW</span>
          <h1>살고 싶은 집의<br />주소를 분석해보세요</h1>
          <button className="small-cta">
            주소 검색하기 <ArrowRight size={15} />
          </button>
        </div>
        <div className="hero-house" />
      </Card>

      <div className="quick-grid">
        <Card onClick={() => navigate('map')}>
          <Map size={22} />
          <strong>지도에서 찾기</strong>
        </Card>
        <Card onClick={() => navigate('compare')}>
          <BarChart2 size={22} />
          <strong>비교하기</strong>
        </Card>
        <Card>
          <TrendingUp size={22} />
          <strong>동네 랭킹</strong>
        </Card>
      </div>

      <SectionTitle title="최근 본 주소" action="모두보기" />
      <div className="list-stack">
        {recentReports.map((saved) => (
          <Card key={saved.report.reportId} className="address-row" onClick={() => navigate('report')}>
            <ScorePill score={saved.report.totalScore} grade={saved.report.totalGrade} />
            <div>
              <strong>{saved.report.address.roadAddress}</strong>
              <small>{saved.report.address.detailAddress}</small>
            </div>
            <ArrowRight size={16} />
          </Card>
        ))}
      </div>

      <SectionTitle title="저장한 리포트" action={`${savedReports.length + 1}개`} />
      <div className="saved-preview">
        {savedReports.map((saved) => (
          <Card key={saved.report.reportId} onClick={() => navigate('saved')}>
            <ScorePill score={saved.report.totalScore} grade={saved.report.totalGrade} />
            <strong>{saved.report.address.dong}</strong>
            <small>{saved.tags[0]}</small>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SectionTitle({ title, action }: { title: string; action: string }) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      <button>{action}</button>
    </div>
  );
}
