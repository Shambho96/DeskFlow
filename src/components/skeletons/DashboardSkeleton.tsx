import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Skeleton } from './Skeleton';

/**
 * 1. Top 4 Metric Cards Skeleton
 */
export const DashboardKPISkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-[var(--border)] bg-[var(--card)] shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
            <div className="mt-3 space-y-2">
              <Skeleton className="h-7 w-28 rounded-lg" />
              <Skeleton className="h-3.5 w-40 rounded-md" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

/**
 * 2. VIP & Noted Arrivals Alert Strip Skeleton
 */
export const DashboardAlertSkeleton: React.FC = () => {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-3.5 px-4 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-40 rounded-md" />
          <Skeleton className="h-3 w-64 max-w-full rounded-md" />
        </div>
      </div>
      <Skeleton className="h-5 w-28 rounded-full shrink-0 hidden sm:block" />
    </div>
  );
};

/**
 * 3. 7-Day Revenue & Occupancy Trend Chart Skeleton
 */
export const TrendChartSkeleton: React.FC = () => {
  return (
    <Card className="col-span-12 lg:col-span-8 shadow-xs hover:border-[var(--primary)]/40 transition-all">
      <CardHeader className="p-5 pb-3 border-b border-[var(--border)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-52 rounded-md" />
            <Skeleton className="h-3 w-60 rounded-md" />
          </div>
          <Skeleton className="h-8 w-56 rounded-xl self-start sm:self-auto" />
        </div>
        <div className="flex items-center gap-4 mt-3 pt-2 border-t border-[var(--border)]/50">
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-3 w-28 rounded" />
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-5 pt-4">
        <div className="h-56 sm:h-64 w-full flex items-end justify-between gap-3 sm:gap-6 px-4 pb-2">
          {[45, 65, 55, 80, 70, 90, 60].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <Skeleton
                className="w-full rounded-t-lg transition-all"
                style={{ height: `${h}%` }}
              />
              <Skeleton className="h-3 w-7 rounded" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * 4. Booking Channels Mix Donut Skeleton
 */
export const ChannelMixSkeleton: React.FC = () => {
  return (
    <Card className="col-span-12 lg:col-span-4 shadow-xs flex flex-col justify-between">
      <CardHeader className="p-5 pb-2 border-b border-[var(--border)]">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-36 rounded-md" />
          <Skeleton className="h-3 w-48 rounded-md" />
        </div>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        <div className="h-44 w-full flex items-center justify-center">
          <div className="relative flex items-center justify-center">
            <Skeleton className="w-36 h-36 rounded-full" />
            <div className="absolute w-24 h-24 rounded-full bg-[var(--card)]" />
          </div>
        </div>
        <div className="space-y-2 pt-2 border-t border-[var(--border)]">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="w-2.5 h-2.5 rounded-full" />
                <Skeleton className="h-3 w-28 rounded" />
              </div>
              <Skeleton className="h-3 w-10 rounded" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * 5. Live Housekeeping & Room Readiness Skeleton
 */
export const HousekeepingSkeleton: React.FC = () => {
  return (
    <Card className="col-span-12 lg:col-span-7 shadow-xs flex flex-col justify-between">
      <CardHeader className="p-5 pb-2 border-b border-[var(--border)]">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-48 rounded-md" />
          <Skeleton className="h-3 w-56 rounded-md" />
        </div>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        <div className="grid grid-cols-4 gap-2 text-center">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] space-y-1">
              <Skeleton className="h-6 w-8 mx-auto rounded-md" />
              <Skeleton className="h-2.5 w-12 mx-auto rounded" />
            </div>
          ))}
        </div>
        <div className="pt-2 border-t border-[var(--border)] space-y-2.5">
          <Skeleton className="h-3 w-36 rounded" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-24 rounded-lg" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * 6. Room Category Performance & ADR Skeleton
 */
export const CategoryPerformanceSkeleton: React.FC = () => {
  return (
    <Card className="col-span-12 lg:col-span-5 shadow-xs flex flex-col justify-between">
      <CardHeader className="p-5 pb-2 border-b border-[var(--border)]">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-44 rounded-md" />
          <Skeleton className="h-3 w-52 rounded-md" />
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="h-56 w-full flex flex-col justify-around py-2 space-y-4">
          {[75, 60, 85, 45].map((w, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <Skeleton className="h-3 w-28 rounded" />
                <Skeleton className="h-3 w-12 rounded" />
              </div>
              <Skeleton className="h-3.5 rounded-full" style={{ width: `${w}%` }} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * 7. Full Page Dashboard Skeleton
 */
export const DashboardPageSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-6 text-left" aria-busy="true">
      <DashboardKPISkeleton />
      <DashboardAlertSkeleton />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        <TrendChartSkeleton />
        <ChannelMixSkeleton />
        <HousekeepingSkeleton />
        <CategoryPerformanceSkeleton />
      </div>
    </div>
  );
};

