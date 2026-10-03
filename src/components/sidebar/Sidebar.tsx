import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  BedDouble,
  Users,
  Settings,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useHotel } from '../../context/HotelContext';

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

interface SidebarProps {
  isCollapsed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const { cashRegister } = useHotel();

  return (
    <aside
      className={cn(
        'bg-[var(--sidebar)] border-l border-[var(--border)] flex flex-col justify-between select-none h-full shrink-0 transition-all duration-300 rounded-tl-[2rem] rounded-bl-[2rem] overflow-hidden',
        isCollapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className="flex flex-col min-h-0">
        {/* Brand Logo */}
        <div className={cn('h-16 flex items-center shrink-0', isCollapsed ? 'justify-center px-3' : 'px-5 gap-3')}>
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-[var(--primary-foreground)] shrink-0 shadow-sm">
            <BedDouble className="w-5 h-5 text-[var(--primary-foreground)]" />
          </div>
          {!isCollapsed && (
            <div className="leading-tight overflow-hidden whitespace-nowrap">
              <span className="font-extrabold text-base tracking-tight text-[var(--sidebar-foreground)] block">
                Desk<span className="text-[var(--primary)]">Flow</span>
              </span>
            </div>
          )}
        </div>


        {/* MAIN NAV */}
        <div className="px-3 py-2 space-y-0.5">
          {!isCollapsed && (
            <span className="px-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)] block mb-1.5 mt-1">
              Main
            </span>
          )}
          <NavItem to="/app/dashboard"  icon={LayoutDashboard} label="Dashboard"           isCollapsed={isCollapsed} />
          <NavItem to="/app/operations" icon={CalendarDays}     label="Operations"         isCollapsed={isCollapsed} />
          <NavItem to="/app/rooms"      icon={BedDouble}        label="Rooms &amp; Floors"  isCollapsed={isCollapsed} />
          <NavItem to="/app/guests"     icon={Users}            label="Guests (CRM)"        isCollapsed={isCollapsed} />
        </div>

        {/* DOCUMENTS / SYSTEM */}
        <div className="px-3 py-2 space-y-0.5 mt-1">
          {!isCollapsed && (
            <span className="px-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)] block mb-1.5">
              System
            </span>
          )}
          <NavItem to="/app/settings" icon={Settings} label="Settings" isCollapsed={isCollapsed} />
        </div>
      </div>

      {/* BOTTOM: User */}
      <div className="shrink-0">

        {/* User Profile */}
        <div className={cn('p-3 border-t border-[var(--sidebar-border)]')}>
          <div
            title={isCollapsed ? cashRegister.activeReceptionist : undefined}
            className={cn(
              'flex items-center rounded-lg hover:bg-[var(--sidebar-accent)] cursor-pointer transition-all p-2 group',
              isCollapsed ? 'justify-center' : 'gap-2.5'
            )}
          >
            {/* Avatar */}
            <img
              src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(cashRegister.activeReceptionist)}`}
              alt="Receptionist Avatar"
              className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-200 shrink-0"
            />
            {!isCollapsed && (
              <>
                <div className="leading-tight text-left min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[var(--sidebar-foreground)] truncate">
                    {cashRegister.activeReceptionist}
                  </p>
                  <p className="text-[10px] text-[var(--muted-foreground)] truncate">
                    sarah.jenkins@grandazure.com
                  </p>
                </div>
                <MoreHorizontal className="w-4 h-4 text-[var(--muted-foreground)] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
