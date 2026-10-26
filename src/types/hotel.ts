export type LiveRoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE';
export type LegacyRoomStatus = 'CLEAN' | 'DIRTY' | 'IN_PROGRESS' | 'OOO';
export type RoomStatus = LiveRoomStatus | LegacyRoomStatus;

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

// ─── Backend GraphQL Entity Types ──────────────────────────────
export interface BackendUtility {
  id: number;
  name: string;
  utilityType: string;
  status: 'OPEN' | 'CLOSED' | 'CLEANING' | 'MAINTENANCE';
  buildingId: number;
  buildingName?: string | null;
  floorId: number | null;
  capacity: number | null;
  operatingHours: string | null;
  isBookable: boolean;
  rentalPrice: number | null;
  amenities: string[];
  isActive: boolean;
}

export interface BackendRoom {
  id: number;
  roomNumber: string;
  status: LiveRoomStatus;
  floorId: number;
  floorName: string;
  floorNumber?: number | null;
  buildingId?: number | null;
  buildingName?: string | null;
  categoryId: number | null;
  categoryName: string;
  basePrice: number;
  amenities?: string[];
  customName?: string | null;
  customPrice?: number | null;
  customAmenities?: string[];
  isActive: boolean;
}

export interface BackendFloor {
  id: number;
  floorNumber: number;
  name: string;
  buildingId?: number | null;
  buildingName?: string | null;
  isActive: boolean;
  roomCount: number;
  rooms: BackendRoom[];
  utilities?: BackendUtility[];
}

export interface BackendRoomCategory {
  id: number;
  name: string;
  code: string | null;
  basePrice: number;
  maxAdults: number;
  maxChildren: number;
  amenities: string[];
  isActive: boolean;
  roomCount: number;
}

export interface BackendBuilding {
  id: number;
  name: string;
  code: string | null;
  buildingType: string;
  displayOrder: number;
  isActive: boolean;
  floorCount: number;
  roomCount: number;
  utilityCount: number;
}

export interface CampusBuilding {
  building: BackendBuilding;
  totalFloors: number;
  totalRooms: number;
  floors: BackendFloor[];
  utilities: BackendUtility[];
}

export interface CampusLayoutPayload {
  status: string;
  totalBuildings: number;
  totalFloors: number;
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  cleaningRooms: number;
  maintenanceRooms: number;
  totalUtilities: number;
  buildings: CampusBuilding[];
}

export interface HotelLayoutPayload {
  status: string;
  totalFloors: number;
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  cleaningRooms: number;
  maintenanceRooms: number;
  floors: BackendFloor[];
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
  tags?: string[];
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
