import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { TopBar } from '../components/topbar/TopBar';
import { Sidebar } from '../components/sidebar/Sidebar';
import { NewReservationModal } from '../components/modals/NewReservationModal';
import { FolioModal } from '../components/modals/FolioModal';
import { FastSearchModal } from '../components/modals/FastSearchModal';
import { ShiftCloseModal } from '../components/modals/ShiftCloseModal';
import { OutletSwitchOverlay } from '../components/ui/OutletSwitchOverlay';
import { cn } from '../lib/utils';
import { useUser } from '../hooks/useUser';

export const AppShell: React.FC = () => {
  const { user, loading } = useUser();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Determine if we're on mobile (< md breakpoint = 768px)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile drawer when screen grows to desktop
  useEffect(() => {
    if (!isMobile) setMobileOpen(false);
  }, [isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(prev => !prev);
    } else {
      setIsCollapsed(prev => !prev);
    }
  };

  // Cold boot loader: ONLY displayed on very first page load before any user data exists
  if (loading && !user) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[var(--background)] text-[var(--foreground)] select-none">
        <div className="flex flex-col items-center gap-3 animate-in fade-in duration-300">
          <div className="w-16 h-16 flex items-center justify-center drop-shadow-md animate-pulse">
            <img
              src="/deskflow-logo.png"
              alt="DeskFlow Logo"
              className="w-full h-full object-contain select-none"
            />
          </div>
          <span className="font-extrabold text-base tracking-tight text-[var(--foreground)]">
            Desk<span className="text-[var(--primary)] font-black">Flow</span>
          </span>
          <div className="w-24 h-1.5 bg-[var(--muted)] rounded-full overflow-hidden mt-1">
            <div className="w-1/2 h-full bg-[var(--primary)] rounded-full animate-[pulse_1s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    );
  }

  // If no active user session, redirect to login cleanly
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen w-screen flex bg-[var(--sidebar)] overflow-hidden">
      {/* MOBILE BACKDROP OVERLAY */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={cn(
          'shrink-0 transition-all duration-300',
          // Mobile: absolute slide-in overlay
          isMobile
            ? cn(
                'fixed inset-y-0 left-0 z-50',
                mobileOpen ? 'translate-x-0' : '-translate-x-full'
              )
            : 'relative'
        )}
      >
        <Sidebar isCollapsed={isMobile ? false : isCollapsed} />
      </div>

      {/* RIGHT CONTENT PANEL */}
      <div className={cn(
        'flex-1 flex flex-col min-w-0 overflow-hidden bg-[var(--background)]',
        // Desktop gets the floating inset look
        !isMobile && 'my-2 mr-2 rounded-xl shadow-sm'
      )}>
        <TopBar
          isCollapsed={isMobile ? !mobileOpen : isCollapsed}
          toggleSidebar={toggleSidebar}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="w-full p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5">
            <Outlet />
          </div>
        </main>
      </div>

      {/* GLOBAL MODALS & OVERLAYS */}
      <NewReservationModal />
      <FolioModal />
      <FastSearchModal />
      <ShiftCloseModal />
      <OutletSwitchOverlay />
    </div>
  );
};
