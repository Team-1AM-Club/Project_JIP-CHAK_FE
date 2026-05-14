import { Card, RiskBadge } from '../ui';
import { gradeFromLabel } from './gradeUtils';
import type { FloodDefense, FloodDefenseMetric } from '../../types/domain';

interface Props {
  chart: FloodDefense;
}

export function FloodDefenseCard({ chart }: Props) {
  const grade = gradeFromLabel(chart.status);

  return (
    <section className="risk-detail-section">
      <h2>{chart.title}</h2>
      <Card className="flood-defense-card">
        <div className="flood-defense-head">
          <div>
            <small>방재력 종합</small>
            <strong className={`text-grade-${grade.toLowerCase()}`}>{chart.score}</strong>
            <em>/100</em>
          </div>
          <div className="flood-defense-head-meta">
            <span>자치구 평균 {chart.gu_average.toFixed(1)}</span>
            <em>{chart.percentile_label}</em>
            <RiskBadge grade={grade} />
          </div>
        </div>
        <div className="flood-defense-bar">
          <div
            className="flood-defense-bar-track"
            aria-hidden
          >
            <div
              className={`flood-defense-bar-fill grade-${grade.toLowerCase()}`}
              style={{ width: `${Math.min(100, Math.max(0, chart.score))}%` }}
            />
            <div
              className="flood-defense-bar-avg"
              style={{ left: `${Math.min(100, Math.max(0, chart.gu_average))}%` }}
              aria-label="자치구 평균"
            />
          </div>
          <div className="flood-defense-bar-labels">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>
        <ul className="flood-defense-metrics">
          {chart.metrics.map((m) => (
            <MetricRow key={m.key} metric={m} />
          ))}
        </ul>
      </Card>
    </section>
  );
}

function MetricRow({ metric }: { metric: FloodDefenseMetric }) {
  const grade = gradeFromLabel(metric.status);
  return (
    <li className="flood-defense-metric">
      <div className="flood-defense-metric-head">
        <strong>{metric.label}</strong>
        <RiskBadge grade={grade} />
      </div>
      <div className="flood-defense-metric-value">
        <em className={`text-grade-${grade.toLowerCase()}`}>{metric.display_value}</em>
        {metric.sub_display_value && <small>{metric.sub_display_value}</small>}
      </div>
    </li>
  );
}
