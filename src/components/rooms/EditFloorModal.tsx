import React, { useState, useEffect } from 'react';
import { X, Layers, Building2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { BackendFloor, BackendBuilding } from '../../types/hotel';
import type { UpdateFloorInput } from '../../hooks/useRooms';

interface EditFloorModalProps {
  isOpen: boolean;
  onClose: () => void;
  floor: BackendFloor | null;
  buildings?: BackendBuilding[];
  onSubmit: (floorId: number, input: UpdateFloorInput) => Promise<any>;
}

export const EditFloorModal: React.FC<EditFloorModalProps> = ({
  isOpen,
  onClose,
  floor,
  buildings = [],
  onSubmit
}) => {
  const [name, setName] = useState('');
  const [floorNumber, setFloorNumber] = useState<number>(1);
  const [buildingId, setBuildingId] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && floor) {
      setName(floor.name);
      setFloorNumber(floor.floorNumber);
      setBuildingId(floor.buildingId || (buildings[0]?.id ?? 0));
      setError(null);
    }
  }, [isOpen, floor?.id, buildings]);

  if (!isOpen || !floor) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Floor name cannot be empty.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await onSubmit(floor.id, {
        name: name.trim(),
        floorNumber: Number(floorNumber),
        buildingId: buildingId ? Number(buildingId) : undefined
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update floor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[var(--card)] border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden text-xs">
        <CardHeader className="p-4 border-b border-[var(--border)] flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-[var(--foreground)]">
            <Layers className="w-4 h-4 text-[var(--primary)]" /> Edit Floor Level
          </CardTitle>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="p-4 space-y-4">
            {error && (
              <div className="p-2.5 rounded-xl bg-[var(--destructive)]/10 border border-[var(--destructive)]/20 text-[var(--destructive)] text-xs font-semibold">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase">
                Floor Name *
              </label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. 1st Floor - Executive Suites"
                className="h-9 text-xs rounded-xl"
                autoFocus
              />
            </div>

            {buildings.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-[var(--primary)]" /> Assigned Building / Wing
                </label>
                <select
                  value={buildingId}
                  onChange={e => setBuildingId(Number(e.target.value))}
                  className="w-full h-9 rounded-xl border border-[var(--border)] bg-[var(--background)] px-2.5 text-xs font-bold text-[var(--foreground)]"
                >
                  {buildings.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.buildingType})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase">
                Floor Number (Index) *
              </label>
              <Input
                type="number"
                value={floorNumber}
                onChange={e => setFloorNumber(Number(e.target.value))}
                className="h-9 text-xs rounded-xl font-mono"
              />
              <p className="text-[10px] text-[var(--muted-foreground)]">
                Used for vertical ordering across PMS tape charts.
              </p>
            </div>
          </CardContent>

          <div className="p-4 border-t border-[var(--border)] flex items-center justify-end gap-2 bg-[var(--card)]/50">
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
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
