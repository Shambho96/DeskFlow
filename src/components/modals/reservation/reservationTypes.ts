import type { BookingSource } from '../../../types/operations';

export const normalizeIdType = (val?: string): string => {
  if (!val) return 'Aadhaar';
  const lower = val.toLowerCase();
  if (lower.includes('aadhaar')) return 'Aadhaar';
  if (lower.includes('passport')) return 'Passport';
  if (lower.includes('driving')) return 'Driving License';
  if (lower.includes('voter')) return 'Voter ID';
  if (lower.includes('pan')) return 'PAN';
  return val;
};

export const normalizeBookingSource = (val?: string): BookingSource => {
  if (!val) return 'WALKIN';
  const upper = val.toUpperCase();
  if (['WALKIN', 'DIRECT', 'WHATSAPP', 'WEBSITE', 'OTHER'].includes(upper)) {
    return upper as BookingSource;
  }
  return 'WALKIN';
};

export const generateReservationIdempotencyKey = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `idemp-res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
};

export interface FoundGuestProfile {
  name: string;
  phone: string;
  email?: string;
  idType?: string;
  idNumber?: string;
  vipStatus?: string;
  bookingSource?: string;
  specialRequests?: string[];
  dateOfBirth?: string;
  city?: string;
  state?: string;
  purposeOfVisit?: string;
}

export interface StayFinancialSummary {
  nights: number;
  nightlyRate: number;
  subtotal: number;
  gstRate: number;
  gstTax: number;
  grandTotal: number;
}

export const calculateStayFinancials = (
  checkIn: string,
  checkOut: string,
  nightlyRate: number
): StayFinancialSummary => {
  const nights = Math.max(
    1,
    Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    ) || 1
  );
  const subtotal = nightlyRate * nights;
  const gstRate = nightlyRate >= 7500 ? 0.18 : 0.12;
  const gstTax = Math.round(subtotal * gstRate);
  const grandTotal = subtotal + gstTax;

  return {
    nights,
    nightlyRate,
    subtotal,
    gstRate,
    gstTax,
    grandTotal,
  };
};
