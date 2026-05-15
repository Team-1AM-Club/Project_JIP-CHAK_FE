import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '../ui';
import type { BusHourlyChart as BusHourlyChartData } from '../../types/domain';

interface Props {
  chart: BusHourlyChartData;
}

export function BusHourlyChart({ chart }: Props) {
  const [open, setOpen] = useState(false);

  if (!chart.labels?.length || !chart.values?.length) {
    return null;
  }

  const len = Math.min(chart.labels.length, chart.values.length);
  const chartData = Array.from({ length: len }, (_, i) => ({
    label: `${chart.labels[i]}시`,
    value: chart.values[i],
  }));

  const unit = chart.unit ?? '';
  const subtitleParts: string[] = [];
  if (chart.stop_count) subtitleParts.push(`정류장 ${chart.stop_count}개`);
  if (chart.radius_m) subtitleParts.push(`반경 ${chart.radius_m}m`);

  return (
    <section className="risk-detail-section">
      <button
        type="button"
        className={`bus-hourly-toggle ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className="bus-hourly-toggle-text">
          <h2>{chart.title}</h2>
          {subtitleParts.length > 0 && <small>{subtitleParts.join(' · ')}</small>}
        </div>
        <ChevronDown size={18} className="bus-hourly-toggle-icon" />
      </button>

      {open && (
        <Card className="bus-hourly-card">
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={chartData} margin={{ top: 10, right: 8, bottom: 0, left: -16 }}>
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
                width={32}
                tickFormatter={(v: number) => v.toLocaleString()}
              />
              <Tooltip
                cursor={{ stroke: 'var(--color-primary)', strokeWidth: 1, strokeOpacity: 0.3 }}
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid var(--color-line)',
                  fontSize: 11,
                }}
                formatter={(value) => {
                  const v = typeof value === 'number' ? value : Number(value) || 0;
                  return [`${v.toLocaleString()}${unit}`, '유동인구'];
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={{ r: 2.5, fill: 'var(--color-primary)' }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>

          {chart.summary?.peak && (
            <p className="bus-hourly-summary">
              피크 <strong>{chart.summary.peak}</strong>
            </p>
          )}
        </Card>
      )}
    </section>
  );
}
