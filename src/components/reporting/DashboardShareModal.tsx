import React, { useState } from 'react';
import {
  X,
  Lock,
  Globe2,
  Users2,
  Check,
  ShieldAlert,
} from 'lucide-react';
import type { CustomDashboard, DashboardVisibility } from '../../types/reporting';

interface DashboardShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  dashboard: CustomDashboard | null;
  onUpdateVisibility: (
    visibility: DashboardVisibility,
    sharedMembers: Array<{ user_id: number; role: 'VIEWER' | 'EDITOR'; email?: string; name?: string }>
  ) => Promise<void>;
}

interface DashboardShareModalContentProps {
  onClose: () => void;
  dashboard: CustomDashboard;
  onUpdateVisibility: (
    visibility: DashboardVisibility,
    sharedMembers: Array<{ user_id: number; role: 'VIEWER' | 'EDITOR'; email?: string; name?: string }>
  ) => Promise<void>;
}

const DashboardShareModalContent: React.FC<DashboardShareModalContentProps> = ({
  onClose,
  dashboard,
  onUpdateVisibility,
}) => {
  const [visibility, setVisibility] = useState<DashboardVisibility>(dashboard.visibility || 'PRIVATE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      await onUpdateVisibility(visibility, dashboard.shared_members || []);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl w-full max-w-md shadow-xl text-[var(--card-foreground)] transform-gpu">
        <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--foreground)]">Share Dashboard</h2>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{dashboard.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-lg hover:bg-[var(--muted)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <label className="block font-semibold text-[var(--foreground)] uppercase tracking-wider text-[11px]">
            Visibility &amp; Access Scope
          </label>

          {/* Option 1: Private */}
          <div
            onClick={() => setVisibility('PRIVATE')}
            className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
              visibility === 'PRIVATE'
                ? 'bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--foreground)] shadow-xs'
                : 'bg-[var(--background)] border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/50'
            }`}
          >
            <div className="p-2 rounded-lg bg-[var(--muted)] text-[var(--foreground)] shrink-0 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[var(--foreground)]">Private to Me</span>
                {visibility === 'PRIVATE' && <Check className="w-4 h-4 text-[var(--primary)] stroke-[3]" />}
              </div>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                Only you can view and edit this dashboard.
              </p>
            </div>
          </div>

          {/* Option 2: Outlet Shared */}
          <div
            onClick={() => setVisibility('OUTLET_SHARED')}
            className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
              visibility === 'OUTLET_SHARED'
                ? 'bg-emerald-500/10 border-emerald-500 text-[var(--foreground)] shadow-xs'
                : 'bg-[var(--background)] border-[var(--border)] text-[var(--muted-foreground)] hover:border-emerald-500/50'
            }`}
          >
            <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
              <Globe2 className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[var(--foreground)]">Share with Entire Outlet</span>
                {visibility === 'OUTLET_SHARED' && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[3]" />}
              </div>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                All managers and staff assigned to this outlet can view this dashboard.
              </p>
            </div>
          </div>

          {/* Option 3: Specific Members */}
          <div
            onClick={() => setVisibility('SPECIFIC_MEMBERS')}
            className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
              visibility === 'SPECIFIC_MEMBERS'
                ? 'bg-amber-500/10 border-amber-500 text-[var(--foreground)] shadow-xs'
                : 'bg-[var(--background)] border-[var(--border)] text-[var(--muted-foreground)] hover:border-amber-500/50'
            }`}
          >
            <div className="p-2 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
              <Users2 className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[var(--foreground)]">Specific Members</span>
                {visibility === 'SPECIFIC_MEMBERS' && <Check className="w-4 h-4 text-amber-600 dark:text-amber-400 stroke-[3]" />}
              </div>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                Invite specific colleagues in this outlet to view or collaborate.
              </p>
            </div>
          </div>

          <div className="bg-[var(--muted)]/50 p-3 rounded-xl border border-[var(--border)] text-[11px] text-[var(--muted-foreground)] flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[var(--muted-foreground)] shrink-0" />
            <span>
              All data queries are strictly guarded by outlet permissions.
            </span>
          </div>

          <div className="pt-3 border-t border-[var(--border)] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[var(--primary)] text-white shadow-md hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DashboardShareModal: React.FC<DashboardShareModalProps> = ({
  isOpen,
  onClose,
  dashboard,
  onUpdateVisibility,
}) => {
  if (!isOpen || !dashboard) return null;

  return (
    <DashboardShareModalContent
      dashboard={dashboard}
      onClose={onClose}
      onUpdateVisibility={onUpdateVisibility}
    />
  );
};
