import { Bus, TrainFront } from 'lucide-react';
import { Card, RiskBadge } from '../ui';
import { gradeFromLabel } from './gradeUtils';
import type {
  NearbyTransportBus,
  NearbyTransportChart as NearbyTransportChartData,
  NearbyTransportSubway,
} from '../../types/domain';

interface Props {
  chart: NearbyTransportChartData;
}

export function NearbyTransportChart({ chart }: Props) {
  if (!chart.subway && !chart.bus) {
    return null;
  }

  return (
    <section className="risk-detail-section">
      <h2>가까운 대중교통</h2>
      <div className="nearby-transport-list">
        {chart.subway && <SubwayCard data={chart.subway} />}
        {chart.bus && <BusCard data={chart.bus} />}
      </div>
    </section>
  );
}

function SubwayCard({ data }: { data: NearbyTransportSubway }) {
  const grade = gradeFromLabel(data.status ?? undefined);
  const headerParts = [data.line_name, data.travel_label, data.distance_label].filter(Boolean) as string[];

  return (
    <Card className="transport-card">
      <div className="transport-head">
        <div className={`transport-icon grade-${grade.toLowerCase()}`}>
          <TrainFront size={18} />
        </div>
        <div className="transport-title">
          <strong>{data.station_name}</strong>
          {headerParts.length > 0 && <small>{headerParts.join(' · ')}</small>}
        </div>
        {data.status && <RiskBadge grade={grade} />}
      </div>
      <ul className="transport-meta">
        {data.daily_passengers_label && (
          <li>
            <em>일평균 승하차</em>
            <span>{data.daily_passengers_label}</span>
          </li>
        )}
        {data.avg_congestion_label && (
          <li>
            <em>평균 혼잡도</em>
            <span>{data.avg_congestion_label}</span>
          </li>
        )}
        {data.peak_congestion_label && (
          <li>
            <em>피크 혼잡도</em>
            <span>{data.peak_congestion_label}</span>
          </li>
        )}
      </ul>
    </Card>
  );
}

function BusCard({ data }: { data: NearbyTransportBus }) {
  const grade = gradeFromLabel(data.status ?? undefined);
  const headerParts = [data.stop_type, data.travel_label, data.distance_label].filter(Boolean) as string[];

  return (
    <Card className="transport-card">
      <div className="transport-head">
        <div className={`transport-icon grade-${grade.toLowerCase()}`}>
          <Bus size={18} />
        </div>
        <div className="transport-title">
          <strong>{data.stop_name}</strong>
          {headerParts.length > 0 && <small>{headerParts.join(' · ')}</small>}
        </div>
        {data.status && <RiskBadge grade={grade} />}
      </div>
      <ul className="transport-meta">
        {data.daily_avg_usage_label && (
          <li>
            <em>일평균 이용량</em>
            <span>{data.daily_avg_usage_label}</span>
          </li>
        )}
        {data.congestion_score_label && (
          <li>
            <em>혼잡 점수</em>
            <span>{data.congestion_score_label}</span>
          </li>
        )}
      </ul>
    </Card>
  );
}
