import React, { createContext, useContext, useState } from 'react';
import type { Reservation } from '../types/hotel';

interface PrefillReservationData {
  roomNumber?: string;
  checkIn?: string;
  checkOut?: string;
  guestName?: string;
  phone?: string;
}

interface ModalContextType {
  isNewReservationOpen: boolean;
  prefillReservation: PrefillReservationData | null;
  openNewReservation: (prefill?: PrefillReservationData) => void;
  closeNewReservation: () => void;

  isFolioOpen: boolean;
  activeFolioReservation: Reservation | null;
  openFolio: (reservation: Reservation) => void;
  closeFolio: () => void;

  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;

  isShiftCloseOpen: boolean;
  openShiftClose: () => void;
  closeShiftClose: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isNewReservationOpen, setIsNewReservationOpen] = useState(false);
  const [prefillReservation, setPrefillReservation] = useState<PrefillReservationData | null>(null);

  const [isFolioOpen, setIsFolioOpen] = useState(false);
  const [activeFolioReservation, setActiveFolioReservation] = useState<Reservation | null>(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShiftCloseOpen, setIsShiftCloseOpen] = useState(false);

  const openNewReservation = (prefill?: PrefillReservationData) => {
    if (prefill) setPrefillReservation(prefill);
    else setPrefillReservation(null);
    setIsNewReservationOpen(true);
  };

  const closeNewReservation = () => {
    setIsNewReservationOpen(false);
    setPrefillReservation(null);
  };

  const openFolio = (reservation: Reservation) => {
    setActiveFolioReservation(reservation);
    setIsFolioOpen(true);
  };

  const closeFolio = () => {
    setIsFolioOpen(false);
    setActiveFolioReservation(null);
  };

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);

  const openShiftClose = () => setIsShiftCloseOpen(true);
  const closeShiftClose = () => setIsShiftCloseOpen(false);

  return (
    <ModalContext.Provider
      value={{
        isNewReservationOpen,
        prefillReservation,
        openNewReservation,
        closeNewReservation,
        isFolioOpen,
        activeFolioReservation,
        openFolio,
        closeFolio,
        isSearchOpen,
        openSearch,
        closeSearch,
        isShiftCloseOpen,
        openShiftClose,
        closeShiftClose,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
