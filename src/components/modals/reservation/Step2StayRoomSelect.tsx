import React from 'react';
import { cn, formatCurrency } from '../../../lib/utils';
import { Input } from '../../ui/Input';

export interface RoomCategoryOption {
  id: number;
  name: string;
  code?: string | null;
  basePrice: number;
  maxAdults: number;
  maxChildren: number;
  amenities?: string[];
  isActive?: boolean;
}

export interface RoomUnitOption {
  id: number;
  roomNumber: string;
  categoryId?: number | null;
  categoryName?: string;
}

interface Step2StayRoomSelectProps {
  checkIn: string;
  checkOut: string;
  nights: number;
  onCheckInChange: (val: string) => void;
  onCheckOutChange: (val: string) => void;
  onSetStayNights: (n: number) => void;
  adults: number;
  setAdults: (val: number) => void;
  children: number;
  setChildren: (val: number) => void;
  activeCategories: RoomCategoryOption[];
  selectedCategoryId: number;
  onSelectCategoryId: (id: number) => void;
  allRooms: RoomUnitOption[];
  selectedRoomNumber: string;
  onSelectRoomNumber: (num: string) => void;
  getRoomAvailability: (roomId: number) => { isAvailable: boolean; reason: string };
}

export const Step2StayRoomSelect: React.FC<Step2StayRoomSelectProps> = ({
  checkIn,
  checkOut,
  nights,
  onCheckInChange,
  onCheckOutChange,
  onSetStayNights,
  adults,
  setAdults,
  children,
  setChildren,
  activeCategories,
  selectedCategoryId,
  onSelectCategoryId,
  allRooms,
  selectedRoomNumber,
  onSelectRoomNumber,
  getRoomAvailability,
}) => {
  return (
    <div className="space-y-4 text-left">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">
            Check-in Date
          </label>
          <Input
            type="date"
            value={checkIn}
            onChange={e => onCheckInChange(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">
            Check-out Date ({nights} Nights)
          </label>
          <Input
            type="date"
            value={checkOut}
            onChange={e => onCheckOutChange(e.target.value)}
          />
        </div>
      </div>

      {/* Quick Duration Pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] font-semibold text-[var(--muted-foreground)] mr-1">Quick Stay:</span>
        {[1, 2, 3, 5, 7].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onSetStayNights(n)}
            className={cn(
              'px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer',
              nights === n
                ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs'
                : 'bg-[var(--muted)]/60 text-[var(--muted-foreground)] hover:text-[var(--foreground)] border-[var(--border)]'
            )}
          >
            {n} Night{n > 1 ? 's' : ''}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">
            Adults Count
          </label>
          <Input
            type="number"
            min={1}
            max={4}
            value={adults}
            onChange={e => setAdults(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">
            Children Count
          </label>
          <Input
            type="number"
            min={0}
            max={3}
            value={children}
            onChange={e => setChildren(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Room Category Cards */}
      <div>
        <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-2">
          Select Room Category
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {activeCategories.map(cat => (
            <div
              key={cat.id}
              onClick={() => onSelectCategoryId(cat.id)}
              className={cn(
                'p-3 rounded-xl border cursor-pointer transition-all',
                selectedCategoryId === cat.id
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]'
                  : 'border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)]/50'
              )}
            >
              <p className="text-xs font-bold text-[var(--foreground)]">{cat.name}</p>
              <p className="text-xs font-extrabold text-[var(--primary)] mt-1">
                {formatCurrency(cat.basePrice)} <span className="text-[10px] text-[var(--muted-foreground)] font-normal">/night</span>
              </p>
              <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">
                Max: {cat.maxAdults}A {cat.maxChildren}C
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Room Selection with Live Date Availability */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-[var(--muted-foreground)]">
            Assign Room ({nights} Night{nights > 1 ? 's' : ''}: {checkIn} → {checkOut})
          </label>
          <span className="text-[11px] font-bold text-[var(--primary)]">
            {allRooms.filter(r => getRoomAvailability(r.id).isAvailable).length} of {allRooms.length} Available
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {allRooms.map(rm => {
            const avail = getRoomAvailability(rm.id);
            const isSelected = selectedRoomNumber === rm.roomNumber;
            const isMatchCat = rm.categoryId === selectedCategoryId;

            return (
              <button
                key={rm.id}
                type="button"
                disabled={!avail.isAvailable}
                onClick={() => {
                  if (avail.isAvailable) onSelectRoomNumber(rm.roomNumber);
                }}
                className={cn(
                  'p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between min-h-[58px]',
                  isSelected
                    ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm ring-2 ring-[var(--primary)]/30'
                    : avail.isAvailable
                      ? isMatchCat
                        ? 'bg-[var(--primary)]/10 border-[var(--primary)]/40 text-[var(--foreground)] hover:bg-[var(--primary)]/20 cursor-pointer'
                        : 'bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]/50 cursor-pointer'
                      : 'bg-[var(--muted)]/40 border-[var(--border)] text-[var(--muted-foreground)] opacity-50 cursor-not-allowed'
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold">Room {rm.roomNumber}</span>
                  <span className="text-[9px] font-medium opacity-80">{rm.categoryName}</span>
                </div>
                <div className="text-[10px] font-semibold mt-1">
                  {avail.isAvailable ? (
                    <span className={isSelected ? 'text-white' : 'text-[var(--primary)]'}>
                      ✓ Available ({nights}N)
                    </span>
                  ) : (
                    <span className="text-[var(--destructive)] truncate">
                      ✕ {avail.reason}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
