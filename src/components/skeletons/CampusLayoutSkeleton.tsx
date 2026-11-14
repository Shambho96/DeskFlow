import React from 'react';
import { Skeleton } from './Skeleton';

/**
 * Campus & Rooms Page Layout Skeleton
 */
export const CampusLayoutSkeleton: React.FC = () => {
  return (
    <div className="space-y-6" aria-busy="true">
      {/* Top Campus Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div
            key={i}
            className="p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 space-y-2 shadow-xs"
          >
            <Skeleton className="h-3 w-16 rounded" />
            <Skeleton className="h-6 w-12 rounded-md" />
          </div>
        ))}
      </div>

      {/* Buildings and Floors Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map(bIdx => (
          <div
            key={bIdx}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-4 shadow-xs"
          >
            {/* Building Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-28 rounded" />
                  <Skeleton className="h-3 w-20 rounded" />
                </div>
              </div>
              <Skeleton className="w-6 h-6 rounded" />
            </div>

            {/* Floor Accordion Rows */}
            <div className="space-y-2">
              {[1, 2, 3].map(fIdx => (
                <div
                  key={fIdx}
                  className="p-3 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <Skeleton className="h-3.5 w-24 rounded" />
                    <Skeleton className="h-2.5 w-16 rounded" />
                  </div>
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

