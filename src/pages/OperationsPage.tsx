import React, { useState, useEffect, useMemo } from 'react';
import {
  Maximize2,
  Minimize2,
  Plus,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  UserCheck,
  Sparkles,
  Building2,
  Layers,
  Search,
  AlertTriangle,
  Kanban,
  BedDouble,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar
} from 'lucide-react';
import { useHotel } from '../context/HotelContext';
import { useRooms } from '../hooks/useRooms';
import { useModal } from '../context/ModalContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { cn, formatCurrency } from '../lib/utils';
import type { RoomStatus } from '../types/hotel';
import { DatePicker } from '../components/ui/DatePicker';

export const OperationsPage: React.FC = () => {
  const {
    rooms,
    floors,
    roomTypes,
    reservations,
    checkInGuest,
    checkOutGuest,
    updateRoomStatus
  } = useHotel();

  const { buildings, floors: backendFloors } = useRooms();
  const { openFolio, openNewReservation } = useModal();

  // Selected date state (defaults to September 24, 2026 to align with mock records)
  const [selectedDate, setSelectedDate] = useState('2026-09-24');
  const [activeMainTab, setActiveMainTab] = useState<'rooms' | 'kanban' | 'tapechart' | 'housekeeping'>('rooms');
  const [isOpsExpanded, setIsOpsExpanded] = useState(false);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('ALL');
  const [selectedFloor, setSelectedFloor] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [housekeepingFloorFilter, setHousekeepingFloorFilter] = useState<string>('ALL');
  const [collapsedFloors, setCollapsedFloors] = useState<Record<string, boolean>>({});

  const toggleFloorCollapse = (floorId: string) => {
    setCollapsedFloors(prev => ({
      ...prev,
      [floorId]: !prev[floorId]
    }));
  };

  // Filter for Room Reservation Board
  const [roomAvailabilityFilter, setRoomAvailabilityFilter] = useState<'ALL' | 'AVAILABLE' | 'RESERVED' | 'OCCUPIED'>('ALL');

  // Tape chart start offset (0 = starts at selectedDate)
  const [tapeChartDayOffset, setTapeChartDayOffset] = useState(0);

  // Drag and drop state for Kanban columns
  const [draggingReservationId, setDraggingReservationId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Inline notifications
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'warning' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const getRoomTypeName = (typeId: string) => roomTypes.find(rt => rt.id === typeId)?.name || 'Standard';
  const getRoomTypePrice = (typeId: string) => roomTypes.find(rt => rt.id === typeId)?.basePrice || 150;

  // Live clock in full-screen command view
  const [liveTime, setLiveTime] = useState<Date>(new Date());
  useEffect(() => {
    if (!isOpsExpanded) return;
    const tick = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, [isOpsExpanded]);

  const formattedTime = liveTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  const formattedDate = liveTime.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // Native fullscreen sync
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsOpsExpanded(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleOpsExpand = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        setIsOpsExpanded(prev => !prev);
      });
      setIsOpsExpanded(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsOpsExpanded(false);
    }
  };

  const setQuickDate = (type: 'yesterday' | 'today' | 'tomorrow') => {
    const base = new Date(2026, 8, 24); // Sep 24, 2026
    if (type === 'yesterday') base.setDate(base.getDate() - 1);
    if (type === 'tomorrow') base.setDate(base.getDate() + 1);

    const y = base.getFullYear();
    const m = String(base.getMonth() + 1).padStart(2, '0');
    const d = String(base.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${d}`);
  };

  const stepSelectedDate = (days: number) => {
    const parts = selectedDate.split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2] + days);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${day}`);
  };

  const nextDayDateStr = useMemo(() => {
    const parts = selectedDate.split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2] + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, [selectedDate]);

  // Derive buildings list from backend buildings or wing names in floors
  const buildingsList = useMemo(() => {
    if (buildings && buildings.length > 0) {
      return buildings.map(b => ({
        id: String(b.id),
        name: b.name,
        code: b.code || b.name.substring(0, 4).toUpperCase()
      }));
    }
    // Check floor names for wings
    const hasOcean = floors.some(f => f.name.includes('Ocean Wing'));
    const hasTerrace = floors.some(f => f.name.includes('Terrace Wing'));
    if (hasOcean || hasTerrace) {
      return [
        { id: 'bld-main', name: 'Main Complex', code: 'MAIN' },
        { id: 'bld-ocean', name: 'Ocean Wing', code: 'OCN' },
        { id: 'bld-terrace', name: 'Terrace Wing', code: 'TRC' }
      ];
    }
    return [{ id: 'bld-main', name: 'Main Hotel Complex', code: 'MAIN' }];
  }, [buildings, floors]);

  // Helper to map floor to its building
  const getFloorBuildingId = (floor: typeof floors[0]): string => {
    if (buildings && buildings.length > 0) {
      const bf = backendFloors?.find(bfl => String(bfl.id) === floor.id);
      if (bf?.buildingId) return String(bf.buildingId);
    }
    if (floor.name.includes('Ocean Wing')) return 'bld-ocean';
    if (floor.name.includes('Terrace Wing')) return 'bld-terrace';
    return buildingsList[0]?.id || 'bld-main';
  };

  // Determine room status for the chosen date
  const getRoomReservationState = (roomNumber: string) => {
    // Find active reservation covering selectedDate
    const res = reservations.find(r => {
      if (r.status === 'CANCELLED') return false;
      if (r.roomNumber !== roomNumber) return false;
      return selectedDate >= r.checkIn && selectedDate < r.checkOut;
    });

    if (res) {
      if (res.status === 'CHECKED_IN') {
        return { status: 'OCCUPIED' as const, reservation: res, label: 'In-House' };
      }
      return { status: 'RESERVED' as const, reservation: res, label: 'Reserved' };
    }

    // Check if room itself is marked out of order
    const rm = rooms.find(r => r.roomNumber === roomNumber);
    if (rm?.status === 'OOO') {
      return { status: 'OOO' as const, reservation: null, label: 'Out of Order' };
    }

    return { status: 'AVAILABLE' as const, reservation: null, label: 'Available' };
  };

  // Board room calculations
  const roomStatusMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getRoomReservationState>>();
    rooms.forEach(rm => {
      map.set(rm.roomNumber, getRoomReservationState(rm.roomNumber));
    });
    return map;
  }, [rooms, reservations, selectedDate]);

  // Overall Board Occupancy Stats
  const boardStats = useMemo(() => {
    let available = 0;
    let reserved = 0;
    let occupied = 0;
    let ooo = 0;

    rooms.forEach(rm => {
      const st = roomStatusMap.get(rm.roomNumber);
      if (st?.status === 'AVAILABLE') available++;
      else if (st?.status === 'RESERVED') reserved++;
      else if (st?.status === 'OCCUPIED') occupied++;
      else if (st?.status === 'OOO') ooo++;
    });

    const total = rooms.length;
    const bookedCount = reserved + occupied;
    const occupancyRate = total > 0 ? Math.round((bookedCount / total) * 100) : 0;

    return { available, reserved, occupied, ooo, total, bookedCount, occupancyRate };
  }, [rooms, roomStatusMap]);

  // Filtered rooms for the Board
  const filteredBoardRooms = useMemo(() => {
    return rooms.filter(rm => {
      // Building filter
      if (selectedBuildingId !== 'ALL') {
        const floor = floors.find(f => f.id === rm.floorId);
        if (floor && getFloorBuildingId(floor) !== selectedBuildingId) return false;
      }

      // Floor filter
      if (selectedFloor !== 'ALL' && rm.floorId !== selectedFloor) return false;

      // Availability status filter
      const st = roomStatusMap.get(rm.roomNumber);
      if (roomAvailabilityFilter === 'AVAILABLE' && st?.status !== 'AVAILABLE') return false;
      if (roomAvailabilityFilter === 'RESERVED' && st?.status !== 'RESERVED') return false;
      if (roomAvailabilityFilter === 'OCCUPIED' && st?.status !== 'OCCUPIED') return false;

      // Search query (matches room # or guest name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesRoom = rm.roomNumber.toLowerCase().includes(q);
        const matchesGuest = st?.reservation?.guestName.toLowerCase().includes(q);
        const matchesType = getRoomTypeName(rm.typeId).toLowerCase().includes(q);
        if (!matchesRoom && !matchesGuest && !matchesType) return false;
      }

      return true;
    });
  }, [rooms, floors, selectedBuildingId, selectedFloor, roomAvailabilityFilter, searchQuery, roomStatusMap]);

  // Group filtered rooms by Building, then Floor
  const buildingWiseData = useMemo(() => {
    const displayedBuildings = selectedBuildingId === 'ALL'
      ? buildingsList
      : buildingsList.filter(b => b.id === selectedBuildingId);

    return displayedBuildings.map(bld => {
      // Find floors belonging to this building
      const buildingFloors = floors.filter(fl => {
        if (getFloorBuildingId(fl) !== bld.id) return false;
        if (selectedFloor !== 'ALL' && fl.id !== selectedFloor) return false;
        return true;
      });

      const floorsWithRooms = buildingFloors.map(fl => {
        const floorRooms = filteredBoardRooms.filter(rm => rm.floorId === fl.id);
        return {
          floor: fl,
          rooms: floorRooms
        };
      }).filter(fr => fr.rooms.length > 0 || (searchQuery.trim() === '' && roomAvailabilityFilter === 'ALL'));

      const allBuildingRooms = filteredBoardRooms.filter(rm => {
        const fl = floors.find(f => f.id === rm.floorId);
        return fl && getFloorBuildingId(fl) === bld.id;
      });

      return {
        building: bld,
        floorsData: floorsWithRooms,
        totalRooms: allBuildingRooms.length
      };
    }).filter(b => b.totalRooms > 0 || (searchQuery.trim() === '' && roomAvailabilityFilter === 'ALL'));
  }, [buildingsList, selectedBuildingId, floors, selectedFloor, filteredBoardRooms, searchQuery, roomAvailabilityFilter]);

  // Daily operations reservation list for Kanban/Housekeeping
  const todayReservations = useMemo(() => {
    return reservations.filter(
      r => r.checkIn === selectedDate || r.checkOut === selectedDate || r.status === 'CHECKED_IN'
    );
  }, [reservations, selectedDate]);

  const kanbanColumns = useMemo(() => {
    const arrivals = todayReservations.filter(r => r.checkIn === selectedDate && r.status === 'RESERVED');
    const inHouse = reservations.filter(r => r.status === 'CHECKED_IN');
    const departures = todayReservations.filter(r => r.checkOut === selectedDate && r.status === 'CHECKED_IN');
    const completed = reservations.filter(r => r.status === 'CHECKED_OUT' && r.checkOut === selectedDate);

    return [
      { id: 'arrivals', title: 'Arrivals Expected', count: arrivals.length, items: arrivals, action: 'Check In' },
      { id: 'inhouse', title: 'In-House Guests', count: inHouse.length, items: inHouse, action: 'Manage Folio' },
      { id: 'departures', title: 'Departures Due', count: departures.length, items: departures, action: 'Check Out' },
      { id: 'completed', title: 'Settled Today', count: completed.length, items: completed, action: 'View Receipt' }
    ];
  }, [todayReservations, reservations, selectedDate]);

  // Handle Drag & Drop across Kanban stages
  const handleDragStart = (e: React.DragEvent, reservationId: string) => {
    e.dataTransfer.setData('text/plain', reservationId);
    setDraggingReservationId(reservationId);
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setDragOverColumn(colId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetColId: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    const reservationId = e.dataTransfer.getData('text/plain');
    if (!reservationId) return;

    const res = reservations.find(r => r.id === reservationId);
    if (!res) return;

    if (targetColId === 'inhouse' && res.status === 'RESERVED') {
      checkInGuest(reservationId);
      showNotification(`Guest ${res.guestName} successfully checked into Room ${res.roomNumber}`);
    } else if (targetColId === 'completed' && res.status === 'CHECKED_IN') {
      checkOutGuest(reservationId);
      showNotification(`Room ${res.roomNumber} checked out and marked for housekeeping`);
    } else {
      showNotification(`Transition from ${res.status} to ${targetColId} not permitted`, 'warning');
    }
    setDraggingReservationId(null);
  };

  // Tape chart 7-day date window
  const tapeDates = useMemo(() => {
    const dates: string[] = [];
    const parts = selectedDate.split('-').map(Number);
    const start = new Date(parts[0], parts[1] - 1, parts[2] + tapeChartDayOffset);

    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dates.push(`${y}-${m}-${day}`);
    }
    return dates;
  }, [selectedDate, tapeChartDayOffset]);

  // Housekeeping filtered rooms
  const housekeepingRooms = useMemo(() => {
    return rooms.filter(rm => {
      if (housekeepingFloorFilter !== 'ALL' && rm.floorId !== housekeepingFloorFilter) return false;
      return true;
    });
  }, [rooms, housekeepingFloorFilter]);

  // Export Daily Summary CSV
  const handleExportExcel = () => {
    const rows = [
      ['DeskFlow Daily Operations Report', `Date: ${selectedDate}`],
      ['Room #', 'Category', 'Floor', 'Status', 'Guest Name', 'Phone', 'Check-In', 'Check-Out', 'Total Paid', 'Balance']
    ];

    rooms.forEach(rm => {
      const fl = floors.find(f => f.id === rm.floorId)?.name || 'Floor 1';
      const type = getRoomTypeName(rm.typeId);
      const st = roomStatusMap.get(rm.roomNumber);
      const res = st?.reservation;

      rows.push([
        rm.roomNumber,
        type,
        fl,
        st?.label || 'Available',
        res?.guestName || '-',
        res?.phone || '-',
        res?.checkIn || '-',
        res?.checkOut || '-',
        res ? String(res.paidAmount) : '-',
        res ? String(res.totalAmount - res.paidAmount) : '-'
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,﻿' + rows.map(e => e.map(cell => `"${cell}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `operations_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification(`Operations report for ${selectedDate} exported!`);
  };

  return (
    <div
      className={cn(
        'space-y-4 text-left transition-all duration-300',
        isOpsExpanded && 'fixed inset-0 z-50 bg-[var(--background)] p-4 sm:p-6 overflow-y-auto'
      )}
    >
      {/* FULLSCREEN ACTIVE LIVE HUD BAR */}
      {isOpsExpanded && (
        <div className="flex items-center justify-between bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2.5 rounded-xl shadow-lg">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400" />
            </span>
            <span className="font-bold text-sm tracking-wide">DESKFLOW OPS COMMAND DECK</span>
            <span className="text-xs opacity-80 border-l border-white/20 pl-3">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-base font-black tracking-wider bg-black/20 px-3 py-1 rounded-lg">
              {formattedTime}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={toggleOpsExpand}
              className="bg-white/10 hover:bg-white/20 text-white border-white/25 h-7 text-xs font-bold rounded-lg cursor-pointer"
            >
              <Minimize2 className="w-3.5 h-3.5 mr-1" /> Exit Command View
            </Button>
          </div>
        </div>
      )}

      {/* TOP COMMAND HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
              Operations &amp; Room Management
            </h1>
            <Badge variant="outline" className="text-[10px] font-extrabold uppercase bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20">
              Live Board
            </Badge>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Real-time room occupancy, reservations, arrivals &amp; front-desk management
          </p>
        </div>

        {/* Date Controls & Action Buttons (Aligned with Dashboard standard) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Day Stepper & Quick Date Buttons */}
          <div className="flex items-center border border-[var(--border)] rounded-xl bg-[var(--card)] p-0.5 shadow-xs">
            <button
              onClick={() => stepSelectedDate(-1)}
              className="p-1.5 hover:bg-[var(--muted)] rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              title="Previous Day"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => stepSelectedDate(1)}
              className="p-1.5 hover:bg-[var(--muted)] rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              title="Next Day"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1 bg-[var(--muted)]/50 p-0.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setQuickDate('yesterday')}
              className="px-2.5 py-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
            >
              Yesterday
            </button>
            <button
              onClick={() => setQuickDate('today')}
              className={cn(
                'px-2.5 py-1 rounded-lg transition-all cursor-pointer',
                selectedDate === '2026-09-24'
                  ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs font-extrabold'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              )}
            >
              Today
            </button>
            <button
              onClick={() => setQuickDate('tomorrow')}
              className="px-2.5 py-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
            >
              Tomorrow
            </button>
          </div>

          <DatePicker value={selectedDate} onChange={setSelectedDate} />

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportExcel}
            className="h-8 px-2.5 text-xs font-bold rounded-xl border-[var(--border)] gap-1 text-[var(--foreground)] cursor-pointer shadow-xs"
            title="Download Daily Operations CSV Report"
          >
            <Download className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>

          <Button
            size="sm"
            onClick={() => openNewReservation({ checkIn: selectedDate, checkOut: nextDayDateStr })}
            className="h-8 px-3 text-xs font-bold rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Booking</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={toggleOpsExpand}
            className="h-8 w-8 rounded-xl border-[var(--border)] shrink-0 hover:bg-[var(--muted)] cursor-pointer"
            title="Toggle Fullscreen Command View"
          >
            {isOpsExpanded ? (
              <Minimize2 className="w-3.5 h-3.5 text-[var(--primary)]" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 text-[var(--foreground)]" />
            )}
          </Button>
        </div>
      </div>

      {/* Inline Notification Banner */}
      {notification && (
        <div
          className={cn(
            'p-3 rounded-xl border text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in-50 duration-200',
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
          )}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-[10px] opacity-70 hover:opacity-100 font-mono px-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* MAIN OPERATIONS VIEW TABS */}
      <Tabs
        value={activeMainTab}
        onValueChange={(val) => setActiveMainTab(val as typeof activeMainTab)}
        className="w-full space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-2">
          <TabsList className="bg-[var(--muted)]/60 p-1 rounded-xl">
            <TabsTrigger
              value="rooms"
              className="gap-2 text-xs font-bold data-[state=active]:bg-[var(--card)] data-[state=active]:text-[var(--primary)] rounded-lg transition-all"
            >
              <BedDouble className="w-4 h-4" />
              <span>Room Reservation Board</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                {rooms.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="kanban"
              className="gap-2 text-xs font-bold data-[state=active]:bg-[var(--card)] data-[state=active]:text-[var(--primary)] rounded-lg transition-all"
            >
              <Kanban className="w-4 h-4" />
              <span>Operations Kanban</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[var(--muted-foreground)]/10 text-[var(--muted-foreground)]">
                {todayReservations.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="tapechart"
              className="gap-2 text-xs font-bold data-[state=active]:bg-[var(--card)] data-[state=active]:text-[var(--primary)] rounded-lg transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>7-Day Tape Chart</span>
            </TabsTrigger>
            <TabsTrigger
              value="housekeeping"
              className="gap-2 text-xs font-bold data-[state=active]:bg-[var(--card)] data-[state=active]:text-[var(--primary)] rounded-lg transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Housekeeping Hub</span>
            </TabsTrigger>
          </TabsList>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] font-semibold self-end sm:self-auto">
            <span>Date: <strong className="text-[var(--foreground)]">{selectedDate}</strong></span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{boardStats.available} Available</span>
            <span>•</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">{boardStats.reserved} Reserved</span>
            <span>•</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">{boardStats.occupied} In-House</span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 1: ROOM RESERVATION & OCCUPANCY BOARD (BUILDING & FLOOR WISE)
            ══════════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="rooms" className="space-y-4 m-0 focus-visible:outline-none">
          {/* CONTROL STRIP: OCCUPANCY SUMMARY, FILTERS & SEARCH */}
          <Card className="border border-[var(--border)] bg-[var(--card)] shadow-xs">
            <CardContent className="p-3.5 space-y-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                {/* Left: Occupancy bar & quick numbers */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-extrabold text-[var(--foreground)] tracking-tight">
                        {boardStats.occupancyRate}%
                      </span>
                      <span className="text-xs text-[var(--muted-foreground)] font-semibold">
                        Occupied on {selectedDate}
                      </span>
                      <span className="text-[11px] font-bold text-[var(--primary)]">
                        ({boardStats.bookedCount} of {boardStats.total} Booked)
                      </span>
                    </div>
                    {/* Linear Progress Bar */}
                    <div className="w-48 sm:w-64 h-2 bg-[var(--muted)] rounded-full overflow-hidden mt-1.5 flex">
                      <div
                        className="bg-blue-500 h-full transition-all duration-300"
                        style={{ width: `${boardStats.total > 0 ? (boardStats.occupied / boardStats.total) * 100 : 0}%` }}
                        title={`${boardStats.occupied} In-House`}
                      />
                      <div
                        className="bg-amber-500 h-full transition-all duration-300"
                        style={{ width: `${boardStats.total > 0 ? (boardStats.reserved / boardStats.total) * 100 : 0}%` }}
                        title={`${boardStats.reserved} Reserved`}
                      />
                    </div>
                  </div>

                  {/* Status Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => setRoomAvailabilityFilter('ALL')}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
                        roomAvailabilityFilter === 'ALL'
                          ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs'
                          : 'bg-[var(--muted)]/60 text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                      )}
                    >
                      All ({boardStats.total})
                    </button>
                    <button
                      onClick={() => setRoomAvailabilityFilter('AVAILABLE')}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
                        roomAvailabilityFilter === 'AVAILABLE'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                      )}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Available to Book ({boardStats.available})</span>
                    </button>
                    <button
                      onClick={() => setRoomAvailabilityFilter('RESERVED')}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
                        roomAvailabilityFilter === 'RESERVED'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                      )}
                    >
                      <Clock className="w-3 h-3" />
                      <span>Reserved ({boardStats.reserved})</span>
                    </button>
                    <button
                      onClick={() => setRoomAvailabilityFilter('OCCUPIED')}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
                        roomAvailabilityFilter === 'OCCUPIED'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20'
                      )}
                    >
                      <UserCheck className="w-3 h-3" />
                      <span>In-House Occupied ({boardStats.occupied})</span>
                    </button>
                  </div>
                </div>

                {/* Right: Search box */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search room #, guest..."
                    className="w-full pl-8 pr-3 py-1.5 bg-[var(--background)] border border-[var(--input)] rounded-lg text-xs font-medium text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-xs font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Sub-Filters: Building & Floor Dropdowns */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-[var(--border)] text-xs">
                {/* Building Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[var(--primary)]" /> Building:
                  </span>
                  <div className="relative">
                    <select
                      value={selectedBuildingId}
                      onChange={(e) => setSelectedBuildingId(e.target.value)}
                      className="appearance-none bg-[var(--background)] border border-[var(--input)] hover:border-[var(--ring)] text-[var(--foreground)] text-xs font-bold rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--ring)] cursor-pointer shadow-xs transition-all"
                    >
                      <option value="ALL">All Buildings ({buildingsList.length})</option>
                      {buildingsList.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.code})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[var(--muted-foreground)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Floor Dropdown Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-[var(--primary)]" /> Floor:
                  </span>
                  <div className="relative">
                    <select
                      value={selectedFloor}
                      onChange={(e) => setSelectedFloor(e.target.value)}
                      className="appearance-none bg-[var(--background)] border border-[var(--input)] hover:border-[var(--ring)] text-[var(--foreground)] text-xs font-bold rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--ring)] cursor-pointer shadow-xs transition-all min-w-[160px]"
                    >
                      <option value="ALL">All Floors ({boardStats.total} Rooms)</option>
                      {floors.map(fl => {
                        const count = rooms.filter(r => r.floorId === fl.id).length;
                        return (
                          <option key={fl.id} value={fl.id}>
                            {fl.name} ({count} {count === 1 ? 'room' : 'rooms'})
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[var(--muted-foreground)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ROOM BOARD CONTENT: BUILDING WISE & FLOOR WISE */}
          <div className="space-y-6">
            {buildingWiseData.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-[var(--border)] rounded-2xl bg-[var(--card)]">
                <BedDouble className="w-8 h-8 mx-auto text-[var(--muted-foreground)] mb-2 opacity-50" />
                <p className="text-sm font-bold text-[var(--foreground)]">No rooms match your filter</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  Try changing your status filter, floor, or date.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setRoomAvailabilityFilter('ALL');
                    setSelectedBuildingId('ALL');
                    setSelectedFloor('ALL');
                    setSearchQuery('');
                  }}
                  className="mt-3 text-xs font-bold"
                >
                  Reset All Filters
                </Button>
              </div>
            ) : (
              buildingWiseData.map(({ building, floorsData }) => (
                <div
                  key={building.id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 overflow-hidden shadow-xs"
                >
                  {/* BUILDING HEADER BANNER */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--muted)]/40 border-b border-[var(--border)]">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-sm font-black text-[var(--foreground)] tracking-tight">
                          {building.name}
                        </h2>
                        <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
                          Code: {building.code}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-bold border-[var(--border)] bg-[var(--background)]">
                        {floorsData.reduce((acc, curr) => acc + curr.rooms.length, 0)} Rooms Shown
                      </Badge>
                    </div>
                  </div>

                  {/* FLOORS INSIDE THIS BUILDING */}
                  <div className="p-3 sm:p-4 space-y-5">
                    {floorsData.map(({ floor, rooms: floorRooms }) => {
                      const isCollapsed = !!collapsedFloors[floor.id];
                      return (
                        <div key={floor.id} className="space-y-2">
                          {/* Floor Dropdown / Accordion Header */}
                          <button
                            type="button"
                            onClick={() => toggleFloorCollapse(floor.id)}
                            className="w-full flex items-center justify-between border-b border-[var(--border)]/60 pb-1.5 hover:bg-[var(--muted)]/40 px-1 py-1 rounded-lg transition-colors cursor-pointer text-left select-none group"
                          >
                            <div className="flex items-center gap-2">
                              <ChevronDown className={cn(
                                'w-3.5 h-3.5 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-transform duration-200',
                                isCollapsed && '-rotate-90'
                              )} />
                              <Layers className="w-3.5 h-3.5 text-[var(--primary)]" />
                              <span className="text-xs font-black text-[var(--foreground)] uppercase tracking-wider">
                                {floor.name}
                              </span>
                              <span className="text-[10px] font-bold text-[var(--muted-foreground)] font-mono">
                                ({floorRooms.length} {floorRooms.length === 1 ? 'room' : 'rooms'})
                              </span>
                            </div>
                            <span className="text-[10px] font-semibold text-[var(--muted-foreground)] opacity-70 group-hover:opacity-100">
                              {isCollapsed ? 'Expand Floor ▼' : 'Collapse Floor ▲'}
                            </span>
                          </button>

                          {/* COMPACT ROOM TILES GRID */}
                          {!isCollapsed && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2.5 pt-1">
                              {floorRooms.map(rm => {
                            const st = roomStatusMap.get(rm.roomNumber);
                            const statusType = st?.status || 'AVAILABLE';
                            const activeRes = st?.reservation;

                            return (
                              <div
                                key={rm.id}
                                className={cn(
                                  'p-2.5 rounded-xl border transition-all duration-150 flex flex-col justify-between text-left group shadow-2xs hover:shadow-xs',
                                  statusType === 'AVAILABLE' && 'bg-[var(--card)] border-[var(--border)] hover:border-emerald-500/60',
                                  statusType === 'RESERVED' && 'bg-amber-500/5 border-amber-500/35 hover:border-amber-500/60',
                                  statusType === 'OCCUPIED' && 'bg-blue-500/5 border-blue-500/35 hover:border-blue-500/60',
                                  statusType === 'OOO' && 'bg-rose-500/5 border-rose-500/30 opacity-75'
                                )}
                              >
                                {/* Card Header: Room #, Category tag & Price */}
                                <div className="flex items-start justify-between gap-1 mb-1">
                                  <div>
                                    <div className="font-mono text-xs font-black text-[var(--foreground)] leading-none">
                                      #{rm.roomNumber}
                                    </div>
                                    <div className="text-[9px] font-semibold text-[var(--muted-foreground)] truncate max-w-[70px] mt-1">
                                      {getRoomTypeName(rm.typeId)}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-[10px] font-bold text-[var(--primary)] font-mono leading-none">
                                      {formatCurrency(getRoomTypePrice(rm.typeId)).replace('.00', '')}
                                    </div>
                                    <div className="text-[8px] text-[var(--muted-foreground)] uppercase">/nt</div>
                                  </div>
                                </div>

                                {/* Status & Guest Details */}
                                <div className="my-1.5 py-1 border-t border-b border-[var(--border)]/50 min-h-[38px] flex flex-col justify-center">
                                  {statusType === 'AVAILABLE' && (
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                                      <span>Ready / Vacant</span>
                                    </div>
                                  )}

                                  {statusType === 'RESERVED' && (
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                        <Clock className="w-3 h-3 shrink-0" />
                                        <span className="truncate">{activeRes?.guestName || 'Reserved'}</span>
                                      </div>
                                      <div className="text-[9px] font-mono text-[var(--muted-foreground)] truncate">
                                        {activeRes ? `${activeRes.checkIn.slice(5)} to ${activeRes.checkOut.slice(5)}` : ''}
                                      </div>
                                    </div>
                                  )}

                                  {statusType === 'OCCUPIED' && (
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                                        <UserCheck className="w-3 h-3 shrink-0" />
                                        <span className="truncate">{activeRes?.guestName || 'In-House'}</span>
                                      </div>
                                      <div className="text-[9px] font-mono text-[var(--muted-foreground)] truncate">
                                        Departs: {activeRes?.checkOut.slice(5) || ''}
                                      </div>
                                    </div>
                                  )}

                                  {statusType === 'OOO' && (
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                                      <AlertTriangle className="w-3 h-3 shrink-0" />
                                      <span className="truncate">{rm.notes || 'Out of Order'}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Compact 1-Click Action Button */}
                                <div className="mt-0.5">
                                  {statusType === 'AVAILABLE' && (
                                    <button
                                      type="button"
                                      onClick={() => openNewReservation({
                                        roomNumber: rm.roomNumber,
                                        checkIn: selectedDate,
                                        checkOut: nextDayDateStr
                                      })}
                                      className="w-full h-6 px-1.5 rounded-lg bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all shadow-2xs"
                                    >
                                      <Plus className="w-2.5 h-2.5" />
                                      <span>Reserve</span>
                                    </button>
                                  )}

                                  {statusType === 'RESERVED' && activeRes && (
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          checkInGuest(activeRes.id);
                                          showNotification(`Checked in ${activeRes.guestName} to #${rm.roomNumber}`);
                                        }}
                                        className="flex-1 h-6 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center gap-0.5 cursor-pointer shadow-2xs"
                                        title="Check In Guest"
                                      >
                                        <CheckCircle2 className="w-2.5 h-2.5" />
                                        <span>Check In</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => openFolio(activeRes)}
                                        className="h-6 px-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] text-[var(--foreground)] text-[10px] font-bold cursor-pointer"
                                        title="View Folio & Billing"
                                      >
                                        <FileText className="w-2.5 h-2.5" />
                                      </button>
                                    </div>
                                  )}

                                  {statusType === 'OCCUPIED' && activeRes && (
                                    <button
                                      type="button"
                                      onClick={() => openFolio(activeRes)}
                                      className="w-full h-6 rounded-lg border border-blue-500/40 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                                      title="View Folio & Billing"
                                    >
                                      <FileText className="w-2.5 h-2.5" />
                                      <span>Folio</span>
                                    </button>
                                  )}

                                  {statusType === 'OOO' && (
                                    <div className="h-6 flex items-center justify-center text-[9px] font-semibold text-[var(--muted-foreground)]">
                                      Maintenance
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 2: OPERATIONS KANBAN (DRAG & PROGRESS)
            ══════════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="kanban" className="space-y-4 m-0 focus-visible:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kanbanColumns.map(col => (
              <div
                key={col.id}
                onDragOver={e => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, col.id)}
                className={cn(
                  'flex flex-col rounded-2xl border bg-[var(--card)] transition-all min-h-[500px]',
                  dragOverColumn === col.id
                    ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/20 bg-[var(--primary)]/5'
                    : 'border-[var(--border)]'
                )}
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-[var(--border)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[var(--foreground)]">{col.title}</span>
                    <Badge variant="outline" className="text-[10px] font-mono font-extrabold h-5 px-1.5">
                      {col.count}
                    </Badge>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="p-2 space-y-2.5 flex-1 overflow-y-auto">
                  {col.items.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center text-[var(--muted-foreground)] text-xs border border-dashed border-[var(--border)] rounded-xl m-1">
                      <span>No guests in this stage</span>
                    </div>
                  ) : (
                    col.items.map(res => (
                      <div
                        key={res.id}
                        draggable
                        onDragStart={e => handleDragStart(e, res.id)}
                        className={cn(
                          'p-3 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/50 transition-all cursor-grab active:cursor-grabbing shadow-2xs hover:shadow-xs space-y-2',
                          draggingReservationId === res.id && 'opacity-40'
                        )}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-[var(--primary)]">
                              {res.id}
                            </span>
                            <h4 className="text-xs font-bold text-[var(--foreground)] line-clamp-1">
                              {res.guestName}
                            </h4>
                          </div>
                          <Badge variant="outline" className="text-[10px] font-mono font-extrabold">
                            #{res.roomNumber}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
                          <span>{res.roomType}</span>
                          <span className="font-mono font-bold text-[var(--foreground)]">
                            {formatCurrency(res.totalAmount)}
                          </span>
                        </div>

                        {/* Guest Meta info */}
                        <div className="flex items-center justify-between pt-1 border-t border-[var(--border)]/60 text-[10px]">
                          <span className="text-[var(--muted-foreground)]">
                            {res.checkIn.slice(5)} → {res.checkOut.slice(5)}
                          </span>
                          <div className="flex gap-1">
                            {res.status === 'RESERVED' && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  checkInGuest(res.id);
                                  showNotification(`Checked in ${res.guestName}`);
                                }}
                                className="h-6 px-2 text-[10px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                Check In
                              </Button>
                            )}
                            {res.status === 'CHECKED_IN' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  checkOutGuest(res.id);
                                  showNotification(`Checked out ${res.guestName}`);
                                }}
                                className="h-6 px-2 text-[10px] font-bold rounded-lg border-rose-500/30 text-rose-600 hover:bg-rose-500/10"
                              >
                                Check Out
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openFolio(res)}
                              className="h-6 w-6 p-0 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                              title="Open Folio"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 3: 7-DAY TAPE CHART
            ══════════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="tapechart" className="space-y-4 m-0 focus-visible:outline-none">
          <Card className="border border-[var(--border)] bg-[var(--card)] shadow-xs">
            <CardHeader className="p-4 border-b border-[var(--border)] flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-[var(--foreground)]">
                  7-Day Forward Room Tape Chart
                </CardTitle>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Continuous multi-day room schedule &amp; arrival visibility
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setTapeChartDayOffset(prev => prev - 7)}
                  className="h-7 px-2 text-xs font-bold rounded-lg"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev 7 Days
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setTapeChartDayOffset(0)}
                  className="h-7 px-2 text-xs font-bold rounded-lg"
                >
                  Current Window
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setTapeChartDayOffset(prev => prev + 7)}
                  className="h-7 px-2 text-xs font-bold rounded-lg"
                >
                  Next 7 Days <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs min-w-[700px]">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50">
                    <th className="p-3 font-bold text-[var(--foreground)] w-28 sticky left-0 bg-[var(--muted)] z-10">
                      Room
                    </th>
                    {tapeDates.map(dateStr => (
                      <th
                        key={dateStr}
                        className={cn(
                          'p-2.5 text-center font-bold border-l border-[var(--border)]',
                          dateStr === selectedDate && 'bg-[var(--primary)]/10 text-[var(--primary)]'
                        )}
                      >
                        <div className="text-[10px] text-[var(--muted-foreground)]">
                          {new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className="font-mono text-xs">{dateStr.slice(5)}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rooms.map(rm => (
                    <tr key={rm.id} className="border-b border-[var(--border)]/70 hover:bg-[var(--muted)]/30">
                      <td className="p-2.5 font-bold font-mono sticky left-0 bg-[var(--card)] z-10 border-r border-[var(--border)]">
                        #{rm.roomNumber}
                        <span className="block text-[9px] font-sans font-normal text-[var(--muted-foreground)] truncate max-w-[90px]">
                          {getRoomTypeName(rm.typeId)}
                        </span>
                      </td>
                      {tapeDates.map(dateStr => {
                        const matchingRes = reservations.find(
                          r => r.roomNumber === rm.roomNumber &&
                               r.status !== 'CANCELLED' &&
                               dateStr >= r.checkIn &&
                               dateStr < r.checkOut
                        );

                        return (
                          <td
                            key={dateStr}
                            className="p-1 border-l border-[var(--border)]/70 text-center relative h-12"
                          >
                            {matchingRes ? (
                              <button
                                onClick={() => openFolio(matchingRes)}
                                className={cn(
                                  'w-full h-full rounded-md px-1 py-0.5 text-[10px] font-bold text-left truncate flex flex-col justify-center cursor-pointer transition-all',
                                  matchingRes.status === 'CHECKED_IN'
                                    ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/40'
                                    : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40'
                                )}
                                title={`${matchingRes.guestName} (${matchingRes.checkIn} to ${matchingRes.checkOut})`}
                              >
                                <span className="truncate">{matchingRes.guestName}</span>
                                <span className="text-[8px] font-mono opacity-70">
                                  {matchingRes.status === 'CHECKED_IN' ? 'In-House' : 'Reserved'}
                                </span>
                              </button>
                            ) : (
                              <button
                                onClick={() => openNewReservation({
                                  roomNumber: rm.roomNumber,
                                  checkIn: dateStr
                                })}
                                className="w-full h-full hover:bg-emerald-500/10 rounded text-[9px] text-emerald-600/50 hover:text-emerald-600 font-bold flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                                title={`Book Room ${rm.roomNumber} for ${dateStr}`}
                              >
                                + Book
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 4: HOUSEKEEPING HUB
            ══════════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="housekeeping" className="space-y-4 m-0 focus-visible:outline-none">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--muted-foreground)]">Filter Floor:</span>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant={housekeepingFloorFilter === 'ALL' ? 'default' : 'outline'}
                  onClick={() => setHousekeepingFloorFilter('ALL')}
                  className="h-7 text-xs font-bold rounded-lg"
                >
                  All
                </Button>
                {floors.map(fl => (
                  <Button
                    key={fl.id}
                    size="sm"
                    variant={housekeepingFloorFilter === fl.id ? 'default' : 'outline'}
                    onClick={() => setHousekeepingFloorFilter(fl.id)}
                    className="h-7 text-xs font-bold rounded-lg"
                  >
                    {fl.name}
                  </Button>
                ))}
              </div>
            </div>
            <div className="text-xs text-[var(--muted-foreground)] font-semibold">
              Showing {housekeepingRooms.length} rooms
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {housekeepingRooms.map(rm => (
              <div
                key={rm.id}
                className="p-3 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-black text-[var(--foreground)]">
                    #{rm.roomNumber}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] font-bold uppercase',
                      rm.status === 'CLEAN' && 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
                      rm.status === 'DIRTY' && 'bg-rose-500/10 text-rose-600 border-rose-500/20',
                      rm.status === 'IN_PROGRESS' && 'bg-amber-500/10 text-amber-600 border-amber-500/20',
                      rm.status === 'OOO' && 'bg-gray-500/10 text-gray-600 border-gray-500/20'
                    )}
                  >
                    {rm.status}
                  </Badge>
                </div>
                <div className="text-[11px] text-[var(--muted-foreground)] flex items-center justify-between">
                  <span>{getRoomTypeName(rm.typeId)}</span>
                  <span>{rm.isOccupied ? 'Occupied' : 'Vacant'}</span>
                </div>
                <div className="pt-2 border-t border-[var(--border)] flex gap-1">
                  {(['CLEAN', 'DIRTY', 'IN_PROGRESS', 'OOO'] as RoomStatus[]).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        updateRoomStatus(rm.id, st);
                        showNotification(`Room ${rm.roomNumber} status set to ${st}`);
                      }}
                      className={cn(
                        'flex-1 py-1 text-[9px] font-bold rounded border cursor-pointer transition-colors',
                        rm.status === st
                          ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-transparent'
                          : 'border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                      )}
                    >
                      {st === 'IN_PROGRESS' ? 'CLEANING' : st}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
