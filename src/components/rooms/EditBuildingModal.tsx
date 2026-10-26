import React, { useState, useEffect } from 'react';
import { X, Building2, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { BackendBuilding } from '../../types/hotel';
import type { UpdateBuildingInput } from '../../hooks/useRooms';

interface EditBuildingModalProps {
  isOpen: boolean;
  onClose: () => void;
  building: BackendBuilding | null;
  onSubmit: (id: number, input: UpdateBuildingInput) => Promise<any>;
  onDelete: (id: number) => Promise<any>;
}

const BUILDING_TYPES = [
  { value: 'HOTEL_TOWER', label: 'Hotel Tower / Main Wing' },
  { value: 'VILLAS', label: 'Villas / Cottages' },
  { value: 'RESORT_WING', label: 'Resort Wing / Annexe' },
  { value: 'OUTDOOR_GROUNDS', label: 'Outdoor Grounds / Poolside' },
  { value: 'FACILITY_BLOCK', label: 'Facility Block / Clubhouse' },
  { value: 'OTHER', label: 'Other Property Wing' },
];

export const EditBuildingModal: React.FC<EditBuildingModalProps> = ({
  isOpen,
  onClose,
  building,
  onSubmit,
  onDelete
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [buildingType, setBuildingType] = useState('HOTEL_TOWER');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && building) {
      setName(building.name);
      setCode(building.code || '');
      setBuildingType(building.buildingType || 'HOTEL_TOWER');
      setError(null);
    }
  }, [isOpen, building?.id]);

  if (!isOpen || !building) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Building name is required.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await onSubmit(building.id, {
        name: name.trim(),
        code: code.trim().toUpperCase() || undefined,
        buildingType
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update building.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to remove building "${building.name}"?`)) return;
    setError(null);
    setDeleting(true);
    try {
      await onDelete(building.id);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete building.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[var(--card)] border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden text-xs">
        <CardHeader className="p-4 border-b border-[var(--border)] flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-[var(--foreground)]">
            <Building2 className="w-4 h-4 text-[var(--primary)]" /> Edit Building / Wing
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

          <form id="edit-building-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">
                Building Name *
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
                  Short Code
                </label>
                <Input
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  className="h-9 font-bold text-xs rounded-xl uppercase"
                  maxLength={6}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">
                  Building Type
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
          </form>
        </CardContent>

        <div className="p-4 border-t border-[var(--border)] flex items-center justify-between bg-[var(--card)]">
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
              form="edit-building-form"
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
