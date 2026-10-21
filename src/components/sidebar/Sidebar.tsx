import React, { useState, useMemo, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import * as Popover from '@radix-ui/react-popover';
import {
  LayoutDashboard,
  CalendarDays,
  BedDouble,
  Users,
  Settings,
  ChevronsUpDown,
  Search,
  Check,
  LogOut,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useHotel } from '../../context/HotelContext';
import { useUser } from '../../hooks/useUser';
import { useOutlets, outletLabel } from '../../hooks/useOutlets';
import type { OutletInfo } from '../../hooks/useOutlets';

// ─── Outlet Initials ──────────────────────────────────────────────────────────

/** "Taj - Kolhapur" → "TK",  "Mumbai" → "MU" */
function initials(outlet: OutletInfo): string {
  const words = `${outlet.name} ${outlet.city}`
    .trim()
    .split(/\s+/)
    .filter(w => /[a-zA-Z]/.test(w)); // skip "-", "–", etc.
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return outlet.name.slice(0, 2).toUpperCase();
}


// ─── NavItem ──────────────────────────────────────────────────────────────────
interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isCollapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, isCollapsed }) => (
  <NavLink
    to={to}
    title={isCollapsed ? label : undefined}
    className={({ isActive }) =>
      cn(
        'flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150 select-none',
        isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2',
        isActive
          ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm'
          : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-accent)]'
      )
    }
  >
    {({ isActive }) => (
      <>
        <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-[var(--primary-foreground)]' : '')} />
        {!isCollapsed && <span className="truncate">{label}</span>}
      </>
    )}
  </NavLink>
);

// ─── Outlet Switcher Popover ──────────────────────────────────────────────────
interface OutletSwitcherProps {
  isCollapsed: boolean;
}

const OutletSwitcher: React.FC<OutletSwitcherProps> = ({ isCollapsed }) => {
  const { user, switchOutlet } = useUser();
  const { outlets, isLoading } = useOutlets(!!user);

  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState('');
  const [switching, setSwitching] = useState<number | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Focus search when popover opens
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
    else setQuery('');
  }, [open]);

  const activeId = user?.active_outlet_id ? Number(user.active_outlet_id) : null;

  const activeOutlet: OutletInfo | undefined = useMemo(
    () => outlets.find(o => o.id === activeId),
    [outlets, activeId]
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return outlets;
    return outlets.filter(
      o =>
        o.name.toLowerCase().includes(q) ||
        o.city.toLowerCase().includes(q)
    );
  }, [outlets, query]);

  // Display label: "Taj - Kolhapur"
  const displayLabel = activeOutlet
    ? activeOutlet.name
    : isLoading
      ? 'Loading…'
      : 'Select outlet';

  const handleSwitch = async (id: number) => {
    if (id === activeId) { setOpen(false); return; }
    const target = outlets.find(o => o.id === id);
    const targetName = target ? outletLabel(target) : undefined;
    setSwitching(id);
    try { await switchOutlet(id, targetName); }
    finally { setSwitching(null); setOpen(false); }
  };

  const hasMultiple = outlets.length > 1;

  return (
    <Popover.Root open={open} onOpenChange={hasMultiple ? setOpen : undefined}>
      <Popover.Trigger asChild>
        {isCollapsed ? (
          /* ── Collapsed: icon pill ── */
          <button
            title={displayLabel}
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer mx-auto',
              activeOutlet ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm' : 'bg-[var(--sidebar-accent)] text-[var(--muted-foreground)]',
              open && 'ring-2 ring-[var(--primary)]/40'
            )}
          >
            <span className="text-[10px] font-bold">
              {activeOutlet ? initials(activeOutlet) : '—'}
            </span>
          </button>
        ) : (
          /* ── Expanded: full trigger card (matches reference) ── */
          <button
            className={cn(
              'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-150 cursor-pointer',
              'hover:bg-[var(--sidebar-accent)]',
              'border border-transparent hover:border-[var(--sidebar-border)]',
              open && 'bg-[var(--sidebar-accent)] border-[var(--sidebar-border)]',
              !hasMultiple && 'cursor-default'
            )}
          >
            {/* Outlet badge */}
            {activeOutlet ? (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--primary)] text-[var(--primary-foreground)] text-[10px] font-bold shrink-0 shadow-sm">
                {initials(activeOutlet)}
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-[var(--sidebar-accent)] border border-[var(--sidebar-border)] shrink-0 animate-pulse" />
            )}

            {/* Name + City */}
            <div className="flex-1 text-left min-w-0 leading-[1.3]">
              <p className="text-[13px] font-semibold text-[var(--sidebar-foreground)] truncate">
                {displayLabel}
              </p>
              <p className="text-[11px] text-[var(--muted-foreground)] truncate">
                Hotel Property
              </p>
            </div>

            {/* Chevrons — only when multiple outlets */}
            {hasMultiple && (
              <ChevronsUpDown className="w-4 h-4 text-[var(--muted-foreground)] shrink-0 opacity-70" />
            )}
          </button>
        )}
      </Popover.Trigger>

      {/* ── Popover panel ── */}
      {hasMultiple && (
        <Popover.Portal>
          <Popover.Content
            side={isCollapsed ? 'right' : 'bottom'}
            sideOffset={isCollapsed ? 8 : 4}
            align={isCollapsed ? 'start' : 'start'}
            avoidCollisions
            className={cn(
              'z-[200] rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden',
              isCollapsed ? 'w-64' : 'w-[var(--radix-popover-trigger-width)] min-w-56',
              'bg-[var(--popover)] text-[var(--popover-foreground)]',
              'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-2',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2',
              'duration-150'
            )}
          >
            {/* ── Active outlet header ── */}
            <div className="flex items-center gap-2.5 px-3.5 py-3 border-b border-[var(--border)]">
              {activeOutlet && (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--primary)] text-[var(--primary-foreground)] text-[10px] font-bold shrink-0 shadow-sm">
                  {initials(activeOutlet)}
                </div>
              )}
              <div className="min-w-0 leading-[1.3]">
                <p className="text-[13px] font-semibold text-[var(--foreground)] truncate">
                  {displayLabel}
                </p>
                <p className="text-[11px] text-[var(--muted-foreground)]">
                  Hotel Property
                </p>
              </div>
            </div>

            {/* ── Search ── */}
            <div className="px-2.5 py-2 border-b border-[var(--border)]">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
                <Search className="w-3.5 h-3.5 text-[var(--muted-foreground)] shrink-0" />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search outlets…"
                  className="flex-1 bg-transparent text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none"
                />
              </div>
            </div>

            {/* ── Outlet list ── */}
            <div className="py-1.5 max-h-60 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="px-4 py-3 text-xs text-[var(--muted-foreground)] text-center">
                  No outlets match "{query}"
                </p>
              ) : (
                filtered.map(outlet => {
                  const isActive  = outlet.id === activeId;
                  const isSpinning = switching === outlet.id;
                  const label     = outlet.name;

                  return (
                    <button
                      key={outlet.id}
                      onClick={() => handleSwitch(outlet.id)}
                      disabled={isSpinning}
                      className={cn(
                        'w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors cursor-pointer',
                        isActive
                          ? 'text-[var(--primary)] bg-[var(--primary)]/8 font-semibold'
                          : 'text-[var(--foreground)] hover:bg-[var(--muted)]',
                        isSpinning && 'opacity-60 cursor-not-allowed'
                      )}
                    >
                      <span className="text-[13px] truncate">{label}</span>

                      <span className="shrink-0 ml-2">
                        {isSpinning ? (
                          <span className="w-3.5 h-3.5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin block" />
                        ) : isActive ? (
                          <Check className="w-3.5 h-3.5 text-[var(--primary)]" />
                        ) : null}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </Popover.Content>
        </Popover.Portal>
      )}
    </Popover.Root>
  );
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────
interface SidebarProps {
  isCollapsed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const { cashRegister } = useHotel();
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const displayName  = user?.name  || cashRegister.activeReceptionist;
  const displayEmail = user?.email || 'sarah.jenkins@grandazure.com';
  const displayRole  = user?.role  || 'STAFF';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/login');
    }
  };

  return (
    <aside
      className={cn(
        'bg-[var(--sidebar)] border-l border-[var(--border)] flex flex-col justify-between select-none h-full shrink-0 transition-all duration-300 rounded-tl-[2rem] rounded-bl-[2rem] overflow-hidden',
        isCollapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className="flex flex-col min-h-0">

        {/* ── Brand Logo ──────────────────────────────────────────────────── */}
        <div className={cn('h-14 flex items-center shrink-0', isCollapsed ? 'justify-center px-3' : 'px-4 gap-3')}>
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-[var(--primary-foreground)] shrink-0 shadow-sm">
            <BedDouble className="w-5 h-5 text-[var(--primary-foreground)]" />
          </div>
          {!isCollapsed && (
            <span className="font-extrabold text-[15px] tracking-tight text-[var(--sidebar-foreground)]">
              Desk<span className="text-[var(--primary)]">Flow</span>
            </span>
          )}
        </div>

        {/* ── Outlet Switcher ─────────────────────────────────────────────── */}
        <div className={cn('px-2 pb-2', isCollapsed && 'flex justify-center')}>
          <OutletSwitcher isCollapsed={isCollapsed} />
        </div>

        {/* ── Divider ─────────────────────────────────────────────────────── */}
        <div className="mx-3 mb-1 border-t border-[var(--sidebar-border)]" />

        {/* ── Main Navigation ─────────────────────────────────────────────── */}
        <div className="px-3 py-2 space-y-0.5">
          {!isCollapsed && (
            <span className="px-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)] block mb-1.5 mt-1">
              Main
            </span>
          )}
          <NavItem to="/app/dashboard"  icon={LayoutDashboard} label="Dashboard"       isCollapsed={isCollapsed} />
          <NavItem to="/app/operations" icon={CalendarDays}     label="Operations"     isCollapsed={isCollapsed} />
          <NavItem to="/app/rooms"      icon={BedDouble}        label="Rooms & Floors" isCollapsed={isCollapsed} />
          <NavItem to="/app/guests"     icon={Users}            label="Guests (CRM)"   isCollapsed={isCollapsed} />
        </div>

        {/* ── System ──────────────────────────────────────────────────────── */}
        <div className="px-3 py-2 space-y-0.5 mt-1">
          {!isCollapsed && (
            <span className="px-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)] block mb-1.5">
              System
            </span>
          )}
          <NavItem to="/app/settings" icon={Settings} label="Settings" isCollapsed={isCollapsed} />
        </div>
      </div>

      {/* ── Bottom: User Profile & Logout Button ─────────────────────────────── */}
      <div className="shrink-0 p-3 border-t border-[var(--sidebar-border)]">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <img
              src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(displayName)}`}
              alt="Avatar"
              title={`${displayName} (${displayRole})`}
              className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 shrink-0"
            />
            <button
              onClick={handleLogout}
              title="Sign out of shift"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-500/10 cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[var(--sidebar-accent)] transition-all">
            <img
              src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(displayName)}`}
              alt="Avatar"
              className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 shrink-0"
            />
            <div className="leading-tight text-left min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-[var(--sidebar-foreground)] truncate">
                  {displayName}
                </p>
                <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-[var(--primary)]/10 text-[var(--primary)] shrink-0">
                  {displayRole}
                </span>
              </div>
              <p className="text-[10px] text-[var(--muted-foreground)] truncate mt-0.5">
                {displayEmail}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out of shift"
              className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-500/10 cursor-pointer transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
