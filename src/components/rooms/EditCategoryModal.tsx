import React, { useState, useEffect } from 'react';
import { X, Sparkles, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { BackendRoomCategory } from '../../types/hotel';
import type { UpdateRoomCategoryInput } from '../../hooks/useRooms';

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: BackendRoomCategory | null;
  onSubmit: (categoryId: number, input: UpdateRoomCategoryInput) => Promise<any>;
}

const COMMON_AMENITIES = [
  'Free High-speed WiFi',
  'Air Conditioning',
  '55-inch Smart TV',
  'Mini Bar',
  'Tea/Coffee Maker',
  'Private Balcony',
  'Jacuzzi',
  'Room Safe',
  'Work Desk',
  'Hair Dryer',
  'Bathrobe & Slippers',
  'Panoramic City View'
];

export const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  onSubmit
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [basePrice, setBasePrice] = useState<number>(3500);
  const [maxAdults, setMaxAdults] = useState<number>(2);
  const [maxChildren, setMaxChildren] = useState<number>(1);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [customAmenity, setCustomAmenity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && category) {
      setName(category.name);
      setCode(category.code || '');
      setBasePrice(category.basePrice);
      setMaxAdults(category.maxAdults);
      setMaxChildren(category.maxChildren);
      setSelectedAmenities(category.amenities || []);
      setError(null);
    }
  }, [isOpen, category?.id]);

  if (!isOpen || !category) return null;

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleAddCustomAmenity = (e: React.FormEvent) => {
    e.preventDefault();
    if (customAmenity.trim() && !selectedAmenities.includes(customAmenity.trim())) {
      setSelectedAmenities(prev => [...prev, customAmenity.trim()]);
      setCustomAmenity('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }
    if (basePrice < 0) {
      setError('Base price must be positive.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await onSubmit(category.id, {
        name: name.trim(),
        code: code.trim().toUpperCase() || undefined,
        basePrice: Number(basePrice),
        maxAdults: Number(maxAdults),
        maxChildren: Number(maxChildren),
        amenities: selectedAmenities
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update category.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-[var(--card)] border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden text-xs max-h-[90vh] flex flex-col">
        <CardHeader className="p-4 border-b border-[var(--border)] flex flex-row items-center justify-between shrink-0">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-[var(--foreground)]">
            <Sparkles className="w-4 h-4 text-[var(--primary)]" /> Edit Room Category
          </CardTitle>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </CardHeader>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-4 space-y-4">
          {error && (
            <div className="p-2.5 rounded-xl bg-[var(--destructive)]/10 border border-[var(--destructive)]/20 text-[var(--destructive)] text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase">
                Category Name *
              </label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Deluxe Ocean View Suite"
                className="h-9 text-xs rounded-xl"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase">
                Short Code (Optional)
              </label>
              <Input
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. DLX"
                maxLength={10}
                className="h-9 text-xs rounded-xl font-mono uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase">
                Base Nightly Price (INR ₹) *
              </label>
              <Input
                type="number"
                min="0"
                step="50"
                value={basePrice}
                onChange={e => setBasePrice(Number(e.target.value))}
                className="h-9 text-xs rounded-xl font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase">
                Max Adults Capacity
              </label>
              <Input
                type="number"
                min="1"
                max="20"
                value={maxAdults}
                onChange={e => setMaxAdults(Number(e.target.value))}
                className="h-9 text-xs rounded-xl font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase">
                Max Children Capacity
              </label>
              <Input
                type="number"
                min="0"
                max="10"
                value={maxChildren}
                onChange={e => setMaxChildren(Number(e.target.value))}
                className="h-9 text-xs rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-[var(--border)]">
            <label className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase block">
              Amenities & In-Room Perks
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_AMENITIES.map(amenity => {
                const isSelected = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)] shadow-xs'
                        : 'bg-[var(--muted)]/50 text-[var(--muted-foreground)] border-[var(--border)] hover:bg-[var(--muted)]'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {amenity}
                  </button>
                );
              })}
            </div>

            {/* Custom Amenity Input */}
            <div className="flex items-center gap-1.5 mt-2">
              <Input
                value={customAmenity}
                onChange={e => setCustomAmenity(e.target.value)}
                placeholder="Add custom amenity (e.g. Espresso Machine)"
                className="h-8 text-xs rounded-xl flex-1"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomAmenity(e);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCustomAmenity}
                className="h-8 text-xs font-bold rounded-xl gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </Button>
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--border)] flex items-center justify-end gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
              className="h-8 text-xs font-bold rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="h-8 text-xs font-bold rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 px-4 shadow-sm"
            >
              {loading ? 'Saving...' : 'Update Category'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
