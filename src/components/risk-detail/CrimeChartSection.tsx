import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '../ui';
import { gradeFromLabel } from './gradeUtils';
import type { CrimeChart, Grade } from '../../types/domain';

const GRADE_COLOR: Record<Grade, string> = {
  SAFE: 'var(--color-safe)',
  NORMAL: 'var(--color-safe)',
  CAUTION: 'var(--color-watch)',
  DANGER: 'var(--color-alert)',
};

interface Props {
  chart: CrimeChart;
}

export function CrimeChartSection({ chart }: Props) {
  const { summary, items } = chart;
  const diff = summary.occurrence_diff_from_seoul_avg;
  const diffLabel =
    diff === 0
      ? '서울 평균과 동일'
      : diff > 0
        ? `서울 평균 대비 +${diff.toFixed(1)}%`
        : `서울 평균 대비 ${diff.toFixed(1)}%`;
  const diffClass = diff <= 0 ? 'is-positive' : 'is-negative';

  const chartData = items.map((item) => ({
    label: item.label,
    bar: item.bar_value,
    occurrence: item.occurrence,
    clearance: item.clearance_rate,
    grade: gradeFromLabel(item.status),
    display_occurrence: item.display_occurrence,
    display_clearance: item.display_clearance_rate,
  }));

  return (
    <section className="risk-detail-section">
      <div className="risk-section-title">
        <h2>{chart.title}</h2>
        <small>{chart.subtitle} · {chart.display_region_name}</small>
      </div>

      <Card className="crime-summary-card">
        <div className="crime-summary-stats">
          <div className="crime-summary-stat">
            <span>최근 5년 총 발생</span>
            <strong>{summary.total_occurrence.toLocaleString()}건</strong>
            <em className={`crime-summary-diff ${diffClass}`}>{diffLabel}</em>
          </div>
          <div className="crime-summary-stat">
            <span>검거율</span>
            <strong>{summary.clearance_rate.toFixed(1)}%</strong>
            <em>서울 평균 {summary.seoul_clearance_rate.toFixed(1)}%</em>
          </div>
          <div className="crime-summary-stat">
            <span>자치구 순위</span>
            <strong>
              {summary.rank}<small>/{summary.rank_total}</small>
            </strong>
            <em>상위 {summary.safe_percentile.toFixed(0)}%</em>
          </div>
        </div>
      </Card>

      <Card className="crime-chart-card">
        <ResponsiveContainer width="100%" height={Math.max(160, items.length * 36)}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 60, bottom: 0, left: 0 }}
          >
            <XAxis type="number" hide domain={[0, 'dataMax']} />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fontSize: 11, fill: 'var(--color-ink-body)' }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              cursor={{ fill: 'rgba(26, 37, 64, 0.04)' }}
              contentStyle={{ borderRadius: 8, fontSize: 11, border: '1px solid var(--color-line)' }}
              formatter={(_v, _name, item) => {
                const datum = item?.payload;
                return [
                  `${datum?.display_occurrence} · ${datum?.display_clearance}`,
                  '발생/검거',
                ];
              }}
            />
            <Bar dataKey="bar" radius={[0, 6, 6, 0]}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={GRADE_COLOR[d.grade]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <ul className="crime-legend">
          {chartData.map((d) => (
            <li key={d.label} className={`crime-legend-row text-grade-${d.grade.toLowerCase()}`}>
              <span className="crime-legend-dot" style={{ background: GRADE_COLOR[d.grade] }} />
              <strong>{d.label}</strong>
              <em>{d.display_occurrence}</em>
              <small>{d.display_clearance}</small>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}
