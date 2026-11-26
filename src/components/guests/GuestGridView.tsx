import React from 'react';
import { Phone, ShieldAlert, ShieldCheck, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { PhoneNumberDisplay } from '../ui/PhoneNumberDisplay';
import { GuestGridSkeleton } from '../skeletons';
import { cn, formatCurrency } from '../../lib/utils';
import { getGuestTierStyle } from './guestTierUtils';
import type { GuestCRMItem } from '../../types/crm';

interface GuestGridViewProps {
  guests: GuestCRMItem[];
  isLoading: boolean;
  onSelectGuest: (id: number) => void;
  onNewBooking: (params: { guestName: string; phone: string }) => void;
}

export const GuestGridView: React.FC<GuestGridViewProps> = ({
  guests,
  isLoading,
  onSelectGuest,
  onNewBooking,
}) => {
  if (isLoading) {
    return <GuestGridSkeleton count={6} />;
  }

  if (guests.length === 0) {
    return (
      <div className="p-12 text-center text-xs text-[var(--muted-foreground)] bg-[var(--card)] border border-[var(--border)] rounded-2xl">
        No guest profiles found matching query.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {guests.map(res => {
        const isVip = res.totalSpend > 25000 || (res.tags && res.tags.length > 1);
        return (
          <Card
            key={res.id}
            className="border-[var(--border)] bg-[var(--card)] rounded-2xl hover:border-[var(--primary)]/50 transition-all shadow-xs flex flex-col justify-between"
          >
            <div>
              <CardHeader className="p-4 border-b border-[var(--border)] flex flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(res.fullName)}`}
                    alt={res.fullName}
                    className="w-10 h-10 rounded-full bg-[var(--muted)] border border-[var(--border)] shrink-0 object-cover"
                  />
                  <div className="min-w-0">
                    <CardTitle className="text-sm font-bold flex items-center gap-1.5 truncate text-[var(--foreground)]">
                      <span className="truncate">{res.fullName}</span>
                      {res.idVerified ? (
                        <span title="KYC ID Verified">
                          <ShieldCheck className="w-4 h-4 text-[var(--primary)] shrink-0" />
                        </span>
                      ) : (
                        <span title="Unverified Document">
                          <ShieldAlert className="w-4 h-4 text-[var(--muted-foreground)] shrink-0" />
                        </span>
                      )}
                    </CardTitle>
                    <p className="text-[10px] text-[var(--muted-foreground)] font-mono truncate">
                      Tier: {res.tierName} · #{res.id}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded-full border', getGuestTierStyle(res).color)}>
                    {res.tierName}
                  </span>
                  {isVip && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/30 flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-[var(--primary)] text-[var(--primary)]" /> VIP
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 text-[var(--muted-foreground)] bg-[var(--muted)]/40 p-2.5 rounded-xl border border-[var(--border)]">
                  <div>
                    <span className="block text-[10px] font-bold text-[var(--muted-foreground)]">Phone Contact</span>
                    <span className="text-[var(--foreground)] font-mono font-bold flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-[var(--primary)]" /> <PhoneNumberDisplay value={res.phone} />
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-[var(--muted-foreground)]">Visits / Spend</span>
                    <span className="text-[var(--primary)] font-mono font-extrabold mt-0.5 block">
                      {res.totalStays} Stays · {formatCurrency(res.totalSpend)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </div>

            <div className="p-4 pt-0 flex items-center justify-between gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs font-bold rounded-xl flex-1 border-[var(--border)] cursor-pointer"
                onClick={() => onSelectGuest(res.id)}
              >
                View Dossier
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs font-bold bg-[var(--primary)] text-white rounded-xl flex-1 cursor-pointer"
                onClick={() => onNewBooking({ guestName: res.fullName, phone: res.phone })}
              >
                Book Room
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
