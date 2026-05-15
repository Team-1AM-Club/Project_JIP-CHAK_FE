import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '../ui';
import type { NoiseHourlyChart as NoiseHourlyChartData } from '../../types/domain';

interface Props {
  chart: NoiseHourlyChartData;
}

export function NoiseHourlyChart({ chart }: Props) {
  if (!chart.labels?.length || !chart.values?.length) {
    return null;
  }

  const len = Math.min(chart.labels.length, chart.values.length);
  const ldenValues = chart.lden_values ?? [];
  const hasLden = ldenValues.length > 0;

  const chartData = Array.from({ length: len }, (_, i) => ({
    label: `${chart.labels[i]}시`,
    raw: chart.values[i],
    lden: hasLden ? ldenValues[i] : undefined,
  }));

  const unit = chart.unit ?? 'dB';
  const subtitleParts = [chart.subtitle, chart.station, chart.distance_label].filter(Boolean) as string[];

  return (
    <section className="risk-detail-section">
      <div className="risk-section-title">
        <h2>{chart.title}</h2>
        {subtitleParts.length > 0 && <small>{subtitleParts.join(' · ')}</small>}
      </div>

      <Card className="noise-hourly-card">
        <ResponsiveContainer width="100%" height={170}>
          <LineChart data={chartData} margin={{ top: 10, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid stroke="var(--color-line)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: 'var(--color-ink-muted)' }}
              axisLine={false}
              tickLine={false}
              interval={2}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--color-ink-muted)' }}
              axisLine={false}
              tickLine={false}
              width={28}
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
                const label = String(name) === 'lden' ? 'Lden 보정' : '측정값';
                return [`${v}${unit}`, label];
              }}
            />
            {hasLden && (
              <Line
                type="monotone"
                dataKey="lden"
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: 'var(--color-primary)' }}
                activeDot={{ r: 5 }}
              />
            )}
            <Line
              type="monotone"
              dataKey="raw"
              stroke={hasLden ? 'var(--color-line)' : 'var(--color-primary)'}
              strokeWidth={hasLden ? 1.5 : 2.5}
              strokeDasharray={hasLden ? '3 3' : undefined}
              dot={hasLden ? false : { r: 3, fill: 'var(--color-primary)' }}
            />
          </LineChart>
        </ResponsiveContainer>

        {hasLden && (
          <ul className="noise-hourly-legend">
            <li><span style={{ background: 'var(--color-primary)' }} /> Lden 보정 ({unit})</li>
            <li><span style={{ background: 'var(--color-line)' }} /> 측정값 ({unit})</li>
          </ul>
        )}

        {chart.summary && (chart.summary.peak || chart.summary.night_average_label) && (
          <ul className="noise-hourly-summary">
            {chart.summary.peak && (
              <li>
                <em>피크</em>
                <strong>{chart.summary.peak}</strong>
              </li>
            )}
            {chart.summary.night_average_label && (
              <li>
                <em>야간 평균</em>
                <strong>{chart.summary.night_average_label}</strong>
              </li>
            )}
          </ul>
        )}
      </Card>
    </section>
  );
}
