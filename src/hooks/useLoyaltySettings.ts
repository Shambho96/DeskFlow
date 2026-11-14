import { useState } from 'react';
import useSWR from 'swr';
import { graphqlRequest } from '../lib/graphql';
import { useUser } from './useUser';
import type { LoyaltyTier, LoyaltyTierInput } from '../types/crm';

export const GET_LOYALTY_TIERS = `
  query GetLoyaltyTiers {
    loyaltyTiers {
      id
      tierCode
      name
      minSpend
      minStays
      discountPercent
      badgeColor
      perks
      displayOrder
      isActive
    }
  }
`;

const SAVE_LOYALTY_TIERS = `
  mutation SaveLoyaltyTiers($tiers: [LoyaltyTierInput!]!) {
    saveLoyaltyTiers(tiers: $tiers) {
      id
      tierCode
      name
      minSpend
      minStays
      discountPercent
      badgeColor
      perks
      displayOrder
      isActive
    }
  }
`;

export function useLoyaltySettings() {
  const { user } = useUser();
  const outletId = user?.active_outlet_id ? Number(user.active_outlet_id) : null;
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const swrKey = outletId ? ['loyalty_tiers', outletId] : null;
  const { data, error, isLoading, mutate } = useSWR<{ loyaltyTiers: LoyaltyTier[] }>(
    swrKey,
    () => graphqlRequest<{ loyaltyTiers: LoyaltyTier[] }>(GET_LOYALTY_TIERS),
    {
      revalidateOnFocus: false,
    }
  );

  const tiers: LoyaltyTier[] = data?.loyaltyTiers || [];

  const saveTiers = async (updatedTiers: LoyaltyTierInput[]): Promise<LoyaltyTier[]> => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const res = await graphqlRequest<{ saveLoyaltyTiers: LoyaltyTier[] }>(SAVE_LOYALTY_TIERS, {
        tiers: updatedTiers,
      });
      await mutate(
        { loyaltyTiers: res.saveLoyaltyTiers },
        { revalidate: false }
      );
      return res.saveLoyaltyTiers;
    } catch (err: any) {
      const msg = err.message || 'Failed to save loyalty tiers';
      setSaveError(msg);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    tiers,
    isLoading,
    isSaving,
    error: error?.message || saveError,
    saveTiers,
    mutate,
  };
}

