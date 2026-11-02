import React, { useEffect, useRef, useState } from 'react';
import type { CountryCode } from 'libphonenumber-js';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Key,
  Sparkles,
  AlertCircle,
  Loader2,
  CheckCircle2,
  UserCheck,
  UserPlus
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { useRooms } from '../../hooks/useRooms';
import { useOperations } from '../../hooks/useOperations';
import { useModal } from '../../context/ModalContext';
import { getPhoneInputParts, normalizePhoneNumber } from '../../lib/phone';
import { cn, formatCurrency } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { PhoneNumberInput } from '../ui/PhoneNumberInput';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/Select';
import type { BookingSource, PaymentMethod } from '../../types/operations';

const normalizeIdType = (val?: string) => {
  if (!val) return 'Aadhaar';
  const lower = val.toLowerCase();
  if (lower.includes('aadhaar')) return 'Aadhaar';
  if (lower.includes('passport')) return 'Passport';
  if (lower.includes('driving')) return 'Driving License';
  if (lower.includes('voter')) return 'Voter ID';
  if (lower.includes('pan')) return 'PAN';
  return val;
};

const normalizeBookingSource = (val?: string): BookingSource => {
  if (!val) return 'WALKIN';
  const upper = val.toUpperCase();
  if (['WALKIN', 'DIRECT', 'WHATSAPP', 'WEBSITE', 'OTHER'].includes(upper)) {
    return upper as BookingSource;
  }
  return 'WALKIN';
};

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

  // Debounced CRM Guest Lookup State
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching' | 'found' | 'not_found'>('idle');
  const [foundGuest, setFoundGuest] = useState<{
    name: string;
    phone: string;
    email?: string;
    idType?: string;
    idNumber?: string;
    vipStatus?: string;
    bookingSource?: string;
    specialRequests?: string[];
  } | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Step 3 State - Billing & Settlement
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [paidDeposit, setPaidDeposit] = useState<number>(0);

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

  // Calculate nights and financial summary
  const nights = Math.max(
    1,
    Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    ) || 1
  );

  const nightlyRate = selectedCategory?.basePrice || 2500;
  const subtotal = nightlyRate * nights;
  const gstRate = nightlyRate >= 7500 ? 0.18 : 0.12;
  const gstTax = Math.round(subtotal * gstRate);
  const grandTotal = subtotal + gstTax;

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

    // If a guest was previously auto-filled and phone is modified, clear existing data
    if (foundGuest) {
      setFoundGuest(null);
      setFirstName('');
      setLastName('');
      setEmail('');
      setIdType('Aadhaar');
      setIdNumber('');
      setSpecialRequests([]);
      setBookingSource('WALKIN');
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const rawDigits = val.replace(/\D/g, '');

    // Need at least 7 digits to initiate lookup
    if (rawDigits.length < 7) {
      setSearchStatus('idle');
      return;
    }

    setSearchStatus('searching');

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const cleanDigits = val.replace(/\D/g, '');
        const normalized = normalizePhoneNumber(val, country) || val;

        // 1. Primary lookup via backend GraphQL API
        let guest = await lookupGuestByPhone(normalized);
        if (!guest && normalized !== cleanDigits) {
          guest = await lookupGuestByPhone(cleanDigits);
        }

        // 2. Fallback lookup in local hotel reservations
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
            specialRequests: retrievedSpecialReqs
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
        } else {
          // New guest: keep fields blank as requested
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

  // Submit Handler
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
      // Find room entity and validate stay availability
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

      // Idempotency Key: UUIDv4
      const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `idemp-res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      // 1. Call Backend GraphQL Mutation with direct booking source and idempotency
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
        idempotencyKey
      });

      // 2. If Instant Check-in requested
      if (isInstantCheckIn && createdRes?.id) {
        await checkInGuest(createdRes.id);
      }

      // 3. Sync to legacy context for fallback safety
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

      // Close modal and reset
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
          {/* STEP 1: GUEST PROFILE & DIRECT CHANNEL */}
          {step === 1 && (
            <div className="space-y-4 text-left">
              {/* Dynamic CRM Status Banner */}
              {searchStatus === 'searching' && (
                <div className="p-3 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/25 text-xs flex items-center justify-between transition-all">
                  <span className="text-[var(--primary)] font-semibold flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    Searching guest CRM database...
                  </span>
                  <span className="text-[10px] text-[var(--muted-foreground)] font-mono">Debounced lookup</span>
                </div>
              )}

              {searchStatus === 'found' && foundGuest && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs flex items-center justify-between transition-all">
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    Returning Guest: {foundGuest.name}
                    {foundGuest.vipStatus && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                        {foundGuest.vipStatus}
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">Auto-Filled</span>
                </div>
              )}

              {searchStatus === 'not_found' && (
                <div className="p-3 rounded-xl bg-[var(--muted)]/60 border border-[var(--border)] text-xs flex items-center justify-between transition-all">
                  <span className="text-[var(--foreground)] font-medium flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-[var(--muted-foreground)] shrink-0" />
                    New Guest Profile
                  </span>
                  <span className="text-[10px] text-[var(--muted-foreground)]">Please enter details below</span>
                </div>
              )}

              {searchStatus === 'idle' && (
                <div className="p-3 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-xs flex items-center justify-between">
                  <span className="text-[var(--primary)] font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Guest CRM & Direct Channels
                  </span>
                  <span className="text-[10px] text-[var(--muted-foreground)]">Enter phone to auto-fetch existing guest</span>
                </div>
              )}

              {/* Row 1: Phone Number (CRM Lookup) & Direct Booking Source */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">
                    Phone Number
                  </label>
                  <PhoneNumberInput
                    value={phone}
                    country={phoneCountry}
                    onChange={handlePhoneChange}
                    placeholder="98765 43210"
                  />
                  {phoneError ? (
                    <p className="mt-1 text-[10px] font-semibold text-[var(--destructive)]">{phoneError}</p>
                  ) : searchStatus === 'searching' ? (
                    <p className="mt-1 text-[10px] text-[var(--primary)] flex items-center gap-1 font-medium">
                      <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                      Checking CRM directory...
                    </p>
                  ) : searchStatus === 'found' ? (
                    <p className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      Profile, ID & preferences pre-filled
                    </p>
                  ) : searchStatus === 'not_found' ? (
                    <p className="mt-1 text-[10px] text-[var(--muted-foreground)] flex items-center gap-1 font-medium">
                      <UserPlus className="w-3 h-3 shrink-0" />
                      New guest — enter details
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">
                    Direct Booking Source / Channel
                  </label>
                  <Select value={bookingSource} onValueChange={(val: BookingSource) => setBookingSource(val)}>
                    <SelectTrigger className="h-10 text-xs">
                      <SelectValue placeholder="Select Direct Source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WALKIN">Direct Walk-In (Front Desk)</SelectItem>
                      <SelectItem value="DIRECT">Direct Call / Phone Inquiry</SelectItem>
                      <SelectItem value="WHATSAPP">WhatsApp Official Business</SelectItem>
                      <SelectItem value="WEBSITE">Hotel Direct Website</SelectItem>
                      <SelectItem value="OTHER">Other Direct</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: First & Last Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">
                    First Name
                  </label>
                  <Input
                    placeholder="e.g. John"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">
                    Last Name
                  </label>
                  <Input
                    placeholder="e.g. Doe"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                  />
                </div>
              </div>

              {/* Email & ID Type using Shadcn Select */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="guest@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">
                    Government ID Document
                  </label>
                  <Select value={idType} onValueChange={setIdType}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select ID Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aadhaar">Aadhaar Card (UIDAI)</SelectItem>
                      <SelectItem value="Passport">Passport</SelectItem>
                      <SelectItem value="Driving License">Driving License</SelectItem>
                      <SelectItem value="Voter ID">Voter ID</SelectItem>
                      <SelectItem value="PAN">PAN Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">
                  Document ID Number
                </label>
                <Input
                  placeholder="e.g. 4521-8890-1123"
                  value={idNumber}
                  onChange={e => setIdNumber(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-2">
                  Special Requests & Guest Tags
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from(new Set([
                    'High Floor',
                    'Late Arrival',
                    'Extra Towels',
                    'Quiet Room',
                    'Airport Transfer',
                    'Ocean View',
                    ...specialRequests
                  ])).map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleSpecialRequest(tag)}
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                        specialRequests.includes(tag)
                          ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                          : 'bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)] hover:text-[var(--foreground)]'
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: STAY & ROOM ALLOCATION */}
          {step === 2 && (
            <div className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">
                    Check-in Date
                  </label>
                  <Input
                    type="date"
                    value={checkIn}
                    onChange={e => handleCheckInChange(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">
                    Check-out Date ({nights} Nights)
                  </label>
                  <Input
                    type="date"
                    value={checkOut}
                    onChange={e => handleCheckOutChange(e.target.value)}
                  />
                </div>
              </div>

              {/* Quick Duration Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold text-[var(--muted-foreground)] mr-1">Quick Stay:</span>
                {[1, 2, 3, 5, 7].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setStayNights(n)}
                    className={cn(
                      'px-2.5 py-1 text-xs font-bold rounded-lg border transition-all',
                      nights === n
                        ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs'
                        : 'bg-[var(--muted)]/60 text-[var(--muted-foreground)] hover:text-[var(--foreground)] border-[var(--border)]'
                    )}
                  >
                    {n} Night{n > 1 ? 's' : ''}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">
                    Adults Count
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={4}
                    value={adults}
                    onChange={e => setAdults(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">
                    Children Count
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={3}
                    value={children}
                    onChange={e => setChildren(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Room Category Cards */}
              <div>
                <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-2">
                  Select Room Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {activeCategories.map(cat => (
                    <div
                      key={cat.id}
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={cn(
                        'p-3 rounded-xl border cursor-pointer transition-all',
                        selectedCategoryId === cat.id
                          ? 'border-[var(--primary)] bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]'
                          : 'border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)]/50'
                      )}
                    >
                      <p className="text-xs font-bold text-[var(--foreground)]">{cat.name}</p>
                      <p className="text-xs font-extrabold text-[var(--primary)] mt-1">
                        {formatCurrency(cat.basePrice)} <span className="text-[10px] text-[var(--muted-foreground)] font-normal">/night</span>
                      </p>
                      <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">
                        Max: {cat.maxAdults}A {cat.maxChildren}C
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Room Selection with Live Date Availability */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-[var(--muted-foreground)]">
                    Assign Room ({nights} Night{nights > 1 ? 's' : ''}: {checkIn} → {checkOut})
                  </label>
                  <span className="text-[11px] font-bold text-[var(--primary)]">
                    {allRooms.filter(r => getRoomAvailability(r.id).isAvailable).length} of {allRooms.length} Available
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {allRooms.map(rm => {
                    const avail = getRoomAvailability(rm.id);
                    const isSelected = selectedRoomNumber === rm.roomNumber;
                    const isMatchCat = rm.categoryId === selectedCategoryId;

                    return (
                      <button
                        key={rm.id}
                        type="button"
                        disabled={!avail.isAvailable}
                        onClick={() => {
                          if (avail.isAvailable) setSelectedRoomNumber(rm.roomNumber);
                        }}
                        className={cn(
                          'p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between min-h-[58px]',
                          isSelected
                            ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm ring-2 ring-[var(--primary)]/30'
                            : avail.isAvailable
                              ? isMatchCat
                                ? 'bg-[var(--primary)]/10 border-[var(--primary)]/40 text-[var(--foreground)] hover:bg-[var(--primary)]/20'
                                : 'bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]/50'
                              : 'bg-[var(--muted)]/40 border-[var(--border)] text-[var(--muted-foreground)] opacity-50 cursor-not-allowed'
                        )}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-bold">Room {rm.roomNumber}</span>
                          <span className="text-[9px] font-medium opacity-80">{rm.categoryName}</span>
                        </div>
                        <div className="text-[10px] font-semibold mt-1">
                          {avail.isAvailable ? (
                            <span className={isSelected ? 'text-white' : 'text-[var(--primary)]'}>
                              ✓ Available ({nights}N)
                            </span>
                          ) : (
                            <span className="text-[var(--destructive)] truncate">
                              ✕ {avail.reason}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: BILLING & SETTLEMENT */}
          {step === 3 && (
            <div className="space-y-4 text-left">
              {/* Financial Summary */}
              <div className="p-4 rounded-2xl bg-[var(--muted)]/60 border border-[var(--border)] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Category & Duration:</span>
                  <span className="font-bold">{selectedCategory?.name} ({nights} Nights)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Assigned Room:</span>
                  <span className="font-bold text-[var(--primary)]">Room {selectedRoomNumber || 'Auto-assign'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Direct Source:</span>
                  <span className="font-semibold">{bookingSource}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Subtotal ({nights} × {formatCurrency(nightlyRate)}):</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">GST ({nightlyRate >= 7500 ? '18%' : '12%'}):</span>
                  <span>{formatCurrency(gstTax)}</span>
                </div>
                <div className="pt-2 border-t border-[var(--border)] flex justify-between text-base font-black">
                  <span>Grand Total:</span>
                  <span className="text-[var(--primary)]">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'CASH', label: 'Cash Drawer' },
                    { id: 'CREDIT_CARD', label: 'Card / POS' },
                    { id: 'UPI_QR', label: 'UPI QR' },
                    { id: 'BANK_TRANSFER', label: 'Direct Transfer' }
                  ].map(pm => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id as any)}
                      className={cn(
                        'p-2.5 rounded-xl border text-xs font-bold transition-all',
                        paymentMethod === pm.id
                          ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs'
                          : 'bg-[var(--card)] border-[var(--border)] hover:bg-[var(--muted)]'
                      )}
                    >
                      {pm.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">
                  Advance / Deposit Paid Now (₹)
                </label>
                <Input
                  type="number"
                  min={0}
                  max={grandTotal}
                  value={paidDeposit}
                  onChange={e => setPaidDeposit(Number(e.target.value))}
                />
              </div>
            </div>
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
              className="gap-1 rounded-xl"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={closeNewReservation} disabled={isSubmitting}>
              Cancel
            </Button>
          )}

          <div className="flex gap-2">
            {step < 3 ? (
              <Button
                size="sm"
                className="bg-[var(--primary)] text-white gap-1 rounded-xl font-bold"
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
                  className="rounded-xl font-semibold"
                >
                  Save as Reserved
                </Button>
                <Button
                  size="sm"
                  className="bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] gap-1.5 font-bold rounded-xl shadow-md"
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
