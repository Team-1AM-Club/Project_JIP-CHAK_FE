import type { AddressCandidate, CompareResult } from '../../types/domain';
import { apiRequest } from './apiClient';
import { apiEndpoints } from './endpoints';

export const addressApi = {
  async search(query: string, token?: string | null) {
    const response = await apiRequest<unknown>(apiEndpoints.addresses.search, {
      query: { query },
      token: token ?? undefined,
    });

    return normalizeAddressCandidates(response);
  },

  async mapSearch(lat: number, lng: number, token?: string | null) {
    const response = await apiRequest<unknown>(apiEndpoints.addresses.mapSearch, {
      query: { lat, lng },
      token: token ?? undefined,
    });

    return normalizeAddressCandidates(response);
  },

  compare(leftAddressId: string, rightAddressId: string, token?: string | null) {
    return apiRequest<CompareResult>(apiEndpoints.reports.compare, {
      query: { report_ids: `${leftAddressId},${rightAddressId}` },
      token: token ?? undefined,
    });
  },
};

function normalizeAddressCandidates(response: unknown): AddressCandidate[] {
  const list = Array.isArray(response)
    ? response
    : typeof response === 'object' && response !== null
      ? ((response as { addresses?: unknown[]; items?: unknown[]; results?: unknown[] }).addresses ??
        (response as { items?: unknown[] }).items ??
        (response as { results?: unknown[] }).results ??
        [])
      : [];

  return list.map((item, index) => {
    const record = item as Record<string, unknown>;
    const roadAddress = stringValue(record.roadAddress ?? record.road_addr ?? record.address ?? record.addressName);
    const dong = stringValue(record.dong ?? record.dong_name ?? record.dongName);
    const gu = stringValue(record.gu ?? record.gu_name ?? record.guName);

    return {
      id: stringValue(record.id ?? record.addressId ?? record.address_id ?? record.property_id ?? `api_addr_${index}`),
      roadAddress,
      detailAddress: stringValue(record.detailAddress ?? record.detail_address ?? record.jibun_addr ?? record.description ?? record.placeName),
      dong,
      gu,
      lat: numberValue(record.lat ?? record.latitude ?? record.y),
      lng: numberValue(record.lng ?? record.lon ?? record.longitude ?? record.x),
    };
  });
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : value == null ? '' : String(value);
}

function numberValue(value: unknown) {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) ? number : 0;
}
