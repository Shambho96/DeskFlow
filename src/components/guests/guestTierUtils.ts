import type { GuestCRMItem } from '../../types/crm';

export interface GuestTierStyle {
  id: string;
  name: string;
  color: string;
  badge: string;
}

export const getGuestTierStyle = (guest: GuestCRMItem): GuestTierStyle => {
  const code = (guest.tierCode || 'BRONZE').toUpperCase();
  if (code === 'PLATINUM') {
    return {
      id: 'PLATINUM',
      name: guest.tierName || 'Platinum',
      color: 'text-[var(--primary)] bg-[var(--primary)]/15 border-[var(--primary)]/30',
      badge: '💎 PLATINUM',
    };
  }
  if (code === 'GOLD') {
    return {
      id: 'GOLD',
      name: guest.tierName || 'Gold',
      color: 'text-amber-600 dark:text-amber-400 bg-amber-500/15 border-amber-500/30',
      badge: '🥇 GOLD',
    };
  }
  if (code === 'SILVER') {
    return {
      id: 'SILVER',
      name: guest.tierName || 'Silver',
      color: 'text-[var(--foreground)] bg-[var(--muted)] border-[var(--border)]',
      badge: '🥈 SILVER',
    };
  }
  return {
    id: 'BRONZE',
    name: guest.tierName || 'Bronze',
    color: 'text-[var(--muted-foreground)] bg-[var(--muted)]/60 border-[var(--border)]',
    badge: '🏅 BRONZE',
  };
};
