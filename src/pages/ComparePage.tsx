import type { ReactNode } from 'react';
import {
  CloudRain,
  MapPin,
  Moon,
  Plus,
  Sparkles,
  Stethoscope,
  Trophy,
  Users,
  Volume2,
  X,
} from 'lucide-react';
import { ScoreGauge } from '../components/ScoreGauge';
import { Button, Card, Header, LoadingState } from '../components/ui';
import type {
  CompareData,
  CompareMetric,
  CompareMetricIcon,
  CompareReportItem,
  CompareSlot,
  Grade,
  GradeLabel,
} from '../types/domain';

interface ComparePageProps {
  slots: (CompareSlot | null)[];
  compare: CompareData | null;
  isLoading: boolean;
  errorMessage: string;
  onBack: () => void;
  onAddSlot: (index: number) => void;
  onRemoveSlot: (index: number) => void;
  onOpenReport?: (reportId: string) => void;
}

const SLOT_LABELS = ['A', 'B'];

export function ComparePage({
  slots,
  compare,
  isLoading,
  errorMessage,
  onBack,
  onAddSlot,
  onRemoveSlot,
  onOpenReport,
}: ComparePageProps) {
  return (
    <div className="screen compare-screen">
      <Header title="주소 비교" onBack={onBack} action={<span />} />

      <div className="compare-slot-grid">
        {[0, 1].map((index) => (
          <CompareSlotCard
            key={index}
            label={SLOT_LABELS[index]}
            slot={slots[index] ?? null}
            report={compare?.reports[index] ?? null}
            showScore={Boolean(compare) && !isLoading}
            onAdd={() => onAddSlot(index)}
            onRemove={() => onRemoveSlot(index)}
            onOpen={onOpenReport}
          />
        ))}
      </div>

      {errorMessage && <p className="inline-error">{errorMessage}</p>}
      {isLoading && <LoadingState message="비교 결과를 불러오는 중이에요…" />}

      {compare && !isLoading && (
        <>
          {compare.metric_comparison.length > 0 && (
            <>
              <h2 className="subhead">항목별 비교</h2>
              <Card className="compare-table">
                <div className="compare-table-head">
                  <span />
                  <div className="compare-table-head-labels">
                    {compare.reports.map((report) => (
                      <span key={report.report_id} className="compare-table-head-label">
                        {report.rank_label}
                      </span>
                    ))}
                  </div>
                </div>
                {compare.metric_comparison.map((metric) => (
                  <MetricRow
                    key={metric.type}
                    metric={metric}
                    reportOrder={compare.reports.map((r) => r.report_id)}
                  />
                ))}
              </Card>
            </>
          )}

          <Card className="recommend-card">
            <span>
              <Sparkles size={14} />
              {compare.recommendation.title}
            </span>
            <p>{compare.recommendation.content}</p>
            <small>{compare.recommendation.basis}</small>
            {onOpenReport && (
              <Button
                variant="primary"
                onClick={() => onOpenReport(compare.recommendation.recommended_report_id)}
              >
                추천 리포트 열기
              </Button>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

interface CompareSlotCardProps {
  label: string;
  slot: CompareSlot | null;
  report: CompareReportItem | null;
  showScore: boolean;
  onAdd: () => void;
  onRemove: () => void;
  onOpen?: (reportId: string) => void;
}

function CompareSlotCard({ label, slot, report, showScore, onAdd, onRemove, onOpen }: CompareSlotCardProps) {
  if (!slot) {
    return (
      <button type="button" className="compare-slot compare-slot-empty" onClick={onAdd}>
        <Plus size={28} />
        <span>주소 추가</span>
      </button>
    );
  }

  const displayAddress = shortenAddress(slot);
  const region = slot.candidate.gu || '';
  const grade = report ? gradeFromLabel(report.grade) : 'NORMAL';
  const clickable = Boolean(report && onOpen);

  return (
    <div className={`compare-slot compare-slot-filled ${showScore ? `grade-${grade.toLowerCase()}` : ''}`}>
      <span className="compare-slot-label">{label}</span>
      <button
        type="button"
        className="compare-slot-remove"
        onClick={onRemove}
        aria-label="비교군 제거"
      >
        <X size={14} />
      </button>
      <button
        type="button"
        className="compare-slot-body"
        onClick={clickable && report ? () => onOpen?.(report.report_id) : undefined}
        disabled={!clickable}
      >
        <strong>{displayAddress}</strong>
        {region && <small>{region}</small>}
        {showScore && report ? (
          <div className="compare-slot-gauge">
            <ScoreGauge
              score={report.total_score}
              grade={grade}
              variant="circle"
              compact
            />
          </div>
        ) : (
          <div className="compare-slot-pending">
            <MapPin size={14} />
            <span>대기 중</span>
          </div>
        )}
      </button>
    </div>
  );
}

function shortenAddress(slot: CompareSlot): string {
  const jibun = slot.candidate.detailAddress.trim();
  const road = slot.candidate.roadAddress.trim();
  const source = jibun || road;
  if (!source) return slot.candidate.dong || '선택한 위치';
  const tokens = source.split(/\s+/).filter(Boolean);
  if (tokens.length >= 2) {
    return `${tokens[tokens.length - 2]} ${tokens[tokens.length - 1]}`;
  }
  return tokens[0] ?? source;
}

interface MetricRowProps {
  metric: CompareMetric;
  reportOrder: string[];
}

function MetricRow({ metric, reportOrder }: MetricRowProps) {
  return (
    <div className="compare-metric-row">
      <div className="compare-metric-label">
        <span className="compare-metric-icon">{iconForMetric(metric.icon)}</span>
        <strong>{metric.label}</strong>
      </div>
      <div className="compare-metric-scores">
        {reportOrder.map((reportId) => {
          const entry = metric.scores.find((s) => s.report_id === reportId);
          const isBest = metric.best_report_id === reportId;
          if (!entry) {
            return (
              <div key={reportId} className="compare-metric-cell">
                <span className="compare-metric-score">—</span>
              </div>
            );
          }
          return (
            <div
              key={reportId}
              className={`compare-metric-cell ${isBest ? 'is-best' : ''}`}
            >
              {isBest && (
                <span className="compare-metric-trophy" aria-label="최고 점수">
                  <Trophy size={11} />
                </span>
              )}
              <span className="compare-metric-score">{entry.score}</span>
              <span className={`compare-metric-diff ${diffClass(entry.diff)}`}>
                {formatDiff(entry.diff)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function iconForMetric(icon: CompareMetricIcon): ReactNode {
  switch (icon) {
    case 'water':
      return <CloudRain size={14} />;
    case 'moon':
      return <Moon size={14} />;
    case 'medical':
      return <Stethoscope size={14} />;
    case 'people':
      return <Users size={14} />;
    case 'sound':
      return <Volume2 size={14} />;
    default:
      return null;
  }
}

function diffClass(diff: number) {
  if (diff > 0) return 'is-positive';
  if (diff < 0) return 'is-negative';
  return 'is-zero';
}

function formatDiff(diff: number) {
  if (diff === 0) return '±0';
  if (diff > 0) return `+${diff}`;
  return `${diff}`;
}

function gradeFromLabel(label: GradeLabel): Grade {
  switch (label) {
    case '안심':
      return 'SAFE';
    case '양호':
      return 'NORMAL';
    case '주의':
      return 'CAUTION';
    case '경고':
    case '위험':
      return 'DANGER';
    default:
      return 'NORMAL';
  }
}
