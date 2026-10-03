import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-[var(--primary)] text-[var(--primary-foreground)]',
        secondary: 'bg-[var(--secondary)] text-[var(--secondary-foreground)]',
        destructive: 'bg-[var(--destructive)] text-[var(--destructive-foreground)]',
        outline: 'text-[var(--foreground)] border border-[var(--border)]',
        clean: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
        dirty: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20',
        progress: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20',
        ooo: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
