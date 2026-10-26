import React, { useState } from 'react';
import { X, Building2, Layers } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { CreateBuildingInput } from '../../hooks/useRooms';

interface CreateBuildingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateBuildingInput) => Promise<any>;
}

const BUILDING_TYPES = [
  { value: 'HOTEL_TOWER', label: 'Hotel Tower / Main Wing' },
  { value: 'VILLAS', label: 'Villas / Cottages' },
  { value: 'RESORT_WING', label: 'Resort Wing / Annexe' },
  { value: 'OUTDOOR_GROUNDS', label: 'Outdoor Grounds / Poolside' },
  { value: 'FACILITY_BLOCK', label: 'Facility Block / Clubhouse' },
  { value: 'OTHER', label: 'Other Property Wing' },
];

export const CreateBuildingModal: React.FC<CreateBuildingModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [buildingType, setBuildingType] = useState('HOTEL_TOWER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Building name is required.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        code: code.trim().toUpperCase() || undefined,
        buildingType
      });
      setName('');
      setCode('');
      setBuildingType('HOTEL_TOWER');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create building.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[var(--card)] border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden text-xs">
        <CardHeader className="p-4 border-b border-[var(--border)] flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-[var(--foreground)]">
            <Building2 className="w-4 h-4 text-[var(--primary)]" /> Add New Building / Wing
          </CardTitle>
          <button
            onClick={onClose}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-[var(--destructive)]/10 border border-[var(--destructive)]/20 rounded-xl text-[var(--destructive)] text-xs font-semibold">
              {error}
            </div>
          )}

          <form id="create-building-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">
                Building / Wing Name *
              </label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Ocean Tower, Beach Villas, Royal Annexe"
                className="h-9 font-bold text-xs rounded-xl"
                autoFocus
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">
                  Short Code (Optional)
                </label>
                <Input
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. OT, BV"
                  className="h-9 font-bold text-xs rounded-xl uppercase"
                  maxLength={6}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">
                  Building Type *
                </label>
                <select
                  value={buildingType}
                  onChange={e => setBuildingType(e.target.value)}
                  className="w-full h-9 rounded-xl border border-[var(--border)] bg-[var(--background)] px-2.5 text-xs font-bold text-[var(--foreground)]"
                  required
                >
                  {BUILDING_TYPES.map(t => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3 bg-[var(--muted)]/40 border border-[var(--border)] rounded-xl flex items-start gap-2.5">
              <Layers className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                Buildings allow you to organize floors, rooms, private lawns, and amenities into distinct physical zones across your hotel campus.
              </p>
            </div>
          </form>
        </CardContent>

        <div className="p-4 border-t border-[var(--border)] flex items-center justify-end gap-2 bg-[var(--card)]">
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
            form="create-building-form"
            size="sm"
            className="h-9 font-bold bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 rounded-xl px-5 text-xs shadow-md"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Building'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
