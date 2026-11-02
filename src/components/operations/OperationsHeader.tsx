import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Maximize2,
  Minimize2,
  Plus,
  Layers,
  Building2,
  BedDouble
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/Select';
import { cn } from '../../lib/utils';

interface OperationsHeaderProps {
  selectedDate: string;
  onDateChange: (dateStr: string) => void;
  buildings: Array<{ id: number; name: string }>;
  floors: Array<{ id: number; name: string; floorNumber?: number | null }>;
  selectedBuildingId: string;
  onBuildingChange: (bId: string) => void;
  selectedFloorId: string;
  onFloorChange: (fId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  cardSize: 'compact' | 'mini';
  onCardSizeChange: (size: 'compact' | 'mini') => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onOpenNewBooking: () => void;
}

export const OperationsHeader: React.FC<OperationsHeaderProps> = ({
  selectedDate,
  onDateChange,
  buildings,
  floors,
  selectedBuildingId,
  onBuildingChange,
  selectedFloorId,
  onFloorChange,
  searchQuery,
  onSearchChange,
  cardSize,
  onCardSizeChange,
  isExpanded,
  onToggleExpand,
  onOpenNewBooking
}) => {
  const stepDate = (days: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d + days);
    const yr = dateObj.getFullYear();
    const mo = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dy = String(dateObj.getDate()).padStart(2, '0');
    onDateChange(`${yr}-${mo}-${dy}`);
  };

  const setQuickDate = (type: 'yesterday' | 'today' | 'tomorrow') => {
    const today = new Date();
    if (type === 'yesterday') today.setDate(today.getDate() - 1);
    if (type === 'tomorrow') today.setDate(today.getDate() + 1);
    const yr = today.getFullYear();
    const mo = String(today.getMonth() + 1).padStart(2, '0');
    const dy = String(today.getDate()).padStart(2, '0');
    onDateChange(`${yr}-${mo}-${dy}`);
  };

  return (
    <div className="space-y-4">
      {/* Top Bar: Title, Fullscreen, New Booking */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--border)]">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--foreground)] flex items-center gap-2">
            <BedDouble className="w-6 h-6 text-[var(--primary)]" />
            Hotel Operations Command
          </h1>
          <p className="text-xs text-[var(--muted-foreground)]">
            Live Room Reservation Board, Front-Desk Kanban, 7-Day Tape Chart & Housekeeping Hub
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Fullscreen Command Mode Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleExpand}
            className="h-9 px-3 gap-1.5 text-xs font-semibold rounded-xl"
            title={isExpanded ? 'Exit Fullscreen' : 'Enter Fullscreen Command Mode'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isExpanded ? 'Normal' : 'Fullscreen'}</span>
          </Button>

          {/* New Reservation Trigger */}
          <Button
            size="sm"
            onClick={onOpenNewBooking}
            className="h-9 px-4 text-xs font-bold bg-[var(--primary)] text-white hover:opacity-90 gap-1.5 rounded-xl shadow-md"
          >
            <Plus className="w-4 h-4" /> New Booking
          </Button>
        </div>
      </div>

      {/* Control Strip: Date Picker, Building/Floor Selectors, Search, Size Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xs">
        {/* Date Selector Row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center bg-[var(--muted)] p-0.5 rounded-xl border border-[var(--border)]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => stepDate(-1)}
              className="h-7 w-7 p-0 rounded-lg"
              title="Previous Day"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <input
              type="date"
              value={selectedDate}
              onChange={e => onDateChange(e.target.value)}
              className="h-7 bg-transparent border-none text-xs font-bold text-[var(--foreground)] px-2 focus:outline-none"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => stepDate(1)}
              className="h-7 w-7 p-0 rounded-lg"
              title="Next Day"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setQuickDate('yesterday')}
              className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)] transition-colors"
            >
              Yesterday
            </button>
            <button
              type="button"
              onClick={() => setQuickDate('today')}
              className="px-2 py-1 text-[11px] font-bold rounded-lg bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/30 transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setQuickDate('tomorrow')}
              className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)] transition-colors"
            >
              Tomorrow
            </button>
          </div>
        </div>

        {/* Filter Row: Building, Floor, Search, Card Size */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Building Select (Shadcn) */}
          <div className="w-36">
            <Select value={selectedBuildingId} onValueChange={onBuildingChange}>
              <SelectTrigger className="h-8 text-xs font-semibold rounded-xl">
                <Building2 className="w-3.5 h-3.5 mr-1 text-[var(--primary)] shrink-0" />
                <SelectValue placeholder="All Buildings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Buildings</SelectItem>
                {buildings.map(b => (
                  <SelectItem key={b.id} value={String(b.id)}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Floor Select (Shadcn) */}
          <div className="w-32">
            <Select value={selectedFloorId} onValueChange={onFloorChange}>
              <SelectTrigger className="h-8 text-xs font-semibold rounded-xl">
                <Layers className="w-3.5 h-3.5 mr-1 text-[var(--primary)] shrink-0" />
                <SelectValue placeholder="All Floors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Floors</SelectItem>
                {floors.map(f => (
                  <SelectItem key={f.id} value={String(f.id)}>
                    Floor {f.name || f.floorNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Input */}
          <div className="relative w-40">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <Input
              placeholder="Room / Guest..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className="h-8 pl-8 text-xs rounded-xl"
            />
          </div>

          {/* Card Size Switcher */}
          <div className="flex items-center p-0.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-[11px] font-bold">
            <button
              type="button"
              onClick={() => onCardSizeChange('compact')}
              className={cn(
                'px-2.5 py-1 rounded-lg transition-all',
                cardSize === 'compact'
                  ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              )}
            >
              Compact
            </button>
            <button
              type="button"
              onClick={() => onCardSizeChange('mini')}
              className={cn(
                'px-2.5 py-1 rounded-lg transition-all',
                cardSize === 'mini'
                  ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              )}
            >
              Mini
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
