import { useEffect, useState } from 'react';
import { RiskRadar } from '../components/RiskChart';
import { ScoreGauge } from '../components/ScoreGauge';
import { Button, Card, Header, RiskBadge, ScorePill } from '../components/ui';
import { ApiError, reportApi } from '../services/api';
import type {
  AnalysisCategory,
  AnalysisReport,
  Grade,
  GradeLabel,
  RiskScore,
  RiskType,
  RiskTypeWire,
} from '../types/domain';

interface ReportPageProps {
  reportId: string;
  token: string | null;
  onBack: () => void;
}

export function ReportPage({ reportId, token, onBack }: ReportPageProps) {
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErrorMessage('');

    reportApi
      .getAnalysis(reportId, token)
      .then((data) => {
        if (cancelled) return;
        setReport(data);
      })
      .catch((e) => {
        if (cancelled) return;
        setErrorMessage(messageForAnalysisError(e));
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reportId, token]);

  if (loading) {
    return (
      <div className="screen">
        <Header title="리포트" onBack={onBack} action={<span />} />
        <p className="lead">리포트를 불러오고 있어요…</p>
      </div>
    );
  }

  if (errorMessage || !report) {
    return (
      <div className="screen">
        <Header title="리포트" onBack={onBack} action={<span />} />
        <p className="inline-error">{errorMessage || '리포트를 표시할 수 없어요.'}</p>
        <Button variant="secondary" onClick={onBack}>돌아가기</Button>
      </div>
    );
  }

  const totalGrade = gradeFromLabel(report.grade);
  const risks: RiskScore[] = report.categories.map(categoryToRisk);

  return (
    <div className="screen">
      <Header title="" onBack={onBack} action={<span />} />
      <div className="report-address">
        <span>분석 완료</span>
        {report.dong_code && <small>코드 {report.dong_code}</small>}
        <h1>{report.address}</h1>
        <p>사용자 가중치가 반영된 종합 리포트</p>
      </div>
      <Card className="summary-card">
        <ScoreGauge score={report.total_score} grade={totalGrade} />
        <div className="ai-summary">
          <span>AI</span>
          <p>{report.summary}</p>
        </div>
      </Card>
      <Card className="risk-radar-card">
        <RiskRadar risks={risks} />
        <div className="risk-list">
          {risks.map((risk) => (
            <button key={risk.type} type="button">
              <span>{risk.label}</span>
              <RiskBadge grade={risk.grade} />
              <ScorePill score={risk.score} grade={risk.grade} />
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
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
      return 'DANGER';
    default:
      return 'NORMAL';
  }
}

function wireToRiskType(wire: RiskTypeWire): RiskType {
  switch (wire) {
    case 'flood':
      return 'FLOOD';
    case 'security':
      return 'SAFETY';
    case 'medical':
      return 'MEDICAL';
    case 'noise':
      return 'NOISE';
    case 'congestion':
      return 'CONGESTION';
    default:
      return 'FLOOD';
  }
}

function categoryToRisk(category: AnalysisCategory): RiskScore {
  return {
    type: wireToRiskType(category.type),
    label: category.title,
    score: category.score,
    grade: gradeFromLabel(category.grade),
    summary: category.summary,
  };
}

function messageForAnalysisError(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return '리포트를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.';
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
      return error.message || '리포트를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.';
    default:
      return error.message || '리포트를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.';
  }
}
