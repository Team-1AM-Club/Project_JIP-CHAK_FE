import { Bookmark, Share2 } from 'lucide-react';
import { RiskRadar } from '../components/RiskChart';
import { ScoreGauge } from '../components/ScoreGauge';
import { Button, Card, Header, IconButton, RiskBadge } from '../components/ui';
import type { ReportSummary, RiskType, Screen } from '../types/domain';

export function ReportPage({
  report,
  navigate,
  openDetail,
}: {
  report: ReportSummary;
  navigate: (screen: Screen) => void;
  openDetail: (type: RiskType) => void;
}) {
  return (
    <div className="screen report-screen">
      <Header
        title="분석 리포트"
        onBack={() => navigate('home')}
        action={
          <IconButton label="공유">
            <Share2 size={18} />
          </IconButton>
        }
      />

      <div className="report-address">
        <span>{report.address.gu} · {report.address.dong}</span>
        <small>{report.analyzedAt} 분석</small>
        <h1>{report.address.roadAddress}</h1>
        <p>{report.address.detailAddress}</p>
      </div>

      <Card className="summary-card">
        <ScoreGauge score={report.totalScore} grade={report.totalGrade} />
        <div className="ai-summary">
          <span>AI</span>
          <strong>한 줄 요약</strong>
          <p>{report.oneLineSummary}</p>
        </div>
      </Card>

      <div className="section-title">
        <h2>5대 리스크</h2>
        <button>1인 가구 가중치 적용</button>
      </div>

      <Card className="risk-radar-card">
        <RiskRadar risks={report.risks} />
        <div className="risk-list">
          {report.risks.map((risk) => (
            <button key={risk.type} onClick={() => openDetail(risk.type)}>
              <span>{risk.label}</span>
              <strong>{risk.score}</strong>
              <RiskBadge grade={risk.grade} />
            </button>
          ))}
        </div>
      </Card>

      <div className="report-bottom-cta">
        <Button variant="secondary" onClick={() => navigate('saved')}>
          <Bookmark size={17} /> 저장
        </Button>
        <Button onClick={() => navigate('compare')}>다른 곳과 비교</Button>
      </div>
    </div>
  );
}
