import React, { useState } from 'react';
import { X, Sparkles, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { CreateRoomCategoryInput } from '../../hooks/useRooms';

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateRoomCategoryInput) => Promise<any>;
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

export const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [basePrice, setBasePrice] = useState<number>(3500);
  const [maxAdults, setMaxAdults] = useState<number>(2);
  const [maxChildren, setMaxChildren] = useState<number>(1);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Free High-speed WiFi',
    'Air Conditioning',
    '55-inch Smart TV'
  ]);
  const [customAmenity, setCustomAmenity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

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
      await onSubmit({
        name: name.trim(),
        code: code.trim().toUpperCase() || undefined,
        basePrice: Number(basePrice),
        maxAdults: Number(maxAdults),
        maxChildren: Number(maxChildren),
        amenities: selectedAmenities
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create room category.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-[var(--card)] border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden text-xs max-h-[90vh] flex flex-col">
        <CardHeader className="p-4 border-b border-[var(--border)] flex flex-row items-center justify-between shrink-0">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-[var(--foreground)]">
            <Sparkles className="w-4 h-4 text-[var(--primary)]" /> Create Room Category & Pricing
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

          <form id="create-category-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">
                  Category Name *
                </label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Deluxe King Suite"
                  className="h-9 font-semibold text-xs rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">
                  Short Code
                </label>
                <Input
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. DLX"
                  className="h-9 font-mono uppercase font-bold text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">
                  Base Price (₹/Night) *
                </label>
                <Input
                  type="number"
                  min="0"
                  step="50"
                  value={basePrice}
                  onChange={e => setBasePrice(Number(e.target.value))}
                  className="h-9 font-bold font-mono text-xs rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">
                  Max Adults
                </label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={maxAdults}
                  onChange={e => setMaxAdults(Number(e.target.value))}
                  className="h-9 font-bold text-xs rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">
                  Max Children
                </label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={maxChildren}
                  onChange={e => setMaxChildren(Number(e.target.value))}
                  className="h-9 font-bold text-xs rounded-xl"
                  required
                />
              </div>
            </div>

            {/* Amenities Picker */}
            <div>
              <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1.5">
                Included Amenities ({selectedAmenities.length} selected)
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2.5 max-h-36 overflow-y-auto p-1 border border-[var(--border)] rounded-xl bg-[var(--muted)]/20">
                {COMMON_AMENITIES.map(amenity => {
                  const isSelected = selectedAmenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)] shadow-xs'
                          : 'bg-[var(--background)] text-[var(--muted-foreground)] border-[var(--border)] hover:border-[var(--primary)]/50'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {amenity}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <Input
                  value={customAmenity}
                  onChange={e => setCustomAmenity(e.target.value)}
                  placeholder="Add custom amenity..."
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
                  className="h-8 text-xs font-bold rounded-xl px-3"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </Button>
              </div>
            </div>
          </form>
        </CardContent>

        <div className="p-4 border-t border-[var(--border)] flex items-center justify-end gap-2 shrink-0 bg-[var(--card)]">
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
            form="create-category-form"
            size="sm"
            className="h-9 font-bold bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 rounded-xl px-5 text-xs shadow-md"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Category'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
