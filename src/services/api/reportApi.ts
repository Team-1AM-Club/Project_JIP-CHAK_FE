import type {
  AnalysisReport,
  CongestionRiskDetail,
  CreateReportEnvelope,
  CreateReportPayload,
  FloodRiskDetail,
  MedicalRiskDetail,
  NoiseRiskDetail,
  ReportStatusEnvelope,
  SecurityRiskDetail,
} from '../../types/domain';
import { apiRequest, apiRequestEnvelope } from './apiClient';
import { apiEndpoints } from './endpoints';

export const reportApi = {
  create(payload: CreateReportPayload, token?: string | null) {
    return apiRequestEnvelope<CreateReportEnvelope>(apiEndpoints.reports.create, {
      method: 'POST',
      token: token ?? undefined,
      body: JSON.stringify(payload),
    });
  },
  getStatus(taskId: string, token?: string | null) {
    return apiRequestEnvelope<ReportStatusEnvelope>(apiEndpoints.reports.status(taskId), {
      method: 'GET',
      token: token ?? undefined,
    });
  },
  getAnalysis(reportId: string, token?: string | null) {
    return apiRequest<AnalysisReport>(apiEndpoints.reports.analysis(reportId), {
      method: 'GET',
      token: token ?? undefined,
    });
  },
  getFlood(reportId: string, token?: string | null) {
    return apiRequest<FloodRiskDetail>(apiEndpoints.reports.flood(reportId), {
      method: 'GET',
      token: token ?? undefined,
    });
  },
  getSecurity(reportId: string, token?: string | null) {
    return apiRequest<SecurityRiskDetail>(apiEndpoints.reports.security(reportId), {
      method: 'GET',
      token: token ?? undefined,
    });
  },
  getMedical(reportId: string, token?: string | null) {
    return apiRequest<MedicalRiskDetail>(apiEndpoints.reports.medical(reportId), {
      method: 'GET',
      token: token ?? undefined,
    });
  },
  getNoise(reportId: string, token?: string | null) {
    return apiRequest<NoiseRiskDetail>(apiEndpoints.reports.noise(reportId), {
      method: 'GET',
      token: token ?? undefined,
    });
  },
  getCongestion(reportId: string, token?: string | null) {
    return apiRequest<CongestionRiskDetail>(apiEndpoints.reports.congestion(reportId), {
      method: 'GET',
      token: token ?? undefined,
    });
  },
};
