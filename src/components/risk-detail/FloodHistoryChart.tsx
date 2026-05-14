import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '../ui';
import type { FloodHistory } from '../../types/domain';

interface Props {
  chart: FloodHistory;
}

export function FloodHistoryChart({ chart }: Props) {
  const yearData = chart.years.map((y) => ({ year: String(y.year), count: y.count }));

  return (
    <section className="risk-detail-section">
      <h2>{chart.title}</h2>
      <Card className="flood-history-card">
        <div className="flood-history-head">
          <div>
            <strong>{chart.display_total}</strong>
            <small>{chart.average_label}</small>
          </div>
          {chart.has_nearby_history && (
            <span className="flood-history-nearby">
              반경 500m 내 침수 이력 {chart.nearby_count ?? 0}건
            </span>
          )}
        </div>

        {yearData.length > 0 && (
          <div className="flood-history-chart-area">
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={yearData} margin={{ top: 10, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid stroke="var(--color-line)" vertical={false} />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 10, fill: 'var(--color-ink-muted)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'var(--color-ink-muted)' }}
                  axisLine={false}
                  tickLine={false}
                  width={24}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(224, 120, 86, 0.08)' }}
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid var(--color-line)',
                    fontSize: 11,
                  }}
                  formatter={(value) => {
                    const v = typeof value === 'number' ? value : Number(value) || 0;
                    return [`${v}건`, '침수 건수'];
                  }}
                />
                <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {chart.events.length > 0 && (
          <ul className="flood-history-events">
            {chart.events.map((event, idx) => (
              <li key={`${event.year}-${idx}`} className="flood-history-event">
                <div className="flood-history-event-head">
                  <span>{event.year}</span>
                  <em>{event.type}</em>
                </div>
                <strong>{event.label}</strong>
                <div className="flood-history-event-meta">
                  {typeof event.area_m2 === 'number' && <small>면적 {event.area_m2.toFixed(1)}㎡</small>}
                  {typeof event.depth_cm === 'number' && <small>침수심 {event.depth_cm.toFixed(1)}cm</small>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  );
}
