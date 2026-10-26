import React, { useState, useEffect } from 'react';
import { X, Sparkles, Trash2, Clock, Users, DollarSign, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { BackendBuilding, BackendFloor, BackendUtility } from '../../types/hotel';
import type { UpdateUtilityInput } from '../../hooks/useRooms';

interface EditUtilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  utility: BackendUtility | null;
  buildings: BackendBuilding[];
  floors: BackendFloor[];
  onSubmit: (id: number, input: UpdateUtilityInput) => Promise<any>;
  onDelete: (id: number) => Promise<any>;
}

const UTILITY_TYPES = [
  { value: 'POOL', label: 'Swimming Pool / Jacuzzi' },
  { value: 'LAWN', label: 'Outdoor Grounds / Lawn / Garden' },
  { value: 'SPA', label: 'Spa / Wellness / Sauna' },
  { value: 'GYM', label: 'Fitness Center / Gym' },
  { value: 'RESTAURANT', label: 'Restaurant / Dining Hall' },
  { value: 'LOUNGE', label: 'Rooftop Lounge / Bar' },
  { value: 'BANQUET', label: 'Banquet Hall / Event Space' },
  { value: 'SPORTS_COURT', label: 'Tennis / Badminton / Sports' },
  { value: 'OTHER', label: 'Other Facility' },
];

export const EditUtilityModal: React.FC<EditUtilityModalProps> = ({
  isOpen,
  onClose,
  utility,
  buildings,
  floors,
  onSubmit,
  onDelete
}) => {
  const [buildingId, setBuildingId] = useState<number>(0);
  const [floorId, setFloorId] = useState<string>('NONE');
  const [name, setName] = useState('');
  const [utilityType, setUtilityType] = useState('POOL');
  const [status, setStatus] = useState<'OPEN' | 'CLOSED' | 'CLEANING' | 'MAINTENANCE'>('OPEN');
  const [capacity, setCapacity] = useState<string>('');
  const [operatingHours, setOperatingHours] = useState('');
  const [isBookable, setIsBookable] = useState(false);
  const [rentalPrice, setRentalPrice] = useState<string>('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [customAmenity, setCustomAmenity] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && utility) {
      setBuildingId(utility.buildingId);
      setFloorId(utility.floorId ? String(utility.floorId) : 'NONE');
      setName(utility.name);
      setUtilityType(utility.utilityType);
      setStatus(utility.status);
      setCapacity(utility.capacity ? String(utility.capacity) : '');
      setOperatingHours(utility.operatingHours || '');
      setIsBookable(utility.isBookable);
      setRentalPrice(utility.rentalPrice ? String(utility.rentalPrice) : '');
      setAmenities(utility.amenities || []);
      setError(null);
    }
  }, [isOpen, utility?.id]);

  if (!isOpen || !utility) return null;

  const relevantFloors = floors.filter(f => !buildingId || f.buildingId === buildingId);

  const toggleAmenity = (item: string) => {
    setAmenities(prev =>
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    );
  };

  const addCustomAmenity = () => {
    const trimmed = customAmenity.trim();
    if (trimmed && !amenities.includes(trimmed)) {
      setAmenities(prev => [...prev, trimmed]);
      setCustomAmenity('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Facility name is required.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await onSubmit(utility.id, {
        buildingId,
        name: name.trim(),
        utilityType,
        floorId: floorId === 'NONE' ? null : Number(floorId),
        status,
        capacity: capacity ? Number(capacity) : null,
        operatingHours: operatingHours.trim() || null,
        isBookable,
        rentalPrice: rentalPrice ? Number(rentalPrice) : null,
        amenities: amenities.length > 0 ? amenities : []
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update facility.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to remove facility "${utility.name}"?`)) return;
    setError(null);
    setDeleting(true);
    try {
      await onDelete(utility.id);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete facility.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-[var(--card)] border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden text-xs max-h-[90vh] flex flex-col">
        <CardHeader className="p-4 border-b border-[var(--border)] flex flex-row items-center justify-between shrink-0">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-[var(--foreground)]">
            <Sparkles className="w-4 h-4 text-[var(--primary)]" /> Edit Facility / Utility
          </CardTitle>
          <button
            onClick={onClose}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </CardHeader>

        <CardContent className="p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-[var(--destructive)]/10 border border-[var(--destructive)]/20 rounded-xl text-[var(--destructive)] text-xs font-semibold">
              {error}
            </div>
          )}

          <form id="edit-utility-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">
                Facility Name *
              </label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                className="h-9 font-bold text-xs rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">
                  Facility Type
                </label>
                <select
                  value={utilityType}
                  onChange={e => setUtilityType(e.target.value)}
                  className="w-full h-9 rounded-xl border border-[var(--border)] bg-[var(--background)] px-2.5 text-xs font-bold text-[var(--foreground)]"
                  required
                >
                  {UTILITY_TYPES.map(t => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">
                  Live Facility Status
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full h-9 rounded-xl border border-[var(--border)] bg-[var(--background)] px-2.5 text-xs font-bold text-[var(--foreground)]"
                >
                  <option value="OPEN">🟢 OPEN (Active)</option>
                  <option value="CLEANING">🟡 CLEANING (Turnaround)</option>
                  <option value="MAINTENANCE">🔴 MAINTENANCE (Out of Order)</option>
                  <option value="CLOSED">⚪ CLOSED</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">
                  Located in Building
                </label>
                <select
                  value={buildingId}
                  onChange={e => setBuildingId(Number(e.target.value))}
                  className="w-full h-9 rounded-xl border border-[var(--border)] bg-[var(--background)] px-2.5 text-xs font-bold text-[var(--foreground)]"
                  required
                >
                  {buildings.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">
                  Floor Level
                </label>
                <select
                  value={floorId}
                  onChange={e => setFloorId(e.target.value)}
                  className="w-full h-9 rounded-xl border border-[var(--border)] bg-[var(--background)] px-2.5 text-xs font-bold text-[var(--foreground)]"
                >
                  <option value="NONE">Property Grounds / Open Level</option>
                  {relevantFloors.map(f => (
                    <option key={f.id} value={f.id}>
                      Floor {f.floorNumber} — {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[var(--muted-foreground)]" /> Operating Hours
                </label>
                <Input
                  value={operatingHours}
                  onChange={e => setOperatingHours(e.target.value)}
                  className="h-9 font-bold text-xs rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[var(--muted-foreground)]" /> Guest Capacity
                </label>
                <Input
                  type="number"
                  min="0"
                  value={capacity}
                  onChange={e => setCapacity(e.target.value)}
                  className="h-9 font-bold text-xs rounded-xl"
                />
              </div>
            </div>

            {/* Bookable & Rental Option */}
            <div className="p-3 bg-[var(--muted)]/40 border border-[var(--border)] rounded-xl space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[var(--foreground)]">
                <input
                  type="checkbox"
                  checked={isBookable}
                  onChange={e => setIsBookable(e.target.checked)}
                  className="rounded text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                Available for Private Event Rental / Guest Booking
              </label>

              {isBookable && (
                <div className="pt-2 flex items-center gap-2">
                  <label className="text-[11px] font-bold text-[var(--muted-foreground)] whitespace-nowrap flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-[var(--primary)]" /> Rental Fee / Hour:
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={rentalPrice}
                    onChange={e => setRentalPrice(e.target.value)}
                    className="h-8 font-bold text-xs rounded-xl max-w-[140px]"
                  />
                </div>
              )}
            </div>

            {/* Amenities Tags */}
            <div>
              <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1.5">
                Facility Features & Amenities
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={customAmenity}
                  onChange={e => setCustomAmenity(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomAmenity();
                    }
                  }}
                  placeholder="Type custom amenity..."
                  className="h-8 text-xs rounded-xl font-medium"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCustomAmenity}
                  className="h-8 px-3 rounded-xl text-xs font-bold shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </Button>
              </div>

              {amenities.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {amenities.map(a => (
                    <span
                      key={a}
                      className="px-2 py-0.5 rounded-md bg-[var(--muted)] text-[var(--foreground)] font-bold text-[10px] flex items-center gap-1 border border-[var(--border)]"
                    >
                      {a}
                      <button
                        type="button"
                        onClick={() => toggleAmenity(a)}
                        className="hover:text-[var(--destructive)]"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </form>
        </CardContent>

        <div className="p-4 border-t border-[var(--border)] flex items-center justify-between bg-[var(--card)] shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="h-9 font-bold rounded-xl text-xs text-[var(--destructive)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10 gap-1.5"
            disabled={loading || deleting}
          >
            <Trash2 className="w-3.5 h-3.5" /> {deleting ? 'Deleting...' : 'Delete'}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-9 font-bold rounded-xl text-xs"
              disabled={loading || deleting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="edit-utility-form"
              size="sm"
              className="h-9 font-bold bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 rounded-xl px-5 text-xs shadow-md"
              disabled={loading || deleting}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
