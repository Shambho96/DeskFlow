import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { TopBar } from '../components/topbar/TopBar';
import { Sidebar } from '../components/sidebar/Sidebar';
import { NewReservationModal } from '../components/modals/NewReservationModal';
import { FolioModal } from '../components/modals/FolioModal';
import { FastSearchModal } from '../components/modals/FastSearchModal';
import { ShiftCloseModal } from '../components/modals/ShiftCloseModal';
import { cn } from '../lib/utils';
import { useUser } from '../hooks/useUser';

export const AppShell: React.FC = () => {
  const { user, loading, loggedOut } = useUser();
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

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[var(--muted-foreground)] font-medium">Verifying front desk session...</p>
        </div>
      </div>
    );
  }

  if (loggedOut || !user) {
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

      {/* GLOBAL MODALS */}
      <NewReservationModal />
      <FolioModal />
      <FastSearchModal />
      <ShiftCloseModal />
    </div>
  );
};
