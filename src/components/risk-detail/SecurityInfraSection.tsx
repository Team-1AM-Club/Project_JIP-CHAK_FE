import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Camera, Lightbulb, Shield } from 'lucide-react';
import { Card, RiskBadge } from '../ui';
import { gradeFromLabel } from './gradeUtils';
import type {
  SecurityCctvChart,
  SecurityInfraChart,
  SecurityPoliceChart,
  SecurityStreetLightChart,
} from '../../types/domain';

interface Props {
  chart: SecurityInfraChart;
}

export function SecurityInfraSection({ chart }: Props) {
  if (!chart.cctv && !chart.street_light && !chart.police) {
    return null;
  }

  return (
    <section className="risk-detail-section">
      <h2>치안 인프라</h2>
      <div className="risk-chart-stack">
        {chart.cctv && <CctvCard data={chart.cctv} />}
        {chart.street_light && <StreetLightCard data={chart.street_light} />}
        {chart.police && <PoliceCard data={chart.police} />}
      </div>
    </section>
  );
}

function CctvCard({ data }: { data: SecurityCctvChart }) {
  const chartData = data.years.map((year, idx) => ({
    year,
    count: data.counts[idx] ?? 0,
  }));

  return (
    <Card className="infra-card">
      <div className="infra-card-head">
        <div className="infra-card-icon">
          <Camera size={18} />
        </div>
        <div className="infra-card-head-body">
          <strong>{data.title ?? 'CCTV 설치 추이'}</strong>
          {typeof data.cctv_count === 'number' && (
            <small>
              현재 {data.cctv_count.toLocaleString()}대
              {typeof data.radius_m === 'number' && ` · 반경 ${data.radius_m}m`}
            </small>
          )}
        </div>
        <em className="infra-card-growth">{data.growth_label}</em>
      </div>
      <div className="infra-chart-area">
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={chartData} margin={{ top: 6, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="var(--color-line)" vertical={false} />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 10, fill: 'var(--color-ink-muted)' }}
              axisLine={false}
              tickLine={false}
              interval={1}
            />
            <YAxis hide />
            <Tooltip
              cursor={{ fill: 'rgba(224, 120, 86, 0.08)' }}
              contentStyle={{
                borderRadius: 8,
                border: '1px solid var(--color-line)',
                fontSize: 11,
              }}
              formatter={(value) => {
                const v = typeof value === 'number' ? value : Number(value);
                return [`${(Number.isFinite(v) ? v : 0).toLocaleString()}대`, 'CCTV'];
              }}
            />
            <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function StreetLightCard({ data }: { data: SecurityStreetLightChart }) {
  const grade = gradeFromLabel(data.status);
  return (
    <Card className="infra-card">
      <div className="infra-card-head">
        <div className="infra-card-icon">
          <Lightbulb size={18} />
        </div>
        <div className="infra-card-head-body">
          <strong>{data.title}</strong>
          <small>반경 {data.radius_m}m</small>
        </div>
        <RiskBadge grade={grade} />
      </div>
      <div className="infra-stat-grid">
        <Stat label="가로등" value={`${data.nearby_count.toLocaleString()}개`} />
        <Stat label="밀도" value={data.density_label} />
        <Stat label="안전스팟" value={data.safe_spot_label} />
      </div>
    </Card>
  );
}

function PoliceCard({ data }: { data: SecurityPoliceChart }) {
  return (
    <Card className="infra-card">
      <div className="infra-card-head">
        <div className="infra-card-icon">
          <Shield size={18} />
        </div>
        <div className="infra-card-head-body">
          <strong>{data.title}</strong>
          <small>{data.name}</small>
        </div>
      </div>
      <div className="infra-inline-meta">
        <span>거리 <em>{data.distance_label}</em></span>
        <span>이동 <em>{data.travel_label}</em></span>
      </div>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="infra-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
