import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Plus,
  Minus,
  ShoppingBag,
  CheckCircle2,
  Building2,
  Flame,
  ArrowRight,
  BedDouble,
  X,
} from 'lucide-react';
import { usePos } from '../../hooks/usePos';
import { DietaryDot } from './PosTerminalPage';

export const GuestSelfOrderPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const roomParam = searchParams.get('room') || '302';
  const tableParam = searchParams.get('table');

  const {
    categories,
    menuItems,
    inHouseGuests,
    cart,
    addToCart,
    updateCartItemQty,
    cartSubtotal,
    cartTax,
    cartGrandTotal,
    fireKot,
    setOrderChannel,
    setSelectedRoomNumber,
    setSelectedTableNumber,
  } = usePos();

  const [activeCategoryId, setActiveCategoryId] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [cookingNotes, setCookingNotes] = useState('');
  const [placedOrderId, setPlacedOrderId] = useState<number | null>(null);
  const [trackingStep, setTrackingStep] = useState<1 | 2 | 3>(1);

  // Match in-house guest profile if room specified
  const guestInfo = useMemo(() => {
    return inHouseGuests.find(g => g.roomNumber === roomParam) || null;
  }, [inHouseGuests, roomParam]);

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      if (!item.isAvailable) return false; // Guests never see 86 items
      if (activeCategoryId && item.categoryId !== activeCategoryId) return false;
      if (dietaryFilter === 'VEG' && item.itemType !== 'VEG') return false;
      if (dietaryFilter === 'NON_VEG' && item.itemType !== 'NON_VEG') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [menuItems, activeCategoryId, dietaryFilter, searchQuery]);

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;

    if (tableParam) {
      setOrderChannel('GUEST_QR');
      setSelectedTableNumber(tableParam);
    } else {
      setOrderChannel('ROOM_SERVICE');
      setSelectedRoomNumber(roomParam);
    }

    const order = fireKot();
    if (order) {
      setPlacedOrderId(order.id);
      setIsCheckoutModalOpen(false);
      setTrackingStep(1);

      // Simulate live order status progression for guest experience
      setTimeout(() => setTrackingStep(2), 3500); // Cooking
      setTimeout(() => setTrackingStep(3), 8000); // Out for delivery
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col items-center">
      {/* Mobile container max-w-md */}
      <div className="w-full max-w-md bg-zinc-900 min-h-screen flex flex-col shadow-2xl relative border-x border-zinc-800 pb-24">
        {/* ─── BRAND HERO HEADER ────────────────────────────────────────────── */}
        <div className="p-5 bg-gradient-to-b from-zinc-800 to-zinc-900 border-b border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/30 flex items-center justify-center p-1.5 shrink-0">
                <img
                  src="/deskfloow-logo.png"
                  alt="DeskFloow Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tight uppercase text-white">
                  DeskFloow Resort &bull; Dining
                </h1>
                <p className="text-[10px] text-zinc-400">In-Room &amp; Poolside Guest Service</p>
              </div>
            </div>

            {/* Room / Table Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold">
              <BedDouble className="w-3.5 h-3.5" />
              <span>{tableParam ? `Table ${tableParam}` : `Room ${roomParam}`}</span>
            </div>
          </div>

          {/* Guest Personalized Greeting */}
          {guestInfo && (
            <div className="p-3 rounded-xl bg-zinc-800/80 border border-zinc-700/80 flex items-center justify-between text-xs">
              <div>
                <p className="text-zinc-400 text-[10px]">Welcome,</p>
                <p className="font-bold text-white text-xs">{guestInfo.guestName}</p>
              </div>
              <div className="flex items-center gap-1 flex-wrap justify-end">
                {guestInfo.tags.map(t => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-xs">
            <Search className="w-4 h-4 text-zinc-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search dishes (e.g. Naan, Biryani, Chai)..."
              className="w-full bg-transparent text-white placeholder:text-zinc-500 outline-none text-xs"
            />
          </div>

          {/* Dietary Filter Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setDietaryFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                dietaryFilter === 'ALL' ? 'bg-white text-zinc-950 font-black' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setDietaryFilter('VEG')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                dietaryFilter === 'VEG'
                  ? 'bg-emerald-500 text-zinc-950 font-black'
                  : 'bg-zinc-800 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Pure Veg
            </button>
            <button
              type="button"
              onClick={() => setDietaryFilter('NON_VEG')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                dietaryFilter === 'NON_VEG'
                  ? 'bg-rose-500 text-white font-black'
                  : 'bg-zinc-800 text-rose-400 border border-rose-500/30'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              Non-Veg
            </button>
          </div>
        </div>

        {/* ─── CATEGORY HORIZONTAL BAR ────────────────────────────────────────── */}
        <div className="px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800 sticky top-0 z-30 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategoryId(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategoryId === cat.id
                  ? 'bg-[var(--primary)] text-white shadow-md shadow-purple-950/40'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* ─── LIVE ORDER TRACKER (IF ORDER JUST PLACED) ───────────────────────── */}
        {placedOrderId && (
          <div className="m-4 p-4 rounded-2xl bg-gradient-to-r from-purple-950/80 to-zinc-900 border border-purple-500/40 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-purple-400 animate-bounce" />
                Live Kitchen Order Tracker
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">#{placedOrderId}</span>
            </div>

            {/* Stepper */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
              <div
                className={`p-2 rounded-xl border ${
                  trackingStep >= 1
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                    : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                }`}
              >
                1. Received
              </div>
              <div
                className={`p-2 rounded-xl border ${
                  trackingStep >= 2
                    ? 'bg-purple-500/30 text-purple-200 border-purple-500/60 animate-pulse'
                    : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                }`}
              >
                2. Cooking
              </div>
              <div
                className={`p-2 rounded-xl border ${
                  trackingStep >= 3
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                }`}
              >
                3. Out for Delivery
              </div>
            </div>

            <p className="text-[11px] text-zinc-300 text-center font-medium">
              {trackingStep === 1 && 'Order received at Kitchen station. Chef assigning tickets...'}
              {trackingStep === 2 && 'Dishes sizzling in tandoor & pans. Fresh preparation in progress.'}
              {trackingStep === 3 && `Order dispatched! Service runner is heading to Room ${roomParam}.`}
            </p>
          </div>
        )}

        {/* ─── DISHES LIST ────────────────────────────────────────────────────── */}
        <div className="p-4 space-y-3.5">
          {filteredItems.map(item => {
            const inCart = cart.find(c => c.menuItemId === item.id);
            return (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-zinc-850 border border-zinc-800 flex items-start justify-between gap-3 shadow-xs"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <DietaryDot type={item.itemType} />
                    <span className="text-[10px] text-zinc-400 font-semibold">{item.prepTimeMinutes}m</span>
                  </div>

                  <h3 className="text-sm font-bold text-white leading-tight">{item.name}</h3>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                  <p className="text-sm font-black text-white pt-1">₹{item.price}</p>
                </div>

                {/* Add / Stepper Button */}
                <div className="shrink-0 self-center">
                  {inCart ? (
                    <div className="flex items-center gap-2 bg-[var(--primary)] text-white px-2 py-1 rounded-xl font-bold text-xs shadow-md">
                      <button
                        onClick={() => updateCartItemQty(item.id, -1)}
                        className="hover:scale-125 transition-transform"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-4 text-center">{inCart.quantity}</span>
                      <button
                        onClick={() => updateCartItemQty(item.id, 1)}
                        className="hover:scale-125 transition-transform"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => addToCart(item)}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[var(--primary)]/15 hover:bg-[var(--primary)] text-purple-300 hover:text-white border border-[var(--primary)]/40 shadow-xs cursor-pointer active:scale-95 transition-all"
                    >
                      + Add
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── FLOATING BOTTOM CART BAR ───────────────────────────────────────── */}
        {cart.length > 0 && (
          <div className="fixed bottom-4 left-0 right-0 z-40 px-4 flex justify-center">
            <div
              onClick={() => setIsCheckoutModalOpen(true)}
              className="w-full max-w-md bg-[var(--primary)] text-white p-3.5 rounded-2xl shadow-2xl shadow-purple-950/60 flex items-center justify-between cursor-pointer active:scale-98 transition-transform font-bold text-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-black/25 text-white flex items-center justify-center text-xs font-black">
                  {cart.reduce((sum, i) => sum + i.quantity, 0)}
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wide">View Order Ticket</p>
                  <p className="text-[10px] text-purple-100">₹{cartGrandTotal.toFixed(2)} total &bull; Room {roomParam}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-black">
                <span>Review &amp; Send</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        )}

        {/* ─── CHECKOUT SLIDE-UP MODAL ────────────────────────────────────────── */}
        {isCheckoutModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-5">
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-850">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white">Review In-Room Dining Order</h3>
                </div>
                <button
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
                {/* Destination */}
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-400" />
                    <div>
                      <p className="font-bold text-white">Delivering to Room {roomParam}</p>
                      <p className="text-[10px] text-purple-300">
                        {guestInfo ? guestInfo.guestName : 'Verified In-House Stay'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                    PMS Verified
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-2.5">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Dishes Selected
                  </span>
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <DietaryDot type={item.itemType} />
                        <span className="text-white font-medium">
                          {item.quantity}x {item.name}
                        </span>
                      </div>
                      <span className="font-bold text-white">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Cooking Instructions */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Special Cooking Instructions
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Extra spicy, no onions, please send extra cutlery..."
                    value={cookingNotes}
                    onChange={e => setCookingNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-white placeholder:text-zinc-500 outline-none"
                  />
                </div>

                {/* Calculation */}
                <div className="p-3 rounded-xl bg-zinc-800/60 border border-zinc-700 space-y-1.5 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal</span>
                    <span>₹{cartSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>GST (5%)</span>
                    <span>₹{cartTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-white pt-1 border-t border-zinc-700">
                    <span>Total Amount</span>
                    <span className="text-[var(--primary)] font-black">₹{cartGrandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Billing Choice Note */}
                <div className="p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-[11px] text-zinc-400 space-y-1">
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Auto-Billed to Room Folio</span>
                  </p>
                  <p>
                    No advance payment required. This ₹{cartGrandTotal.toFixed(2)} charge will be seamlessly added to Room {roomParam}'s checkout folio invoice.
                  </p>
                </div>
              </div>

              {/* Action */}
              <div className="p-4 border-t border-zinc-800 bg-zinc-850">
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  className="w-full py-3.5 rounded-xl text-xs font-black bg-[var(--primary)] hover:opacity-90 text-white shadow-xl shadow-purple-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Flame className="w-4 h-4" />
                  <span>Confirm &bull; Place Order Now (₹{cartGrandTotal.toFixed(2)})</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
