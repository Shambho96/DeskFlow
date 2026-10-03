import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PanelLeft, Search, Sun, Moon, Clock, Calendar } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useModal } from '../../context/ModalContext';

interface TopBarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  '/app/dashboard':  'Dashboard',
  '/app/operations': 'Operations',
  '/app/rooms':      'Rooms & Floors',
  '/app/guests':     'Guests',
  '/app/settings':   'Settings',
};

export const TopBar: React.FC<TopBarProps> = ({ isCollapsed, toggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { openSearch } = useModal();
  const location = useLocation();

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'DeskFlow';

  // Live ticking clock
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  // Keyboard shortcut Ctrl+K / Cmd+K
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

  return (
    <header className="h-16 border-b border-[var(--border)] bg-[var(--background)] px-4 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* LEFT: toggle + page title + clock */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] cursor-pointer transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <PanelLeft className="w-5 h-5" />
        </button>

        <h1 className="text-sm font-semibold text-[var(--foreground)] tracking-tight">
          {pageTitle}
        </h1>

        {/* Live Date & Time clock */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
          <Calendar className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
          <span className="text-xs font-medium text-[var(--muted-foreground)] hidden sm:inline">
            {formattedDate}
          </span>
          <span className="text-[var(--border)] hidden sm:inline">•</span>
          <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span className="font-mono font-bold text-sm text-[var(--foreground)] tabular-nums tracking-tight">
            {formattedTime}
          </span>
        </div>
      </div>

      {/* RIGHT: Search + Theme toggle */}
      <div className="flex items-center gap-2">
        {/* Search bar */}
        <button
          onClick={openSearch}
          className="flex items-center gap-2 h-9 px-3.5 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-xs text-[var(--muted-foreground)] hover:border-[var(--primary)]/50 hover:bg-[var(--background)] transition-all cursor-pointer min-w-[180px]"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span>Search...</span>
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono font-medium rounded bg-[var(--background)] border border-[var(--border)] text-[var(--muted-foreground)] ml-auto">
            ⌘K
          </kbd>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="h-9 w-9 flex items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] cursor-pointer transition-colors border border-[var(--border)]"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
};
