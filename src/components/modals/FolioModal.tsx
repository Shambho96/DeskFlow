import React, { useState, useEffect } from 'react';
import {
  Building2,
  CheckCircle2,
  Printer,
  AlertCircle
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { useModal } from '../../context/ModalContext';
import { useOperations } from '../../hooks/useOperations';
import { cn, formatCurrency } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Dialog, DialogContent, DialogTitle } from '../ui/Dialog';
import { PhoneNumberDisplay } from '../ui/PhoneNumberDisplay';
import type { GuestFolioRecord } from '../../types/operations';

export const FolioModal: React.FC = () => {
  const { isFolioOpen, closeFolio, activeFolioReservation } = useModal();
  const { checkOutGuest: legacyCheckOut, updatePayment } = useHotel();

  const [todayStr] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const { fetchGuestFolio, settleFolioPayment, checkOutGuest: backendCheckOut } = useOperations(todayStr);

  const [liveFolio, setLiveFolio] = useState<GuestFolioRecord | null>(null);
  const [settling, setSettling] = useState(false);
  const [settled, setSettled] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch live folio whenever activeFolioReservation changes
  useEffect(() => {
    if (!activeFolioReservation || !isFolioOpen) {
      setLiveFolio(null);
      return;
    }

    const numericId = Number(activeFolioReservation.id);
    if (numericId && !isNaN(numericId)) {
      fetchGuestFolio(numericId)
        .then(folio => setLiveFolio(folio))
        .catch(err => {
          console.warn('Could not fetch live folio, falling back to active reservation state:', err);
        });
    }
  }, [activeFolioReservation, isFolioOpen]);

  if (!activeFolioReservation) return null;

  // Extract fields seamlessly from either liveFolio, ReservationRecord, or legacy Reservation
  const reservationId = activeFolioReservation.id;
  const guestName = activeFolioReservation.guest?.fullName || activeFolioReservation.guestName || 'Guest';
  const guestPhone = activeFolioReservation.guest?.phone || activeFolioReservation.phone || '';
  const guestEmail = activeFolioReservation.guest?.email || activeFolioReservation.email || '';
  const roomNumber = activeFolioReservation.roomNumber || '—';
  const roomCategory = activeFolioReservation.categoryName || activeFolioReservation.roomType || 'Standard';
  const checkInDate = activeFolioReservation.checkInDate || activeFolioReservation.checkIn || '';
  const checkOutDate = activeFolioReservation.checkOutDate || activeFolioReservation.checkOut || '';
  const bookingSource = activeFolioReservation.bookingSource || activeFolioReservation.source || 'Direct';

  const totalAmount = liveFolio ? liveFolio.grandTotal : (activeFolioReservation.grandTotal || activeFolioReservation.totalAmount || 0);
  const paidAmount = liveFolio ? liveFolio.paidAmount : (activeFolioReservation.paidAmount || 0);
  const balance = Math.max(0, totalAmount - paidAmount);

  // Handle Settle & Check-Out
  const handleSettleAndCheckOut = async () => {
    setSettling(true);
    setErrorMessage(null);

    try {
      const numericId = Number(reservationId);

      // 1. If balance due and folio exists, settle payment with UUID idempotency key
      if (balance > 0 && liveFolio?.id) {
        const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `pay-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

        await settleFolioPayment({
          folioId: liveFolio.id,
          amount: balance,
          paymentMethod: 'CASH',
          idempotencyKey
        });
      }

      // 2. Perform backend Check-Out
      if (numericId && !isNaN(numericId)) {
        await backendCheckOut(numericId);
      }

      // 3. Sync legacy context
      if (balance > 0) {
        updatePayment(String(reservationId), balance);
      }
      legacyCheckOut(String(reservationId));

      setSettled(true);
      setTimeout(() => {
        setSettled(false);
        closeFolio();
      }, 1500);
    } catch (err: any) {
      console.error('Folio settlement failed:', err);
      setErrorMessage(err.message || 'Payment settlement failed. Please try again.');
    } finally {
      setSettling(false);
    }
  };

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
    <Dialog open={isFolioOpen} onOpenChange={open => !open && closeFolio()}>
      <DialogContent className="max-w-2xl bg-[var(--card)] text-[var(--card-foreground)] border-[var(--border)] p-0 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 bg-[var(--muted)]/70 border-b border-[var(--border)] flex justify-between items-center">
          <div>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[var(--primary)]" />
              Guest Folio & Billing Invoice
            </DialogTitle>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              Folio Reference: {liveFolio?.folioNumber || `FOLIO-${reservationId}`}
            </p>
          </div>
          <Badge
            variant={balance === 0 ? 'clean' : 'dirty'}
            className={cn(
              'text-xs px-3 py-1 font-bold rounded-xl border',
              balance === 0
                ? 'bg-[var(--primary)]/15 text-[var(--primary)] border-[var(--primary)]/30'
                : 'bg-[var(--destructive)]/15 text-[var(--destructive)] border-[var(--destructive)]/30'
            )}
          >
            {balance === 0 ? 'PAID IN FULL' : `BALANCE DUE: ${formatCurrency(balance)}`}
          </Badge>
        </div>

        {/* Error notification banner */}
        {errorMessage && (
          <div className="m-4 mb-0 p-3 rounded-xl bg-[var(--destructive)]/15 border border-[var(--destructive)]/30 text-[var(--destructive)] text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Printable Bill Content */}
        <div className="p-6 space-y-5 text-left max-h-[60vh] overflow-y-auto">
          {settled && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--primary)]/15 border border-[var(--primary)]/30 text-[var(--primary)] font-semibold text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Folio Settled & Checked-Out! Room {roomNumber} marked DIRTY for housekeeping.</span>
            </div>
          )}

          {/* Hotel Metadata & Guest Details */}
          <div className="flex justify-between items-start border-b border-[var(--border)] pb-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div>
                <p className="font-bold text-sm text-[var(--foreground)]">DeskFlow Grand Azure Resort</p>
                <p className="text-[var(--muted-foreground)]">GSTIN: 29AAAAA0000A1Z5</p>
                <p className="text-[var(--muted-foreground)]">Direct Channel: {bookingSource}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="font-bold text-xs text-[var(--muted-foreground)] uppercase">Guest Details:</p>
              <p className="font-bold text-sm text-[var(--primary)] mt-0.5">{guestName}</p>
              {guestPhone && (
                <p className="text-[var(--muted-foreground)] mt-0.5">
                  <PhoneNumberDisplay value={guestPhone} />
                </p>
              )}
              {guestEmail && <p className="text-[var(--muted-foreground)]">{guestEmail}</p>}
            </div>
          </div>

          {/* Stay Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-[var(--muted)]/40 border border-[var(--border)] text-xs">
            <div>
              <p className="text-[var(--muted-foreground)]">Room Number</p>
              <p className="font-black text-sm text-[var(--primary)]">Room {roomNumber}</p>
            </div>
            <div>
              <p className="text-[var(--muted-foreground)]">Room Category</p>
              <p className="font-bold">{roomCategory}</p>
            </div>
            <div>
              <p className="text-[var(--muted-foreground)]">Check-in</p>
              <p className="font-bold">{checkInDate}</p>
            </div>
            <div>
              <p className="text-[var(--muted-foreground)]">Check-out</p>
              <p className="font-bold">{checkOutDate}</p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Itemized Folio Charges</p>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] uppercase">
                  <th className="py-2">Description</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Tax</th>
                  <th className="py-2 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {liveFolio && liveFolio.lineItems.length > 0 ? (
                  liveFolio.lineItems.map(item => (
                    <tr key={item.id}>
                      <td className="py-2.5">
                        <p className="font-semibold text-[var(--foreground)]">{item.description}</p>
                        <p className="text-[10px] text-[var(--muted-foreground)]">{item.chargeCategory}</p>
                      </td>
                      <td className="py-2.5 text-center">{item.quantity}</td>
                      <td className="py-2.5 text-right text-[var(--muted-foreground)]">
                        {formatCurrency(item.taxAmount)} ({item.taxRate}%)
                      </td>
                      <td className="py-2.5 text-right font-bold text-[var(--foreground)]">
                        {formatCurrency(item.totalAmount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-2.5">
                      <p className="font-semibold">{roomCategory} Room Accommodation</p>
                      <p className="text-[10px] text-[var(--muted-foreground)]">Room charges + GST</p>
                    </td>
                    <td className="py-2.5 text-center">1</td>
                    <td className="py-2.5 text-right text-[var(--muted-foreground)]">12% GST</td>
                    <td className="py-2.5 text-right font-bold">
                      {formatCurrency(totalAmount)}
                    </td>
                  </tr>
                )}

                {/* Paid deposits row */}
                {paidAmount > 0 && (
                  <tr>
                    <td colSpan={3} className="py-2.5 font-semibold text-[var(--primary)]">
                      Advance Deposit / Payment Received ({bookingSource})
                    </td>
                    <td className="py-2.5 text-right font-bold text-[var(--primary)]">
                      - {formatCurrency(paidAmount)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="p-4 rounded-xl bg-[var(--muted)]/60 border border-[var(--border)] space-y-1.5 text-xs text-right">
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Total Folio Charges:</span>
              <span className="font-bold">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Total Settled:</span>
              <span className="font-bold text-[var(--primary)]">{formatCurrency(paidAmount)}</span>
            </div>
            <div className="pt-2 border-t border-[var(--border)] flex justify-between text-base font-black text-[var(--foreground)]">
              <span>Outstanding Balance Due:</span>
              <span className={balance > 0 ? 'text-[var(--destructive)]' : 'text-[var(--primary)]'}>
                {formatCurrency(balance)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[var(--muted)]/70 border-t border-[var(--border)] flex justify-between items-center">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 rounded-xl">
            <Printer className="w-4 h-4" /> Print Invoice
          </Button>

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={closeFolio} disabled={settling || settled}>
              Close
            </Button>
            {activeFolioReservation.status !== 'CHECKED_OUT' && (
              <Button
                size="sm"
                className="bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] font-bold gap-1.5 rounded-xl shadow-md"
                onClick={handleSettleAndCheckOut}
                disabled={settling || settled}
              >
                <CheckCircle2 className="w-4 h-4" />
                {settling ? 'Processing...' : settled ? 'Settled!' : balance > 0 ? `Settle ${formatCurrency(balance)} & Check-Out` : '1-Click Check-Out'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
