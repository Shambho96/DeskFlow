import { useEffect } from 'react';
import useSWR from 'swr';
import { customFetch, fetcher } from '../lib/api';

export interface UserContext {
  id: string | number;
  name: string;
  email: string;
  role: 'OWNER' | 'MANAGER' | 'STAFF' | string;
  client_id: string | number;
  active_outlet_id: string | number;
  allowed_outlets: (string | number)[];
}

export interface AuthResponse {
  status: string;
  message: string;
  access_token?: string;
  user: UserContext;
}

export interface OutletSwitchState {
  isSwitching: boolean;
  targetOutletId: number | null;
  targetOutletName?: string;
}

const OUTLET_SWITCH_KEY = 'app:outlet-switching-state';

export function useUser() {
  const {
    data: user,
    error,
    mutate,
    isLoading,
    isValidating,
  } = useSWR<UserContext>('/api/v1/auth/me', fetcher, {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    dedupingInterval: 300_000, // 5 min dedupe interval
    keepPreviousData: true,    // Retain user state during silent background revalidations
  });

  // Global outlet switching state shared across all components via SWR cache
  const { data: switchState, mutate: setSwitchState } = useSWR<OutletSwitchState>(
    OUTLET_SWITCH_KEY,
    null,
    { fallbackData: { isSwitching: false, targetOutletId: null } }
  );

  // Listen for global auth session expiry events
  useEffect(() => {
    const handleSessionExpired = () => {
      mutate(null as any, false);
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, [mutate]);

  // loggedOut is only true when there is NO user in memory and an error occurred
  const loggedOut = Boolean(error) && !user;

  // loading is only true on initial cold boot when there is no user cached yet
  const loading = isLoading && !user;

  /**
   * 1. Login with email and password (POST /api/v1/auth/login)
   */
  async function login(email: string, password: string, selected_outlet_id?: string | number) {
    const numericId = selected_outlet_id !== undefined ? Number(selected_outlet_id) : undefined;
    const outletId = numericId !== undefined && !Number.isNaN(numericId) ? numericId : selected_outlet_id;

    const res = await customFetch<AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        ...(outletId !== undefined ? { selected_outlet_id: outletId } : {}),
      }),
    });

    // Instantly populate SWR cache with the authenticated user context
    await mutate(res.user, false);
    return res;
  }

  /**
   * 2. Log out and wipe SWR cache (POST /api/v1/auth/logout)
   */
  async function logout() {
    try {
      await customFetch('/api/v1/auth/logout', { method: 'POST' });
    } finally {
      // Clear SWR cache and set to null
      await mutate(null as any, false);
    }
  }

  /**
   * 3. Switch active hotel outlet (POST /api/v1/auth/switch-outlet)
   */
  async function switchOutlet(target_outlet_id: string | number, targetOutletName?: string) {
    const numericId = Number(target_outlet_id);
    const targetId = !Number.isNaN(numericId) ? numericId : target_outlet_id;

    // Immediately trigger the full-screen frosted blur overlay
    await setSwitchState({
      isSwitching: true,
      targetOutletId: Number(targetId),
      targetOutletName,
    }, false);

    try {
      const res = await customFetch<AuthResponse>('/api/v1/auth/switch-outlet', {
        method: 'POST',
        body: JSON.stringify({ target_outlet_id: targetId }),
      });

      // Update active user context with new active_outlet_id
      await mutate(res.user, false);

      // Brief smooth settling window so the user experiences a cohesive transition
      await new Promise(resolve => setTimeout(resolve, 400));
      return res;
    } finally {
      await setSwitchState({ isSwitching: false, targetOutletId: null }, false);
    }
  }

  return {
    user: user || null,
    loading,
    isValidating,
    loggedOut,
    error,
    isSwitchingOutlet: switchState?.isSwitching ?? false,
    targetOutletName: switchState?.targetOutletName,
    login,
    logout,
    switchOutlet,
    mutate,
  };
}
