import React, { useState } from 'react';
import { ShieldCheck, Save, RotateCcw, CheckCircle2, Lock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

interface PermissionItem {
  id: string;
  category: string;
  action: string;
  description: string;
  fd: boolean;
  mgr: boolean;
  gm: boolean;
  hk: boolean;
}

const DEFAULT_PERMISSIONS: PermissionItem[] = [
  // 1. Reservations & Bookings
  {
    id: 'res_create',
    category: 'Reservations & Bookings',
    action: 'Create & Modify Booking',
    description: 'Create new reservations, assign rooms, and edit guest booking dates.',
    fd: true,
    mgr: true,
    gm: true,
    hk: false,
  },
  {
    id: 'res_cancel',
    category: 'Reservations & Bookings',
    action: 'Cancel / Void Booking',
    description: 'Cancel confirmed bookings and manage retention charges.',
    fd: false,
    mgr: true,
    gm: true,
    hk: false,
  },
  {
    id: 'res_vip',
    category: 'Reservations & Bookings',
    action: 'View VIP Guest Profiles & History',
    description: 'Inspect VIP tier status, lifetime spend, and personalized notes.',
    fd: true,
    mgr: true,
    gm: true,
    hk: false,
  },

  // 2. Front Desk & Folio Billing
  {
    id: 'folio_checkin',
    category: 'Front Desk & Billing',
    action: 'Check-In & Check-Out Guests',
    description: 'Execute keycard handovers, complete arrival/departure workflows.',
    fd: true,
    mgr: true,
    gm: true,
    hk: false,
  },
  {
    id: 'folio_charges',
    category: 'Front Desk & Billing',
    action: 'Post Folio Line Charges',
    description: 'Add room charges, restaurant/minibar expenses, and service fees.',
    fd: true,
    mgr: true,
    gm: true,
    hk: false,
  },
  {
    id: 'folio_discount',
    category: 'Front Desk & Billing',
    action: 'Apply Custom Discounts (>10%)',
    description: 'Authorize managerial discounts exceeding the 10% standard desk threshold.',
    fd: false,
    mgr: true,
    gm: true,
    hk: false,
  },
  {
    id: 'folio_settle',
    category: 'Front Desk & Billing',
    action: 'Accept Payments & Close Shift Audit',
    description: 'Record cash, UPI, or card settlements and print shift cash summary.',
    fd: true,
    mgr: true,
    gm: true,
    hk: false,
  },

  // 3. Rooms & Housekeeping
  {
    id: 'room_clean_override',
    category: 'Rooms & Housekeeping',
    action: 'Update Room Cleanliness Status',
    description: 'Mark rooms Dirty, Cleaning, Clean, or Inspected.',
    fd: true,
    mgr: true,
    gm: true,
    hk: true,
  },
  {
    id: 'room_maintenance',
    category: 'Rooms & Housekeeping',
    action: 'Mark Out of Order (OOO)',
    description: 'Take rooms offline for maintenance or repairs.',
    fd: false,
    mgr: true,
    gm: true,
    hk: true,
  },

  // 4. Administration & Configuration
  {
    id: 'admin_pricing',
    category: 'Administration & Configuration',
    action: 'Update Base Room Rates & Plans',
    description: 'Change seasonal room tariffs, dynamic rate rules, and taxes.',
    fd: false,
    mgr: true,
    gm: true,
    hk: false,
  },
  {
    id: 'admin_hotel_profile',
    category: 'Administration & Configuration',
    action: 'Configure Hotel GST & Property Settings',
    description: 'Edit GSTIN, legal branding, bank accounts, and invoice prefix.',
    fd: false,
    mgr: false,
    gm: true,
    hk: false,
  },
  {
    id: 'admin_team_logins',
    category: 'Administration & Configuration',
    action: 'Manage Staff Logins & Passwords',
    description: 'Create new employee credentials, lock accounts, and reset access.',
    fd: false,
    mgr: false,
    gm: true,
    hk: false,
  },
];

export const RolePermissionsTab: React.FC = () => {
  const [permissions, setPermissions] = useState<PermissionItem[]>(DEFAULT_PERMISSIONS);
  const [isSaved, setIsSaved] = useState(false);

  const handleToggle = (id: string, role: 'fd' | 'mgr' | 'gm' | 'hk') => {
    // General Manager permissions are permanently locked for security
    if (role === 'gm') return;

    setPermissions(prev =>
      prev.map(p => (p.id === id ? { ...p, [role]: !p[role] } : p))
    );
    setIsSaved(false);
  };

  const handleReset = () => {
    if (window.confirm('Reset all role capabilities to factory defaults?')) {
      setPermissions(DEFAULT_PERMISSIONS);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const categories = Array.from(new Set(permissions.map(p => p.category)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--foreground)] tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[var(--primary)]" />
            Role Permissions &amp; Access Matrix
          </h2>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Define granular operational capabilities for Front Desk, Shift Managers, Housekeeping, and General Managers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isSaved && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" /> Saved
            </span>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="text-xs h-8 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="text-xs h-8 bg-[var(--primary)] text-white font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" /> Save Changes
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {categories.map(cat => {
          const catPermissions = permissions.filter(p => p.category === cat);
          return (
            <Card key={cat} className="overflow-hidden">
              <CardHeader className="p-4 border-b border-[var(--border)] bg-[var(--muted)]/40 flex items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                  {cat}
                </CardTitle>
                <span className="text-[11px] text-[var(--muted-foreground)]">
                  {catPermissions.length} capabilities
                </span>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--muted)]/10 font-bold text-[var(--muted-foreground)]">
                      <th className="py-3 px-4 w-1/2">Capability</th>
                      <th className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-[var(--foreground)] font-bold">Front Desk</span>
                          <span className="text-[10px] text-[var(--muted-foreground)] font-normal">Operator</span>
                        </div>
                      </th>
                      <th className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-[var(--foreground)] font-bold">Shift Manager</span>
                          <span className="text-[10px] text-[var(--muted-foreground)] font-normal">Supervisor</span>
                        </div>
                      </th>
                      <th className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-[var(--foreground)] font-bold">Housekeeper</span>
                          <span className="text-[10px] text-[var(--muted-foreground)] font-normal">Floor Staff</span>
                        </div>
                      </th>
                      <th className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-[var(--foreground)] font-bold">General Mgr</span>
                          <span className="text-[10px] text-amber-500 font-normal flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" /> Full Root
                          </span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {catPermissions.map(perm => (
                      <tr key={perm.id} className="hover:bg-[var(--muted)]/20 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-[var(--foreground)] block">
                            {perm.action}
                          </span>
                          <span className="text-[11px] text-[var(--muted-foreground)]">
                            {perm.description}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={perm.fd}
                            onChange={() => handleToggle(perm.id, 'fd')}
                            className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={perm.mgr}
                            onChange={() => handleToggle(perm.id, 'mgr')}
                            className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={perm.hk}
                            onChange={() => handleToggle(perm.id, 'hk')}
                            className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={perm.gm}
                            disabled
                            className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] opacity-60 cursor-not-allowed"
                            title="General Manager capabilities are permanently granted"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

