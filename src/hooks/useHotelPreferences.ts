import { useState } from 'react';
import useSWR from 'swr';
import { graphqlRequest } from '../lib/graphql';
import { useUser } from './useUser';
import type {
  HotelSpecialRequest,
  HotelSpecialRequestInput,
  HotelGuestTag,
  HotelGuestTagInput,
} from '../types/hotelConfig';

export const GET_HOTEL_SPECIAL_REQUESTS = `
  query GetHotelSpecialRequests($outletId: Int) {
    hotelSpecialRequests(outletId: $outletId) {
      id
      clientId
      outletId
      code
      label
      category
      isChargeable
      price
      icon
      displayOrder
      isActive
    }
  }
`;

export const GET_HOTEL_GUEST_TAGS = `
  query GetHotelGuestTags($outletId: Int) {
    hotelGuestTags(outletId: $outletId) {
      id
      clientId
      outletId
      name
      color
      category
      description
      displayOrder
      isActive
    }
  }
`;

export const SAVE_HOTEL_SPECIAL_REQUESTS = `
  mutation SaveHotelSpecialRequests($items: [HotelSpecialRequestInput!]!, $outletId: Int) {
    saveHotelSpecialRequests(items: $items, outletId: $outletId) {
      id
      clientId
      outletId
      code
      label
      category
      isChargeable
      price
      icon
      displayOrder
      isActive
    }
  }
`;

export const SAVE_HOTEL_GUEST_TAGS = `
  mutation SaveHotelGuestTags($items: [HotelGuestTagInput!]!, $outletId: Int) {
    saveHotelGuestTags(items: $items, outletId: $outletId) {
      id
      clientId
      outletId
      name
      color
      category
      description
      displayOrder
      isActive
    }
  }
`;

export function useHotelPreferences() {
  const { user } = useUser();
  const outletId = user?.active_outlet_id ? Number(user.active_outlet_id) : null;
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const swrKeyReqs = outletId ? ['hotel_special_requests', outletId] : null;
  const {
    data: reqsData,
    error: reqsError,
    isLoading: reqsLoading,
    mutate: mutateReqs,
  } = useSWR<{ hotelSpecialRequests: HotelSpecialRequest[] }>(
    swrKeyReqs,
    () =>
      graphqlRequest<{ hotelSpecialRequests: HotelSpecialRequest[] }>(
        GET_HOTEL_SPECIAL_REQUESTS,
        { outletId }
      ),
    { revalidateOnFocus: false }
  );

  const swrKeyTags = outletId ? ['hotel_guest_tags', outletId] : null;
  const {
    data: tagsData,
    error: tagsError,
    isLoading: tagsLoading,
    mutate: mutateTags,
  } = useSWR<{ hotelGuestTags: HotelGuestTag[] }>(
    swrKeyTags,
    () =>
      graphqlRequest<{ hotelGuestTags: HotelGuestTag[] }>(
        GET_HOTEL_GUEST_TAGS,
        { outletId }
      ),
    { revalidateOnFocus: false }
  );

  const specialRequests = reqsData?.hotelSpecialRequests || [];
  const guestTags = tagsData?.hotelGuestTags || [];

  const activeSpecialRequests = specialRequests.filter((r) => r.isActive);
  const activeGuestTags = guestTags.filter((t) => t.isActive);

  const saveRequests = async (
    items: HotelSpecialRequestInput[]
  ): Promise<HotelSpecialRequest[]> => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const res = await graphqlRequest<{
        saveHotelSpecialRequests: HotelSpecialRequest[];
      }>(SAVE_HOTEL_SPECIAL_REQUESTS, {
        items,
        outletId,
      });
      await mutateReqs(
        { hotelSpecialRequests: res.saveHotelSpecialRequests },
        { revalidate: false }
      );
      return res.saveHotelSpecialRequests;
    } catch (err: any) {
      const msg = err.message || 'Failed to save special requests';
      setSaveError(msg);
      throw new Error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const saveTags = async (
    items: HotelGuestTagInput[]
  ): Promise<HotelGuestTag[]> => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const res = await graphqlRequest<{
        saveHotelGuestTags: HotelGuestTag[];
      }>(SAVE_HOTEL_GUEST_TAGS, {
        items,
        outletId,
      });
      await mutateTags(
        { hotelGuestTags: res.saveHotelGuestTags },
        { revalidate: false }
      );
      return res.saveHotelGuestTags;
    } catch (err: any) {
      const msg = err.message || 'Failed to save guest tags';
      setSaveError(msg);
      throw new Error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    specialRequests,
    guestTags,
    activeSpecialRequests,
    activeGuestTags,
    isLoading: reqsLoading || tagsLoading,
    error: reqsError || tagsError,
    isSaving,
    saveError,
    saveRequests,
    saveTags,
    mutateReqs,
    mutateTags,
  };
}
