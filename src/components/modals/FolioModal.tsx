import React, { useState } from 'react';
import { Printer, CheckCircle2, Building2 } from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import { useHotel } from '../../context/HotelContext';
import { Dialog, DialogContent, DialogTitle } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatCurrency, cn } from '../../lib/utils';

export const FolioModal: React.FC = () => {
  const { isFolioOpen, closeFolio, activeFolioReservation } = useModal();
  const { checkOutGuest, updatePayment } = useHotel();
  const [settling, setSettling] = useState(false);
  // Inline success state — avoids alert() which exits browser fullscreen
  const [settled, setSettled] = useState(false);

  if (!activeFolioReservation) return null;

  const balance = activeFolioReservation.totalAmount - activeFolioReservation.paidAmount;

  const handleSettleAndCheckOut = () => {
    setSettling(true);
    setTimeout(() => {
      if (balance > 0) {
        updatePayment(activeFolioReservation.id, balance);
      }
      checkOutGuest(activeFolioReservation.id);
      setSettling(false);
      // Show inline success banner instead of alert() — alert() exits fullscreen
      setSettled(true);
      setTimeout(() => {
        setSettled(false);
        closeFolio();
      }, 1500);
    }, 500);
  };

  // Use browser print API but exit fullscreen first if active to avoid conflicts
  const handlePrint = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().then(() => {
        setTimeout(() => window.print(), 200);
      }).catch(() => window.print());
    } else {
      window.print();
    }
  };

  return (
    <Dialog open={isFolioOpen} onOpenChange={(open) => !open && closeFolio()}>
      <DialogContent className="max-w-2xl bg-[var(--card)] text-[var(--card-foreground)] border-[var(--border)] p-0 overflow-hidden shadow-2xl">
        <div className="p-6 bg-[var(--muted)] border-b border-[var(--border)] flex justify-between items-center">
          <div>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[var(--primary)]" /> Guest Folio Invoice
            </DialogTitle>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              Invoice Prefix: INV-2026-{activeFolioReservation.id}
            </p>
          </div>
          <Badge variant={balance === 0 ? 'clean' : 'dirty'} className="text-xs px-3 py-1 font-bold">
            {balance === 0 ? 'PAID IN FULL' : `BALANCE DUE: ${formatCurrency(balance)}`}
          </Badge>
        </div>

        {/* PRINTABLE BILL BODY */}
        <div className="p-8 space-y-6 text-left max-h-[60vh] overflow-y-auto">
          {/* Inline success banner — no alert() needed, works in fullscreen */}
          {settled && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Folio Settled & Checked-Out! Room {activeFolioReservation.roomNumber} marked DIRTY. Closing...</span>
            </div>
          )}
          {/* Header metadata */}
          <div className="flex justify-between items-start border-b border-[var(--border)] pb-4 text-xs">
            <div>
              <p className="font-bold text-sm text-[var(--foreground)]">DeskFlow — Grand Azure Suites & Resort</p>
              <p className="text-[var(--muted-foreground)]">GSTIN: 29AAAAA0000A1Z5</p>
              <p className="text-[var(--muted-foreground)]">Beach Road, Ocean Wing, Goa - 403001</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-xs">Guest Details:</p>
              <div className="flex flex-col items-end gap-1">
                <p className="font-semibold text-sm text-[var(--primary)]">{activeFolioReservation.guestName}</p>
                {activeFolioReservation.tags && activeFolioReservation.tags.length > 0 && (
                  <div className="flex gap-1 justify-end flex-wrap mt-0.5">
                    {activeFolioReservation.tags.map(tag => (
                      <span key={tag} className={cn(
                        "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border",
                        tag.toLowerCase() === 'vip' ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" :
                        tag.toLowerCase() === 'returning' ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30" :
                        tag.toLowerCase() === 'late check-out' ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30" :
                        tag.toLowerCase() === 'allergic' ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30" :
                        "bg-[var(--muted)] text-[var(--foreground)] border-[var(--border)]"
                      )}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-[var(--muted-foreground)] mt-1">{activeFolioReservation.phone}</p>
              <p className="text-[var(--muted-foreground)]">{activeFolioReservation.email}</p>
            </div>
          </div>

          {/* Stay Info */}
          <div className="grid grid-cols-4 gap-4 p-4 rounded-lg bg-[var(--background)] border border-[var(--border)] text-xs">
            <div>
              <p className="text-[var(--muted-foreground)]">Room Number</p>
              <p className="font-bold text-sm text-[var(--primary)]">{activeFolioReservation.roomNumber}</p>
            </div>
            <div>
              <p className="text-[var(--muted-foreground)]">Room Category</p>
              <p className="font-bold">{activeFolioReservation.roomType}</p>
            </div>
            <div>
              <p className="text-[var(--muted-foreground)]">Check-in</p>
              <p className="font-bold">{activeFolioReservation.checkIn}</p>
            </div>
            <div>
              <p className="text-[var(--muted-foreground)]">Check-out</p>
              <p className="font-bold">{activeFolioReservation.checkOut}</p>
            </div>
          </div>

          {/* Itemized Table */}
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] uppercase">
                <th className="py-2">Description</th>
                <th className="py-2 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              <tr>
                <td className="py-3">
                  <p className="font-bold">{activeFolioReservation.roomType} Accommodation Charges</p>
                  <p className="text-[10px] text-[var(--muted-foreground)]">Rate per night + GST (12%)</p>
                </td>
                <td className="py-3 text-right font-semibold">
                  {formatCurrency(activeFolioReservation.totalAmount)}
                </td>
              </tr>
              <tr>
                <td className="py-3 text-emerald-600 dark:text-emerald-400 font-semibold">
                  Advance Payment Received ({activeFolioReservation.source})
                </td>
                <td className="py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                  - {formatCurrency(activeFolioReservation.paidAmount)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Totals */}
          <div className="p-4 rounded-xl bg-[var(--muted)] border border-[var(--border)] space-y-1.5 text-xs text-right">
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Total Charges:</span>
              <span className="font-bold">{formatCurrency(activeFolioReservation.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Total Paid:</span>
              <span className="font-bold text-emerald-600">{formatCurrency(activeFolioReservation.paidAmount)}</span>
            </div>
            <div className="pt-2 border-t border-[var(--border)] flex justify-between text-base font-extrabold text-[var(--foreground)]">
              <span>Outstanding Balance:</span>
              <span className={balance > 0 ? 'text-amber-500' : 'text-emerald-500'}>
                {formatCurrency(balance)}
              </span>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 bg-[var(--muted)] border-t border-[var(--border)] flex justify-between items-center">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
            <Printer className="w-4 h-4" /> Print Guest Invoice
          </Button>

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={closeFolio} disabled={settling || settled}>
              Close
            </Button>
            {activeFolioReservation.status !== 'CHECKED_OUT' && (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 shadow-md"
                onClick={handleSettleAndCheckOut}
                disabled={settling || settled}
              >
                <CheckCircle2 className="w-4 h-4" />
                {settling ? 'Processing...' : settled ? 'Done!' : balance > 0 ? `Settle ${formatCurrency(balance)} & Check-Out` : '1-Click Check-Out'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
