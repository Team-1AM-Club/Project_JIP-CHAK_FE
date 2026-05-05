import type {
  CreateReportRequest,
  CreateReportResponse,
  ReportStatusResponse,
  ReportSummary,
  RiskDetail,
  RiskType,
} from '../../types/domain';
import { apiRequest } from './apiClient';
import { apiEndpoints } from './endpoints';

export const reportApi = {
  create(payload: CreateReportRequest) {
    return apiRequest<CreateReportResponse>(apiEndpoints.reports.create, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getStatus(taskId: string) {
    return apiRequest<ReportStatusResponse>(apiEndpoints.reports.status(taskId));
  },

  getAnalysis(reportId: string) {
    return apiRequest<ReportSummary>(apiEndpoints.reports.analysis(reportId));
  },

  getRiskDetail(reportId: string, riskType: RiskType) {
    return apiRequest<RiskDetail>(apiEndpoints.reports.riskDetail(reportId, riskType));
  },
};
