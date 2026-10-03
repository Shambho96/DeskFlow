import React, { useState, useRef } from 'react';
import {
  Layers,
  PlusCircle,
  Sparkles,
  Plus,
  Square,
  Circle,
  Hexagon,
  Diamond,
  Trash2,
  Save,
  Move,
  Building,
  Info,
  ChevronDown,
  Edit3,
  X,
  Compass,
  Zap,
  ZoomIn,
  ZoomOut,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { useHotel } from '../context/HotelContext';
import { useTheme } from '../context/ThemeContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { formatCurrency, cn } from '../lib/utils';
import type { RoomStatus } from '../types/hotel';

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
  status?: RoomStatus;
  isOccupied?: boolean;
}

export const RoomsPage: React.FC = () => {
  const {
    rooms,
    floors,
    roomTypes,
    addBulkRooms,
    addFloor,
    addSingleRoom,
    deleteRoom,
    updateRoom,
    updateRoomStatus
  } = useHotel();
  const { theme } = useTheme();

  // Active floor state
  const [activeFloorId, setActiveFloorId] = useState<string>(floors[0]?.id || 'fl-1');

  // Generator Form State
  const [selectedFloorId, setSelectedFloorId] = useState('fl-3');
  const [startNum, setStartNum] = useState(301);
  const [endNum, setEndNum] = useState(310);
  const [selectedTypeId, setSelectedTypeId] = useState('rt-2');

  // New Floor Modal/Inline state
  const [showAddFloorInput, setShowAddFloorInput] = useState(false);
  const [newFloorName, setNewFloorName] = useState('');

  // Edit Room Modal State
  const [editModalItem, setEditModalItem] = useState<CanvasItem | null>(null);

  // Canvas Grid & Dragging Enhancements
  const [isDraggingOverCanvas, setIsDraggingOverCanvas] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1); // 100%

  // Initial layout nodes for rooms on canvas
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([
    { id: 'c-101', floorId: 'fl-1', roomId: 'rm-101', label: 'T1', shapeType: 'SQUARE', category: 'ROOM', x: 220, y: 80, typeId: 'rt-1', status: 'CLEAN' },
    { id: 'c-102', floorId: 'fl-1', roomId: 'rm-102', label: 'T2', shapeType: 'SQUARE', category: 'ROOM', x: 440, y: 70, typeId: 'rt-1', status: 'CLEAN' },
    { id: 'c-103', floorId: 'fl-1', roomId: 'rm-103', label: 'T3', shapeType: 'SQUARE', category: 'ROOM', x: 340, y: 80, typeId: 'rt-2', status: 'DIRTY' },
    { id: 'c-104', floorId: 'fl-1', roomId: 'rm-104', label: 'T4-1', shapeType: 'SQUARE', category: 'ROOM', x: 330, y: 350, typeId: 'rt-2', status: 'CLEAN' },
    { id: 'c-105', floorId: 'fl-1', roomId: 'rm-105', label: 'T4-2', shapeType: 'CIRCLE', category: 'ROOM', x: 450, y: 220, typeId: 'rt-3', status: 'CLEAN' },
    { id: 'c-201', floorId: 'fl-1', label: 'T5', shapeType: 'SQUARE', category: 'ROOM', x: 120, y: 230, typeId: 'rt-1', status: 'CLEAN' },
    { id: 'c-202', floorId: 'fl-1', label: 'T6', shapeType: 'SQUARE', category: 'ROOM', x: 350, y: 200, typeId: 'rt-2', status: 'DIRTY' },
    { id: 'c-203', floorId: 'fl-1', label: 'T7', shapeType: 'SQUARE', category: 'ROOM', x: 530, y: 330, typeId: 'rt-3', status: 'CLEAN' },
    { id: 'c-204', floorId: 'fl-1', label: 'T8-1', shapeType: 'SQUARE', category: 'ROOM', x: 540, y: 150, typeId: 'rt-3', status: 'OOO' }
  ]);

  // Canvas interaction states
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Inspector form states
  const selectedItem = canvasItems.find(i => i.id === selectedItemId);
  const [inspectorLabel, setInspectorLabel] = useState('');
  const [inspectorTypeId, setInspectorTypeId] = useState('');
  const [inspectorStatus, setInspectorStatus] = useState<RoomStatus>('CLEAN');

  // Update inspector when selection changes
  React.useEffect(() => {
    if (selectedItem) {
      setInspectorLabel(selectedItem.label);
      setInspectorTypeId(selectedItem.typeId || 'rt-1');
      setInspectorStatus(selectedItem.status || 'CLEAN');
    }
  }, [selectedItemId, selectedItem]);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Grid Snapping Helper
  const snap = (val: number) => (snapToGrid ? Math.round(val / 20) * 20 : Math.round(val));

  // Smooth window mouse dragging so node movement never gets stuck or lost
  React.useEffect(() => {
    if (!draggingItemId) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const rawX = e.clientX - dragOffset.x;
      const rawY = e.clientY - dragOffset.y;

      const newX = snap(Math.max(10, Math.min(rect.width - 100, rawX)));
      const newY = snap(Math.max(10, Math.min(rect.height - 90, rawY)));

      setCanvasItems(prev =>
        prev.map(item => (item.id === draggingItemId ? { ...item, x: newX, y: newY } : item))
      );
    };

    const handleWindowMouseUp = () => {
      setDraggingItemId(null);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [draggingItemId, dragOffset, snapToGrid]);

  const selectedType = roomTypes.find(rt => rt.id === selectedTypeId) || roomTypes[0];
  const generatedCount = Math.max(1, endNum - startNum + 1);

  // Handle Adding New Floor
  const handleCreateFloor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFloorName.trim()) return;
    const newFl = addFloor(newFloorName.trim());
    setActiveFloorId(newFl.id);
    setNewFloorName('');
    setShowAddFloorInput(false);
  };

  // Drag Start from Sidebar items
  const handleSidebarDragStart = (e: React.DragEvent, shapeType: CanvasItem['shapeType'], category: 'ROOM' | 'ELEMENT') => {
    e.dataTransfer.setData('shapeType', shapeType);
    e.dataTransfer.setData('category', category);
  };

  // Canvas Drag Over
  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDraggingOverCanvas) setIsDraggingOverCanvas(true);
  };

  const handleCanvasDragLeave = () => {
    setIsDraggingOverCanvas(false);
  };

  // Canvas Drop (Adding new node)
  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverCanvas(false);
    const shapeType = e.dataTransfer.getData('shapeType') as CanvasItem['shapeType'];
    const category = e.dataTransfer.getData('category') as 'ROOM' | 'ELEMENT';

    if (!shapeType || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const rawX = e.clientX - rect.left - 40;
    const rawY = e.clientY - rect.top - 40;

    const x = snap(Math.max(20, Math.min(rect.width - 120, rawX)));
    const y = snap(Math.max(20, Math.min(rect.height - 100, rawY)));

    const nextNum = canvasItems.filter(i => i.floorId === activeFloorId).length + 1;
    const label = category === 'ROOM' ? `Room ${100 + nextNum}` : shapeType;

    const newItemId = `c-${Date.now()}`;
    let newRoomId: string | undefined;

    // Create room in HotelContext if it's a room
    if (category === 'ROOM') {
      const roomNumStr = `${100 + nextNum}`;
      const newRm = addSingleRoom({
        roomNumber: roomNumStr,
        floorId: activeFloorId,
        typeId: 'rt-1',
        status: 'CLEAN',
        isOccupied: false
      });
      newRoomId = newRm.id;
    }

    const newItem: CanvasItem = {
      id: newItemId,
      floorId: activeFloorId,
      roomId: newRoomId,
      label,
      shapeType,
      category,
      x,
      y,
      typeId: 'rt-1',
      status: 'CLEAN'
    };

    setCanvasItems(prev => [...prev, newItem]);
    setSelectedItemId(newItemId);
  };

  // Canvas Node Mouse Down (Canvas Movement)
  const handleNodeMouseDown = (e: React.MouseEvent, item: CanvasItem) => {
    e.stopPropagation();
    setSelectedItemId(item.id);
    setDraggingItemId(item.id);
    setDragOffset({
      x: e.clientX - item.x,
      y: e.clientY - item.y
    });
  };

  // Cycle Status Quickly
  const handleCycleStatus = (item: CanvasItem) => {
    const statusOrder: RoomStatus[] = ['CLEAN', 'DIRTY', 'OOO'];
    const nextStatus = statusOrder[(statusOrder.indexOf(item.status || 'CLEAN') + 1) % statusOrder.length];
    
    setCanvasItems(prev =>
      prev.map(i => (i.id === item.id ? { ...i, status: nextStatus } : i))
    );

    if (item.roomId) {
      updateRoomStatus(item.roomId, nextStatus);
    }
  };

  // Save Inspector Properties
  const handleSaveInspector = () => {
    if (!selectedItemId) return;

    setCanvasItems(prev =>
      prev.map(item => {
        if (item.id === selectedItemId) {
          if (item.roomId) {
            updateRoom(item.roomId, {
              roomNumber: inspectorLabel.replace('Room ', ''),
              typeId: inspectorTypeId,
              status: inspectorStatus
            });
          }
          return {
            ...item,
            label: inspectorLabel,
            typeId: inspectorTypeId,
            status: inspectorStatus
          };
        }
        return item;
      })
    );
  };

  // Delete Node Helper
  const handleDeleteNode = (idToDelete?: string) => {
    const targetId = idToDelete || selectedItemId;
    if (!targetId) return;
    const target = canvasItems.find(i => i.id === targetId);
    if (target?.roomId) {
      deleteRoom(target.roomId);
    }
    setCanvasItems(prev => prev.filter(i => i.id !== targetId));
    if (selectedItemId === targetId) setSelectedItemId(null);
  };

  // Bulk Generator Submit
  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const created = addBulkRooms(selectedFloorId, selectedTypeId, startNum, endNum);

    const startX = 60;
    const startY = 80;
    const itemsPerRow = 5;
    const createdItems: CanvasItem[] = created.map((rm, idx) => {
      const col = idx % itemsPerRow;
      const row = Math.floor(idx / itemsPerRow);
      return {
        id: `c-gen-${rm.id}`,
        floorId: selectedFloorId,
        roomId: rm.id,
        label: `Room ${rm.roomNumber}`,
        shapeType: 'SQUARE',
        category: 'ROOM',
        x: startX + col * 120,
        y: startY + row * 100,
        typeId: selectedTypeId,
        status: 'CLEAN'
      };
    });

    setCanvasItems(prev => [...prev, ...createdItems]);
    setActiveFloorId(selectedFloorId);
    alert(`🎉 Successfully generated ${created.length} rooms directly on ${floors.find(f => f.id === selectedFloorId)?.name || 'Floor'}!`);
  };

  const activeFloor = floors.find(f => f.id === activeFloorId) || floors[0];
  const activeFloorCanvasItems = canvasItems.filter(item => item.floorId === activeFloorId);

  return (
    <div className="space-y-4 text-left select-none pb-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-[var(--foreground)] flex items-center gap-2">
            Rooms &amp; Floor Plan Designer
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[var(--muted)] border border-[var(--border)] text-[var(--muted-foreground)]">
              {rooms.length} Active Rooms
            </span>
          </h1>
          <p className="text-xs text-[var(--muted-foreground)]">Visual drag-and-drop floor designer, room category pricing, and housekeeping state sync</p>
        </div>
      </div>

      <Tabs defaultValue="visual" className="w-full">
        <TabsList className="w-full justify-start border-b border-[var(--border)] rounded-none bg-transparent p-0 h-auto gap-0 overflow-x-auto no-scrollbar">
          <TabsTrigger value="visual" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--primary)] font-bold text-xs whitespace-nowrap px-3 py-2.5">
            <span className="hidden sm:inline">1. </span>Floor Canvas
          </TabsTrigger>
          <TabsTrigger value="list" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--primary)] font-bold text-xs whitespace-nowrap px-3 py-2.5">
            <span className="hidden sm:inline">2. </span>Room Directory ({rooms.length})
          </TabsTrigger>
          <TabsTrigger value="categories" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--primary)] font-bold text-xs whitespace-nowrap px-3 py-2.5">
            <span className="hidden sm:inline">3. </span>Categories ({roomTypes.length})
          </TabsTrigger>
          <TabsTrigger value="generator" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--primary)] font-bold text-xs whitespace-nowrap px-3 py-2.5">
            <span className="hidden sm:inline">4. </span>Generator
          </TabsTrigger>
        </TabsList>

        {/* ========================================================= */}
        {/* TAB 1: VISUAL FLOOR CANVAS DESIGNER */}
        {/* ========================================================= */}
        <TabsContent value="visual" className="pt-3 space-y-3">
          {/* HEADER TOOLBAR (FLOOR SELECTOR + VIEW SWITCHER) */}
          <div className="p-3 bg-[var(--card)] border border-[var(--border)] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-base font-extrabold text-[var(--foreground)] tracking-tight">Floor Plan</h2>

              {/* Floor Switcher Dropdown */}
              <div className="relative">
                <select
                  value={activeFloorId}
                  onChange={e => setActiveFloorId(e.target.value)}
                  className="h-9 px-3 pr-8 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-bold text-[var(--foreground)] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--primary)] min-w-[140px]"
                >
                  {floors.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--muted-foreground)] absolute right-2.5 top-3 pointer-events-none" />
              </div>

              {/* Add Floor Button */}
              {showAddFloorInput ? (
                <form onSubmit={handleCreateFloor} className="flex items-center gap-1.5">
                  <Input
                    placeholder="Floor Name (e.g. Terrace)"
                    value={newFloorName}
                    onChange={e => setNewFloorName(e.target.value)}
                    className="h-9 text-xs rounded-xl w-44"
                    autoFocus
                  />
                  <Button type="submit" size="sm" className="h-9 text-xs font-bold rounded-xl bg-[var(--primary)] text-white px-3">
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 text-xs rounded-xl"
                    onClick={() => setShowAddFloorInput(false)}
                  >
                    Cancel
                  </Button>
                </form>
              ) : (
                <button
                  onClick={() => setShowAddFloorInput(true)}
                  className="w-8 h-8 rounded-xl border border-[var(--border)] bg-[var(--muted)]/50 hover:bg-[var(--muted)] flex items-center justify-center text-[var(--foreground)] transition-colors cursor-pointer"
                  title="Add New Floor Structure"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* MAIN TWO-COLUMN CANVAS LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              {/* LEFT SIDEBAR PALETTE PANEL - hidden on mobile, shows above canvas */}
              <div className="lg:col-span-3 space-y-3 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-3 lg:gap-0 pb-2 lg:pb-0">
                <Card className="border-[var(--border)] bg-[var(--card)] rounded-2xl shadow-xs">
                  <CardHeader className="p-3.5 border-b border-[var(--border)]">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center justify-between">
                      <span>Add Rooms &amp; Suites</span>
                      <Sparkles className="w-3.5 h-3.5 text-[var(--primary)]" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'SQUARE', icon: Square, shape: 'SQUARE' },
                        { label: 'CIRCLE', icon: Circle, shape: 'CIRCLE' },
                        { label: 'DIAMOND', icon: Diamond, shape: 'DIAMOND' },
                        { label: 'PENTAGON', icon: Hexagon, shape: 'PENTAGON' },
                        { label: 'OCTAGON', icon: Hexagon, shape: 'OCTAGON' }
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          draggable
                          onDragStart={e => handleSidebarDragStart(e, item.shape as CanvasItem['shapeType'], 'ROOM')}
                          className="p-3 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/10 hover:scale-105 active:scale-95 transition-all cursor-grab active:cursor-grabbing flex flex-col items-center justify-center gap-1.5 group text-center shadow-2xs hover:shadow-md"
                          title="Drag onto canvas to place room"
                        >
                          <item.icon className="w-4 h-4 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors stroke-[2]" />
                          <span className="text-[9px] font-extrabold text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]">
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* ADD ELEMENTS & ARCHITECTURAL FEATURES */}
                <Card className="border-[var(--border)] bg-[var(--card)] rounded-2xl shadow-xs">
                  <CardHeader className="p-3.5 border-b border-[var(--border)]">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center justify-between">
                      <span>Add Elements</span>
                      <Compass className="w-3.5 h-3.5 text-indigo-500" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'COUNTER', shape: 'COUNTER' },
                        { label: 'WALL', shape: 'WALL' },
                        { label: 'DECOR', shape: 'DECOR' }
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          draggable
                          onDragStart={e => handleSidebarDragStart(e, item.shape as CanvasItem['shapeType'], 'ELEMENT')}
                          className="p-3 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)] hover:scale-105 active:scale-95 transition-all cursor-grab active:cursor-grabbing flex flex-col items-center justify-center gap-1.5 group text-center shadow-2xs"
                        >
                          <Square className="w-4 h-4 text-[var(--muted-foreground)] group-hover:text-[var(--primary)]" />
                          <span className="text-[9px] font-extrabold text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]">
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* LIVE PROPERTY INSPECTOR (BOTTOM LEFT) */}
                <Card className="border-[var(--border)] bg-[var(--card)] rounded-2xl shadow-xs flex-1 flex flex-col justify-between">
                  <CardHeader className="p-3.5 border-b border-[var(--border)]">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-2">
                      <Info className="w-3.5 h-3.5 text-[var(--primary)]" /> Inspector &amp; Properties
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3 text-xs flex-1">
                    {selectedItem ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">
                            Item Label / Room Number
                          </label>
                          <Input
                            value={inspectorLabel}
                            onChange={e => setInspectorLabel(e.target.value)}
                            className="h-8 text-xs font-bold rounded-xl"
                          />
                        </div>

                        {selectedItem.category === 'ROOM' && (
                          <>
                            <div>
                              <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">
                                Room Category
                              </label>
                              <select
                                value={inspectorTypeId}
                                onChange={e => setInspectorTypeId(e.target.value)}
                                className="w-full h-8 px-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-bold text-[var(--foreground)]"
                              >
                                {roomTypes.map(rt => (
                                  <option key={rt.id} value={rt.id}>
                                    {rt.name} ({rt.code}) — {formatCurrency(rt.basePrice)}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">
                                Housekeeping Status
                              </label>
                              <select
                                value={inspectorStatus}
                                onChange={e => setInspectorStatus(e.target.value as RoomStatus)}
                                className="w-full h-8 px-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-bold text-[var(--foreground)]"
                              >
                                <option value="CLEAN">Clean / Ready</option>
                                <option value="DIRTY">Dirty / Cleaning Needed</option>
                                <option value="OOO">Out of Order (OOO)</option>
                              </select>
                            </div>
                          </>
                        )}

                        <div className="pt-2 flex items-center gap-2">
                          <Button
                            onClick={handleSaveInspector}
                            size="sm"
                            className="h-8 text-xs font-bold bg-[var(--primary)] text-white rounded-xl gap-1 flex-1"
                          >
                            <Save className="w-3.5 h-3.5" /> Save
                          </Button>

                          <Button
                            onClick={() => setEditModalItem(selectedItem)}
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs font-bold border-[var(--primary)]/40 text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-xl gap-1"
                            title="Open Edit Popup Modal"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Modal
                          </Button>

                          <Button
                            onClick={() => handleDeleteNode()}
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs font-bold border-rose-500/30 text-rose-500 hover:bg-rose-500/10 rounded-xl px-2.5"
                            title="Delete Node"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full min-h-[140px] flex flex-col items-center justify-center text-center p-4 border border-dashed border-[var(--border)] rounded-xl text-[var(--muted-foreground)]">
                        <Move className="w-6 h-6 mb-2 opacity-50 stroke-[1.5]" />
                        <p className="text-xs font-semibold">Select a table or room on the canvas to view and edit its properties.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* MAIN BLUEPRINT GRID CANVAS AREA */}
              <div className="lg:col-span-9">
                <div
                  ref={canvasRef}
                  onDragOver={handleCanvasDragOver}
                  onDragLeave={handleCanvasDragLeave}
                  onDrop={handleCanvasDrop}
                  onClick={(e) => {
                    if (e.target === canvasRef.current) {
                      setSelectedItemId(null);
                    }
                  }}
                  className={cn(
                    'w-full h-[400px] sm:h-[520px] lg:h-[620px] rounded-2xl border relative overflow-hidden shadow-inner select-none transition-all duration-300',
                    isDraggingOverCanvas
                      ? 'border-2 border-dashed border-[var(--primary)] bg-[var(--primary)]/10 shadow-lg ring-4 ring-[var(--primary)]/20'
                      : theme === 'dark'
                      ? 'border-slate-800 bg-[#0d0f12]'
                      : 'border-slate-300 bg-slate-100/70 shadow-xs'
                  )}
                  style={{
                    backgroundImage: `radial-gradient(${
                      theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(15, 23, 42, 0.18)'
                    } 1px, transparent 1px)`,
                    backgroundSize: `${20 * zoomLevel}px ${20 * zoomLevel}px`
                  }}
                >
                  {/* CANVAS HEADER OVERLAY */}
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2 pointer-events-none">
                    <span className={cn(
                      'text-xs font-mono font-bold px-3 py-1.5 rounded-xl border shadow-xs transition-colors flex items-center gap-2',
                      theme === 'dark'
                        ? 'bg-slate-900/90 border-slate-700/80 text-slate-200'
                        : 'bg-white/95 border-slate-300 text-slate-800 shadow-sm'
                    )}>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{activeFloor.name} Floor Canvas</span>
                      <span>•</span>
                      <span>{activeFloorCanvasItems.length} Nodes</span>
                    </span>
                  </div>

                  {/* DRAG OVER PROMPT BADGE */}
                  {isDraggingOverCanvas && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-[var(--primary)]/10 backdrop-blur-xs pointer-events-none">
                      <div className="bg-[var(--card)] border border-[var(--primary)] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
                        <Sparkles className="w-5 h-5 text-[var(--primary)]" />
                        <span className="text-sm font-extrabold text-[var(--foreground)]">Release Mouse to Place Room</span>
                      </div>
                    </div>
                  )}

                  {/* FLOATING CANVAS CONTROLS TOOLBAR (BOTTOM RIGHT) */}
                  <div className="absolute bottom-4 right-4 z-30 flex items-center gap-2 bg-[var(--card)]/90 backdrop-blur-md border border-[var(--border)] p-1.5 rounded-2xl shadow-xl">
                    <button
                      onClick={() => setSnapToGrid(prev => !prev)}
                      className={cn(
                        'px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer',
                        snapToGrid ? 'bg-[var(--primary)] text-white shadow-xs' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                      )}
                      title="Toggle 20px Grid Snap"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Snap: {snapToGrid ? '20px ON' : 'OFF'}</span>
                    </button>

                    <div className="h-4 w-px bg-[var(--border)]" />

                    <button
                      onClick={() => setZoomLevel(prev => Math.max(0.8, Number((prev - 0.1).toFixed(1))))}
                      className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>

                    <span className="text-[11px] font-mono font-bold text-[var(--foreground)] px-1 min-w-[40px] text-center">
                      {Math.round(zoomLevel * 100)}%
                    </span>

                    <button
                      onClick={() => setZoomLevel(prev => Math.min(1.4, Number((prev + 0.1).toFixed(1))))}
                      className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>

                  {/* RENDER CANVAS NODES */}
                  <div
                    style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
                    className="w-full h-full relative"
                  >
                    {activeFloorCanvasItems.map(item => {
                      const isSelected = selectedItemId === item.id;
                      const isDragging = draggingItemId === item.id;

                      // Shape specific classes and clip path styles
                      const getShapeConfig = (shapeType: CanvasItem['shapeType']) => {
                        switch (shapeType) {
                          case 'CIRCLE':
                            return { shapeClass: 'w-20 h-20 rounded-full', isDiamond: false, style: {} };
                          case 'DIAMOND':
                            return { shapeClass: 'w-20 h-20 rotate-45 rounded-xl', isDiamond: true, style: {} };
                          case 'PENTAGON':
                            return {
                              shapeClass: 'w-22 h-20 rounded-lg',
                              isDiamond: false,
                              style: { clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }
                            };
                          case 'OCTAGON':
                            return {
                              shapeClass: 'w-22 h-20 rounded-lg',
                              isDiamond: false,
                              style: { clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }
                            };
                          case 'COUNTER':
                            return { shapeClass: 'w-36 h-14 rounded-xl border-dashed', isDiamond: false, style: {} };
                          case 'WALL':
                            return { shapeClass: 'w-32 h-6 rounded-lg', isDiamond: false, style: {} };
                          case 'DECOR':
                            return { shapeClass: 'w-16 h-16 rounded-full border-dotted', isDiamond: false, style: {} };
                          case 'SQUARE':
                          default:
                            return { shapeClass: 'w-24 h-20 rounded-2xl', isDiamond: false, style: {} };
                        }
                      };

                      const { shapeClass, isDiamond, style: customStyle } = getShapeConfig(item.shapeType);

                      return (
                        <div
                          key={item.id}
                          onMouseDown={e => handleNodeMouseDown(e, item)}
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedItemId(item.id);
                          }}
                          onDoubleClick={e => {
                            e.stopPropagation();
                            setEditModalItem(item);
                          }}
                          onDragStart={e => e.preventDefault()}
                          className={cn(
                            'absolute transition-transform flex flex-col items-center justify-center font-extrabold text-xs shadow-lg group select-none',
                            shapeClass,
                            isDragging
                              ? 'cursor-grabbing scale-110 z-50 ring-4 ring-[var(--primary)]/60 shadow-2xl border-2 border-[var(--primary)]'
                              : isSelected
                              ? 'cursor-grab border-2 border-[var(--primary)] shadow-[var(--primary)]/30 shadow-xl z-30 scale-105 ring-2 ring-[var(--primary)]/40'
                              : 'cursor-grab border border-[var(--border)] hover:border-[var(--primary)]/60 hover:scale-102 z-20 shadow-xs',
                            theme === 'dark' ? 'bg-slate-900/95 text-slate-100' : 'bg-white text-slate-900'
                          )}
                          style={{
                            left: `${item.x}px`,
                            top: `${item.y}px`,
                            ...customStyle
                          }}
                        >
                          {/* LIVE COORDINATES TOOLTIP DURING ACTIVE DRAG */}
                          {isDragging && (
                            <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg shadow-xl border border-slate-700 whitespace-nowrap z-50 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[var(--primary)]" />
                              <span>X: {item.x}px, Y: {item.y}px</span>
                            </div>
                          )}

                          {/* FLOATING QUICK-ACTION TOOLBAR ON SELECTED NODE */}
                          {isSelected && !isDragging && (
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[var(--card)]/95 border border-[var(--border)] p-1 rounded-xl shadow-2xl flex items-center gap-1 z-50 animate-in fade-in zoom-in-95">
                              <button
                                onClick={e => { e.stopPropagation(); setEditModalItem(item); }}
                                className="p-1 hover:bg-[var(--muted)] text-[var(--primary)] rounded-lg transition-colors"
                                title="Edit Room Details"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={e => { e.stopPropagation(); handleCycleStatus(item); }}
                                className="p-1 hover:bg-[var(--muted)] text-amber-500 rounded-lg transition-colors"
                                title="Cycle Housekeeping Status (Clean / Dirty / OOO)"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={e => { e.stopPropagation(); handleDeleteNode(item.id); }}
                                className="p-1 hover:bg-[var(--muted)] text-rose-500 rounded-lg transition-colors"
                                title="Delete Room"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}

                          {/* SELECTION HANDLES */}
                          {isSelected && (
                            <>
                              <span className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] absolute -top-1 -left-1 border border-white z-40 animate-pulse" />
                              <span className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] absolute -top-1 -right-1 border border-white z-40 animate-pulse" />
                              <span className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] absolute -bottom-1 -left-1 border border-white z-40 animate-pulse" />
                              <span className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] absolute -bottom-1 -right-1 border border-white z-40 animate-pulse" />
                            </>
                          )}

                          <div className={cn('flex flex-col items-center justify-center', isDiamond && '-rotate-45')}>
                            <span className="font-mono text-sm tracking-tight font-black">{item.label}</span>

                            {item.category === 'ROOM' && (
                              <span className={cn(
                                'text-[9px] px-2 py-0.5 rounded-full font-extrabold mt-1 border flex items-center gap-1',
                                item.status === 'DIRTY'
                                  ? theme === 'dark' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-amber-100 text-amber-700 border-amber-300'
                                  : item.status === 'OOO'
                                  ? theme === 'dark' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-rose-100 text-rose-700 border-rose-300'
                                  : theme === 'dark' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-emerald-100 text-emerald-700 border-emerald-300'
                              )}>
                                <span className={cn(
                                  'w-1.5 h-1.5 rounded-full',
                                  item.status === 'DIRTY' ? 'bg-amber-500' : item.status === 'OOO' ? 'bg-rose-500' : 'bg-emerald-500'
                                )} />
                                <span>{item.status || 'CLEAN'}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

        {/* TAB 2: FLOORS & ROOMS LIST */}
        <TabsContent value="list" className="pt-4 space-y-6">
          {floors.map(floor => {
            const floorRooms = rooms.filter(rm => rm.floorId === floor.id);
            return (
              <Card key={floor.id}>
                <CardHeader className="p-4 border-b border-[var(--border)] flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[var(--primary)]" /> {floor.name}
                    </CardTitle>
                    <p className="text-xs text-[var(--muted-foreground)]">Floor ID: {floor.id} • {floorRooms.length} Rooms</p>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {floorRooms.map(rm => {
                      const rType = roomTypes.find(t => t.id === rm.typeId);
                      return (
                        <div
                          key={rm.id}
                          onClick={() => setEditModalItem({
                            id: `c-rm-${rm.id}`,
                            floorId: rm.floorId,
                            roomId: rm.id,
                            label: `Room ${rm.roomNumber}`,
                            shapeType: 'SQUARE',
                            category: 'ROOM',
                            x: 100,
                            y: 100,
                            typeId: rm.typeId,
                            status: rm.status,
                            isOccupied: rm.isOccupied
                          })}
                          className="p-3 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/60 transition-all text-xs cursor-pointer group"
                        >
                          <div className="flex items-center justify-between font-bold text-sm">
                            <span className="group-hover:text-[var(--primary)]">Room {rm.roomNumber}</span>
                            <span className="text-[10px] text-[var(--primary)]">{rType?.code}</span>
                          </div>
                          <p className="text-[10px] text-[var(--muted-foreground)] mt-1">{rType?.name}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <Badge variant={rm.status === 'CLEAN' ? 'clean' : 'dirty'} className="text-[9px] py-0">
                              {rm.status}
                            </Badge>
                            <span className="text-[10px] font-bold">
                              {rm.isOccupied ? 'Occupied' : 'Vacant'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* TAB 3: ROOM CATEGORIES */}
        <TabsContent value="categories" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roomTypes.map(rt => (
              <Card key={rt.id} className="hover:border-[var(--primary)]/50 transition-all">
                <CardHeader className="p-5 border-b border-[var(--border)]">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base font-bold">{rt.name}</CardTitle>
                      <p className="text-xs text-[var(--muted-foreground)] font-mono mt-0.5">Code: {rt.code}</p>
                    </div>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {formatCurrency(rt.basePrice)}/night
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-3 text-xs">
                  <div className="flex justify-between text-[var(--muted-foreground)]">
                    <span>Max Occupancy:</span>
                    <span className="font-bold text-[var(--foreground)]">{rt.maxAdults} Adults, {rt.maxChildren} Children</span>
                  </div>
                  <div className="flex justify-between text-[var(--muted-foreground)]">
                    <span>Assigned Rooms:</span>
                    <span className="font-bold text-[var(--primary)]">
                      {rooms.filter(r => r.typeId === rt.id).length} Rooms
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB 4: BULK ROOM GENERATOR */}
        <TabsContent value="generator" className="pt-4">
          <Card className="max-w-xl mx-auto">
            <CardHeader className="p-5 border-b border-[var(--border)]">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[var(--primary)]" /> Bulk Room Generator Form
              </CardTitle>
              <p className="text-xs text-[var(--muted-foreground)]">Generate a sequence of rooms auto-attached to state</p>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleGenerate} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[var(--muted-foreground)] mb-1">
                    Select Target Floor
                  </label>
                  <select
                    value={selectedFloorId}
                    onChange={e => setSelectedFloorId(e.target.value)}
                    className="w-full h-9 rounded-md border border-[var(--input)] bg-[var(--background)] text-[var(--foreground)] px-3 text-xs"
                  >
                    {floors.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[var(--muted-foreground)] mb-1">
                      Start Room Number
                    </label>
                    <Input
                      type="number"
                      value={startNum}
                      onChange={e => setStartNum(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[var(--muted-foreground)] mb-1">
                      End Room Number
                    </label>
                    <Input
                      type="number"
                      value={endNum}
                      onChange={e => setEndNum(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--muted-foreground)] mb-1">
                    Room Category
                  </label>
                  <select
                    value={selectedTypeId}
                    onChange={e => setSelectedTypeId(e.target.value)}
                    className="w-full h-9 rounded-md border border-[var(--input)] bg-[var(--background)] text-[var(--foreground)] px-3 text-xs"
                  >
                    {roomTypes.map(rt => (
                      <option key={rt.id} value={rt.id}>{rt.name} ({rt.code})</option>
                    ))}
                  </select>
                </div>

                <div className="p-3 rounded-lg bg-[var(--muted)] border border-[var(--border)] flex justify-between items-center">
                  <span className="text-[var(--muted-foreground)]">Base Rack Rate (Auto-populated):</span>
                  <span className="font-bold text-sm text-[var(--primary)]">{formatCurrency(selectedType.basePrice)}</span>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[var(--primary)] hover:opacity-90 text-white font-bold h-10 shadow-md gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Generate {generatedCount} Rooms Directly into State
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* INSTANT EDIT ROOM DIALOG POPUP */}
      {editModalItem && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-[var(--card)] border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden text-xs">
            <CardHeader className="p-4 border-b border-[var(--border)] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-[var(--foreground)]">
                <Building className="w-4 h-4 text-[var(--primary)]" /> Edit Room Details — {editModalItem.label}
              </CardTitle>
              <button onClick={() => setEditModalItem(null)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-bold">
                <X className="w-4 h-4" />
              </button>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">Room Number / Label</label>
                <Input
                  value={editModalItem.label}
                  onChange={e => setEditModalItem({ ...editModalItem, label: e.target.value })}
                  className="h-9 font-bold text-xs rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">Room Category</label>
                <select
                  value={editModalItem.typeId || 'rt-1'}
                  onChange={e => setEditModalItem({ ...editModalItem, typeId: e.target.value })}
                  className="w-full h-9 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-bold text-[var(--foreground)]"
                >
                  {roomTypes.map(rt => (
                    <option key={rt.id} value={rt.id}>{rt.name} ({rt.code}) — {formatCurrency(rt.basePrice)}/night</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">Housekeeping Status</label>
                <select
                  value={editModalItem.status || 'CLEAN'}
                  onChange={e => setEditModalItem({ ...editModalItem, status: e.target.value as RoomStatus })}
                  className="w-full h-9 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-bold text-[var(--foreground)]"
                >
                  <option value="CLEAN">Clean / Ready</option>
                  <option value="DIRTY">Dirty / Cleaning Needed</option>
                  <option value="OOO">Out of Order (OOO)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 border-rose-500/30 text-rose-500 hover:bg-rose-500/10 font-bold rounded-xl px-3 gap-1"
                  onClick={() => {
                    handleDeleteNode(editModalItem.id);
                    setEditModalItem(null);
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Room
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 font-bold rounded-xl"
                    onClick={() => setEditModalItem(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="h-9 font-bold bg-[var(--primary)] text-white rounded-xl px-4"
                    onClick={() => {
                      setCanvasItems(prev =>
                        prev.map(item => (item.id === editModalItem.id ? editModalItem : item))
                      );
                      if (editModalItem.roomId) {
                        updateRoom(editModalItem.roomId, {
                          roomNumber: editModalItem.label.replace('Room ', ''),
                          typeId: editModalItem.typeId,
                          status: editModalItem.status
                        });
                      }
                      setEditModalItem(null);
                    }}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
