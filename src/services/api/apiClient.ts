import { authStorage } from '../authStorage';

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN ?? '';
const REISSUE_PATH = '/api/v1/auth/reissue';

let reissueRequest: Promise<string | null> | null = null;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload?: unknown,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends RequestInit {
  token?: string;
  skipAuth?: boolean;
  query?: Record<string, string | number | boolean | undefined>;
}

export async function apiRequest<TResponse>(path: string, options: RequestOptions = {}): Promise<TResponse> {
  return sendApiRequest<TResponse>(path, options, false, true);
}

export async function apiRequestEnvelope<TEnvelope>(
  path: string,
  options: RequestOptions = {},
): Promise<TEnvelope> {
  return sendApiRequest<TEnvelope>(path, options, false, false);
}

async function sendApiRequest<TResponse>(
  path: string,
  options: RequestOptions,
  hasRetried = false,
  unwrap = true,
): Promise<TResponse> {
  const { token, skipAuth = false, query, headers, body, ...init } = options;
  const url = new URL(path, API_ORIGIN || window.location.origin);
  const authToken = token ?? (skipAuth ? undefined : authStorage.getAccessToken() ?? undefined);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const response = await fetch(url, {
    ...init,
    body,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
  });

  const text = await response.text();
  const payload = parseResponseBody(text);

  if (!response.ok) {
    if (response.status === 401 && !skipAuth && !hasRetried) {
      const refreshedToken = await reissueAccessToken();

      if (refreshedToken) {
        return sendApiRequest<TResponse>(path, { ...options, token: refreshedToken }, true, unwrap);
      }
    }

    const errorInfo = extractErrorInfo(payload);
    throw new ApiError(
      errorInfo.message ?? `API request failed: ${response.status}`,
      response.status,
      payload,
      errorInfo.code,
    );
  }

  if (!unwrap) {
    return payload as TResponse;
  }

  return unwrapApiPayload(payload) as TResponse;
}

function extractErrorInfo(payload: unknown): { code?: string; message?: string } {
  if (!payload || typeof payload !== 'object') {
    return {};
  }

  const root = payload as Record<string, unknown>;
  const error = (payload as { error?: unknown }).error;
  const errorRecord = error && typeof error === 'object' ? (error as Record<string, unknown>) : undefined;

  const code = root.code ?? errorRecord?.code;
  const message = root.message ?? errorRecord?.message;

  return {
    code: typeof code === 'string' ? code : undefined,
    message: typeof message === 'string' ? message : undefined,
  };
}

async function reissueAccessToken() {
  const refreshToken = authStorage.getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  reissueRequest ??= requestReissue(refreshToken).finally(() => {
    reissueRequest = null;
  });

  return reissueRequest;
}

async function requestReissue(refreshToken: string) {
  const url = new URL(REISSUE_PATH, API_ORIGIN || window.location.origin);
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const payload = parseResponseBody(await response.text());

  if (!response.ok) {
    authStorage.clear();
    return null;
  }

  const tokens = unwrapApiPayload(payload) as Record<string, unknown> | undefined;
  const accessToken = stringValue(tokens?.accessToken ?? tokens?.access_token);
  const nextRefreshToken = stringValue(tokens?.refreshToken ?? tokens?.refresh_token) ?? refreshToken;

  if (!accessToken) {
    authStorage.clear();
    return null;
  }

  authStorage.saveTokens({
    accessToken,
    refreshToken: nextRefreshToken,
  });

  return accessToken;
}

function parseResponseBody(text: string) {
  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function unwrapApiPayload(payload: unknown) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return payload;
  }

  const record = payload as Record<string, unknown>;

  if ('data' in record) {
    return record.data;
  }

  if ('result' in record) {
    return record.result;
  }

  if ('response' in record) {
    return record.response;
  }

  return payload;
}

function stringValue(value: unknown) {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}
