// DeskFloow Hotel POS, Kitchen Display System (KDS) & Self-Ordering Types

export type DietaryType = 'VEG' | 'NON_VEG' | 'EGG' | 'BEVERAGE' | 'ALCOHOL';

export type KitchenStation = 'KITCHEN' | 'BAR' | 'BAKERY' | 'PANTRY';

export type TableStatus = 'VACANT' | 'OCCUPIED' | 'BILLING' | 'CLEANING';

export type OrderChannel = 
  | 'DINE_IN'
  | 'ROOM_SERVICE'
  | 'TAKEAWAY'
  | 'GUEST_QR'
  | 'GUEST_WHATSAPP'
  | 'KITCHEN_DIRECT';

export type PosOrderStatus = 
  | 'NEW'
  | 'PREPARING'
  | 'READY'
  | 'SERVED'
  | 'BILLED'
  | 'CANCELLED';

export type KotStatus = 
  | 'NEW'
  | 'IN_PROGRESS'
  | 'READY'
  | 'DISPATCHED';

export type PaymentMethod = 
  | 'CASH'
  | 'CARD'
  | 'UPI'
  | 'ROOM_FOLIO'
  | 'COMPLIMENTARY';

export interface PosTable {
  id: number;
  outletId: number;
  sectionName: string; // e.g. "Main Dining", "Rooftop Garden", "Poolside Bar"
  tableNumber: string; // e.g. "T-01", "T-02"
  capacity: number;
  status: TableStatus;
  currentOrderId?: number;
  currentOrderNumber?: string;
  seatedGuests?: number;
  timeSeated?: string; // ISO string
  activeTotal?: number;
}

export interface PosMenuCategory {
  id: number;
  name: string;
  icon: string;
  displayOrder: number;
  isActive: boolean;
}

export interface PosMenuItem {
  id: number;
  categoryId: number;
  categoryName?: string;
  name: string;
  description: string;
  price: number;
  taxRate: number; // e.g. 5.0 for 5% F&B GST
  itemType: DietaryType;
  station: KitchenStation;
  prepTimeMinutes: number;
  isAvailable: boolean; // 86 out-of-stock toggle
  imageUrl?: string;
  displayOrder: number;
}

export interface PosCartItem {
  id: string; // unique cart line id
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
  taxRate: number;
  itemType: DietaryType;
  station: KitchenStation;
  notes?: string;
}

export interface PosOrderItem {
  id: number;
  orderId: number;
  menuItemId: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  totalAmount: number;
  specialInstructions?: string;
  itemType: DietaryType;
  station: KitchenStation;
  status: 'PENDING' | 'COOKING' | 'READY' | 'SERVED';
  kotNumber?: string;
}

export interface PosOrder {
  id: number;
  orderNumber: string;
  channel: OrderChannel;
  status: PosOrderStatus;
  createdAt: string;
  
  // Context
  tableId?: number;
  tableNumber?: string;
  roomNumber?: string;
  guestName?: string;
  guestPhone?: string;
  guestTags?: string[]; // e.g. ["VIP", "VEGAN", "ALLERGY: Nuts"]
  serverName?: string;
  
  // Items
  items: PosOrderItem[];
  
  // Financials
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  
  // Settlement
  paymentStatus: 'UNPAID' | 'PAID' | 'POSTED_TO_ROOM';
  paymentMethod?: PaymentMethod;
  folioId?: number;
  settledAt?: string;
  
  notes?: string;
}

export interface PosKotTicket {
  id: number;
  kotNumber: string;
  orderId: number;
  orderNumber: string;
  orderChannel: OrderChannel;
  station: KitchenStation;
  status: KotStatus;
  createdAt: string;
  
  tableNumber?: string;
  roomNumber?: string;
  guestName?: string;
  guestTags?: string[];
  serverName?: string;
  
  items: Array<{
    name: string;
    quantity: number;
    notes?: string;
    itemType: DietaryType;
    status: 'PENDING' | 'COOKING' | 'READY';
  }>;
  
  notes?: string;
}

export interface InHouseGuestSummary {
  roomNumber: string;
  guestName: string;
  phone: string;
  reservationId: number;
  checkInDate: string;
  checkOutDate: string;
  tags: string[];
  folioId?: number;
}
