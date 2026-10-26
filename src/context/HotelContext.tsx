import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  Room,
  Floor,
  RoomType,
  Reservation,
  ShiftNote,
  CashRegisterState,
  RoomStatus,
  LiveRoomStatus
} from '../types/hotel';
import { useRooms } from '../hooks/useRooms';
import {
  MOCK_ROOMS,
  MOCK_FLOORS,
  MOCK_ROOM_TYPES,
  MOCK_RESERVATIONS,
  MOCK_NOTES,
  INITIAL_REGISTER
} from '../data/mockData';

interface HotelContextType {
  rooms: Room[];
  floors: Floor[];
  roomTypes: RoomType[];
  reservations: Reservation[];
  shiftNotes: ShiftNote[];
  cashRegister: CashRegisterState;
  businessDate: string;
  propertyName: string;
  nightAuditPending: boolean;

  // Actions
  checkInGuest: (reservationId: string) => void;
  checkOutGuest: (reservationId: string) => void;
  updateRoomStatus: (roomId: string, status: RoomStatus) => void;
  addReservation: (newRes: Omit<Reservation, 'id'>) => Reservation;
  addBulkRooms: (floorId: string, typeId: string, startNum: number, endNum: number) => Room[];
  addFloor: (name: string) => Floor;
  addSingleRoom: (roomData: Omit<Room, 'id'>) => Room;
  deleteRoom: (roomId: string) => void;
  updateRoom: (roomId: string, updates: Partial<Room>) => void;
  addShiftNote: (text: string, author?: string) => void;
  togglePinNote: (noteId: string) => void;
  reassignRoom: (reservationId: string, newRoomNumber: string) => void;
  updatePayment: (reservationId: string, additionalAmount: number) => void;
  reassignReservation: (reservationId: string, newRoomNumber: string, shiftDays: number) => void;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export const HotelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    floors: backendFloors,
    categories: backendCategories,
    allRooms: backendRooms,
    updateRoomStatus: apiUpdateRoomStatus,
  } = useRooms();

  const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS);
  const [floors, setFloors] = useState<Floor[]>(MOCK_FLOORS);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>(MOCK_ROOM_TYPES);
  const [reservations, setReservations] = useState<Reservation[]>(MOCK_RESERVATIONS);
  const [shiftNotes, setShiftNotes] = useState<ShiftNote[]>(MOCK_NOTES);
  const [cashRegister] = useState<CashRegisterState>(INITIAL_REGISTER);
  const [businessDate] = useState<string>('Sep 24, 2026');
  const [propertyName] = useState<string>('DeskFlow — Grand Azure Hotel & Suites');
  const [nightAuditPending] = useState<boolean>(true);

  // Sync with live backend rooms, floors, and categories with bailout checks to prevent render cascades
  useEffect(() => {
    if (backendFloors && backendFloors.length > 0) {
      setFloors(prev => {
        const isSame = prev.length === backendFloors.length &&
          backendFloors.every((bf, idx) => prev[idx] && prev[idx].id === String(bf.id) && prev[idx].name === bf.name);
        if (isSame) return prev;
        return backendFloors.map(f => ({
          id: String(f.id),
          floorNumber: f.floorNumber,
          name: f.name,
        }));
      });
    }
  }, [backendFloors]);

  useEffect(() => {
    if (backendCategories && backendCategories.length > 0) {
      setRoomTypes(prev => {
        const isSame = prev.length === backendCategories.length &&
          backendCategories.every((bc, idx) => prev[idx] && prev[idx].id === String(bc.id) && prev[idx].basePrice === bc.basePrice);
        if (isSame) return prev;
        return backendCategories.map(c => ({
          id: String(c.id),
          name: c.name,
          code: c.code || '',
          basePrice: c.basePrice,
          maxAdults: c.maxAdults,
          maxChildren: c.maxChildren,
        }));
      });
    }
  }, [backendCategories]);

  useEffect(() => {
    if (backendRooms && backendRooms.length > 0) {
      setRooms(prev => {
        const isSame = prev.length === backendRooms.length &&
          backendRooms.every((br, idx) => {
            const p = prev[idx];
            if (!p) return false;
            let mappedStatus: RoomStatus = 'CLEAN';
            if (br.status === 'CLEANING') mappedStatus = 'DIRTY';
            else if (br.status === 'MAINTENANCE') mappedStatus = 'OOO';
            else if (br.status === 'OCCUPIED') mappedStatus = 'OCCUPIED';
            return p.id === String(br.id) && p.status === mappedStatus && p.floorId === String(br.floorId);
          });
        if (isSame) return prev;
        return backendRooms.map(r => {
          let mappedStatus: RoomStatus = 'CLEAN';
          if (r.status === 'CLEANING') mappedStatus = 'DIRTY';
          else if (r.status === 'MAINTENANCE') mappedStatus = 'OOO';
          else if (r.status === 'OCCUPIED') mappedStatus = 'OCCUPIED';
          else mappedStatus = 'CLEAN';

          return {
            id: String(r.id),
            roomNumber: r.roomNumber,
            floorId: String(r.floorId),
            typeId: String(r.categoryId),
            status: mappedStatus,
            isOccupied: r.status === 'OCCUPIED',
          };
        });
      });
    }
  }, [backendRooms]);

  // Add Floor
  const addFloor = (name: string): Floor => {
    const newFloor: Floor = {
      id: `fl-${floors.length + 1}`,
      floorNumber: floors.length + 1,
      name
    };
    setFloors(prev => [...prev, newFloor]);
    return newFloor;
  };

  // Add Single Room
  const addSingleRoom = (roomData: Omit<Room, 'id'>): Room => {
    const newRoom: Room = {
      ...roomData,
      id: `rm-${roomData.roomNumber}`
    };
    setRooms(prev => [...prev, newRoom]);
    return newRoom;
  };

  // Delete Room
  const deleteRoom = (roomId: string) => {
    setRooms(prev => prev.filter(r => r.id !== roomId));
  };

  // Update Room
  const updateRoom = (roomId: string, updates: Partial<Room>) => {
    setRooms(prev => prev.map(r => (r.id === roomId ? { ...r, ...updates } : r)));
  };

  // Check In Guest
  const checkInGuest = (reservationId: string) => {
    setReservations(prev =>
      prev.map(res => {
        if (res.id === reservationId) {
          // Update corresponding room
          setRooms(prevRooms =>
            prevRooms.map(rm =>
              rm.roomNumber === res.roomNumber
                ? { ...rm, isOccupied: true }
                : rm
            )
          );
          return { ...res, status: 'CHECKED_IN' };
        }
        return res;
      })
    );
  };

  // Check Out Guest
  const checkOutGuest = (reservationId: string) => {
    setReservations(prev =>
      prev.map(res => {
        if (res.id === reservationId) {
          // Update room to unoccupied and DIRTY
          setRooms(prevRooms =>
            prevRooms.map(rm =>
              rm.roomNumber === res.roomNumber
                ? { ...rm, isOccupied: false, status: 'DIRTY' }
                : rm
            )
          );
          return { ...res, status: 'CHECKED_OUT' };
        }
        return res;
      })
    );
  };

  // Housekeeping Status Toggle
  const updateRoomStatus = (roomId: string, status: RoomStatus) => {
    setRooms(prev =>
      prev.map(rm => (rm.id === roomId ? { ...rm, status } : rm))
    );

    // If numeric ID, dispatch to backend
    const numericId = Number(roomId);
    if (!Number.isNaN(numericId) && numericId > 0) {
      let liveStatus: LiveRoomStatus = 'AVAILABLE';
      if (status === 'DIRTY' || status === 'CLEANING') liveStatus = 'CLEANING';
      else if (status === 'OOO' || status === 'MAINTENANCE') liveStatus = 'MAINTENANCE';
      else if (status === 'OCCUPIED') liveStatus = 'OCCUPIED';
      else liveStatus = 'AVAILABLE';

      apiUpdateRoomStatus(numericId, liveStatus).catch(err => {
        console.error('Failed to update room status on backend:', err);
      });
    }
  };

  // Add Reservation
  const addReservation = (newRes: Omit<Reservation, 'id'>): Reservation => {
    const id = `RES-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullRes: Reservation = { ...newRes, id };

    setReservations(prev => [fullRes, ...prev]);

    if (fullRes.status === 'CHECKED_IN') {
      setRooms(prevRooms =>
        prevRooms.map(rm =>
          rm.roomNumber === fullRes.roomNumber
            ? { ...rm, isOccupied: true }
            : rm
        )
      );
    }

    return fullRes;
  };

  // Add Bulk Rooms
  const addBulkRooms = (
    floorId: string,
    typeId: string,
    startNum: number,
    endNum: number
  ): Room[] => {
    const newRooms: Room[] = [];
    for (let i = startNum; i <= endNum; i++) {
      const roomNumStr = i.toString();
      // Check if already exists
      if (!rooms.some(r => r.roomNumber === roomNumStr)) {
        newRooms.push({
          id: `rm-${roomNumStr}`,
          roomNumber: roomNumStr,
          floorId,
          typeId,
          status: 'CLEAN',
          isOccupied: false
        });
      }
    }
    setRooms(prev => [...prev, ...newRooms]);
    return newRooms;
  };

  // Add Shift Note
  const addShiftNote = (text: string, author = 'Sarah Jenkins') => {
    const newNote: ShiftNote = {
      id: `n-${Date.now()}`,
      author,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
      pinned: false
    };
    setShiftNotes(prev => [newNote, ...prev]);
  };

  // Toggle Pin Note
  const togglePinNote = (noteId: string) => {
    setShiftNotes(prev =>
      prev.map(n => (n.id === noteId ? { ...n, pinned: !n.pinned } : n))
    );
  };

  // Reassign Room
  const reassignRoom = (reservationId: string, newRoomNumber: string) => {
    setReservations(prev =>
      prev.map(res => {
        if (res.id === reservationId) {
          // Free up old room if occupied
          setRooms(prevRooms =>
            prevRooms.map(rm => {
              if (rm.roomNumber === res.roomNumber && res.status === 'CHECKED_IN') {
                return { ...rm, isOccupied: false, status: 'DIRTY' };
              }
              if (rm.roomNumber === newRoomNumber && res.status === 'CHECKED_IN') {
                return { ...rm, isOccupied: true };
              }
              return rm;
            })
          );
          return { ...res, roomNumber: newRoomNumber };
        }
        return res;
      })
    );
  };

  // Reassign Reservation (Room + Date Shift)
  const reassignReservation = (reservationId: string, newRoomNumber: string, shiftDays: number) => {
    setReservations(prev =>
      prev.map(res => {
        if (res.id === reservationId) {
          const oldIn = new Date(res.checkIn);
          const oldOut = new Date(res.checkOut);
          
          const newIn = new Date(oldIn);
          newIn.setDate(newIn.getDate() + shiftDays);
          
          const newOut = new Date(oldOut);
          newOut.setDate(newOut.getDate() + shiftDays);
          
          const toISO = (d: Date) => d.toISOString().split('T')[0];
          
          // Free up old room if currently checked in (simplified logic for tape chart)
          if (res.roomNumber !== newRoomNumber) {
            setRooms(prevRooms =>
              prevRooms.map(rm => {
                if (rm.roomNumber === res.roomNumber && res.status === 'CHECKED_IN') return { ...rm, isOccupied: false, status: 'DIRTY' };
                if (rm.roomNumber === newRoomNumber && res.status === 'CHECKED_IN') return { ...rm, isOccupied: true };
                return rm;
              })
            );
          }
          
          return { ...res, roomNumber: newRoomNumber, checkIn: toISO(newIn), checkOut: toISO(newOut) };
        }
        return res;
      })
    );
  };

  // Update Payment Balance
  const updatePayment = (reservationId: string, additionalAmount: number) => {
    setReservations(prev =>
      prev.map(res => {
        if (res.id === reservationId) {
          return { ...res, paidAmount: res.paidAmount + additionalAmount };
        }
        return res;
      })
    );
  };

  return (
    <HotelContext.Provider
      value={{
        rooms,
        floors,
        roomTypes,
        reservations,
        shiftNotes,
        cashRegister,
        businessDate,
        propertyName,
        nightAuditPending,
        checkInGuest,
        checkOutGuest,
        updateRoomStatus,
        addReservation,
        addBulkRooms,
        addFloor,
        addSingleRoom,
        deleteRoom,
        updateRoom,
        addShiftNote,
        togglePinNote,
        reassignRoom,
        reassignReservation,
        updatePayment
      }}
    >
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = () => {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
};
