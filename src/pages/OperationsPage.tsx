import React, { useState, useEffect, useRef } from 'react';
import {
  BedDouble,
  Kanban,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useOperations } from '../hooks/useOperations';
import { useRooms } from '../hooks/useRooms';
import { useModal } from '../context/ModalContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import {
  OperationsHeader,
  RoomReservationBoard,
  FrontDeskKanban,
  TapeChart,
  HousekeepingHub
} from '../components/operations';

export const OperationsPage: React.FC = () => {
  // Current active operational date (defaults to today)
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });

  const [activeMainTab, setActiveMainTab] = useState<'rooms' | 'kanban' | 'tapechart' | 'housekeeping'>('rooms');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('ALL');
  const [selectedFloorId, setSelectedFloorId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cardSize, setCardSize] = useState<'compact' | 'mini'>('compact');
  const [isOpsExpanded, setIsOpsExpanded] = useState(false);
  const operationsContainerRef = useRef<HTMLDivElement>(null);

  // Notification state
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'warning' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Modals
  const { openNewReservation, openFolio, isNewReservationOpen, isFolioOpen } = useModal();

  // Hotel rooms & buildings metadata
  const { buildings, floors } = useRooms();

  // Backend Operations GraphQL Hook
  const {
    board,
    kanban,
    tapeChart,
    housekeeping,
    isLoading,
    isBoardLoading,
    checkInGuest,
    checkOutGuest,
    updateHousekeepingTask
  } = useOperations(selectedDate, selectedBuildingId, selectedFloorId);

  // Fullscreen & Expanded Mode handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      // Sync state if user pressed F11, Escape, or browser exited native fullscreen
      setIsOpsExpanded(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Pressing Escape exits expanded mode unless a modal is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpsExpanded) {
        if (isNewReservationOpen || isFolioOpen) return;
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
        setIsOpsExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpsExpanded, isNewReservationOpen, isFolioOpen]);

  const toggleOpsExpand = async () => {
    try {
      if (!isOpsExpanded && !document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
        setIsOpsExpanded(true);
      } else {
        if (document.fullscreenElement && document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setIsOpsExpanded(false);
      }
    } catch (err) {
      console.warn('Native fullscreen request error (falling back to CSS fullscreen):', err);
      setIsOpsExpanded(prev => !prev);
    }
  };

  // Quick action handlers
  const handleQuickBook = (roomNumber: string) => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}`;

    openNewReservation({
      roomNumber,
      checkIn: selectedDate,
      checkOut: nextDayStr
    });
  };

  const handleTapeChartSlotClick = (roomNumber: string, checkInDate: string) => {
    const nextDay = new Date(checkInDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}`;

    openNewReservation({
      roomNumber,
      checkIn: checkInDate,
      checkOut: nextDayStr
    });
  };

  const handleCheckIn = async (reservationId: number) => {
    try {
      await checkInGuest(reservationId);
      showNotification('Guest checked in successfully! Key issued.', 'success');
    } catch (err: any) {
      console.error('Check-in error:', err);
      showNotification(err.message || 'Failed to check in guest.', 'warning');
    }
  };

  const handleCheckOut = async (reservationId: number) => {
    try {
      await checkOutGuest(reservationId);
      showNotification('Guest checked out successfully! Room marked dirty.', 'success');
    } catch (err: any) {
      console.error('Check-out error:', err);
      showNotification(err.message || 'Failed to check out guest.', 'warning');
    }
  };

  const handleUpdateTask = async (taskId: number, status: string, notes?: string) => {
    try {
      await updateHousekeepingTask(taskId, status, notes);
      showNotification(`Housekeeping task updated to ${status}.`, 'success');
    } catch (err: any) {
      console.error('Housekeeping update error:', err);
      showNotification(err.message || 'Failed to update housekeeping task.', 'warning');
    }
  };

  return (
    <div
      ref={operationsContainerRef}
      className={isOpsExpanded
        ? 'fixed inset-0 z-[100] w-screen h-screen overflow-y-auto bg-[var(--background)] p-4 sm:p-6 lg:p-8 space-y-6'
        : 'space-y-6'
      }
    >
      {/* Toast Notification Banner */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold border transition-all animate-in fade-in slide-in-from-top-2 bg-[var(--card)] text-[var(--foreground)] ${
            notification.type === 'success'
              ? 'border-[var(--primary)] shadow-[var(--primary)]/10'
              : 'border-[var(--destructive)] shadow-[var(--destructive)]/10'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[var(--primary)] shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-[var(--destructive)] shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header with Date Navigation, Filters, Occupancy KPIs */}
      <OperationsHeader
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        buildings={buildings}
        floors={floors}
        selectedBuildingId={selectedBuildingId}
        onBuildingChange={setSelectedBuildingId}
        selectedFloorId={selectedFloorId}
        onFloorChange={setSelectedFloorId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cardSize={cardSize}
        onCardSizeChange={setCardSize}
        isExpanded={isOpsExpanded}
        onToggleExpand={toggleOpsExpand}
        onOpenNewBooking={() => openNewReservation()}
      />

      {/* Main Tab Navigation */}
      <Tabs
        value={activeMainTab}
        onValueChange={(val: string) => setActiveMainTab(val as any)}
        className="w-full"
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-1">
          <TabsList className="bg-[var(--muted)] p-1 rounded-2xl">
            <TabsTrigger
              value="rooms"
              className="rounded-xl text-xs font-bold gap-2 data-[state=active]:bg-[var(--card)] data-[state=active]:text-[var(--foreground)] data-[state=active]:shadow-xs"
            >
              <BedDouble className="w-4 h-4" />
              <span>Room Board</span>
            </TabsTrigger>

            <TabsTrigger
              value="kanban"
              className="rounded-xl text-xs font-bold gap-2 data-[state=active]:bg-[var(--card)] data-[state=active]:text-[var(--foreground)] data-[state=active]:shadow-xs"
            >
              <Kanban className="w-4 h-4" />
              <span>Front-Desk Kanban</span>
            </TabsTrigger>

            <TabsTrigger
              value="tapechart"
              className="rounded-xl text-xs font-bold gap-2 data-[state=active]:bg-[var(--card)] data-[state=active]:text-[var(--foreground)] data-[state=active]:shadow-xs"
            >
              <Calendar className="w-4 h-4" />
              <span>7-Day Tape Chart</span>
            </TabsTrigger>

            <TabsTrigger
              value="housekeeping"
              className="rounded-xl text-xs font-bold gap-2 data-[state=active]:bg-[var(--card)] data-[state=active]:text-[var(--foreground)] data-[state=active]:shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>Housekeeping Hub</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Room Reservation Board */}
        <TabsContent value="rooms" className="mt-4">
          <RoomReservationBoard
            rooms={board?.rooms || []}
            floors={floors}
            cardSize={cardSize}
            searchQuery={searchQuery}
            onQuickBook={handleQuickBook}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            onOpenFolio={openFolio}
            isLoading={isBoardLoading}
          />
        </TabsContent>

        {/* Tab 2: Front Desk Kanban */}
        <TabsContent value="kanban" className="mt-4">
          <FrontDeskKanban
            kanban={kanban}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            onOpenFolio={openFolio}
            isLoading={isLoading}
          />
        </TabsContent>

        {/* Tab 3: 7-Day Tape Chart */}
        <TabsContent value="tapechart" className="mt-4">
          <TapeChart
            tapeChart={tapeChart}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onSelectSlot={handleTapeChartSlotClick}
            onOpenFolio={openFolio}
            isLoading={isLoading}
          />
        </TabsContent>

        {/* Tab 4: Housekeeping Hub */}
        <TabsContent value="housekeeping" className="mt-4">
          <HousekeepingHub
            housekeeping={housekeeping}
            floors={floors}
            selectedFloorId={selectedFloorId}
            onFloorChange={setSelectedFloorId}
            onUpdateTask={handleUpdateTask}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
