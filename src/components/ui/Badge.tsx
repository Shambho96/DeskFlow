import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-[var(--primary)] text-[var(--primary-foreground)]',
        secondary: 'bg-[var(--secondary)] text-[var(--secondary-foreground)] border border-[var(--border)]',
        destructive: 'bg-[var(--destructive)] text-[var(--destructive-foreground)]',
        outline: 'text-[var(--foreground)] border border-[var(--border)] bg-[var(--background)]',
        clean: 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20',
        dirty: 'bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]',
        progress: 'bg-[var(--secondary)] text-[var(--secondary-foreground)] border border-[var(--border)]',
        ooo: 'bg-[var(--destructive)]/10 text-[var(--destructive)] border border-[var(--destructive)]/20',
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
