import React, { useState, useMemo } from 'react';
import {
  Layers,
  ChevronDown,
  ChevronRight,
  BedDouble
} from 'lucide-react';
import { Button } from '../ui/Button';
import { RoomCard } from './RoomCard';
import { cn } from '../../lib/utils';
import type { OperationsBoardRoom, ReservationRecord } from '../../types/operations';

interface RoomReservationBoardProps {
  rooms: OperationsBoardRoom[];
  floors: Array<{ id: number; name: string; floorNumber?: number | null }>;
  cardSize: 'compact' | 'mini';
  searchQuery: string;
  onQuickBook: (roomNumber: string) => void;
  onCheckIn: (reservationId: number) => void;
  onCheckOut: (reservationId: number) => void;
  onOpenFolio: (reservation: ReservationRecord) => void;
  isLoading?: boolean;
}

export const RoomReservationBoard: React.FC<RoomReservationBoardProps> = ({
  rooms,
  floors,
  cardSize,
  searchQuery,
  onQuickBook,
  onCheckIn,
  onCheckOut,
  onOpenFolio,
  isLoading
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'RESERVED' | 'OCCUPIED'>('ALL');
  const [collapsedFloors, setCollapsedFloors] = useState<Record<string, boolean>>({});

  const toggleFloor = (floorKey: string) => {
    setCollapsedFloors(prev => ({
      ...prev,
      [floorKey]: !prev[floorKey]
    }));
  };

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter(rm => {
      // 1. Status Filter
      if (statusFilter !== 'ALL' && rm.computedStatus !== statusFilter) {
        return false;
      }
      // 2. Search Query (matches roomNumber or guestName)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesRoom = rm.roomNumber.toLowerCase().includes(query);
        const matchesGuest = rm.activeReservation?.guest?.fullName.toLowerCase().includes(query);
        const matchesCategory = rm.categoryName.toLowerCase().includes(query);
        if (!matchesRoom && !matchesGuest && !matchesCategory) return false;
      }
      return true;
    });
  }, [rooms, statusFilter, searchQuery]);

  // Group rooms by Floor
  const groupedByFloor = useMemo(() => {
    const groups: Record<string, { floorName: string; rooms: OperationsBoardRoom[] }> = {};

    // Initialize with existing floors
    floors.forEach(f => {
      groups[String(f.id)] = {
        floorName: f.name || `Floor ${f.floorNumber || f.id}`,
        rooms: []
      };
    });

    // Bucket filtered rooms
    filteredRooms.forEach(rm => {
      const key = String(rm.floorId || 'default');
      if (!groups[key]) {
        groups[key] = {
          floorName: `Floor ${key}`,
          rooms: []
        };
      }
      groups[key].rooms.push(rm);
    });

    // Filter out floors with 0 rooms if there is a search or status filter active
    if (searchQuery.trim() || statusFilter !== 'ALL') {
      const activeGroups: Record<string, { floorName: string; rooms: OperationsBoardRoom[] }> = {};
      Object.entries(groups).forEach(([key, val]) => {
        if (val.rooms.length > 0) activeGroups[key] = val;
      });
      return activeGroups;
    }

    return groups;
  }, [floors, filteredRooms, searchQuery, statusFilter]);

  if (isLoading && rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] rounded-2xl bg-[var(--card)] border border-[var(--border)] p-8">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin mb-3" />
        <p className="text-sm font-semibold text-[var(--muted-foreground)]">Loading Room Operations Board...</p>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] rounded-2xl bg-[var(--card)] border border-[var(--border)] p-8 text-center">
        <BedDouble className="w-12 h-12 text-[var(--muted-foreground)]/50 mb-3" />
        <h3 className="text-base font-bold text-[var(--foreground)]">No Rooms Found</h3>
        <p className="text-xs text-[var(--muted-foreground)] max-w-sm mt-1 mb-4">
          There are no rooms matching the selected building/floor filters or configured in the database.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sub-bar: Status Filter Pills */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-xs font-bold">
          {(['ALL', 'AVAILABLE', 'RESERVED', 'OCCUPIED'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={cn(
                'px-3 py-1 rounded-lg transition-all',
                statusFilter === tab
                  ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              )}
            >
              {tab === 'ALL' && 'All Statuses'}
              {tab === 'AVAILABLE' && 'Vacant / Ready'}
              {tab === 'RESERVED' && 'Arrivals Expected'}
              {tab === 'OCCUPIED' && 'In-House'}
            </button>
          ))}
        </div>

        <p className="text-xs font-semibold text-[var(--muted-foreground)]">
          Showing {filteredRooms.length} of {rooms.length} Rooms
        </p>
      </div>

      {/* Floor Sections */}
      <div className="space-y-4">
        {Object.entries(groupedByFloor).map(([floorKey, group]) => {
          const isCollapsed = !!collapsedFloors[floorKey];
          const floorRooms = group.rooms;
          const availCount = floorRooms.filter(r => r.computedStatus === 'AVAILABLE').length;
          const occupiedCount = floorRooms.filter(r => r.computedStatus === 'OCCUPIED').length;
          const reservedCount = floorRooms.filter(r => r.computedStatus === 'RESERVED').length;

          return (
            <div
              key={floorKey}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-xs"
            >
              {/* Floor Header Bar */}
              <div
                onClick={() => toggleFloor(floorKey)}
                className="flex items-center justify-between p-3.5 bg-[var(--muted)]/50 hover:bg-[var(--muted)] cursor-pointer transition-colors select-none"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--primary)]">
                    <Layers className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
                      {group.floorName}
                      <span className="text-[10px] font-normal text-[var(--muted-foreground)]">
                        ({floorRooms.length} rooms)
                      </span>
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold">
                    <span className="px-2 py-0.5 rounded-md bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/30">
                      {availCount} Available
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[var(--secondary)] text-[var(--secondary-foreground)] border border-[var(--border)]">
                      {reservedCount} Reserved
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)]">
                      {occupiedCount} Occupied
                    </span>
                  </div>

                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Floor Rooms Grid */}
              {!isCollapsed && (
                <div className="p-4">
                  {floorRooms.length === 0 ? (
                    <p className="text-xs text-[var(--muted-foreground)] italic py-2">
                      No rooms on this floor match the filter criteria.
                    </p>
                  ) : (
                    <div
                      className={cn(
                        'grid gap-3',
                        cardSize === 'mini'
                          ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8'
                          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                      )}
                    >
                      {floorRooms.map(rm => (
                        <RoomCard
                          key={rm.id}
                          room={rm}
                          cardSize={cardSize}
                          onQuickBook={onQuickBook}
                          onCheckIn={onCheckIn}
                          onCheckOut={onCheckOut}
                          onOpenFolio={onOpenFolio}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
