import type { ReactNode } from 'react';
import {
  CloudRain,
  Moon,
  Sparkles,
  Stethoscope,
  Trophy,
  Users,
  Volume2,
} from 'lucide-react';
import { Button, Card, Header, RiskBadge } from '../components/ui';
import type {
  CompareData,
  CompareMetric,
  CompareMetricIcon,
  Grade,
  GradeLabel,
} from '../types/domain';

interface ComparePageProps {
  compare: CompareData | null;
  isLoading: boolean;
  errorMessage: string;
  onBack: () => void;
  onOpenReport?: (reportId: string) => void;
}

export function ComparePage({
  compare,
  isLoading,
  errorMessage,
  onBack,
  onOpenReport,
}: ComparePageProps) {
  return (
    <div className="screen compare-screen">
      <Header title="주소 비교" onBack={onBack} action={<span />} />

      {isLoading && <p className="inline-status">비교 결과를 불러오는 중이에요…</p>}
      {errorMessage && <p className="inline-error">{errorMessage}</p>}

      {!compare && !isLoading && !errorMessage && (
        <Card className="empty-home-card">
          <strong>비교할 리포트가 없어요</strong>
          <p>저장 목록에서 2~4개의 매물을 선택해 비교를 시작하세요.</p>
        </Card>
      )}

      {compare && (
        <>
          <div className="compare-cards">
            {compare.reports.map((report) => {
              const grade = gradeFromLabel(report.grade);
              const clickable = Boolean(onOpenReport);
              return (
                <Card
                  key={report.report_id}
                  className="compare-score-card"
                  onClick={clickable ? () => onOpenReport?.(report.report_id) : undefined}
                >
                  <span className="compare-rank">{report.rank_label}</span>
                  <h2>{report.short_address}</h2>
                  <small>{report.region_name}</small>
                  <div className={`compare-score-value text-grade-${grade.toLowerCase()}`}>
                    <strong>{report.total_score}</strong>
                    <em>/100</em>
                  </div>
                  <RiskBadge grade={grade} />
                  {report.strength_tags.length > 0 && (
                    <ul className="compare-strength-tags">
                      {report.strength_tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                  )}
                </Card>
              );
            })}
          </div>

          {compare.metric_comparison.length > 0 && (
            <>
              <h2 className="subhead">항목별 비교</h2>
              <Card className="compare-table">
                <div className="compare-table-head">
                  <span />
                  {compare.reports.map((report) => (
                    <span key={report.report_id} className="compare-table-head-label">
                      {report.rank_label}
                    </span>
                  ))}
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

