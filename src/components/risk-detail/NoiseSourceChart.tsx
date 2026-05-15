import { Activity, Car, MessageCircle, Wine } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, RiskBadge } from '../ui';
import { gradeFromLabel } from './gradeUtils';
import type { NoiseSourceChart as NoiseSourceChartData, NoiseSourceItem } from '../../types/domain';

const ICONS: Record<string, LucideIcon> = {
  traffic: Car,
  complaint: MessageCircle,
  pub: Wine,
  measurement: Activity,
};

interface Props {
  chart: NoiseSourceChartData;
}

export function NoiseSourceChart({ chart }: Props) {
  if (!chart.items || chart.items.length === 0) {
    return null;
  }

  return (
    <section className="risk-detail-section">
      <h2>{chart.title ?? '소음원별 영향'}</h2>
      <div className="noise-source-grid">
        {chart.items.map((item) => (
          <NoiseSourceCard key={item.key} item={item} />
        ))}
      </div>
    </section>
  );
}

function NoiseSourceCard({ item }: { item: NoiseSourceItem }) {
  const grade = gradeFromLabel(item.status);
  const Icon = ICONS[item.key] ?? Activity;
  const metaLines = metaLinesFor(item);

  return (
    <Card className="noise-source-card">
      <div className="noise-source-head">
        <div className={`noise-source-icon grade-${grade.toLowerCase()}`}>
          <Icon size={18} />
        </div>
        <div className="noise-source-title">
          <strong>{item.label}</strong>
          <RiskBadge grade={grade} />
        </div>
      </div>
      <div className="noise-source-value">
        <span className={`text-grade-${grade.toLowerCase()}`}>{item.display_value}</span>
      </div>
      {item.description && <p className="noise-source-desc">{item.description}</p>}
      {(item.distance_label || metaLines.length > 0) && (
        <ul className="noise-source-meta">
          {item.distance_label && (
            <li>
              <em>거리</em>
              <span>{item.distance_label}</span>
            </li>
          )}
          {metaLines.map((line) => (
            <li key={line.key}>
              <em>{line.label}</em>
              <span>{line.value}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

interface MetaLine {
  key: string;
  label: string;
  value: string;
}

function metaLinesFor(item: NoiseSourceItem): MetaLine[] {
  const meta = item.meta;
  if (!meta) return [];

  const lines: MetaLine[] = [];
  const push = (key: string, label: string) => {
    const raw = meta[key];
    if (raw === undefined || raw === null || raw === '') return;
    lines.push({ key, label, value: String(raw) });
  };

  switch (item.key) {
    case 'traffic':
      push('point_name', '측정 지점');
      push('night_traffic_label', '야간 교통량');
      break;
    case 'complaint':
      push('gu_name', '자치구');
      push('yearly_count', '연간 민원');
      break;
    case 'measurement':
      push('station', '측정소');
      push('land_use', '용도지역');
      break;
    case 'pub':
    default:
      // pub은 description으로 충분 — 추가 meta 없음
      break;
  }

  return lines;
}
