import { Building2, Cross, Pill, Stethoscope } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '../ui';
import type { NearestMedicalChart, NearestMedicalType } from '../../types/domain';

const ICONS: Record<NearestMedicalType, LucideIcon> = {
  general_hospital: Building2,
  hospital: Cross,
  clinic: Stethoscope,
  pharmacy: Pill,
};

interface Props {
  chart: NearestMedicalChart;
}

export function NearestMedicalList({ chart }: Props) {
  if (chart.items.length === 0) {
    return null;
  }

  return (
    <section className="risk-detail-section">
      <h2>{chart.title}</h2>
      <Card className="nearest-medical-card">
        <ul className="nearest-medical-list">
          {chart.items.map((item) => {
            const Icon = ICONS[item.type] ?? Stethoscope;
            return (
              <li key={`${item.type}-${item.name}`} className="nearest-medical-row">
                <div className="nearest-medical-icon">
                  <Icon size={18} />
                </div>
                <div className="nearest-medical-body">
                  <small>{item.label}</small>
                  <strong>{item.name}</strong>
                </div>
                <div className="nearest-medical-meta">
                  <span>{item.distance_label}</span>
                  <em>{item.travel_label}</em>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </section>
  );
}
