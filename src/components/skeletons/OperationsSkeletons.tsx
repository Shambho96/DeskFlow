import React from 'react';
import { Skeleton } from './Skeleton';

/**
 * 1. Room Operations Board Skeleton
 */
export const RoomBoardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6" aria-busy="true">
      {/* Sub-bar: Status Filter Pills Skeleton */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)]">
          <Skeleton className="h-7 w-24 rounded-lg" />
          <Skeleton className="h-7 w-28 rounded-lg" />
          <Skeleton className="h-7 w-32 rounded-lg" />
          <Skeleton className="h-7 w-24 rounded-lg" />
        </div>
        <Skeleton className="h-4 w-36 rounded" />
      </div>

      {/* Floor Sections with Room Card Grids */}
      {[1, 2].map(floorIdx => (
        <div
          key={floorIdx}
          className="border border-[var(--border)] rounded-2xl bg-[var(--card)]/40 p-4 space-y-4"
        >
          {/* Floor Header */}
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-6 h-6 rounded-lg" />
              <Skeleton className="h-5 w-32 rounded-md" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="w-5 h-5 rounded" />
          </div>

          {/* Room Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, roomIdx) => (
              <div
                key={roomIdx}
                className="p-3 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-2.5 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-12 rounded-md" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-20 rounded" />
                <div className="pt-2 border-t border-[var(--border)] space-y-1.5">
                  <Skeleton className="h-3 w-full rounded" />
                  <Skeleton className="h-7 w-full rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * 2. Front Desk Kanban Board Skeleton (4 Columns)
 */
export const KanbanBoardSkeleton: React.FC = () => {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      aria-busy="true"
    >
      {[
        'Arrivals Expected',
        'In-House Guests',
        'Departures Pending',
        'Settled & Checked Out'
      ].map((colName, colIdx) => (
        <div
          key={colIdx}
          className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/50 p-3.5 flex flex-col space-y-3 min-h-[480px]"
        >
          {/* Column Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Skeleton className="w-2.5 h-2.5 rounded-full" />
              <span className="text-xs font-bold text-[var(--muted-foreground)]">
                {colName}
              </span>
            </div>
            <Skeleton className="h-5 w-6 rounded-full" />
          </div>

          {/* Cards inside Column */}
          <div className="space-y-2.5 flex-1">
            {[1, 2, 3].map(cardIdx => (
              <div
                key={cardIdx}
                className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-2.5 shadow-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <Skeleton className="h-4 w-28 rounded" />
                  <Skeleton className="h-4 w-12 rounded-md" />
                </div>
                <Skeleton className="h-3 w-36 rounded" />
                <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                  <Skeleton className="h-3 w-16 rounded" />
                  <Skeleton className="h-6 w-16 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * 3. 7-Day Tape Chart Skeleton
 */
export const TapeChartSkeleton: React.FC = () => {
  return (
    <div
      className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden space-y-0"
      aria-busy="true"
    >
      {/* Top Controls Bar */}
      <div className="p-3.5 border-b border-[var(--border)] flex items-center justify-between flex-wrap gap-3 bg-[var(--card)]">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <Skeleton className="h-4 w-44 rounded" />
      </div>

      {/* Grid Headers: 7 Day Columns */}
      <div className="grid grid-cols-8 border-b border-[var(--border)] bg-[var(--muted)]/40 p-2.5">
        <Skeleton className="h-4 w-20 rounded" />
        {Array.from({ length: 7 }).map((_, d) => (
          <div key={d} className="flex flex-col items-center gap-1">
            <Skeleton className="h-3 w-8 rounded" />
            <Skeleton className="h-4 w-12 rounded" />
          </div>
        ))}
      </div>

      {/* Room Timeline Rows */}
      <div className="divide-y divide-[var(--border)]">
        {Array.from({ length: 6 }).map((_, r) => (
          <div key={r} className="grid grid-cols-8 items-center h-16 p-2 bg-[var(--card)]">
            <div className="space-y-1">
              <Skeleton className="h-4 w-12 rounded" />
              <Skeleton className="h-2.5 w-16 rounded" />
            </div>
            <div className="col-span-7 h-full flex items-center px-1">
              {r % 2 === 0 ? (
                <Skeleton className="h-10 w-3/5 rounded-xl" />
              ) : (
                <Skeleton className="h-10 w-4/5 rounded-xl" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * 4. Housekeeping Hub Skeleton
 */
export const HousekeepingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6" aria-busy="true">
      {/* 4 Status KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] flex items-center justify-between shadow-xs"
          >
            <div className="space-y-2">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-8 w-12 rounded-md" />
            </div>
            <Skeleton className="w-10 h-10 rounded-xl" />
          </div>
        ))}
      </div>

      {/* Filter and Task Table */}
      <div className="border border-[var(--border)] rounded-2xl bg-[var(--card)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <Skeleton className="h-5 w-36 rounded" />
          <Skeleton className="h-8 w-32 rounded-xl" />
        </div>

        <div className="divide-y divide-[var(--border)] p-2">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="p-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-14 rounded-md" />
                <Skeleton className="h-4 w-28 rounded" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

