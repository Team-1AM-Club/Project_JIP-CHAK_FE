const API_ORIGIN = import.meta.env.VITE_API_ORIGIN ?? '';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends RequestInit {
  token?: string;
  query?: Record<string, string | number | boolean | undefined>;
}

export async function apiRequest<TResponse>(path: string, options: RequestOptions = {}): Promise<TResponse> {
  const { token, query, headers, body, ...init } = options;
  const url = new URL(path, API_ORIGIN || window.location.origin);

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
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const text = await response.text();
  const payload = parseResponseBody(text);

  if (!response.ok) {
    throw new ApiError(`API request failed: ${response.status}`, response.status, payload);
  }

  return unwrapApiPayload(payload) as TResponse;
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
