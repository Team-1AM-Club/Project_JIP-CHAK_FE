import type {
  AnalysisReport,
  CreateReportEnvelope,
  CreateReportRequest,
  ReportStatusEnvelope,
  RiskDetailResponse,
  RiskType,
} from '../../types/domain';
import { apiRequest, apiRequestEnvelope } from './apiClient';
import { apiEndpoints } from './endpoints';

export const reportApi = {
  /**
   * 분석 리포트 생성/조회.
   * 캐시 HIT면 status='READY' + report_id 즉시 반환,
   * MISS면 status='PROCESSING' + task_id로 폴링 필요.
   */
  create(payload: CreateReportRequest) {
    return apiRequestEnvelope<CreateReportEnvelope>(apiEndpoints.reports.create, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * 분석 진행 상황 폴링.
   * status='PROCESSING' (진행률 + 현재/완료 단계) 또는 status='COMPLETED' (report_id) 반환.
   * 분석 자체 실패(status='FAILED')는 ApiError로 던져짐.
   * Rate limit: 분당 10회 (TOO_MANY_REQUESTS).
   */
  getStatus(taskId: string) {
    return apiRequestEnvelope<ReportStatusEnvelope>(apiEndpoints.reports.status(taskId));
  },

  /**
   * 종합 분석 리포트 조회.
   * total_score + 5개 카테고리(침수/치안/의료/소음/혼잡) 요약 + saved(북마크 여부) 반환.
   * categories[].type은 wire lowercase ('flood'|'security'|'medical'|'noise'|'congestion').
   */
  getAnalysis(reportId: string) {
    return apiRequest<AnalysisReport>(apiEndpoints.reports.analysis(reportId));
  },

  /**
   * 카테고리별 리스크 상세.
   * indicators (정적 지표) + map.risk_factors (지도 마커) + data_source (출처) 반환.
   * indicators[].value, risk_factors[].distance는 단위 포함 문자열 — 정렬/계산 불가.
   * URL 세그먼트는 endpoints.ts의 riskEndpointByType이 변환 (SAFETY → security 등).
   */
  getRiskDetail(reportId: string, riskType: RiskType) {
    return apiRequest<RiskDetailResponse>(apiEndpoints.reports.riskDetail(reportId, riskType));
  },
};
