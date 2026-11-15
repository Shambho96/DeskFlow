import React, { useState } from 'react';
import { Tag, Plus, X, Check, Loader2, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useHotelPreferences } from '../../hooks/useHotelPreferences';

export const SpecialRequestsAndTagsTab: React.FC = () => {
  const {
    specialRequests,
    guestTags,
    isLoading,
    isSaving,
    saveRequests,
    saveTags,
  } = useHotelPreferences();

  const [newGuestTagInput, setNewGuestTagInput] = useState('');
  const [newReservationTagInput, setNewReservationTagInput] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Derive tag lists directly from database state
  const guestTagList = (guestTags || []).map(t => t.name.toUpperCase());
  const reservationTagList = (specialRequests || []).map(r => r.label.toUpperCase());

  // Persist guest tags to backend
  const persistGuestTags = async (updated: string[]) => {
    setSaveStatus('saving');
    try {
      const items = updated.map((name, idx) => ({
        name,
        color: 'blue',
        category: 'PROFILE',
        displayOrder: idx + 1,
        isActive: true,
      }));
      await saveTags(items);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch {
      setSaveStatus('error');
    }
  };

  // Persist reservation tags to backend
  const persistReservationTags = async (updated: string[]) => {
    setSaveStatus('saving');
    try {
      const items = updated.map((label, idx) => ({
        code: label.replace(/\s+/g, '_').toUpperCase(),
        label,
        category: 'ROOM',
        isChargeable: false,
        price: 0,
        icon: 'Sparkles',
        displayOrder: idx + 1,
        isActive: true,
      }));
      await saveRequests(items);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch {
      setSaveStatus('error');
    }
  };

  // Add Guest Tag
  const handleAddGuestTag = async () => {
    const trimmed = newGuestTagInput.trim().toUpperCase();
    if (!trimmed) return;
    if (!guestTagList.includes(trimmed)) {
      const updated = [...guestTagList, trimmed];
      setNewGuestTagInput('');
      await persistGuestTags(updated);
    } else {
      setNewGuestTagInput('');
    }
  };

  // Remove Guest Tag
  const handleRemoveGuestTag = async (tagToRemove: string) => {
    const updated = guestTagList.filter(t => t !== tagToRemove);
    await persistGuestTags(updated);
  };

  // Add Reservation Tag
  const handleAddReservationTag = async () => {
    const trimmed = newReservationTagInput.trim().toUpperCase();
    if (!trimmed) return;
    if (!reservationTagList.includes(trimmed)) {
      const updated = [...reservationTagList, trimmed];
      setNewReservationTagInput('');
      await persistReservationTags(updated);
    } else {
      setNewReservationTagInput('');
    }
  };

  // Remove Reservation Tag
  const handleRemoveReservationTag = async (tagToRemove: string) => {
    const updated = reservationTagList.filter(t => t !== tagToRemove);
    await persistReservationTags(updated);
  };

  // Clear All Tags
  const handleClearAll = async () => {
    if (window.confirm('Clear all configured tags from the database? You will start completely empty and can add tags manually.')) {
      await Promise.all([
        persistGuestTags([]),
        persistReservationTags([]),
      ]);
    }
  };

  const totalTags = guestTagList.length + reservationTagList.length;

  return (
    <div className="space-y-6 text-left">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--foreground)] tracking-tight flex items-center gap-2">
            <Tag className="w-5 h-5 text-[var(--primary)]" />
            Tags &amp; Preferences Configuration
          </h2>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Configure persistent guest profile tags and visit-specific reservation tags for instant booking selection.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Status pill */}
          {saveStatus === 'saving' || isSaving ? (
            <span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Saving...
            </span>
          ) : saveStatus === 'saved' ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <Check className="w-3.5 h-3.5" />
              Saved to hotel config
            </span>
          ) : (
            <span className="text-[11px] text-[var(--muted-foreground)] px-2">
              Auto-saved
            </span>
          )}

          {totalTags > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={isSaving || isLoading}
              className="text-xs flex items-center gap-1.5 h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900/40"
              title="Clear all tags"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* 2-Column Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* ─── CARD 1: GUEST TAGS (BLUE THEME) ───────────────────────────── */}
        <Card className="overflow-hidden border border-[var(--border)] bg-[var(--card)] shadow-xs">
          {/* Card Header */}
          <CardHeader className="p-4 sm:p-5 border-b border-[var(--border)] bg-[var(--muted)]/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-[var(--foreground)] tracking-tight">
                  Guest Tags
                </CardTitle>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Persistent labels (e.g. VIP)
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 space-y-4">
            {/* Add Input Bar */}
            <div className="flex items-center gap-2">
              <Input
                placeholder="E.g. VIP"
                value={newGuestTagInput}
                onChange={e => setNewGuestTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddGuestTag();
                  }
                }}
                className="flex-1 text-xs h-9 bg-[var(--background)] border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl"
              />
              <Button
                type="button"
                onClick={handleAddGuestTag}
                disabled={!newGuestTagInput.trim()}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 shrink-0 shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                Add
              </Button>
            </div>

            {/* Tags Pills Container */}
            <div className="bg-[var(--muted)]/30 border border-[var(--border)] rounded-xl p-3.5 min-h-[160px] flex flex-wrap gap-2 content-start">
              {guestTagList.length === 0 ? (
                <div className="w-full text-center py-12 text-xs text-[var(--muted-foreground)]">
                  No guest tags added yet. Type a label above and click Add.
                </div>
              ) : (
                guestTagList.map(tag => (
                  <div
                    key={tag}
                    className="bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 rounded-full px-3 py-1 text-xs font-bold tracking-wide flex items-center gap-2 transition-all shadow-xs"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveGuestTag(tag)}
                      className="text-blue-400 hover:text-blue-700 dark:hover:text-white transition-colors p-0.5 -mr-0.5"
                      title={`Remove ${tag}`}
                    >
                      <X className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* ─── CARD 2: RESERVATION TAGS (EMERALD THEME) ────────────────── */}
        <Card className="overflow-hidden border border-[var(--border)] bg-[var(--card)] shadow-xs">
          {/* Card Header */}
          <CardHeader className="p-4 sm:p-5 border-b border-[var(--border)] bg-[var(--muted)]/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-[var(--foreground)] tracking-tight">
                  Reservation Tags
                </CardTitle>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Visit specific (e.g. BIRTHDAY)
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 space-y-4">
            {/* Add Input Bar */}
            <div className="flex items-center gap-2">
              <Input
                placeholder="E.g. BIRTHDAY"
                value={newReservationTagInput}
                onChange={e => setNewReservationTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddReservationTag();
                  }
                }}
                className="flex-1 text-xs h-9 bg-[var(--background)] border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl"
              />
              <Button
                type="button"
                onClick={handleAddReservationTag}
                disabled={!newReservationTagInput.trim()}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 shrink-0 shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                Add
              </Button>
            </div>

            {/* Tags Pills Container */}
            <div className="bg-[var(--muted)]/30 border border-[var(--border)] rounded-xl p-3.5 min-h-[160px] flex flex-wrap gap-2 content-start">
              {reservationTagList.length === 0 ? (
                <div className="w-full text-center py-12 text-xs text-[var(--muted-foreground)]">
                  No reservation tags added yet. Type a label above and click Add.
                </div>
              ) : (
                reservationTagList.map(tag => (
                  <div
                    key={tag}
                    className="bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 rounded-full px-3 py-1 text-xs font-bold tracking-wide flex items-center gap-2 transition-all shadow-xs"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveReservationTag(tag)}
                      className="text-emerald-400 hover:text-emerald-700 dark:hover:text-white transition-colors p-0.5 -mr-0.5"
                      title={`Remove ${tag}`}
                    >
                      <X className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SpecialRequestsAndTagsTab;
