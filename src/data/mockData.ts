import type { RoomType, Floor, Room, Reservation, ShiftNote, CashRegisterState } from '../types/hotel';

export const MOCK_ROOM_TYPES: RoomType[] = [
  { id: "rt-1", name: "Deluxe King", code: "DLX-K", basePrice: 4200, maxAdults: 2, maxChildren: 1 },
  { id: "rt-2", name: "Executive Suite", code: "EXE-S", basePrice: 7500, maxAdults: 3, maxChildren: 2 },
  { id: "rt-3", name: "Standard Twin", code: "STD-T", basePrice: 2900, maxAdults: 2, maxChildren: 0 },
];

export const MOCK_FLOORS: Floor[] = [
  { id: "fl-1", floorNumber: 1, name: "Ground Floor" },
  { id: "fl-2", floorNumber: 2, name: "First Floor - Ocean Wing" },
  { id: "fl-3", floorNumber: 3, name: "Second Floor - Terrace Wing" },
];

export const MOCK_ROOMS: Room[] = [
  { id: "rm-101", roomNumber: "101", floorId: "fl-1", typeId: "rt-3", status: "CLEAN", isOccupied: false },
  { id: "rm-102", roomNumber: "102", floorId: "fl-1", typeId: "rt-3", status: "DIRTY", isOccupied: false },
  { id: "rm-103", roomNumber: "103", floorId: "fl-1", typeId: "rt-1", status: "CLEAN", isOccupied: true },
  { id: "rm-201", roomNumber: "201", floorId: "fl-2", typeId: "rt-1", status: "IN_PROGRESS", isOccupied: false },
  { id: "rm-202", roomNumber: "202", floorId: "fl-2", typeId: "rt-1", status: "CLEAN", isOccupied: true },
  { id: "rm-203", roomNumber: "203", floorId: "fl-2", typeId: "rt-2", status: "OOO", isOccupied: false, notes: "AC Servicing" },
  { id: "rm-301", roomNumber: "301", floorId: "fl-3", typeId: "rt-2", status: "CLEAN", isOccupied: false },
  { id: "rm-302", roomNumber: "302", floorId: "fl-3", typeId: "rt-2", status: "CLEAN", isOccupied: true },
];

export const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: "RES-8941",
    guestName: "Arjun Verma",
    phone: "+91 98450 11234",
    email: "arjun.verma@example.com",
    roomNumber: "103",
    roomType: "Deluxe King",
    checkIn: "2026-09-24",
    checkOut: "2026-09-27",
    eta: "11:30 AM",
    status: "CHECKED_IN",
    totalAmount: 12600,
    paidAmount: 12600,
    source: "Direct Walk-in",
    idVerified: true,
    idType: "Aadhaar",
    idNumber: "4521-8890-1123",
    adults: 2,
    children: 0,
    specialRequests: ["High Floor", "Late Checkout"]
  },
  {
    id: "RES-8942",
    guestName: "Priya Sundaram",
    phone: "+91 98111 88321",
    email: "priya.s@techcorp.in",
    roomNumber: "201",
    roomType: "Deluxe King",
    checkIn: "2026-09-24",
    checkOut: "2026-09-26",
    eta: "02:00 PM",
    status: "RESERVED",
    totalAmount: 8400,
    paidAmount: 2000,
    source: "Booking.com",
    idVerified: false,
    idType: "Passport",
    idNumber: "Z9810293",
    adults: 1,
    children: 0,
    specialRequests: ["Quiet Room"]
  },
  {
    id: "RES-8943",
    guestName: "David Miller",
    phone: "+44 7700 900122",
    email: "miller.d@travelnet.co.uk",
    roomNumber: "202",
    roomType: "Deluxe King",
    checkIn: "2026-09-21",
    checkOut: "2026-09-24",
    eta: "11:00 AM",
    status: "CHECKED_IN",
    totalAmount: 12600,
    paidAmount: 8000,
    source: "Agoda",
    idVerified: true,
    idType: "Passport",
    idNumber: "GB771029A",
    adults: 2,
    children: 1,
    specialRequests: ["Extra Towels", "Airport Shuttle"]
  },
  {
    id: "RES-8944",
    guestName: "Meera Nair",
    phone: "+91 99201 54321",
    email: "meera.nair@outlook.com",
    roomNumber: "302",
    roomType: "Executive Suite",
    checkIn: "2026-09-23",
    checkOut: "2026-09-25",
    eta: "01:00 PM",
    status: "CHECKED_IN",
    totalAmount: 15000,
    paidAmount: 15000,
    source: "Direct Web",
    idVerified: true,
    idType: "Driving License",
    idNumber: "KA01-2022-9012",
    adults: 2,
    children: 1,
    specialRequests: ["Ocean View"]
  },
  {
    id: "RES-8945",
    guestName: "Rahul Khanna",
    phone: "+91 98765 43210",
    email: "rahul.khanna@gmail.com",
    roomNumber: "301",
    roomType: "Executive Suite",
    checkIn: "2026-09-26",
    checkOut: "2026-09-29",
    eta: "03:00 PM",
    status: "RESERVED",
    totalAmount: 22500,
    paidAmount: 5000,
    source: "MakeMyTrip",
    idVerified: false,
    adults: 2,
    children: 0,
    specialRequests: ["High Floor", "Airport Transfer"]
  },
  {
    id: "RES-8946",
    guestName: "Sneha Pillai",
    phone: "+91 91234 56789",
    email: "sneha.p@infotech.co",
    roomNumber: "102",
    roomType: "Standard Twin",
    checkIn: "2026-09-24",
    checkOut: "2026-09-25",
    eta: "12:00 PM",
    status: "CANCELLED",
    totalAmount: 2900,
    paidAmount: 0,
    source: "Booking.com",
    idVerified: false,
    adults: 2,
    children: 0,
    specialRequests: []
  }
];

export const MOCK_NOTES: ShiftNote[] = [
  {
    id: "n-1",
    author: "Sarah Jenkins",
    time: "09:15 AM",
    text: "Guest in 202 requested extra feather pillows by 4:00 PM. Housekeeping notified.",
    pinned: true
  },
  {
    id: "n-2",
    author: "Rohan Gupta",
    time: "07:30 AM",
    text: "Keycard encoder in Station B had a paper jam. Cleaned and reset. Working fine now.",
    pinned: false
  }
];

export const INITIAL_REGISTER: CashRegisterState = {
  startingFloat: 3250,
  cashCollected: 5200,
  cardSettled: 12400,
  upiCollected: 3400,
  activeReceptionist: "Sarah Jenkins"
};
