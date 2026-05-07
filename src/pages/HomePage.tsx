import { ArrowRight, BarChart2, Bell, Map } from 'lucide-react';
import { Card, Header, IconButton } from '../components/ui';
import type { Screen } from '../types/domain';

export function HomePage({ navigate }: { navigate: (screen: Screen) => void }) {
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
      </div>

      <Card className="empty-home-card">
        <strong>담당 범위 외 데이터는 표시하지 않습니다</strong>
        <p>최근 본 주소, 분석 리포트, 저장 목록은 리포트/북마크 담당 API 연동 후 노출됩니다.</p>
      </Card>
    </div>
  );
}
