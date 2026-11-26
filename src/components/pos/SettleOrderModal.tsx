import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Banknote,
  QrCode,
  Building2,
  CheckCircle2,
  Receipt,
  UserCheck,
} from 'lucide-react';
import type { PosOrder, PaymentMethod } from '../../types/pos';

interface SettleOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: PosOrder | null;
  onSettle: (orderId: number, method: PaymentMethod, tableNumber?: string) => void;
  onShowReceipt: (order: PosOrder) => void;
}

interface SettleOrderModalContentProps {
  onClose: () => void;
  order: PosOrder;
  onSettle: (orderId: number, method: PaymentMethod, tableNumber?: string) => void;
  onShowReceipt: (order: PosOrder) => void;
}

const SettleOrderModalContent: React.FC<SettleOrderModalContentProps> = ({
  onClose,
  order,
  onSettle,
  onShowReceipt,
}) => {
  const initialMethod: PaymentMethod =
    order.channel === 'ROOM_SERVICE' || order.roomNumber ? 'ROOM_FOLIO' : 'UPI';

  const [method, setMethod] = useState<PaymentMethod>(initialMethod);
  const [cashTendered, setCashTendered] = useState<string>(String(Math.ceil(order.grandTotal / 100) * 100));
  const [isSuccess, setIsSuccess] = useState(false);

  const tenderedNum = parseFloat(cashTendered) || 0;
  const changeDue = Math.max(0, tenderedNum - order.grandTotal);

  const handleConfirmPayment = () => {
    onSettle(order.id, method, order.tableNumber);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      onShowReceipt({
        ...order,
        status: 'BILLED',
        paymentStatus: method === 'ROOM_FOLIO' ? 'POSTED_TO_ROOM' : 'PAID',
        paymentMethod: method,
      });
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--muted)]/40">
          <div>
            <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[var(--primary)]" />
              Settle Order &bull; #{order.orderNumber}
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              {order.tableNumber ? `Table ${order.tableNumber}` : `Room Service ${order.roomNumber}`}
              {order.guestName ? ` &bull; ${order.guestName}` : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-[var(--foreground)]">Settlement Confirmed!</h4>
            <p className="text-xs text-[var(--muted-foreground)]">
              {method === 'ROOM_FOLIO'
                ? `₹${order.grandTotal.toFixed(2)} charged to Room ${order.roomNumber} folio.`
                : `Payment of ₹${order.grandTotal.toFixed(2)} recorded via ${method}.`}
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Grand Total Banner */}
            <div className="p-4 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[var(--muted-foreground)] block uppercase tracking-wider">
                  Amount Due
                </span>
                <span className="text-2xl font-black text-[var(--foreground)] tracking-tight">
                  ₹{order.grandTotal.toFixed(2)}
                </span>
              </div>
              <div className="text-right text-[11px] text-[var(--muted-foreground)] space-y-0.5">
                <p>Subtotal: ₹{order.subtotal.toFixed(2)}</p>
                <p>Tax (5% GST): ₹{order.taxAmount.toFixed(2)}</p>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider text-[11px]">
                Select Settlement Mode
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* 1. Post to Room Folio */}
                <button
                  type="button"
                  onClick={() => setMethod('ROOM_FOLIO')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer ${
                    method === 'ROOM_FOLIO'
                      ? 'bg-purple-500/15 border-purple-500 text-purple-600 dark:text-purple-400 font-bold shadow-xs'
                      : 'bg-[var(--card)] border-[var(--border)] text-[var(--muted-foreground)] hover:border-purple-500/50'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  <span className="text-xs">Room Folio</span>
                </button>

                {/* 2. UPI QR */}
                <button
                  type="button"
                  onClick={() => setMethod('UPI')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer ${
                    method === 'UPI'
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs'
                      : 'bg-[var(--card)] border-[var(--border)] text-[var(--muted-foreground)] hover:border-emerald-500/50'
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                  <span className="text-xs">UPI QR</span>
                </button>

                {/* 3. Card */}
                <button
                  type="button"
                  onClick={() => setMethod('CARD')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer ${
                    method === 'CARD'
                      ? 'bg-blue-500/15 border-blue-500 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                      : 'bg-[var(--card)] border-[var(--border)] text-[var(--muted-foreground)] hover:border-blue-500/50'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-xs">Credit/Debit</span>
                </button>

                {/* 4. Cash */}
                <button
                  type="button"
                  onClick={() => setMethod('CASH')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer ${
                    method === 'CASH'
                      ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 font-bold shadow-xs'
                      : 'bg-[var(--card)] border-[var(--border)] text-[var(--muted-foreground)] hover:border-amber-500/50'
                  }`}
                >
                  <Banknote className="w-5 h-5" />
                  <span className="text-xs">Cash</span>
                </button>
              </div>
            </div>

            {/* Method Details Pane */}
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 text-xs">
              {method === 'ROOM_FOLIO' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold">
                    <UserCheck className="w-4 h-4" />
                    <span>PMS In-House Room Folio Posting</span>
                  </div>
                  <div className="bg-[var(--card)] p-3 rounded-lg border border-[var(--border)] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[var(--muted-foreground)]">Destination Room:</span>
                      <span className="font-bold text-[var(--foreground)]">Room {order.roomNumber || '302'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--muted-foreground)]">Guest Account:</span>
                      <span className="font-semibold text-[var(--foreground)]">{order.guestName || 'In-House Guest'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--muted-foreground)]">Charge Category:</span>
                      <span className="font-semibold text-purple-600">FOOD_BEVERAGE</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    This ₹{order.grandTotal.toFixed(2)} bill will be automatically appended to the guest's folio invoice and collected during front desk checkout.
                  </p>
                </div>
              )}

              {method === 'UPI' && (
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 p-2 bg-white rounded-xl shadow-xs border border-zinc-200 shrink-0 flex items-center justify-center">
                    {/* Visual QR representation */}
                    <div className="w-full h-full bg-zinc-950 p-1 flex items-center justify-center rounded-lg">
                      <QrCode className="w-16 h-16 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-[var(--foreground)]">Scan with GPay, PhonePe, Paytm</p>
                    <p className="text-[11px] text-[var(--muted-foreground)]">
                      Instant dynamic VPA: <span className="font-mono font-semibold">deskfloow.hotel@hdfcbank</span>
                    </p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      Exact amount embedded: ₹{order.grandTotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

              {method === 'CASH' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[var(--foreground)] font-semibold">Cash Tendered:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[var(--muted-foreground)]">₹</span>
                      <input
                        type="number"
                        value={cashTendered}
                        onChange={e => setCashTendered(e.target.value)}
                        className="w-28 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-right font-bold text-sm text-[var(--foreground)]"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-[var(--border)]">
                    <span className="text-zinc-600 dark:text-zinc-400 font-semibold">Change to Return:</span>
                    <span className="font-mono text-base font-black text-amber-600 dark:text-amber-400">
                      ₹{changeDue.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {method === 'CARD' && (
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-blue-500/10 text-blue-600 shrink-0">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-[var(--foreground)]">Swipe / Tap on POS EDC Terminal</p>
                    <p className="text-[11px] text-[var(--muted-foreground)]">
                      Visa, MasterCard, RuPay, Amex accepted. Enter auth ref code after swipe.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-[var(--primary)] text-white shadow-md hover:opacity-90 transition-opacity cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm Settlement &bull; ₹{order.grandTotal.toFixed(2)}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const SettleOrderModal: React.FC<SettleOrderModalProps> = ({
  isOpen,
  onClose,
  order,
  onSettle,
  onShowReceipt,
}) => {
  if (!isOpen || !order) return null;

  return (
    <SettleOrderModalContent
      onClose={onClose}
      order={order}
      onSettle={onSettle}
      onShowReceipt={onShowReceipt}
    />
  );
};
