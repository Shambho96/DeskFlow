import React, { useState, useMemo } from 'react';
import { Pencil, Search, Sparkles, Trash2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/Select';
import { cn, formatCurrency } from '../../lib/utils';
import type { BackendBuilding, BackendFloor, BackendRoom, LiveRoomStatus } from '../../types/hotel';

interface RoomDirectoryTableProps {
  backendRooms: BackendRoom[];
  buildings: BackendBuilding[];
  backendFloors: BackendFloor[];
  onUpdateStatus: (id: number, status: LiveRoomStatus) => Promise<unknown>;
  onEditRoom: (rm: BackendRoom) => void;
  onDeleteRoom: (id: number, roomNumber: string) => void;
}

export const RoomDirectoryTable: React.FC<RoomDirectoryTableProps> = ({
  backendRooms,
  buildings,
  backendFloors,
  onUpdateStatus,
  onEditRoom,
  onDeleteRoom,
}) => {
  const [directorySearch, setDirectorySearch] = useState('');
  const [directoryBuildingFilter, setDirectoryBuildingFilter] = useState<'ALL' | number>('ALL');
  const [directoryFloorFilter, setDirectoryFloorFilter] = useState('ALL');
  const [directoryStatusFilter, setDirectoryStatusFilter] = useState('ALL');

  const filteredDirectoryRooms = useMemo(() => {
    return backendRooms.filter(rm => {
      const matchesSearch =
        rm.roomNumber.toLowerCase().includes(directorySearch.toLowerCase()) ||
        rm.categoryName.toLowerCase().includes(directorySearch.toLowerCase()) ||
        (rm.customName && rm.customName.toLowerCase().includes(directorySearch.toLowerCase())) ||
        rm.floorName.toLowerCase().includes(directorySearch.toLowerCase());

      const matchesBuilding =
        directoryBuildingFilter === 'ALL' || rm.buildingId === directoryBuildingFilter;

      const matchesFloor =
        directoryFloorFilter === 'ALL' || String(rm.floorId) === String(directoryFloorFilter);

      const matchesStatus =
        directoryStatusFilter === 'ALL' || rm.status === directoryStatusFilter;

      return matchesSearch && matchesBuilding && matchesFloor && matchesStatus;
    });
  }, [backendRooms, directorySearch, directoryBuildingFilter, directoryFloorFilter, directoryStatusFilter]);

  return (
    <div className="pt-3 space-y-4">
      {/* SEARCH & FILTERS BAR */}
      <div className="p-3 bg-[var(--card)] border border-[var(--border)] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-[var(--muted-foreground)] absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={directorySearch}
              onChange={e => setDirectorySearch(e.target.value)}
              placeholder="Search room #, category, building, amenities..."
              className="pl-9 h-9 text-xs rounded-xl"
            />
          </div>

          {/* Building Filter */}
          <Select
            value={String(directoryBuildingFilter)}
            onValueChange={val => setDirectoryBuildingFilter(val === 'ALL' ? 'ALL' : Number(val))}
          >
            <SelectTrigger className="h-9 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-bold text-[var(--foreground)] w-auto min-w-[150px]">
              <SelectValue placeholder="All Buildings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Buildings ({buildings.length})</SelectItem>
              {buildings.map(b => (
                <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Floor Filter */}
          <Select
            value={directoryFloorFilter}
            onValueChange={val => setDirectoryFloorFilter(val)}
          >
            <SelectTrigger className="h-9 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-bold text-[var(--foreground)] w-auto min-w-[140px]">
              <SelectValue placeholder="All Floors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Floors ({backendFloors.length})</SelectItem>
              {backendFloors.map(f => (
                <SelectItem key={f.id} value={String(f.id)}>Floor {f.floorNumber} — {f.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={directoryStatusFilter}
            onValueChange={val => setDirectoryStatusFilter(val)}
          >
            <SelectTrigger className="h-9 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-bold text-[var(--foreground)] w-auto min-w-[130px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="AVAILABLE">🟢 Available</SelectItem>
              <SelectItem value="OCCUPIED">🔵 Occupied</SelectItem>
              <SelectItem value="CLEANING">🟡 Cleaning</SelectItem>
              <SelectItem value="MAINTENANCE">🔴 Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <span className="text-xs font-bold text-[var(--muted-foreground)] whitespace-nowrap">
          Showing <span className="text-[var(--foreground)]">{filteredDirectoryRooms.length}</span> of {backendRooms.length} rooms
        </span>
      </div>

      {/* TABLE CONTAINER */}
      <Card className="rounded-2xl border-[var(--border)] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--muted)]/50 text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider border-b border-[var(--border)]">
              <tr>
                <th className="py-3 px-4">Room #</th>
                <th className="py-3 px-4">Building &amp; Floor</th>
                <th className="py-3 px-4">Category / Custom Title</th>
                <th className="py-3 px-4">Nightly Rate</th>
                <th className="py-3 px-4">Amenities</th>
                <th className="py-3 px-4">Live Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredDirectoryRooms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[var(--muted-foreground)]">
                    No rooms match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredDirectoryRooms.map(rm => {
                  let statusBadge = 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20';
                  if (rm.status === 'OCCUPIED') statusBadge = 'bg-[var(--secondary)] text-[var(--secondary-foreground)] border-[var(--border)]';
                  else if (rm.status === 'CLEANING') statusBadge = 'bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]';
                  else if (rm.status === 'MAINTENANCE') statusBadge = 'bg-[var(--destructive)]/10 text-[var(--destructive)] border-[var(--destructive)]/20';

                  return (
                    <tr key={rm.id} className="hover:bg-[var(--muted)]/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-xs text-[var(--foreground)]">
                        #{rm.roomNumber}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <span className="font-semibold text-[var(--foreground)]">{rm.buildingName || 'Main Tower'}</span>
                        <span className="text-[11px] text-[var(--muted-foreground)] block">
                          Floor {rm.floorNumber ?? '—'} ({rm.floorName})
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        {rm.customName ? (
                          <div>
                            <span className="font-bold text-[var(--primary)] flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-[var(--primary)]" /> {rm.customName}
                            </span>
                            <span className="text-[10px] text-[var(--muted-foreground)]">Free-Hand Custom</span>
                          </div>
                        ) : (
                          <div>
                            <span className="font-bold text-[var(--foreground)]">{rm.categoryName}</span>
                            <span className="text-[10px] text-[var(--muted-foreground)] block">Preset Tier</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono font-bold text-[var(--primary)]">
                        {formatCurrency(rm.basePrice)}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {rm.amenities && rm.amenities.length > 0 ? (
                            rm.amenities.slice(0, 3).map(a => (
                              <span key={a} className="px-1.5 py-0.5 rounded bg-[var(--muted)] text-[9px] text-[var(--muted-foreground)]">
                                {a}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-[var(--muted-foreground)] italic">—</span>
                          )}
                          {rm.amenities && rm.amenities.length > 3 && (
                            <span className="text-[9px] text-[var(--muted-foreground)]">+{rm.amenities.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <Select
                          value={rm.status}
                          onValueChange={val => onUpdateStatus(rm.id, val as LiveRoomStatus)}
                        >
                          <SelectTrigger
                            className={cn(
                              'h-7 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border cursor-pointer w-auto min-w-[110px]',
                              statusBadge
                            )}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AVAILABLE">AVAILABLE</SelectItem>
                            <SelectItem value="OCCUPIED">OCCUPIED</SelectItem>
                            <SelectItem value="CLEANING">CLEANING</SelectItem>
                            <SelectItem value="MAINTENANCE">MAINTENANCE</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 px-4 text-xs text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onEditRoom(rm)}
                            className="h-7 text-xs font-bold rounded-lg px-2 text-[var(--muted-foreground)] hover:text-[var(--primary)] cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDeleteRoom(rm.id, rm.roomNumber)}
                            className="h-7 text-xs font-bold rounded-lg px-2 text-[var(--destructive)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
