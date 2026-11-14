import useSWR from 'swr';
import { graphqlRequest } from '../lib/graphql';
import { useUser } from './useUser';
import type { DashboardAnalyticsPayload } from '../types/analytics';

export const GET_DASHBOARD_ANALYTICS = `
  query GetDashboardAnalytics($targetDate: String, $trendDays: Int, $outletId: Int) {
    dashboardAnalytics(targetDate: $targetDate, trendDays: $trendDays, outletId: $outletId) {
      targetDate
      outletId
      outletName
      kpis {
        occupancyPercentage
        occupiedRooms
        totalRooms
        salableRooms
        arrivalsExpected
        arrivalsCheckedIn
        arrivalsPending
        departuresDue
        departuresSettled
        departuresPending
        dailyRoomRevenue
        adr
        revpar
        trevpar
        alos
      }
      weeklyTrend {
        day
        date
        revenue
        occupancy
        adr
      }
      channelMix {
        name
        sourceKey
        count
        percentage
        revenue
        color
      }
      totalActiveBookings
      housekeeping {
        cleanCount
        cleaningCount
        dirtyCount
        oooCount
        rooms {
          roomId
          roomNumber
          categoryName
          status
        }
      }
      categoryPerformance {
        categoryId
        category
        occupancy
        adr
        totalRooms
        occupied
      }
      vipArrivals {
        reservationId
        reservationCode
        guestName
        phone
        roomNumber
        categoryName
        eta
        status
        vipStatus
        specialRequests
        folioId
      }
    }
  }
`;

interface UseDashboardAnalyticsOptions {
  targetDate?: string;
  trendDays?: number;
  outletId?: number;
}

export function useDashboardAnalytics(options: UseDashboardAnalyticsOptions = {}) {
  const { user } = useUser();
  const effectiveOutletId = options.outletId ?? (user?.active_outlet_id ? Number(user.active_outlet_id) : undefined);
  const targetDate = options.targetDate;
  const trendDays = options.trendDays ?? 7;

  const swrKey = effectiveOutletId
    ? ['dashboard-analytics', effectiveOutletId, targetDate || 'today', trendDays]
    : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ dashboardAnalytics: DashboardAnalyticsPayload }>(
    swrKey,
    () =>
      graphqlRequest<{ dashboardAnalytics: DashboardAnalyticsPayload }>(GET_DASHBOARD_ANALYTICS, {
        targetDate,
        trendDays,
        outletId: effectiveOutletId,
      }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5_000,
    }
  );

  // Strict multi-outlet integrity: ensure loaded data belongs to effectiveOutletId
  const isOutletMatch = Boolean(
    effectiveOutletId && data?.dashboardAnalytics?.outletId === effectiveOutletId
  );

  const activeAnalytics = isOutletMatch ? data?.dashboardAnalytics : undefined;
  const isPending = !effectiveOutletId || isLoading || !isOutletMatch;

  return {
    analytics: activeAnalytics,
    isLoading: isPending,
    isValidating,
    error,
    refreshAnalytics: () => mutate(),
  };
}

