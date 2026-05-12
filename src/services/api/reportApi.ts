import type { CreateReportEnvelope, CreateReportPayload } from '../../types/domain';
import { apiRequestEnvelope } from './apiClient';
import { apiEndpoints } from './endpoints';

export const reportApi = {
  create(payload: CreateReportPayload, token?: string | null) {
    return apiRequestEnvelope<CreateReportEnvelope>(apiEndpoints.reports.create, {
      method: 'POST',
      token: token ?? undefined,
      body: JSON.stringify(payload),
    });
  },
};
