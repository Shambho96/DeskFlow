import React from 'react';
import { Skeleton } from './Skeleton';
import { Card, CardContent, CardHeader } from '../ui/Card';

/**
 * 1. Guest Directory List Skeleton (Left-hand Split Panel)
 */
export const GuestListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="space-y-2 p-1" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-3 rounded-xl border border-[var(--border)] bg-[var(--card)]/50 flex items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <Skeleton className="h-4 w-32 max-w-[80%]" />
              <Skeleton className="h-3 w-24 max-w-[60%]" />
            </div>
          </div>
          <Skeleton className="w-4 h-4 rounded-sm shrink-0" />
        </div>
      ))}
    </div>
  );
};

/**
 * 2. Guest Detail View Skeleton (Right-hand Split Master-Detail Panel)
 */
export const GuestDetailSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200" aria-busy="true">
      {/* Top Banner Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <Skeleton className="h-7 w-48 rounded-lg" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Skeleton className="h-3.5 w-32 rounded-md" />
              <Skeleton className="h-3.5 w-40 rounded-md" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
      </div>

      {/* 4 KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 space-y-2"
          >
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-6 w-28 rounded-md" />
            <Skeleton className="h-4 w-36 rounded-md" />
          </div>
        ))}
      </div>

      {/* KYC Document Card */}
      <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-36 rounded" />
            <Skeleton className="h-3 w-48 rounded" />
          </div>
        </div>
        <Skeleton className="h-7 w-28 rounded-full shrink-0" />
      </div>

      {/* Stay History List Skeleton */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-44 rounded-md" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>

        <div className="space-y-2.5">
          {[1, 2].map(i => (
            <div
              key={i}
              className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)]/50 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-4 w-28 rounded" />
                </div>
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--border)]">
                <Skeleton className="h-3.5 w-48 rounded" />
                <Skeleton className="h-4 w-28 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * 3. Guest Grid Cards Skeleton
 */
export const GuestGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={i}
          className="border-[var(--border)] bg-[var(--card)]/60 rounded-2xl shadow-xs flex flex-col justify-between"
        >
          <div>
            <CardHeader className="p-4 border-b border-[var(--border)] flex flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-3 w-24 rounded" />
                </div>
              </div>
              <Skeleton className="h-6 w-20 rounded-full shrink-0" />
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[var(--muted)]/40">
                <div className="space-y-1">
                  <Skeleton className="h-2.5 w-12 rounded" />
                  <Skeleton className="h-4 w-16 rounded" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-2.5 w-14 rounded" />
                  <Skeleton className="h-4 w-20 rounded" />
                </div>
              </div>
              <Skeleton className="h-3.5 w-full rounded" />
            </CardContent>
          </div>

          <div className="p-4 pt-0 flex items-center justify-between gap-2 border-t border-[var(--border)] mt-2">
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        </Card>
      ))}
    </div>
  );
};

/**
 * 4. Guest Table Rows Skeleton
 */
export const GuestTableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <tbody className="divide-y divide-[var(--border)]" aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="animate-in fade-in duration-150">
          {/* Guest Profile */}
          <td className="py-3 px-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-full shrink-0" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-2.5 w-20 rounded" />
              </div>
            </div>
          </td>

          {/* Contact Details */}
          <td className="py-3 px-4">
            <div className="space-y-1">
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="h-2.5 w-32 rounded" />
            </div>
          </td>

          {/* Tier */}
          <td className="py-3 px-4 text-center">
            <Skeleton className="h-6 w-20 rounded-full mx-auto" />
          </td>

          {/* KYC Document */}
          <td className="py-3 px-4 text-center">
            <Skeleton className="h-6 w-24 rounded-full mx-auto" />
          </td>

          {/* Lifetime Spend */}
          <td className="py-3 px-4 text-right">
            <Skeleton className="h-4 w-20 rounded ml-auto" />
          </td>

          {/* Total Stays */}
          <td className="py-3 px-4 text-center">
            <Skeleton className="h-4 w-8 rounded mx-auto" />
          </td>

          {/* Actions */}
          <td className="py-3 px-4 text-right">
            <div className="flex items-center justify-end gap-1.5">
              <Skeleton className="h-7 w-16 rounded-lg" />
              <Skeleton className="h-7 w-16 rounded-lg" />
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  );
};

