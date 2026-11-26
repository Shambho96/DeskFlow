import React, { useState } from 'react';
import type { CountryCode } from 'libphonenumber-js';
import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { PhoneNumberInput } from '../ui/PhoneNumberInput';
import { normalizePhoneNumber } from '../../lib/phone';
import type { CreateGuestInput } from '../../types/crm';

interface CreateGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateGuestInput) => Promise<unknown>;
}

export const CreateGuestModal: React.FC<CreateGuestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [newGuestPhoneCountry, setNewGuestPhoneCountry] = useState<CountryCode>('IN');
  const [newGuestPhoneError, setNewGuestPhoneError] = useState('');
  const [newGuestEmail, setNewGuestEmail] = useState('');
  const [newGuestIdType, setNewGuestIdType] = useState('Passport');
  const [newGuestIdNum, setNewGuestIdNum] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim()) return;

    const normalized = normalizePhoneNumber(newGuestPhone, newGuestPhoneCountry);
    if (!normalized) {
      setNewGuestPhoneError('Enter a valid phone number for the selected country.');
      return;
    }

    const parts = newGuestName.trim().split(' ');
    const firstName = parts[0] || 'Guest';
    const lastName = parts.slice(1).join(' ') || '-';

    const input: CreateGuestInput = {
      firstName,
      lastName,
      phone: normalized,
      email: newGuestEmail.trim() || undefined,
      idType: newGuestIdType.toUpperCase(),
      idNumber: newGuestIdNum.trim() || undefined,
      idVerified: Boolean(newGuestIdNum.trim()),
    };

    setIsSubmitting(true);
    try {
      await onSubmit(input);
      onClose();
      setNewGuestName('');
      setNewGuestPhone('');
      setNewGuestPhoneError('');
      setNewGuestEmail('');
      setNewGuestIdNum('');
    } catch (err: any) {
      alert(err.message || 'Failed to create guest profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[calc(100dvh-2rem)] overflow-y-auto bg-[var(--card)] border-[var(--border)] rounded-2xl shadow-2xl">
        <CardHeader className="p-4 border-b border-[var(--border)] flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--primary)]" /> Add New Guest CRM Profile
          </CardTitle>
          <button
            onClick={onClose}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-bold cursor-pointer"
          >
            ✕
          </button>
        </CardHeader>
        <CardContent className="p-5 space-y-3 text-xs">
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">
                Full Guest Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. Marcus Vance"
                value={newGuestName}
                onChange={e => setNewGuestName(e.target.value)}
                required
                className="h-9 text-xs rounded-xl"
              />
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <PhoneNumberInput
                  value={newGuestPhone}
                  country={newGuestPhoneCountry}
                  onChange={(value, country) => {
                    setNewGuestPhone(value);
                    setNewGuestPhoneCountry(country);
                    setNewGuestPhoneError('');
                  }}
                  placeholder="98765 43210"
                  required
                  className="[&>div]:h-12 [&_button]:px-4 [&_input]:text-base"
                />
                {newGuestPhoneError && (
                  <p className="mt-1 text-[10px] font-semibold text-[var(--destructive)]">{newGuestPhoneError}</p>
                )}
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">Email Address</label>
                <Input
                  placeholder="guest@example.com"
                  type="email"
                  value={newGuestEmail}
                  onChange={e => setNewGuestEmail(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">ID Document Type</label>
                <select
                  value={newGuestIdType}
                  onChange={e => setNewGuestIdType(e.target.value)}
                  className="w-full h-9 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 text-xs font-semibold text-[var(--foreground)] shadow-xs focus:outline-none focus:border-[var(--primary)] cursor-pointer"
                >
                  <option value="Passport">Passport</option>
                  <option value="Aadhaar">Aadhaar Card</option>
                  <option value="Driver License">Driver License</option>
                  <option value="Voter ID">Voter ID</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">ID Number</label>
                <Input
                  placeholder="P9481203"
                  value={newGuestIdNum}
                  onChange={e => setNewGuestIdNum(e.target.value)}
                  className="h-9 text-xs rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border)] flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 text-xs font-bold rounded-xl"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="h-9 text-xs font-bold rounded-xl bg-[var(--primary)] text-white px-4"
              >
                {isSubmitting ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
