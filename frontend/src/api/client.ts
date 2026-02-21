const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  code?: string;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  const json = (await res.json().catch(() => ({}))) as ApiResponse<T>;

  if (!res.ok) {
    const message = json.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return json;
}

export const api = {
  get<T>(path: string) {
    return request<T>(path, { method: 'GET' });
  },

  post<T>(path: string, body?: object) {
    return request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  patch<T>(path: string, body?: object) {
    return request<T>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  },
};
