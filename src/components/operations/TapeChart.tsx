import React, { useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import type { OperationsTapeChartPayload, ReservationRecord, OperationsBoardRoom } from '../../types/operations';

interface TapeChartProps {
  tapeChart?: OperationsTapeChartPayload;
  selectedDate: string;
  onDateChange: (dateStr: string) => void;
  onSelectSlot: (roomNumber: string, checkInDate: string) => void;
  onOpenFolio: (reservation: ReservationRecord) => void;
  isLoading?: boolean;
}

interface BarPlacement {
  reservation: ReservationRecord;
  leftPercent: number;
  widthPercent: number;
  isStartsBefore: boolean;
  isEndsAfter: boolean;
  totalNights: number;
  colorClass: string;
}

export const TapeChart: React.FC<TapeChartProps> = ({
  tapeChart,
  selectedDate,
  onDateChange,
  onSelectSlot,
  onOpenFolio,
  isLoading: _isLoading
}) => {
  const rooms = tapeChart?.rooms || [];
  const reservations = tapeChart?.reservations || [];

  // Generate 7 consecutive days starting from selectedDate
  const days = useMemo(() => {
    const list: Array<{
      dateStr: string;
      dayName: string;
      dayNumAndMonth: string;
      isToday: boolean;
    }> = [];
    const [y, m, d] = selectedDate.split('-').map(Number);
    const start = new Date(y, m - 1, d);
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    for (let i = 0; i < 7; i++) {
      const current = new Date(start);
      current.setDate(start.getDate() + i);
      const yr = current.getFullYear();
      const mo = String(current.getMonth() + 1).padStart(2, '0');
      const dy = String(current.getDate()).padStart(2, '0');
      const dateStr = `${yr}-${mo}-${dy}`;

      list.push({
        dateStr,
        dayName: current.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumAndMonth: `${current.getDate()} ${current.toLocaleDateString('en-US', { month: 'short' })}`,
        isToday: dateStr === todayStr
      });
    }
    return list;
  }, [selectedDate]);

  const stepSevenDays = (delta: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d + delta * 7);
    const yr = dateObj.getFullYear();
    const mo = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dy = String(dateObj.getDate()).padStart(2, '0');
    onDateChange(`${yr}-${mo}-${dy}`);
  };

  const jumpToToday = () => {
    const today = new Date();
    const yr = today.getFullYear();
    const mo = String(today.getMonth() + 1).padStart(2, '0');
    const dy = String(today.getDate()).padStart(2, '0');
    onDateChange(`${yr}-${mo}-${dy}`);
  };

  const formatShortDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      return `${dt.getDate()} ${dt.toLocaleDateString('en-US', { month: 'short' })}`;
    } catch {
      return dateStr;
    }
  };

  const getDayOffset = (targetDateStr: string, baseDateStr: string) => {
    try {
      const cleanTarget = targetDateStr.slice(0, 10);
      const cleanBase = baseDateStr.slice(0, 10);
      const [y1, m1, d1] = cleanTarget.split('-').map(Number);
      const [y2, m2, d2] = cleanBase.split('-').map(Number);
      const t1 = Date.UTC(y1, m1 - 1, d1);
      const t2 = Date.UTC(y2, m2 - 1, d2);
      return Math.round((t1 - t2) / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  };

  const getStayNights = (inDate: string, outDate: string) => {
    try {
      const [y1, m1, d1] = inDate.slice(0, 10).split('-').map(Number);
      const [y2, m2, d2] = outDate.slice(0, 10).split('-').map(Number);
      const t1 = Date.UTC(y1, m1 - 1, d1);
      const t2 = Date.UTC(y2, m2 - 1, d2);
      return Math.max(1, Math.round((t2 - t1) / (1000 * 60 * 60 * 24)));
    } catch {
      return 1;
    }
  };

  // Group rooms by Floor
  const roomsByFloor = useMemo(() => {
    const map = new Map<number | string, OperationsBoardRoom[]>();
    rooms.forEach(rm => {
      let floorKey: number | string = rm.floorId;
      if (!floorKey) {
        const match = rm.roomNumber.match(/^(\d)/);
        floorKey = match ? parseInt(match[1]) : 1;
      }
      if (!map.has(floorKey)) {
        map.set(floorKey, []);
      }
      map.get(floorKey)!.push(rm);
    });

    const sorted = Array.from(map.entries()).sort((a, b) => Number(a[0]) - Number(b[0]));
    sorted.forEach(([_, rms]) => {
      rms.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true }));
    });
    return sorted;
  }, [rooms]);

  // Compute fractional placement for continuous tape chart bars
  const getRoomBars = (roomId: number): BarPlacement[] => {
    const roomRes = reservations.filter(
      r => r.roomId === roomId && r.status !== 'CANCELLED' && r.status !== 'NO_SHOW'
    );

    const placements: BarPlacement[] = [];
    const baseDateStr = days[0]?.dateStr;
    if (!baseDateStr) return placements;

    // Track departing and arriving reservations per day offset
    const checkOutDays = new Map<number, ReservationRecord>();
    const checkInDays = new Map<number, ReservationRecord>();
    roomRes.forEach(r => {
      const dOut = getDayOffset(r.checkOutDate.slice(0, 10), baseDateStr);
      checkOutDays.set(dOut, r);
      const dIn = getDayOffset(r.checkInDate.slice(0, 10), baseDateStr);
      checkInDays.set(dIn, r);
    });

    roomRes.forEach(res => {
      const checkInStr = res.checkInDate.slice(0, 10);
      const checkOutStr = res.checkOutDate.slice(0, 10);

      const dIn = getDayOffset(checkInStr, baseDateStr);
      const dOut = getDayOffset(checkOutStr, baseDateStr);

      // Must intersect the 7-day window [0..6]
      if (dOut < 0 || dIn > 6) return;

      const isStartsBefore = dIn < 0;
      const isEndsAfter = dOut > 6;
      const totalNights = getStayNights(checkInStr, checkOutStr);

      // Start coordinate calculation:
      let fStart: number;
      if (isStartsBefore) {
        fStart = 0;
      } else {
        // If ANOTHER guest is checking out on this day morning on this room:
        const departingOther = checkOutDays.get(dIn);
        if (departingOther && departingOther.id !== res.id) {
          fStart = dIn + 0.52; // Afternoon check-in after morning departure
        } else {
          fStart = dIn + 0.02; // No morning departure: covers day from the start!
        }
      }

      // End coordinate calculation:
      // The bar extends all the way through check-out date (dOut) so both dates are completely covered
      let fEnd: number;
      if (isEndsAfter) {
        fEnd = 7.0; // Extends flush to the right edge of the 7-day grid
      } else {
        // If ANOTHER guest is checking in on this checkout day afternoon on this room:
        const arrivingOther = checkInDays.get(dOut);
        if (arrivingOther && arrivingOther.id !== res.id) {
          fEnd = dOut + 0.45; // Morning checkout before afternoon arrival
        } else {
          // No incoming guest on that day: covers the entire date through dOut!
          fEnd = dOut + 0.98;
        }
      }

      fStart = Math.max(0, fStart);
      fEnd = Math.min(7, fEnd);

      if (fEnd <= fStart) return;

      const leftPercent = (fStart / 7) * 100;
      const widthPercent = ((fEnd - fStart) / 7) * 100;

      // Themed Reservation Bar Palette:
      let colorClass = 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs'; // Reserved
      if (res.status === 'CHECKED_IN') {
        colorClass = 'bg-[var(--accent)] text-[var(--accent-foreground)] border border-[var(--primary)]/30'; // In-House
      } else if (res.status === 'CHECKED_OUT') {
        colorClass = 'bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]'; // Departed
      }

      placements.push({
        reservation: res,
        leftPercent,
        widthPercent,
        isStartsBefore,
        isEndsAfter,
        totalNights,
        colorClass
      });
    });

    return placements;
  };

  const getTooltipText = (res: ReservationRecord) => {
    let sourceLabel = 'Direct';
    if (res.bookingSource === 'WALKIN') sourceLabel = 'Walk-in';
    else if (res.bookingSource === 'WEBSITE') sourceLabel = 'Website';
    else if (res.bookingSource === 'WHATSAPP') sourceLabel = 'WhatsApp';
    else if (res.bookingSource === 'OTHER') sourceLabel = 'Corporate';

    const startFmt = formatShortDate(res.checkInDate);
    const endFmt = formatShortDate(res.checkOutDate);
    return `${res.reservationCode}: ${res.guest.fullName} · ${sourceLabel} · ${startFmt} → ${endFmt}`;
  };

  return (
    <div className="space-y-4">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--foreground)]">
              Front-Desk Tape Chart
            </h2>
            <p className="text-xs text-[var(--muted-foreground)]">
              {days[0]?.dayNumAndMonth} — {days[6]?.dayNumAndMonth}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => stepSevenDays(-1)}
            className="h-8 px-2.5 text-xs font-semibold rounded-xl"
          >
            <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={jumpToToday}
            className="h-8 px-3 text-xs font-bold rounded-xl text-[var(--primary)]"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => stepSevenDays(1)}
            className="h-8 px-2.5 text-xs font-semibold rounded-xl"
          >
            Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>

      {/* Main Grid Card */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-x-auto shadow-xs">
        <div className="min-w-[950px]">
          {/* Header Row: Room Column + 7 Date Columns */}
          <div className="grid grid-cols-8 border-b border-[var(--border)] text-xs">
            {/* Room Column Header */}
            <div className="p-3 border-r border-[var(--border)] text-xs font-semibold text-[var(--muted-foreground)] flex items-center">
              Room
            </div>

            {/* 7 Days Columns */}
            {days.map(d => {
              const isHighlight = d.isToday;

              return (
                <div
                  key={d.dateStr}
                  onClick={() => onDateChange(d.dateStr)}
                  className={cn(
                    'p-3 text-center border-r border-[var(--border)] last:border-r-0 flex flex-col items-center justify-center cursor-pointer transition-colors select-none',
                    isHighlight
                      ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                      : 'hover:bg-[var(--muted)] text-[var(--foreground)]'
                  )}
                >
                  <span
                    className={cn(
                      'text-xs font-semibold',
                      isHighlight ? 'text-[var(--primary)] font-bold' : 'text-[var(--foreground)]'
                    )}
                  >
                    {d.dayName}
                  </span>
                  <span
                    className={cn(
                      'text-[11px] mt-0.5',
                      isHighlight ? 'text-[var(--primary)] font-bold' : 'text-[var(--muted-foreground)]'
                    )}
                  >
                    {d.dayNumAndMonth}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Room Rows Grouped By Floor */}
          {rooms.length === 0 ? (
            <div className="p-12 text-center text-xs text-[var(--muted-foreground)]">
              No rooms available to display on the tape chart.
            </div>
          ) : (
            <div>
              {roomsByFloor.map(([floorId, floorRooms]) => (
                <div key={`floor-${floorId}`}>
                  {/* Floor Header Bar */}
                  <div className="grid grid-cols-8 border-b border-[var(--border)] bg-[var(--muted)]/50">
                    <div className="col-span-8 px-4 py-1.5 text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                      FLOOR {floorId}
                    </div>
                  </div>

                  {/* Floor Room Rows */}
                  {floorRooms.map(rm => {
                    const bars = getRoomBars(rm.id);
                    const isDirty =
                      (rm.computedStatus as string) === 'DIRTY' ||
                      (rm.computedStatus as string) === 'CLEANING' ||
                      rm.computedStatus === 'OOO';

                    return (
                      <div
                        key={rm.id}
                        className="grid grid-cols-8 items-stretch border-b border-[var(--border)] hover:bg-[var(--muted)]/30 transition-colors"
                      >
                        {/* Col 1: Room Meta (Room Number, Category, Clean/Dirty Pill) */}
                        <div className="p-3 border-r border-[var(--border)] flex flex-col justify-center text-left bg-[var(--card)] z-10">
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="font-bold text-[var(--foreground)]">
                              {rm.roomNumber}
                            </span>
                            <span className="text-[var(--muted-foreground)]">·</span>
                            <span className="text-[var(--muted-foreground)] font-medium truncate">
                              {rm.categoryName}
                            </span>
                          </div>

                          <div className="mt-1.5">
                            {isDirty ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-dashed border-[var(--destructive)]/50 text-[var(--destructive)] bg-[var(--destructive)]/10">
                                <span className="w-1.5 h-1.5 rounded-full border border-[var(--destructive)] border-dashed animate-pulse" />
                                Dirty
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-[var(--primary)]/40 text-[var(--primary)] bg-[var(--primary)]/10">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                Clean
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Cols 2-8: Continuous 7-Day Track with increased height and margins */}
                        <div className="col-span-7 relative h-[68px] min-h-[68px] bg-[var(--card)]">
                          {/* Background Grid Cells */}
                          <div className="grid grid-cols-7 absolute inset-0">
                            {days.map(d => {
                              const isHighlight = d.isToday;

                              return (
                                <div
                                  key={d.dateStr}
                                  onClick={() => onSelectSlot(rm.roomNumber, d.dateStr)}
                                  className={cn(
                                    'h-full border-r border-[var(--border)] last:border-r-0 cursor-pointer transition-colors hover:bg-[var(--primary)]/5',
                                    isHighlight && 'bg-[var(--primary)]/5'
                                  )}
                                  title={`Click to book Room ${rm.roomNumber} on ${d.dateStr}`}
                                />
                              );
                            })}
                          </div>

                          {/* Foreground Stay Bars with increased height and margins */}
                          <div className="absolute inset-0 pointer-events-none">
                            {bars.map(bar => (
                              <div
                                key={bar.reservation.id}
                                onClick={e => {
                                  e.stopPropagation();
                                  onOpenFolio(bar.reservation);
                                }}
                                style={{
                                  left: `calc(${bar.leftPercent}% + 3px)`,
                                  width: `calc(${bar.widthPercent}% - 6px)`
                                }}
                                className={cn(
                                  'group absolute top-1/2 -translate-y-1/2 h-[46px] px-3.5 flex items-center select-none shadow-sm cursor-pointer pointer-events-auto transition-transform hover:scale-[1.008] hover:shadow-md z-20',
                                  bar.colorClass,
                                  bar.isStartsBefore ? 'rounded-l-none' : 'rounded-full',
                                  bar.isEndsAfter ? 'rounded-r-none' : 'rounded-full'
                                )}
                              >
                                <div className="flex items-center justify-between w-full min-w-0 gap-1.5">
                                  <span className="text-xs font-semibold truncate tracking-tight whitespace-nowrap">
                                    {bar.reservation.guest.fullName} · {bar.reservation.reservationCode}
                                  </span>

                                  {bar.totalNights > 1 && (
                                    <span className="text-[10px] font-bold opacity-90 px-1.5 py-0.5 rounded-full bg-white/20 shrink-0 hidden sm:inline-block">
                                      {bar.totalNights}N
                                    </span>
                                  )}
                                </div>

                                {/* Tooltip on Hover */}
                                <div className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 absolute right-2 top-full mt-1.5 z-50 whitespace-nowrap bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] text-[11px] font-medium px-3 py-1.5 rounded-md shadow-2xl flex items-center gap-1.5">
                                  {getTooltipText(bar.reservation)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
