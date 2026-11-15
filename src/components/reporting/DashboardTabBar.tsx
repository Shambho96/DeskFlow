import React from 'react';
import {
  Plus,
  Share2,
  Trash2,
  Lock,
  Globe2,
  Users2,
} from 'lucide-react';
import type { CustomDashboard } from '../../types/reporting';

interface DashboardTabBarProps {
  dashboards: CustomDashboard[];
  activeDashboardId: number | null;
  onSelectDashboard: (id: number) => void;
  onOpenNewDashboardModal: () => void;
  onOpenShareModal: () => void;
  onDeleteDashboard: (id: number) => void;
  currentCardCount: number;
}

export const DashboardTabBar: React.FC<DashboardTabBarProps> = ({
  dashboards,
  activeDashboardId,
  onSelectDashboard,
  onOpenNewDashboardModal,
  onOpenShareModal,
  onDeleteDashboard,
  currentCardCount,
}) => {
  const activeDash = dashboards.find(d => d.id === activeDashboardId) || dashboards[0];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3 mb-6">
      {/* ─── TABS LIST (MULTIPLE DASHBOARDS) ────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {dashboards.map(dash => {
          const isActive = dash.id === (activeDashboardId || activeDash?.id);

          return (
            <button
              key={dash.id}
              onClick={() => onSelectDashboard(dash.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] shadow-xs font-bold'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/60 font-medium border border-transparent'
              }`}
            >
              {/* Visibility indicator icon */}
              {dash.visibility === 'PRIVATE' ? (
                <Lock className="w-3 h-3 text-[var(--muted-foreground)]" />
              ) : dash.visibility === 'OUTLET_SHARED' ? (
                <Globe2 className="w-3 h-3 text-emerald-500" />
              ) : (
                <Users2 className="w-3 h-3 text-amber-500" />
              )}

              <span>{dash.name}</span>

              {/* Card counter pill inside tab */}
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-[var(--muted)] text-[var(--foreground)]' : 'bg-[var(--muted)]/60 text-[var(--muted-foreground)]'
                }`}
              >
                {dash.card_count ?? dash.cards?.length ?? 0}/10
              </span>
            </button>
          );
        })}

        {/* Create New Dashboard Tab Button */}
        <button
          onClick={onOpenNewDashboardModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] border border-dashed border-[var(--border)] transition-colors shrink-0 cursor-pointer"
          title="Create a new dashboard workspace"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Board</span>
        </button>
      </div>

      {/* ─── RIGHT CONTROLS: LIMIT COUNTER & DASHBOARD ACTIONS ──────────────────────── */}
      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
        {/* 10 Charts Limit Counter Badge */}
        <div
          className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
            currentCardCount >= 10
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
              : 'bg-[var(--muted)] border-[var(--border)] text-[var(--muted-foreground)]'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              currentCardCount >= 10 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
            }`}
          />
          <span>{currentCardCount} / 10 Charts Used</span>
        </div>

        {/* Share Button */}
        <button
          onClick={onOpenShareModal}
          className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-lg hover:bg-[var(--muted)] border border-transparent hover:border-[var(--border)] transition-colors cursor-pointer"
          title="Share Dashboard with Team Members"
        >
          <Share2 className="w-4 h-4" />
        </button>

        {/* Delete Dashboard Button (if more than 1 dashboard exists) */}
        {dashboards.length > 1 && activeDash && (
          <button
            onClick={() => onDeleteDashboard(activeDash.id)}
            className="p-1.5 text-[var(--muted-foreground)] hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Delete this dashboard"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
