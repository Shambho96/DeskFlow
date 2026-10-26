import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Layers,
  PlusCircle,
  Sparkles,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  BedDouble,
  Tag,
  Pencil,
  Building2,
  GripVertical,
  Clock,
  Users,
  DollarSign,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  LayoutGrid
} from 'lucide-react';
import { useRooms } from '../hooks/useRooms';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { Popover, PopoverTrigger, PopoverContent } from '../components/ui/Popover';
import { formatCurrency, cn } from '../lib/utils';
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
import type {
  LiveRoomStatus,
  BackendFloor,
  BackendRoomCategory,
  BackendRoom,
  BackendBuilding,
  BackendUtility
} from '../types/hotel';

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
  status?: LiveRoomStatus;
  isOccupied?: boolean;
}

export const RoomsPage: React.FC = () => {
  // ─── Live Backend Hook ─────────────────────────────────────────────────────
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

  // ─── Building & Floor Selection ───────────────────────────────────────────
  const [activeBuildingId, setActiveBuildingId] = useState<'ALL' | number>('ALL');
  // activeFloorId can be 'ALL' for Elevation Stack, or a specific floor id string
  const [activeFloorId, setActiveFloorId] = useState<string>('ALL');
  const [selectedDrawerRoom, setSelectedDrawerRoom] = useState<BackendRoom | null>(null);
  const [newItemPopoverOpen, setNewItemPopoverOpen] = useState(false);
  const [quickStatusFilter, setQuickStatusFilter] = useState<'ALL' | LiveRoomStatus>('ALL');

  // Filtered floors based on active building
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

  // Drag and Drop state
  const [draggingRoomId, setDraggingRoomId] = useState<number | null>(null);
  const [dragOverFloorId, setDragOverFloorId] = useState<number | null>(null);
  const [draggingFloorId, setDraggingFloorId] = useState<number | null>(null);
  const [dragOverFloorDropTarget, setDragOverFloorDropTarget] = useState<number | null>(null);

  // Collapsible Building Views state
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
      // Expand all visible buildings
      setCollapsedBuildingIds(prev => {
        const next = { ...prev };
        visibleCampusBuildings.forEach(cb => {
          delete next[cb.building.id];
        });
        return next;
      });
    } else {
      // Collapse all visible buildings
      setCollapsedBuildingIds(prev => {
        const next = { ...prev };
        visibleCampusBuildings.forEach(cb => {
          next[cb.building.id] = true;
        });
        return next;
      });
    }
  };

  // Bulk Generator State
  const [genFloorId, setGenFloorId] = useState<string>('');
  const [genCategoryId, setGenCategoryId] = useState<string>('');
  const [genStartNum, setGenStartNum] = useState<number>(101);
  const [genEndNum, setGenEndNum] = useState<number>(110);
  const [genPrefix, setGenPrefix] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (backendFloors.length > 0) {
      setGenFloorId(prev => prev || String(backendFloors[0].id));
    }
    if (backendCategories.length > 0) {
      setGenCategoryId(prev => prev || String(backendCategories[0].id));
    }
  }, [backendFloors, backendCategories]);

  // Directory Table Filters
  const [directorySearch, setDirectorySearch] = useState('');
  const [directoryBuildingFilter, setDirectoryBuildingFilter] = useState<'ALL' | number>('ALL');
  const [directoryFloorFilter, setDirectoryFloorFilter] = useState('ALL');
  const [directoryStatusFilter, setDirectoryStatusFilter] = useState('ALL');

  // ─── 2D Canvas State, Grid Snapping & Position Memory ──────────────────────
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedRef = useRef<boolean>(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Position memory: persists room coordinates across renders and floor switches
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

  const handleResetCanvasLayout = () => {
    if (!activeFloorId || activeFloorId === 'ALL') return;
    const currentFloor = backendFloors.find(f => String(f.id) === String(activeFloorId));
    if (!currentFloor || !currentFloor.rooms) return;

    const cols = 5;
    const cardW = 152;
    const cardH = 106;
    const gapX = 24;
    const gapY = 24;
    const startX = 32;
    const startY = 72;

    const updatedSaved = { ...savedCanvasPositions };
    const items: CanvasItem[] = currentFloor.rooms.map((rm, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = startX + col * (cardW + gapX);
      const y = startY + row * (cardH + gapY);
      const id = `room-${rm.id}`;
      updatedSaved[id] = { x, y };
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

    setSavedCanvasPositions(updatedSaved);
    try {
      localStorage.setItem('hrm_canvas_room_positions', JSON.stringify(updatedSaved));
    } catch {}
    setCanvasItems(items);
  };

  // Sync canvas items with active floor rooms from backend
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
  }, [activeFloorId, backendFloors]);

  // Canvas drag handlers
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

  // ─── Actions ─────────────────────────────────────────────────────────────

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
    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) return;
    try {
      await deleteRoomCategory(catId);
    } catch (err: any) {
      alert(err?.message || 'Failed to delete category');
    }
  };

  const handleUpdateStatus = async (roomId: number, newStatus: LiveRoomStatus) => {
    try {
      await apiUpdateRoomStatus(roomId, newStatus);
    } catch (err: any) {
      alert(err?.message || 'Failed to update room status');
    }
  };

  const handleDrawerUpdateStatus = async (roomId: number, newStatus: LiveRoomStatus) => {
    await handleUpdateStatus(roomId, newStatus);
    setSelectedDrawerRoom(prev => (prev && prev.id === roomId ? { ...prev, status: newStatus } : prev));
  };

  const handleBulkGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genFloorId || !genCategoryId) {
      alert('Please select both a floor and a category.');
      return;
    }
    if (genStartNum > genEndNum) {
      alert('Start room number cannot be greater than end room number.');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await createBulkRooms({
        floorId: Number(genFloorId),
        categoryId: Number(genCategoryId),
        startNumber: Number(genStartNum),
        endNumber: Number(genEndNum),
        prefix: genPrefix.trim() || undefined
      });
      alert(`🎉 ${res.message}`);
      setActiveFloorId(String(genFloorId));
    } catch (err: any) {
      alert(err?.message || 'Failed to generate rooms');
    } finally {
      setIsGenerating(false);
    }
  };

  // Node Drag Start on Canvas
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

  // ─── Free-Hand Floor Reordering (Physical Elevation: Lowest at Bottom) ─────
  const handleFloorDrop = async (targetFloor: BackendFloor, buildingFloors: BackendFloor[]) => {
    if (!draggingFloorId || draggingFloorId === targetFloor.id) {
      setDraggingFloorId(null);
      setDragOverFloorDropTarget(null);
      return;
    }

    // Sort current floors by floorNumber ascending (Option 1: 1 = lowest floor, N = highest floor)
    const sortedFloors = [...buildingFloors].sort((a, b) => a.floorNumber - b.floorNumber);

    const fromIdx = sortedFloors.findIndex(f => f.id === draggingFloorId);
    const toIdx = sortedFloors.findIndex(f => f.id === targetFloor.id);

    if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) {
      setDraggingFloorId(null);
      setDragOverFloorDropTarget(null);
      return;
    }

    // Move floor in array
    const [moved] = sortedFloors.splice(fromIdx, 1);
    sortedFloors.splice(toIdx, 0, moved);

    // Bottom to top ids: index 0 = lowest floor (Level 1), index N-1 = highest floor (Level N)
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

  // ─── Free-Hand Room Drag-and-Drop Across Floors ─────────────────────────────
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

  // ─── Filtered Room Directory List ─────────────────────────────────────────
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

  const activeFloor = backendFloors.find(f => String(f.id) === String(activeFloorId));
  const activeFloorRooms = activeFloor?.rooms || [];

  // ─── Metrics Calculation ──────────────────────────────────────────────────
  const totalRoomsCount = layout?.totalRooms ?? backendRooms.length;
  const availableRoomsCount = layout?.availableRooms ?? backendRooms.filter(r => r.status === 'AVAILABLE').length;
  const occupiedRoomsCount = layout?.occupiedRooms ?? backendRooms.filter(r => r.status === 'OCCUPIED').length;
  const cleaningRoomsCount = layout?.cleaningRooms ?? backendRooms.filter(r => r.status === 'CLEANING').length;
  const maintenanceRoomsCount = backendRooms.filter(r => r.status === 'MAINTENANCE').length;
  const attentionRoomsCount = cleaningRoomsCount + maintenanceRoomsCount;

  return (
    <div className="space-y-4 text-left select-none pb-8 font-sans">
      {/* ─── 4 THEMED GLANCEABLE KPI STAT CARDS ──────────────────────────────── */}
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
            {buildings.length} Wings • {layout?.totalFloors ?? backendFloors.length} Floors
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

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: CAMPUS SPACE DESIGNER & ELEVATION VIEW                        */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="visual" className="pt-3 space-y-4">
          {/* ─── BUILDING WINGS SELECTOR PILLS BAR ────────────────────────────── */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => handleSelectBuilding('ALL')}
              className={cn(
                "h-8 px-3 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer",
                activeBuildingId === 'ALL'
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs"
                  : "bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]/50"
              )}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>All Wings</span>
              <span className={cn(
                "ml-1 px-1.5 py-0.2 rounded-md font-mono text-[10px]",
                activeBuildingId === 'ALL' ? "bg-white/20 text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"
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
                    "h-8 px-3 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer group",
                    isSelected
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs"
                      : "bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]/50"
                  )}
                  onClick={() => handleSelectBuilding(b.id)}
                >
                  <span>{b.name}</span>
                  <span className={cn(
                    "px-1.5 py-0.2 rounded-md font-mono text-[10px]",
                    isSelected ? "bg-white/20 text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"
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
                      "p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity",
                      isSelected ? "hover:bg-white/20 text-white" : "hover:bg-[var(--muted)] text-[var(--muted-foreground)]"
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

          {/* ─── STATUS FILTER BAR & ELEVATION CONTROLS ───────────────────────── */}
          <div className="p-2.5 bg-[var(--card)] border border-[var(--border)] rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
            {/* Quick Status Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] mr-1">Filter:</span>
              {(['ALL', 'AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE'] as const).map(st => {
                const isSelected = quickStatusFilter === st;
                const count = st === 'ALL'
                  ? backendRooms.filter(r => activeBuildingId === 'ALL' || r.buildingId === activeBuildingId).length
                  : backendRooms.filter(r => (activeBuildingId === 'ALL' || r.buildingId === activeBuildingId) && r.status === st).length;

                let badgeColor = 'text-[var(--foreground)]';
                if (st === 'AVAILABLE') badgeColor = 'text-emerald-600 dark:text-emerald-400';
                if (st === 'OCCUPIED') badgeColor = 'text-blue-600 dark:text-blue-400';
                if (st === 'CLEANING') badgeColor = 'text-amber-600 dark:text-amber-400';
                if (st === 'MAINTENANCE') badgeColor = 'text-[var(--destructive)]';

                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setQuickStatusFilter(st)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                      isSelected
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-2xs"
                        : "bg-[var(--muted)]/50 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                    )}
                  >
                    <span>{st === 'ALL' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()}</span>
                    <span className={cn(
                      "px-1 py-0.2 rounded text-[10px] font-mono",
                      isSelected ? "bg-white/20 text-white" : badgeColor
                    )}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Controls: View Switcher & Floor Actions */}
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

              {/* Floor Level Selector (shown when in 2D Canvas mode) */}
              {activeFloorId !== 'ALL' && displayedFloors.length > 0 && (
                <div className="flex items-center gap-1.5 bg-[var(--muted)]/50 px-2 py-0.5 rounded-xl border border-[var(--border)]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Level:</span>
                  <select
                    value={activeFloorId}
                    onChange={e => setActiveFloorId(e.target.value)}
                    className="h-7 text-xs font-bold rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] px-2 cursor-pointer shadow-2xs"
                  >
                    {displayedFloors.map(f => (
                      <option key={f.id} value={String(f.id)}>
                        L{f.floorNumber} — {f.name} ({f.rooms?.length || 0} rms)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Expand / Collapse All */}
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

              {/* Add Floor Button / Form */}
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
                    className="h-8 text-xs rounded-xl px-2"
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
                  className="h-8 text-xs font-bold rounded-xl border-[var(--border)] gap-1 text-[var(--foreground)]"
                  title="Add Floor Level"
                >
                  <Plus className="w-3.5 h-3.5 text-[var(--primary)]" /> Add Floor
                </Button>
              )}
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* VIEW A: PHYSICAL BUILDING ELEVATION STACK (ALL FLOORS)                */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {activeFloorId === 'ALL' ? (
            <div className="space-y-6">


              {/* Group by Building */}
              {campusBuildings
                .filter(cb => activeBuildingId === 'ALL' || cb.building.id === activeBuildingId)
                .map(cb => {
                  const isCollapsed = !!collapsedBuildingIds[cb.building.id];

                  // compute status summary for this building
                  const buildingRooms = (cb.floors || []).flatMap(f => f.rooms || []);
                  const bAvailable = buildingRooms.filter(r => r.status === 'AVAILABLE').length;
                  const bOccupied = buildingRooms.filter(r => r.status === 'OCCUPIED').length;
                  const bCleaning = buildingRooms.filter(r => r.status === 'CLEANING').length;
                  const bMaintenance = buildingRooms.filter(r => r.status === 'MAINTENANCE').length;

                  // Sort floors according to Option 1:
                  // Physical display: Penthouse/Rooftop on top (highest floorNumber), Ground level on bottom (lowest floorNumber)
                  const buildingFloorsElevation = [...(cb.floors || [])].sort(
                    (a, b) => b.floorNumber - a.floorNumber
                  );

                  return (
                    <div
                      key={cb.building.id}
                      className={cn(
                        "rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-md transition-all",
                        isCollapsed ? "p-4 space-y-2.5" : "p-5 space-y-4"
                      )}
                    >
                      {/* Building Header (Clickable to Collapse / Expand) */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border)]">
                        <div
                          onClick={() => toggleBuildingCollapse(cb.building.id)}
                          className="flex items-center gap-2.5 cursor-pointer group select-none flex-1"
                          title={isCollapsed ? 'Click to expand building floors & facilities' : 'Click to collapse building'}
                        >
                          {/* Collapse / Expand Chevron Icon Button */}
                          <div className="w-7 h-7 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] group-hover:bg-[var(--primary)]/20 group-hover:scale-105 flex items-center justify-center transition-all shrink-0">
                            {isCollapsed ? (
                              <ChevronRight className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
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
                              setShowAddFloorInput(true);
                              setActiveBuildingId(cb.building.id);
                            }}
                            className="h-8 text-xs font-bold rounded-xl border-[var(--border)] gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Floor Level
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingBuilding(cb.building);
                            }}
                            className="h-8 text-xs font-bold rounded-xl border-[var(--border)] gap-1"
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
                            className="h-8 text-xs font-bold rounded-xl px-2.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] gap-1"
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

                      {/* When Collapsed: Quick Summary Strip */}
                      {isCollapsed ? (
                        <div
                          onClick={() => toggleBuildingCollapse(cb.building.id)}
                          className="p-3 bg-[var(--muted)]/30 hover:bg-[var(--muted)]/50 rounded-2xl border border-dashed border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-2 text-[11px] text-[var(--muted-foreground)] flex-wrap">
                            <span className="font-bold text-[var(--foreground)]">Quick Breakdown:</span>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                              {bAvailable} Available
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20">
                              {bOccupied} Occupied
                            </span>
                            {bCleaning > 0 && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
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
                        <>
                          {/* PHYSICAL VERTICAL ELEVATION STACK */}
                      <div className="space-y-3">
                        {buildingFloorsElevation.length === 0 ? (
                          <div className="p-8 text-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--muted)]/20">
                            <Layers className="w-8 h-8 text-[var(--muted-foreground)] mx-auto mb-2 opacity-50" />
                            <p className="text-xs font-bold text-[var(--foreground)]">No floors added to {cb.building.name} yet</p>
                            <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">Click "Add Floor Level" above to create Floor 1.</p>
                          </div>
                        ) : (
                          buildingFloorsElevation.map((floor) => {
                            const isFloorDragTarget = dragOverFloorDropTarget === floor.id;
                            const isRoomDropTarget = dragOverFloorId === floor.id;
                            const isBeingDragged = draggingFloorId === floor.id;

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
                                    handleFloorDrop(floor, cb.floors || []);
                                  } else if (draggingRoomId) {
                                    handleRoomDropOnFloor(floor.id);
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
                                    {/* Vertical Drag Grip Handle for Floor Level */}
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

                                    {/* Level Badge */}
                                    <span className="px-2.5 py-1 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] font-mono text-xs font-black tracking-tight border border-[var(--primary)]/20">
                                      Level {floor.floorNumber}
                                    </span>

                                    <div>
                                      <span className="font-extrabold text-xs text-[var(--foreground)]">
                                        {floor.name}
                                      </span>
                                      <span className="ml-2 text-[10px] text-[var(--muted-foreground)]">
                                        ({floor.rooms?.length || 0} rooms)
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setTargetCreateRoomFloorId(floor.id);
                                        setShowCreateRoomModal(true);
                                      }}
                                      className="h-7 text-[11px] font-bold rounded-lg px-2 gap-1 text-[var(--primary)] hover:bg-[var(--primary)]/10"
                                    >
                                      <Plus className="w-3 h-3" /> Add Room Here
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setEditingFloor(floor)}
                                      className="h-7 text-[11px] font-bold rounded-lg px-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                                      title="Edit Floor"
                                    >
                                      <Pencil className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDeleteFloor(floor.id, floor.name)}
                                      className="h-7 text-[11px] font-bold rounded-lg px-2 text-[var(--muted-foreground)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10"
                                      title="Delete Floor"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Rooms Container on this Floor (Minimalist Draggable Cards) */}
                                {(() => {
                                  const floorRoomsFiltered = (floor.rooms || []).filter(room => {
                                    if (quickStatusFilter === 'ALL') return true;
                                    return room.status === quickStatusFilter;
                                  });

                                  if (floorRoomsFiltered.length === 0) {
                                    return (
                                      <div className="py-4 text-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--muted)]/10">
                                        <p className="text-[11px] text-[var(--muted-foreground)] italic">
                                          {floor.rooms && floor.rooms.length > 0
                                            ? `No rooms on Level ${floor.floorNumber} with status "${quickStatusFilter}"`
                                            : 'Empty level — Drag a room here or click "Add Room Here".'}
                                        </p>
                                      </div>
                                    );
                                  }

                                  return (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                                      {floorRoomsFiltered.map(room => {
                                        let statusBg = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
                                        let statusDot = 'bg-emerald-500';
                                        if (room.status === 'OCCUPIED') {
                                          statusBg = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
                                          statusDot = 'bg-blue-500';
                                        } else if (room.status === 'CLEANING') {
                                          statusBg = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
                                          statusDot = 'bg-amber-500';
                                        } else if (room.status === 'MAINTENANCE') {
                                          statusBg = 'bg-[var(--destructive)]/10 text-[var(--destructive)] border-[var(--destructive)]/30';
                                          statusDot = 'bg-[var(--destructive)]';
                                        }

                                        const isBeingDragged = draggingRoomId === room.id;

                                        return (
                                          <div
                                            key={room.id}
                                            draggable
                                            onDragStart={e => {
                                              setDraggingRoomId(room.id);
                                              e.dataTransfer.setData('text/plain', `room:${room.id}`);
                                            }}
                                            onDragEnd={() => {
                                              setDraggingRoomId(null);
                                              setDragOverFloorId(null);
                                            }}
                                            onClick={() => setSelectedDrawerRoom(room)}
                                            className={cn(
                                              'group p-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)] hover:shadow-md transition-all cursor-pointer select-none flex flex-col justify-between min-h-[96px] relative',
                                              isBeingDragged && 'opacity-40 scale-95 border-dashed border-[var(--primary)]'
                                            )}
                                          >
                                            {/* Top: Room # & Nightly Rate */}
                                            <div className="flex items-center justify-between gap-1">
                                              <span className="font-mono text-xs font-black text-[var(--foreground)] tracking-tight">
                                                #{room.roomNumber}
                                              </span>
                                              <span className="font-mono text-xs font-bold text-[var(--primary)]">
                                                {formatCurrency(room.basePrice).replace('.00', '')}
                                              </span>
                                            </div>

                                            {/* Category / Name */}
                                            <div className="my-1.5">
                                              {room.customName ? (
                                                <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 truncate flex items-center gap-1" title={room.customName}>
                                                  <Sparkles className="w-3 h-3 shrink-0" />
                                                  <span className="truncate">{room.customName}</span>
                                                </div>
                                              ) : (
                                                <div className="text-[11px] font-medium text-[var(--muted-foreground)] truncate" title={room.categoryName || 'Standard Room'}>
                                                  {room.categoryName || 'Standard Room'}
                                                </div>
                                              )}
                                            </div>

                                            {/* 1-Click Status Pill */}
                                            <button
                                              type="button"
                                              onClick={e => {
                                                e.stopPropagation();
                                                const statusOrder: LiveRoomStatus[] = ['AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE'];
                                                const currentIdx = statusOrder.indexOf(room.status);
                                                const nextStatus = statusOrder[(currentIdx + 1) % statusOrder.length];
                                                handleUpdateStatus(room.id, nextStatus);
                                              }}
                                              className={cn(
                                                'w-full py-1 px-2 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all hover:opacity-90 active:scale-95 cursor-pointer shadow-2xs',
                                                statusBg
                                              )}
                                              title="Click to cycle status"
                                            >
                                              <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', statusDot)} />
                                              <span>{room.status}</span>
                                            </button>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  );
                                })()}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
            </div>
          ) : (
            /* ═════════════════════════════════════════════════════════════════ */
            /* VIEW B: 2D FLOOR PLAN CANVAS (FOR SINGLE FLOOR SELECTION)          */
            /* ═════════════════════════════════════════════════════════════════ */
            <div
              className="w-full h-[640px] min-h-[640px] bg-[var(--card)] border border-[var(--border)] rounded-3xl relative overflow-hidden shadow-inner flex flex-col"
            >
              {/* Top Architectural Toolbar overlay */}
              <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
                {/* Left: Active Floor Level Switcher & Live Stats */}
                <div className="flex items-center gap-2 bg-[var(--card)]/95 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-[var(--border)] shadow-md text-xs pointer-events-auto">
                  <Layers className="w-4 h-4 text-[var(--primary)] shrink-0" />
                  <select
                    value={activeFloorId}
                    onChange={e => setActiveFloorId(e.target.value)}
                    className="bg-transparent font-extrabold text-xs text-[var(--foreground)] cursor-pointer border-none outline-none pr-2"
                  >
                    {displayedFloors.map(f => (
                      <option key={f.id} value={String(f.id)} className="bg-[var(--card)] text-[var(--foreground)]">
                        Level {f.floorNumber}: {f.name} ({f.rooms?.length || 0} rooms)
                      </option>
                    ))}
                  </select>

                  <div className="h-4 w-px bg-[var(--border)]" />

                  <div className="flex items-center gap-2 text-[10px] font-bold">
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {activeFloorRooms.filter(r => r.status === 'AVAILABLE').length} Vacant
                    </span>
                    <span>•</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      {activeFloorRooms.filter(r => r.status === 'OCCUPIED').length} Occupied
                    </span>
                    {activeFloorRooms.some(r => r.status === 'CLEANING' || r.status === 'MAINTENANCE') && (
                      <>
                        <span>•</span>
                        <span className="text-amber-600 dark:text-amber-400">
                          {activeFloorRooms.filter(r => r.status === 'CLEANING' || r.status === 'MAINTENANCE').length} Attention
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right: Actions (Auto-Arrange, Snap, Add Room) */}
                <div className="flex items-center gap-1.5 bg-[var(--card)]/95 backdrop-blur-md p-1.5 rounded-2xl border border-[var(--border)] shadow-md text-xs pointer-events-auto">
                  <button
                    type="button"
                    onClick={handleResetCanvasLayout}
                    className="h-8 px-2.5 rounded-xl font-bold text-[10px] bg-[var(--muted)]/50 hover:bg-[var(--muted)] text-[var(--foreground)] transition-all cursor-pointer flex items-center gap-1 border border-[var(--border)]"
                    title="Auto-arrange rooms into a clean blueprint grid"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[var(--primary)]" />
                    <span>Auto-Arrange</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSnapToGrid(!snapToGrid)}
                    className={cn(
                      'h-8 px-2.5 rounded-xl font-bold text-[10px] transition-all cursor-pointer border flex items-center gap-1',
                      snapToGrid
                        ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)] shadow-2xs'
                        : 'bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]'
                    )}
                    title="Toggle magnetic grid alignment"
                  >
                    <span>Snap: {snapToGrid ? 'ON' : 'OFF'}</span>
                  </button>

                  <Button
                    size="sm"
                    onClick={() => {
                      setTargetCreateRoomFloorId(activeFloor ? activeFloor.id : undefined);
                      setShowCreateRoomModal(true);
                    }}
                    className="h-8 px-3 text-[11px] font-bold rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Room Here
                  </Button>
                </div>
              </div>

              {/* Bottom Left: Blueprint Status Legend & Tip */}
              <div className="absolute bottom-3 left-3 z-20 hidden sm:flex items-center gap-3 bg-[var(--card)]/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-[var(--border)] shadow-xs text-[10px] text-[var(--muted-foreground)] font-bold pointer-events-none">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Available
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> Occupied
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Cleaning
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[var(--destructive)]" /> Maintenance
                </span>
                <span className="text-[var(--border)]">|</span>
                <span className="text-[var(--foreground)]/70">Drag to layout • Click for details</span>
              </div>

              {/* Canvas Empty State or Interactive Blueprint Items */}
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
                    onClick={() => setShowAddFloorInput(true)}
                    className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 font-bold rounded-xl text-xs px-4 h-9 shadow-md"
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
                      onClick={() => {
                        setTargetCreateRoomFloorId(activeFloor ? activeFloor.id : undefined);
                        setShowCreateRoomModal(true);
                      }}
                      className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 font-bold rounded-xl text-xs px-4 h-9"
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

                    let statusBg = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20';
                    let statusDot = 'bg-emerald-500';
                    if (item.status === 'OCCUPIED') {
                      statusBg = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/20';
                      statusDot = 'bg-blue-500';
                    } else if (item.status === 'CLEANING') {
                      statusBg = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20';
                      statusDot = 'bg-amber-500';
                    } else if (item.status === 'MAINTENANCE') {
                      statusBg = 'bg-[var(--destructive)]/10 text-[var(--destructive)] border-[var(--destructive)]/30 hover:bg-[var(--destructive)]/20';
                      statusDot = 'bg-[var(--destructive)]';
                    }

                    return (
                      <div
                        key={item.id}
                        onMouseDown={e => handleNodeMouseDown(e, item)}
                        onClick={() => {
                          if (!hasMovedRef.current) {
                            const rm = backendRooms.find(r => String(r.id) === String(item.roomId));
                            if (rm) setSelectedDrawerRoom(rm);
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
                                  if (rm) setEditingRoom(rm);
                                }}
                                className="p-1 rounded-md text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors"
                                title="Edit Room Details"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  if (item.roomId) handleDeleteRoom(Number(item.roomId), item.label);
                                }}
                                className="p-1 rounded-md text-[var(--muted-foreground)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition-colors"
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
                            handleCycleStatus(item);
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
          )}
        </TabsContent>

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: ROOM DIRECTORY TABLE                                          */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="list" className="pt-3 space-y-4">
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
              <select
                value={directoryBuildingFilter}
                onChange={e => setDirectoryBuildingFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                className="h-9 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-bold text-[var(--foreground)]"
              >
                <option value="ALL">All Buildings ({buildings.length})</option>
                {buildings.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>

              {/* Floor Filter */}
              <select
                value={directoryFloorFilter}
                onChange={e => setDirectoryFloorFilter(e.target.value)}
                className="h-9 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-bold text-[var(--foreground)]"
              >
                <option value="ALL">All Floors ({backendFloors.length})</option>
                {backendFloors.map(f => (
                  <option key={f.id} value={f.id}>Floor {f.floorNumber} — {f.name}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={directoryStatusFilter}
                onChange={e => setDirectoryStatusFilter(e.target.value)}
                className="h-9 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-bold text-[var(--foreground)]"
              >
                <option value="ALL">All Statuses</option>
                <option value="AVAILABLE">🟢 Available</option>
                <option value="OCCUPIED">🔵 Occupied</option>
                <option value="CLEANING">🟡 Cleaning</option>
                <option value="MAINTENANCE">🔴 Maintenance</option>
              </select>
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
                      let statusBadge = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
                      if (rm.status === 'OCCUPIED') statusBadge = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
                      else if (rm.status === 'CLEANING') statusBadge = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
                      else if (rm.status === 'MAINTENANCE') statusBadge = 'bg-[var(--destructive)]/10 text-[var(--destructive)] border-[var(--destructive)]/30';

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
                                <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-amber-500" /> {rm.customName}
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
                            <select
                              value={rm.status}
                              onChange={e => handleUpdateStatus(rm.id, e.target.value as LiveRoomStatus)}
                              className={cn(
                                'px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border cursor-pointer',
                                statusBadge
                              )}
                            >
                              <option value="AVAILABLE">AVAILABLE</option>
                              <option value="OCCUPIED">OCCUPIED</option>
                              <option value="CLEANING">CLEANING</option>
                              <option value="MAINTENANCE">MAINTENANCE</option>
                            </select>
                          </td>
                          <td className="py-3 px-4 text-xs text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingRoom(rm)}
                                className="h-7 text-xs font-bold rounded-lg px-2 text-[var(--muted-foreground)] hover:text-[var(--primary)]"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteRoom(rm.id, rm.roomNumber)}
                                className="h-7 text-xs font-bold rounded-lg px-2 text-[var(--destructive)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10"
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
        </TabsContent>

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: CATEGORIES & PRICING                                          */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="categories" className="pt-3 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-[var(--foreground)]">Room Categories &amp; Pricing Tiers</h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Categories define standard baseline nightly rates, guest capacities, and included amenities.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setShowCreateCategoryModal(true)}
              className="h-8 text-xs font-bold rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add Category
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {backendCategories.map(cat => (
              <Card key={cat.id} className="rounded-2xl border-[var(--border)] overflow-hidden shadow-xs flex flex-col justify-between">
                <div>
                  <CardHeader className="p-4 border-b border-[var(--border)] flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
                        {cat.name}
                        {cat.code && (
                          <span className="px-1.5 py-0.5 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] font-mono text-[10px] font-bold">
                            {cat.code}
                          </span>
                        )}
                      </CardTitle>
                      <span className="text-[11px] text-[var(--muted-foreground)]">
                        {cat.roomCount} room{cat.roomCount !== 1 ? 's' : ''} assigned
                      </span>
                    </div>
                    <span className="text-sm font-black font-mono text-[var(--primary)]">
                      {formatCurrency(cat.basePrice)}<span className="text-[10px] text-[var(--muted-foreground)] font-normal">/night</span>
                    </span>
                  </CardHeader>

                  <CardContent className="p-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
                      <span>Max Occupancy:</span>
                      <span className="font-bold text-[var(--foreground)]">
                        {cat.maxAdults} Adults, {cat.maxChildren} Children
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase block mb-1.5">
                        Amenities ({cat.amenities?.length || 0}):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {cat.amenities && cat.amenities.length > 0 ? (
                          cat.amenities.map(a => (
                            <span
                              key={a}
                              className="px-2 py-0.5 rounded-md bg-[var(--muted)]/50 border border-[var(--border)] text-[10px] font-semibold text-[var(--muted-foreground)]"
                            >
                              {a}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-[var(--muted-foreground)] italic">Standard amenities</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </div>

                <div className="p-3 border-t border-[var(--border)] flex items-center justify-end gap-2 bg-[var(--card)]/50">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingCategory(cat)}
                    className="h-8 text-[11px] font-bold rounded-xl px-2.5 gap-1 border-[var(--border)]"
                  >
                    <Pencil className="w-3 h-3 text-[var(--primary)]" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="h-8 text-[11px] text-[var(--destructive)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10 font-bold rounded-xl px-2.5 gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* TAB 4: BULK ROOM GENERATOR                                           */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* TAB 4: CAMPUS FACILITIES & OUTDOOR GROUNDS                            */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="facilities" className="pt-3 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-[var(--foreground)] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--primary)]" />
                Campus Facilities &amp; Outdoor Grounds ({backendUtilities.length})
              </h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Manage shared guest facilities, swimming pools, fitness clubs, conference halls, and recreational grounds.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setShowCreateUtilityModal(true)}
              className="h-8 text-xs font-bold rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add Facility
            </Button>
          </div>

          {backendUtilities.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[var(--card)] border border-dashed border-[var(--border)]">
              <Sparkles className="w-8 h-8 text-[var(--muted-foreground)] mx-auto mb-2 opacity-50" />
              <p className="text-sm font-bold text-[var(--foreground)]">No Campus Facilities Registered</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1 mb-4">
                Add pools, fitness clubs, spas, banquet halls, or sports courts to your campus layout.
              </p>
              <Button
                size="sm"
                onClick={() => setShowCreateUtilityModal(true)}
                className="h-8 text-xs font-bold rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add First Facility
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {backendUtilities.map(u => {
                let statusBadge = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
                if (u.status === 'CLEANING') statusBadge = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
                else if (u.status === 'MAINTENANCE') statusBadge = 'bg-[var(--destructive)]/10 text-[var(--destructive)] border-[var(--destructive)]/30';
                else if (u.status === 'CLOSED') statusBadge = 'bg-gray-500/10 text-gray-500 border-gray-500/30';

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

                        {/* Quick Live Status Toggle */}
                        <select
                          value={u.status}
                          onChange={e => apiUpdateUtilityStatus(u.id, e.target.value as any)}
                          className={cn(
                            'px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border cursor-pointer',
                            statusBadge
                          )}
                        >
                          <option value="OPEN">🟢 OPEN</option>
                          <option value="CLEANING">🟡 CLEANING</option>
                          <option value="MAINTENANCE">🔴 MAINTENANCE</option>
                          <option value="CLOSED">⚪ CLOSED</option>
                        </select>
                      </div>

                      {/* Info items */}
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
                        onClick={() => setEditingUtility(u)}
                        className="h-8 text-xs font-bold rounded-xl px-2.5 text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 gap-1"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          if (confirm(`Delete facility "${u.name}"?`)) {
                            await deleteUtility(u.id);
                          }
                        }}
                        className="h-8 text-xs font-bold rounded-xl px-2.5 text-[var(--destructive)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10 gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="generator" className="pt-3">
          <Card className="max-w-xl mx-auto rounded-2xl border-[var(--border)] shadow-md overflow-hidden">
            <CardHeader className="p-5 border-b border-[var(--border)]">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-[var(--foreground)]">
                <PlusCircle className="w-5 h-5 text-[var(--primary)]" /> Bulk Room Generator
              </CardTitle>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                Generate an entire sequence of rooms on a selected floor and category in a single database transaction.
              </p>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleBulkGenerateSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[var(--muted-foreground)] mb-1">
                    Target Floor *
                  </label>
                  <select
                    value={genFloorId}
                    onChange={e => setGenFloorId(e.target.value)}
                    className="w-full h-9 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-bold text-[var(--foreground)]"
                    required
                  >
                    {backendFloors.map(f => (
                      <option key={f.id} value={f.id}>
                        Floor {f.floorNumber} — {f.name} {f.buildingName ? `(${f.buildingName})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[var(--muted-foreground)] mb-1">
                    Room Category &amp; Pricing *
                  </label>
                  <select
                    value={genCategoryId}
                    onChange={e => setGenCategoryId(e.target.value)}
                    className="w-full h-9 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-bold text-[var(--foreground)]"
                    required
                  >
                    {backendCategories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.code ? `(${c.code})` : ''} — {formatCurrency(c.basePrice)}/night
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[var(--muted-foreground)] mb-1">
                      Start Room # *
                    </label>
                    <Input
                      type="number"
                      value={genStartNum}
                      onChange={e => setGenStartNum(Number(e.target.value))}
                      className="h-9 font-mono font-bold text-xs rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[var(--muted-foreground)] mb-1">
                      End Room # *
                    </label>
                    <Input
                      type="number"
                      value={genEndNum}
                      onChange={e => setGenEndNum(Number(e.target.value))}
                      className="h-9 font-mono font-bold text-xs rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[var(--muted-foreground)] mb-1">
                    Room Number Prefix (Optional)
                  </label>
                  <Input
                    placeholder="e.g. A- or BLK1- (leave blank for numbers only)"
                    value={genPrefix}
                    onChange={e => setGenPrefix(e.target.value)}
                    className="h-9 font-mono text-xs rounded-xl"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] flex justify-between items-center text-xs">
                  <span className="text-[var(--muted-foreground)] font-semibold">Total Rooms to Create:</span>
                  <span className="font-mono font-black text-sm text-[var(--primary)]">
                    {Math.max(0, genEndNum - genStartNum + 1)} units
                  </span>
                </div>

                <Button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] font-bold h-10 rounded-xl shadow-md gap-2 text-xs"
                >
                  <Sparkles className="w-4 h-4" />
                  {isGenerating ? 'Generating Rooms...' : `Generate ${Math.max(0, genEndNum - genStartNum + 1)} Rooms in Database`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─── MODALS ─────────────────────────────────────────────────────────── */}
            {/* ─── SLIDE-OVER ROOM DETAIL DRAWER ─────────────────────────────────── */}
      <RoomDetailDrawer
        room={selectedDrawerRoom}
        isOpen={!!selectedDrawerRoom}
        onClose={() => setSelectedDrawerRoom(null)}
        onEdit={(rm) => setEditingRoom(rm)}
        onDelete={(id, num) => handleDeleteRoom(id, num)}
        onUpdateStatus={handleDrawerUpdateStatus}
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
