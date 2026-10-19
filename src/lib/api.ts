const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

let refreshPromise: Promise<boolean> | null = null;

/**
 * Attempts to silently refresh the access token using the HttpOnly refresh_token cookie.
 * Ensures only one refresh request is active at any given time.
 */
async function tryRefreshToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const url = `${BASE_URL}/api/v1/auth/refresh`;
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Custom Fetch wrapper with credentials: 'include' for HttpOnly JWT cookie support.
 * Automatically catches 401 Unauthorized responses and attempts a silent session refresh.
 */
export async function customFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
  isRetry: boolean = false
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Automatically sends and receives HttpOnly cookies
    headers,
  });

  // Catch expired access token and attempt silent refresh
  if (
    response.status === 401 &&
    !isRetry &&
    !endpoint.includes('/auth/login') &&
    !endpoint.includes('/auth/refresh')
  ) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      // Replay the original request with the fresh access_token cookie
      return customFetch<T>(endpoint, options, true);
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail || errorData.message || `Request failed with status ${response.status}`;

    // Auto-redirect to /login if session invalidated or account deactivated while in app
    if (
      !endpoint.includes('/auth/login') &&
      !endpoint.includes('/auth/refresh') &&
      (response.status === 401 || (response.status === 403 && String(message).toLowerCase().includes('deactivat')))
    ) {
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/app')) {
        window.location.href = '/login';
      }
    }

    throw new Error(message);
  }

  // Handle empty responses (like 204 or empty bodies)
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  return response.text() as unknown as T;
}

/**
 * Standard SWR fetcher function.
 */
export const fetcher = <T = any>(url: string): Promise<T> => customFetch<T>(url);
