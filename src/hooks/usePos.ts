import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  PosTable,
  PosMenuCategory,
  PosMenuItem,
  PosCartItem,
  PosOrder,
  PosKotTicket,
  OrderChannel,
  PaymentMethod,
  KotStatus,
} from '../types/pos';
import { audioAlert } from '../utils/audioAlert';
import {
  SEED_CATEGORIES,
  SEED_MENU_ITEMS,
  SEED_TABLES,
  IN_HOUSE_GUESTS,
  SEED_KOTS
} from '../data/posInitialData';

export { IN_HOUSE_GUESTS };

// ─── HOOK IMPLEMENTATION ──────────────────────────────────────────────────────

export function usePos() {
  const [categories] = useState<PosMenuCategory[]>(SEED_CATEGORIES);
  const [menuItems, setMenuItems] = useState<PosMenuItem[]>(() => {
    const saved = localStorage.getItem('deskfloow_pos_menu_items');
    return saved ? JSON.parse(saved) : SEED_MENU_ITEMS;
  });
  const [tables, setTables] = useState<PosTable[]>(() => {
    const saved = localStorage.getItem('deskfloow_pos_tables');
    return saved ? JSON.parse(saved) : SEED_TABLES;
  });
  const [kots, setKots] = useState<PosKotTicket[]>(() => {
    const saved = localStorage.getItem('deskfloow_pos_kots');
    return saved ? JSON.parse(saved) : SEED_KOTS;
  });
  const [orders, setOrders] = useState<PosOrder[]>(() => {
    const saved = localStorage.getItem('deskfloow_pos_orders');
    return saved ? JSON.parse(saved) : [];
  });

  // Current Cart State for active terminal order
  const [cart, setCart] = useState<PosCartItem[]>([]);
  const [orderChannel, setOrderChannel] = useState<OrderChannel>('DINE_IN');
  const [selectedTableNumber, setSelectedTableNumber] = useState<string>('T-01');
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string>('302');
  const [orderNotes, setOrderNotes] = useState<string>('');

  // Save changes to localStorage for persistent interactive demos
  useEffect(() => {
    localStorage.setItem('deskfloow_pos_menu_items', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('deskfloow_pos_tables', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('deskfloow_pos_kots', JSON.stringify(kots));
  }, [kots]);

  useEffect(() => {
    localStorage.setItem('deskfloow_pos_orders', JSON.stringify(orders));
  }, [orders]);

  // Derived in-house guest info for Room Service
  const selectedGuest = useMemo(() => {
    return IN_HOUSE_GUESTS.find(g => g.roomNumber === selectedRoomNumber) || null;
  }, [selectedRoomNumber]);

  // Cart Calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const cartTax = useMemo(() => {
    // 5% standard GST
    return Math.round(cartSubtotal * 0.05 * 100) / 100;
  }, [cartSubtotal]);

  const cartGrandTotal = useMemo(() => {
    return Math.round((cartSubtotal + cartTax) * 100) / 100;
  }, [cartSubtotal, cartTax]);

  // ─── CART ACTIONS ───────────────────────────────────────────────────────────

  const addToCart = useCallback((item: PosMenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.menuItemId === item.id);
      if (existing) {
        return prev.map(i =>
          i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      const newItem: PosCartItem = {
        id: `cart-${item.id}-${Date.now()}`,
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        taxRate: item.taxRate,
        itemType: item.itemType,
        station: item.station,
      };
      return [...prev, newItem];
    });
  }, []);

  const updateCartItemQty = useCallback((menuItemId: number, delta: number) => {
    setCart(prev => {
      return prev
        .map(i => {
          if (i.menuItemId === menuItemId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as PosCartItem[];
    });
  }, []);

  const updateCartItemNotes = useCallback((menuItemId: number, notes: string) => {
    setCart(prev =>
      prev.map(i => (i.menuItemId === menuItemId ? { ...i, notes } : i))
    );
  }, []);

  const removeFromCart = useCallback((menuItemId: number) => {
    setCart(prev => prev.filter(i => i.menuItemId !== menuItemId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setOrderNotes('');
  }, []);

  // ─── ORDER & KOT DISPATCH ───────────────────────────────────────────────────

  const fireKot = useCallback((): PosOrder | null => {
    if (cart.length === 0) return null;

    const orderSeq = Math.floor(100 + Math.random() * 900);
    const orderNum = `ORD-${orderSeq}`;
    const kotSeq = `KOT-${Math.floor(100 + Math.random() * 900)}`;

    const orderItems = cart.map((c, idx) => ({
      id: idx + 1,
      orderId: orderSeq,
      menuItemId: c.menuItemId,
      itemName: c.name,
      quantity: c.quantity,
      unitPrice: c.price,
      taxRate: c.taxRate,
      totalAmount: c.price * c.quantity,
      specialInstructions: c.notes,
      itemType: c.itemType,
      station: c.station,
      status: 'PENDING' as const,
      kotNumber: kotSeq,
    }));

    const newOrder: PosOrder = {
      id: orderSeq,
      orderNumber: orderNum,
      channel: orderChannel,
      status: 'NEW',
      createdAt: new Date().toISOString(),
      tableNumber: orderChannel === 'DINE_IN' ? selectedTableNumber : undefined,
      roomNumber: orderChannel === 'ROOM_SERVICE' ? selectedRoomNumber : undefined,
      guestName: orderChannel === 'ROOM_SERVICE' ? selectedGuest?.guestName : undefined,
      guestPhone: orderChannel === 'ROOM_SERVICE' ? selectedGuest?.phone : undefined,
      guestTags: orderChannel === 'ROOM_SERVICE' ? selectedGuest?.tags : undefined,
      serverName: 'Captain Terminal',
      items: orderItems,
      subtotal: cartSubtotal,
      taxAmount: cartTax,
      discountAmount: 0,
      grandTotal: cartGrandTotal,
      paymentStatus: 'UNPAID',
      notes: orderNotes,
    };

    const newKot: PosKotTicket = {
      id: Date.now(),
      kotNumber: kotSeq,
      orderId: orderSeq,
      orderNumber: orderNum,
      orderChannel: orderChannel,
      station: 'KITCHEN',
      status: 'NEW',
      createdAt: new Date().toISOString(),
      tableNumber: orderChannel === 'DINE_IN' ? selectedTableNumber : undefined,
      roomNumber: orderChannel === 'ROOM_SERVICE' ? selectedRoomNumber : undefined,
      guestName: orderChannel === 'ROOM_SERVICE' ? selectedGuest?.guestName : undefined,
      guestTags: orderChannel === 'ROOM_SERVICE' ? selectedGuest?.tags : undefined,
      serverName: 'Captain Terminal',
      notes: orderNotes,
      items: cart.map(c => ({
        name: c.name,
        quantity: c.quantity,
        notes: c.notes,
        itemType: c.itemType,
        status: 'PENDING',
      })),
    };

    // Update Tables if Dine-in
    if (orderChannel === 'DINE_IN' && selectedTableNumber) {
      setTables(prev =>
        prev.map(t =>
          t.tableNumber === selectedTableNumber
            ? {
                ...t,
                status: 'OCCUPIED',
                currentOrderId: orderSeq,
                currentOrderNumber: orderNum,
                activeTotal: (t.activeTotal || 0) + cartGrandTotal,
                timeSeated: t.timeSeated || new Date().toISOString(),
              }
            : t
        )
      );
    }

    setOrders(prev => [newOrder, ...prev]);
    setKots(prev => [newKot, ...prev]);

    // Play kitchen bell chime
    audioAlert.playNewOrderChime();

    // Clear active cart
    clearCart();

    return newOrder;
  }, [
    cart,
    cartGrandTotal,
    cartSubtotal,
    cartTax,
    clearCart,
    orderChannel,
    orderNotes,
    selectedGuest,
    selectedRoomNumber,
    selectedTableNumber,
  ]);

  // ─── KDS STATUS MANAGEMENT ──────────────────────────────────────────────────

  const updateKotStatus = useCallback((kotId: number, nextStatus: KotStatus) => {
    setKots(prev =>
      prev.map(k => {
        if (k.id === kotId) {
          if (nextStatus === 'READY') {
            audioAlert.playOrderReadyChime();
          }
          return {
            ...k,
            status: nextStatus,
            items: k.items.map(item => ({
              ...item,
              status: nextStatus === 'IN_PROGRESS' ? 'COOKING' : nextStatus === 'READY' ? 'READY' : item.status,
            })),
          };
        }
        return k;
      })
    );
  }, []);

  // ─── BILLING & SETTLEMENT ───────────────────────────────────────────────────

  const settleOrder = useCallback(
    (orderId: number, method: PaymentMethod, tableNum?: string) => {
      setOrders(prev =>
        prev.map(o =>
          o.id === orderId
            ? {
                ...o,
                status: 'BILLED',
                paymentStatus: method === 'ROOM_FOLIO' ? 'POSTED_TO_ROOM' : 'PAID',
                paymentMethod: method,
                settledAt: new Date().toISOString(),
              }
            : o
        )
      );

      // Release Table
      if (tableNum) {
        setTables(prev =>
          prev.map(t =>
            t.tableNumber === tableNum
              ? {
                  ...t,
                  status: 'CLEANING',
                  currentOrderId: undefined,
                  currentOrderNumber: undefined,
                  activeTotal: undefined,
                  timeSeated: undefined,
                }
              : t
          )
        );
      }
    },
    []
  );

  // ─── MENU AVAILABILITY (86 TOGGLE) ──────────────────────────────────────────

  const toggleItemAvailability = useCallback((itemId: number) => {
    setMenuItems(prev =>
      prev.map(i => (i.id === itemId ? { ...i, isAvailable: !i.isAvailable } : i))
    );
  }, []);

  // ─── TABLE STATUS UPDATE ────────────────────────────────────────────────────

  const updateTableStatus = useCallback((tableId: number, status: PosTable['status']) => {
    setTables(prev =>
      prev.map(t => (t.id === tableId ? { ...t, status } : t))
    );
  }, []);

  return {
    categories,
    menuItems,
    tables,
    kots,
    orders,
    inHouseGuests: IN_HOUSE_GUESTS,
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
    updateKotStatus,
    settleOrder,
    toggleItemAvailability,
    updateTableStatus,
  };
}
