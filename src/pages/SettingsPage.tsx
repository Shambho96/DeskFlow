import React, { useState } from 'react';
import { Building, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';

export const SettingsPage: React.FC = () => {
  const [hotelName, setHotelName] = useState('DeskFlow — Grand Azure Hotel & Suites');
  const [gstin, setGstin] = useState('29AAAAA0000A1Z5');
  const [email, setEmail] = useState('frontdesk@deskflow.app');
  const [invoicePrefix, setInvoicePrefix] = useState('DF-INV-2026-');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('✅ Settings saved successfully!');
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Hotel Settings & Configuration</h1>
          <p className="text-xs text-[var(--muted-foreground)]">Branding and role permissions matrix</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full justify-start border-b border-[var(--border)] rounded-none bg-transparent p-0 h-auto gap-0 overflow-x-auto no-scrollbar">
          <TabsTrigger value="profile" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--primary)] font-bold text-xs whitespace-nowrap px-3 py-2.5">
            Profile & Branding
          </TabsTrigger>
          <TabsTrigger value="roles" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--primary)] font-bold text-xs whitespace-nowrap px-3 py-2.5">
            Role Permissions
          </TabsTrigger>
        </TabsList>

        {/* SUB-TAB 1: PROFILE & BRANDING */}
        <TabsContent value="profile" className="pt-4">
          <Card className="max-w-xl mx-auto">
            <CardHeader className="p-5 border-b border-[var(--border)]">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Building className="w-5 h-5 text-[var(--primary)]" /> Property Identity & Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[var(--muted-foreground)] mb-1">
                    Hotel / Property Legal Name
                  </label>
                  <Input value={hotelName} onChange={e => setHotelName(e.target.value)} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[var(--muted-foreground)] mb-1">
                      GSTIN / VAT Tax Registration
                    </label>
                    <Input value={gstin} onChange={e => setGstin(e.target.value)} />
                  </div>
                  <div>
                    <label className="block font-semibold text-[var(--muted-foreground)] mb-1">
                      Invoice Prefix
                    </label>
                    <Input value={invoicePrefix} onChange={e => setInvoicePrefix(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--muted-foreground)] mb-1">
                    Front Desk Operations Email
                  </label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
                </div>

                <Button type="submit" className="w-full bg-[var(--primary)] text-white font-bold h-9">
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SUB-TAB 3: ROLE PERMISSIONS MATRIX */}
        <TabsContent value="roles" className="pt-4">
          <Card>
            <CardHeader className="p-5 border-b border-[var(--border)]">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[var(--primary)]" /> Role Permissions Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--muted)] font-bold text-[var(--muted-foreground)]">
                    <th className="p-3">Permission Capability</th>
                    <th className="p-3 text-center">Front Desk</th>
                    <th className="p-3 text-center">Manager</th>
                    <th className="p-3 text-center">Housekeeper</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {[
                    { action: 'Create & Modify Booking', fd: true, mgr: true, hk: false },
                    { action: 'Delete / Cancel Booking', fd: false, mgr: true, hk: false },
                    { action: 'Give >10% Discount', fd: false, mgr: true, hk: false },
                    { action: 'Override Room Cleanliness Status', fd: true, mgr: true, hk: true },
                    { action: 'Close Shift & Export Cash Audit', fd: true, mgr: true, hk: false },
                    { action: 'Configure GST & Hotel Profile', fd: false, mgr: true, hk: false }
                  ].map((perm, idx) => (
                    <tr key={idx} className="hover:bg-[var(--muted)]/20">
                      <td className="p-3 font-semibold text-[var(--foreground)]">{perm.action}</td>
                      <td className="p-3 text-center">
                        <input type="checkbox" defaultChecked={perm.fd} className="rounded border-[var(--border)] text-[var(--primary)]" />
                      </td>
                      <td className="p-3 text-center">
                        <input type="checkbox" defaultChecked={perm.mgr} className="rounded border-[var(--border)] text-[var(--primary)]" />
                      </td>
                      <td className="p-3 text-center">
                        <input type="checkbox" defaultChecked={perm.hk} className="rounded border-[var(--border)] text-[var(--primary)]" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
