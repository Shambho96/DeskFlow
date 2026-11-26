import React from 'react';
import type { CountryCode } from 'libphonenumber-js';
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  UserCheck,
  UserPlus,
  Tag,
  Plus,
  Compass,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { PhoneNumberInput } from '../../ui/PhoneNumberInput';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../ui/Select';
import type { BookingSource } from '../../../types/operations';
import type { FoundGuestProfile } from './reservationTypes';

interface Step1GuestProfileProps {
  phone: string;
  phoneCountry: CountryCode;
  phoneError: string;
  onPhoneChange: (val: string, country: CountryCode) => void;
  searchStatus: 'idle' | 'searching' | 'found' | 'not_found';
  foundGuest: FoundGuestProfile | null;
  bookingSource: BookingSource;
  setBookingSource: (source: BookingSource) => void;
  firstName: string;
  setFirstName: (val: string) => void;
  lastName: string;
  setLastName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  idType: string;
  setIdType: (val: string) => void;
  idNumber: string;
  setIdNumber: (val: string) => void;
  purposeOfVisit: string;
  setPurposeOfVisit: (val: string) => void;
  dateOfBirth: string;
  setDateOfBirth: (val: string) => void;
  city: string;
  setCity: (val: string) => void;
  stateRegion: string;
  setStateRegion: (val: string) => void;
  specialRequests: string[];
  toggleSpecialRequest: (tag: string) => void;
  activeGuestTags: Array<{ id?: string | number; name: string }>;
  activeSpecialRequests: Array<{ id?: string | number; label: string }>;
  customTagInput: string;
  setCustomTagInput: (val: string) => void;
  handleAddCustomTag: () => void;
}

export const Step1GuestProfile: React.FC<Step1GuestProfileProps> = ({
  phone,
  phoneCountry,
  phoneError,
  onPhoneChange,
  searchStatus,
  foundGuest,
  bookingSource,
  setBookingSource,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  setEmail,
  idType,
  setIdType,
  idNumber,
  setIdNumber,
  purposeOfVisit,
  setPurposeOfVisit,
  dateOfBirth,
  setDateOfBirth,
  city,
  setCity,
  stateRegion,
  setStateRegion,
  specialRequests,
  toggleSpecialRequest,
  activeGuestTags,
  activeSpecialRequests,
  customTagInput,
  setCustomTagInput,
  handleAddCustomTag,
}) => {
  return (
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
            onChange={onPhoneChange}
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
            <SelectTrigger className="h-9 text-xs font-semibold">
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
            <SelectTrigger className="h-9 text-xs font-semibold">
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

      {/* Target Audience & Origin Profile */}
      <div className="p-3.5 rounded-2xl bg-[var(--muted)]/30 border border-[var(--border)] space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center">
            <Compass className="w-3 h-3" />
          </div>
          <label className="text-xs font-bold text-[var(--foreground)]">
            Audience &amp; Origin Profile
            <span className="text-[11px] font-normal text-[var(--muted-foreground)] ml-1.5">
              (Purpose, DOB &amp; Origin)
            </span>
          </label>
        </div>

        {/* 1. Purpose of Visit Chips */}
        <div>
          <span className="text-[11px] font-semibold text-[var(--muted-foreground)] block mb-1.5">
            Purpose of Visit
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'BUSINESS', label: 'Business / Work' },
              { id: 'LEISURE', label: 'Leisure / Vacation' },
              { id: 'FAMILY', label: 'Family Trip' },
              { id: 'EVENT', label: 'Event / Wedding' },
              { id: 'TRANSIT', label: 'Transit / Stopover' },
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPurposeOfVisit(item.id)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-xs',
                  purposeOfVisit === item.id
                    ? 'bg-[var(--primary)] text-white border-[var(--primary)] scale-102'
                    : 'bg-[var(--card)] text-[var(--muted-foreground)] border-[var(--border)] hover:text-[var(--foreground)]'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Date of Birth, Origin City & State */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <div>
            <label className="block text-[11px] font-semibold text-[var(--muted-foreground)] mb-1">
              Date of Birth (DOB)
            </label>
            <Input
              type="date"
              value={dateOfBirth}
              onChange={e => setDateOfBirth(e.target.value)}
              className="h-8 text-xs bg-[var(--background)] border-[var(--border)]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[var(--muted-foreground)] mb-1">
              Origin City (Came From)
            </label>
            <Input
              placeholder="e.g. Mumbai, Pune, Bengaluru"
              value={city}
              onChange={e => setCity(e.target.value)}
              className="h-8 text-xs bg-[var(--background)] border-[var(--border)]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[var(--muted-foreground)] mb-1">
              Origin State / Region
            </label>
            <Input
              placeholder="e.g. Maharashtra, Karnataka"
              value={stateRegion}
              onChange={e => setStateRegion(e.target.value)}
              className="h-8 text-xs bg-[var(--background)] border-[var(--border)]"
            />
          </div>
        </div>
      </div>

      {/* Special Requests & Guest Tags Section */}
      <div className="space-y-4 pt-1">
        {/* 1. Guest Tags (Persistent labels e.g. VIP) */}
        {activeGuestTags.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center">
                <Tag className="w-3 h-3" />
              </div>
              <label className="text-xs font-bold text-[var(--foreground)]">
                Guest Tags
                <span className="text-[11px] font-normal text-[var(--muted-foreground)] ml-1.5">
                  (Persistent labels e.g. VIP)
                </span>
              </label>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeGuestTags.map(tagObj => {
                const tag = tagObj.name;
                const isSelected = specialRequests.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleSpecialRequest(tag)}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-bold tracking-wide border transition-all cursor-pointer shadow-xs',
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs scale-102'
                        : 'bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60'
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Reservation Tags (Visit specific e.g. BIRTHDAY) */}
        {activeSpecialRequests.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <Tag className="w-3 h-3" />
              </div>
              <label className="text-xs font-bold text-[var(--foreground)]">
                Reservation Tags
                <span className="text-[11px] font-normal text-[var(--muted-foreground)] ml-1.5">
                  (Visit specific e.g. BIRTHDAY)
                </span>
              </label>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeSpecialRequests.map(reqObj => {
                const tag = reqObj.label;
                const isSelected = specialRequests.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleSpecialRequest(tag)}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-bold tracking-wide border transition-all cursor-pointer flex items-center gap-1.5 shadow-xs',
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs scale-102'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected or prefilled custom tags */}
        {specialRequests.filter(
          tag =>
            !activeGuestTags.some(t => t.name === tag) &&
            !activeSpecialRequests.some(r => r.label === tag)
        ).length > 0 && (
          <div>
            <label className="text-xs font-bold text-[var(--foreground)] block mb-1.5">
              Selected / Custom Tags:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {specialRequests
                .filter(
                  tag =>
                    !activeGuestTags.some(t => t.name === tag) &&
                    !activeSpecialRequests.some(r => r.label === tag)
                )
                .map(customTag => (
                  <button
                    key={customTag}
                    type="button"
                    onClick={() => toggleSpecialRequest(customTag)}
                    className="px-3 py-1 rounded-full text-xs font-bold border bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{customTag}</span>
                    <span className="text-[10px] opacity-75">×</span>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* If no tags in settings yet */}
        {activeGuestTags.length === 0 && activeSpecialRequests.length === 0 && specialRequests.length === 0 && (
          <p className="text-xs text-[var(--muted-foreground)] italic">
            No tags configured yet. You can type tags manually below or configure defaults in Settings → Tags &amp; Preferences.
          </p>
        )}

        {/* Add Custom Request / Tag input */}
        <div className="flex items-center gap-2 mt-2.5">
          <Input
            placeholder="+ Type custom tag and press Enter"
            value={customTagInput}
            onChange={e => setCustomTagInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustomTag();
              }
            }}
            className="h-8 text-xs flex-1"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleAddCustomTag}
            disabled={!customTagInput.trim()}
            className="h-8 px-2.5 text-xs flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};
