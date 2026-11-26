import React from 'react';
import { BedDouble, Layers, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn, formatCurrency } from '../../lib/utils';
import type { BackendFloor, BackendRoom } from '../../types/hotel';

export interface CanvasItem {
  id: string;
  floorId: string;
  roomId?: string;
  label: string;
  shapeType: 'SQUARE' | 'CIRCLE' | 'DIAMOND' | 'PENTAGON' | 'OCTAGON' | 'COUNTER' | 'WALL' | 'DECOR' | 'ELEVATOR';
  category?: 'ROOM' | 'ELEMENT';
  x: number;
  y: number;
  typeId?: string;
  categoryName?: string;
  basePrice?: number;
  status?: any;
  isOccupied?: boolean;
}

interface RoomCanvasPlanProps {
  canvasItems: CanvasItem[];
  activeFloor: BackendFloor | undefined;
  activeFloorRooms: BackendRoom[];
  backendRooms: BackendRoom[];
  backendFloors: BackendFloor[];
  selectedItemId: string | null;
  draggingItemId: string | null;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  hasMovedRef: React.MutableRefObject<boolean>;
  onNodeMouseDown: (e: React.MouseEvent, item: CanvasItem) => void;
  onCycleStatus: (item: CanvasItem) => Promise<void>;
  onSelectDrawerRoom: (rm: BackendRoom) => void;
  onEditRoom: (rm: BackendRoom) => void;
  onDeleteRoom: (roomId: number, label: string) => void;
  onAddRoomHere: () => void;
  onAddFirstFloor: () => void;
}

export const RoomCanvasPlan: React.FC<RoomCanvasPlanProps> = ({
  canvasItems,
  activeFloor,
  activeFloorRooms,
  backendRooms,
  backendFloors,
  selectedItemId,
  draggingItemId,
  canvasRef,
  hasMovedRef,
  onNodeMouseDown,
  onCycleStatus,
  onSelectDrawerRoom,
  onEditRoom,
  onDeleteRoom,
  onAddRoomHere,
  onAddFirstFloor,
}) => {
  return (
    <div className="relative w-full h-[640px] rounded-3xl bg-[var(--card)] border border-[var(--border)] overflow-hidden shadow-md flex flex-col">
      {/* Bottom Left: Blueprint Status Legend & Tip */}
      <div className="absolute bottom-3 left-3 z-20 hidden sm:flex items-center gap-3 bg-[var(--card)]/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-[var(--border)] shadow-xs text-[10px] text-[var(--muted-foreground)] font-bold pointer-events-none">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[var(--primary)]" /> Available
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[var(--foreground)]" /> Occupied
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[var(--muted-foreground)]" /> Cleaning
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[var(--destructive)]" /> Maintenance
        </span>
        <span className="text-[var(--border)]">|</span>
        <span className="text-[var(--foreground)]/70">Drag to layout • Click for details</span>
      </div>

      {backendFloors.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mb-3">
            <Layers className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[var(--foreground)]">No Floors Defined Yet</h3>
          <p className="text-xs text-[var(--muted-foreground)] max-w-sm mt-1 mb-4">
            Start by adding your first building floor (e.g. "Ground Floor" or "First Floor").
          </p>
          <Button
            onClick={onAddFirstFloor}
            className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 font-bold rounded-xl text-xs px-4 h-9 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add First Floor
          </Button>
        </div>
      ) : activeFloorRooms.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mb-3">
            <BedDouble className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[var(--foreground)]">No Rooms on {activeFloor?.name}</h3>
          <p className="text-xs text-[var(--muted-foreground)] max-w-sm mt-1 mb-4">
            Add rooms individually to this level or use the Bulk Generator to quickly place multiple rooms.
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={onAddRoomHere}
              className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 font-bold rounded-xl text-xs px-4 h-9 cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Add Room Here
            </Button>
          </div>
        </div>
      ) : (
        <div
          ref={canvasRef}
          className="w-full h-full relative overflow-auto cursor-default"
          style={{
            backgroundImage: 'radial-gradient(circle, color-mix(in oklch, var(--foreground) 10%, transparent) 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px'
          }}
        >
          <div className="min-w-[1400px] min-h-[750px] relative pt-16 pb-12">
            {canvasItems.map(item => {
              const isSelected = selectedItemId === item.id;
              const isDragging = draggingItemId === item.id;

              let statusBg = 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20 hover:bg-[var(--primary)]/15';
              let statusDot = 'bg-[var(--primary)]';
              if (item.status === 'OCCUPIED') {
                statusBg = 'bg-[var(--secondary)] text-[var(--secondary-foreground)] border-[var(--border)] hover:bg-[var(--muted)]';
                statusDot = 'bg-[var(--foreground)]';
              } else if (item.status === 'CLEANING') {
                statusBg = 'bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)] hover:bg-[var(--muted)]/80';
                statusDot = 'bg-[var(--muted-foreground)]';
              } else if (item.status === 'MAINTENANCE') {
                statusBg = 'bg-[var(--destructive)]/10 text-[var(--destructive)] border-[var(--destructive)]/20 hover:bg-[var(--destructive)]/15';
                statusDot = 'bg-[var(--destructive)]';
              }

              return (
                <div
                  key={item.id}
                  onMouseDown={e => onNodeMouseDown(e, item)}
                  onClick={() => {
                    if (!hasMovedRef.current) {
                      const rm = backendRooms.find(r => String(r.id) === String(item.roomId));
                      if (rm) onSelectDrawerRoom(rm);
                    }
                  }}
                  style={{
                    position: 'absolute',
                    left: `${item.x}px`,
                    top: `${item.y}px`,
                    width: '152px',
                    height: '106px'
                  }}
                  className={cn(
                    'group rounded-2xl border-2 p-3 flex flex-col justify-between transition-all cursor-grab active:cursor-grabbing select-none',
                    isSelected
                      ? 'border-[var(--primary)] shadow-xl ring-2 ring-[var(--primary)]/25 z-30 bg-[var(--card)]'
                      : 'border-[var(--border)] shadow-xs hover:border-[var(--primary)]/70 hover:shadow-md bg-[var(--card)]',
                    isDragging && 'opacity-90 shadow-2xl scale-105 z-40'
                  )}
                >
                  {/* Card Top: Room # & Nightly Rate */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-black text-[var(--foreground)] tracking-tight">
                      #{item.label.replace('Room ', '')}
                    </span>

                    <div className="flex items-center">
                      <span className="font-mono font-bold text-[11px] text-[var(--primary)] group-hover:hidden transition-all">
                        {formatCurrency(item.basePrice || 0).replace('.00', '')}
                      </span>
                      <div className="hidden group-hover:flex items-center gap-1 transition-all">
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            const rm = backendRooms.find(r => String(r.id) === String(item.roomId));
                            if (rm) onEditRoom(rm);
                          }}
                          className="p-1 rounded-md text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors cursor-pointer"
                          title="Edit Room Details"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            if (item.roomId) onDeleteRoom(Number(item.roomId), item.label);
                          }}
                          className="p-1 rounded-md text-[var(--muted-foreground)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition-colors cursor-pointer"
                          title="Delete Room"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card Middle: Category Name */}
                  <div className="my-1">
                    <div className="text-[11px] font-medium text-[var(--muted-foreground)] truncate" title={item.categoryName || 'Standard Room'}>
                      {item.categoryName || 'Standard Room'}
                    </div>
                  </div>

                  {/* Card Bottom: 1-Click Status Pill */}
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      onCycleStatus(item);
                    }}
                    className={cn(
                      'w-full py-1 px-2 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-2xs',
                      statusBg
                    )}
                    title="Click to cycle status"
                  >
                    <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', statusDot)} />
                    <span>{item.status}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
