const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

/**
 * Custom Fetch wrapper with credentials: 'include' for HttpOnly JWT cookie support.
 */
export async function customFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail || errorData.message || `Request failed with status ${response.status}`;
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
