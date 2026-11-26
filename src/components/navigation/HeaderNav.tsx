import React, { useState, useMemo, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import * as Popover from '@radix-ui/react-popover';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  LayoutGrid,
  BedDouble,
  Users,
  BarChart3,
  Settings,
  UtensilsCrossed,
  ChefHat,
  BookOpen,
  Search,
  Sun,
  Moon,
  Clock,
  ChevronsUpDown,
  Check,
  LogOut,
  Menu,
  X,
  Building2,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useUser } from '../../hooks/useUser';
import { useHotel } from '../../context/HotelContext';
import { useTheme } from '../../context/ThemeContext';
import { useModal } from '../../context/ModalContext';
import { useOutlets, outletLabel } from '../../hooks/useOutlets';
import type { OutletInfo } from '../../hooks/useOutlets';

// ─── Clean Initials Helper ───────────────────────────────────────────────────
function getInitials(outlet: OutletInfo): string {
  const words = `${outlet.name} ${outlet.city}`
    .trim()
    .split(/\s+/)
    .filter(w => /[a-zA-Z]/.test(w));
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return outlet.name.slice(0, 2).toUpperCase();
}

// ─── 1-Word Clean Navigation Items (Matches Reference Style) ─────────────────
interface NavItemDef {
  to: string;
  icon: React.ElementType;
  label: string;
  activeMatch?: (pathname: string) => boolean;
}

const NAV_ITEMS: NavItemDef[] = [
  {
    to: '/app/operations',
    icon: LayoutGrid,
    label: 'PMS',
    activeMatch: p => p === '/app/operations',
  },
  {
    to: '/app/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
    activeMatch: p => p === '/app/dashboard',
  },
  {
    to: '/app/rooms',
    icon: BedDouble,
    label: 'Rooms',
    activeMatch: p => p === '/app/rooms',
  },
  {
    to: '/app/guests',
    icon: Users,
    label: 'Guests',
    activeMatch: p => p === '/app/guests',
  },
  {
    to: '/app/pos',
    icon: UtensilsCrossed,
    label: 'POS',
    activeMatch: p => p.startsWith('/app/pos') || p.startsWith('/app/kds'),
  },
  {
    to: '/app/reports',
    icon: BarChart3,
    label: 'Reports',
    activeMatch: p => p === '/app/reports',
  },
  {
    to: '/app/settings',
    icon: Settings,
    label: 'Settings',
    activeMatch: p => p === '/app/settings',
  },
];

// ─── POS / Dining Views Sub-Nav (KOT, KDS, Tables, Menu) ──────────────────────
const DINING_SUB_ITEMS = [
  { to: '/app/pos', label: 'Point of Sale', icon: UtensilsCrossed, end: true },
  { to: '/app/kds', label: 'KOT & Kitchen (KDS)', icon: ChefHat },
  { to: '/app/pos/tables', label: 'Tables & Floors', icon: LayoutGrid },
  { to: '/app/pos/menu', label: 'Menu & Pricing', icon: BookOpen },
];

export const HeaderNav: React.FC = () => {
  const { user, switchOutlet, logout } = useUser();
  const { cashRegister } = useHotel();
  const { theme, toggleTheme } = useTheme();
  const { openSearch } = useModal();
  const { outlets, isLoading: outletsLoading } = useOutlets(!!user);
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [outletOpen, setOutletOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [outletQuery, setOutletQuery] = useState('');
  const [switchingId, setSwitchingId] = useState<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Live ticking clock
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // Shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openSearch]);

  // Close mobile on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const activeId = user?.active_outlet_id ? Number(user.active_outlet_id) : null;
  const activeOutlet = useMemo(() => outlets.find(o => o.id === activeId), [outlets, activeId]);

  const filteredOutlets = useMemo(() => {
    const q = outletQuery.toLowerCase().trim();
    if (!q) return outlets;
    return outlets.filter(
      o => o.name.toLowerCase().includes(q) || o.city.toLowerCase().includes(q)
    );
  }, [outlets, outletQuery]);

  const hasMultiple = outlets.length > 1;
  const outletLabelText = activeOutlet
    ? activeOutlet.name
    : outletsLoading
    ? 'Loading…'
    : 'Property';

  const handleSwitch = async (id: number) => {
    if (id === activeId) {
      setOutletOpen(false);
      setOutletQuery('');
      return;
    }
    setOutletOpen(false);
    setOutletQuery('');
    const target = outlets.find(o => o.id === id);
    const targetName = target ? outletLabel(target) : undefined;
    setSwitchingId(id);
    try {
      await switchOutlet(id, targetName);
    } catch (err) {
      console.error('Outlet switch failed:', err);
    } finally {
      setSwitchingId(null);
    }
  };

  const displayName = user?.name || cashRegister.activeReceptionist || 'Receptionist';
  const displayEmail = user?.email || 'sarah.jenkins@grandazure.com';
  const displayRole = user?.role || 'STAFF';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/login');
    }
  };

  const isDining = location.pathname.startsWith('/app/pos') || location.pathname.startsWith('/app/kds');

  return (
    <header className="sticky top-0 z-40 w-full select-none bg-[var(--card)]/95 backdrop-blur-md border-b border-[var(--border)] transition-colors">
      {/* ─── PRIMARY SINGLE-LINE HEADER ────────────────────────────────────────── */}
      <div className="h-14 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* ── Left: Brand Logo & Title ── */}
        <div className="flex items-center gap-6 shrink-0">
          <div
            onClick={() => navigate('/app/dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group py-1"
            title="DeskFloow"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <img
                src="/deskfloow-logo.png"
                alt="DeskFloow"
                className="w-full h-full object-contain select-none"
              />
            </div>
            <span className="font-extrabold text-[15px] tracking-tight text-[var(--foreground)] leading-none">
              Desk<span className="text-[var(--primary)] font-black">Floow</span>
            </span>
          </div>

          {/* ── Center: Flat, Minimalist Navigation with Smooth Gliding Spring Animation ── */}
          <nav className="hidden lg:flex items-center gap-1 relative">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive = item.activeMatch
                ? item.activeMatch(location.pathname)
                : location.pathname === item.to;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors whitespace-nowrap select-none z-0',
                    isActive
                      ? 'text-[var(--foreground)] font-semibold'
                      : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/40'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0 transition-colors duration-200 z-10',
                      isActive ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'
                    )}
                  />
                  <span className="z-10">{item.label}</span>

                  {/* Smooth Gliding Active Pill Animation via Motion Spring */}
                  {isActive && (
                    <motion.div
                      layoutId="activeHeaderNavPill"
                      className="absolute inset-0 rounded-lg bg-[var(--muted)] border border-[var(--border)]/70 shadow-2xs z-0"
                      transition={{
                        type: 'spring',
                        stiffness: 420,
                        damping: 32,
                        mass: 0.8,
                      }}
                    >
                      {/* Vibrant bottom accent bar */}
                      <span className="absolute bottom-0 inset-x-2.5 h-[2px] bg-[var(--primary)] rounded-full" />
                    </motion.div>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* ── Right: Clean, Flat Utilities (No Pill Overload) ── */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Subtle Live Clock */}
          <div className="hidden xl:flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] font-mono tabular-nums px-2 py-1">
            <Clock className="w-3.5 h-3.5 opacity-60" />
            <span>{formattedTime}</span>
          </div>

          {/* Property Switcher */}
          <Popover.Root open={outletOpen} onOpenChange={setOutletOpen}>
            <Popover.Trigger asChild>
              <button
                className={cn(
                  'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors cursor-pointer max-w-44 sm:max-w-56 truncate',
                  outletOpen && 'bg-[var(--muted)]'
                )}
                title="Switch Property"
              >
                <Building2 className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
                <span className="truncate text-xs">{outletLabelText}</span>
                {hasMultiple && (
                  <ChevronsUpDown className="w-3 h-3 text-[var(--muted-foreground)] shrink-0 opacity-60" />
                )}
              </button>
            </Popover.Trigger>

            {hasMultiple && (
              <Popover.Portal>
                <Popover.Content
                  side="bottom"
                  align="end"
                  sideOffset={6}
                  className="z-[200] w-60 rounded-xl border border-[var(--border)] shadow-xl bg-[var(--popover)] text-[var(--popover-foreground)] p-0 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100"
                >
                  <div className="p-2.5 border-b border-[var(--border)] bg-[var(--muted)]/40">
                    <p className="text-[11px] font-bold text-[var(--foreground)]">Switch Property</p>
                    <div className="mt-1.5 flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--background)] border border-[var(--border)]">
                      <Search className="w-3 h-3 text-[var(--muted-foreground)] shrink-0" />
                      <input
                        ref={searchInputRef}
                        value={outletQuery}
                        onChange={e => setOutletQuery(e.target.value)}
                        placeholder="Search outlet…"
                        className="flex-1 bg-transparent text-[11px] text-[var(--foreground)] outline-none"
                      />
                    </div>
                  </div>

                  <div className="py-1 max-h-52 overflow-y-auto">
                    {filteredOutlets.map(outlet => {
                      const isCurrent = outlet.id === activeId;
                      const isSpinning = switchingId === outlet.id;

                      return (
                        <button
                          key={outlet.id}
                          onClick={() => handleSwitch(outlet.id)}
                          disabled={isSpinning}
                          className={cn(
                            'w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors cursor-pointer',
                            isCurrent
                              ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-semibold'
                              : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 rounded bg-[var(--muted)] flex items-center justify-center font-bold text-[9px]">
                              {getInitials(outlet)}
                            </span>
                            <span className="truncate">{outlet.name}</span>
                          </div>
                          {isCurrent && <Check className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </Popover.Content>
              </Popover.Portal>
            )}
          </Popover.Root>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors cursor-pointer"
            title={`Toggle ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* User Profile Avatar Popover */}
          <Popover.Root open={profileOpen} onOpenChange={setProfileOpen}>
            <Popover.Trigger asChild>
              <button
                className="rounded-full cursor-pointer hover:ring-2 hover:ring-[var(--primary)]/40 transition-all ml-1 shrink-0"
                title={`${displayName} (${displayRole})`}
              >
                <img
                  src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(displayName)}`}
                  alt="Avatar"
                  className="w-7 h-7 rounded-full bg-[var(--muted)] border border-[var(--border)]"
                />
              </button>
            </Popover.Trigger>

            <Popover.Portal>
              <Popover.Content
                side="bottom"
                align="end"
                sideOffset={6}
                className="z-[200] w-56 rounded-xl border border-[var(--border)] shadow-xl bg-[var(--popover)] text-[var(--popover-foreground)] p-2 animate-in fade-in-0 zoom-in-95 duration-100"
              >
                <div className="p-2 border-b border-[var(--border)] mb-1">
                  <p className="text-xs font-bold text-[var(--foreground)] truncate">{displayName}</p>
                  <p className="text-[10px] text-[var(--muted-foreground)] truncate">{displayEmail}</p>
                  <span className="inline-block mt-1 text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-[var(--primary)]/10 text-[var(--primary)]">
                    {displayRole}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate('/app/settings');
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                  <span>Settings</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          {/* Mobile Menu Button (< lg) */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="lg:hidden p-1.5 rounded-lg text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors cursor-pointer"
            title="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ─── SLEEK SECONDARY SUB-ROW (Active on Dining/POS: KOT, KDS, Tables, Menu) ─── */}
      {isDining && (
        <div className="h-9 px-4 sm:px-6 bg-[var(--muted)]/40 border-t border-[var(--border)] flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider mr-2 shrink-0 hidden sm:inline">
              Dining Views:
            </span>
            {DINING_SUB_ITEMS.map(sub => {
              const SubIcon = sub.icon;
              const isCurrent = sub.end ? location.pathname === sub.to : location.pathname.startsWith(sub.to);
              return (
                <NavLink
                  key={sub.to}
                  to={sub.to}
                  end={sub.end}
                  className={cn(
                    'relative flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all whitespace-nowrap shrink-0',
                    isCurrent
                      ? 'text-[var(--foreground)] bg-[var(--card)] shadow-xs border border-[var(--border)]'
                      : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card)]/50'
                  )}
                >
                  <SubIcon className={cn('w-3.5 h-3.5', isCurrent ? 'text-[var(--primary)]' : '')} />
                  <span>{sub.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── MOBILE DRAWER (< lg) ─────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[var(--border)] bg-[var(--card)] p-3 space-y-1 animate-in slide-in-from-top-2 duration-150">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = item.activeMatch
              ? item.activeMatch(location.pathname)
              : location.pathname === item.to;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold'
                    : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </header>
  );
};
