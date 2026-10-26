import React, { useState } from 'react';
import { X, Sparkles, Clock, Users, DollarSign, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { BackendBuilding, BackendFloor } from '../../types/hotel';
import type { CreateUtilityInput } from '../../hooks/useRooms';

interface CreateUtilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildings: BackendBuilding[];
  floors: BackendFloor[];
  defaultBuildingId?: number;
  onSubmit: (input: CreateUtilityInput) => Promise<any>;
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

const PRESET_AMENITIES = [
  'Towel Service', 'Poolside Bar', 'Heated Water', 'Sound System',
  'Ambient Lighting', 'Air Conditioned', 'WiFi', 'Shower & Locker',
  'Changing Rooms', 'Catering Available', 'Lifeguard on Duty'
];

export const CreateUtilityModal: React.FC<CreateUtilityModalProps> = ({
  isOpen,
  onClose,
  buildings,
  floors,
  defaultBuildingId,
  onSubmit
}) => {
  const [buildingId, setBuildingId] = useState<number>(defaultBuildingId || buildings[0]?.id || 0);
  const [floorId, setFloorId] = useState<string>('NONE');
  const [name, setName] = useState('');
  const [utilityType, setUtilityType] = useState('POOL');
  const [status, setStatus] = useState<'OPEN' | 'CLOSED' | 'CLEANING' | 'MAINTENANCE'>('OPEN');
  const [capacity, setCapacity] = useState<string>('');
  const [operatingHours, setOperatingHours] = useState('06:00 AM - 10:00 PM');
  const [isBookable, setIsBookable] = useState(false);
  const [rentalPrice, setRentalPrice] = useState<string>('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [customAmenity, setCustomAmenity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (defaultBuildingId) setBuildingId(defaultBuildingId);
    else if (buildings.length > 0 && !buildingId) setBuildingId(buildings[0].id);
  }, [defaultBuildingId, buildings]);

  if (!isOpen) return null;

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
    if (!buildingId) {
      setError('Please select a building.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await onSubmit({
        buildingId,
        name: name.trim(),
        utilityType,
        floorId: floorId === 'NONE' ? null : Number(floorId),
        status,
        capacity: capacity ? Number(capacity) : null,
        operatingHours: operatingHours.trim() || null,
        isBookable,
        rentalPrice: rentalPrice ? Number(rentalPrice) : null,
        amenities: amenities.length > 0 ? amenities : undefined
      });
      setName('');
      setAmenities([]);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create facility.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-[var(--card)] border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden text-xs max-h-[90vh] flex flex-col">
        <CardHeader className="p-4 border-b border-[var(--border)] flex flex-row items-center justify-between shrink-0">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-[var(--foreground)]">
            <Sparkles className="w-4 h-4 text-[var(--primary)]" /> Add Property Facility / Utility
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

          <form id="create-utility-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">
                Facility Name *
              </label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Rooftop Infinity Pool, Grand Banquet Lawn, Ayurvedic Spa"
                className="h-9 font-bold text-xs rounded-xl"
                autoFocus
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">
                  Facility Type *
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
                  Initial Status
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
                  Located in Building *
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
                  Floor Level (Optional)
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
                  placeholder="e.g. 06:00 AM - 10:00 PM"
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
                  placeholder="e.g. 50"
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
                    placeholder="e.g. 2500"
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
              <div className="flex flex-wrap gap-1.5 mb-2">
                {PRESET_AMENITIES.map(amenity => {
                  const selected = amenities.includes(amenity);
                  return (
                    <button
                      type="button"
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
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

              <div className="flex gap-2">
                <Input
                  value={customAmenity}
                  onChange={e => setCustomAmenity(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomAmenity();
                    }
                  }}
                  placeholder="Type custom amenity and press enter..."
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
                <div className="mt-2 flex flex-wrap gap-1">
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
            form="create-utility-form"
            size="sm"
            className="h-9 font-bold bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 rounded-xl px-5 text-xs shadow-md"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Facility'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
