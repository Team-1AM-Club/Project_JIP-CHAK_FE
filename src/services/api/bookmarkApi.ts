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
      reportId: optionalString(record.reportId ?? report?.id),
      address: stringValue(record.roadAddress ?? record.addressName ?? record.name ?? address?.roadAddress ?? address?.address),
      detail: stringValue(record.detailAddress ?? record.description ?? address?.detailAddress ?? address?.dong),
      score: optionalNumber(record.totalScore ?? record.score ?? report?.totalScore),
      grade: normalizeGrade(record.totalGrade ?? record.grade ?? report?.totalGrade),
      savedAtLabel: optionalString(record.savedAtLabel ?? record.createdAt ?? record.savedAt),
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
