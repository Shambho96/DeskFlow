import React from 'react';
import { BedDouble, Building2, CheckCircle2, Layers, RefreshCw, Sparkles } from 'lucide-react';
import type { BackendBuilding, BackendFloor } from '../../types/hotel';

interface RoomKpiCardsProps {
  totalRoomsCount: number;
  availableRoomsCount: number;
  occupiedRoomsCount: number;
  attentionRoomsCount: number;
  cleaningRoomsCount: number;
  maintenanceRoomsCount: number;
  buildings: BackendBuilding[];
  backendFloors: BackendFloor[];
  totalFloors?: number;
}

export const RoomKpiCards: React.FC<RoomKpiCardsProps> = ({
  totalRoomsCount,
  availableRoomsCount,
  occupiedRoomsCount,
  attentionRoomsCount,
  cleaningRoomsCount,
  maintenanceRoomsCount,
  buildings,
  backendFloors,
  totalFloors,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* Card 1: Total Inventory */}
      <div className="p-3.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xs transition-all hover:border-[var(--primary)]/40 hover:shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
            <BedDouble className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
            <span>Total Inventory</span>
          </span>
          <div className="w-6 h-6 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] shrink-0">
            <Layers className="w-3 h-3" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-[var(--foreground)] font-mono tracking-tight">
            {totalRoomsCount}
          </span>
          <span className="text-xs font-medium text-[var(--muted-foreground)]">rooms</span>
        </div>
        <div className="text-[10px] text-[var(--muted-foreground)] mt-1 truncate">
          {buildings.length} Wings • {totalFloors ?? backendFloors.length} Floors
        </div>
      </div>

      {/* Card 2: Available (Ready) */}
      <div className="p-3.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xs transition-all hover:border-[var(--primary)]/40 hover:shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
            <span>Available (Ready)</span>
          </span>
          <div className="w-6 h-6 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] shrink-0">
            <CheckCircle2 className="w-3 h-3" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-[var(--foreground)] font-mono tracking-tight">
            {availableRoomsCount}
          </span>
          <span className="text-xs font-medium text-[var(--muted-foreground)]">vacant</span>
        </div>
        <div className="text-[10px] text-[var(--muted-foreground)] mt-1 truncate">
          Ready for instant check-in
        </div>
      </div>

      {/* Card 3: In-House Occupied */}
      <div className="p-3.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xs transition-all hover:border-[var(--primary)]/40 hover:shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
            <span>In-House Occupied</span>
          </span>
          <div className="w-6 h-6 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] shrink-0">
            <Building2 className="w-3 h-3" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-[var(--foreground)] font-mono tracking-tight">
            {occupiedRoomsCount}
          </span>
          <span className="text-xs font-medium text-[var(--muted-foreground)]">active</span>
        </div>
        <div className="text-[10px] text-[var(--muted-foreground)] mt-1 truncate">
          Currently checked-in guests
        </div>
      </div>

      {/* Card 4: Needs Attention */}
      <div className="p-3.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xs transition-all hover:border-[var(--primary)]/40 hover:shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
            <span>Needs Attention</span>
          </span>
          <div className="w-6 h-6 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] shrink-0">
            <Sparkles className="w-3 h-3" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-[var(--foreground)] font-mono tracking-tight">
            {attentionRoomsCount}
          </span>
          <span className="text-xs font-medium text-[var(--muted-foreground)]">units</span>
        </div>
        <div className="text-[10px] text-[var(--muted-foreground)] mt-1 truncate">
          {cleaningRoomsCount} Cleaning • {maintenanceRoomsCount} Maintenance
        </div>
      </div>
    </div>
  );
};
