import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Bed,
  Calendar,
  CheckCircle2,
  Copy,
  Check,
  Users,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { useHotel } from '../context/HotelContext';

export const PublicBookingPage: React.FC = () => {
  const { hotelId } = useParams<{ hotelId?: string }>();
  const { roomTypes, rooms, addReservation, propertyName } = useHotel();

  const displayHotelName = hotelId
    ? !isNaN(Number(hotelId))
      ? `Hotel #${hotelId} — ${propertyName}`
      : hotelId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : propertyName;

  // Step state: 1 (Dates & Room), 2 (Guest Details), 3 (Review & Confirm)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [checkIn, setCheckIn] = useState('2026-09-25');
  const [checkOut, setCheckOut] = useState('2026-09-28');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [selectedTypeId, setSelectedTypeId] = useState(roomTypes[0]?.id || 'rt-1');

  // Guest Info State
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Form Validation Errors
  const [errors, setErrors] = useState<{ guestName?: string; phone?: string; email?: string }>({});

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<{
    id: string;
    guestName: string;
    email: string;
    phone: string;
    roomTypeName: string;
    roomNumber: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    totalAmount: number;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  // Calculate nights
  const calcNights = () => {
    try {
      const d1 = new Date(checkIn);
      const d2 = new Date(checkOut);
      const diffTime = d2.getTime() - d1.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    } catch {
      return 1;
    }
  };

  const nights = calcNights();
  const selectedType = roomTypes.find(t => t.id === selectedTypeId) || roomTypes[0];
  const pricePerNight = selectedType?.basePrice || 180;
  const totalAmount = nights * pricePerNight;

  // Step Nav Handlers
  const handleNextToStep2 = () => {
    setCurrentStep(2);
  };

  const handleNextToStep3 = () => {
    const errs: { guestName?: string; phone?: string; email?: string } = {};
    if (!guestName.trim()) errs.guestName = 'Full Name is required';
    if (!phone.trim()) errs.phone = 'Phone number is required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setCurrentStep(3);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !phone) return;

    setIsSubmitting(true);

    setTimeout(() => {
      // Auto-assign available room matching typeId
      const matchingRooms = rooms.filter(r => r.typeId === selectedTypeId);
      const availableRoom = matchingRooms.find(r => !r.isOccupied) || matchingRooms[0] || rooms[0];
      const roomNum = availableRoom ? availableRoom.roomNumber : '101';

      const newRes = addReservation({
        guestName,
        phone,
        email: email || 'guest@example.com',
        roomNumber: roomNum,
        roomType: selectedType?.name || 'Deluxe Suite',
        checkIn,
        checkOut,
        eta: '14:00',
        status: 'RESERVED',
        totalAmount,
        paidAmount: 0,
        source: 'Direct Website',
        idVerified: false,
        adults,
        children,
        specialRequests: specialRequests ? [specialRequests] : []
      });

      setConfirmedBooking({
        id: newRes.id,
        guestName,
        phone,
        email: email || 'guest@example.com',
        roomTypeName: selectedType?.name || 'Deluxe Suite',
        roomNumber: roomNum,
        checkIn,
        checkOut,
        nights,
        totalAmount
      });

      setIsSubmitting(false);
    }, 800);
  };

  const handleCopyCode = () => {
    if (!confirmedBooking) return;
    navigator.clipboard.writeText(confirmedBooking.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const STEP_TITLES = {
    1: 'Select Room & Dates',
    2: 'Details',
    3: 'Confirm'
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans antialiased flex items-center justify-center p-3 sm:p-6 selection:bg-[var(--primary)] selection:text-[var(--primary-foreground)]">
      {/* Background ambient lighting using DeskFlow primary theme token */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[var(--primary)]/10 blur-[140px] pointer-events-none -z-10" />

      {/* CENTERED CARD CONTAINER (Reference Layout using DeskFlow Theme Tokens) */}
      <div className="w-full max-w-[480px] bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-[640px] relative">
        
        {/* TOP HEADER */}
        <header className="px-5 pt-5 pb-3 bg-[var(--card)] border-b border-[var(--border)] space-y-3">
          <div className="flex items-center justify-between">
            {/* Left: Back button & Step details */}
            <div className="flex items-center gap-3">
              {currentStep > 1 && !confirmedBooking ? (
                <button
                  onClick={() => setCurrentStep((prev) => (prev - 1) as 1 | 2)}
                  className="w-9 h-9 rounded-full bg-[var(--muted)] hover:bg-[var(--accent)] text-[var(--foreground)] flex items-center justify-center transition-all cursor-pointer border border-[var(--border)]"
                  title="Back"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              ) : (
                <div className="w-9 h-9 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center border border-[var(--primary)]/30">
                  <Bed className="w-4 h-4 text-[var(--primary)]" />
                </div>
              )}

              <div>
                <div className="text-[11px] font-semibold tracking-tight text-[var(--muted-foreground)] flex items-center gap-1.5">
                  <span>Step {confirmedBooking ? 3 : currentStep} of 3</span>
                  <span className="text-[var(--primary)] font-bold uppercase">{STEP_TITLES[currentStep]}</span>
                </div>
                <div className="text-[10px] font-extrabold tracking-widest text-[var(--muted-foreground)] uppercase">
                  RESERVE A ROOM
                </div>
                <div className="text-xs font-bold text-[var(--foreground)] truncate max-w-[220px]">
                  {displayHotelName}
                </div>
              </div>
            </div>

            {/* Right: DeskFlow Brand logo badge */}
            <div className="w-10 h-10 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-extrabold flex items-center justify-center text-xs shadow-md shrink-0">
              <Bed className="w-5 h-5" />
            </div>
          </div>

          {/* HORIZONTAL PROGRESS SEGMENT BARS */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <div className={`h-1 rounded-full transition-all duration-300 ${currentStep >= 1 ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`} />
            <div className={`h-1 rounded-full transition-all duration-300 ${currentStep >= 2 ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`} />
            <div className={`h-1 rounded-full transition-all duration-300 ${currentStep === 3 || confirmedBooking ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`} />
          </div>
        </header>

        {/* STEP CONTENT BODY */}
        <div className="flex-1 p-5 overflow-y-auto">
          <AnimatePresence mode="wait">
            {!confirmedBooking ? (
              <motion.div
                key={`step-${currentStep}`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5 text-left"
              >
                {/* STEP 1: DATES & ROOM SELECTION */}
                {currentStep === 1 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-2xl font-extrabold text-[var(--foreground)] tracking-tight">Select Stay</h2>
                      <p className="text-xs text-[var(--muted-foreground)] mt-1">Choose check-in/out dates and room preference</p>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[var(--muted-foreground)] mb-1.5">Check-in Date *</label>
                        <input
                          type="date"
                          value={checkIn}
                          onChange={e => setCheckIn(e.target.value)}
                          className="w-full h-11 px-3 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-medium text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[var(--muted-foreground)] mb-1.5">Check-out Date *</label>
                        <input
                          type="date"
                          value={checkOut}
                          onChange={e => setCheckOut(e.target.value)}
                          className="w-full h-11 px-3 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-medium text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
                        />
                      </div>
                    </div>

                    {/* Guests */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[var(--muted-foreground)] mb-1.5">Adults</label>
                        <select
                          value={adults}
                          onChange={e => setAdults(Number(e.target.value))}
                          className="w-full h-11 px-3 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-medium text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        >
                          {[1, 2, 3, 4, 5, 6].map(n => (
                            <option key={n} value={n} className="bg-[var(--card)]">{n} Adult{n > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[var(--muted-foreground)] mb-1.5">Children</label>
                        <select
                          value={children}
                          onChange={e => setChildren(Number(e.target.value))}
                          className="w-full h-11 px-3 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-medium text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        >
                          {[0, 1, 2, 3].map(n => (
                            <option key={n} value={n} className="bg-[var(--card)]">{n} Children</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Room Category Cards */}
                    <div className="space-y-2.5 pt-1">
                      <label className="block text-xs font-bold text-[var(--muted-foreground)]">Room Category</label>
                      <div className="space-y-2">
                        {roomTypes.map(rt => {
                          const isSelected = rt.id === selectedTypeId;
                          return (
                            <div
                              key={rt.id}
                              onClick={() => setSelectedTypeId(rt.id)}
                              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                isSelected
                                  ? 'bg-[var(--primary)]/10 border-[var(--primary)] ring-1 ring-[var(--primary)]/50 shadow-sm'
                                  : 'bg-[var(--background)] border-[var(--border)] hover:border-[var(--primary)]/50'
                              }`}
                            >
                              <div>
                                <h4 className="text-xs font-bold text-[var(--foreground)] flex items-center gap-2">
                                  {rt.name}
                                  {isSelected && <span className="text-[10px] text-[var(--primary)] font-extrabold">• Selected</span>}
                                </h4>
                                <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">
                                  Code: {rt.code} • Max {rt.maxAdults} Guests
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-sm font-extrabold text-[var(--primary)] font-mono block">
                                  ${rt.basePrice}
                                </span>
                                <span className="text-[9px] text-[var(--muted-foreground)]">/night</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: YOUR DETAILS */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-extrabold text-[var(--foreground)] tracking-tight">Your details</h2>
                      <p className="text-xs text-[var(--muted-foreground)] mt-1">We'll use this to confirm your reservation</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[var(--muted-foreground)] mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Priya Sharma"
                        value={guestName}
                        onChange={e => setGuestName(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-medium text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
                      />
                      {errors.guestName && <p className="text-[10px] text-rose-500 mt-1 font-semibold">{errors.guestName}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[var(--muted-foreground)] mb-1.5">Phone Number *</label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-medium text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
                      />
                      {errors.phone && <p className="text-[10px] text-rose-500 mt-1 font-semibold">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[var(--muted-foreground)] mb-1.5">
                        Email <span className="text-[var(--muted-foreground)] font-normal">(Optional — for booking confirmation)</span>
                      </label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-medium text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[var(--muted-foreground)] mb-1.5">
                        Special Requests <span className="text-[var(--muted-foreground)] font-normal">(Optional)</span>
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Birthday celebration, dietary requirements, high floor window..."
                        value={specialRequests}
                        onChange={e => setSpecialRequests(e.target.value)}
                        className="w-full p-3.5 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-medium text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 3: REVIEW & CONFIRM */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-extrabold text-[var(--foreground)] tracking-tight">Review Reservation</h2>
                      <p className="text-xs text-[var(--muted-foreground)] mt-1">Please verify your details before instant confirmation</p>
                    </div>

                    <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-4 space-y-3 text-xs">
                      <div className="flex justify-between items-center pb-2 border-b border-[var(--border)]">
                        <span className="text-[var(--muted-foreground)]">Guest Name</span>
                        <span className="font-bold text-[var(--foreground)]">{guestName}</span>
                      </div>

                      <div className="flex justify-between items-center pb-2 border-b border-[var(--border)]">
                        <span className="text-[var(--muted-foreground)]">Phone Number</span>
                        <span className="font-mono font-bold text-[var(--foreground)]">{phone}</span>
                      </div>

                      {email && (
                        <div className="flex justify-between items-center pb-2 border-b border-[var(--border)]">
                          <span className="text-[var(--muted-foreground)]">Email</span>
                          <span className="font-medium text-[var(--foreground)]">{email}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center pb-2 border-b border-[var(--border)]">
                        <span className="text-[var(--muted-foreground)]">Room Category</span>
                        <span className="font-bold text-[var(--primary)]">{selectedType?.name}</span>
                      </div>

                      <div className="flex justify-between items-center pb-2 border-b border-[var(--border)]">
                        <span className="text-[var(--muted-foreground)]">Dates &amp; Duration</span>
                        <span className="font-bold text-[var(--foreground)] font-mono">{checkIn} to {checkOut} ({nights} night{nights > 1 ? 's' : ''})</span>
                      </div>

                      <div className="flex justify-between items-baseline pt-1">
                        <span className="font-bold text-sm text-[var(--foreground)]">Estimated Total</span>
                        <span className="text-lg font-extrabold text-[var(--primary)] font-mono">${totalAmount}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[var(--muted-foreground)] p-3 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Instant confirmation directly registered with front desk.</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              /* CONFIRMATION RECEIPT SCREEN */
              <motion.div
                key="booking-success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-5 text-center py-4"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-xl">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-[10px] font-extrabold uppercase tracking-wider">
                    Booking Confirmed
                  </span>
                  <h2 className="text-xl font-extrabold text-[var(--foreground)] pt-2">
                    Thank You, {confirmedBooking.guestName}!
                  </h2>
                  <p className="text-xs text-[var(--muted-foreground)] max-w-xs mx-auto">
                    Your stay is confirmed. Booking code dispatched to <span className="text-[var(--foreground)] font-semibold">{confirmedBooking.phone}</span>.
                  </p>
                </div>

                {/* RECEIPT SUMMARY BOX */}
                <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-4 text-left space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] tracking-wider">Booking Code</p>
                      <p className="text-base font-mono font-extrabold text-[var(--primary)]">{confirmedBooking.id}</p>
                    </div>

                    <button
                      onClick={handleCopyCode}
                      className="px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] hover:bg-[var(--accent)] text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <p className="text-[10px] text-[var(--muted-foreground)]">Category</p>
                      <p className="font-bold text-[var(--foreground)] truncate">{confirmedBooking.roomTypeName}</p>
                    </div>

                    <div>
                      <p className="text-[10px] text-[var(--muted-foreground)]">Assigned Room</p>
                      <p className="font-bold text-[var(--foreground)]">Room #{confirmedBooking.roomNumber}</p>
                    </div>

                    <div>
                      <p className="text-[10px] text-[var(--muted-foreground)]">Check-In</p>
                      <p className="font-bold font-mono text-[var(--foreground)]">{confirmedBooking.checkIn}</p>
                    </div>

                    <div>
                      <p className="text-[10px] text-[var(--muted-foreground)]">Check-Out</p>
                      <p className="font-bold font-mono text-[var(--foreground)]">{confirmedBooking.checkOut}</p>
                    </div>

                    <div>
                      <p className="text-[10px] text-[var(--muted-foreground)]">Duration</p>
                      <p className="font-bold text-[var(--foreground)]">{confirmedBooking.nights} Night(s)</p>
                    </div>

                    <div>
                      <p className="text-[10px] text-[var(--muted-foreground)]">Total Amount</p>
                      <p className="font-bold text-emerald-500 font-mono text-sm">${confirmedBooking.totalAmount}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 h-11 rounded-xl border border-[var(--border)] bg-[var(--muted)] hover:bg-[var(--accent)] text-xs font-bold text-[var(--foreground)] transition-all cursor-pointer"
                  >
                    Print Receipt
                  </button>
                  <button
                    onClick={() => {
                      setConfirmedBooking(null);
                      setCurrentStep(1);
                    }}
                    className="flex-1 h-11 rounded-xl bg-[var(--primary)] hover:opacity-90 text-xs font-bold text-[var(--primary-foreground)] transition-all cursor-pointer shadow-md shadow-[var(--primary)]/20"
                  >
                    Book Another
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* FLOATING BOTTOM SUMMARY PILL STRIP + PRIMARY ACTION BUTTON */}
        {!confirmedBooking && (
          <footer className="p-4 bg-[var(--card)] border-t border-[var(--border)] space-y-3 sticky bottom-0">
            {/* FLOATING BADGE PILLS */}
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)] flex items-center gap-1 shadow-2xs">
                <Users className="w-3 h-3 text-[var(--primary)]" /> {adults + children} Guests
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)] flex items-center gap-1 shadow-2xs">
                <Calendar className="w-3 h-3 text-[var(--primary)]" /> {checkIn}
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)] flex items-center gap-1 shadow-2xs">
                <Clock className="w-3 h-3 text-[var(--primary)]" /> {nights} Night{nights > 1 ? 's' : ''}
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/30 font-mono shadow-2xs">
                ${totalAmount}
              </span>
            </div>

            {/* FULL-WIDTH PRIMARY ACTION BUTTON */}
            {currentStep === 1 && (
              <button
                onClick={handleNextToStep2}
                className="w-full h-12 rounded-xl bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] font-extrabold text-xs transition-all cursor-pointer shadow-lg shadow-[var(--primary)]/20"
              >
                Proceed to Guest Details
              </button>
            )}

            {currentStep === 2 && (
              <button
                onClick={handleNextToStep3}
                className="w-full h-12 rounded-xl bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] font-extrabold text-xs transition-all cursor-pointer shadow-lg shadow-[var(--primary)]/20"
              >
                Verify Phone &amp; Proceed
              </button>
            )}

            {currentStep === 3 && (
              <button
                onClick={handleBookingSubmit}
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] font-extrabold text-xs transition-all cursor-pointer shadow-lg shadow-[var(--primary)]/25"
              >
                {isSubmitting ? 'Confirming Booking...' : 'Confirm Reservation Now'}
              </button>
            )}

            {/* FOOTER BRANDING */}
            <div className="text-center pt-1">
              <span className="text-[10px] text-[var(--muted-foreground)] font-semibold tracking-wider uppercase">
                DeskFlow
              </span>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};
