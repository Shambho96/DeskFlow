import React, { useState, useEffect } from 'react';
import { Award, Plus, Trash2, Save, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useLoyaltySettings } from '../../hooks/useLoyaltySettings';
import type { LoyaltyTierInput } from '../../types/crm';
import { formatCurrency } from '../../lib/utils';

const BADGE_COLOR_OPTIONS = [
  { value: 'slate', label: 'Slate / Bronze', bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300' },
  { value: 'blue', label: 'Blue / Silver', bg: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-300' },
  { value: 'amber', label: 'Amber / Gold', bg: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-300' },
  { value: 'primary', label: 'Violet / Platinum', bg: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-300' },
  { value: 'emerald', label: 'Emerald / Diamond', bg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-300' },
];

export const LoyaltyTiersTab: React.FC = () => {
  const { tiers, isLoading, isSaving, error, saveTiers } = useLoyaltySettings();

  const [formTiers, setFormTiers] = useState<LoyaltyTierInput[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (tiers && tiers.length > 0) {
      setFormTiers(
        tiers.map(t => ({
          tierCode: t.tierCode,
          name: t.name,
          minSpend: t.minSpend,
          minStays: t.minStays,
          discountPercent: t.discountPercent,
          badgeColor: t.badgeColor,
          perks: t.perks || [],
          displayOrder: t.displayOrder,
          isActive: t.isActive,
        }))
      );
    }
  }, [tiers]);

  const handleFieldChange = (index: number, field: keyof LoyaltyTierInput, val: any) => {
    const updated = [...formTiers];
    updated[index] = { ...updated[index], [field]: val };
    setFormTiers(updated);
    setSuccessMsg(null);
  };

  const handlePerksChange = (index: number, perksString: string) => {
    const perksList = perksString
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);
    handleFieldChange(index, 'perks', perksList);
  };

  const handleAddTier = () => {
    const nextOrder = formTiers.length + 1;
    const newTier: LoyaltyTierInput = {
      tierCode: `TIER_${nextOrder}`,
      name: `VIP Tier ${nextOrder}`,
      minSpend: 50000 + nextOrder * 25000,
      minStays: nextOrder * 3,
      discountPercent: 10.0,
      badgeColor: 'primary',
      perks: ['Priority Check-in', 'Complimentary Welcome Drink'],
      displayOrder: nextOrder,
      isActive: true,
    };
    setFormTiers([...formTiers, newTier]);
    setSuccessMsg(null);
  };

  const handleDeleteTier = (index: number) => {
    if (formTiers.length <= 1) {
      alert('You must have at least one loyalty tier configured.');
      return;
    }
    const updated = formTiers.filter((_, i) => i !== index);
    setFormTiers(updated);
    setSuccessMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSuccessMsg(null);

    // Validation: min_spend should not be negative
    for (const t of formTiers) {
      if (!t.name.trim()) {
        setValidationError('All tiers must have a name.');
        return;
      }
      if (Number(t.minSpend) < 0) {
        setValidationError(`Minimum spend for ${t.name} cannot be negative.`);
        return;
      }
    }

    // Sort by minSpend ascending
    const sorted = [...formTiers].sort((a, b) => Number(a.minSpend) - Number(b.minSpend));
    sorted.forEach((t, i) => {
      t.displayOrder = i + 1;
    });

    try {
      await saveTiers(sorted);
      setSuccessMsg('✅ VIP Loyalty Tiers updated successfully! The guest CRM and front desk will now use these thresholds.');
      setTimeout(() => setSuccessMsg(null), 6000);
    } catch (err: any) {
      // handled by hook
    }
  };

  if (isLoading && formTiers.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-sm text-[var(--muted-foreground)]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-[var(--primary)]" />
          Loading loyalty tier configurations...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="p-5 border-b border-[var(--border)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Award className="w-5 h-5 text-[var(--primary)]" />
                Guest Loyalty Tiers & Spend Thresholds
              </CardTitle>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Configure your hotel's VIP tiers. Guests are automatically categorized based on their lifetime spend at this outlet.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddTier}
              className="font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Tier
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {successMsg && (
            <div className="mb-6 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {(error || validationError) && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-200 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error || validationError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {formTiers.map((tier, idx) => {
                const colorConfig = BADGE_COLOR_OPTIONS.find(c => c.value === tier.badgeColor) || BADGE_COLOR_OPTIONS[0];

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/40 transition-colors space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[var(--muted)] text-[var(--foreground)] font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${colorConfig.bg}`}>
                          {tier.name || 'Unnamed Tier'}
                        </span>
                        <span className="text-[11px] text-[var(--muted-foreground)]">
                          Min Spend: <strong className="text-[var(--foreground)]">{formatCurrency(Number(tier.minSpend) || 0)}</strong>
                        </span>
                      </div>

                      {formTiers.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTier(idx)}
                          className="h-7 w-7 p-0 text-[var(--muted-foreground)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                          title="Delete Tier"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold text-[var(--muted-foreground)] mb-1">
                          Tier Display Name
                        </label>
                        <Input
                          value={tier.name}
                          onChange={e => handleFieldChange(idx, 'name', e.target.value)}
                          placeholder="e.g. Gold VIP"
                          className="h-8 text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-[var(--muted-foreground)] mb-1">
                          Min Lifetime Spend (₹)
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="1000"
                          value={tier.minSpend}
                          onChange={e => handleFieldChange(idx, 'minSpend', parseFloat(e.target.value) || 0)}
                          placeholder="e.g. 25000"
                          className="h-8 text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-[var(--muted-foreground)] mb-1">
                          Min Stays (Optional)
                        </label>
                        <Input
                          type="number"
                          min="0"
                          value={tier.minStays || 0}
                          onChange={e => handleFieldChange(idx, 'minStays', parseInt(e.target.value, 10) || 0)}
                          placeholder="e.g. 5"
                          className="h-8 text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-[var(--muted-foreground)] mb-1">
                          Badge Color Theme
                        </label>
                        <select
                          value={tier.badgeColor || 'primary'}
                          onChange={e => handleFieldChange(idx, 'badgeColor', e.target.value)}
                          className="w-full h-9 px-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-semibold text-[var(--foreground)] shadow-xs focus:outline-none focus:border-[var(--primary)] cursor-pointer"
                        >
                          {BADGE_COLOR_OPTIONS.map(c => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="text-xs">
                      <label className="block font-semibold text-[var(--muted-foreground)] mb-1">
                        Perks & Privileges (Comma-separated)
                      </label>
                      <Input
                        value={(tier.perks || []).join(', ')}
                        onChange={e => handlePerksChange(idx, e.target.value)}
                        placeholder="e.g. 10% F&B Discount, Late Check-out, Complimentary Breakfast"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-[var(--primary)] text-white font-bold h-9 px-6 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving Tiers...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" /> Save Loyalty Settings
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
