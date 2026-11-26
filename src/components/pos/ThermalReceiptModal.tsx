import React from 'react';
import { X, Printer } from 'lucide-react';
import type { PosOrder, PosKotTicket } from '../../types/pos';

interface ThermalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: PosOrder | null;
  kot?: PosKotTicket | null;
  type: 'BILL' | 'KOT';
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  isOpen,
  onClose,
  order,
  kot,
  type,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const isKot = type === 'KOT';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--muted)]/40">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-[var(--primary)]" />
            <h3 className="text-sm font-bold text-[var(--foreground)]">
              {isKot ? 'Kitchen Order Ticket (KOT)' : 'Guest Tax Receipt'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 80mm Receipt Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-white text-zinc-900 font-mono text-xs select-text">
          {/* Hotel Brand Header */}
          <div className="text-center pb-3 border-b border-dashed border-zinc-400 space-y-1">
            <h2 className="text-base font-black tracking-tight text-zinc-950 uppercase">
              DESKFLOOW RESORT &amp; SPA
            </h2>
            <p className="text-[10px] text-zinc-600">Luxury Heritage Property &bull; F&amp;B Unit</p>
            <p className="text-[10px] text-zinc-500">GSTIN: 27AABCT8891Q1ZP</p>
          </div>

          {/* Ticket Meta */}
          <div className="py-2.5 border-b border-dashed border-zinc-400 space-y-1 text-[11px]">
            <div className="flex justify-between font-bold">
              <span>{isKot ? 'KOT NO:' : 'INVOICE:'}</span>
              <span>{isKot ? kot?.kotNumber : order?.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Date &amp; Time:</span>
              <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
            <div className="flex justify-between">
              <span>Channel:</span>
              <span className="font-semibold uppercase">{isKot ? kot?.orderChannel : order?.channel}</span>
            </div>
            {(kot?.tableNumber || order?.tableNumber) && (
              <div className="flex justify-between font-bold text-zinc-950">
                <span>Table:</span>
                <span>{kot?.tableNumber || order?.tableNumber}</span>
              </div>
            )}
            {(kot?.roomNumber || order?.roomNumber) && (
              <div className="flex justify-between font-bold text-zinc-950">
                <span>Room Service:</span>
                <span>Room {kot?.roomNumber || order?.roomNumber}</span>
              </div>
            )}
            {(kot?.guestName || order?.guestName) && (
              <div className="flex justify-between">
                <span>Guest:</span>
                <span>{kot?.guestName || order?.guestName}</span>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="py-3 border-b border-dashed border-zinc-400">
            <div className="flex justify-between font-bold text-[10px] uppercase text-zinc-600 pb-1.5 border-b border-zinc-300">
              <span className="w-8">Qty</span>
              <span className="flex-1">Item Description</span>
              {!isKot && <span className="w-16 text-right">Amount</span>}
            </div>

            <div className="pt-2 space-y-2">
              {isKot &&
                kot?.items.map((it, idx) => (
                  <div key={idx} className="flex items-start justify-between text-xs">
                    <span className="w-8 font-bold">{it.quantity}x</span>
                    <div className="flex-1">
                      <p className="font-semibold">{it.name}</p>
                      {it.notes && (
                        <p className="text-[10px] text-zinc-600 italic">*** Note: {it.notes} ***</p>
                      )}
                    </div>
                  </div>
                ))}

              {!isKot &&
                order?.items.map((it, idx) => (
                  <div key={idx} className="flex items-start justify-between text-xs">
                    <span className="w-8 font-bold">{it.quantity}x</span>
                    <div className="flex-1">
                      <p className="font-medium">{it.itemName}</p>
                      {it.specialInstructions && (
                        <p className="text-[10px] text-zinc-500 italic">{it.specialInstructions}</p>
                      )}
                    </div>
                    <span className="w-16 text-right font-semibold">₹{it.totalAmount.toFixed(2)}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Bill Calculation (Only for Bill) */}
          {!isKot && order && (
            <div className="py-2.5 border-b border-dashed border-zinc-400 space-y-1 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal:</span>
                <span>₹{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>CGST (2.5%):</span>
                <span>₹{(order.taxAmount / 2).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>SGST (2.5%):</span>
                <span>₹{(order.taxAmount / 2).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-black text-sm pt-1 border-t border-zinc-300 text-zinc-950">
                <span>GRAND TOTAL:</span>
                <span>₹{order.grandTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] pt-1 text-zinc-700">
                <span>Settlement:</span>
                <span className="font-bold uppercase text-emerald-700">{order.paymentMethod || 'PAID'}</span>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-3 text-[10px] text-zinc-500 space-y-1">
            <p className="font-semibold">Thank you! Please visit us again.</p>
            <p>DeskFloow POS v2.4 &bull; Terminal 01</p>
          </div>
        </div>

        {/* Modal Action Controls */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--card)] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-[var(--primary)] text-white shadow-md hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};
