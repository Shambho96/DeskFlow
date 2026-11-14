import { useState, useMemo, useEffect } from 'react';
import useSWR from 'swr';
import { graphqlRequest } from '../lib/graphql';
import { useUser } from './useUser';
import type {
  GuestCRMItem,
  GuestCRMStats,
  GuestPaginationPayload,
  GuestStayHistory,
  CreateGuestInput,
  UpdateGuestInput,
  VerifyKycInput,
} from '../types/crm';

const GUEST_FIELDS = `
  id
  clientId
  outletId
  firstName
  lastName
  fullName
  phone
  email
  dateOfBirth
  gender
  addressLine1
  city
  state
  postalCode
  country
  companyName
  gstNumber
  idType
  idNumber
  idVerified
  idDocumentUrl
  vipStatus
  isBlacklisted
  blacklistReason
  nationality
  specialPreferences
  tags
  notes {
    id
    authorName
    text
    outletId
    createdAt
  }
  totalStays
  totalNights
  totalSpend
  lastVisitDate
  activeStayRoom
  tierCode
  tierName
  tierBadgeColor
  tierDiscount
  tierPerks
  createdAt
`;

export const GET_CRM_GUESTS = `
  query GetCRMGuests(
    $search: String
    $tierCode: String
    $idVerified: Boolean
    $isBlacklisted: Boolean
    $page: Int
    $limit: Int
  ) {
    crmGuests(
      search: $search
      tierCode: $tierCode
      idVerified: $idVerified
      isBlacklisted: $isBlacklisted
      page: $page
      limit: $limit
    ) {
      items {
        ${GUEST_FIELDS}
      }
      totalCount
      page
      totalPages
    }
  }
`;

export const GET_CRM_GUEST_STATS = `
  query GetCRMGuestStats {
    crmGuestStats {
      totalGuests
      repeatGuestsCount
      repeatGuestsRate
      kycVerifiedCount
      blacklistedCount
      tierBreakdowns {
        tierCode
        tierName
        badgeColor
        minSpend
        guestCount
      }
    }
  }
`;

const GET_CRM_GUEST_STAYS = `
  query GetCRMGuestStays($guestId: Int!) {
    crmGuestStays(guestId: $guestId) {
      reservationId
      reservationCode
      roomNumber
      categoryName
      checkInDate
      checkOutDate
      status
      adultsCount
      childrenCount
      bookingSource
      totalAmount
      paidAmount
      balanceDue
    }
  }
`;

const CREATE_CRM_GUEST = `
  mutation CreateCRMGuest($input: CreateGuestInput!) {
    createCrmGuest(input: $input) {
      ${GUEST_FIELDS}
    }
  }
`;

const UPDATE_CRM_GUEST = `
  mutation UpdateCRMGuest($id: Int!, $input: UpdateGuestInput!) {
    updateCrmGuest(id: $id, input: $input) {
      ${GUEST_FIELDS}
    }
  }
`;

const VERIFY_GUEST_KYC = `
  mutation VerifyGuestKYC($id: Int!, $input: VerifyKycInput!) {
    verifyGuestKyc(id: $id, input: $input) {
      ${GUEST_FIELDS}
    }
  }
`;

const ADD_GUEST_CRM_NOTE = `
  mutation AddGuestCRMNote($guestId: Int!, $note: String!) {
    addGuestCrmNote(guestId: $guestId, note: $note) {
      ${GUEST_FIELDS}
    }
  }
`;

const SET_GUEST_BLACKLIST = `
  mutation SetGuestBlacklist($guestId: Int!, $isBlacklisted: Boolean!, $reason: String) {
    setGuestBlacklist(guestId: $guestId, isBlacklisted: $isBlacklisted, reason: $reason) {
      ${GUEST_FIELDS}
    }
  }
`;

export function useGuestCRM() {
  const { user } = useUser();
  const outletId = user?.active_outlet_id ? Number(user.active_outlet_id) : null;

  const [search, setSearch] = useState('');
  const [tierCode, setTierCode] = useState<string>('ALL');
  const [idVerifiedFilter, setIdVerifiedFilter] = useState<boolean | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [selectedGuestId, setSelectedGuestId] = useState<number | null>(null);

  // Automatically reset selected guest when active outlet changes
  useEffect(() => {
    setSelectedGuestId(null);
  }, [outletId]);

  // SWR for Guests list - strictly keyed to outletId
  const guestsKey = useMemo(() => {
    if (!outletId) return null;
    return [
      'crm_guests',
      outletId,
      search,
      tierCode,
      idVerifiedFilter,
      tierCode === 'BLACKLIST',
      page,
      limit,
    ];
  }, [outletId, search, tierCode, idVerifiedFilter, page, limit]);

  const {
    data: guestsData,
    error: guestsError,
    isLoading: isGuestsLoading,
    mutate: mutateGuests,
  } = useSWR<{ crmGuests: GuestPaginationPayload }>(
    guestsKey,
    () =>
      graphqlRequest<{ crmGuests: GuestPaginationPayload }>(GET_CRM_GUESTS, {
        search: search.trim() || undefined,
        tierCode: tierCode !== 'ALL' && tierCode !== 'BLACKLIST' ? tierCode : undefined,
        idVerified: idVerifiedFilter !== null ? idVerifiedFilter : undefined,
        isBlacklisted: tierCode === 'BLACKLIST' ? true : undefined,
        page,
        limit,
      }),
    { revalidateOnFocus: false }
  );

  // SWR for Outlet CRM KPI stats - strictly keyed to outletId
  const statsKey = outletId ? ['crm_guest_stats', outletId] : null;
  const {
    data: statsData,
    error: statsError,
    isLoading: isStatsLoading,
    mutate: mutateStats,
  } = useSWR<{ crmGuestStats: GuestCRMStats }>(
    statsKey,
    () => graphqlRequest<{ crmGuestStats: GuestCRMStats }>(GET_CRM_GUEST_STATS),
    { revalidateOnFocus: false }
  );

  const guests = useMemo(() => guestsData?.crmGuests?.items || [], [guestsData]);
  const totalCount = guestsData?.crmGuests?.totalCount || 0;
  const totalPages = guestsData?.crmGuests?.totalPages || 1;
  const stats = statsData?.crmGuestStats;

  // Selected Guest
  const selectedGuest = useMemo(() => {
    if (!guests.length) return null;
    if (selectedGuestId) {
      const match = guests.find(g => g.id === selectedGuestId);
      if (match) return match;
    }
    return guests[0] || null;
  }, [guests, selectedGuestId]);

  // SWR for Stay History of selected guest - keyed to outletId and guestId
  const staysKey = outletId && selectedGuest?.id ? ['crm_guest_stays', outletId, selectedGuest.id] : null;
  const {
    data: staysData,
    isLoading: isStaysLoading,
    mutate: mutateStays,
  } = useSWR<{ crmGuestStays: GuestStayHistory[] }>(
    staysKey,
    () =>
      graphqlRequest<{ crmGuestStays: GuestStayHistory[] }>(GET_CRM_GUEST_STAYS, {
        guestId: selectedGuest!.id,
      }),
    { revalidateOnFocus: false }
  );

  const stays = staysData?.crmGuestStays || [];

  // Actions
  const createGuest = async (input: CreateGuestInput): Promise<GuestCRMItem> => {
    const res = await graphqlRequest<{ createCrmGuest: GuestCRMItem }>(CREATE_CRM_GUEST, { input });
    await Promise.all([mutateGuests(), mutateStats()]);
    setSelectedGuestId(res.createCrmGuest.id);
    return res.createCrmGuest;
  };

  const updateGuest = async (id: number, input: UpdateGuestInput): Promise<GuestCRMItem> => {
    const res = await graphqlRequest<{ updateCrmGuest: GuestCRMItem }>(UPDATE_CRM_GUEST, { id, input });
    await Promise.all([mutateGuests(), mutateStats()]);
    return res.updateCrmGuest;
  };

  const verifyKyc = async (id: number, input: VerifyKycInput): Promise<GuestCRMItem> => {
    const res = await graphqlRequest<{ verifyGuestKyc: GuestCRMItem }>(VERIFY_GUEST_KYC, { id, input });
    await Promise.all([mutateGuests(), mutateStats()]);
    return res.verifyGuestKyc;
  };

  const addNote = async (guestId: number, note: string): Promise<GuestCRMItem> => {
    const res = await graphqlRequest<{ addGuestCrmNote: GuestCRMItem }>(ADD_GUEST_CRM_NOTE, {
      guestId,
      note,
    });
    await mutateGuests();
    return res.addGuestCrmNote;
  };

  const setBlacklist = async (
    guestId: number,
    isBlacklisted: boolean,
    reason?: string
  ): Promise<GuestCRMItem> => {
    const res = await graphqlRequest<{ setGuestBlacklist: GuestCRMItem }>(SET_GUEST_BLACKLIST, {
      guestId,
      isBlacklisted,
      reason,
    });
    await Promise.all([mutateGuests(), mutateStats()]);
    return res.setGuestBlacklist;
  };

  return {
    guests,
    totalCount,
    totalPages,
    page,
    setPage,
    search,
    setSearch,
    tierCode,
    setTierCode,
    idVerifiedFilter,
    setIdVerifiedFilter,
    selectedGuest,
    selectedGuestId,
    setSelectedGuestId,
    stays,
    isStaysLoading,
    stats,
    isLoading: isGuestsLoading || isStatsLoading,
    error: guestsError?.message || statsError?.message,
    createGuest,
    updateGuest,
    verifyKyc,
    addNote,
    setBlacklist,
    refresh: () => Promise.all([mutateGuests(), mutateStats(), mutateStays()]),
  };
}

