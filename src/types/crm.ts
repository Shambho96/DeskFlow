export interface LoyaltyTier {
  id: number;
  tierCode: string;
  name: string;
  minSpend: number;
  minStays: number;
  discountPercent: number;
  badgeColor: string;
  perks: string[];
  displayOrder: number;
  isActive: boolean;
}

export interface LoyaltyTierInput {
  tierCode: string;
  name: string;
  minSpend: number;
  minStays?: number;
  discountPercent?: number;
  badgeColor?: string;
  perks?: string[];
  displayOrder?: number;
  isActive?: boolean;
}

export interface GuestNote {
  id: string;
  authorName: string;
  text: string;
  outletId?: number;
  createdAt: string;
}

export interface GuestCRMItem {
  id: number;
  clientId: number;
  outletId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country: string;
  companyName?: string;
  gstNumber?: string;
  idType?: string;
  idNumber?: string;
  idVerified: boolean;
  idDocumentUrl?: string;
  vipStatus: string;
  isBlacklisted: boolean;
  blacklistReason?: string;
  nationality: string;
  specialPreferences?: string;
  tags: string[];
  notes: GuestNote[];

  // Computed Outlet-Scoped Stats
  totalStays: number;
  totalNights: number;
  totalSpend: number;
  lastVisitDate?: string;
  activeStayRoom?: string;

  // Dynamic Loyalty Tier from Settings
  tierCode: string;
  tierName: string;
  tierBadgeColor: string;
  tierDiscount: number;
  tierPerks: string[];
  createdAt?: string;
}

export interface GuestStayHistory {
  reservationId: number;
  reservationCode: string;
  roomNumber: string;
  categoryName: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  adultsCount: number;
  childrenCount: number;
  bookingSource: string;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
}

export interface TierBreakdown {
  tierCode: string;
  tierName: string;
  badgeColor: string;
  minSpend: number;
  guestCount: number;
}

export interface GuestCRMStats {
  totalGuests: number;
  repeatGuestsCount: number;
  repeatGuestsRate: number;
  kycVerifiedCount: number;
  blacklistedCount: number;
  tierBreakdowns: TierBreakdown[];
}

export interface GuestPaginationPayload {
  items: GuestCRMItem[];
  totalCount: number;
  page: number;
  totalPages: number;
}

export interface CreateGuestInput {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  companyName?: string;
  gstNumber?: string;
  idType?: string;
  idNumber?: string;
  idVerified?: boolean;
  idDocumentUrl?: string;
  vipStatus?: string;
  nationality?: string;
  specialPreferences?: string;
  tags?: string[];
}

export interface UpdateGuestInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  companyName?: string;
  gstNumber?: string;
  idType?: string;
  idNumber?: string;
  idVerified?: boolean;
  idDocumentUrl?: string;
  vipStatus?: string;
  isBlacklisted?: boolean;
  blacklistReason?: string;
  nationality?: string;
  specialPreferences?: string;
  tags?: string[];
}

export interface VerifyKycInput {
  idType?: string;
  idNumber?: string;
  idDocumentUrl?: string;
  verified: boolean;
}

