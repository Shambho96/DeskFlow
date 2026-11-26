import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  ChefHat,
  Search,
  Plus,
  Minus,
  Trash2,
  Send,
  Receipt,
  Printer,
  BedDouble,
  Users,
  Bell,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { usePos } from '../../hooks/usePos';
import { ThermalReceiptModal } from '../../components/pos/ThermalReceiptModal';
import { SettleOrderModal } from '../../components/pos/SettleOrderModal';
import type { PosOrder, DietaryType } from '../../types/pos';

// Dietary Dot Indicator
export const DietaryDot: React.FC<{ type: DietaryType }> = ({ type }) => {
  if (type === 'VEG') {
    return (
      <span className="w-3.5 h-3.5 border-2 border-emerald-600 rounded-sm flex items-center justify-center shrink-0" title="Pure Vegetarian">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
      </span>
    );
  }
  if (type === 'NON_VEG') {
    return (
      <span className="w-3.5 h-3.5 border-2 border-rose-600 rounded-sm flex items-center justify-center shrink-0" title="Non-Vegetarian">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
      </span>
    );
  }
  if (type === 'EGG') {
    return (
      <span className="w-3.5 h-3.5 border-2 border-amber-600 rounded-sm flex items-center justify-center shrink-0" title="Contains Egg">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
      </span>
    );
  }
  return (
    <span className="w-3.5 h-3.5 border-2 border-blue-600 rounded-sm flex items-center justify-center shrink-0" title="Beverage">
      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
    </span>
  );
};

export const PosTerminalPage: React.FC = () => {
  const {
    kots,
    categories,
    menuItems,
    tables,
    inHouseGuests,
    cart,
    orderChannel,
    setOrderChannel,
    selectedTableNumber,
    setSelectedTableNumber,
    selectedRoomNumber,
    setSelectedRoomNumber,
    selectedGuest,
    orderNotes,
    setOrderNotes,
    cartSubtotal,
    cartTax,
    cartGrandTotal,
    addToCart,
    updateCartItemQty,
    updateCartItemNotes,
    removeFromCart,
    clearCart,
    fireKot,
    settleOrder,
  } = usePos();

  const [activeCategoryId, setActiveCategoryId] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL');
  const activeKotsCount = kots.filter(k => k.status !== 'DISPATCHED').length;

  // Modals
  const [lastFiredOrder, setLastFiredOrder] = useState<PosOrder | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [orderToSettle, setOrderToSettle] = useState<PosOrder | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered Menu Items
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      // Category filter
      if (activeCategoryId && item.categoryId !== activeCategoryId) return false;
      // Dietary filter
      if (dietaryFilter === 'VEG' && item.itemType !== 'VEG') return false;
      if (dietaryFilter === 'NON_VEG' && item.itemType !== 'NON_VEG') return false;
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [menuItems, activeCategoryId, dietaryFilter, searchQuery]);

  // Handle Fire KOT
  const handleFireKot = () => {
    if (cart.length === 0) return;
    const order = fireKot();
    if (order) {
      setLastFiredOrder(order);
      showToast(`🔥 Order #${order.orderNumber} fired to kitchen! KOT generated.`);
    }
  };

  // Handle Quick Settle
  const handleOpenSettle = () => {
    if (cart.length === 0) return;
    // Create temporary unbilled order to pass into settlement modal
    const order = fireKot();
    if (order) {
      setOrderToSettle(order);
      setIsSettleModalOpen(true);
    }
  };

  return (
    <div className="space-y-4 text-left pb-8">
      {/* ─── TOP CONTEXT & ORDER BAR ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
              Point of Sale (POS)
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Live Terminal
            </span>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Multi-channel dining, room service &amp; takeaway orders with instant KDS kitchen dispatch
          </p>
        </div>

        {/* Quick KOT / Kitchen & Views Navigation Links */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/app/kds"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Open Live Kitchen Order Tickets (KOTs)"
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>KOT &amp; Kitchen</span>
            {activeKotsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-mono font-black animate-pulse">
                {activeKotsCount}
              </span>
            )}
          </Link>

          <Link
            to="/app/pos/tables"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] text-[var(--foreground)] text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            <span>Tables</span>
          </Link>

          <Link
            to="/app/pos/menu"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] text-[var(--foreground)] text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            <span>Menu</span>
          </Link>
        </div>

        {/* Dynamic Context Selector (Table vs Room) & Channels */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Channel Segmented Buttons */}
          <div className="flex items-center gap-1 bg-[var(--muted)] p-1 rounded-xl border border-[var(--border)] text-xs">
            <button
              type="button"
              onClick={() => setOrderChannel('DINE_IN')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                orderChannel === 'DINE_IN'
                  ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Dine-In</span>
            </button>

            <button
              type="button"
              onClick={() => setOrderChannel('ROOM_SERVICE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                orderChannel === 'ROOM_SERVICE'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              <BedDouble className="w-3.5 h-3.5" />
              <span>Room Service</span>
            </button>

            <button
              type="button"
              onClick={() => setOrderChannel('TAKEAWAY')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                orderChannel === 'TAKEAWAY'
                  ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Takeaway / Bar</span>
            </button>
          </div>

          {/* Table Selector */}
          {orderChannel === 'DINE_IN' && (
            <div className="flex items-center gap-2 bg-[var(--card)] px-3 py-1.5 rounded-xl border border-[var(--border)] shadow-xs">
              <span className="text-xs font-semibold text-[var(--muted-foreground)]">Table:</span>
              <select
                value={selectedTableNumber}
                onChange={e => setSelectedTableNumber(e.target.value)}
                className="bg-transparent text-xs font-bold text-[var(--foreground)] outline-none cursor-pointer"
              >
                {tables.map(tbl => (
                  <option key={tbl.id} value={tbl.tableNumber}>
                    {tbl.tableNumber} ({tbl.sectionName} - {tbl.status})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Room Selector */}
          {orderChannel === 'ROOM_SERVICE' && (
            <div className="flex items-center gap-2 bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/30 shadow-xs">
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">Room:</span>
              <select
                value={selectedRoomNumber}
                onChange={e => setSelectedRoomNumber(e.target.value)}
                className="bg-transparent text-xs font-bold text-purple-800 dark:text-purple-200 outline-none cursor-pointer"
              >
                {inHouseGuests.map(g => (
                  <option key={g.roomNumber} value={g.roomNumber}>
                    Room {g.roomNumber} • {g.guestName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ─── ROOM SERVICE GUEST CRM BANNER ───────────────────────────────────── */}
      {orderChannel === 'ROOM_SERVICE' && selectedGuest && (
        <div className="px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-purple-900 dark:text-purple-200">
              👤 Guest: {selectedGuest.guestName}
            </span>
            <span className="text-purple-600 dark:text-purple-300 font-mono">
              ({selectedGuest.phone})
            </span>
            <span className="text-[11px] text-purple-600 dark:text-purple-400">
              Stay: {selectedGuest.checkInDate} &rarr; {selectedGuest.checkOutDate}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              Profile Tags:
            </span>
            {selectedGuest.tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ─── TOAST NOTIFICATION ────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[var(--card)] text-[var(--foreground)] px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xl border border-[var(--border)] flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── MAIN 2-COLUMN WORKSPACE: MENU CATALOG (LEFT) + LIVE CART (RIGHT) ───── */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-xs flex flex-col lg:flex-row h-[calc(100vh-14rem)] min-h-[580px]">
        {/* LEFT COLUMN: CATEGORIES + SEARCH + DISHES GRID */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-[var(--border)] overflow-hidden">
          {/* Category Tabs & Dietary Filter */}
          <div className="p-4 border-b border-[var(--border)] bg-[var(--card)]/50 space-y-3 shrink-0">
            {/* Search Bar + Veg/Non-Veg Filters */}
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-xs">
                <Search className="w-4 h-4 text-[var(--muted-foreground)] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search dishes by name or description (e.g. Tikka, Biryani, Naan)..."
                  className="w-full bg-transparent text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none text-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Dietary Filter Segment */}
              <div className="flex items-center gap-1 bg-[var(--muted)] p-1 rounded-xl border border-[var(--border)] text-xs">
                <button
                  type="button"
                  onClick={() => setDietaryFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    dietaryFilter === 'ALL'
                      ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs'
                      : 'text-[var(--muted-foreground)]'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setDietaryFilter('VEG')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    dietaryFilter === 'VEG'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-[var(--muted-foreground)]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Veg
                </button>
                <button
                  type="button"
                  onClick={() => setDietaryFilter('NON_VEG')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    dietaryFilter === 'NON_VEG'
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 shadow-xs'
                      : 'text-[var(--muted-foreground)]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Non-Veg
                </button>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map(cat => {
                const isActive = activeCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategoryId(cat.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[var(--primary)] text-white shadow-xs scale-102'
                        : 'bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] border border-[var(--border)]'
                    }`}
                  >
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dishes Grid */}
          <div className="flex-1 overflow-y-auto p-5">
            {filteredItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[var(--muted-foreground)]">
                <UtensilsCrossed className="w-12 h-12 stroke-[1.2] opacity-40 mb-3" />
                <p className="text-sm font-bold text-[var(--foreground)]">No dishes found</p>
                <p className="text-xs mt-1">Try clearing search filters or selecting another category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {filteredItems.map(item => {
                  const inCart = cart.find(c => c.menuItemId === item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => item.isAvailable && addToCart(item)}
                      className={`group relative p-3.5 rounded-2xl border transition-all duration-150 flex flex-col justify-between text-left select-none ${
                        !item.isAvailable
                          ? 'opacity-50 bg-[var(--muted)]/40 border-[var(--border)] cursor-not-allowed'
                          : 'bg-[var(--card)] border-[var(--border)] hover:border-[var(--primary)]/60 hover:shadow-md cursor-pointer'
                      }`}
                    >
                      <div>
                        {/* Top: Dietary & Price */}
                        <div className="flex items-center justify-between mb-1.5">
                          <DietaryDot type={item.itemType} />
                          <span className="text-xs font-black text-[var(--foreground)]">
                            ₹{item.price}
                          </span>
                        </div>

                        {/* Name & Desc */}
                        <h4 className="text-xs font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors leading-snug line-clamp-1">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-2 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Bottom Footer: Prep Time & Add Stepper */}
                      <div className="pt-3 mt-2 border-t border-[var(--border)]/60 flex items-center justify-between">
                        <span className="text-[10px] text-[var(--muted-foreground)] flex items-center gap-1">
                          <Clock className="w-3 h-3 opacity-60" />
                          {item.prepTimeMinutes}m
                        </span>

                        {!item.isAvailable ? (
                          <span className="text-[10px] font-bold text-rose-500 uppercase">
                            86 Out of Stock
                          </span>
                        ) : inCart ? (
                          <div
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-1.5 bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-0.5 rounded-lg border border-[var(--primary)]/30 text-xs font-bold"
                          >
                            <button
                              onClick={() => updateCartItemQty(item.id, -1)}
                              className="hover:scale-125 transition-transform p-0.5"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-4 text-center">{inCart.quantity}</span>
                            <button
                              onClick={() => updateCartItemQty(item.id, 1)}
                              className="hover:scale-125 transition-transform p-0.5"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[var(--primary)] text-white shadow-2xs group-hover:scale-105 transition-transform"
                          >
                            + Add
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE CART & TICKET SLIP */}
        <div className="w-80 sm:w-96 bg-[var(--card)] flex flex-col justify-between shrink-0 overflow-hidden shadow-lg border-l border-[var(--border)]">
          {/* Cart Header */}
          <div className="p-4 border-b border-[var(--border)] bg-[var(--muted)]/30 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
                <span>Active Order Ticket</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--primary)]/15 text-[var(--primary)]">
                  {cart.reduce((sum, i) => sum + i.quantity, 0)} items
                </span>
              </h3>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5 font-medium">
                {orderChannel === 'DINE_IN' && `Table ${selectedTableNumber}`}
                {orderChannel === 'ROOM_SERVICE' && `Room Service: Rm ${selectedRoomNumber}`}
                {orderChannel === 'TAKEAWAY' && 'Takeaway / Quick Counter'}
              </p>
            </div>

            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] text-rose-500 hover:text-rose-600 font-semibold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[var(--muted-foreground)] space-y-2">
                <Receipt className="w-10 h-10 stroke-[1.2] opacity-40" />
                <p className="text-xs font-bold text-[var(--foreground)]">Your cart is empty</p>
                <p className="text-[11px]">Click any dish from the menu to add items to this order.</p>
              </div>
            ) : (
              cart.map(item => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-[var(--border)] bg-[var(--background)] space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1">
                      <DietaryDot type={item.itemType} />
                      <div className="min-w-0">
                        <p className="font-bold text-[var(--foreground)] leading-tight">{item.name}</p>
                        <p className="text-[11px] text-[var(--muted-foreground)]">
                          ₹{item.price} each &bull; {item.station}
                        </p>
                      </div>
                    </div>
                    <span className="font-black text-[var(--foreground)]">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  {/* Quantity Stepper & Cooking Notes Input */}
                  <div className="flex items-center justify-between pt-1 border-t border-[var(--border)]/60">
                    <input
                      type="text"
                      placeholder="Add cooking note (e.g. less spicy)..."
                      value={item.notes || ''}
                      onChange={e => updateCartItemNotes(item.menuItemId, e.target.value)}
                      className="flex-1 bg-transparent text-[11px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none mr-2 italic"
                    />

                    <div className="flex items-center gap-1.5 bg-[var(--muted)] px-2 py-0.5 rounded-lg border border-[var(--border)]">
                      <button
                        onClick={() => updateCartItemQty(item.menuItemId, -1)}
                        className="hover:scale-125 transition-transform"
                      >
                        <Minus className="w-3 h-3 text-[var(--foreground)]" />
                      </button>
                      <span className="w-4 text-center font-bold text-xs">{item.quantity}</span>
                      <button
                        onClick={() => updateCartItemQty(item.menuItemId, 1)}
                        className="hover:scale-125 transition-transform"
                      >
                        <Plus className="w-3 h-3 text-[var(--foreground)]" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.menuItemId)}
                      className="ml-2 p-1 text-[var(--muted-foreground)] hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Summary & Action Buttons */}
          <div className="p-4 border-t border-[var(--border)] bg-[var(--card)] space-y-3 shrink-0">
            {/* General Order Notes */}
            <input
              type="text"
              placeholder="Special instructions for kitchen (e.g. Extra napkins, water bottle)..."
              value={orderNotes}
              onChange={e => setOrderNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none"
            />

            {/* Calculations */}
            <div className="space-y-1 text-xs pt-1 border-t border-[var(--border)]">
              <div className="flex justify-between text-[var(--muted-foreground)]">
                <span>Subtotal</span>
                <span>₹{cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[var(--muted-foreground)]">
                <span>GST (2.5% CGST + 2.5% SGST)</span>
                <span>₹{cartTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-[var(--foreground)] pt-1 border-t border-[var(--border)]">
                <span>Grand Total</span>
                <span>₹{cartGrandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions: Send to Kitchen / Settle */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleFireKot}
                disabled={cart.length === 0}
                className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Fire KOT (Kitchen)</span>
              </button>

              <button
                type="button"
                onClick={handleOpenSettle}
                disabled={cart.length === 0}
                className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold bg-[var(--primary)] hover:opacity-90 text-white shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                <Receipt className="w-4 h-4" />
                <span>Settle / Bill</span>
              </button>
            </div>

            {lastFiredOrder && (
              <button
                type="button"
                onClick={() => setIsReceiptModalOpen(true)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--muted)]/50 text-[11px] font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Last Slip (Order #{lastFiredOrder.orderNumber})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── MODALS ────────────────────────────────────────────────────────── */}
      <ThermalReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        order={lastFiredOrder}
        type="BILL"
      />

      <SettleOrderModal
        isOpen={isSettleModalOpen}
        onClose={() => setIsSettleModalOpen(false)}
        order={orderToSettle}
        onSettle={settleOrder}
        onShowReceipt={ord => {
          setLastFiredOrder(ord);
          setIsReceiptModalOpen(true);
        }}
      />
    </div>
  );
};
