import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { HeaderNav } from '../components/navigation/HeaderNav';
import { NewReservationModal } from '../components/modals/NewReservationModal';
import { FolioModal } from '../components/modals/FolioModal';
import { FastSearchModal } from '../components/modals/FastSearchModal';
import { ShiftCloseModal } from '../components/modals/ShiftCloseModal';
import { useUser } from '../hooks/useUser';

export const AppShell: React.FC = () => {
  const { user, loading } = useUser();

  // Cold boot loader: ONLY displayed on very first page load before any user data exists
  if (loading && !user) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[var(--background)] text-[var(--foreground)] select-none">
        <div className="flex flex-col items-center gap-3 animate-in fade-in duration-300">
          <div className="w-16 h-16 flex items-center justify-center drop-shadow-md animate-pulse">
            <img
              src="/deskfloow-logo.png"
              alt="DeskFloow Logo"
              className="w-full h-full object-contain select-none"
            />
          </div>
          <span className="font-extrabold text-base tracking-tight text-[var(--foreground)]">
            Desk<span className="text-[var(--primary)] font-black">Floow</span>
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
    <div className="min-h-screen w-full flex flex-col bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--primary)] selection:text-[var(--primary-foreground)]">
      {/* ── TOP HEADER NAVIGATION (Sleek, Minimalist, Reference-Aligned) ── */}
      <HeaderNav />

      {/* ── FULL-WIDTH SPACIOUS WORKSPACE ── */}
      <main className="flex-1 w-full overflow-y-auto">
        <div className="w-full max-w-[1720px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <Outlet />
        </div>
      </main>

      {/* ── GLOBAL MODALS & OVERLAYS ── */}
      <NewReservationModal />
      <FolioModal />
      <FastSearchModal />
      <ShiftCloseModal />
    </div>
  );
};
