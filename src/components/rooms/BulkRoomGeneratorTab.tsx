import React, { useState } from 'react';
import { PlusCircle, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/Select';
import { formatCurrency } from '../../lib/utils';
import type { BackendFloor, BackendRoomCategory } from '../../types/hotel';

interface BulkRoomGeneratorTabProps {
  floors: BackendFloor[];
  categories: BackendRoomCategory[];
  onGenerate: (data: {
    floorId: number;
    categoryId: number;
    startNumber: number;
    endNumber: number;
    prefix?: string;
  }) => Promise<unknown>;
}

export const BulkRoomGeneratorTab: React.FC<BulkRoomGeneratorTabProps> = ({
  floors,
  categories,
  onGenerate,
}) => {
  const [genFloorId, setGenFloorId] = useState<string>(() => floors[0] ? String(floors[0].id) : '');
  const [genCategoryId, setGenCategoryId] = useState<string>(() => categories[0] ? String(categories[0].id) : '');
  const [genStartNum, setGenStartNum] = useState<number>(101);
  const [genEndNum, setGenEndNum] = useState<number>(110);
  const [genPrefix, setGenPrefix] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genFloorId || !genCategoryId) {
      alert('Please select a target floor and room category');
      return;
    }
    if (genEndNum < genStartNum) {
      alert('End room number must be greater than or equal to start room number');
      return;
    }

    setIsGenerating(true);
    try {
      await onGenerate({
        floorId: Number(genFloorId),
        categoryId: Number(genCategoryId),
        startNumber: genStartNum,
        endNumber: genEndNum,
        prefix: genPrefix.trim() || undefined,
      });
      alert(`Successfully generated ${Math.max(0, genEndNum - genStartNum + 1)} rooms!`);
    } catch (err: any) {
      alert(err?.message || 'Failed to generate rooms');
    } finally {
      setIsGenerating(false);
    }
  };

  const count = Math.max(0, genEndNum - genStartNum + 1);

  return (
    <div className="pt-3">
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
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[var(--muted-foreground)] mb-1">
                Target Floor *
              </label>
              <Select value={genFloorId} onValueChange={setGenFloorId}>
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

            <div>
              <label className="block font-bold text-[var(--muted-foreground)] mb-1">
                Room Category &amp; Pricing *
              </label>
              <Select value={genCategoryId} onValueChange={setGenCategoryId}>
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
                {count} units
              </span>
            </div>

            <Button
              type="submit"
              disabled={isGenerating}
              className="w-full bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] font-bold h-10 rounded-xl shadow-md gap-2 text-xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? 'Generating Rooms...' : `Generate ${count} Rooms in Database`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
