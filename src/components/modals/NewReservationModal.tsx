import React, { useEffect, useRef, useState } from 'react';
import type { CountryCode } from 'libphonenumber-js';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Key,
  AlertCircle,
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { useRooms } from '../../hooks/useRooms';
import { useOperations } from '../../hooks/useOperations';
import { useHotelPreferences } from '../../hooks/useHotelPreferences';
import { useModal } from '../../context/ModalContext';
import { getPhoneInputParts, normalizePhoneNumber } from '../../lib/phone';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import type { BookingSource, PaymentMethod } from '../../types/operations';
import {
  normalizeIdType,
  normalizeBookingSource,
  generateReservationIdempotencyKey,
  calculateStayFinancials,
  type FoundGuestProfile,
} from './reservation/reservationTypes';
import { Step1GuestProfile } from './reservation/Step1GuestProfile';
import { Step2StayRoomSelect } from './reservation/Step2StayRoomSelect';
import { Step3BillingSettle } from './reservation/Step3BillingSettle';

export const NewReservationModal: React.FC = () => {
  const { isNewReservationOpen, closeNewReservation, prefillReservation } = useModal();
  const { roomTypes: fallbackRoomTypes, addReservation, reservations: hotelReservations } = useHotel();
  const { categories, allRooms } = useRooms();

  const [todayStr] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State - Dates & Room
  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  // Active operations hook for mutations, live room availability & guest lookup
  const { createReservation, checkInGuest, tapeChart, lookupGuestByPhone } = useOperations(checkIn);
  const { activeSpecialRequests, activeGuestTags } = useHotelPreferences();
  const [customTagInput, setCustomTagInput] = useState('');

  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  // Category & Room Selection
  const activeCategories = categories.length > 0 ? categories : fallbackRoomTypes.map(rt => ({
    id: Number(rt.id) || 1,
    name: rt.name,
    code: rt.code,
    basePrice: rt.basePrice,
    maxAdults: rt.maxAdults,
    maxChildren: rt.maxChildren,
    amenities: [],
    isActive: true,
    roomCount: 1
  }));

  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(() => activeCategories[0]?.id || 1);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string>('');

  // Step 1 State - Guest Details
  const [phone, setPhone] = useState('');
  const [phoneCountry, setPhoneCountry] = useState<CountryCode>('IN');
  const [phoneError, setPhoneError] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [idType, setIdType] = useState('Aadhaar');
  const [idNumber, setIdNumber] = useState('');
  const [bookingSource, setBookingSource] = useState<BookingSource>('WALKIN');
  const [specialRequests, setSpecialRequests] = useState<string[]>([]);

  // Target Audience & Origin Fields
  const [purposeOfVisit, setPurposeOfVisit] = useState<string>('LEISURE');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [stateRegion, setStateRegion] = useState<string>('');

  // Debounced CRM Guest Lookup State
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching' | 'found' | 'not_found'>('idle');
  const [foundGuest, setFoundGuest] = useState<FoundGuestProfile | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Step 3 State - Billing & Settlement
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [paidDeposit, setPaidDeposit] = useState<number>(0);

  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (trimmed && !specialRequests.includes(trimmed)) {
      setSpecialRequests(prev => [...prev, trimmed]);
      setCustomTagInput('');
    }
  };

  // Prefill handling from board / tape chart
  useEffect(() => {
    if (prefillReservation && isNewReservationOpen) {
      if (prefillReservation.roomNumber) setSelectedRoomNumber(prefillReservation.roomNumber);
      if (prefillReservation.checkIn) setCheckIn(prefillReservation.checkIn);
      if (prefillReservation.checkOut) setCheckOut(prefillReservation.checkOut);
      if (prefillReservation.guestName) {
        const parts = prefillReservation.guestName.split(' ');
        setFirstName(parts[0] || '');
        setLastName(parts.slice(1).join(' ') || 'Guest');
      }
      if (prefillReservation.phone) {
        const phoneParts = getPhoneInputParts(prefillReservation.phone);
        setPhone(phoneParts.value);
        setPhoneCountry(phoneParts.country);
      }
    }
  }, [prefillReservation, isNewReservationOpen]);

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Ensure a category is selected
  const selectedCategory = activeCategories.find(c => c.id === selectedCategoryId) || activeCategories[0];
  const nightlyRate = selectedCategory?.basePrice || 2500;
  const { nights, subtotal, gstTax, grandTotal } = calculateStayFinancials(checkIn, checkOut, nightlyRate);

  const handleCheckInChange = (newDate: string) => {
    setCheckIn(newDate);
    const inD = new Date(newDate);
    const outD = new Date(checkOut);
    if (outD <= inD) {
      const nextD = new Date(inD);
      nextD.setDate(nextD.getDate() + 1);
      const yr = nextD.getFullYear();
      const mo = String(nextD.getMonth() + 1).padStart(2, '0');
      const dy = String(nextD.getDate()).padStart(2, '0');
      setCheckOut(`${yr}-${mo}-${dy}`);
    }
  };

  const handleCheckOutChange = (newDate: string) => {
    const inD = new Date(checkIn);
    const outD = new Date(newDate);
    if (outD <= inD) {
      const nextD = new Date(inD);
      nextD.setDate(nextD.getDate() + 1);
      const yr = nextD.getFullYear();
      const mo = String(nextD.getMonth() + 1).padStart(2, '0');
      const dy = String(nextD.getDate()).padStart(2, '0');
      setCheckOut(`${yr}-${mo}-${dy}`);
    } else {
      setCheckOut(newDate);
    }
  };

  const setStayNights = (n: number) => {
    const inD = new Date(checkIn);
    const outD = new Date(inD);
    outD.setDate(outD.getDate() + n);
    const yr = outD.getFullYear();
    const mo = String(outD.getMonth() + 1).padStart(2, '0');
    const dy = String(outD.getDate()).padStart(2, '0');
    setCheckOut(`${yr}-${mo}-${dy}`);
  };

  // Check room availability for stay dates [checkIn, checkOut)
  const getRoomAvailability = (roomId: number) => {
    const room = allRooms.find(r => r.id === roomId);
    if (room?.status === 'MAINTENANCE') {
      return { isAvailable: false, reason: 'Maintenance' };
    }

    const reservationsList = tapeChart?.reservations || [];
    const conflict = reservationsList.find(res => {
      if (res.roomId !== roomId) return false;
      if (res.status === 'CANCELLED' || res.status === 'CHECKED_OUT') return false;
      return !(res.checkOutDate <= checkIn || res.checkInDate >= checkOut);
    });

    if (conflict) {
      return {
        isAvailable: false,
        reason: `Booked (${conflict.checkInDate.slice(5)} → ${conflict.checkOutDate.slice(5)})`
      };
    }

    return { isAvailable: true, reason: 'Available' };
  };

  const resetForm = () => {
    setStep(1);
    setPhone('');
    setPhoneError('');
    setFirstName('');
    setLastName('');
    setEmail('');
    setIdType('Aadhaar');
    setIdNumber('');
    setSpecialRequests([]);
    setBookingSource('WALKIN');
    setPurposeOfVisit('LEISURE');
    setDateOfBirth('');
    setCity('');
    setStateRegion('');
    setSearchStatus('idle');
    setFoundGuest(null);
    setErrorMessage(null);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  };

  // Debounced Phone Change & CRM Auto-Fill
  const handlePhoneChange = (val: string, country: CountryCode) => {
    setPhone(val);
    setPhoneCountry(country);
    setPhoneError('');

    if (foundGuest) {
      setFoundGuest(null);
      setFirstName('');
      setLastName('');
      setEmail('');
      setIdType('Aadhaar');
      setIdNumber('');
      setSpecialRequests([]);
      setBookingSource('WALKIN');
      setPurposeOfVisit('LEISURE');
      setDateOfBirth('');
      setCity('');
      setStateRegion('');
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const rawDigits = val.replace(/\D/g, '');
    if (rawDigits.length < 7) {
      setSearchStatus('idle');
      return;
    }

    setSearchStatus('searching');

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const cleanDigits = val.replace(/\D/g, '');
        const normalized = normalizePhoneNumber(val, country) || val;

        let guest = await lookupGuestByPhone(normalized);
        if (!guest && normalized !== cleanDigits) {
          guest = await lookupGuestByPhone(cleanDigits);
        }

        if (!guest && hotelReservations && hotelReservations.length > 0) {
          const matchedRes = hotelReservations.find(r => {
            if (!r.phone) return false;
            const rDigits = r.phone.replace(/\D/g, '');
            return (
              rDigits.length >= 7 &&
              (rDigits.endsWith(cleanDigits) || cleanDigits.endsWith(rDigits) || r.phone === normalized)
            );
          });

          if (matchedRes) {
            const nameParts = (matchedRes.guestName || '').trim().split(' ');
            guest = {
              id: 0,
              firstName: nameParts[0] || '',
              lastName: nameParts.slice(1).join(' ') || '',
              fullName: matchedRes.guestName || '',
              phone: matchedRes.phone,
              email: matchedRes.email || '',
              idType: matchedRes.idType || 'Aadhaar',
              idNumber: matchedRes.idNumber || '',
              vipStatus: matchedRes.tags?.includes('VIP') ? 'VIP' : undefined,
              nationality: 'Indian',
              bookingSource: normalizeBookingSource(matchedRes.source),
              specialRequests: matchedRes.specialRequests || matchedRes.tags || []
            };
          }
        }

        if (guest) {
          const guestName = guest.fullName || `${guest.firstName} ${guest.lastName}`.trim();
          const retrievedIdType = guest.idType || (guest as any).id_type;
          const retrievedIdNumber = guest.idNumber || (guest as any).id_number;
          const retrievedBookingSource = guest.bookingSource || (guest as any).booking_source;
          const retrievedSpecialReqs: string[] = Array.isArray(guest.specialRequests)
            ? guest.specialRequests
            : Array.isArray((guest as any).special_requests)
              ? (guest as any).special_requests
              : [];

          setFoundGuest({
            name: guestName,
            phone: guest.phone,
            email: guest.email,
            idType: retrievedIdType,
            idNumber: retrievedIdNumber,
            vipStatus: guest.vipStatus,
            bookingSource: retrievedBookingSource,
            specialRequests: retrievedSpecialReqs,
            dateOfBirth: guest.dateOfBirth,
            city: guest.city,
            state: guest.state,
            purposeOfVisit: guest.purposeOfVisit,
          });
          setSearchStatus('found');
          if (guest.firstName) setFirstName(guest.firstName);
          if (guest.lastName) setLastName(guest.lastName);
          if (guest.email) setEmail(guest.email);
          if (retrievedIdType) setIdType(normalizeIdType(retrievedIdType));
          if (retrievedIdNumber !== undefined && retrievedIdNumber !== null) {
            setIdNumber(String(retrievedIdNumber));
          }
          if (retrievedBookingSource) setBookingSource(normalizeBookingSource(retrievedBookingSource));
          if (retrievedSpecialReqs.length > 0) {
            setSpecialRequests(retrievedSpecialReqs);
          }
          if (guest.dateOfBirth) {
            setDateOfBirth(String(guest.dateOfBirth).slice(0, 10));
          }
          if (guest.city) setCity(guest.city);
          if (guest.state) setStateRegion(guest.state);
          if (guest.purposeOfVisit) setPurposeOfVisit(guest.purposeOfVisit);
        } else {
          setFoundGuest(null);
          setSearchStatus('not_found');
        }
      } catch (err) {
        console.warn('Guest lookup error:', err);
        setFoundGuest(null);
        setSearchStatus('not_found');
      }
    }, 400);
  };

  const toggleSpecialRequest = (tag: string) => {
    setSpecialRequests(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleFinish = async (isInstantCheckIn: boolean) => {
    setErrorMessage(null);
    const normalizedPhone = phone.trim() ? normalizePhoneNumber(phone, phoneCountry) : undefined;
    if (phone.trim() && !normalizedPhone) {
      setPhoneError('Enter a valid phone number for selected country.');
      setStep(1);
      return;
    }

    if (!firstName.trim()) {
      setErrorMessage('Guest first name is required.');
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      const matchedRoom = allRooms.find(r => r.roomNumber === selectedRoomNumber);
      if (matchedRoom) {
        const avail = getRoomAvailability(matchedRoom.id);
        if (!avail.isAvailable) {
          setErrorMessage(`Room ${selectedRoomNumber} is ${avail.reason.toLowerCase()} for the selected dates (${checkIn} to ${checkOut}). Please select an available room.`);
          setStep(2);
          setIsSubmitting(false);
          return;
        }
      }
      const roomId = matchedRoom?.id;
      const idempotencyKey = generateReservationIdempotencyKey();

      const createdRes = await createReservation({
        categoryId: selectedCategory.id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        roomId: roomId || undefined,
        guestFirstName: firstName.trim(),
        guestLastName: lastName.trim() || 'Guest',
        guestPhone: normalizedPhone || phone || '+91 99000 00000',
        guestEmail: email || undefined,
        idType: idType,
        idNumber: idNumber || undefined,
        specialRequests: specialRequests,
        bookingSource: bookingSource,
        adultsCount: adults,
        childrenCount: children,
        ratePerNight: nightlyRate,
        advancePayment: paidDeposit,
        paymentMethod: paymentMethod,
        idempotencyKey,
        purposeOfVisit: purposeOfVisit || undefined,
        dateOfBirth: dateOfBirth || undefined,
        city: city.trim() || undefined,
        state: stateRegion.trim() || undefined,
      });

      if (isInstantCheckIn && createdRes?.id) {
        await checkInGuest(createdRes.id);
      }

      addReservation({
        guestName: `${firstName.trim()} ${lastName.trim()}`.trim() || 'Walk-in Guest',
        phone: normalizedPhone || phone || '+91 99000 00000',
        email: email || 'guest@example.com',
        roomNumber: selectedRoomNumber || '101',
        roomType: selectedCategory.name,
        checkIn,
        checkOut,
        eta: '12:00 PM',
        status: isInstantCheckIn ? 'CHECKED_IN' : 'RESERVED',
        totalAmount: grandTotal,
        paidAmount: paidDeposit,
        source: bookingSource,
        idVerified: true,
        idType,
        idNumber,
        specialRequests,
        adults,
        children
      });

      resetForm();
      closeNewReservation();
    } catch (err: any) {
      console.error('Reservation creation failed:', err);
      setErrorMessage(err.message || 'Failed to create reservation. Please verify room availability.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isNewReservationOpen} onOpenChange={open => { if (!open) { resetForm(); closeNewReservation(); } }}>
      <DialogContent className="max-w-2xl bg-[var(--card)] text-[var(--card-foreground)] border-[var(--border)] p-0 overflow-hidden shadow-2xl">
        {/* Stepper Header */}
        <div className="p-5 bg-[var(--muted)]/60 border-b border-[var(--border)]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-lg font-bold">
              <span className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[var(--primary)]" />
                Create Direct Booking
              </span>
              <span className="text-xs font-mono font-normal text-[var(--muted-foreground)]">
                Step {step} of 3
              </span>
            </DialogTitle>
          </DialogHeader>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { num: 1, label: 'Guest Profile' },
              { num: 2, label: 'Stay & Room' },
              { num: 3, label: 'Billing & Settle' }
            ].map(s => (
              <div
                key={s.num}
                className={cn(
                  'flex items-center gap-2 p-2 rounded-xl text-xs font-semibold border transition-all',
                  step === s.num
                    ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs'
                    : step > s.num
                      ? 'bg-[var(--primary)]/15 text-[var(--primary)] border-[var(--primary)]/30'
                      : 'bg-[var(--background)] text-[var(--muted-foreground)] border-[var(--border)]'
                )}
              >
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                  {s.num}
                </span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Error notification banner */}
        {errorMessage && (
          <div className="m-4 mb-0 p-3 rounded-xl bg-[var(--destructive)]/15 border border-[var(--destructive)]/30 text-[var(--destructive)] text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {step === 1 && (
            <Step1GuestProfile
              phone={phone}
              phoneCountry={phoneCountry}
              phoneError={phoneError}
              onPhoneChange={handlePhoneChange}
              searchStatus={searchStatus}
              foundGuest={foundGuest}
              bookingSource={bookingSource}
              setBookingSource={setBookingSource}
              firstName={firstName}
              setFirstName={setFirstName}
              lastName={lastName}
              setLastName={setLastName}
              email={email}
              setEmail={setEmail}
              idType={idType}
              setIdType={setIdType}
              idNumber={idNumber}
              setIdNumber={setIdNumber}
              purposeOfVisit={purposeOfVisit}
              setPurposeOfVisit={setPurposeOfVisit}
              dateOfBirth={dateOfBirth}
              setDateOfBirth={setDateOfBirth}
              city={city}
              setCity={setCity}
              stateRegion={stateRegion}
              setStateRegion={setStateRegion}
              specialRequests={specialRequests}
              toggleSpecialRequest={toggleSpecialRequest}
              activeGuestTags={activeGuestTags}
              activeSpecialRequests={activeSpecialRequests}
              customTagInput={customTagInput}
              setCustomTagInput={setCustomTagInput}
              handleAddCustomTag={handleAddCustomTag}
            />
          )}

          {step === 2 && (
            <Step2StayRoomSelect
              checkIn={checkIn}
              checkOut={checkOut}
              nights={nights}
              onCheckInChange={handleCheckInChange}
              onCheckOutChange={handleCheckOutChange}
              onSetStayNights={setStayNights}
              adults={adults}
              setAdults={setAdults}
              children={children}
              setChildren={setChildren}
              activeCategories={activeCategories}
              selectedCategoryId={selectedCategoryId}
              onSelectCategoryId={setSelectedCategoryId}
              allRooms={allRooms}
              selectedRoomNumber={selectedRoomNumber}
              onSelectRoomNumber={setSelectedRoomNumber}
              getRoomAvailability={getRoomAvailability}
            />
          )}

          {step === 3 && (
            <Step3BillingSettle
              categoryName={selectedCategory?.name}
              nights={nights}
              selectedRoomNumber={selectedRoomNumber}
              bookingSource={bookingSource}
              purposeOfVisit={purposeOfVisit}
              city={city}
              stateRegion={stateRegion}
              nightlyRate={nightlyRate}
              subtotal={subtotal}
              gstTax={gstTax}
              grandTotal={grandTotal}
              specialRequests={specialRequests}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              paidDeposit={paidDeposit}
              setPaidDeposit={setPaidDeposit}
            />
          )}
        </div>

        {/* Stepper Footer Buttons */}
        <div className="p-4 bg-[var(--muted)]/60 border-t border-[var(--border)] flex items-center justify-between">
          {step > 1 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep((step - 1) as any)}
              disabled={isSubmitting}
              className="gap-1 rounded-xl cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={closeNewReservation} disabled={isSubmitting} className="cursor-pointer">
              Cancel
            </Button>
          )}

          <div className="flex gap-2">
            {step < 3 ? (
              <Button
                size="sm"
                className="bg-[var(--primary)] text-white gap-1 rounded-xl font-bold cursor-pointer"
                onClick={() => setStep((step + 1) as any)}
              >
                Continue <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFinish(false)}
                  disabled={isSubmitting}
                  className="rounded-xl font-semibold cursor-pointer"
                >
                  Save as Reserved
                </Button>
                <Button
                  size="sm"
                  className="bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] gap-1.5 font-bold rounded-xl shadow-md cursor-pointer"
                  onClick={() => handleFinish(true)}
                  disabled={isSubmitting}
                >
                  <Key className="w-4 h-4" /> {isSubmitting ? 'Processing...' : 'Instant Check-In'}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
