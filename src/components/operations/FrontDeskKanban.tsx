import React, { useState } from 'react';
import {
  LogIn,
  LogOut,
  User,
  Phone,
  FileText,
  Key,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import { Button } from '../ui/Button';
import { getBookingSourceBadge } from './RoomCard';
import type { OperationsKanbanPayload, ReservationRecord } from '../../types/operations';

interface FrontDeskKanbanProps {
  kanban?: OperationsKanbanPayload;
  onCheckIn: (reservationId: number) => void;
  onCheckOut?: (reservationId: number) => void;
  onOpenFolio: (reservation: ReservationRecord) => void;
  isLoading?: boolean;
}

export const FrontDeskKanban: React.FC<FrontDeskKanbanProps> = ({
  kanban,
  onCheckIn,
  onOpenFolio
}) => {
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const arrivals = kanban?.arrivals || [];
  const inHouse = kanban?.inHouse || [];
  const departures = kanban?.departures || [];
  const settled = kanban?.settled || [];

  const handleDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.setData('text/plain', String(id));
    setDraggingId(id);
  };

  const handleDragOver = (e: React.DragEvent, columnKey: string) => {
    e.preventDefault();
    setDragOverCol(columnKey);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, targetColumn: 'inHouse' | 'departures' | 'settled') => {
    e.preventDefault();
    setDragOverCol(null);
    const idStr = e.dataTransfer.getData('text/plain');
    const resId = Number(idStr);
    if (!resId) return;

    if (targetColumn === 'inHouse') {
      onCheckIn(resId);
    } else if (targetColumn === 'departures' || targetColumn === 'settled') {
      const match = inHouse.find(r => r.id === resId) || departures.find(r => r.id === resId);
      if (match) {
        onOpenFolio(match);
      }
    }
    setDraggingId(null);
  };

  const renderCard = (res: ReservationRecord, columnType: 'arrivals' | 'inHouse' | 'departures' | 'settled') => {
    const sourceBadge = getBookingSourceBadge(res.bookingSource);

    return (
      <div
        key={res.id}
        draggable
        onDragStart={e => handleDragStart(e, res.id)}
        className={cn(
          'p-3.5 rounded-xl border bg-[var(--card)] shadow-xs transition-all duration-150 select-none cursor-grab active:cursor-grabbing hover:shadow-md hover:border-[var(--primary)]/50',
          draggingId === res.id && 'opacity-40 scale-95'
        )}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-black text-sm text-[var(--foreground)]">
              Room {res.roomNumber || '—'}
            </span>
            <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-bold border', sourceBadge.className)}>
              {sourceBadge.label}
            </span>
          </div>
          <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
            #{res.reservationCode}
          </span>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5 truncate">
            <User className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
            <span className="truncate">{res.guest.fullName}</span>
          </p>
          <p className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-1.5">
            <Phone className="w-3 h-3 shrink-0" />
            <span>{res.guest.phone}</span>
          </p>
        </div>

        <div className="mt-2.5 pt-2 border-t border-[var(--border)] flex items-center justify-between text-[11px]">
          <span className="text-[var(--muted-foreground)]">
            {res.checkInDate} → {res.checkOutDate}
          </span>
          {res.balanceDue > 0 ? (
            <span className="font-bold text-[var(--destructive)]">
              Due: {formatCurrency(res.balanceDue)}
            </span>
          ) : (
            <span className="font-semibold text-[var(--primary)]">
              Paid
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-3 flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onOpenFolio(res)}
            className="h-7 px-2 text-[10px] font-semibold gap-1"
          >
            <FileText className="w-3.5 h-3.5 text-[var(--muted-foreground)]" /> Folio
          </Button>

          {columnType === 'arrivals' && (
            <Button
              size="sm"
              onClick={() => onCheckIn(res.id)}
              className="flex-1 h-7 text-[10px] font-bold bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] gap-1 shadow-xs"
            >
              <Key className="w-3 h-3" /> Check-In
            </Button>
          )}

          {columnType === 'inHouse' && (
            <Button
              size="sm"
              onClick={() => onOpenFolio(res)}
              className="flex-1 h-7 text-[10px] font-bold bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] gap-1 shadow-xs"
            >
              <LogOut className="w-3 h-3" /> Check-Out
            </Button>
          )}

          {columnType === 'departures' && (
            <Button
              size="sm"
              onClick={() => onOpenFolio(res)}
              className="flex-1 h-7 text-[10px] font-bold bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] gap-1 shadow-xs"
            >
              <LogOut className="w-3 h-3" /> Settle & Depart
            </Button>
          )}

          {columnType === 'settled' && (
            <span className="text-[10px] font-bold text-[var(--primary)] flex items-center gap-1 ml-auto">
              <CheckCircle2 className="w-3.5 h-3.5" /> Checked Out
            </span>
          )}
        </div>
      </div>
    );
  };

  const columns = [
    {
      key: 'arrivals',
      title: 'Arrivals Expected',
      icon: LogIn,
      items: arrivals,
      headerClass: 'border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]',
      badgeClass: 'bg-[var(--primary)] text-[var(--primary-foreground)]',
      dropTarget: false
    },
    {
      key: 'inHouse',
      title: 'In-House Guests',
      icon: Key,
      items: inHouse,
      headerClass: 'border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]',
      badgeClass: 'bg-[var(--secondary)] text-[var(--secondary-foreground)]',
      dropTarget: true
    },
    {
      key: 'departures',
      title: 'Departures Today',
      icon: LogOut,
      items: departures,
      headerClass: 'border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]',
      badgeClass: 'bg-[var(--primary)] text-[var(--primary-foreground)]',
      dropTarget: true
    },
    {
      key: 'settled',
      title: 'Settled / Checked-Out',
      icon: CheckCircle2,
      items: settled,
      headerClass: 'border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)]',
      badgeClass: 'bg-[var(--muted)] text-[var(--foreground)]',
      dropTarget: true
    }
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[var(--primary)]" />
          Drag guests between columns to trigger instant Check-In or Folio Check-Out.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map(col => {
          const Icon = col.icon;
          const isOver = dragOverCol === col.key;

          return (
            <div
              key={col.key}
              onDragOver={col.dropTarget ? e => handleDragOver(e, col.key) : undefined}
              onDragLeave={col.dropTarget ? handleDragLeave : undefined}
              onDrop={col.dropTarget ? e => handleDrop(e, col.key as any) : undefined}
              className={cn(
                'flex flex-col rounded-2xl border bg-[var(--muted)]/40 p-3 min-h-[450px] transition-all',
                isOver ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/20 bg-[var(--primary)]/[0.04]' : 'border-[var(--border)]'
              )}
            >
              {/* Column Header */}
              <div className={cn('flex items-center justify-between p-2.5 rounded-xl border mb-3', col.headerClass)}>
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <h3 className="text-xs font-bold tracking-tight">{col.title}</h3>
                </div>
                <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-extrabold', col.badgeClass)}>
                  {col.items.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="flex-1 space-y-2.5 overflow-y-auto">
                {col.items.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center border border-dashed border-[var(--border)] rounded-xl text-center p-3 text-[var(--muted-foreground)]">
                    <p className="text-xs font-semibold">No guests</p>
                    <p className="text-[10px] mt-0.5">Nothing scheduled for today</p>
                  </div>
                ) : (
                  col.items.map(res => renderCard(res, col.key as any))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
