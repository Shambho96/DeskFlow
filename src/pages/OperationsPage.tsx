import React, { useState, useEffect } from 'react';
import {
  Grid,
  Printer,
  Lock,
  Maximize2,
  Minimize2,
  Plus,
  CheckCircle2,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  Download,
  Coffee,
  SunMedium,
  MoonStar,
  Smartphone,
  Info,
  FileText
} from 'lucide-react';
import { useHotel } from '../context/HotelContext';
import { useModal } from '../context/ModalContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsContent } from '../components/ui/Tabs';
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
    updateRoomStatus,
    cashRegister
  } = useHotel();

  const { openFolio, openNewReservation, openShiftClose } = useModal();

  const [selectedDate, setSelectedDate] = useState('2026-09-24');
  const [activeSubTab, setActiveSubTab] = useState('schedule');
  const [isOpsExpanded, setIsOpsExpanded] = useState(false);
  const [housekeepingFloorFilter, setHousekeepingFloorFilter] = useState<string>('ALL');
  const [selectedFloor, setSelectedFloor] = useState<string>('ALL');
  const [statusPillFilter, setStatusPillFilter] = useState<string>('ALL');

  const [expandedShiftSections, setExpandedShiftSections] = useState<Record<string, boolean>>({
    breakfast: true,
    lunch: false,
    dinner: false
  });

  // Inline success notification state
  const [checkInSuccess, setCheckInSuccess] = useState<string | null>(null);

  const getRoomTypeName = (typeId: string) => roomTypes.find(rt => rt.id === typeId)?.name || 'Standard';

  // Live clock — only ticks when expanded to avoid unnecessary renders
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

  // Native browser fullscreen sync
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsOpsExpanded(false);
      } else {
        setIsOpsExpanded(true);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // ESC key handler for CSS-fallback expand mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpsExpanded && !document.fullscreenElement) {
        setIsOpsExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpsExpanded]);

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
    const base = new Date('2026-09-24');
    if (type === 'yesterday') base.setDate(base.getDate() - 1);
    if (type === 'tomorrow') base.setDate(base.getDate() + 1);
    setSelectedDate(base.toISOString().split('T')[0]);
  };

  const matchesStatusPill = (res: (typeof reservations)[0]) => {
    if (statusPillFilter === 'ALL') return true;
    if (statusPillFilter === 'ARRIVALS') return res.status === 'RESERVED';
    if (statusPillFilter === 'IN_HOUSE') return res.status === 'CHECKED_IN';
    if (statusPillFilter === 'DEPARTURES') return res.status === 'CHECKED_OUT';
    if (statusPillFilter === 'CANCELLED') return res.status === 'CANCELLED';
    if (statusPillFilter === 'DIRTY') {
      const rm = rooms.find(r => r.roomNumber === res.roomNumber);
      return rm?.status === 'DIRTY' || rm?.status === 'IN_PROGRESS';
    }
    if (statusPillFilter === 'OOO') {
      const rm = rooms.find(r => r.roomNumber === res.roomNumber);
      return rm?.status === 'OOO';
    }
    return true;
  };

  const handleCheckIn = (resId: string, isDirty: boolean, guestName: string, roomNumber: string) => {
    checkInGuest(resId);
    setCheckInSuccess(`Checked-In ${guestName} to Room ${roomNumber}${isDirty ? ' (Room is DIRTY)' : ''}`);
    setTimeout(() => setCheckInSuccess(null), 3000);
  };

  return (
    <div
      className={cn(
        'space-y-4 sm:space-y-5 text-left transition-all duration-300',
        isOpsExpanded && 'fixed inset-0 z-[9999] w-screen h-screen bg-[var(--background)] px-3 sm:px-6 pb-3 sm:pb-6 overflow-y-auto'
      )}
    >
      {/* TOP COMMAND HEADER BAR {} */}
      <div className={cn(
        'p-3.5 bg-[var(--card)] border border-[var(--border)] flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-xs sticky top-0 z-30 backdrop-blur-md',
        isOpsExpanded
          ? 'rounded-none border-x-0 border-t-0 -mx-3 sm:-mx-6 px-3 sm:px-6 py-2 sm:py-2.5'
          : 'rounded-2xl'
      )}>
        <div className="flex items-center gap-3 flex-wrap">
          {/* View Mode Icon Toggles */}
          <div className="flex items-center gap-1 bg-[var(--muted)]/60 border border-[var(--border)] rounded-xl p-1 text-xs">
            <button
              onClick={() => setActiveSubTab('schedule')}
              className={cn('p-1.5 rounded-lg transition-all', activeSubTab === 'schedule' ? 'bg-[var(--card)] text-[var(--primary)] shadow-xs font-bold' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]')}
              title="Today's Timeline View"
            >
              <Clock className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveSubTab('tapechart')}
              className={cn('p-1.5 rounded-lg transition-all', activeSubTab === 'tapechart' ? 'bg-[var(--card)] text-[var(--primary)] shadow-xs font-bold' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]')}
              title="Tape Chart Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>

          {/* Floor Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedFloor}
              onChange={e => setSelectedFloor(e.target.value)}
              className="h-9 px-3 pr-8 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-bold text-[var(--foreground)] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="ALL">All Floors</option>
              <option value="fl-1">Floor 1 (101 - 105)</option>
              <option value="fl-2">Floor 2 (201 - 205)</option>
              <option value="fl-3">Floor 3 (301 - 305)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--muted-foreground)] absolute right-2.5 top-3 pointer-events-none" />
          </div>

          {/* Live Date & Clock — visible in expanded mode */}
          {isOpsExpanded && (
            <div className="ml-2 pl-3 border-l border-[var(--border)] flex flex-col justify-center">
              <div className="text-xl font-mono font-extrabold text-[var(--primary)] leading-none tracking-tight tabular-nums">
                {formattedTime}
              </div>
              <div className="text-[10px] text-[var(--muted-foreground)] font-medium mt-0.5">
                {formattedDate}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          <DatePicker value={selectedDate} onChange={setSelectedDate} />

          <Button
            size="sm"
            onClick={() => openNewReservation()}
            className="h-9 bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] font-bold text-xs gap-1.5 shadow-md shadow-[var(--primary)]/25 rounded-xl px-4"
          >
            <Plus className="w-4 h-4" />
            <span>New Booking</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={toggleOpsExpand}
            className="h-9 w-9 rounded-xl border-[var(--border)] shrink-0 hover:bg-[var(--muted)]"
            title="Fullscreen Command View"
          >
            {isOpsExpanded ? (
              <Minimize2 className="w-4 h-4 text-[var(--primary)]" />
            ) : (
              <Maximize2 className="w-4 h-4 text-[var(--foreground)]" />
            )}
          </Button>
        </div>
      </div>

      {checkInSuccess && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-semibold shadow-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {checkInSuccess}
        </div>
      )}

      {/* TIMELINE SECTION TITLE & STATUS FILTER PILLS STRIP (EXACT MATCHING SCREENSHOT) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div>
            <h2 className="text-lg font-extrabold text-[var(--foreground)] tracking-tight flex items-center gap-2">
              Today's Timeline
              <span className="text-xs font-bold text-[var(--muted-foreground)] font-mono bg-[var(--muted)] px-2.5 py-0.5 rounded-full border border-[var(--border)]">
                {reservations.length} Bookings · {reservations.length * 2} Covers / Guests
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs font-bold rounded-xl border-[var(--border)] px-3"
              onClick={() => setExpandedShiftSections({ breakfast: true, lunch: true, dinner: true })}
            >
              Expand All
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs font-bold rounded-xl border-[var(--border)] gap-1.5 px-3"
              onClick={() => window.print()}
            >
              <Download className="w-3.5 h-3.5" /> Export
            </Button>
            <div className="inline-flex rounded-xl border border-[var(--border)] bg-[var(--muted)]/60 p-0.5 font-semibold">
              <button onClick={() => setQuickDate('today')} className="px-3 py-1 rounded-lg bg-[var(--card)] text-[var(--foreground)] font-bold shadow-xs">Today</button>
              <button onClick={() => setQuickDate('tomorrow')} className="px-3 py-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Tomorrow</button>
            </div>
          </div>
        </div>

        {/* STATUS PILLS SCROLLABLE STRIP */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          {[
            { id: 'ALL', label: 'All Operations', count: reservations.length, dot: 'bg-emerald-500' },
            { id: 'ARRIVALS', label: "Today's Arrivals", count: reservations.filter(r => r.status === 'RESERVED').length, dot: 'bg-blue-500' },
            { id: 'IN_HOUSE', label: 'In-House Guests', count: reservations.filter(r => r.status === 'CHECKED_IN').length, dot: 'bg-indigo-500' },
            { id: 'DEPARTURES', label: 'Departures', count: reservations.filter(r => r.status === 'CHECKED_OUT').length, dot: 'bg-amber-500' },
            { id: 'DIRTY', label: 'Dirty Rooms', count: rooms.filter(r => r.status === 'DIRTY' || r.status === 'IN_PROGRESS').length, dot: 'bg-rose-500' },
            { id: 'OOO', label: 'Out of Order', count: rooms.filter(r => r.status === 'OOO').length, dot: 'bg-slate-500' },
            { id: 'CANCELLED', label: 'Cancelled', count: reservations.filter(r => r.status === 'CANCELLED').length, dot: 'bg-pink-500' }
          ].map(pill => {
            const isActive = statusPillFilter === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => setStatusPillFilter(pill.id)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full border transition-all shrink-0 flex items-center gap-1.5 font-bold cursor-pointer text-xs',
                  isActive
                    ? 'bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)] shadow-xs'
                    : 'bg-[var(--card)] border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/40 hover:text-[var(--foreground)]'
                )}
              >
                <span className={cn('w-2 h-2 rounded-full shrink-0', pill.dot)} />
                <span>{pill.label}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[var(--muted)] text-[var(--foreground)] font-mono">
                  {pill.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsContent value="schedule" className="pt-2 space-y-4">
          
          {/* SHIFT GROUP 1: BREAKFAST / MORNING SHIFT (8:00 AM - 12:00 PM) */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-xs">
            <div
              onClick={() => setExpandedShiftSections(prev => ({ ...prev, breakfast: !prev.breakfast }))}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-[var(--muted)]/40 transition-colors border-b border-[var(--border)]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Coffee className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[var(--foreground)] flex items-center gap-2">
                    Breakfast Morning Shift
                    <span className="text-xs font-medium text-[var(--muted-foreground)] font-mono">(8:00 AM – 12:00 PM)</span>
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold text-[var(--foreground)]">
                <span>{reservations.length} Booking · 2 Covers</span>
                {expandedShiftSections.breakfast ? <ChevronUp className="w-4 h-4 text-[var(--muted-foreground)]" /> : <ChevronDown className="w-4 h-4 text-[var(--muted-foreground)]" />}
              </div>
            </div>

            {expandedShiftSections.breakfast && (
              <div className="overflow-x-auto -mx-0">
                <table className="w-full text-xs text-left border-collapse min-w-[640px]">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--muted)]/40 text-[var(--muted-foreground)] font-bold text-[11px]">
                      <th className="py-2.5 px-4 w-28">Time</th>
                      <th className="py-2.5 px-4">Guest</th>
                      <th className="py-2.5 px-4 text-center">Covers</th>
                      <th className="py-2.5 px-4 text-center">Table / Room</th>
                      <th className="py-2.5 px-4 text-center">Status</th>
                      <th className="py-2.5 px-4 text-right">Source / Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {reservations
                      .filter(r => (selectedFloor === 'ALL' || r.roomNumber.startsWith(selectedFloor.replace('fl-', ''))) && matchesStatusPill(r))
                      .map(res => {
                        const roomObj = rooms.find(r => r.roomNumber === res.roomNumber);
                        const isDirty = roomObj?.status === 'DIRTY';
                        return (
                          <tr key={res.id} className="hover:bg-[var(--muted)]/20 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-[var(--foreground)]">
                              {res.eta || '8:00 AM'}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 text-white font-bold flex items-center justify-center text-xs shrink-0">
                                  {res.guestName.charAt(0)}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-sm text-[var(--foreground)]">{res.guestName}</span>
                                  <span title="View Guest Notes"><FileText className="w-3.5 h-3.5 text-amber-500 cursor-pointer" /></span>
                                  <span title={`Ref: #${res.id}`}><Info className="w-3.5 h-3.5 text-[var(--muted-foreground)] cursor-pointer" /></span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center font-mono font-bold text-[var(--foreground)]">
                              {res.adults || 2}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="px-2.5 py-1 rounded-md bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/30 font-mono font-bold text-xs">
                                Room {res.roomNumber}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={cn(
                                "px-3 py-1 rounded-full font-bold text-xs border",
                                res.status === 'CHECKED_IN' ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30" :
                                res.status === 'RESERVED' ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30" :
                                res.status === 'CHECKED_OUT' ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" :
                                "bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-500/30"
                              )}>
                                {res.status === 'CHECKED_IN' ? 'In-House' : res.status === 'RESERVED' ? 'Confirmed' : res.status === 'CHECKED_OUT' ? 'Checked-Out' : 'Cancelled'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {res.status === 'CHECKED_IN' ? (
                                  <Button size="sm" variant="outline" className="h-7 text-[11px] font-bold border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-lg" onClick={() => openFolio(res)}>
                                    Folio &amp; Check-Out
                                  </Button>
                                ) : (
                                  <Button size="sm" className="h-7 text-[11px] font-bold bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] gap-1 rounded-lg" onClick={() => handleCheckIn(res.id, isDirty, res.guestName, res.roomNumber)}>
                                    <User className="w-3 h-3" /> Check-In Guest
                                  </Button>
                                )}
                                <span className="p-1.5 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-[var(--muted-foreground)]">
                                  <Smartphone className="w-3.5 h-3.5" />
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* SHIFT GROUP 2: LUNCH / AFTERNOON SHIFT (12:00 PM - 7:00 PM) */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-xs">
            <div
              onClick={() => setExpandedShiftSections(prev => ({ ...prev, lunch: !prev.lunch }))}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-[var(--muted)]/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <SunMedium className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[var(--foreground)] flex items-center gap-2">
                    Lunch Afternoon Operations
                    <span className="text-xs font-medium text-[var(--muted-foreground)] font-mono">(12:00 PM – 7:00 PM)</span>
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold text-[var(--muted-foreground)]">
                <span>0 Bookings · 0 Covers</span>
                {expandedShiftSections.lunch ? <ChevronUp className="w-4 h-4 text-[var(--muted-foreground)]" /> : <ChevronDown className="w-4 h-4 text-[var(--muted-foreground)]" />}
              </div>
            </div>
          </div>

          {/* SHIFT GROUP 3: DINNER / EVENING SHIFT (7:00 PM - 3:00 AM) */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-xs">
            <div
              onClick={() => setExpandedShiftSections(prev => ({ ...prev, dinner: !prev.dinner }))}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-[var(--muted)]/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <MoonStar className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-[var(--foreground)] flex items-center gap-2">
                    Dinner Evening Shift
                    <span className="text-xs font-medium text-[var(--muted-foreground)] font-mono">(7:00 PM – 3:00 AM)</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Shift
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold text-[var(--muted-foreground)]">
                <span>0 Bookings · 0 Covers</span>
                {expandedShiftSections.dinner ? <ChevronUp className="w-4 h-4 text-[var(--muted-foreground)]" /> : <ChevronDown className="w-4 h-4 text-[var(--muted-foreground)]" />}
              </div>
            </div>
          </div>

        </TabsContent>

        <TabsContent value="tapechart" className="pt-4">
          <Card className="overflow-hidden border-[var(--border)] shadow-sm">
            <CardHeader className="p-4 border-b border-[var(--border)] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[var(--muted)]/30">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-[var(--foreground)]">
                  <Grid className="w-4 h-4 text-[var(--primary)]" /> 7-Day Interactive Visual Tape Chart Matrix
                </CardTitle>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Click any empty cell to create a new reservation pre-filled with room &amp; dates</p>
              </div>
              <div className="flex flex-wrap gap-3 text-[10px] font-bold">
                <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Checked-In
                </span>
                <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> Confirmed
                </span>
                <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Out of Order (OOO)
                </span>
                <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
                  + Click Available Cell to Book
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-[var(--muted)] border-b border-[var(--border)] font-bold text-[11px]">
                    <th className="p-3 w-44 sticky left-0 z-20 bg-[var(--muted)] border-r border-[var(--border)] shadow-xs">Room / Floor</th>
                    {['Sep 24 (Thu)','Sep 25 (Fri)','Sep 26 (Sat)','Sep 27 (Sun)','Sep 28 (Mon)','Sep 29 (Tue)','Sep 30 (Wed)'].map((day, idx) => (
                      <th key={idx} className="p-3 text-center min-w-[130px] border-r border-[var(--border)] text-[var(--foreground)]">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {floors.map(floor => (
                    <React.Fragment key={floor.id}>
                      <tr className="bg-[var(--muted)]/50 font-bold text-[10px] text-[var(--muted-foreground)] uppercase">
                        <td colSpan={8} className="px-3 py-1.5 border-y border-[var(--border)] bg-[var(--muted)]/40 font-mono tracking-wider">{floor.name}</td>
                      </tr>
                      {rooms.filter(rm => rm.floorId === floor.id).map(rm => (
                        <tr key={rm.id} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/20 transition-colors">
                          <td className="p-3 border-r border-[var(--border)] font-bold bg-[var(--card)] sticky left-0 z-10 shadow-xs">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-mono text-xs text-[var(--foreground)]">Room {rm.roomNumber}</span>
                                <span className="block text-[10px] font-medium text-[var(--muted-foreground)]">{getRoomTypeName(rm.typeId)}</span>
                              </div>
                              <Badge variant={rm.status === 'CLEAN' ? 'clean' : 'dirty'} className="text-[9px] px-1.5 py-0">
                                {rm.status}
                              </Badge>
                            </div>
                          </td>
                          {[0,1,2,3,4,5,6].map(offset => {
                            const base = new Date('2026-09-24T00:00:00');
                            const cellDate = new Date(base); cellDate.setDate(base.getDate() + offset);
                            const coDate = new Date(base); coDate.setDate(base.getDate() + offset + 1);
                            const toISO = (d: Date) => d.toISOString().split('T')[0];
                            const matchingRes = reservations.find(r => r.roomNumber === rm.roomNumber && r.status !== 'CHECKED_OUT');
                            return (
                              <td
                                key={offset}
                                onClick={() => { if (!matchingRes) openNewReservation({ roomNumber: rm.roomNumber, checkIn: toISO(cellDate), checkOut: toISO(coDate) }); }}
                                className="p-1 border-r border-[var(--border)] h-14 relative cursor-pointer hover:bg-[var(--primary)]/10 transition-colors"
                              >
                                {rm.status === 'OOO' ? (
                                  <div className="h-full rounded-lg bg-rose-500/20 border border-rose-500/40 p-1 flex items-center justify-center text-[10px] text-rose-500 font-bold">OOO</div>
                                ) : matchingRes ? (
                                  <div
                                    onClick={e => { e.stopPropagation(); openFolio(matchingRes); }}
                                    className={`h-full rounded-lg p-2 text-white font-semibold text-[10px] flex flex-col justify-between shadow-xs transition-transform hover:scale-[1.02] ${matchingRes.status === 'CHECKED_IN' ? 'bg-emerald-600 border border-emerald-500' : 'bg-blue-600 border border-blue-500'}`}
                                  >
                                    <span className="truncate font-bold">{matchingRes.guestName}</span>
                                    <span className="text-[9px] opacity-90 font-mono">{matchingRes.source}</span>
                                  </div>
                                ) : (
                                  <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 text-[10px] text-[var(--primary)] font-bold transition-opacity">
                                    + Book
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="housekeeping" className="pt-4 space-y-4">
          {/* HOUSEKEEPING FLOOR FILTER TABS & BULK ACTIONS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mr-1">Floor Filter:</span>
              {['ALL', 'fl-1', 'fl-2', 'fl-3'].map(fl => (
                <button
                  key={fl}
                  onClick={() => setHousekeepingFloorFilter(fl)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    housekeepingFloorFilter === fl
                      ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs'
                      : 'bg-[var(--background)] border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]'
                  }`}
                >
                  {fl === 'ALL' ? 'All Floors' : `Floor ${fl.replace('fl-', '')}`}
                </button>
              ))}
            </div>

            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-bold gap-1.5 px-3 rounded-lg"
              onClick={() => {
                const targetRooms = housekeepingFloorFilter === 'ALL' ? rooms : rooms.filter(rm => rm.floorId === housekeepingFloorFilter);
                targetRooms.forEach(rm => updateRoomStatus(rm.id, 'CLEAN'));
                setCheckInSuccess(`Marked ${targetRooms.length} rooms as CLEAN!`);
                setTimeout(() => setCheckInSuccess(null), 3000);
              }}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Selected Floor Clean</span>
            </Button>
          </div>

          {/* HOUSEKEEPING ROOM CARDS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            {rooms
              .filter(rm => housekeepingFloorFilter === 'ALL' || rm.floorId === housekeepingFloorFilter)
              .map(rm => (
                <Card key={rm.id} className="hover:shadow-md transition-all text-left border-[var(--border)]">
                  <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold font-mono">Room {rm.roomNumber}</CardTitle>
                      <p className="text-xs text-[var(--muted-foreground)]">Floor {rm.floorId.replace('fl-', '')} · {getRoomTypeName(rm.typeId)}</p>
                    </div>
                    <Badge variant={rm.status === 'CLEAN' ? 'clean' : rm.status === 'DIRTY' ? 'dirty' : rm.status === 'IN_PROGRESS' ? 'progress' : 'ooo'}>{rm.status}</Badge>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-3">
                    <div className="text-xs text-[var(--muted-foreground)] flex items-center justify-between">
                      <span>Occupancy:</span>
                      <span className={`font-bold ${rm.isOccupied ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {rm.isOccupied ? 'Occupied Guest' : 'Vacant Room'}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-[var(--border)] grid grid-cols-2 gap-1.5">
                      {(['CLEAN', 'DIRTY', 'IN_PROGRESS', 'OOO'] as RoomStatus[]).map(st => (
                        <button
                          key={st}
                          onClick={() => updateRoomStatus(rm.id, st)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${rm.status === st ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs' : 'bg-[var(--background)] border-[var(--border)] hover:bg-[var(--muted)] text-[var(--foreground)]'}`}
                        >
                          Set {st}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="shift" className="pt-4">
          <Card className="max-w-3xl mx-auto text-left border-[var(--border)] shadow-sm">
            <CardHeader className="p-5 border-b border-[var(--border)] bg-[var(--muted)]/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-extrabold flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[var(--primary)]" /> Shift Cash Register Audit &amp; Handover
                </CardTitle>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  ● ACTIVE SHIFT
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">

              {/* DRAWER BALANCES GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-xs">
                  <p className="text-xs text-[var(--muted-foreground)] font-semibold">Active Receptionist On Duty</p>
                  <p className="text-lg font-bold text-[var(--foreground)] mt-1">{cashRegister.activeReceptionist}</p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/30 shadow-xs">
                  <p className="text-xs text-[var(--primary)] font-semibold">Total Cash &amp; Digital Register Value</p>
                  <p className="text-2xl font-mono font-black text-[var(--primary)] mt-1">
                    {formatCurrency(cashRegister.startingFloat + cashRegister.cashCollected + cashRegister.cardSettled + cashRegister.upiCollected)}
                  </p>
                </div>
              </div>

              {/* PAYMENT COLLECTIONS BREAKDOWN */}
              <div className="space-y-2 text-xs">
                <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Shift Payment Breakdown</p>
                <div className="flex justify-between p-3 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                  <span className="font-semibold text-[var(--foreground)]">Opening Floating Cash Base:</span>
                  <span className="font-mono font-bold text-[var(--foreground)]">{formatCurrency(cashRegister.startingFloat)}</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                  <span className="font-semibold text-emerald-600">Physical Cash Collected Today:</span>
                  <span className="font-mono font-bold text-emerald-600">{formatCurrency(cashRegister.cashCollected)}</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                  <span className="font-semibold text-blue-600">Card POS Settlements Today:</span>
                  <span className="font-mono font-bold text-blue-600">{formatCurrency(cashRegister.cardSettled)}</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                  <span className="font-semibold text-purple-600">UPI QR Payments Today:</span>
                  <span className="font-mono font-bold text-purple-600">{formatCurrency(cashRegister.upiCollected)}</span>
                </div>
              </div>

              {/* HANDOVER AUDIT CHECKLIST */}
              <div className="p-4 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] space-y-2 text-xs">
                <p className="font-bold text-[var(--foreground)]">Shift Handover Audit Checklist</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-[var(--muted-foreground)] font-semibold">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Drawer cash verified
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Keycards reconciled
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Pending folios settled
                  </span>
                </div>
              </div>

              {/* SHIFT ACTIONS */}
              <div className="pt-4 border-t border-[var(--border)] flex justify-between items-center gap-4">
                <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 rounded-xl font-bold">
                  <Printer className="w-4 h-4" /> Print Shift Audit Summary
                </Button>
                <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white font-bold gap-1.5 shadow-md rounded-xl px-5" onClick={openShiftClose}>
                  <Lock className="w-4 h-4" /> Close Shift Register
                </Button>
              </div>

            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
