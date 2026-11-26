import React from 'react';
import { Clock, DollarSign, Pencil, Plus, Sparkles, Trash2, Users } from 'lucide-react';
import { Button } from '../ui/Button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/Select';
import { cn, formatCurrency } from '../../lib/utils';
import type { BackendBuilding, BackendUtility } from '../../types/hotel';

interface RoomFacilitiesTabProps {
  utilities: BackendUtility[];
  buildings: BackendBuilding[];
  onAddFacility: () => void;
  onEditFacility: (u: BackendUtility) => void;
  onDeleteFacility: (id: number, name: string) => void;
  onUpdateStatus: (id: number, status: any) => Promise<unknown>;
}

export const RoomFacilitiesTab: React.FC<RoomFacilitiesTabProps> = ({
  utilities,
  buildings,
  onAddFacility,
  onEditFacility,
  onDeleteFacility,
  onUpdateStatus,
}) => {
  return (
    <div className="pt-3 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-extrabold text-[var(--foreground)] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--primary)]" />
            Campus Facilities &amp; Outdoor Grounds ({utilities.length})
          </h3>
          <p className="text-xs text-[var(--muted-foreground)]">
            Manage shared guest facilities, swimming pools, fitness clubs, conference halls, and recreational grounds.
          </p>
        </div>
        <Button
          size="sm"
          onClick={onAddFacility}
          className="h-8 text-xs font-bold rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Facility
        </Button>
      </div>

      {utilities.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[var(--card)] border border-dashed border-[var(--border)]">
          <Sparkles className="w-8 h-8 text-[var(--muted-foreground)] mx-auto mb-2 opacity-50" />
          <p className="text-sm font-bold text-[var(--foreground)]">No Campus Facilities Registered</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1 mb-4">
            Add pools, fitness clubs, spas, banquet halls, or sports courts to your campus layout.
          </p>
          <Button
            size="sm"
            onClick={onAddFacility}
            className="h-8 text-xs font-bold rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add First Facility
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {utilities.map(u => {
            let statusBadge = 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20';
            if (u.status === 'CLEANING') statusBadge = 'bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]';
            else if (u.status === 'MAINTENANCE') statusBadge = 'bg-[var(--destructive)]/10 text-[var(--destructive)] border-[var(--destructive)]/20';
            else if (u.status === 'CLOSED') statusBadge = 'bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]';

            return (
              <div
                key={u.id}
                className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/50 shadow-xs flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h5 className="font-bold text-sm text-[var(--foreground)] flex items-center gap-1.5">
                        {u.name}
                      </h5>
                      <span className="text-[11px] text-[var(--muted-foreground)] font-semibold">
                        {u.utilityType} {(() => {
                          const bName = u.buildingName || buildings.find(b => b.id === u.buildingId)?.name;
                          return bName ? `• ${bName}` : '';
                        })()}
                      </span>
                    </div>

                    <Select
                      value={u.status}
                      onValueChange={(val) => onUpdateStatus(u.id, val)}
                    >
                      <SelectTrigger
                        className={cn(
                          'h-7 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border cursor-pointer w-auto shadow-none',
                          statusBadge
                        )}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPEN">🟢 OPEN</SelectItem>
                        <SelectItem value="CLEANING">🟡 CLEANING</SelectItem>
                        <SelectItem value="MAINTENANCE">🔴 MAINTENANCE</SelectItem>
                        <SelectItem value="CLOSED">⚪ CLOSED</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-[var(--muted-foreground)]">
                    {u.operatingHours && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                        <span>{u.operatingHours}</span>
                      </div>
                    )}
                    {u.capacity && (
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                        <span>Capacity: {u.capacity} guests</span>
                      </div>
                    )}
                    {u.rentalPrice && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-3.5 h-3.5 text-[var(--primary)]" />
                        <span className="font-mono font-bold text-[var(--primary)]">
                          {formatCurrency(u.rentalPrice)}/hr
                        </span>
                      </div>
                    )}
                  </div>

                  {u.amenities && u.amenities.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {u.amenities.map(a => (
                        <span key={a} className="px-2 py-0.5 rounded-md bg-[var(--muted)] text-[10px] text-[var(--muted-foreground)] font-medium">
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-end gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEditFacility(u)}
                    className="h-8 text-xs font-bold rounded-xl px-2.5 text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 gap-1 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteFacility(u.id, u.name)}
                    className="h-8 text-xs font-bold rounded-xl px-2.5 text-[var(--destructive)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10 gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
