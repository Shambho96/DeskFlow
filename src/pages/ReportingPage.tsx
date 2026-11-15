import React, { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  Plus,
  BarChart2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useUser } from '../hooks/useUser';
import { useOutlets, outletLabel } from '../hooks/useOutlets';
import {
  useCustomDashboards,
  createDashboard,
  updateDashboard,
  deleteDashboard,
  addReportCard,
  updateReportCard,
  deleteReportCard,
  reorderReportCards,
} from '../hooks/useReporting';
import { DashboardTabBar } from '../components/reporting/DashboardTabBar';
import { ReportCardItem } from '../components/reporting/ReportCardItem';
import { ReportCardModal } from '../components/reporting/ReportCardModal';
import { DashboardShareModal } from '../components/reporting/DashboardShareModal';
import { NewDashboardModal } from '../components/reporting/NewDashboardModal';
import type { CustomReportCard, CustomDashboard, DashboardVisibility } from '../types/reporting';

export const ReportingPage: React.FC = () => {
  const { user } = useUser();
  const { outlets } = useOutlets(Boolean(user));
  const activeOutlet = outlets.find(o => o.id === Number(user?.active_outlet_id));

  // Fetch Dashboards and their cards (Scoped by activeOutlet.id and user)
  const { dashboards, isLoading, refreshDashboards } = useCustomDashboards(activeOutlet?.id);

  // Active Dashboard Selection
  const [selectedDashboardId, setSelectedDashboardId] = useState<number | null>(null);

  const activeDashboard: CustomDashboard | undefined =
    dashboards.find(d => d.id === (selectedDashboardId || dashboards[0]?.id)) || dashboards[0];

  const cards = activeDashboard?.cards || [];
  const cardCount = cards.length;

  // Modal States
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CustomReportCard | null>(null);
  const [isNewDashModalOpen, setIsNewDashModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle Drag Reorder End
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !activeDashboard) return;

    const oldIndex = cards.findIndex(c => c.id === active.id);
    const newIndex = cards.findIndex(c => c.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newCards = arrayMove(cards, oldIndex, newIndex);
      const orderedIds = newCards.map(c => c.id);

      // Optimistically update & persist
      await reorderReportCards(activeDashboard.id, orderedIds);
      refreshDashboards();
    }
  };

  // Card Handlers (Memoized to prevent unnecessary re-renders of report cards)
  const handleOpenAddCard = useCallback(() => {
    setEditingCard(null);
    setIsCardModalOpen(true);
  }, []);

  const handleOpenEditCard = useCallback((card: CustomReportCard) => {
    setEditingCard(card);
    setIsCardModalOpen(true);
  }, []);

  const handleDeleteCard = useCallback(async (cardId: number) => {
    if (window.confirm('Are you sure you want to delete this report chart?')) {
      await deleteReportCard(cardId);
      refreshDashboards();
    }
  }, [refreshDashboards]);

  const handleSaveCard = useCallback(async (payload: any) => {
    const targetOutletId = activeOutlet?.id || activeDashboard?.outlet_id || undefined;
    if (editingCard) {
      await updateReportCard(editingCard.id, {
        title: payload.title,
        chart_type: payload.chart_type,
        group_by: payload.group_by,
        date_preset: payload.date_preset,
        date_from: payload.date_from,
        date_to: payload.date_to,
        selected_metrics: payload.selected_metrics,
        card_width: payload.card_width,
      });
    } else {
      await addReportCard({
        ...payload,
        outlet_ids: targetOutletId ? [targetOutletId] : [],
      });
    }
    refreshDashboards();
  }, [activeDashboard?.outlet_id, activeOutlet?.id, editingCard, refreshDashboards]);

  // Dashboard Handlers
  const handleCreateDashboard = useCallback(async (name: string, description: string, visibility: DashboardVisibility) => {
    const res: any = await createDashboard({
      name,
      description,
      visibility,
      outlet_id: activeOutlet?.id,
    });
    await refreshDashboards();
    if (res?.createDashboard?.id) {
      setSelectedDashboardId(res.createDashboard.id);
    }
  }, [activeOutlet?.id, refreshDashboards]);

  const handleDeleteDashboard = useCallback(async (dashId: number) => {
    if (window.confirm('Are you sure you want to delete this dashboard board?')) {
      await deleteDashboard(dashId);
      setSelectedDashboardId(null);
      refreshDashboards();
    }
  }, [refreshDashboards]);

  const handleDuplicateCard = useCallback(async (card: CustomReportCard) => {
    if (!activeDashboard) return;
    if (cardCount >= 10) {
      alert('Maximum 10 charts limit reached for this dashboard.');
      return;
    }
    await addReportCard({
      dashboard_id: activeDashboard.id,
      title: `${card.title} (Copy)`,
      report_type: card.report_type,
      chart_type: card.chart_type,
      group_by: card.group_by,
      date_preset: card.date_preset,
      date_from: card.date_from ?? undefined,
      date_to: card.date_to ?? undefined,
      selected_metrics: card.selected_metrics,
      outlet_ids: card.outlet_ids,
      filters: card.filters,
      card_width: card.card_width,
    });
    refreshDashboards();
  }, [activeDashboard, cardCount, refreshDashboards]);

  const handleUpdateVisibility = async (visibility: DashboardVisibility, sharedMembers: any[]) => {
    if (!activeDashboard) return;
    await updateDashboard(activeDashboard.id, {
      visibility,
      shared_members: sharedMembers,
    });
    refreshDashboards();
  };

  return (
    <div className="space-y-5 text-left pb-12">
      {/* ─── PAGE HEADER ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
              Custom Reports
            </h1>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Build custom multi-metric charts, reorder drag-and-drop boards &amp; export data • Property:{' '}
            {activeOutlet ? outletLabel(activeOutlet) : 'Active Property'}
          </p>
        </div>

        {/* Add Chart Button (Checks 10 charts limit) */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenAddCard}
            disabled={cardCount >= 10}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--primary)] text-white shadow-md hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer"
            title={cardCount >= 10 ? 'Maximum 10 charts reached on this board' : 'Add a new chart'}
          >
            <Plus className="w-4 h-4" />
            <span>Add Chart</span>
          </button>
        </div>
      </div>

      {/* ─── MULTIPLE DASHBOARDS TAB BAR (WITH 10 CHARTS LIMIT COUNTER) ────────────── */}
      {dashboards.length > 0 && (
        <DashboardTabBar
          dashboards={dashboards}
          activeDashboardId={selectedDashboardId || activeDashboard?.id || null}
          onSelectDashboard={setSelectedDashboardId}
          onOpenNewDashboardModal={() => setIsNewDashModalOpen(true)}
          onOpenShareModal={() => setIsShareModalOpen(true)}
          onDeleteDashboard={handleDeleteDashboard}
          currentCardCount={cardCount}
        />
      )}

      {/* ─── 10 CHARTS LIMIT WARNING ALERT ────────────────────────────────────────── */}
      {cardCount >= 10 && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 p-3.5 rounded-2xl flex items-center gap-2.5 text-xs shadow-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            <strong>10 / 10 Charts Used:</strong> This dashboard has reached the maximum recommended chart limit.
            Create a new dashboard board tab to add more charts without slowing down performance.
          </span>
        </div>
      )}

      {/* ─── DRAGGABLE REPORT CARDS GRID ───────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2].map(i => (
            <div key={i} className="h-64 rounded-2xl bg-[var(--card)] border border-[var(--border)] animate-pulse p-5" />
          ))}
        </div>
      ) : cards.length === 0 ? (
        // Empty State with Starter Quick Actions
        <div className="bg-[var(--card)] border border-dashed border-[var(--border)] rounded-3xl p-10 text-center flex flex-col items-center justify-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)]">
            <BarChart2 className="w-6 h-6 text-[var(--primary)]" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[var(--foreground)]">No Charts in this Dashboard</h3>
            <p className="text-xs text-[var(--muted-foreground)] max-w-sm mt-1">
              Add your first custom report chart to track Room Revenue, Occupancy %, ADR, or Front Desk payments.
            </p>
          </div>
          <button
            onClick={handleOpenAddCard}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--primary)] text-white shadow-md hover:opacity-90 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Chart</span>
          </button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={cards.map(c => c.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {cards.map(card => (
                <ReportCardItem
                  key={card.id}
                  card={card}
                  onEdit={handleOpenEditCard}
                  onDelete={handleDeleteCard}
                  onDuplicate={handleDuplicateCard}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* ─── MODALS ────────────────────────────────────────────────────────────────── */}
      {activeDashboard && (
        <ReportCardModal
          isOpen={isCardModalOpen}
          onClose={() => setIsCardModalOpen(false)}
          dashboardId={activeDashboard.id}
          currentCardCount={cardCount}
          initialCard={editingCard}
          onSave={handleSaveCard}
        />
      )}

      <NewDashboardModal
        isOpen={isNewDashModalOpen}
        onClose={() => setIsNewDashModalOpen(false)}
        onCreate={handleCreateDashboard}
      />

      <DashboardShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        dashboard={activeDashboard || null}
        onUpdateVisibility={handleUpdateVisibility}
      />
    </div>
  );
};
