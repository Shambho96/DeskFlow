import React from 'react';
import { cn } from '../../lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Primitive Skeleton component with fluid animated pulse styling.
 * Uses theme-aware design tokens matching the DeskFloow design system.
 */
export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse rounded-xl bg-[var(--muted)]/70 dark:bg-[var(--muted)]/40 select-none',
        className
      )}
      {...props}
    />
  );
};

