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
  create(payload: CreateReportRequest, token?: string) {
    return apiRequest<CreateReportResponse>(apiEndpoints.reports.create, {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    });
  },

  getStatus(taskId: string, token?: string) {
    return apiRequest<ReportStatusResponse>(apiEndpoints.reports.status(taskId), { token });
  },

  getAnalysis(reportId: string, token?: string) {
    return apiRequest<ReportSummary>(apiEndpoints.reports.analysis(reportId), { token });
  },

  getRiskDetail(reportId: string, riskType: RiskType, token?: string) {
    return apiRequest<RiskDetail>(apiEndpoints.reports.riskDetail(reportId, riskType), { token });
  },
};
