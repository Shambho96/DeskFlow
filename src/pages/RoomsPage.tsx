import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Layers,
  Sparkles,
  Plus,
  BedDouble,
  Tag,
  Pencil,
  Building2,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  LayoutGrid
} from 'lucide-react';
import { useRooms } from '../hooks/useRooms';
import { CampusLayoutSkeleton } from '../components/skeletons';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { Popover, PopoverTrigger, PopoverContent } from '../components/ui/Popover';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/Select';
import { cn } from '../lib/utils';
import { CreateCategoryModal } from '../components/rooms/CreateCategoryModal';
import { CreateRoomModal } from '../components/rooms/CreateRoomModal';
import { EditFloorModal } from '../components/rooms/EditFloorModal';
import { EditCategoryModal } from '../components/rooms/EditCategoryModal';
import { EditRoomModal } from '../components/rooms/EditRoomModal';
import { CreateBuildingModal } from '../components/rooms/CreateBuildingModal';
import { EditBuildingModal } from '../components/rooms/EditBuildingModal';
import { CreateUtilityModal } from '../components/rooms/CreateUtilityModal';
import { EditUtilityModal } from '../components/rooms/EditUtilityModal';
import { RoomDetailDrawer } from '../components/rooms/RoomDetailDrawer';
import { RoomKpiCards } from '../components/rooms/RoomKpiCards';
import { CampusElevationView } from '../components/rooms/CampusElevationView';
import { RoomCanvasPlan, type CanvasItem } from '../components/rooms/RoomCanvasPlan';
import { RoomDirectoryTable } from '../components/rooms/RoomDirectoryTable';
import { RoomCategoriesTab } from '../components/rooms/RoomCategoriesTab';
import { RoomFacilitiesTab } from '../components/rooms/RoomFacilitiesTab';
import { BulkRoomGeneratorTab } from '../components/rooms/BulkRoomGeneratorTab';
import type {
  LiveRoomStatus,
  BackendFloor,
  BackendRoomCategory,
  BackendRoom,
  BackendBuilding,
  BackendUtility
} from '../types/hotel';

export const RoomsPage: React.FC = () => {
  const {
    campusBuildings,
    buildings,
    floors: backendFloors,
    categories: backendCategories,
    allRooms: backendRooms,
    allUtilities: backendUtilities,
    layout,
    isLoading,
    createBuilding,
    updateBuilding,
    deleteBuilding,
    createFloor,
    updateFloor,
    deleteFloor,
    reorderFloors,
    createRoomCategory,
    updateRoomCategory,
    deleteRoomCategory,
    createRoom,
    createBulkRooms,
    updateRoom,
    updateRoomStatus: apiUpdateRoomStatus,
    deleteRoom: apiDeleteRoom,
    createUtility,
    updateUtility,
    updateUtilityStatus: apiUpdateUtilityStatus,
    deleteUtility,
  } = useRooms();

  const [activeBuildingId, setActiveBuildingId] = useState<'ALL' | number>('ALL');
  const [activeFloorId, setActiveFloorId] = useState<string>('ALL');
  const [selectedDrawerRoom, setSelectedDrawerRoom] = useState<BackendRoom | null>(null);
  const [newItemPopoverOpen, setNewItemPopoverOpen] = useState(false);
  const [quickStatusFilter, setQuickStatusFilter] = useState<'ALL' | LiveRoomStatus>('ALL');

  const displayedFloors = useMemo(() => {
    if (activeBuildingId === 'ALL') return backendFloors;
    return backendFloors.filter(f => f.buildingId === activeBuildingId);
  }, [backendFloors, activeBuildingId]);

  const handleSelectBuilding = (bId: 'ALL' | number) => {
    setActiveBuildingId(bId);
    if (bId !== 'ALL' && activeFloorId !== 'ALL') {
      const floorStillValid = backendFloors.some(
        f => String(f.id) === String(activeFloorId) && f.buildingId === bId
      );
      if (!floorStillValid) {
        const firstFloorOfBuilding = backendFloors.find(f => f.buildingId === bId);
        setActiveFloorId(firstFloorOfBuilding ? String(firstFloorOfBuilding.id) : 'ALL');
      }
    }
  };

  // Modals state
  const [showAddFloorInput, setShowAddFloorInput] = useState(false);
  const [newFloorName, setNewFloorName] = useState('');
  const [showCreateBuildingModal, setShowCreateBuildingModal] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<BackendBuilding | null>(null);
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [targetCreateRoomFloorId, setTargetCreateRoomFloorId] = useState<number | undefined>(undefined);
  const [showCreateUtilityModal, setShowCreateUtilityModal] = useState(false);
  const [editingUtility, setEditingUtility] = useState<BackendUtility | null>(null);
  const [editingFloor, setEditingFloor] = useState<BackendFloor | null>(null);
  const [editingCategory, setEditingCategory] = useState<BackendRoomCategory | null>(null);
  const [editingRoom, setEditingRoom] = useState<BackendRoom | null>(null);

  // Drag and drop state
  const [draggingRoomId, setDraggingRoomId] = useState<number | null>(null);
  const [dragOverFloorId, setDragOverFloorId] = useState<number | null>(null);
  const [draggingFloorId, setDraggingFloorId] = useState<number | null>(null);
  const [dragOverFloorDropTarget, setDragOverFloorDropTarget] = useState<number | null>(null);

  // Collapsible state
  const [collapsedBuildingIds, setCollapsedBuildingIds] = useState<Record<number, boolean>>({});

  const toggleBuildingCollapse = (bId: number) => {
    setCollapsedBuildingIds(prev => ({
      ...prev,
      [bId]: !prev[bId]
    }));
  };

  const visibleCampusBuildings = useMemo(() => {
    return campusBuildings.filter(
      cb => activeBuildingId === 'ALL' || cb.building.id === activeBuildingId
    );
  }, [campusBuildings, activeBuildingId]);

  const areAllBuildingsCollapsed = useMemo(() => {
    return (
      visibleCampusBuildings.length > 0 &&
      visibleCampusBuildings.every(cb => !!collapsedBuildingIds[cb.building.id])
    );
  }, [visibleCampusBuildings, collapsedBuildingIds]);

  const handleToggleAllBuildings = () => {
    if (areAllBuildingsCollapsed) {
      setCollapsedBuildingIds(prev => {
        const next = { ...prev };
        visibleCampusBuildings.forEach(cb => {
          delete next[cb.building.id];
        });
        return next;
      });
    } else {
      setCollapsedBuildingIds(prev => {
        const next = { ...prev };
        visibleCampusBuildings.forEach(cb => {
          next[cb.building.id] = true;
        });
        return next;
      });
    }
  };

  // 2D Canvas State & Position Memory
  const [snapToGrid] = useState(true);
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedRef = useRef<boolean>(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [savedCanvasPositions, setSavedCanvasPositions] = useState<Record<string, { x: number; y: number }>>(() => {
    try {
      const stored = localStorage.getItem('hrm_canvas_room_positions');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const saveRoomPosition = (itemId: string, x: number, y: number) => {
    setSavedCanvasPositions(prev => {
      const next = { ...prev, [itemId]: { x, y } };
      try {
        localStorage.setItem('hrm_canvas_room_positions', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    if (!activeFloorId || activeFloorId === 'ALL') {
      setCanvasItems([]);
      return;
    }

    const currentFloor = backendFloors.find(f => String(f.id) === String(activeFloorId));
    if (!currentFloor || !currentFloor.rooms) {
      setCanvasItems([]);
      return;
    }

    const cols = 5;
    const cardW = 152;
    const cardH = 106;
    const gapX = 24;
    const gapY = 24;
    const startX = 32;
    const startY = 72;

    const items: CanvasItem[] = currentFloor.rooms.map((rm, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const id = `room-${rm.id}`;
      const savedPos = savedCanvasPositions[id];
      const x = savedPos ? savedPos.x : startX + col * (cardW + gapX);
      const y = savedPos ? savedPos.y : startY + row * (cardH + gapY);

      return {
        id,
        floorId: String(currentFloor.id),
        roomId: String(rm.id),
        label: `Room ${rm.roomNumber}`,
        shapeType: 'SQUARE',
        category: 'ROOM',
        x,
        y,
        typeId: rm.categoryId ? String(rm.categoryId) : undefined,
        categoryName: rm.categoryName,
        basePrice: rm.basePrice,
        status: rm.status,
        isOccupied: rm.status === 'OCCUPIED'
      };
    });

    setCanvasItems(items);
  }, [activeFloorId, backendFloors, savedCanvasPositions]);

  // Canvas Drag Handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingItemId || !canvasRef.current) return;
      const container = canvasRef.current;
      const rect = container.getBoundingClientRect();

      if (Math.abs(e.clientX - dragStartPosRef.current.x) > 3 || Math.abs(e.clientY - dragStartPosRef.current.y) > 3) {
        hasMovedRef.current = true;
      }

      const mouseCanvasX = (e.clientX - rect.left) + container.scrollLeft;
      const mouseCanvasY = (e.clientY - rect.top) + container.scrollTop;

      let newX = mouseCanvasX - dragOffset.x;
      let newY = mouseCanvasY - dragOffset.y;

      if (snapToGrid) {
        newX = Math.round(newX / 20) * 20;
        newY = Math.round(newY / 20) * 20;
      }

      newX = Math.max(16, newX);
      newY = Math.max(65, newY);

      setCanvasItems(prev =>
        prev.map(it => (it.id === draggingItemId ? { ...it, x: newX, y: newY } : it))
      );
    };

    const handleMouseUp = () => {
      if (draggingItemId) {
        const dragged = canvasItems.find(it => it.id === draggingItemId);
        if (dragged) {
          saveRoomPosition(dragged.id, dragged.x, dragged.y);
        }
      }
      setDraggingItemId(null);
    };

    if (draggingItemId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingItemId, dragOffset, snapToGrid, canvasItems]);

  const handleNodeMouseDown = (e: React.MouseEvent, item: CanvasItem) => {
    e.stopPropagation();
    if (!canvasRef.current) return;
    const container = canvasRef.current;
    const rect = container.getBoundingClientRect();

    setSelectedItemId(item.id);
    setDraggingItemId(item.id);
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    hasMovedRef.current = false;

    const mouseCanvasX = (e.clientX - rect.left) + container.scrollLeft;
    const mouseCanvasY = (e.clientY - rect.top) + container.scrollTop;

    setDragOffset({
      x: mouseCanvasX - item.x,
      y: mouseCanvasY - item.y
    });
  };

  const handleCreateFloor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFloorName.trim()) return;

    const targetBuildingId = activeBuildingId !== 'ALL'
      ? activeBuildingId
      : (buildings[0]?.id || undefined);

    const relevantFloors = backendFloors.filter(f => !targetBuildingId || f.buildingId === targetBuildingId);
    const nextNumber = relevantFloors.length > 0
      ? Math.max(...relevantFloors.map(f => f.floorNumber)) + 1
      : 1;

    try {
      const created = await createFloor({
        floorNumber: nextNumber,
        name: newFloorName.trim(),
        buildingId: targetBuildingId
      });
      setNewFloorName('');
      setShowAddFloorInput(false);
      setActiveFloorId(String(created.id));
    } catch (err: any) {
      alert(err?.message || 'Failed to create floor');
    }
  };

  const handleDeleteFloor = async (floorId: number, floorName: string) => {
    if (!confirm(`Are you sure you want to delete floor "${floorName}"?`)) return;
    try {
      await deleteFloor(floorId);
    } catch (err: any) {
      alert(err?.message || 'Failed to delete floor');
    }
  };

  const handleCycleStatus = async (item: CanvasItem) => {
    if (!item.roomId) return;
    const statusOrder: LiveRoomStatus[] = ['AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE'];
    const currentIdx = statusOrder.indexOf(item.status || 'AVAILABLE');
    const nextStatus = statusOrder[(currentIdx + 1) % statusOrder.length];

    try {
      await apiUpdateRoomStatus(Number(item.roomId), nextStatus);
    } catch (err: any) {
      alert(err?.message || 'Failed to update room status');
    }
  };

  const handleCycleRoomStatus = async (rm: BackendRoom) => {
    const statusOrder: LiveRoomStatus[] = ['AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE'];
    const currentIdx = statusOrder.indexOf(rm.status);
    const nextStatus = statusOrder[(currentIdx + 1) % statusOrder.length];
    try {
      await apiUpdateRoomStatus(rm.id, nextStatus);
    } catch (err: any) {
      alert(err?.message || 'Failed to update room status');
    }
  };

  const handleDeleteRoom = async (roomId: number, roomNumber: string) => {
    if (!confirm(`Are you sure you want to delete room "${roomNumber}"?`)) return;
    try {
      await apiDeleteRoom(roomId);
      if (selectedItemId) setSelectedItemId(null);
    } catch (err: any) {
      alert(err?.message || 'Failed to delete room');
    }
  };

  const handleDeleteCategory = async (catId: number, catName: string) => {
    if (!confirm(`Delete category "${catName}"? Rooms assigned will keep baseline rates.`)) return;
    try {
      await deleteRoomCategory(catId);
    } catch (err: any) {
      alert(err?.message || 'Failed to delete category');
    }
  };

  const handleFloorDrop = async (targetFloor: BackendFloor, buildingFloors: BackendFloor[]) => {
    if (!draggingFloorId || draggingFloorId === targetFloor.id) {
      setDraggingFloorId(null);
      setDragOverFloorDropTarget(null);
      return;
    }

    const sortedFloors = [...buildingFloors].sort((a, b) => a.floorNumber - b.floorNumber);
    const fromIdx = sortedFloors.findIndex(f => f.id === draggingFloorId);
    const toIdx = sortedFloors.findIndex(f => f.id === targetFloor.id);

    if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) {
      setDraggingFloorId(null);
      setDragOverFloorDropTarget(null);
      return;
    }

    const [moved] = sortedFloors.splice(fromIdx, 1);
    sortedFloors.splice(toIdx, 0, moved);
    const bottomToTopIds = sortedFloors.map(f => f.id);

    setDraggingFloorId(null);
    setDragOverFloorDropTarget(null);

    try {
      const bId = targetFloor.buildingId || (buildings[0]?.id ?? 1);
      await reorderFloors({
        buildingId: bId,
        floorIdsBottomToTop: bottomToTopIds
      });
    } catch (err: any) {
      alert(err?.message || 'Failed to reorder floors');
    }
  };

  const handleRoomDropOnFloor = async (targetFloorId: number) => {
    if (!draggingRoomId) {
      setDragOverFloorId(null);
      return;
    }

    const room = backendRooms.find(r => r.id === draggingRoomId);
    if (!room || room.floorId === targetFloorId) {
      setDraggingRoomId(null);
      setDragOverFloorId(null);
      return;
    }

    const roomIdToMove = draggingRoomId;
    setDraggingRoomId(null);
    setDragOverFloorId(null);

    try {
      await updateRoom(roomIdToMove, { floorId: targetFloorId });
    } catch (err: any) {
      alert(err?.message || 'Failed to move room to target floor');
    }
  };

  const activeFloor = backendFloors.find(f => String(f.id) === String(activeFloorId));
  const activeFloorRooms = activeFloor?.rooms || [];

  const totalRoomsCount = layout?.totalRooms ?? backendRooms.length;
  const availableRoomsCount = layout?.availableRooms ?? backendRooms.filter(r => r.status === 'AVAILABLE').length;
  const occupiedRoomsCount = layout?.occupiedRooms ?? backendRooms.filter(r => r.status === 'OCCUPIED').length;
  const cleaningRoomsCount = layout?.cleaningRooms ?? backendRooms.filter(r => r.status === 'CLEANING').length;
  const maintenanceRoomsCount = backendRooms.filter(r => r.status === 'MAINTENANCE').length;
  const attentionRoomsCount = cleaningRoomsCount + maintenanceRoomsCount;

  return (
    <div className="space-y-4 text-left select-none pb-8 font-sans">
      {/* ─── 4 THEMED GLANCEABLE KPI STAT CARDS ──────────────────────────────── */}
      <RoomKpiCards
        totalRoomsCount={totalRoomsCount}
        availableRoomsCount={availableRoomsCount}
        occupiedRoomsCount={occupiedRoomsCount}
        attentionRoomsCount={attentionRoomsCount}
        cleaningRoomsCount={cleaningRoomsCount}
        maintenanceRoomsCount={maintenanceRoomsCount}
        buildings={buildings}
        backendFloors={backendFloors}
        totalFloors={layout?.totalFloors}
      />

      {/* ─── PAGE HEADER & UNIFIED ACTION BAR ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-[var(--foreground)] flex items-center gap-2">
            Rooms &amp; Floor Architecture
            {isLoading && <span className="text-[10px] text-[var(--muted-foreground)] font-normal animate-pulse">Syncing...</span>}
          </h1>
          <p className="text-xs text-[var(--muted-foreground)]">
            Configure campus wings, floor levels, room types, and live property occupancy.
          </p>
        </div>

        {/* Unified "+ New Item" Dropdown Menu */}
        <div className="flex items-center gap-2">
          <Popover open={newItemPopoverOpen} onOpenChange={setNewItemPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                className="h-9 px-3.5 text-xs font-bold rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 shadow-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Item</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-56 p-1.5 rounded-2xl shadow-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]"
              align="end"
            >
              <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-wider text-[var(--muted-foreground)]">
                Create Campus Asset
              </div>
              <button
                type="button"
                onClick={() => {
                  setNewItemPopoverOpen(false);
                  setTargetCreateRoomFloorId(activeFloor ? activeFloor.id : undefined);
                  setShowCreateRoomModal(true);
                }}
                className="w-full px-2.5 py-2 rounded-xl text-left text-xs font-bold hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] flex items-center gap-2 transition-colors cursor-pointer group"
              >
                <BedDouble className="w-3.5 h-3.5 text-[var(--primary)] group-hover:text-[var(--primary-foreground)]" />
                <span>Add Room</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewItemPopoverOpen(false);
                  setShowAddFloorInput(true);
                }}
                className="w-full px-2.5 py-2 rounded-xl text-left text-xs font-bold hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] flex items-center gap-2 transition-colors cursor-pointer group"
              >
                <Layers className="w-3.5 h-3.5 text-[var(--primary)] group-hover:text-[var(--primary-foreground)]" />
                <span>Add Floor Level</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewItemPopoverOpen(false);
                  setShowCreateBuildingModal(true);
                }}
                className="w-full px-2.5 py-2 rounded-xl text-left text-xs font-bold hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] flex items-center gap-2 transition-colors cursor-pointer group"
              >
                <Building2 className="w-3.5 h-3.5 text-[var(--primary)] group-hover:text-[var(--primary-foreground)]" />
                <span>Add Building / Wing</span>
              </button>
              <div className="my-1 border-t border-[var(--border)]" />
              <button
                type="button"
                onClick={() => {
                  setNewItemPopoverOpen(false);
                  setShowCreateCategoryModal(true);
                }}
                className="w-full px-2.5 py-2 rounded-xl text-left text-xs font-bold hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] flex items-center gap-2 transition-colors cursor-pointer group"
              >
                <Tag className="w-3.5 h-3.5 text-[var(--primary)] group-hover:text-[var(--primary-foreground)]" />
                <span>Add Category &amp; Pricing</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewItemPopoverOpen(false);
                  setShowCreateUtilityModal(true);
                }}
                className="w-full px-2.5 py-2 rounded-xl text-left text-xs font-bold hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] flex items-center gap-2 transition-colors cursor-pointer group"
              >
                <Sparkles className="w-3.5 h-3.5 text-[var(--primary)] group-hover:text-[var(--primary-foreground)]" />
                <span>Add Facility &amp; Grounds</span>
              </button>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* ─── MAIN TABS ──────────────────────────────────────────────────────── */}
      {isLoading && buildings.length === 0 ? (
        <CampusLayoutSkeleton />
      ) : (
        <Tabs defaultValue="visual" className="w-full">
          <TabsList className="w-full justify-start border-b border-[var(--border)] rounded-none bg-transparent p-0 h-auto gap-0 overflow-x-auto no-scrollbar">
            <TabsTrigger
              value="visual"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--primary)] font-bold text-xs whitespace-nowrap px-3.5 py-2.5 cursor-pointer"
            >
              Floor Elevation ({backendRooms.length})
            </TabsTrigger>
            <TabsTrigger
              value="list"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--primary)] font-bold text-xs whitespace-nowrap px-3.5 py-2.5 cursor-pointer"
            >
              Room Directory ({backendRooms.length})
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--primary)] font-bold text-xs whitespace-nowrap px-3.5 py-2.5 cursor-pointer"
            >
              Pricing &amp; Categories ({backendCategories.length})
            </TabsTrigger>
            <TabsTrigger
              value="facilities"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--primary)] font-bold text-xs whitespace-nowrap px-3.5 py-2.5 cursor-pointer"
            >
              Campus Facilities ({backendUtilities.length})
            </TabsTrigger>
            <TabsTrigger
              value="generator"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--primary)] font-bold text-xs whitespace-nowrap px-3.5 py-2.5 cursor-pointer"
            >
              Bulk Generator
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: VISUAL ELEVATION / 2D CANVAS */}
          <TabsContent value="visual" className="pt-3 space-y-4">
            {/* Building wings selector pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                type="button"
                onClick={() => handleSelectBuilding('ALL')}
                className={cn(
                  'h-8 px-3 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer',
                  activeBuildingId === 'ALL'
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs'
                    : 'bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]/50'
                )}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>All Wings</span>
                <span className={cn(
                  'ml-1 px-1.5 py-0.2 rounded-md font-mono text-[10px]',
                  activeBuildingId === 'ALL' ? 'bg-white/20 text-white' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                )}>
                  {backendRooms.length}
                </span>
              </button>

              {buildings.map(b => {
                const isSelected = activeBuildingId === b.id;
                return (
                  <div
                    key={b.id}
                    className={cn(
                      'h-8 px-3 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer group',
                      isSelected
                        ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs'
                        : 'bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]/50'
                    )}
                    onClick={() => handleSelectBuilding(b.id)}
                  >
                    <span>{b.name}</span>
                    <span className={cn(
                      'px-1.5 py-0.2 rounded-md font-mono text-[10px]',
                      isSelected ? 'bg-white/20 text-white' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                    )}>
                      {b.roomCount}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingBuilding(b);
                      }}
                      className={cn(
                        'p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer',
                        isSelected ? 'hover:bg-white/20 text-white' : 'hover:bg-[var(--muted)] text-[var(--muted-foreground)]'
                      )}
                      title="Edit Wing"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => setShowCreateBuildingModal(true)}
                className="h-8 px-2.5 rounded-xl border border-dashed border-[var(--primary)]/40 hover:border-[var(--primary)] hover:bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-bold shrink-0 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Wing</span>
              </button>
            </div>

            {/* Quick Status Filters & Controls */}
            <div className="p-2.5 bg-[var(--card)] border border-[var(--border)] rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] mr-1">Filter:</span>
                {(['ALL', 'AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE'] as const).map(st => {
                  const isSelected = quickStatusFilter === st;
                  const count = st === 'ALL'
                    ? backendRooms.filter(r => activeBuildingId === 'ALL' || r.buildingId === activeBuildingId).length
                    : backendRooms.filter(r => (activeBuildingId === 'ALL' || r.buildingId === activeBuildingId) && r.status === st).length;

                  let badgeColor = 'text-[var(--foreground)]';
                  if (st === 'AVAILABLE') badgeColor = 'text-[var(--primary)]';
                  if (st === 'OCCUPIED') badgeColor = 'text-[var(--foreground)]';
                  if (st === 'CLEANING') badgeColor = 'text-[var(--muted-foreground)]';
                  if (st === 'MAINTENANCE') badgeColor = 'text-[var(--destructive)]';

                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setQuickStatusFilter(st)}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer',
                        isSelected
                          ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-2xs'
                          : 'bg-[var(--muted)]/50 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]'
                      )}
                    >
                      <span>{st === 'ALL' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()}</span>
                      <span className={cn(
                        'px-1 py-0.2 rounded text-[10px] font-mono',
                        isSelected ? 'bg-white/20 text-white' : badgeColor
                      )}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Elevation vs 2D Canvas Toggle */}
                <div className="flex items-center rounded-xl bg-[var(--muted)]/50 p-0.5 border border-[var(--border)]">
                  <button
                    type="button"
                    onClick={() => setActiveFloorId('ALL')}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer',
                      activeFloorId === 'ALL'
                        ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs font-extrabold'
                        : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                    )}
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-[var(--primary)]" />
                    <span>Elevation</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (activeFloorId === 'ALL' && displayedFloors.length > 0) {
                        setActiveFloorId(String(displayedFloors[0].id));
                      }
                    }}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer',
                      activeFloorId !== 'ALL'
                        ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs font-extrabold'
                        : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                    )}
                  >
                    <LayoutGrid className="w-3.5 h-3.5 text-[var(--primary)]" />
                    <span>2D Canvas</span>
                  </button>
                </div>

                {activeFloorId !== 'ALL' && displayedFloors.length > 0 && (
                  <div className="flex items-center gap-1.5 bg-[var(--muted)]/50 px-2 py-0.5 rounded-xl border border-[var(--border)]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Level:</span>
                    <Select value={activeFloorId} onValueChange={setActiveFloorId}>
                      <SelectTrigger className="h-7 text-xs font-bold rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] px-2 shadow-2xs w-auto min-w-[140px]">
                        <SelectValue placeholder="Select Floor" />
                      </SelectTrigger>
                      <SelectContent>
                        {displayedFloors.map(f => (
                          <SelectItem key={f.id} value={String(f.id)}>
                            L{f.floorNumber} — {f.name} ({f.rooms?.length || 0} rms)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {activeFloorId === 'ALL' && (
                  <button
                    type="button"
                    onClick={handleToggleAllBuildings}
                    className="h-8 px-2.5 rounded-xl bg-[var(--background)] hover:bg-[var(--muted)] border border-[var(--border)] text-xs font-bold text-[var(--foreground)] transition-all flex items-center gap-1 cursor-pointer"
                    title={areAllBuildingsCollapsed ? 'Expand all buildings' : 'Collapse all buildings'}
                  >
                    {areAllBuildingsCollapsed ? (
                      <>
                        <ChevronDown className="w-3.5 h-3.5 text-[var(--primary)]" /> Expand
                      </>
                    ) : (
                      <>
                        <ChevronRight className="w-3.5 h-3.5 text-[var(--primary)]" /> Collapse
                      </>
                    )}
                  </button>
                )}

                {showAddFloorInput ? (
                  <form onSubmit={handleCreateFloor} className="flex items-center gap-1">
                    <Input
                      placeholder="Floor Name (e.g. Ground Floor)"
                      value={newFloorName}
                      onChange={e => setNewFloorName(e.target.value)}
                      className="h-8 text-xs rounded-xl w-36"
                      autoFocus
                    />
                    <Button type="submit" size="sm" className="h-8 text-xs font-bold rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 px-2.5">
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs rounded-xl px-2 cursor-pointer"
                      onClick={() => setShowAddFloorInput(false)}
                    >
                      Cancel
                    </Button>
                  </form>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAddFloorInput(true)}
                    className="h-8 text-xs font-bold rounded-xl border-[var(--border)] gap-1 text-[var(--foreground)] cursor-pointer"
                    title="Add Floor Level"
                  >
                    <Plus className="w-3.5 h-3.5 text-[var(--primary)]" /> Add Floor
                  </Button>
                )}
              </div>
            </div>

            {/* View A: Elevation or View B: 2D Canvas */}
            {activeFloorId === 'ALL' ? (
              <CampusElevationView
                campusBuildings={campusBuildings}
                activeBuildingId={activeBuildingId}
                collapsedBuildingIds={collapsedBuildingIds}
                toggleBuildingCollapse={toggleBuildingCollapse}
                quickStatusFilter={quickStatusFilter}
                draggingFloorId={draggingFloorId}
                setDraggingFloorId={setDraggingFloorId}
                dragOverFloorDropTarget={dragOverFloorDropTarget}
                setDragOverFloorDropTarget={setDragOverFloorDropTarget}
                draggingRoomId={draggingRoomId}
                setDraggingRoomId={setDraggingRoomId}
                dragOverFloorId={dragOverFloorId}
                setDragOverFloorId={setDragOverFloorId}
                onFloorDrop={handleFloorDrop}
                onRoomDropOnFloor={handleRoomDropOnFloor}
                onAddFloorToBuilding={(bId) => {
                  setShowAddFloorInput(true);
                  setActiveBuildingId(bId);
                }}
                onEditBuilding={setEditingBuilding}
                onAddRoomToFloor={(floorId) => {
                  setTargetCreateRoomFloorId(floorId);
                  setShowCreateRoomModal(true);
                }}
                onEditFloor={setEditingFloor}
                onDeleteFloor={handleDeleteFloor}
                onSelectDrawerRoom={setSelectedDrawerRoom}
                onEditRoom={setEditingRoom}
                onDeleteRoom={handleDeleteRoom}
                onCycleRoomStatus={handleCycleRoomStatus}
              />
            ) : (
              <RoomCanvasPlan
                canvasItems={canvasItems}
                activeFloor={activeFloor}
                activeFloorRooms={activeFloorRooms}
                backendRooms={backendRooms}
                backendFloors={backendFloors}
                selectedItemId={selectedItemId}
                draggingItemId={draggingItemId}
                canvasRef={canvasRef}
                hasMovedRef={hasMovedRef}
                onNodeMouseDown={handleNodeMouseDown}
                onCycleStatus={handleCycleStatus}
                onSelectDrawerRoom={setSelectedDrawerRoom}
                onEditRoom={setEditingRoom}
                onDeleteRoom={(roomId, label) => handleDeleteRoom(roomId, label)}
                onAddRoomHere={() => {
                  setTargetCreateRoomFloorId(activeFloor ? activeFloor.id : undefined);
                  setShowCreateRoomModal(true);
                }}
                onAddFirstFloor={() => setShowAddFloorInput(true)}
              />
            )}
          </TabsContent>

          {/* TAB 2: ROOM DIRECTORY */}
          <TabsContent value="list">
            <RoomDirectoryTable
              backendRooms={backendRooms}
              buildings={buildings}
              backendFloors={backendFloors}
              onUpdateStatus={apiUpdateRoomStatus}
              onEditRoom={setEditingRoom}
              onDeleteRoom={handleDeleteRoom}
            />
          </TabsContent>

          {/* TAB 3: CATEGORIES */}
          <TabsContent value="categories">
            <RoomCategoriesTab
              categories={backendCategories}
              onAddCategory={() => setShowCreateCategoryModal(true)}
              onEditCategory={setEditingCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          </TabsContent>

          {/* TAB 4: FACILITIES */}
          <TabsContent value="facilities">
            <RoomFacilitiesTab
              utilities={backendUtilities}
              buildings={buildings}
              onAddFacility={() => setShowCreateUtilityModal(true)}
              onEditFacility={setEditingUtility}
              onDeleteFacility={async (id, name) => {
                if (confirm(`Delete facility "${name}"?`)) {
                  await deleteUtility(id);
                }
              }}
              onUpdateStatus={apiUpdateUtilityStatus}
            />
          </TabsContent>

          {/* TAB 5: BULK GENERATOR */}
          <TabsContent value="generator">
            <BulkRoomGeneratorTab
              floors={backendFloors}
              categories={backendCategories}
              onGenerate={createBulkRooms}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* ─── SLIDE-OVER ROOM DETAIL DRAWER ─────────────────────────────────── */}
      <RoomDetailDrawer
        room={selectedDrawerRoom}
        isOpen={!!selectedDrawerRoom}
        onClose={() => setSelectedDrawerRoom(null)}
        onEdit={(rm) => setEditingRoom(rm)}
        onDelete={(id, num) => handleDeleteRoom(id, num)}
        onUpdateStatus={async (id, status) => {
          await apiUpdateRoomStatus(id, status);
          if (selectedDrawerRoom && selectedDrawerRoom.id === id) {
            setSelectedDrawerRoom({ ...selectedDrawerRoom, status });
          }
        }}
      />

      <CreateBuildingModal
        isOpen={showCreateBuildingModal}
        onClose={() => setShowCreateBuildingModal(false)}
        onSubmit={createBuilding}
      />

      <EditBuildingModal
        isOpen={!!editingBuilding}
        onClose={() => setEditingBuilding(null)}
        building={editingBuilding}
        onSubmit={updateBuilding}
        onDelete={deleteBuilding}
      />

      <CreateUtilityModal
        isOpen={showCreateUtilityModal}
        onClose={() => setShowCreateUtilityModal(false)}
        buildings={buildings}
        floors={backendFloors}
        defaultBuildingId={activeBuildingId !== 'ALL' ? activeBuildingId : undefined}
        onSubmit={createUtility}
      />

      <EditUtilityModal
        isOpen={!!editingUtility}
        onClose={() => setEditingUtility(null)}
        utility={editingUtility}
        buildings={buildings}
        floors={backendFloors}
        onSubmit={updateUtility}
        onDelete={deleteUtility}
      />

      <CreateCategoryModal
        isOpen={showCreateCategoryModal}
        onClose={() => setShowCreateCategoryModal(false)}
        onSubmit={createRoomCategory}
      />

      <CreateRoomModal
        isOpen={showCreateRoomModal}
        onClose={() => setShowCreateRoomModal(false)}
        floors={backendFloors}
        categories={backendCategories}
        defaultFloorId={targetCreateRoomFloorId || (activeFloorId !== 'ALL' ? Number(activeFloorId) : undefined)}
        onSubmit={createRoom}
      />

      <EditFloorModal
        isOpen={!!editingFloor}
        onClose={() => setEditingFloor(null)}
        floor={editingFloor}
        buildings={buildings}
        onSubmit={updateFloor}
      />

      <EditCategoryModal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        category={editingCategory}
        onSubmit={updateRoomCategory}
      />

      <EditRoomModal
        isOpen={!!editingRoom}
        onClose={() => setEditingRoom(null)}
        room={editingRoom}
        floors={backendFloors}
        categories={backendCategories}
        onSubmit={updateRoom}
      />
    </div>
  );
};
