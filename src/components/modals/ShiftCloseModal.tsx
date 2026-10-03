import React, { useState } from 'react';
import { DollarSign, CreditCard, QrCode, Lock, Printer, CheckCircle2 } from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import { useHotel } from '../../context/HotelContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { formatCurrency } from '../../lib/utils';

export const ShiftCloseModal: React.FC = () => {
  const { isShiftCloseOpen, closeShiftClose } = useModal();
  const { cashRegister } = useHotel();

  const [discrepancy, setDiscrepancy] = useState<number>(0);
  const [closingNotes, setClosingNotes] = useState('');
  // Inline success state — avoids alert() which exits browser fullscreen
  const [closed, setClosed] = useState(false);

  const totalDrawerCash = cashRegister.startingFloat + cashRegister.cashCollected;

  const handleCloseShift = () => {
    // Show inline success then close — avoids alert() which exits fullscreen
    setClosed(true);
    setTimeout(() => {
      setClosed(false);
      closeShiftClose();
    }, 1800);
  };

  return (
    <Dialog open={isShiftCloseOpen} onOpenChange={(open) => !open && closeShiftClose()}>
      <DialogContent className="max-w-md bg-[var(--card)] text-[var(--card-foreground)] border-[var(--border)] p-0 overflow-hidden shadow-2xl">
        <div className="p-5 bg-[var(--muted)] border-b border-[var(--border)]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Lock className="w-5 h-5 text-[var(--primary)]" /> Close Shift Register & Audit
            </DialogTitle>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              Receptionist: <span className="font-bold text-[var(--foreground)]">{cashRegister.activeReceptionist}</span>
            </p>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-4 text-left text-xs">
          {/* Breakdown Box */}
          <div className="p-4 rounded-xl bg-[var(--background)] border border-[var(--border)] space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-[var(--muted-foreground)]">Starting Opening Float:</span>
              <span className="font-mono font-bold">{formatCurrency(cashRegister.startingFloat)}</span>
            </div>
            <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
              <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Cash Collected:</span>
              <span className="font-mono font-bold">+ {formatCurrency(cashRegister.cashCollected)}</span>
            </div>
            <div className="flex justify-between items-center text-blue-600 dark:text-blue-400">
              <span className="flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" /> Card Terminals:</span>
              <span className="font-mono font-bold">{formatCurrency(cashRegister.cardSettled)}</span>
            </div>
            <div className="flex justify-between items-center text-purple-600 dark:text-purple-400">
              <span className="flex items-center gap-1"><QrCode className="w-3.5 h-3.5" /> UPI QR Receipts:</span>
              <span className="font-mono font-bold">{formatCurrency(cashRegister.upiCollected)}</span>
            </div>

            <div className="pt-2 border-t border-[var(--border)] flex justify-between items-center text-sm font-extrabold text-[var(--foreground)]">
              <span>Expected Cash in Drawer:</span>
              <span className="text-[var(--primary)] font-mono">{formatCurrency(totalDrawerCash)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">
              Actual Cash Counted Discrepancy (₹)
            </label>
            <Input
              type="number"
              placeholder="0 (Match)"
              value={discrepancy}
              onChange={e => setDiscrepancy(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">
              Handover Note for Night Auditor
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Room 201 guest arriving late..."
              value={closingNotes}
              onChange={e => setClosingNotes(e.target.value)}
              className="w-full p-2.5 rounded-md border border-[var(--input)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
            />
          </div>
        </div>

        <div className="p-4 bg-[var(--muted)] border-t border-[var(--border)] flex justify-between items-center gap-3">
          {/* Inline success banner — no alert() */}
          {closed ? (
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Shift Closed for {cashRegister.activeReceptionist}! Closing...
            </div>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (document.fullscreenElement) {
                    document.exitFullscreen().then(() => setTimeout(() => window.print(), 200)).catch(() => window.print());
                  } else {
                    window.print();
                  }
                }}
                className="gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print Audit
              </Button>

              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={closeShiftClose}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold gap-1.5 shadow-md"
                  onClick={handleCloseShift}
                >
                  <CheckCircle2 className="w-4 h-4" /> Lock & Close Shift
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
