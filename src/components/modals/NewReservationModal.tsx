import React, { useState, useEffect } from 'react';
import {
  Key,
  Building,
  ChevronRight,
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import { useHotel } from '../../context/HotelContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { formatCurrency } from '../../lib/utils';

export const NewReservationModal: React.FC = () => {
  const { isNewReservationOpen, closeNewReservation, prefillReservation } = useModal();
  const { roomTypes, rooms, addReservation } = useHotel();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [checkIn, setCheckIn] = useState('2026-09-24');
  const [checkOut, setCheckOut] = useState('2026-09-26');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [selectedCategoryCode, setSelectedCategoryCode] = useState('DLX-K');
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('101');

  // Step 2 State
  const [phone, setPhone] = useState('');
  const [guestName, setGuestName] = useState('');
  const [email, setEmail] = useState('');
  const [idType, setIdType] = useState('Aadhaar');
  const [idNumber, setIdNumber] = useState('');
  const [specialRequests, setSpecialRequests] = useState<string[]>([]);

  // Step 3 State
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'UPI' | 'Company'>('Cash');
  const [paidDeposit, setPaidDeposit] = useState<number>(2000);

  // Auto-fill handling when prefill is provided from Tape Chart
  useEffect(() => {
    if (prefillReservation) {
      if (prefillReservation.roomNumber) setSelectedRoomNumber(prefillReservation.roomNumber);
      if (prefillReservation.checkIn) setCheckIn(prefillReservation.checkIn);
      if (prefillReservation.checkOut) setCheckOut(prefillReservation.checkOut);
      if (prefillReservation.guestName) setGuestName(prefillReservation.guestName);
      if (prefillReservation.phone) setPhone(prefillReservation.phone);
    }
  }, [prefillReservation, isNewReservationOpen]);

  // Mock auto-suggest when typing phone number
  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (val.includes('98450')) {
      setGuestName('Arjun Verma');
      setEmail('arjun.verma@example.com');
      setIdType('Aadhaar');
      setIdNumber('4521-8890-1123');
      setSpecialRequests(['High Floor', 'Late Checkout']);
    } else if (val.includes('98111')) {
      setGuestName('Priya Sundaram');
      setEmail('priya.s@techcorp.in');
      setIdType('Passport');
      setIdNumber('Z9810293');
    }
  };

  const toggleSpecialRequest = (tag: string) => {
    setSpecialRequests(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Calculations
  const selectedCategory = roomTypes.find(rt => rt.code === selectedCategoryCode) || roomTypes[0];
  const nights = Math.max(
    1,
    Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    ) || 1
  );

  const subtotal = selectedCategory.basePrice * nights;
  const gstTax = Math.round(subtotal * 0.12); // 12% GST
  const grandTotal = subtotal + gstTax;

  const handleFinish = (isInstantCheckIn: boolean) => {
    addReservation({
      guestName: guestName || 'Walk-in Guest',
      phone: phone || '+91 99000 00000',
      email: email || 'guest@example.com',
      roomNumber: selectedRoomNumber,
      roomType: selectedCategory.name,
      checkIn,
      checkOut,
      eta: '12:00 PM',
      status: isInstantCheckIn ? 'CHECKED_IN' : 'RESERVED',
      totalAmount: grandTotal,
      paidAmount: paidDeposit,
      source: 'Direct Walk-in',
      idVerified: true,
      idType,
      idNumber,
      specialRequests,
      adults,
      children
    });

    // Close and reset — no alert() to avoid exiting browser fullscreen
    closeNewReservation();
    setStep(1);
  };

  return (
    <Dialog open={isNewReservationOpen} onOpenChange={(open) => { if (!open) { closeNewReservation(); setStep(1); } }}>
      <DialogContent className="max-w-2xl bg-[var(--card)] text-[var(--card-foreground)] border-[var(--border)] p-0 overflow-hidden shadow-2xl">
        {/* STEPPER HEADER */}
        <div className="p-6 bg-[var(--muted)] border-b border-[var(--border)]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-xl font-bold">
              <span className="flex items-center gap-2">
                <Building className="w-5 h-5 text-[var(--primary)]" />
                Create New Booking
              </span>
              <span className="text-xs font-mono font-normal text-[var(--muted-foreground)]">
                Step {step} of 3
              </span>
            </DialogTitle>
          </DialogHeader>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-3 gap-2 mt-5">
            {[
              { num: 1, label: 'Guest Profile' },
              { num: 2, label: 'Stay & Room' },
              { num: 3, label: 'Billing & Settle' }
            ].map((s) => (
              <div
                key={s.num}
                className={`flex items-center gap-2 p-2 rounded-md text-xs font-semibold border ${
                  step === s.num
                    ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm'
                    : step > s.num
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : 'bg-[var(--background)] text-[var(--muted-foreground)] border-[var(--border)]'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                  {s.num}
                </span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* STEP CONTENT BODY */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* STEP 1: GUEST PROFILE */}
          {step === 1 && (
            <div className="space-y-4 text-left">
              <div className="p-3 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-xs flex items-center justify-between">
                <span className="text-[var(--primary)] font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Guest CRM Auto-lookup
                </span>
                <span className="text-[10px] text-[var(--muted-foreground)]">Type '98450' to test auto-fill</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">
                    Phone Number
                  </label>
                  <Input
                    placeholder="+91 98450 11234"
                    value={phone}
                    onChange={e => handlePhoneChange(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">
                    Full Name
                  </label>
                  <Input
                    placeholder="Arjun Verma"
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="arjun@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">
                    Government ID Type
                  </label>
                  <select
                    value={idType}
                    onChange={e => setIdType(e.target.value)}
                    className="w-full h-9 rounded-md border border-[var(--input)] bg-[var(--background)] px-3 text-xs text-[var(--foreground)]"
                  >
                    <option value="Aadhaar">Aadhaar Card</option>
                    <option value="Passport">Passport</option>
                    <option value="Driving License">Driving License</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">
                  Document ID Number
                </label>
                <Input
                  placeholder="4521-8890-1123"
                  value={idNumber}
                  onChange={e => setIdNumber(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-2">
                  Special Requests & Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {['High Floor', 'Late Arrival', 'Extra Towels', 'Quiet Room', 'Airport Transfer', 'Ocean View'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleSpecialRequest(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        specialRequests.includes(tag)
                          ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                          : 'bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: STAY & ROOM */}
          {step === 2 && (
            <div className="space-y-5 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">
                    Check-in Date
                  </label>
                  <Input
                    type="date"
                    value={checkIn}
                    onChange={e => setCheckIn(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">
                    Check-out Date ({nights} Nights)
                  </label>
                  <Input
                    type="date"
                    value={checkOut}
                    onChange={e => setCheckOut(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">
                    Adults
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
                    Children
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

              <div>
                <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-2">
                  Select Room Category
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {roomTypes.map(rt => (
                    <div
                      key={rt.id}
                      onClick={() => setSelectedCategoryCode(rt.code)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedCategoryCode === rt.code
                          ? 'border-[var(--primary)] bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]'
                          : 'border-[var(--border)] bg-[var(--background)] hover:bg-[var(--muted)]'
                      }`}
                    >
                      <p className="text-xs font-bold text-[var(--foreground)]">{rt.name}</p>
                      <p className="text-xs text-[var(--primary)] font-bold mt-1">
                        {formatCurrency(rt.basePrice)} <span className="text-[10px] text-[var(--muted-foreground)] font-normal">/night</span>
                      </p>
                      <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
                        Max: {rt.maxAdults}A {rt.maxChildren}C
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-2">
                  Assign Room Number (Clean & Available First)
                </label>
                <div className="flex flex-wrap gap-2">
                  {rooms.map(rm => (
                    <button
                      key={rm.id}
                      type="button"
                      onClick={() => setSelectedRoomNumber(rm.roomNumber)}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold border transition-all ${
                        selectedRoomNumber === rm.roomNumber
                          ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                          : rm.status === 'CLEAN' && !rm.isOccupied
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                          : rm.isOccupied
                          ? 'bg-slate-700/20 border-slate-700 text-slate-400 cursor-not-allowed'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {rm.roomNumber} ({rm.status})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: BILLING & SETTLEMENT */}
          {step === 3 && (
            <div className="space-y-5 text-left">
              {/* Summary Card */}
              <div className="p-4 rounded-xl bg-[var(--muted)] border border-[var(--border)] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Room Category & Night:</span>
                  <span className="font-bold">{selectedCategory.name} ({nights} Nights)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Assigned Room:</span>
                  <span className="font-bold text-[var(--primary)]">Room {selectedRoomNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Subtotal ({nights} × {formatCurrency(selectedCategory.basePrice)}):</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">GST Tax (12% slab):</span>
                  <span>{formatCurrency(gstTax)}</span>
                </div>
                <div className="pt-2 border-t border-[var(--border)] flex justify-between text-sm font-extrabold">
                  <span>Grand Total:</span>
                  <span className="text-[var(--primary)]">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'Cash', label: 'Cash Drawer' },
                    { id: 'Card', label: 'POS Terminal' },
                    { id: 'UPI', label: 'UPI QR' },
                    { id: 'Company', label: 'Bill to Co.' }
                  ].map(pm => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id as any)}
                      className={`p-2.5 rounded-lg border text-xs font-bold transition-all ${
                        paymentMethod === pm.id
                          ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm'
                          : 'bg-[var(--background)] border-[var(--border)] hover:bg-[var(--muted)]'
                      }`}
                    >
                      {pm.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">
                  Deposit / Advance Paid Amount (₹)
                </label>
                <Input
                  type="number"
                  value={paidDeposit}
                  onChange={e => setPaidDeposit(Number(e.target.value))}
                />
              </div>
            </div>
          )}
        </div>

        {/* STEPPER FOOTER BUTTONS */}
        <div className="p-4 bg-[var(--muted)] border-t border-[var(--border)] flex items-center justify-between">
          {step > 1 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep((step - 1) as any)}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={closeNewReservation}>
              Cancel
            </Button>
          )}

          <div className="flex gap-2">
            {step < 3 ? (
              <Button
                size="sm"
                className="bg-[var(--primary)] text-white gap-1"
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
                >
                  Save as Confirmed
                </Button>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 font-bold shadow-md"
                  onClick={() => handleFinish(true)}
                >
                  <Key className="w-4 h-4" /> Instant Check-In
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
