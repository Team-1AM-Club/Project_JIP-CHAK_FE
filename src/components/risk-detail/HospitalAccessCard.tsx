import { Cross } from 'lucide-react';
import { Card, RiskBadge } from '../ui';
import { gradeFromLabel } from './gradeUtils';
import type { HospitalAccessChart } from '../../types/domain';

interface Props {
  chart: HospitalAccessChart;
}

export function HospitalAccessCard({ chart }: Props) {
  const grade = gradeFromLabel(chart.status);

  return (
    <section className="risk-detail-section">
      <h2>{chart.title}</h2>
      <Card className="hospital-access-card">
        <div className="hospital-access-score">
          <div>
            <small>접근성 점수</small>
            <strong className={`text-grade-${grade.toLowerCase()}`}>{chart.access_score}</strong>
            <em>/100</em>
          </div>
          <RiskBadge grade={grade} />
        </div>
        <div className="hospital-access-meta">
          <div>
            <span>반경 {chart.radius_m}m 내 병원</span>
            <strong>{chart.display_count}</strong>
          </div>
          <div className="hospital-access-nearest">
            <Cross size={16} />
            <div>
              <small>가장 가까운 병원</small>
              <strong>{chart.nearest_hospital.name}</strong>
              <em>{chart.nearest_hospital.distance_label}</em>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
