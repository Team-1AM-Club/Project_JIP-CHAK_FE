import { AlertCircle, Droplets, HeartPulse, Moon, Speaker, Users } from 'lucide-react';
import { MiniTrend } from '../components/RiskChart';
import { MockMap } from '../components/MockMap';
import { Card, Header, RiskBadge } from '../components/ui';
import type { AddressCandidate, RiskDetail, RiskType } from '../types/domain';

const icons: Record<RiskType, typeof Droplets> = {
  FLOOD: Droplets,
  SAFETY: Moon,
  MEDICAL: HeartPulse,
  CONGESTION: Users,
  NOISE: Speaker,
};

export function RiskDetailPage({
  detail,
  address,
  onBack,
}: {
  detail: RiskDetail;
  address: AddressCandidate;
  onBack: () => void;
}) {
  const Icon = icons[detail.type];

  return (
    <div className="screen detail-screen">
      <Header title={detail.title} onBack={onBack} action={<span />} />

      <Card className="mini-address-card">
        <AlertCircle size={18} />
        <div>
          <strong>{address.roadAddress}</strong>
          <small>{address.dong}</small>
        </div>
      </Card>

      <Card className="detail-summary-card">
        <div className="detail-summary-top">
          <span className="detail-icon">
            <Icon size={24} />
          </span>
          <div>
            <h1>{detail.title.replace(' 상세', '')}</h1>
            <RiskBadge grade={detail.grade} />
          </div>
          <strong className="detail-score">{detail.score}<small>/100</small></strong>
        </div>
        <MiniTrend values={detail.trend} />
        <p>{detail.description}</p>
      </Card>

      <h2 className="subhead">세부 지표</h2>
      <Card className="metric-card">
        {detail.metrics.map((metric) => (
          <div className="metric-row" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            {metric.grade && <RiskBadge grade={metric.grade} />}
          </div>
        ))}
      </Card>

      <h2 className="subhead">{detail.type === 'NOISE' ? '주변 소음맵' : '주변 위험 요인 지도'}</h2>
      {detail.type === 'CONGESTION' ? <CongestionBars /> : <MockMap compact />}

      <Card className="source-card">
        <strong>데이터 기준</strong>
        <p>{detail.source}</p>
      </Card>
    </div>
  );
}

function CongestionBars() {
  const values = [60, 88, 64, 58, 62, 92, 74, 46];
  return (
    <Card className="bar-chart-card">
      {values.map((value, index) => (
        <span key={index} style={{ height: `${value}%` }} className={value > 80 ? 'hot' : value > 65 ? 'warm' : ''} />
      ))}
    </Card>
  );
}
