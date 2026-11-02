export type BookingSource =
  | 'WALKIN'
  | 'DIRECT'
  | 'WHATSAPP'
  | 'WEBSITE'
  | 'OTHER';

export type ReservationStatus =
  | 'RESERVED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED'
  | 'NO_SHOW';

export type PaymentMethod =
  | 'CASH'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'UPI_QR'
  | 'BANK_TRANSFER';

export interface GuestRecord {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  email?: string;
  idType?: string;
  idNumber?: string;
  vipStatus?: string;
  nationality?: string;
  bookingSource?: BookingSource;
  specialRequests?: string[];
}

export interface ReservationRecord {
  id: number;
  reservationCode: string;
  roomId?: number;
  roomNumber?: string;
  categoryId: number;
  categoryName: string;
  checkInDate: string;
  checkOutDate: string;
  actualCheckInTime?: string;
  actualCheckOutTime?: string;
  eta?: string;
  status: ReservationStatus;
  bookingSource: BookingSource;
  adultsCount: number;
  childrenCount: number;
  ratePerNight: number;
  totalRoomCharges: number;
  taxAmount: number;
  grandTotal: number;
  paidAmount: number;
  balanceDue: number;
  guest: GuestRecord;
}

export interface OperationsBoardRoom {
  id: number;
  roomNumber: string;
  floorId: number;
  buildingId?: number;
  categoryName: string;
  effectivePrice: number;
  computedStatus: 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'OOO';
  activeReservation?: ReservationRecord;
}

export interface OccupancySummary {
  totalRooms: number;
  availableRooms: number;
  reservedRooms: number;
  occupiedRooms: number;
  oooRooms: number;
  bookedCount: number;
  occupancyPercentage: number;
}

export interface OperationsBoardPayload {
  date: string;
  summary: OccupancySummary;
  buildings: Array<{
    id: number;
    name: string;
    code?: string;
    buildingType: string;
    displayOrder: number;
    isActive: boolean;
  }>;
  rooms: OperationsBoardRoom[];
}

export interface OperationsKanbanPayload {
  arrivals: ReservationRecord[];
  inHouse: ReservationRecord[];
  departures: ReservationRecord[];
  settled: ReservationRecord[];
}

export interface OperationsTapeChartPayload {
  startDate: string;
  daysCount: number;
  rooms: OperationsBoardRoom[];
  reservations: ReservationRecord[];
}

export interface HousekeepingTaskRecord {
  id: number;
  roomId: number;
  roomNumber: string;
  taskType: string;
  priority: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'INSPECTED';
  notes?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface HousekeepingBoardPayload {
  dirtyCount: number;
  cleanCount: number;
  occupiedCount: number;
  oooCount: number;
  tasks: HousekeepingTaskRecord[];
}

export interface FolioLineItemRecord {
  id: number;
  chargeCategory: string;
  description: string;
  unitPrice: number;
  quantity: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  postedAt: string;
}

export interface FolioPaymentRecord {
  id: number;
  amount: number;
  paymentMethod: string;
  transactionRef?: string;
  status: string;
  receiptNumber?: string;
  paymentDate: string;
}

export interface GuestFolioRecord {
  id: number;
  folioNumber: string;
  reservationId: number;
  status: 'OPEN' | 'SETTLED' | 'VOID';
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  paidAmount: number;
  balanceDue: number;
  lineItems: FolioLineItemRecord[];
  payments: FolioPaymentRecord[];
}

export interface CreateReservationInput {
  categoryId: number;
  checkInDate: string;
  checkOutDate: string;
  roomId?: number;
  guestFirstName: string;
  guestLastName: string;
  guestPhone: string;
  guestEmail?: string;
  idType?: string;
  idNumber?: string;
  specialRequests?: string[];
  bookingSource?: BookingSource;
  adultsCount?: number;
  childrenCount?: number;
  ratePerNight?: number;
  advancePayment?: number;
  paymentMethod?: PaymentMethod;
  transactionRef?: string;
  eta?: string;
  idempotencyKey?: string;
}

export interface SettlePaymentInput {
  folioId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  idempotencyKey?: string;
}
