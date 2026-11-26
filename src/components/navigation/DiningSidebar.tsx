import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  UtensilsCrossed,
  ChefHat,
  LayoutGrid,
  BookOpen,
  Store,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { usePos } from '../../hooks/usePos';

interface DiningNavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  end?: boolean;
  description: string;
}

const DINING_NAV_ITEMS: DiningNavItem[] = [
  {
    to: '/app/pos',
    label: 'Point of Sale',
    icon: UtensilsCrossed,
    end: true,
    description: 'Billing & Live Orders',
  },
  {
    to: '/app/kds',
    label: 'KOT & Kitchen (KDS)',
    icon: ChefHat,
    description: 'Live Kitchen Order Tickets',
  },
  {
    to: '/app/pos/tables',
    label: 'Tables & Floors',
    icon: LayoutGrid,
    description: 'Table Layout & Occupancy',
  },
  {
    to: '/app/pos/menu',
    label: 'Menu & Pricing',
    icon: BookOpen,
    description: 'Catalog & Categories',
  },
];

export const DiningSidebar: React.FC = () => {
  const { kots, orders } = usePos();

  // Count active KOTs in kitchen
  const activeKotsCount = kots.filter(
    k => k.status === 'NEW' || k.status === 'IN_PROGRESS' || k.status === 'READY'
  ).length;

  const activeOrdersCount = orders.filter(
    o => o.status === 'PREPARING' || o.status === 'READY'
  ).length;

  return (
    <aside className="w-56 sm:w-60 shrink-0 bg-[var(--card)] border-r border-[var(--border)] flex flex-col justify-between select-none h-full min-h-[calc(100vh-3.5rem)] transition-colors">
      {/* ─── TOP SECTION: MODULE HEADER & NAV ITEMS ────────────────────────────── */}
      <div className="p-3 sm:p-4 space-y-4">
        {/* Module Context Title */}
        <div className="px-2 pt-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[var(--foreground)] tracking-tight">
                Dining &amp; Kitchen
              </h2>
              <p className="text-[10px] text-[var(--muted-foreground)]">
                F&amp;B Operations
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--border)]/60 mx-1" />

        {/* Sub-Views Navigation Links */}
        <nav className="space-y-1">
          <span className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider block px-2.5 mb-1.5">
            Dining Views
          </span>
          {DINING_NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isKds = item.to === '/app/kds';

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150',
                    isActive
                      ? 'bg-[var(--foreground)] text-[var(--background)] shadow-xs font-bold'
                      : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/60'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={cn(
                          'w-4 h-4 shrink-0 transition-colors',
                          isActive
                            ? 'text-[var(--background)]'
                            : 'text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]'
                        )}
                      />
                      <div className="truncate text-left leading-tight">
                        <span className="block truncate text-xs">{item.label}</span>
                      </div>
                    </div>

                    {/* Active KDS Badge count or subtle arrow */}
                    {isKds && activeKotsCount > 0 ? (
                      <span
                        className={cn(
                          'px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0',
                          isActive
                            ? 'bg-amber-400 text-neutral-950'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        )}
                      >
                        {activeKotsCount}
                      </span>
                    ) : (
                      <ChevronRight
                        className={cn(
                          'w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity shrink-0',
                          isActive && 'opacity-60 text-[var(--background)]'
                        )}
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* ─── BOTTOM SECTION: LIVE POS TERMINAL STATUS WIDGET ───────────────────── */}
      <div className="p-3 sm:p-4 border-t border-[var(--border)]/60">
        <div className="p-2.5 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)]/50 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
              Terminal
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          </div>
          <div className="flex items-center justify-between font-mono text-[11px] pt-1 border-t border-[var(--border)]/30">
            <span className="text-[var(--muted-foreground)] text-[10px]">Kitchen KOTs:</span>
            <span className="font-bold text-[var(--foreground)]">{activeOrdersCount} active</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

