import React, { useEffect } from 'react';
import {
  X,
  Pencil,
  Trash2,
  Tag,
  CheckCircle2,
  Sparkles,
  Building2,
  Layers
} from 'lucide-react';
import { Button } from '../ui/Button';
import { formatCurrency, cn } from '../../lib/utils';
import type { BackendRoom, LiveRoomStatus } from '../../types/hotel';

interface RoomDetailDrawerProps {
  room: BackendRoom | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (room: BackendRoom) => void;
  onDelete: (roomId: number, roomNumber: string) => void;
  onUpdateStatus: (roomId: number, status: LiveRoomStatus) => void;
}

export const RoomDetailDrawer: React.FC<RoomDetailDrawerProps> = ({
  room,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onUpdateStatus,
}) => {
  // ESC key listener to close drawer
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !room) return null;

  const statusConfig: Record<
    LiveRoomStatus,
    { label: string; badge: string; dot: string; description: string }
  > = {
    AVAILABLE: {
      label: 'Available',
      badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      dot: 'bg-emerald-500',
      description: 'Room is clean, vacant, and ready for immediate guest check-in.',
    },
    OCCUPIED: {
      label: 'Occupied',
      badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
      dot: 'bg-blue-500',
      description: 'Guest is currently checked in.',
    },
    CLEANING: {
      label: 'Cleaning',
      badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      dot: 'bg-amber-500',
      description: 'Housekeeping attention required before next guest arrival.',
    },
    MAINTENANCE: {
      label: 'Maintenance',
      badge: 'bg-[var(--destructive)]/10 text-[var(--destructive)] border-[var(--destructive)]/30',
      dot: 'bg-[var(--destructive)]',
      description: 'Room is out-of-order for repairs or maintenance inspection.',
    },
  };

  const currentStatus = statusConfig[room.status];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Dimmed backdrop with soft blur */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-md bg-[var(--card)] border-l border-[var(--border)] shadow-2xl h-full flex flex-col z-10 transition-transform animate-in slide-in-from-right duration-200 select-none">
        
        {/* DRAWER HEADER */}
        <div className="p-5 border-b border-[var(--border)] flex items-start justify-between bg-[var(--muted)]/20">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-2xl font-black text-[var(--foreground)] tracking-tight">
                Room #{room.roomNumber}
              </span>
              {room.customName && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Custom
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--muted-foreground)] font-medium flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>{room.buildingName || 'Main Tower'}</span>
              <span>•</span>
              <Layers className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
              <span>Floor {room.floorNumber ?? '—'} ({room.floorName})</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl border border-[var(--border)] hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            title="Close Drawer (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* DRAWER CONTENT */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          
          {/* SECTION 1: LIVE STATUS CONTROL */}
          <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[var(--foreground)] uppercase text-[10px] tracking-wider text-[var(--muted-foreground)]">
                Operational Status
              </span>
              <span
                className={cn(
                  'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5',
                  currentStatus.badge
                )}
              >
                <span className={cn('w-2 h-2 rounded-full shrink-0', currentStatus.dot)} />
                {currentStatus.label}
              </span>
            </div>

            <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
              {currentStatus.description}
            </p>

            {/* Quick 1-Click Status Toggles */}
            <div className="pt-2 border-t border-[var(--border)] grid grid-cols-2 gap-2">
              {(['AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE'] as LiveRoomStatus[]).map(st => {
                const conf = statusConfig[st];
                const isActive = room.status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => onUpdateStatus(room.id, st)}
                    className={cn(
                      'py-2 px-2.5 rounded-xl text-[11px] font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer',
                      isActive
                        ? `${conf.badge} shadow-xs scale-[1.02] ring-1 ring-current`
                        : 'bg-[var(--background)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50'
                    )}
                  >
                    <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', conf.dot)} />
                    <span>{conf.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: PRICING & CATEGORY */}
          <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-3">
            <span className="font-bold uppercase text-[10px] tracking-wider text-[var(--muted-foreground)] block">
              Pricing &amp; Category Tier
            </span>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-[var(--foreground)] flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[var(--primary)]" />
                  {room.customName || room.categoryName || 'Standard Room'}
                </p>
                <span className="text-[10px] text-[var(--muted-foreground)]">
                  {room.customName ? 'Free-hand custom configured room' : 'Assigned standard category'}
                </span>
              </div>

              <div className="text-right">
                <span className="font-mono text-base font-black text-[var(--primary)] block">
                  {formatCurrency(room.basePrice)}
                </span>
                <span className="text-[10px] text-[var(--muted-foreground)]">per night</span>
              </div>
            </div>

            {room.customPrice != null && (
              <div className="p-2.5 rounded-xl bg-[var(--primary)]/5 border border-[var(--primary)]/20 text-[11px] flex items-center justify-between">
                <span className="text-[var(--muted-foreground)] font-semibold">Custom Rate Override:</span>
                <span className="font-mono font-bold text-[var(--primary)]">
                  {formatCurrency(room.customPrice)} / night
                </span>
              </div>
            )}
          </div>

          {/* SECTION 3: INCLUDED AMENITIES */}
          <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase text-[10px] tracking-wider text-[var(--muted-foreground)]">
                Amenities &amp; Features ({room.amenities?.length || 0})
              </span>
            </div>

            {room.amenities && room.amenities.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {room.amenities.map(amenity => (
                  <span
                    key={amenity}
                    className="px-2.5 py-1 rounded-lg bg-[var(--muted)]/70 text-[11px] text-[var(--foreground)] font-medium border border-[var(--border)] flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3 text-[var(--primary)]" />
                    {amenity}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-[var(--muted-foreground)] italic">
                No custom amenities specified. Inherits standard category provisions.
              </p>
            )}
          </div>

          {/* SECTION 4: LOCATION HIERARCHY */}
          <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--muted)]/20 space-y-2">
            <span className="font-bold uppercase text-[10px] tracking-wider text-[var(--muted-foreground)] block">
              Campus Placement
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-[var(--muted-foreground)] block">Building Wing:</span>
                <span className="font-bold text-[var(--foreground)]">{room.buildingName || 'Main Tower'}</span>
              </div>
              <div>
                <span className="text-[var(--muted-foreground)] block">Elevation Level:</span>
                <span className="font-bold text-[var(--foreground)]">Floor {room.floorNumber ?? '—'} ({room.floorName})</span>
              </div>
            </div>
          </div>
        </div>

        {/* DRAWER FOOTER / ACTIONS */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--card)] flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              onDelete(room.id, room.roomNumber);
              onClose();
            }}
            className="h-9 px-3 text-xs font-bold text-[var(--destructive)] hover:bg-[var(--destructive)]/10 hover:text-[var(--destructive)] rounded-xl gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Room
          </Button>

          <Button
            type="button"
            onClick={() => {
              onEdit(room);
              onClose();
            }}
            className="h-9 px-4 text-xs font-bold bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] rounded-xl gap-1.5 shadow-xs"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit Room Details
          </Button>
        </div>
      </div>
    </div>
  );
};
