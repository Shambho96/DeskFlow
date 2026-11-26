import React from 'react';
import { Mail, Phone, ShieldAlert, ShieldCheck, Star } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { PhoneNumberDisplay } from '../ui/PhoneNumberDisplay';
import { GuestTableSkeleton } from '../skeletons';
import { cn, formatCurrency } from '../../lib/utils';
import { getGuestTierStyle } from './guestTierUtils';
import type { GuestCRMItem } from '../../types/crm';

interface GuestTableViewProps {
  guests: GuestCRMItem[];
  isLoading: boolean;
  onSelectGuest: (id: number) => void;
  onNewBooking: (params: { guestName: string; phone: string }) => void;
}

export const GuestTableView: React.FC<GuestTableViewProps> = ({
  guests,
  isLoading,
  onSelectGuest,
  onNewBooking,
}) => {
  return (
    <Card className="border-[var(--border)] rounded-2xl shadow-xs overflow-hidden">
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--muted)]/60 text-[var(--muted-foreground)] font-bold text-[11px]">
              <th className="py-3 px-4">Guest Profile</th>
              <th className="py-3 px-4">Contact Details</th>
              <th className="py-3 px-4 text-center">Tier</th>
              <th className="py-3 px-4 text-center">KYC Document</th>
              <th className="py-3 px-4 text-right">Lifetime Spend</th>
              <th className="py-3 px-4 text-center">Total Stays</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          {isLoading ? (
            <GuestTableSkeleton rows={6} />
          ) : (
            <tbody className="divide-y divide-[var(--border)]">
              {guests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[var(--muted-foreground)]">
                    No guest profiles found matching query.
                  </td>
                </tr>
              ) : (
                guests.map(res => {
                  const isVip = res.totalSpend > 25000 || (res.tags && res.tags.length > 1);
                  return (
                    <tr key={res.id} className="hover:bg-[var(--muted)]/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(res.fullName)}`}
                            alt={res.fullName}
                            className="w-8 h-8 rounded-full bg-[var(--muted)] border border-[var(--border)] shrink-0 object-cover"
                          />
                          <div>
                            <div className="font-bold text-sm text-[var(--foreground)] flex items-center gap-1.5">
                              {res.fullName}
                              {isVip && (
                                <span title="VIP Guest">
                                  <Star className="w-3 h-3 fill-[var(--primary)] text-[var(--primary)]" />
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[var(--muted-foreground)] font-mono">
                              Ref: #{res.id} · {res.tierName}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <div className="font-mono text-xs text-[var(--foreground)] flex items-center gap-1">
                            <Phone className="w-3 h-3 text-[var(--primary)]" /> <PhoneNumberDisplay value={res.phone} />
                          </div>
                          <div className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-1">
                            <Mail className="w-3 h-3 text-[var(--muted-foreground)]" /> {res.email || '—'}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={cn('px-2.5 py-1 rounded-full text-xs font-bold border', getGuestTierStyle(res).color)}>
                          {res.tierName}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-mono">
                        <div className="flex items-center justify-center gap-1 text-[11px] text-[var(--foreground)] font-semibold">
                          {res.idVerified ? (
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                          ) : (
                            <ShieldAlert className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                          )}
                          <span>
                            {res.idType || 'Aadhaar'}: {res.idNumber || 'N/A'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-[var(--foreground)] text-xs">
                        {formatCurrency(res.totalSpend)}
                      </td>

                      <td className="py-3 px-4 text-center font-bold font-mono">
                        {res.totalStays}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] font-bold rounded-lg border-[var(--border)] cursor-pointer"
                            onClick={() => onSelectGuest(res.id)}
                          >
                            Profile
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 text-[11px] font-bold bg-[var(--primary)] text-white rounded-lg px-2.5 cursor-pointer"
                            onClick={() => onNewBooking({ guestName: res.fullName, phone: res.phone })}
                          >
                            Book
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          )}
        </table>
      </CardContent>
    </Card>
  );
};
