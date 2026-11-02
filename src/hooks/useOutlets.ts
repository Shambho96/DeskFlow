import useSWR from 'swr';
import { fetcher } from '../lib/api';

export interface OutletInfo {
  id: number;
  name: string;
  city: string;
}

/**
 * Fetches real outlet details (id, name, city) for all outlets the
 * current user has access to. Caches result across page navigation so it only calls once.
 */
export function useOutlets(enabled = true) {
  const { data, error, isLoading, mutate } = useSWR<OutletInfo[]>(
    enabled ? '/api/v1/auth/outlets' : null,
    fetcher,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300_000, // 5 min dedupe & cache
    }
  );

  return {
    outlets: data ?? [],
    isLoading,
    error,
    refetch: mutate,
  };
}

/** Returns the display label for a single outlet, avoiding duplicate city/name repetition */
export function outletLabel(o: OutletInfo): string {
  if (!o.name) return '';
  if (!o.city || !o.city.trim()) {
    return o.name;
  }
  const cleanCity = o.city.trim();
  const lowerName = o.name.toLowerCase();
  const lowerCity = cleanCity.toLowerCase();

  // If the outlet name already contains the city, avoid repeating it:
  // e.g. "Taj - Kolhapur" with city "Kolhapur" -> "Taj - Kolhapur"
  if (lowerName.includes(lowerCity)) {
    return o.name;
  }
  return `${o.name} — ${cleanCity}`;
}
