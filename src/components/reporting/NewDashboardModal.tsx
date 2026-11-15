import React, { useState } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import type { DashboardVisibility } from '../../types/reporting';

interface NewDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string, visibility: DashboardVisibility) => Promise<void>;
}

export const NewDashboardModal: React.FC<NewDashboardModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<DashboardVisibility>('PRIVATE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter a dashboard name.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await onCreate(name.trim(), description.trim(), visibility);
      setName('');
      setDescription('');
      setVisibility('PRIVATE');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create dashboard.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl w-full max-w-md shadow-xl text-[var(--card-foreground)] transform-gpu">
        <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-[var(--foreground)]">Create New Dashboard Board</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-lg hover:bg-[var(--muted)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 p-3 rounded-xl">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block font-semibold text-[var(--foreground)] uppercase tracking-wider text-[11px]">
              Dashboard Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. F&amp;B and Room Revenue Yield"
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-semibold text-[var(--foreground)] uppercase tracking-wider text-[11px]">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What this dashboard focuses on..."
              rows={2}
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3.5 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-semibold text-[var(--foreground)] uppercase tracking-wider text-[11px]">
              Initial Visibility
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setVisibility('PRIVATE')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  visibility === 'PRIVATE'
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)] shadow-xs'
                    : 'bg-[var(--background)] border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/50'
                }`}
              >
                Private (Only Me)
              </button>
              <button
                type="button"
                onClick={() => setVisibility('OUTLET_SHARED')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  visibility === 'OUTLET_SHARED'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-[var(--background)] border-[var(--border)] text-[var(--muted-foreground)] hover:border-emerald-500/50'
                }`}
              >
                Share with Outlet
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--border)] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[var(--primary)] text-white shadow-md hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating...' : 'Create Dashboard'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
