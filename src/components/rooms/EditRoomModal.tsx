import React, { useState, useEffect } from 'react';
import { X, BedDouble, Sparkles, Tag, DollarSign, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/Select';
import { formatCurrency } from '../../lib/utils';
import type { BackendFloor, BackendRoomCategory, BackendRoom, LiveRoomStatus } from '../../types/hotel';
import type { UpdateRoomInput } from '../../hooks/useRooms';

interface EditRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: BackendRoom | null;
  floors: BackendFloor[];
  categories: BackendRoomCategory[];
  onSubmit: (roomId: number, input: UpdateRoomInput) => Promise<any>;
}

const PRESET_CUSTOM_AMENITIES = [
  'Private Jacuzzi', 'Sea View', 'Plunge Pool', 'Butler Service',
  'Private Balcony', 'King Size Bed', 'Mini Bar', 'Bathtub',
  'Espresso Machine', 'Lounge Area', 'Smart Automation'
];

export const EditRoomModal: React.FC<EditRoomModalProps> = ({
  isOpen,
  onClose,
  room,
  floors,
  categories,
  onSubmit
}) => {
  const [mode, setMode] = useState<'CATEGORY' | 'FREEHAND'>('CATEGORY');
  const [floorId, setFloorId] = useState<number>(0);
  const [categoryId, setCategoryId] = useState<number>(0);
  const [roomNumber, setRoomNumber] = useState('');
  const [status, setStatus] = useState<LiveRoomStatus>('AVAILABLE');

  // Free-hand fields
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customAmenities, setCustomAmenities] = useState<string[]>([]);
  const [newAmenityInput, setNewAmenityInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && room) {
      setFloorId(room.floorId);
      setRoomNumber(room.roomNumber);
      setStatus(room.status);

      if (room.customPrice != null || !room.categoryId) {
        setMode('FREEHAND');
        setCustomName(room.customName || '');
        setCustomPrice(room.customPrice != null ? String(room.customPrice) : String(room.basePrice));
        setCustomAmenities(room.customAmenities || []);
        setCategoryId(room.categoryId || categories[0]?.id || 0);
      } else {
        setMode('CATEGORY');
        setCategoryId(room.categoryId || categories[0]?.id || 0);
        setCustomName('');
        setCustomPrice('');
        setCustomAmenities([]);
      }
      setError(null);
    }
  }, [isOpen, room?.id]);

  if (!isOpen || !room) return null;

  const selectedCategory = categories.find(c => c.id === categoryId);

  const toggleCustomAmenity = (item: string) => {
    setCustomAmenities(prev =>
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    );
  };

  const addCustomAmenity = () => {
    const trimmed = newAmenityInput.trim();
    if (trimmed && !customAmenities.includes(trimmed)) {
      setCustomAmenities(prev => [...prev, trimmed]);
      setNewAmenityInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim()) {
      setError('Room number is required.');
      return;
    }
    if (!floorId) {
      setError('Please select a valid floor.');
      return;
    }

    if (mode === 'CATEGORY' && !categoryId) {
      setError('Please select a valid room category.');
      return;
    }

    if (mode === 'FREEHAND' && !customPrice) {
      setError('Please specify the nightly room rate.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      if (mode === 'CATEGORY') {
        await onSubmit(room.id, {
          roomNumber: roomNumber.trim(),
          floorId: Number(floorId),
          categoryId: Number(categoryId),
          customName: null,
          customPrice: null,
          customAmenities: null,
          status
        });
      } else {
        await onSubmit(room.id, {
          roomNumber: roomNumber.trim(),
          floorId: Number(floorId),
          categoryId: null,
          customName: customName.trim() || null,
          customPrice: Number(customPrice),
          customAmenities: customAmenities.length > 0 ? customAmenities : [],
          status
        });
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update room details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[var(--card)] border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden text-xs max-h-[90vh] flex flex-col">
        <CardHeader className="p-4 border-b border-[var(--border)] flex flex-row items-center justify-between shrink-0">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-[var(--foreground)]">
            <BedDouble className="w-4 h-4 text-[var(--primary)]" /> Edit Room #{room.roomNumber}
          </CardTitle>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            <X className="w-4 h-4" />
          </button>
        </CardHeader>

        <CardContent className="p-4 space-y-4 overflow-y-auto">
          {/* Mode Switcher */}
          <div className="p-1 bg-[var(--muted)]/50 rounded-xl flex items-center border border-[var(--border)]">
            <button
              type="button"
              onClick={() => setMode('CATEGORY')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'CATEGORY'
                  ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-[var(--primary)]" /> Category Preset
            </button>
            <button
              type="button"
              onClick={() => setMode('FREEHAND')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'FREEHAND'
                  ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--primary)]" /> Free-Hand Custom
            </button>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-[var(--destructive)]/10 border border-[var(--destructive)]/20 text-[var(--destructive)] text-xs font-semibold">
              {error}
            </div>
          )}

          <form id="edit-room-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">
                  Room Door Number *
                </label>
                <Input
                  value={roomNumber}
                  onChange={e => setRoomNumber(e.target.value)}
                  className="h-9 font-bold text-xs rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">
                  Operational Status
                </label>
                <Select
                  value={status}
                  onValueChange={(val) => setStatus(val as LiveRoomStatus)}
                >
                  <SelectTrigger className="w-full h-9 rounded-xl border border-[var(--border)] bg-[var(--background)] px-2.5 text-xs font-bold text-[var(--foreground)]">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">AVAILABLE (Vacant)</SelectItem>
                    <SelectItem value="OCCUPIED">OCCUPIED (In-house)</SelectItem>
                    <SelectItem value="CLEANING">CLEANING (Dirty)</SelectItem>
                    <SelectItem value="MAINTENANCE">MAINTENANCE (Repair)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">
                Assigned Floor Level & Building
              </label>
              <Select
                value={floorId ? String(floorId) : undefined}
                onValueChange={(val) => setFloorId(Number(val))}
              >
                <SelectTrigger className="w-full h-9 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-bold text-[var(--foreground)]">
                  <SelectValue placeholder="Select Floor" />
                </SelectTrigger>
                <SelectContent>
                  {floors.map(f => (
                    <SelectItem key={f.id} value={String(f.id)}>
                      Floor {f.floorNumber} — {f.name} {f.buildingName ? `(${f.buildingName})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {mode === 'CATEGORY' ? (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">
                    Room Category & Pricing
                  </label>
                  <Select
                    value={categoryId ? String(categoryId) : undefined}
                    onValueChange={(val) => setCategoryId(Number(val))}
                  >
                    <SelectTrigger className="w-full h-9 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-bold text-[var(--foreground)]">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name} {c.code ? `(${c.code})` : ''} — {formatCurrency(c.basePrice)}/night
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCategory && (
                  <div className="p-3 rounded-xl bg-[var(--muted)]/40 border border-[var(--border)] space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-[var(--muted-foreground)]">Standard Base Price:</span>
                      <span className="font-bold font-mono text-[var(--primary)]">{formatCurrency(selectedCategory.basePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--muted-foreground)]">Capacity:</span>
                      <span className="font-bold">{selectedCategory.maxAdults} Adults, {selectedCategory.maxChildren} Children</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Free-Hand Custom Mode */
              <div className="space-y-3 p-3 bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-xl">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
                    Custom Room Title / Badge (Optional)
                  </label>
                  <Input
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    placeholder="e.g. Royal Presidential Suite"
                    className="h-8 font-bold text-xs rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-[var(--primary)]" /> Manual Custom Price (₹ / night) *
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={customPrice}
                    onChange={e => setCustomPrice(e.target.value)}
                    className="h-8 font-bold font-mono text-xs rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">
                    Dedicated Amenities (Free-Hand)
                  </label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {PRESET_CUSTOM_AMENITIES.map(amenity => {
                      const selected = customAmenities.includes(amenity);
                      return (
                        <button
                          type="button"
                          key={amenity}
                          onClick={() => toggleCustomAmenity(amenity)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                            selected
                              ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs'
                              : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                          }`}
                        >
                          {amenity}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-1.5">
                    <Input
                      value={newAmenityInput}
                      onChange={e => setNewAmenityInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomAmenity();
                        }
                      }}
                      placeholder="Add custom amenity..."
                      className="h-7 text-xs rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addCustomAmenity}
                      className="h-7 px-2.5 rounded-lg text-xs font-bold"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>

                  {customAmenities.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {customAmenities.map(a => (
                        <span
                          key={a}
                          className="px-2 py-0.5 rounded bg-[var(--muted)] text-[var(--foreground)] font-bold text-[10px] flex items-center gap-1 border border-[var(--border)]"
                        >
                          {a}
                          <button
                            type="button"
                            onClick={() => toggleCustomAmenity(a)}
                            className="hover:text-[var(--destructive)]"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </CardContent>

        <div className="p-4 border-t border-[var(--border)] flex items-center justify-end gap-2 bg-[var(--card)] shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-9 font-bold rounded-xl text-xs"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-room-form"
            size="sm"
            className="h-9 font-bold bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 rounded-xl px-5 text-xs shadow-md"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
