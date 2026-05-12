import type { Grade, SavedReportPreview } from '../../types/domain';
import { apiRequest } from './apiClient';
import { apiEndpoints } from './endpoints';

export const bookmarkApi = {
  async getProperties(token?: string | null) {
    const response = await apiRequest<unknown>(apiEndpoints.bookmarks.properties, {
      token: token ?? undefined,
    });

    return normalizeSavedReports(response);
  },

  saveProperty(token: string, propertyId: string, reportId?: string | null) {
    return apiRequest<unknown>(apiEndpoints.bookmarks.properties, {
      method: 'POST',
      token,
      body: JSON.stringify({
        property_id: propertyId,
        ...(reportId ? { report_id: reportId } : {}),
      }),
    });
  },

  deleteProperty(token: string, id: string) {
    return apiRequest<void>(`${apiEndpoints.bookmarks.properties}/${id}`, {
      method: 'DELETE',
      token,
    });
  },
};

function normalizeSavedReports(response: unknown): SavedReportPreview[] {
  const list = Array.isArray(response)
    ? response
    : typeof response === 'object' && response !== null
      ? ((response as { bookmarks?: unknown[]; properties?: unknown[]; items?: unknown[]; results?: unknown[] }).bookmarks ??
        (response as { properties?: unknown[] }).properties ??
        (response as { items?: unknown[] }).items ??
        (response as { results?: unknown[] }).results ??
        [])
      : [];

  return list.map((item, index) => {
    const record = item as Record<string, unknown>;
    const address = record.address as Record<string, unknown> | undefined;
    const report = record.report as Record<string, unknown> | undefined;

    return {
      id: stringValue(record.id ?? record.bookmarkId ?? record.propertyId ?? `bookmark_${index}`),
      reportId: optionalString(record.reportId ?? record.report_id ?? report?.id),
      address: stringValue(record.roadAddress ?? record.road_addr ?? record.addressName ?? record.name ?? address?.roadAddress ?? address?.road_addr ?? address?.address),
      detail: stringValue(record.detailAddress ?? record.detail_address ?? record.jibun_addr ?? record.description ?? address?.detailAddress ?? address?.jibun_addr ?? address?.dong),
      score: optionalNumber(record.totalScore ?? record.total_score ?? record.score ?? report?.totalScore ?? report?.total_score),
      grade: normalizeGrade(record.totalGrade ?? record.total_grade ?? record.grade ?? report?.totalGrade ?? report?.total_grade),
      savedAtLabel: optionalString(record.savedAtLabel ?? record.createdAt ?? record.created_at ?? record.savedAt ?? record.saved_at),
      isBookmarked: true,
    };
  });
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : value == null ? '' : String(value);
}

function optionalString(value: unknown) {
  const text = stringValue(value);
  return text.length > 0 ? text : undefined;
}

function optionalNumber(value: unknown) {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function normalizeGrade(value: unknown): Grade | undefined {
  return value === 'SAFE' || value === 'NORMAL' || value === 'CAUTION' || value === 'DANGER' ? value : undefined;
}
