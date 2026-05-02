import { Bell, Bookmark, ChevronRight, Clock, Moon, Settings } from 'lucide-react';
import { Card, Header } from '../components/ui';

export function MyPage() {
  return (
    <div className="screen my-screen">
      <Header title="마이페이지" action={<span />} />

      <Card className="user-card">
        <div className="avatar">지</div>
        <div>
          <h1>지수님의 집:착</h1>
          <p>1인 가구 · 안전과 소음 가중</p>
        </div>
        <button>설정</button>
      </Card>

      <Card className="stats-card">
        <div><strong>12</strong><span>분석</span></div>
        <div><strong>5</strong><span>저장</span></div>
        <div><strong>3</strong><span>비교</span></div>
      </Card>

      <h2 className="subhead">가구 유형</h2>
      <Card className="profile-summary">
        <div className="avatar small">1</div>
        <div>
          <strong>청년 1인 가구</strong>
          <small>안전·소음·의료 가중치 적용 중</small>
        </div>
        <button>변경</button>
      </Card>

      <MenuSection
        title="리포트"
        items={[
          ['저장한 리포트', '5', Bookmark],
          ['최근 분석 기록', '12', Clock],
          ['비교 히스토리', '3', Settings],
        ]}
      />
      <MenuSection
        title="앱 설정"
        items={[
          ['알림 설정', '켜짐', Bell],
          ['다크 모드', '시스템 기본', Moon],
          ['데이터 출처', '서울시 공공', Settings],
        ]}
      />
    </div>
  );
}

function MenuSection({
  title,
  items,
}: {
  title: string;
  items: Array<[string, string, typeof Bell]>;
}) {
  return (
    <>
      <h2 className="subhead">{title}</h2>
      <Card className="menu-card">
        {items.map(([label, value, Icon]) => (
          <button key={label}>
            <Icon size={17} />
            <span>{label}</span>
            <em>{value}</em>
            <ChevronRight size={16} />
          </button>
        ))}
      </Card>
    </>
  );
}
