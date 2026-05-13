import type { ReactNode } from 'react';
import { ArrowRight, BarChart2, Bell, Bookmark, ChevronRight, Map, MapPin } from 'lucide-react';
import { Card, Header, IconButton, SkeletonReportCard } from '../components/ui';
import type { Grade, RecentAddressSummary, SavedReportPreview, Screen } from '../types/domain';

interface HomePageProps {
  navigate: (screen: Screen) => void;
  recentAddresses?: RecentAddressSummary[];
  savedReports?: SavedReportPreview[];
  isLoadingSaved?: boolean;
  onOpenReport?: (reportId: string) => void;
}

export function HomePage({
  navigate,
  recentAddresses = [],
  savedReports = [],
  isLoadingSaved = false,
  onOpenReport,
}: HomePageProps) {
  const hasHomeData = recentAddresses.length > 0 || savedReports.length > 0;

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

      {recentAddresses.length > 0 && (
        <HomeSection title="최근 본 주소" actionLabel="모두보기" onAction={() => navigate('search')}>
          <div className="list-stack">
            {recentAddresses.map((item) => (
              <Card key={item.id} className="address-row">
                <HomeScore score={item.score} grade={item.grade} fallback={<MapPin size={18} />} />
                <div>
                  <strong>{item.address}</strong>
                  <small>
                    {item.detail}
                    {item.viewedAtLabel ? ` · ${item.viewedAtLabel}` : ''}
                  </small>
                </div>
                <ChevronRight size={18} />
              </Card>
            ))}
          </div>
        </HomeSection>
      )}

      {isLoadingSaved && savedReports.length === 0 && (
        <HomeSection title="저장한 리포트" actionLabel="" onAction={() => navigate('saved')}>
          <div className="saved-preview">
            <SkeletonReportCard />
            <SkeletonReportCard />
          </div>
        </HomeSection>
      )}

      {savedReports.length > 0 && (
        <HomeSection title="저장한 리포트" actionLabel={`${savedReports.length}개`} onAction={() => navigate('saved')}>
          <div className="saved-preview">
            {savedReports.slice(0, 2).map((item) => {
              const canOpen = Boolean(onOpenReport && item.reportId);
              return (
                <Card
                  key={item.id}
                  className="saved-report-card"
                  onClick={canOpen ? () => onOpenReport?.(item.reportId!) : undefined}
                >
                  <div className="saved-report-top">
                    <HomeScore score={item.score} grade={item.grade} fallback={<Bookmark size={17} />} />
                    {item.isBookmarked !== false && <Bookmark className="saved-report-mark" size={16} fill="currentColor" />}
                  </div>
                  <strong>{item.address}</strong>
                  <small>
                    {item.detail}
                    {item.savedAtLabel ? ` · ${item.savedAtLabel}` : ''}
                  </small>
                </Card>
              );
            })}
          </div>
        </HomeSection>
      )}

      {!hasHomeData && (
        <Card className="empty-home-card">
          <strong>저장된 리포트가 없습니다</strong>
          <p>리포트 화면에서 저장하면 여기에 표시됩니다.</p>
        </Card>
      )}
    </div>
  );
}

function HomeSection({
  title,
  actionLabel,
  onAction,
  children,
}: {
  title: string;
  actionLabel: string;
  onAction: () => void;
  children: ReactNode;
}) {
  return (
    <section className="home-data-section">
      <div className="section-title">
        <h2>{title}</h2>
        {actionLabel && (
          <button onClick={onAction}>
            {actionLabel} <ChevronRight size={14} />
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

function HomeScore({
  score,
  grade,
  fallback,
}: {
  score?: number;
  grade?: Grade;
  fallback: ReactNode;
}) {
  if (typeof score !== 'number') {
    return <span className="home-score home-score-empty">{fallback}</span>;
  }

  return <span className={`home-score ${grade ? `grade-${grade.toLowerCase()}` : ''}`}>{score}</span>;
}
