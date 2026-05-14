import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '../ui';
import { gradeFromLabel } from './gradeUtils';
import type { MedicalWorkforceChart as MedicalWorkforceChartData } from '../../types/domain';

interface Props {
  chart: MedicalWorkforceChartData;
}

export function MedicalWorkforceChart({ chart }: Props) {
  if (chart.items.length === 0) {
    return null;
  }

  const chartData = chart.items.map((item) => ({
    label: item.label,
    value: item.value,
    average: item.gu_average,
  }));

  return (
    <section className="risk-detail-section">
      <div className="risk-section-title">
        <h2>{chart.title}</h2>
        <small>{chart.scope} · {chart.gu_name}</small>
      </div>

      <Card className="workforce-card">
        <ResponsiveContainer width="100%" height={170}>
          <BarChart data={chartData} margin={{ top: 10, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid stroke="var(--color-line)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: 'var(--color-ink-body)' }}
              axisLine={false}
              tickLine={false}
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
              formatter={(value, name) => {
                const v = typeof value === 'number' ? value : Number(value) || 0;
                const label = String(name) === 'value' ? '현재' : '자치구 평균';
                return [`${v.toLocaleString()}명`, label];
              }}
            />
            <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 0, 0]} barSize={22} />
            <Bar dataKey="average" fill="var(--color-line)" radius={[4, 4, 0, 0]} barSize={22} />
          </BarChart>
        </ResponsiveContainer>
        <ul className="workforce-legend">
          <li><span style={{ background: 'var(--color-primary)' }} /> 현재</li>
          <li><span style={{ background: 'var(--color-line)' }} /> 자치구 평균</li>
        </ul>
      </Card>

      <ul className="workforce-row-list">
        {chart.items.map((item) => {
          const grade = gradeFromLabel(item.status);
          const diffPositive = item.diff_from_average >= 0;
          return (
            <li key={item.key} className="workforce-row">
              <div className="workforce-row-head">
                <strong>{item.label}</strong>
                <em className={`text-grade-${grade.toLowerCase()}`}>{item.display_value}</em>
              </div>
              <div className="workforce-row-meta">
                <small>{item.gu_average_label}</small>
                <span className={`workforce-diff ${diffPositive ? 'is-positive' : 'is-negative'}`}>
                  {item.diff_label}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
