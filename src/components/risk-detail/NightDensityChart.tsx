import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '../ui';
import type { NightDensityChart as NightDensityChartData } from '../../types/domain';

interface Props {
  chart: NightDensityChartData;
}

export function NightDensityChart({ chart }: Props) {
  if (chart.time_slots.length === 0) {
    return null;
  }

  const chartData = chart.time_slots.map((slot) => ({
    label: `${slot.hour}시`,
    total: slot.count,
    clinic: slot.clinic_count,
    pharmacy: slot.pharmacy_count,
  }));

  return (
    <section className="risk-detail-section">
      <h2>{chart.title}</h2>
      <Card className="night-density-card">
        <div className="night-density-head">
          <div>
            <strong>{chart.density_label}</strong>
            <small>{chart.gu_average_label} · 반경 {chart.radius_m}m</small>
          </div>
        </div>
        <div className="night-density-chart-area">
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData} margin={{ top: 10, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid stroke="var(--color-line)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: 'var(--color-ink-muted)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'var(--color-ink-muted)' }}
                axisLine={false}
                tickLine={false}
                width={24}
              />
              <Tooltip
                cursor={{ stroke: 'var(--color-primary)', strokeWidth: 1, strokeOpacity: 0.3 }}
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid var(--color-line)',
                  fontSize: 11,
                }}
                formatter={(value, name) => {
                  const v = typeof value === 'number' ? value : Number(value) || 0;
                  const key = String(name);
                  const label = key === 'total' ? '운영 시설' : key === 'clinic' ? '의원' : '약국';
                  return [`${v}곳`, label];
                }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: 'var(--color-primary)' }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="clinic"
                stroke="var(--color-safe)"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="pharmacy"
                stroke="var(--color-watch)"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <ul className="night-density-legend">
          <li><span style={{ background: 'var(--color-primary)' }} /> 전체</li>
          <li><span style={{ background: 'var(--color-safe)' }} /> 의원</li>
          <li><span style={{ background: 'var(--color-watch)' }} /> 약국</li>
        </ul>
      </Card>
    </section>
  );
}
