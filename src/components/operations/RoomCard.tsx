import React from 'react';
import {
  User,
  Key,
  LogOut,
  FileText,
  Plus,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import { Button } from '../ui/Button';
import type { OperationsBoardRoom, ReservationRecord, BookingSource } from '../../types/operations';

interface RoomCardProps {
  room: OperationsBoardRoom;
  cardSize?: 'compact' | 'mini';
  onQuickBook: (roomNumber: string) => void;
  onCheckIn: (reservationId: number) => void;
  onCheckOut: (reservationId: number) => void;
  onOpenFolio: (reservation: ReservationRecord) => void;
}

export const getBookingSourceBadge = (source?: BookingSource) => {
  switch (source) {
    case 'WALKIN':
      return { label: 'Walk-in', className: 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20' };
    case 'DIRECT':
      return { label: 'Direct Call', className: 'bg-[var(--secondary)] text-[var(--secondary-foreground)] border-[var(--border)]' };
    case 'WHATSAPP':
      return { label: 'WhatsApp', className: 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20' };
    case 'WEBSITE':
      return { label: 'Website', className: 'bg-[var(--secondary)] text-[var(--secondary-foreground)] border-[var(--border)]' };
    case 'OTHER':
    default:
      return { label: 'Direct Other', className: 'bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]' };
  }
};

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  cardSize = 'compact',
  onQuickBook,
  onCheckIn,
  onCheckOut: _onCheckOut,
  onOpenFolio
}) => {
  const isAvailable = room.computedStatus === 'AVAILABLE';
  const isReserved = room.computedStatus === 'RESERVED';
  const isOccupied = room.computedStatus === 'OCCUPIED';
  const isOOO = room.computedStatus === 'OOO';
  const res = room.activeReservation;

  const sourceBadge = getBookingSourceBadge(res?.bookingSource);

  // Status Styling Palette (strictly themed)
  const statusTheme = isAvailable
    ? {
        border: 'border-[var(--border)] hover:border-[var(--primary)]/60',
        bg: 'bg-[var(--card)]',
        badgeBg: 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20',
        badgeText: 'AVAILABLE'
      }
    : isReserved
      ? {
          border: 'border-[var(--border)] hover:border-[var(--primary)]/60',
          bg: 'bg-[var(--card)]',
          badgeBg: 'bg-[var(--secondary)] text-[var(--secondary-foreground)] border-[var(--border)]',
          badgeText: 'RESERVED'
        }
      : isOccupied
        ? {
            border: 'border-[var(--primary)]/40 hover:border-[var(--primary)]',
            bg: 'bg-[var(--card)]',
            badgeBg: 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]',
            badgeText: 'OCCUPIED'
          }
        : {
            border: 'border-[var(--border)]',
            bg: 'bg-[var(--muted)]/50',
            badgeBg: 'bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]',
            badgeText: 'MAINTENANCE'
          };

  // MINI SIZE CARD
  if (cardSize === 'mini') {
    return (
      <div
        className={cn(
          'group relative flex flex-col justify-between p-2.5 rounded-xl border transition-all duration-200 hover:shadow-md select-none',
          statusTheme.bg,
          statusTheme.border
        )}
      >
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-xs tracking-tight text-[var(--foreground)]">
              {room.roomNumber}
            </span>
            <span className={cn('px-1.5 py-0.2 text-[9px] font-bold rounded-md uppercase border leading-normal', statusTheme.badgeBg)}>
              {statusTheme.badgeText}
            </span>
          </div>
          <span className="text-[10px] font-bold text-[var(--muted-foreground)]">
            {formatCurrency(room.effectivePrice)}
          </span>
        </div>

        <div className="my-1.5 min-h-[22px]">
          {res ? (
            <div className="truncate">
              <p className="text-[11px] font-semibold text-[var(--foreground)] truncate flex items-center gap-1">
                <User className="w-3 h-3 shrink-0 text-[var(--muted-foreground)]" />
                {res.guest.fullName}
              </p>
              {res.balanceDue > 0 && (
                <p className="text-[9px] font-bold text-[var(--destructive)]">
                  Due: {formatCurrency(res.balanceDue)}
                </p>
              )}
            </div>
          ) : (
            <p className="text-[10px] text-[var(--muted-foreground)] truncate">
              {room.categoryName}
            </p>
          )}
        </div>

        {/* Action button row */}
        <div className="flex items-center justify-end gap-1 pt-1 border-t border-[var(--border)]/60">
          {isAvailable && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onQuickBook(room.roomNumber)}
              className="h-6 px-2 text-[10px] font-bold text-[var(--primary)] border-[var(--primary)]/30 hover:bg-[var(--primary)]/10 gap-1 w-full justify-center"
            >
              <Plus className="w-2.5 h-2.5" /> Book
            </Button>
          )}
          {isReserved && res && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onOpenFolio(res)}
                className="h-6 px-1.5 text-[10px]"
                title="View Folio"
              >
                <FileText className="w-2.5 h-2.5" />
              </Button>
              <Button
                size="sm"
                onClick={() => onCheckIn(res.id)}
                className="h-6 px-2 text-[10px] font-bold bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] gap-1 flex-1 justify-center"
              >
                <Key className="w-2.5 h-2.5" /> Check-In
              </Button>
            </>
          )}
          {isOccupied && res && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onOpenFolio(res)}
                className="h-6 px-1.5 text-[10px]"
                title="View Folio"
              >
                <FileText className="w-2.5 h-2.5" />
              </Button>
              <Button
                size="sm"
                onClick={() => onOpenFolio(res)}
                className="h-6 px-2 text-[10px] font-bold bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] gap-1 flex-1 justify-center"
              >
                <LogOut className="w-2.5 h-2.5" /> Check-Out
              </Button>
            </>
          )}
          {isOOO && (
            <span className="text-[10px] text-[var(--muted-foreground)] italic w-full text-center py-0.5">
              Out of Order
            </span>
          )}
        </div>
      </div>
    );
  }

  // COMPACT SIZE CARD (Default)
  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between p-3.5 rounded-2xl border transition-all duration-200 hover:shadow-lg bg-[var(--card)]',
        statusTheme.border
      )}
    >
      {/* Top row: Room Number, Status Badge & Price */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-black text-sm tracking-tight text-[var(--foreground)]">
            Room {room.roomNumber}
          </span>
          <span className={cn('px-2 py-0.5 text-[10px] font-bold rounded-full uppercase border tracking-wider', statusTheme.badgeBg)}>
            {statusTheme.badgeText}
          </span>
        </div>
        <div className="text-right">
          <p className="text-xs font-extrabold text-[var(--foreground)]">
            {formatCurrency(room.effectivePrice)}
          </p>
          <p className="text-[9px] text-[var(--muted-foreground)]">/night</p>
        </div>
      </div>

      <p className="text-[11px] font-medium text-[var(--muted-foreground)] mt-0.5">
        {room.categoryName}
      </p>

      {/* Middle row: Guest info or vacant state */}
      <div className="my-3 p-2.5 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)]/70 min-h-[64px] flex flex-col justify-center">
        {res ? (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5 truncate">
                <User className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
                <span className="truncate">{res.guest.fullName}</span>
              </span>
              <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-bold border shrink-0', sourceBadge.className)}>
                {sourceBadge.label}
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-[var(--muted-foreground)] pt-0.5">
              <span>
                {res.checkInDate} → {res.checkOutDate} ({Math.max(1, Math.round((new Date(res.checkOutDate).getTime() - new Date(res.checkInDate).getTime()) / (1000 * 60 * 60 * 24)))}N)
              </span>
              {res.balanceDue > 0 ? (
                <span className="font-bold text-[var(--destructive)]">
                  Due: {formatCurrency(res.balanceDue)}
                </span>
              ) : (
                <span className="font-semibold text-[var(--primary)]">
                  Fully Paid
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
            <span className="flex items-center gap-1.5 italic">
              <Sparkles className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
              Clean & Ready for Guest
            </span>
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="flex items-center gap-2 pt-1 border-t border-[var(--border)]/50">
        {isAvailable && (
          <Button
            size="sm"
            onClick={() => onQuickBook(room.roomNumber)}
            className="w-full h-8 text-xs font-bold bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Book Room
          </Button>
        )}

        {isReserved && res && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpenFolio(res)}
              className="h-8 px-2.5 text-xs font-semibold gap-1"
            >
              <FileText className="w-3.5 h-3.5 text-[var(--muted-foreground)]" /> Folio
            </Button>
            <Button
              size="sm"
              onClick={() => onCheckIn(res.id)}
              className="flex-1 h-8 text-xs font-bold bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] gap-1.5 shadow-sm"
            >
              <Key className="w-3.5 h-3.5" /> 1-Click Check-In
            </Button>
          </>
        )}

        {isOccupied && res && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpenFolio(res)}
              className="h-8 px-2.5 text-xs font-semibold gap-1"
            >
              <FileText className="w-3.5 h-3.5 text-[var(--muted-foreground)]" /> Folio
            </Button>
            <Button
              size="sm"
              onClick={() => onOpenFolio(res)}
              className="flex-1 h-8 text-xs font-bold bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] gap-1.5 shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" /> Check-Out
            </Button>
          </>
        )}

        {isOOO && (
          <div className="w-full flex items-center justify-center gap-1.5 text-xs text-[var(--muted-foreground)] py-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5 text-[var(--destructive)]" /> Maintenance Blocked
          </div>
        )}
      </div>
    </div>
  );
};
