import React from 'react';
import { cn, formatCurrency } from '../../../lib/utils';
import { Input } from '../../ui/Input';
import type { BookingSource, PaymentMethod } from '../../../types/operations';

interface Step3BillingSettleProps {
  categoryName?: string;
  nights: number;
  selectedRoomNumber: string;
  bookingSource: BookingSource;
  purposeOfVisit: string;
  city: string;
  stateRegion: string;
  nightlyRate: number;
  subtotal: number;
  gstTax: number;
  grandTotal: number;
  specialRequests: string[];
  paymentMethod: PaymentMethod;
  setPaymentMethod: (pm: PaymentMethod) => void;
  paidDeposit: number;
  setPaidDeposit: (val: number) => void;
}

export const Step3BillingSettle: React.FC<Step3BillingSettleProps> = ({
  categoryName,
  nights,
  selectedRoomNumber,
  bookingSource,
  purposeOfVisit,
  city,
  stateRegion,
  nightlyRate,
  subtotal,
  gstTax,
  grandTotal,
  specialRequests,
  paymentMethod,
  setPaymentMethod,
  paidDeposit,
  setPaidDeposit,
}) => {
  return (
    <div className="space-y-4 text-left">
      {/* Financial Summary */}
      <div className="p-4 rounded-2xl bg-[var(--muted)]/60 border border-[var(--border)] space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-[var(--muted-foreground)]">Category & Duration:</span>
          <span className="font-bold">{categoryName || 'Standard'} ({nights} Nights)</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--muted-foreground)]">Assigned Room:</span>
          <span className="font-bold text-[var(--primary)]">Room {selectedRoomNumber || 'Auto-assign'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--muted-foreground)]">Direct Source:</span>
          <span className="font-semibold">{bookingSource}</span>
        </div>
        {(purposeOfVisit || city || stateRegion) && (
          <div className="flex justify-between">
            <span className="text-[var(--muted-foreground)]">Trip &amp; Origin:</span>
            <span className="font-semibold text-right">
              {purposeOfVisit}
              {city ? ` • ${city}` : ''}
              {stateRegion ? `, ${stateRegion}` : ''}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-[var(--muted-foreground)]">Subtotal ({nights} × {formatCurrency(nightlyRate)}):</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--muted-foreground)]">GST ({nightlyRate >= 7500 ? '18%' : '12%'}):</span>
          <span>{formatCurrency(gstTax)}</span>
        </div>
        {specialRequests.length > 0 && (
          <div className="pt-2 border-t border-[var(--border)]">
            <span className="text-[11px] text-[var(--muted-foreground)] block mb-1 font-medium">Selected Requests & Tags:</span>
            <div className="flex flex-wrap gap-1">
              {specialRequests.map(r => (
                <span key={r} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
                  {r}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="pt-2 border-t border-[var(--border)] flex justify-between text-base font-black">
          <span>Grand Total:</span>
          <span className="text-[var(--primary)]">{formatCurrency(grandTotal)}</span>
        </div>
      </div>

      {/* Payment Method Selector */}
      <div>
        <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-2">
          Payment Method
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'CASH', label: 'Cash Drawer' },
            { id: 'CREDIT_CARD', label: 'Card / POS' },
            { id: 'UPI_QR', label: 'UPI QR' },
            { id: 'BANK_TRANSFER', label: 'Direct Transfer' }
          ].map(pm => (
            <button
              key={pm.id}
              type="button"
              onClick={() => setPaymentMethod(pm.id as any)}
              className={cn(
                'p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer',
                paymentMethod === pm.id
                  ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs'
                  : 'bg-[var(--card)] border-[var(--border)] hover:bg-[var(--muted)]'
              )}
            >
              {pm.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">
          Advance / Deposit Paid Now (₹)
        </label>
        <Input
          type="number"
          min={0}
          max={grandTotal}
          value={paidDeposit}
          onChange={e => setPaidDeposit(Number(e.target.value))}
        />
      </div>
    </div>
  );
};
