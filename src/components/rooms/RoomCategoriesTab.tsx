import React from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../lib/utils';
import type { BackendRoomCategory } from '../../types/hotel';

interface RoomCategoriesTabProps {
  categories: BackendRoomCategory[];
  onAddCategory: () => void;
  onEditCategory: (cat: BackendRoomCategory) => void;
  onDeleteCategory: (catId: number, catName: string) => void;
}

export const RoomCategoriesTab: React.FC<RoomCategoriesTabProps> = ({
  categories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}) => {
  return (
    <div className="pt-3 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-[var(--foreground)]">Room Categories &amp; Pricing Tiers</h3>
          <p className="text-xs text-[var(--muted-foreground)]">
            Categories define standard baseline nightly rates, guest capacities, and included amenities.
          </p>
        </div>
        <Button
          size="sm"
          onClick={onAddCategory}
          className="h-8 text-xs font-bold rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map(cat => (
          <Card key={cat.id} className="rounded-2xl border-[var(--border)] overflow-hidden shadow-xs flex flex-col justify-between">
            <div>
              <CardHeader className="p-4 border-b border-[var(--border)] flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
                    {cat.name}
                    {cat.code && (
                      <span className="px-1.5 py-0.5 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] font-mono text-[10px] font-bold">
                        {cat.code}
                      </span>
                    )}
                  </CardTitle>
                  <span className="text-[11px] text-[var(--muted-foreground)]">
                    {cat.roomCount} room{cat.roomCount !== 1 ? 's' : ''} assigned
                  </span>
                </div>
                <span className="text-sm font-black font-mono text-[var(--primary)]">
                  {formatCurrency(cat.basePrice)}<span className="text-[10px] text-[var(--muted-foreground)] font-normal">/night</span>
                </span>
              </CardHeader>

              <CardContent className="p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
                  <span>Max Occupancy:</span>
                  <span className="font-bold text-[var(--foreground)]">
                    {cat.maxAdults} Adults, {cat.maxChildren} Children
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase block mb-1.5">
                    Amenities ({cat.amenities?.length || 0}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {cat.amenities && cat.amenities.length > 0 ? (
                      cat.amenities.map(a => (
                        <span
                          key={a}
                          className="px-2 py-0.5 rounded-md bg-[var(--muted)]/50 border border-[var(--border)] text-[10px] font-semibold text-[var(--muted-foreground)]"
                        >
                          {a}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-[var(--muted-foreground)] italic">Standard amenities</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </div>

            <div className="p-3 border-t border-[var(--border)] flex items-center justify-end gap-2 bg-[var(--card)]/50">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEditCategory(cat)}
                className="h-8 text-[11px] font-bold rounded-xl px-2.5 gap-1 border-[var(--border)] cursor-pointer"
              >
                <Pencil className="w-3 h-3 text-[var(--primary)]" /> Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDeleteCategory(cat.id, cat.name)}
                className="h-8 text-[11px] text-[var(--destructive)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10 font-bold rounded-xl px-2.5 gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
