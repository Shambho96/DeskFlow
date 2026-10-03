export type RoomStatus = 'CLEAN' | 'DIRTY' | 'IN_PROGRESS' | 'OOO';

export type ReservationStatus = 'RESERVED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';

export interface RoomType {
  id: string;
  name: string;
  code: string;
  basePrice: number;
  maxAdults: number;
  maxChildren: number;
}

export interface Floor {
  id: string;
  floorNumber: number;
  name: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  floorId: string;
  typeId: string;
  status: RoomStatus;
  isOccupied: boolean;
  notes?: string;
}

export interface Reservation {
  id: string;
  guestName: string;
  phone: string;
  email: string;
  roomNumber: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  eta: string;
  status: ReservationStatus;
  totalAmount: number;
  paidAmount: number;
  source: string;
  idVerified: boolean;
  idType?: string;
  idNumber?: string;
  specialRequests?: string[];
  adults?: number;
  children?: number;
}

export interface ShiftNote {
  id: string;
  author: string;
  time: string;
  text: string;
  pinned: boolean;
}

export interface CashRegisterState {
  startingFloat: number;
  cashCollected: number;
  cardSettled: number;
  upiCollected: number;
  activeReceptionist: string;
}
