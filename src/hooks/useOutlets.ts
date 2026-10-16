import useSWR from 'swr';
import { fetcher } from '../lib/api';

export interface OutletInfo {
  id: number;
  name: string;
  city: string;
}

/**
 * Fetches real outlet details (id, name, city) for all outlets the
 * current user has access to.  Only fires when a user session exists.
 */
export function useOutlets(enabled = true) {
  const { data, error, isLoading } = useSWR<OutletInfo[]>(
    enabled ? '/api/v1/auth/outlets' : null,
    fetcher,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
      dedupingInterval: 60_000, // outlets rarely change mid-session
    }
  );

  return {
    outlets: data ?? [],
    isLoading,
    error,
  };
}

/** Returns the display label for a single outlet: "Name — City" */
export function outletLabel(o: OutletInfo): string {
  return `${o.name} — ${o.city}`;
}
