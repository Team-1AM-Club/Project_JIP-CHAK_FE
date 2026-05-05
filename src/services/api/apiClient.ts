import type { AuthTokenResponse } from '../../types/domain';
import { tokenStorage } from './tokenStorage';

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN ?? '';
const REISSUE_PATH = '/api/v1/auth/reissue';

interface ApiSuccess<T> {
  success: true;
  status?: string;
  data: T;
  error: null;
}

interface ApiFailure {
  success: false;
  status?: string;
  data: null;
  error: {
    code: string;
    message: string;
    details?: string;
  };
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
    public readonly details?: string,
    public readonly payload?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * query 값으로 URL 인코딩 가능한 primitive만 허용.
 * 타입은 Record<string, unknown>으로 풀어 호출 측에서 typed interface 그대로 넘길 수 있게 함.
 * (TypeScript 명목적 타이핑 — 명시적 키 interface는 Record<string, primitive>에 할당 불가)
 * 런타임에서 String(value) 변환 + null/undefined skip.
 */
export interface RequestOptions extends RequestInit {
  query?: Record<string, unknown>;
  skipAuth?: boolean;
}

function buildUrl(path: string, query?: RequestOptions['query']): URL {
  const url = new URL(path, API_ORIGIN || window.location.origin);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url;
}

function buildHeaders(hasBody: boolean, skipAuth: boolean, extra?: HeadersInit): Headers {
  const headers = new Headers(extra);
  if (hasBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (!skipAuth) {
    const token = tokenStorage.getAccess();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }
  return headers;
}

function parseEnvelope<T>(text: string): ApiEnvelope<T> | null {
  if (!text) return null;
  try {
    return JSON.parse(text) as ApiEnvelope<T>;
  } catch {
    return null;
  }
}

let reissueInFlight: Promise<string | null> | null = null;

async function reissueAccessToken(): Promise<string | null> {
  if (reissueInFlight) return reissueInFlight;

  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) return null;

  reissueInFlight = (async () => {
    try {
      const response = await fetch(buildUrl(REISSUE_PATH), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!response.ok) return null;
      const envelope = parseEnvelope<AuthTokenResponse>(await response.text());
      if (!envelope?.success) return null;
      tokenStorage.set(envelope.data);
      return envelope.data.accessToken;
    } catch {
      return null;
    }
  })();

  try {
    return await reissueInFlight;
  } finally {
    reissueInFlight = null;
  }
}

type RequestResult<T> =
  | { ok: true; envelope: ApiSuccess<T> }
  | { ok: false; httpStatus: number; envelope: ApiFailure | null };

async function executeRequest<T>(path: string, options: RequestOptions): Promise<RequestResult<T>> {
  const { query, headers, skipAuth = false, ...init } = options;
  const url = buildUrl(path, query);
  const requestHeaders = buildHeaders(init.body != null, skipAuth, headers);

  const response = await fetch(url, { ...init, headers: requestHeaders });
  const text = await response.text();
  const envelope = parseEnvelope<T>(text);

  if (response.ok && envelope?.success) {
    return { ok: true, envelope };
  }

  return {
    ok: false,
    httpStatus: response.status,
    envelope: envelope && !envelope.success ? envelope : null,
  };
}

async function executeWithReissue<T>(path: string, options: RequestOptions): Promise<RequestResult<T>> {
  let result = await executeRequest<T>(path, options);

  if (!result.ok && result.httpStatus === 401 && !options.skipAuth) {
    const newAccessToken = await reissueAccessToken();
    if (newAccessToken) {
      result = await executeRequest<T>(path, options);
    } else {
      tokenStorage.clear();
    }
  }

  return result;
}

function throwApiError(result: Extract<RequestResult<unknown>, { ok: false }>): never {
  const code = result.envelope?.error.code ?? 'UNKNOWN_ERROR';
  const message = result.envelope?.error.message ?? `API request failed: ${result.httpStatus}`;
  const details = result.envelope?.error.details;
  throw new ApiError(message, code, result.httpStatus, details, result.envelope);
}

/** 표준 호출. envelope.data만 unwrap해서 반환 (status 무시). */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const result = await executeWithReissue<T>(path, options);
  if (result.ok) return result.envelope.data;
  throwApiError(result);
}

/**
 * envelope.status가 분기 신호인 엔드포인트용 (예: POST /reports — READY vs PROCESSING).
 * 호출 측이 envelope 전체 모양을 generic 인자로 정의:
 *   type CreateReportEnvelope =
 *     | { status: 'READY'; data: ReportReadyData }
 *     | { status: 'PROCESSING'; data: ReportProcessingData };
 *   const env = await apiRequestEnvelope<CreateReportEnvelope>(path, ...);
 */
export async function apiRequestEnvelope<TEnvelope extends { status: string; data: unknown }>(
  path: string,
  options: RequestOptions = {},
): Promise<TEnvelope> {
  const result = await executeWithReissue<TEnvelope['data']>(path, options);
  if (!result.ok) throwApiError(result);
  return {
    status: result.envelope.status,
    data: result.envelope.data,
  } as TEnvelope;
}
