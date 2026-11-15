import React, { useState } from 'react';
import { Building2, Save, CheckCircle2, Clock, MapPin, Receipt, Phone, Mail, Globe } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useUser } from '../../hooks/useUser';
import { useOutlets } from '../../hooks/useOutlets';

export const PropertyProfileTab: React.FC = () => {
  const { user } = useUser();
  const { outlets } = useOutlets(Boolean(user));
  const activeOutlet = outlets.find(o => o.id === Number(user?.active_outlet_id));

  const [hotelName, setHotelName] = useState(activeOutlet?.name || 'Grand Azure Hotel & Suites');
  const [legalEntity, setLegalEntity] = useState('Azure Hospitality Pvt Ltd');
  const [gstin, setGstin] = useState('29AAAAA0000A1Z5');
  const [pan, setPan] = useState('AAAAA0000A');
  const [invoicePrefix, setInvoicePrefix] = useState('INV-2026-');
  const [startingNumber, setStartingNumber] = useState('1001');
  const [email, setEmail] = useState('frontdesk@grandazure.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [website, setWebsite] = useState('https://grandazure.example.com');
  const [address, setAddress] = useState('124 Beachfront Boulevard, Central District');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('560001');
  const [checkInTime, setCheckInTime] = useState('14:00');
  const [checkOutTime, setCheckOutTime] = useState('11:00');
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--foreground)] tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[var(--primary)]" />
            Property Identity &amp; Tax Configuration
          </h2>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Configure legal business details, GSTIN, invoice prefix, contact information, and operational check-in pacing.
          </p>
        </div>
        {isSaved && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Changes Saved
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Legal Entity & Branding */}
        <Card>
          <CardHeader className="p-4 sm:p-5 border-b border-[var(--border)] bg-[var(--muted)]/20">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-[var(--foreground)]">
              <Building2 className="w-4 h-4 text-[var(--primary)]" /> Hotel Brand &amp; Legal Entity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[var(--muted-foreground)] mb-1.5">
                  Hotel Display Name (Guest Facing)
                </label>
                <Input
                  value={hotelName}
                  onChange={e => setHotelName(e.target.value)}
                  placeholder="e.g. Grand Azure Hotel & Suites"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-[var(--muted-foreground)] mb-1.5">
                  Registered Legal Entity Name
                </label>
                <Input
                  value={legalEntity}
                  onChange={e => setLegalEntity(e.target.value)}
                  placeholder="e.g. Azure Hospitality Private Limited"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[var(--muted-foreground)] mb-1.5">
                  GSTIN Tax Registration Number
                </label>
                <Input
                  value={gstin}
                  onChange={e => setGstin(e.target.value.toUpperCase())}
                  placeholder="29AAAAA0000A1Z5"
                  className="font-mono uppercase"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-[var(--muted-foreground)] mb-1.5">
                  Corporate PAN
                </label>
                <Input
                  value={pan}
                  onChange={e => setPan(e.target.value.toUpperCase())}
                  placeholder="AAAAA0000A"
                  className="font-mono uppercase"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Billing & Folio Invoice Settings */}
        <Card>
          <CardHeader className="p-4 sm:p-5 border-b border-[var(--border)] bg-[var(--muted)]/20">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-[var(--foreground)]">
              <Receipt className="w-4 h-4 text-[var(--primary)]" /> Folio Billing &amp; Invoicing
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[var(--muted-foreground)] mb-1.5">
                  Tax Invoice Number Prefix
                </label>
                <Input
                  value={invoicePrefix}
                  onChange={e => setInvoicePrefix(e.target.value)}
                  placeholder="e.g. INV-2026-"
                  className="font-mono"
                  required
                />
                <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
                  Appended before receipt numbers: e.g. {invoicePrefix}{startingNumber}
                </p>
              </div>
              <div>
                <label className="block font-semibold text-[var(--muted-foreground)] mb-1.5">
                  Next Sequence Starting Number
                </label>
                <Input
                  type="number"
                  value={startingNumber}
                  onChange={e => setStartingNumber(e.target.value)}
                  className="font-mono"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Contact & Location */}
        <Card>
          <CardHeader className="p-4 sm:p-5 border-b border-[var(--border)] bg-[var(--muted)]/20">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-[var(--foreground)]">
              <MapPin className="w-4 h-4 text-[var(--primary)]" /> Contact &amp; Physical Address
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-[var(--muted-foreground)] mb-1.5 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> Front Desk Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="frontdesk@hotel.com"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-[var(--muted-foreground)] mb-1.5 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> Official Phone / PBX
                </label>
                <Input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-[var(--muted-foreground)] mb-1.5 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" /> Website
                </label>
                <Input
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[var(--muted-foreground)] mb-1.5">
                Street Address (Printed on Guest Folio)
              </label>
              <Input
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Building name, street, locality..."
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-[var(--muted-foreground)] mb-1.5">City</label>
                <Input value={city} onChange={e => setCity(e.target.value)} required />
              </div>
              <div>
                <label className="block font-semibold text-[var(--muted-foreground)] mb-1.5">State</label>
                <Input value={state} onChange={e => setState(e.target.value)} required />
              </div>
              <div>
                <label className="block font-semibold text-[var(--muted-foreground)] mb-1.5">PIN / Postal Code</label>
                <Input value={pincode} onChange={e => setPincode(e.target.value)} className="font-mono" required />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Operating Hours */}
        <Card>
          <CardHeader className="p-4 sm:p-5 border-b border-[var(--border)] bg-[var(--muted)]/20">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-[var(--foreground)]">
              <Clock className="w-4 h-4 text-[var(--primary)]" /> Standard Check-in &amp; Check-out Times
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[var(--muted-foreground)] mb-1.5">
                  Standard Check-in Time
                </label>
                <Input
                  type="time"
                  value={checkInTime}
                  onChange={e => setCheckInTime(e.target.value)}
                  required
                />
                <span className="text-[10px] text-[var(--muted-foreground)] mt-1 block">
                  Default earliest arrival for reservation calculations (typically 14:00 / 2:00 PM).
                </span>
              </div>
              <div>
                <label className="block font-semibold text-[var(--muted-foreground)] mb-1.5">
                  Standard Check-out Time
                </label>
                <Input
                  type="time"
                  value={checkOutTime}
                  onChange={e => setCheckOutTime(e.target.value)}
                  required
                />
                <span className="text-[10px] text-[var(--muted-foreground)] mt-1 block">
                  Default departure cut-off time for housekeeping turnarounds (typically 11:00 / 11:00 AM).
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" className="bg-[var(--primary)] text-white font-bold h-9 px-6 flex items-center gap-1.5 cursor-pointer">
            <Save className="w-4 h-4" /> Save Configuration
          </Button>
        </div>
      </form>
    </div>
  );
};

