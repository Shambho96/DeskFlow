import React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { useUser } from '../../hooks/useUser';

/**
 * Full-screen frosted glass blur overlay displayed during an active outlet/property switch.
 * - Blocks all user interactions (pointer-events-auto on full-screen fixed backdrop).
 * - Displays a sleek animated indicator and the target property name.
 * - Prevents accidental duplicate requests or clicking stale actions during context change.
 */
export const OutletSwitchOverlay: React.FC = () => {
  const { isSwitchingOutlet, targetOutletName } = useUser();

  if (!isSwitchingOutlet) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-busy="true"
      aria-live="assertive"
      className="fixed inset-0 z-[99999] bg-black/40 dark:bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none pointer-events-auto cursor-wait transition-all duration-300 animate-in fade-in"
    >
      <div className="relative bg-[var(--card)]/90 border border-[var(--border)] shadow-2xl rounded-3xl p-6 sm:p-8 max-w-sm w-full flex flex-col items-center text-center backdrop-blur-xl space-y-4">
        {/* Glow & New DeskFlow Brand Logo */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-[var(--primary)] blur-xl opacity-30 animate-pulse" />
          <div className="relative w-16 h-16 flex items-center justify-center drop-shadow-lg">
            <img
              src="/deskflow-logo.png"
              alt="DeskFlow Logo"
              className="w-full h-full object-contain select-none animate-pulse"
            />
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[var(--primary)]" />
          </span>
        </div>

        {/* Text Details */}
        <div className="space-y-1.5 w-full">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--muted)] text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
            <RefreshCw className="w-3 h-3 animate-spin text-[var(--primary)]" />
            <span>Switching Property</span>
          </div>

          <h3 className="text-base font-extrabold text-[var(--foreground)] tracking-tight">
            {targetOutletName ? targetOutletName : 'Switching Property…'}
          </h3>

          <p className="text-xs text-[var(--muted-foreground)]">
            Updating outlet context and synchronizing property records…
          </p>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-48 h-1.5 bg-[var(--muted)] rounded-full overflow-hidden relative">
          <div className="w-1/2 h-full bg-[var(--primary)] rounded-full animate-[pulse_1s_ease-in-out_infinite]" />
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--muted-foreground)] pt-1">
          <Sparkles className="w-3.5 h-3.5 text-[var(--primary)]" />
          <span>Please wait a moment…</span>
        </div>
      </div>
    </div>
  );
};
