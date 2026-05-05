import type { AuthTokenResponse } from '../../types/domain';
import { tokenStorage } from './tokenStorage';

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN ?? '';
const REISSUE_PATH = '/api/v1/auth/reissue';

interface ApiSuccess<T> {
  success: true;
  data: T;
  error: null;
}

interface ApiFailure {
  success: false;
  data: null;
  error: {
    code: string;
    message: string;
  };
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
    public readonly payload?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface RequestOptions extends RequestInit {
  query?: Record<string, string | number | boolean | undefined>;
  skipAuth?: boolean;
}

function buildUrl(path: string, query?: RequestOptions['query']): URL {
  const url = new URL(path, API_ORIGIN || window.location.origin);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
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
  | { ok: true; data: T }
  | { ok: false; status: number; envelope: ApiFailure | null };

async function executeRequest<T>(path: string, options: RequestOptions): Promise<RequestResult<T>> {
  const { query, headers, skipAuth = false, ...init } = options;
  const url = buildUrl(path, query);
  const requestHeaders = buildHeaders(init.body != null, skipAuth, headers);

  const response = await fetch(url, { ...init, headers: requestHeaders });
  const text = await response.text();
  const envelope = parseEnvelope<T>(text);

  if (response.ok && envelope?.success) {
    return { ok: true, data: envelope.data };
  }

  return {
    ok: false,
    status: response.status,
    envelope: envelope && !envelope.success ? envelope : null,
  };
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let result = await executeRequest<T>(path, options);

  if (!result.ok && result.status === 401 && !options.skipAuth) {
    const newAccessToken = await reissueAccessToken();
    if (newAccessToken) {
      result = await executeRequest<T>(path, options);
    } else {
      tokenStorage.clear();
    }
  }

  if (result.ok) return result.data;

  const code = result.envelope?.error.code ?? 'UNKNOWN_ERROR';
  const message = result.envelope?.error.message ?? `API request failed: ${result.status}`;
  throw new ApiError(message, code, result.status, result.envelope);
}
