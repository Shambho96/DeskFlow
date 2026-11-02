import React from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Play,
  Layers,
  BedDouble,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/Select';
import { cn } from '../../lib/utils';
import type { HousekeepingBoardPayload, HousekeepingTaskRecord } from '../../types/operations';

interface HousekeepingHubProps {
  housekeeping?: HousekeepingBoardPayload;
  floors: Array<{ id: number; name: string; floorNumber?: number | null }>;
  selectedFloorId: string;
  onFloorChange: (floorId: string) => void;
  onUpdateTask: (taskId: number, status: string, notes?: string) => void;
  isLoading?: boolean;
}

export const HousekeepingHub: React.FC<HousekeepingHubProps> = ({
  housekeeping,
  floors,
  selectedFloorId,
  onFloorChange,
  onUpdateTask
}) => {
  const tasks = housekeeping?.tasks || [];
  const dirtyCount = housekeeping?.dirtyCount || 0;
  const cleanCount = housekeeping?.cleanCount || 0;
  const occupiedCount = housekeeping?.occupiedCount || 0;
  const oooCount = housekeeping?.oooCount || 0;

  const getTaskStatusBadge = (status: HousekeepingTaskRecord['status']) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Pending', className: 'bg-[var(--destructive)]/15 text-[var(--destructive)] border-[var(--destructive)]/30' };
      case 'IN_PROGRESS':
        return { label: 'In Progress', className: 'bg-[var(--secondary)] text-[var(--secondary-foreground)] border-[var(--border)]' };
      case 'COMPLETED':
        return { label: 'Cleaned', className: 'bg-[var(--primary)]/15 text-[var(--primary)] border-[var(--primary)]/30' };
      case 'INSPECTED':
      default:
        return { label: 'Inspected & Ready', className: 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]' };
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'HIGH':
        return 'bg-[var(--destructive)] text-[var(--destructive-foreground)]';
      case 'MEDIUM':
        return 'bg-[var(--secondary)] text-[var(--secondary-foreground)]';
      case 'LOW':
      default:
        return 'bg-[var(--muted)] text-[var(--muted-foreground)]';
    }
  };

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-left shadow-2xs">
          <div className="flex items-center justify-between text-[var(--destructive)]">
            <span className="text-xs font-bold uppercase tracking-wider">Dirty / Turnover</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-[var(--destructive)] mt-1">{dirtyCount}</p>
          <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">Rooms requiring immediate cleaning</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-left shadow-2xs">
          <div className="flex items-center justify-between text-[var(--primary)]">
            <span className="text-xs font-bold uppercase tracking-wider">Clean & Inspected</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-[var(--primary)] mt-1">{cleanCount}</p>
          <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">Ready for instant guest check-in</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-left shadow-2xs">
          <div className="flex items-center justify-between text-[var(--foreground)]">
            <span className="text-xs font-bold uppercase tracking-wider">In-House Stays</span>
            <BedDouble className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-[var(--foreground)] mt-1">{occupiedCount}</p>
          <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">Daily stay-over cleaning</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-left shadow-2xs">
          <div className="flex items-center justify-between text-[var(--muted-foreground)]">
            <span className="text-xs font-bold uppercase tracking-wider">Maintenance (OOO)</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-[var(--foreground)] mt-1">{oooCount}</p>
          <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">Technical / repair service blocked</p>
        </div>
      </div>

      {/* Task List Header + Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
        <div>
          <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--primary)]" />
            Housekeeping Dispatch & Task Queue
          </h3>
          <p className="text-xs text-[var(--muted-foreground)]">
            Manage room turnover, daily refresh, and supervisor inspections
          </p>
        </div>

        {/* Floor Filter using Shadcn Select */}
        <div className="w-44">
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
      </div>

      {/* Tasks Table */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-xs">
        {tasks.length === 0 ? (
          <div className="p-12 text-center text-xs text-[var(--muted-foreground)]">
            <Sparkles className="w-8 h-8 text-[var(--primary)] mx-auto mb-2 opacity-60" />
            <p className="font-bold text-sm text-[var(--foreground)]">All Rooms Clean & Ready</p>
            <p className="mt-1">No pending housekeeping or turnover tasks recorded.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {tasks.map(t => {
              const statusBadge = getTaskStatusBadge(t.status);

              return (
                <div
                  key={t.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 hover:bg-[var(--muted)]/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--muted)] border border-[var(--border)] flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] text-[var(--muted-foreground)] leading-none">Room</span>
                      <span className="text-xs font-black text-[var(--foreground)]">{t.roomNumber}</span>
                    </div>

                    <div className="text-left space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[var(--foreground)]">
                          {t.taskType.replace('_', ' ')}
                        </span>
                        <span className={cn('px-1.5 py-0.2 text-[9px] font-extrabold uppercase rounded', getPriorityBadge(t.priority))}>
                          {t.priority}
                        </span>
                        <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold border', statusBadge.className)}>
                          {statusBadge.label}
                        </span>
                      </div>
                      {t.notes && (
                        <p className="text-[11px] text-[var(--muted-foreground)] italic">{t.notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Status Progression Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {t.status === 'PENDING' && (
                      <Button
                        size="sm"
                        onClick={() => onUpdateTask(t.id, 'IN_PROGRESS')}
                        className="h-8 px-3 text-xs font-bold bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] gap-1.5 rounded-xl shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5" /> Start Cleaning
                      </Button>
                    )}

                    {t.status === 'IN_PROGRESS' && (
                      <Button
                        size="sm"
                        onClick={() => onUpdateTask(t.id, 'COMPLETED')}
                        className="h-8 px-3 text-xs font-bold bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] gap-1.5 rounded-xl shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" /> Mark Cleaned
                      </Button>
                    )}

                    {t.status === 'COMPLETED' && (
                      <Button
                        size="sm"
                        onClick={() => onUpdateTask(t.id, 'INSPECTED')}
                        className="h-8 px-3 text-xs font-bold bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] gap-1.5 rounded-xl shadow-xs"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" /> Inspect & Release
                      </Button>
                    )}

                    {t.status === 'INSPECTED' && (
                      <span className="text-xs font-bold text-[var(--primary)] flex items-center gap-1.5 py-1">
                        <CheckCircle2 className="w-4 h-4" /> Room Verified Ready
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
