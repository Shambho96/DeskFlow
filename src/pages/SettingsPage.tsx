import React, { useState } from 'react';
import { Building, Percent, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { formatCurrency } from '../lib/utils';

export const SettingsPage: React.FC = () => {
  const [hotelName, setHotelName] = useState('DeskFlow — Grand Azure Hotel & Suites');
  const [gstin, setGstin] = useState('29AAAAA0000A1Z5');
  const [email, setEmail] = useState('frontdesk@deskflow.app');
  const [invoicePrefix, setInvoicePrefix] = useState('DF-INV-2026-');

  // Simulator state for dual-slab GST
  const [simPrice, setSimPrice] = useState(4200);

  const calculateGst = (price: number) => {
    if (price < 1000) return { rate: 0, tax: 0 };
    if (price <= 7500) return { rate: 12, tax: Math.round(price * 0.12) };
    return { rate: 18, tax: Math.round(price * 0.18) };
  };

  const simResult = calculateGst(simPrice);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('✅ Settings saved successfully!');
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Hotel Settings & Configuration</h1>
          <p className="text-xs text-[var(--muted-foreground)]">Branding, tax rules simulator, and role permissions matrix</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full justify-start border-b border-[var(--border)] rounded-none bg-transparent p-0 h-11 gap-6">
          <TabsTrigger value="profile" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--primary)] font-bold text-xs">
            1. Profile & Branding
          </TabsTrigger>
          <TabsTrigger value="taxes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--primary)] font-bold text-xs">
            2. Taxes & Policies (GST Simulator)
          </TabsTrigger>
          <TabsTrigger value="roles" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--primary)] font-bold text-xs">
            3. Role Permissions Matrix
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

                <div className="grid grid-cols-2 gap-4">
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

        {/* SUB-TAB 2: TAXES & POLICIES (DUAL SLAB GST SIMULATOR) */}
        <TabsContent value="taxes" className="pt-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Policies */}
            <Card>
              <CardHeader className="p-5 border-b border-[var(--border)]">
                <CardTitle className="text-base font-bold">Standard Check-In & Check-Out Policies</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[var(--muted-foreground)] mb-1">Check-in Time</label>
                    <Input type="time" defaultValue="14:00" />
                  </div>
                  <div>
                    <label className="block font-semibold text-[var(--muted-foreground)] mb-1">Check-out Time</label>
                    <Input type="time" defaultValue="11:00" />
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)]">
                  Grace Period: 30 Minutes before overstay penalty activates.
                </div>
              </CardContent>
            </Card>

            {/* GST Simulator */}
            <Card className="border-[var(--primary)]/40">
              <CardHeader className="p-5 border-b border-[var(--border)]">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Percent className="w-5 h-5 text-[var(--primary)]" /> Dual-Slab GST Rule Simulator
                </CardTitle>
                <p className="text-xs text-[var(--muted-foreground)]">Automated Indian GST calculation based on tariff slabs</p>
              </CardHeader>

              <CardContent className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[var(--muted-foreground)] mb-1">
                    Enter Room Price Per Night (₹)
                  </label>
                  <Input
                    type="number"
                    value={simPrice}
                    onChange={e => setSimPrice(Number(e.target.value))}
                  />
                </div>

                <div className="p-4 rounded-xl bg-[var(--background)] border border-[var(--border)] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[var(--muted-foreground)]">Applicable GST Rate:</span>
                    <Badge variant={simResult.rate === 0 ? 'clean' : 'dirty'} className="font-bold">
                      {simResult.rate}% GST
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted-foreground)]">Tax Amount:</span>
                    <span className="font-bold text-amber-500">{formatCurrency(simResult.tax)}</span>
                  </div>
                  <div className="pt-2 border-t border-[var(--border)] flex justify-between font-extrabold text-sm">
                    <span>Total Billable Per Night:</span>
                    <span className="text-[var(--primary)]">{formatCurrency(simPrice + simResult.tax)}</span>
                  </div>
                </div>

                <div className="text-[10px] text-[var(--muted-foreground)] space-y-1">
                  <p>• Below ₹1,000 → 0% Exempt</p>
                  <p>• ₹1,000 to ₹7,500 → 12% Standard GST</p>
                  <p>• Above ₹7,500 → 18% Luxury GST</p>
                </div>
              </CardContent>
            </Card>
          </div>
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
