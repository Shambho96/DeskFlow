const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

// ─── CENTRAL TOKEN REFRESH COORDINATOR (RACE-CONDITION RESISTANT) ────────────

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;
let lastSuccessfulRefreshTime = 0;
const REFRESH_GRACE_PERIOD_MS = 3500; // 3.5s cooldown window to absorb in-flight race requests

// Queue of subscribers waiting for the in-progress refresh to settle
let refreshSubscribers: Array<(success: boolean) => void> = [];

function notifySubscribers(success: boolean) {
  refreshSubscribers.forEach(callback => {
    try {
      callback(success);
    } catch {
      // Ignore subscriber errors
    }
  });
  refreshSubscribers = [];
}

/**
 * Attempts to silently refresh the access token.
 * Features:
 *  1. Single-Flight Deduplication: All parallel 401s latch onto the same active refresh promise.
 *  2. Subscriber Queue: Any concurrent requests are queued and notified together.
 *  3. Grace Period: If a refresh succeeded in the last 3.5 seconds, immediately returns true
 *     so in-flight requests that were dispatched before cookies updated can retry cleanly.
 */
export async function tryRefreshToken(): Promise<boolean> {
  const now = Date.now();

  // If a refresh succeeded within the grace period, cookies are already fresh!
  if (now - lastSuccessfulRefreshTime < REFRESH_GRACE_PERIOD_MS) {
    return true;
  }

  // If already refreshing, wait on the active promise
  if (isRefreshing && refreshPromise) {
    return new Promise<boolean>(resolve => {
      refreshSubscribers.push(resolve);
    });
  }

  isRefreshing = true;

  refreshPromise = (async () => {
    try {
      const url = `${BASE_URL}/api/v1/auth/refresh`;
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        lastSuccessfulRefreshTime = Date.now();
        notifySubscribers(true);
        return true;
      }

      notifySubscribers(false);
      return false;
    } catch {
      notifySubscribers(false);
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Custom Fetch wrapper with credentials: 'include' for HttpOnly JWT cookie support.
 * Automatically catches 401 Unauthorized responses and attempts a seamless, silent refresh.
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

  // Intercept 401 Unauthorized: Trigger silent token refresh
  if (
    response.status === 401 &&
    !isRetry &&
    !endpoint.includes('/auth/login') &&
    !endpoint.includes('/auth/refresh')
  ) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      // Replay the exact original request with the renewed access_token cookie
      return customFetch<T>(endpoint, options, true);
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail || errorData.message || `Request failed with status ${response.status}`;

    // Account deactivated guard: emit global event for clean redirect without hard page reloads
    const isDeactivated = response.status === 403 && String(message).toLowerCase().includes('deactivat');
    const isPermanentAuthFail = response.status === 401 && isRetry;

    if (
      !endpoint.includes('/auth/login') &&
      !endpoint.includes('/auth/refresh') &&
      (isDeactivated || isPermanentAuthFail)
    ) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:session-expired', { detail: { message } }));
      }
    }

    throw new Error(message);
  }

  // Handle empty or JSON responses
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
