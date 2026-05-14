import { useEffect, useState } from 'react';
import { CloudRain, ShieldCheck, Stethoscope, Users, Volume2 } from 'lucide-react';
import { Button, Card, Header, LoadingState, RiskBadge } from '../components/ui';
import { CrimeChartSection } from '../components/risk-detail/CrimeChartSection';
import { FloodDefenseCard } from '../components/risk-detail/FloodDefenseCard';
import { FloodHistoryChart } from '../components/risk-detail/FloodHistoryChart';
import { HospitalAccessCard } from '../components/risk-detail/HospitalAccessCard';
import { MedicalWorkforceChart } from '../components/risk-detail/MedicalWorkforceChart';
import { NearestMedicalList } from '../components/risk-detail/NearestMedicalList';
import { NightDensityChart } from '../components/risk-detail/NightDensityChart';
import { SecurityInfraSection } from '../components/risk-detail/SecurityInfraSection';
import { gradeFromLabel } from '../components/risk-detail/gradeUtils';
import { ApiError, reportApi } from '../services/api';
import type {
  CongestionRiskDetail,
  FloodRiskDetail,
  MedicalRiskDetail,
  NoiseRiskDetail,
  RiskType,
  SecurityRiskDetail,
} from '../types/domain';

type RiskDetail =
  | FloodRiskDetail
  | SecurityRiskDetail
  | MedicalRiskDetail
  | NoiseRiskDetail
  | CongestionRiskDetail;

interface RiskDetailPageProps {
  reportId: string;
  riskType: RiskType;
  token: string | null;
  onBack: () => void;
}

export function RiskDetailPage({ reportId, riskType, token, onBack }: RiskDetailPageProps) {
  const [detail, setDetail] = useState<RiskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErrorMessage('');

    fetchDetail(reportId, riskType, token)
      .then((data) => {
        if (cancelled) return;
        setDetail(data);
      })
      .catch((e) => {
        if (cancelled) return;
        setErrorMessage(messageForDetailError(e));
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reportId, riskType, token]);

  if (loading) {
    return (
      <div className="screen">
        <Header title="리스크 상세" onBack={onBack} action={<span />} />
        <LoadingState message="정보를 불러오고 있어요…" />
      </div>
    );
  }

  if (errorMessage || !detail) {
    return (
      <div className="screen">
        <Header title="리스크 상세" onBack={onBack} action={<span />} />
        <p className="inline-error">{errorMessage || '리스크 상세를 표시할 수 없어요.'}</p>
        <Button variant="secondary" onClick={onBack}>돌아가기</Button>
      </div>
    );
  }

  const grade = gradeFromLabel(detail.grade);
  const chart = chartFromDetail(detail);
  const layers = detail.visualization.layers ?? [];

  return (
    <div className="screen risk-detail">
      <Header title={detail.title} onBack={onBack} action={<span />} />

      <p className="risk-detail-address">{detail.address}</p>

      <Card className="risk-detail-score">
        <div className="risk-detail-score-head">
          <div className={`risk-detail-icon grade-${grade.toLowerCase()}`}>
            {iconForRisk(riskType)}
          </div>
          <div className="risk-detail-score-body">
            <div className="risk-detail-score-title">
              <strong>{detail.title}</strong>
              <RiskBadge grade={grade} />
            </div>
            <div className="risk-detail-score-number">
              <span className={`risk-detail-score-value text-grade-${grade.toLowerCase()}`}>
                {detail.score}
              </span>
              <em>/100</em>
            </div>
            <small>
              기본 {detail.base_score} <span aria-hidden>→</span> 가중치 반영 {detail.score}
            </small>
          </div>
        </div>
        <p className="risk-detail-summary">{detail.summary}</p>
      </Card>

      <CategoryCharts detail={detail} />

      {detail.indicators.length > 0 && (
        <section className="risk-detail-section">
          <h2>세부 지표</h2>
          <div className="risk-indicator-grid">
            {detail.indicators.map((ind) => {
              const indGrade = gradeFromLabel(ind.status);
              const showUnit = ind.unit && !ind.display_value.trim().endsWith(ind.unit);
              return (
                <div key={ind.key} className="risk-indicator-card">
                  <div className="risk-indicator-name">{ind.name}</div>
                  <div className="risk-indicator-value">
                    <span className={`text-grade-${indGrade.toLowerCase()}`}>{ind.display_value}</span>
                    {showUnit && <em>{ind.unit}</em>}
                  </div>
                  <div className="risk-indicator-meta">
                    <RiskBadge grade={indGrade} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {chart && chart.labels.length > 0 && (
        <section className="risk-detail-section">
          <h2>시간대별 추이</h2>
          <Card className="risk-detail-chart">
            <SimpleBarChart labels={chart.labels} values={chart.values} unit={chart.unit} />
            <small className="risk-detail-chart-foot">
              기준 {chart.base_date_type}
              {chart.cached ? ' · 캐시됨' : ''}
            </small>
          </Card>
        </section>
      )}

      {layers.length > 0 && (
        <section className="risk-detail-section">
          <h2>참고 데이터</h2>
          <div className="risk-detail-layers">
            {layers.map((layer, idx) => (
              <span key={`${layer.type}-${idx}`} className="risk-detail-layer-chip">
                <strong>{layer.name}</strong>
                <small>{layer.source}</small>
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="risk-detail-section">
        <h2>출처</h2>
        <p className="risk-detail-source">
          <span className="risk-detail-source-type">{detail.data_source.type}</span>
          {detail.data_source.description}
        </p>
      </section>
    </div>
  );
}

function CategoryCharts({ detail }: { detail: RiskDetail }) {
  if (detail.category === 'security') {
    return (
      <>
        {detail.visualization.security_infra_chart && (
          <SecurityInfraSection chart={detail.visualization.security_infra_chart} />
        )}
        {detail.visualization.crime_chart && (
          <CrimeChartSection chart={detail.visualization.crime_chart} />
        )}
      </>
    );
  }

  if (detail.category === 'medical') {
    return (
      <>
        {detail.visualization.nearest_medical_chart && (
          <NearestMedicalList chart={detail.visualization.nearest_medical_chart} />
        )}
        {detail.visualization.hospital_access_chart && (
          <HospitalAccessCard chart={detail.visualization.hospital_access_chart} />
        )}
        {detail.visualization.night_density_chart && (
          <NightDensityChart chart={detail.visualization.night_density_chart} />
        )}
        {detail.visualization.medical_workforce_chart && (
          <MedicalWorkforceChart chart={detail.visualization.medical_workforce_chart} />
        )}
      </>
    );
  }

  if (detail.category === 'flood') {
    return (
      <>
        {detail.visualization.flood_defense && (
          <FloodDefenseCard chart={detail.visualization.flood_defense} />
        )}
        {detail.visualization.flood_history && (
          <FloodHistoryChart chart={detail.visualization.flood_history} />
        )}
      </>
    );
  }

  return null;
}

function fetchDetail(reportId: string, riskType: RiskType, token: string | null): Promise<RiskDetail> {
  const t = token ?? undefined;
  switch (riskType) {
    case 'FLOOD':
      return reportApi.getFlood(reportId, t);
    case 'SAFETY':
      return reportApi.getSecurity(reportId, t);
    case 'MEDICAL':
      return reportApi.getMedical(reportId, t);
    case 'NOISE':
      return reportApi.getNoise(reportId, t);
    case 'CONGESTION':
      return reportApi.getCongestion(reportId, t);
  }
}

function chartFromDetail(detail: RiskDetail) {
  if (detail.category === 'noise' || detail.category === 'congestion') {
    return detail.visualization.chart;
  }
  return null;
}

function iconForRisk(type: RiskType) {
  switch (type) {
    case 'FLOOD':
      return <CloudRain size={24} />;
    case 'SAFETY':
      return <ShieldCheck size={24} />;
    case 'MEDICAL':
      return <Stethoscope size={24} />;
    case 'NOISE':
      return <Volume2 size={24} />;
    case 'CONGESTION':
      return <Users size={24} />;
  }
}

function messageForDetailError(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return '리스크 상세를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.';
  }

  switch (error.code) {
    case 'REPORT_NOT_FOUND':
      return '리포트를 찾을 수 없어요.';
    case 'FORBIDDEN_REPORT':
      return '이 리포트에 접근할 수 없어요.';
    case 'REGION_DATA_NOT_FOUND':
      return '해당 지역 데이터를 찾을 수 없어요.';
    case 'INVALID_TOKEN':
    case 'EXPIRED_TOKEN':
      return '로그인이 만료됐어요. 다시 로그인해 주세요.';
    case 'EXTERNAL_API_ERROR':
    case 'ANALYSIS_FAILED':
    case 'INTERNAL_SERVER_ERROR':
      return error.message || '리스크 상세를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.';
    default:
      return error.message || '리스크 상세를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.';
  }
}

interface SimpleBarChartProps {
  labels: string[];
  values: number[];
  unit?: string;
}

function SimpleBarChart({ labels, values, unit }: SimpleBarChartProps) {
  const max = Math.max(...values, 1);
  return (
    <div className="bar-chart">
      <div className="bar-chart-bars">
        {values.map((v, i) => (
          <div key={i} className="bar-chart-bar-slot">
            <small>
              {v}
              {unit ?? ''}
            </small>
            <div className="bar-chart-bar" style={{ height: `${(v / max) * 100}%` }} />
          </div>
        ))}
      </div>
      <div className="bar-chart-labels">
        {labels.map((l, i) => (
          <span key={i}>{l}</span>
        ))}
      </div>
    </div>
  );
}
