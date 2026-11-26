import React from 'react';
import {
  Building2,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Layers,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { cn, formatCurrency } from '../../lib/utils';
import type {
  CampusBuilding,
  BackendBuilding,
  BackendFloor,
  BackendRoom,
  LiveRoomStatus,
} from '../../types/hotel';

interface CampusElevationViewProps {
  campusBuildings: CampusBuilding[];
  activeBuildingId: 'ALL' | number;
  collapsedBuildingIds: Record<number, boolean>;
  toggleBuildingCollapse: (bId: number) => void;
  quickStatusFilter: 'ALL' | LiveRoomStatus;
  draggingFloorId: number | null;
  setDraggingFloorId: (id: number | null) => void;
  dragOverFloorDropTarget: number | null;
  setDragOverFloorDropTarget: (id: number | null) => void;
  draggingRoomId: number | null;
  setDraggingRoomId: (id: number | null) => void;
  dragOverFloorId: number | null;
  setDragOverFloorId: (id: number | null) => void;
  onFloorDrop: (targetFloor: BackendFloor, buildingFloors: BackendFloor[]) => void;
  onRoomDropOnFloor: (targetFloorId: number) => void;
  onAddFloorToBuilding: (buildingId: number) => void;
  onEditBuilding: (b: BackendBuilding) => void;
  onAddRoomToFloor: (floorId: number) => void;
  onEditFloor: (floor: BackendFloor) => void;
  onDeleteFloor: (floorId: number, floorName: string) => void;
  onSelectDrawerRoom: (rm: BackendRoom) => void;
  onEditRoom: (rm: BackendRoom) => void;
  onDeleteRoom: (roomId: number, roomNumber: string) => void;
  onCycleRoomStatus: (rm: BackendRoom) => void;
}

export const CampusElevationView: React.FC<CampusElevationViewProps> = ({
  campusBuildings,
  activeBuildingId,
  collapsedBuildingIds,
  toggleBuildingCollapse,
  quickStatusFilter,
  draggingFloorId,
  setDraggingFloorId,
  dragOverFloorDropTarget,
  setDragOverFloorDropTarget,
  draggingRoomId,
  setDraggingRoomId,
  dragOverFloorId,
  setDragOverFloorId,
  onFloorDrop,
  onRoomDropOnFloor,
  onAddFloorToBuilding,
  onEditBuilding,
  onAddRoomToFloor,
  onEditFloor,
  onDeleteFloor,
  onSelectDrawerRoom,
  onEditRoom,
  onDeleteRoom,
  onCycleRoomStatus,
}) => {
  return (
    <div className="space-y-6">
      {campusBuildings
        .filter(cb => activeBuildingId === 'ALL' || cb.building.id === activeBuildingId)
        .map(cb => {
          const isCollapsed = !!collapsedBuildingIds[cb.building.id];

          const buildingRooms = (cb.floors || []).flatMap((f: BackendFloor) => f.rooms || []);
          const bAvailable = buildingRooms.filter((r: BackendRoom) => r.status === 'AVAILABLE').length;
          const bOccupied = buildingRooms.filter((r: BackendRoom) => r.status === 'OCCUPIED').length;
          const bCleaning = buildingRooms.filter((r: BackendRoom) => r.status === 'CLEANING').length;
          const bMaintenance = buildingRooms.filter((r: BackendRoom) => r.status === 'MAINTENANCE').length;

          const buildingFloorsElevation = [...(cb.floors || [])].sort(
            (a, b) => b.floorNumber - a.floorNumber
          );

          return (
            <div
              key={cb.building.id}
              className={cn(
                'rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-md transition-all',
                isCollapsed ? 'p-4 space-y-2.5' : 'p-5 space-y-4'
              )}
            >
              {/* Building Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border)]">
                <div
                  onClick={() => toggleBuildingCollapse(cb.building.id)}
                  className="flex items-center gap-2.5 cursor-pointer group select-none flex-1"
                  title={isCollapsed ? 'Click to expand building floors & facilities' : 'Click to collapse building'}
                >
                  <div className="w-7 h-7 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] group-hover:bg-[var(--primary)]/20 group-hover:scale-105 flex items-center justify-center transition-all shrink-0">
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>

                  <div className="w-9 h-9 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-bold shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-extrabold text-[var(--foreground)] tracking-tight group-hover:text-[var(--primary)] transition-colors">
                        {cb.building.name}
                      </h3>
                      {cb.building.code && (
                        <span className="px-2 py-0.5 rounded-md bg-[var(--muted)] text-[var(--muted-foreground)] font-mono text-[10px] font-bold">
                          {cb.building.code}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md bg-[var(--muted)] text-[var(--muted-foreground)] text-[10px] font-bold">
                        {cb.building.buildingType}
                      </span>
                      {isCollapsed && (
                        <span className="px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-bold">
                          Collapsed
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-2 mt-0.5 flex-wrap">
                      <span>{cb.totalFloors} Floor Levels</span>
                      <span>•</span>
                      <span>{cb.totalRooms} Rooms ({bAvailable} ready, {bOccupied} in-house)</span>
                      <span>•</span>
                      <span>{cb.utilities.length} Amenities</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddFloorToBuilding(cb.building.id);
                    }}
                    className="h-8 text-xs font-bold rounded-xl border-[var(--border)] gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Floor Level
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditBuilding(cb.building);
                    }}
                    className="h-8 text-xs font-bold rounded-xl border-[var(--border)] gap-1 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBuildingCollapse(cb.building.id);
                    }}
                    className="h-8 text-xs font-bold rounded-xl px-2.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] gap-1 cursor-pointer"
                  >
                    {isCollapsed ? (
                      <>
                        <ChevronRight className="w-3.5 h-3.5" /> Expand
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" /> Collapse
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Collapsed vs Expanded */}
              {isCollapsed ? (
                <div
                  onClick={() => toggleBuildingCollapse(cb.building.id)}
                  className="p-3 bg-[var(--muted)]/30 hover:bg-[var(--muted)]/50 rounded-2xl border border-dashed border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2 text-[11px] text-[var(--muted-foreground)] flex-wrap">
                    <span className="font-bold text-[var(--foreground)]">Quick Breakdown:</span>
                    <span className="px-2 py-0.5 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] font-bold border border-[var(--primary)]/20">
                      {bAvailable} Available
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[var(--secondary)] text-[var(--secondary-foreground)] font-bold border border-[var(--border)]">
                      {bOccupied} Occupied
                    </span>
                    {bCleaning > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-[var(--muted)] text-[var(--muted-foreground)] font-bold border border-[var(--border)]">
                        {bCleaning} Cleaning
                      </span>
                    )}
                    {bMaintenance > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-[var(--destructive)]/10 text-[var(--destructive)] font-bold border border-[var(--destructive)]/20">
                        {bMaintenance} Maintenance
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] font-bold border border-[var(--primary)]/20">
                      {cb.utilities.length} Facilities
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[var(--primary)] flex items-center gap-1 shrink-0">
                    Click to Expand Elevation View <ChevronDown className="w-3.5 h-3.5" />
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  {buildingFloorsElevation.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--muted)]/20">
                      <Layers className="w-8 h-8 text-[var(--muted-foreground)] mx-auto mb-2 opacity-50" />
                      <p className="text-xs font-bold text-[var(--foreground)]">No floors added to {cb.building.name} yet</p>
                      <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">Click "Add Floor Level" above to create Floor 1.</p>
                    </div>
                  ) : (
                    buildingFloorsElevation.map(floor => {
                      const isFloorDragTarget = dragOverFloorDropTarget === floor.id;
                      const isRoomDropTarget = dragOverFloorId === floor.id;
                      const isBeingDragged = draggingFloorId === floor.id;

                      const floorRooms = (floor.rooms || []).filter(
                        (r: BackendRoom) => quickStatusFilter === 'ALL' || r.status === quickStatusFilter
                      );

                      return (
                        <div
                          key={floor.id}
                          onDragOver={e => {
                            e.preventDefault();
                            if (draggingFloorId && draggingFloorId !== floor.id) {
                              setDragOverFloorDropTarget(floor.id);
                            } else if (draggingRoomId) {
                              setDragOverFloorId(floor.id);
                            }
                          }}
                          onDragLeave={() => {
                            if (dragOverFloorDropTarget === floor.id) setDragOverFloorDropTarget(null);
                            if (dragOverFloorId === floor.id) setDragOverFloorId(null);
                          }}
                          onDrop={e => {
                            e.preventDefault();
                            if (draggingFloorId) {
                              onFloorDrop(floor, cb.floors || []);
                            } else if (draggingRoomId) {
                              onRoomDropOnFloor(floor.id);
                            }
                          }}
                          className={cn(
                            'p-4 rounded-2xl border-2 transition-all relative',
                            isFloorDragTarget
                              ? 'border-[var(--primary)] bg-[var(--primary)]/10 shadow-lg scale-[1.01]'
                              : isRoomDropTarget
                              ? 'border-[var(--primary)] bg-[var(--primary)]/15 shadow-lg'
                              : 'border-[var(--border)] bg-[var(--card)]/80 hover:border-[var(--border)] shadow-xs',
                            isBeingDragged && 'opacity-40 border-dashed'
                          )}
                        >
                          {/* Floor Header Bar */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-[var(--border)]">
                            <div className="flex items-center gap-2.5">
                              <div
                                draggable
                                onDragStart={e => {
                                  setDraggingFloorId(floor.id);
                                  e.dataTransfer.setData('text/plain', `floor:${floor.id}`);
                                }}
                                onDragEnd={() => {
                                  setDraggingFloorId(null);
                                  setDragOverFloorDropTarget(null);
                                }}
                                className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 cursor-grab active:cursor-grabbing transition-colors"
                                title="Drag floor up/down to re-order elevation levels"
                              >
                                <GripVertical className="w-4 h-4" />
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] font-mono text-xs font-black">
                                  L{floor.floorNumber}
                                </span>
                                <span className="text-sm font-extrabold text-[var(--foreground)]">
                                  {floor.name}
                                </span>
                                <span className="text-xs text-[var(--muted-foreground)] font-mono">
                                  ({floor.rooms?.length || 0} rooms)
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 self-end sm:self-auto">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onAddRoomToFloor(floor.id)}
                                className="h-7 text-xs font-bold rounded-lg px-2 text-[var(--primary)] hover:bg-[var(--primary)]/10 gap-1 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" /> Add Room
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onEditFloor(floor)}
                                className="h-7 text-xs font-bold rounded-lg px-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] gap-1 cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5" /> Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onDeleteFloor(floor.id, floor.name)}
                                className="h-7 text-xs font-bold rounded-lg px-2 text-[var(--destructive)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>

                          {/* Floor Rooms Grid */}
                          {floorRooms.length === 0 ? (
                            <div className="py-6 text-center text-xs text-[var(--muted-foreground)] italic border border-dashed border-[var(--border)] rounded-xl">
                              No rooms match active filter on this floor level.
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                              {floorRooms.map((rm: BackendRoom) => {
                                let statusBg = 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20 hover:bg-[var(--primary)]/15';
                                let statusDot = 'bg-[var(--primary)]';
                                if (rm.status === 'OCCUPIED') {
                                  statusBg = 'bg-[var(--secondary)] text-[var(--secondary-foreground)] border-[var(--border)] hover:bg-[var(--muted)]';
                                  statusDot = 'bg-[var(--foreground)]';
                                } else if (rm.status === 'CLEANING') {
                                  statusBg = 'bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)] hover:bg-[var(--muted)]/80';
                                  statusDot = 'bg-[var(--muted-foreground)]';
                                } else if (rm.status === 'MAINTENANCE') {
                                  statusBg = 'bg-[var(--destructive)]/10 text-[var(--destructive)] border-[var(--destructive)]/20 hover:bg-[var(--destructive)]/15';
                                  statusDot = 'bg-[var(--destructive)]';
                                }

                                const isThisRoomDragging = draggingRoomId === rm.id;

                                return (
                                  <div
                                    key={rm.id}
                                    draggable
                                    onDragStart={e => {
                                      setDraggingRoomId(rm.id);
                                      e.dataTransfer.setData('text/plain', `room:${rm.id}`);
                                    }}
                                    onDragEnd={() => setDraggingRoomId(null)}
                                    onClick={() => onSelectDrawerRoom(rm)}
                                    className={cn(
                                      'group p-3 rounded-2xl border-2 bg-[var(--card)] hover:border-[var(--primary)]/60 transition-all cursor-pointer flex flex-col justify-between shadow-xs min-h-[96px]',
                                      isThisRoomDragging && 'opacity-40 scale-95 border-dashed border-[var(--primary)]'
                                    )}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-mono text-sm font-black text-[var(--foreground)]">
                                        #{rm.roomNumber}
                                      </span>
                                      <div className="flex items-center">
                                        <span className="font-mono font-bold text-[10px] text-[var(--primary)] group-hover:hidden transition-all">
                                          {formatCurrency(rm.basePrice).replace('.00', '')}
                                        </span>
                                        <div className="hidden group-hover:flex items-center gap-0.5">
                                          <button
                                            type="button"
                                            onClick={e => {
                                              e.stopPropagation();
                                              onEditRoom(rm);
                                            }}
                                            className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--primary)] cursor-pointer"
                                            title="Edit Room"
                                          >
                                            <Pencil className="w-3 h-3" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={e => {
                                              e.stopPropagation();
                                              onDeleteRoom(rm.id, rm.roomNumber);
                                            }}
                                            className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--destructive)] cursor-pointer"
                                            title="Delete Room"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="my-1 truncate text-[10px] font-medium text-[var(--muted-foreground)]">
                                      {rm.customName || rm.categoryName}
                                    </div>

                                    <button
                                      type="button"
                                      onClick={e => {
                                        e.stopPropagation();
                                        onCycleRoomStatus(rm);
                                      }}
                                      className={cn(
                                        'w-full py-1 px-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 border transition-all cursor-pointer shadow-2xs',
                                        statusBg
                                      )}
                                      title="Click to cycle status"
                                    >
                                      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', statusDot)} />
                                      <span className="truncate">{rm.status}</span>
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
};
