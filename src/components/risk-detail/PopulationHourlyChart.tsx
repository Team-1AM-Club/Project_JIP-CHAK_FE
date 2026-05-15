import { Bar, BarChart, Cell, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '../ui';
import { gradeFromLabel } from './gradeUtils';
import type { Grade, PopulationHourlyChart as PopulationHourlyChartData } from '../../types/domain';

const GRADE_COLOR: Record<Grade, string> = {
  SAFE: 'var(--color-safe)',
  NORMAL: 'var(--color-safe)',
  CAUTION: 'var(--color-watch)',
  DANGER: 'var(--color-alert)',
};

interface Props {
  chart: PopulationHourlyChartData;
}

export function PopulationHourlyChart({ chart }: Props) {
  if (!chart.labels?.length || !chart.values?.length) {
    return null;
  }

  const len = Math.min(chart.labels.length, chart.values.length);
  const statuses = chart.statuses ?? [];

  const chartData = Array.from({ length: len }, (_, i) => ({
    label: `${chart.labels[i]}시`,
    value: chart.values[i],
    grade: gradeFromLabel(statuses[i]),
  }));

  const unit = chart.unit ?? '';

  return (
    <section className="risk-detail-section">
      <div className="risk-section-title">
        <h2>{chart.title}</h2>
        {chart.scope && <small>{chart.scope}</small>}
      </div>

      <Card className="population-hourly-card">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} margin={{ top: 10, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid stroke="var(--color-line)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: 'var(--color-ink-muted)' }}
              axisLine={false}
              tickLine={false}
              interval={1}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--color-ink-muted)' }}
              axisLine={false}
              tickLine={false}
              width={36}
              tickFormatter={(v: number) => v.toLocaleString()}
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
                return [`${v.toLocaleString()}${unit}`, '인구'];
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={GRADE_COLOR[d.grade]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {chart.summary && (
          <ul className="population-hourly-summary">
            {chart.summary.morning_peak && (
              <li>
                <em>출근 피크</em>
                <strong>{chart.summary.morning_peak}</strong>
              </li>
            )}
            {chart.summary.evening_peak && (
              <li>
                <em>퇴근 피크</em>
                <strong>{chart.summary.evening_peak}</strong>
              </li>
            )}
            {chart.summary.night && (
              <li>
                <em>심야</em>
                <strong>{chart.summary.night}</strong>
              </li>
            )}
          </ul>
        )}
      </Card>
    </section>
  );
}
