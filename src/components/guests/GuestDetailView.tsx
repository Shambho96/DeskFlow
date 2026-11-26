import React from 'react';
import {
  Award,
  CalendarDays,
  Clock,
  CreditCard,
  Mail,
  Phone,
  Plus,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { PhoneNumberDisplay } from '../ui/PhoneNumberDisplay';
import { GuestDetailSkeleton } from '../skeletons';
import { cn, formatCurrency } from '../../lib/utils';
import { getGuestTierStyle } from './guestTierUtils';
import type { GuestCRMItem, GuestStayHistory } from '../../types/crm';

interface GuestDetailViewProps {
  selectedGuest: GuestCRMItem | null;
  stays: GuestStayHistory[];
  isLoading: boolean;
  onClose: () => void;
  onNewBooking: (params: { guestName: string; phone: string }) => void;
  onOpenFolio: (params: { id: number }) => void;
}

export const GuestDetailView: React.FC<GuestDetailViewProps> = ({
  selectedGuest,
  stays,
  isLoading,
  onClose,
  onNewBooking,
  onOpenFolio,
}) => {
  return (
    <div
      className={cn(
        'lg:col-span-8 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 sm:p-6 flex flex-col space-y-4 sm:space-y-6 shadow-sm',
        !selectedGuest && !isLoading ? 'hidden lg:flex' : 'flex'
      )}
    >
      {isLoading ? (
        <GuestDetailSkeleton />
      ) : selectedGuest ? (
        <>
          {/* TOP BANNER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl p-0.5 border-2 border-[var(--primary)] shadow-md shrink-0">
                <img
                  src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(selectedGuest.fullName)}`}
                  alt={selectedGuest.fullName}
                  className="w-full h-full rounded-2xl bg-[var(--muted)] object-cover"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-2xl font-black text-[var(--foreground)] tracking-tight">
                    {selectedGuest.fullName}
                  </h2>
                  <span
                    className={cn(
                      'px-2.5 py-0.5 rounded-full text-[10px] font-black border flex items-center gap-1',
                      getGuestTierStyle(selectedGuest).color
                    )}
                  >
                    <Award className="w-3 h-3" /> {getGuestTierStyle(selectedGuest).name.toUpperCase()}
                  </span>
                  {selectedGuest.tags &&
                    selectedGuest.tags.length > 0 &&
                    selectedGuest.tags.map(tag => (
                      <span
                        key={tag}
                        className={cn(
                          'px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border',
                          tag.toLowerCase() === 'vip'
                            ? 'bg-[var(--primary)]/15 text-[var(--primary)] border-[var(--primary)]/30'
                            : tag.toLowerCase() === 'returning'
                            ? 'bg-[var(--secondary)] text-[var(--secondary-foreground)] border-[var(--border)]'
                            : tag.toLowerCase() === 'late check-out'
                            ? 'bg-[var(--muted)] text-[var(--foreground)] border-[var(--border)]'
                            : tag.toLowerCase() === 'allergic'
                            ? 'bg-[var(--destructive)]/15 text-[var(--destructive)] border-[var(--destructive)]/30'
                            : 'bg-[var(--muted)] text-[var(--foreground)] border-[var(--border)]'
                        )}
                      >
                        {tag}
                      </span>
                    ))}
                </div>

                <p className="text-xs text-[var(--muted-foreground)] font-mono flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
                  <PhoneNumberDisplay
                    value={selectedGuest.phone}
                    className="font-semibold text-[var(--foreground)]"
                  />
                  <span>•</span>
                  <Mail className="w-3.5 h-3.5 text-[var(--muted-foreground)] shrink-0" />
                  <span>{selectedGuest.email || 'No email attached'}</span>
                </p>
              </div>
            </div>

            {/* Actions Header Buttons */}
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="h-9 rounded-xl border-[var(--border)] text-xs font-bold gap-1 hover:bg-[var(--muted)] cursor-pointer"
              >
                <X className="w-4 h-4 text-[var(--muted-foreground)]" />
                <span className="hidden sm:inline">Close</span>
              </Button>

              <Button
                size="sm"
                onClick={() =>
                  onNewBooking({
                    guestName: selectedGuest.fullName,
                    phone: selectedGuest.phone,
                  })
                }
                className="h-9 bg-[var(--primary)] hover:opacity-90 text-white font-extrabold text-xs rounded-xl px-4 gap-1.5 shadow-lg shadow-[var(--primary)]/25 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Booking</span>
              </Button>
            </div>
          </div>

          {/* 4 STAT CARDS ROW */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="border-[var(--border)] bg-[var(--background)]/80 p-4 rounded-2xl space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--muted-foreground)] block">
                  TIER
                </span>
                <span className="text-lg font-black text-[var(--primary)] block mt-0.5">
                  {getGuestTierStyle(selectedGuest).name}
                </span>
                <span className="text-[10px] text-[var(--muted-foreground)] mt-1 block font-semibold">
                  Configured tier
                </span>
              </div>
            </Card>

            <Card className="border-[var(--border)] bg-[var(--background)]/80 p-4 rounded-2xl space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-[var(--muted)] text-[var(--foreground)] flex items-center justify-center">
                  <CalendarDays className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--muted-foreground)] block">
                  RESERVATIONS
                </span>
                <span className="text-xl font-mono font-black text-[var(--foreground)] block mt-0.5">
                  {selectedGuest.totalStays}
                </span>
              </div>
            </Card>

            <Card className="border-[var(--border)] bg-[var(--background)]/80 p-4 rounded-2xl space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--muted-foreground)] block">
                  LIFETIME SPEND
                </span>
                <span className="text-xl font-mono font-black text-[var(--foreground)] block mt-0.5">
                  {formatCurrency(selectedGuest.totalSpend)}
                </span>
              </div>
            </Card>

            <Card className="border-[var(--border)] bg-[var(--background)]/80 p-4 rounded-2xl space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-[var(--muted)] text-[var(--muted-foreground)] flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--muted-foreground)] block">
                  LAST VISIT
                </span>
                <span className="text-sm font-mono font-bold text-[var(--foreground)] block mt-1 truncate">
                  {selectedGuest.lastVisitDate ? new Date(selectedGuest.lastVisitDate).toLocaleDateString() : '—'}
                </span>
              </div>
            </Card>
          </div>

          {/* RESERVATION HISTORY PANEL */}
          <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-4 space-y-4 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[var(--primary)]" />
                <h3 className="font-extrabold text-sm text-[var(--foreground)]">Reservation History</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]">
                  {stays.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {selectedGuest.idNumber && (
                  <span className="text-xs font-mono font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                    {selectedGuest.idVerified ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                    ) : (
                      <ShieldAlert className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                    )}
                    {selectedGuest.idType}: {selectedGuest.idNumber}
                  </span>
                )}
              </div>
            </div>

            {/* History Item Rows */}
            <div className="space-y-2.5">
              {stays.length === 0 ? (
                <div className="p-6 text-center text-xs text-[var(--muted-foreground)]">
                  No reservation records at this outlet yet.
                </div>
              ) : (
                stays.map(history => (
                  <div
                    key={history.reservationId}
                    className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--card)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[var(--primary)]/40 transition-all shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-xs font-mono font-bold text-[var(--foreground)]">
                        <div>{history.checkInDate}</div>
                        <div className="text-[10px] text-[var(--muted-foreground)]">→ {history.checkOutDate}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[var(--muted-foreground)] flex items-center gap-1 font-mono bg-[var(--muted)]/60 px-2 py-1 rounded-lg">
                          <Users className="w-3 h-3 text-[var(--primary)]" /> {history.adultsCount}
                        </span>
                        <span className="text-xs font-mono font-bold text-[var(--foreground)] bg-[var(--muted)]/60 px-2 py-1 rounded-lg">
                          Room {history.roomNumber} ({history.categoryName})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <span className="text-xs font-mono font-black text-[var(--foreground)]">
                        {formatCurrency(history.totalAmount)}
                      </span>

                      <Badge
                        variant={
                          history.status === 'CHECKED_IN'
                            ? 'clean'
                            : history.status === 'CANCELLED'
                            ? 'dirty'
                            : 'secondary'
                        }
                        className="text-[10px] px-2.5 py-0.5 font-bold uppercase"
                      >
                        {history.status}
                      </Badge>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onOpenFolio({ id: history.reservationId })}
                        className="h-7 px-2 text-xs font-bold text-[var(--primary)] hover:bg-[var(--primary)]/10 cursor-pointer"
                      >
                        Folio
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
          <Users className="w-12 h-12 text-[var(--muted-foreground)] opacity-40 animate-pulse" />
          <h3 className="text-base font-extrabold text-[var(--foreground)]">No Guest Profile Selected</h3>
          <p className="text-xs text-[var(--muted-foreground)] max-w-sm">
            Select any guest from the directory panel on the left to view their tier rewards, contact cards, and full stay history.
          </p>
        </div>
      )}
    </div>
  );
};
