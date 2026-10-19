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

/** Returns the display label for a single outlet: "Name — City" */
export function outletLabel(o: OutletInfo): string {
  return `${o.name} — ${o.city}`;
}
