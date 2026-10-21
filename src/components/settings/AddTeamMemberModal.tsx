import type { CountryCode } from 'libphonenumber-js';
import { AlertCircle, Building2, CheckCircle2, Lock, Mail, Shield, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { normalizePhoneNumber } from '../../lib/phone';
import type { CreateMemberInput, TeamRole } from '../../types/team';
import { Button } from '../ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/Dialog';
import { Input } from '../ui/Input';
import { PhoneNumberInput } from '../ui/PhoneNumberInput';

interface AddTeamMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddMember: (input: CreateMemberInput) => Promise<any>;
  currentUserRole?: string;
  activeOutletName?: string;
}

export const AddTeamMemberModal: React.FC<AddTeamMemberModalProps> = ({
  open,
  onOpenChange,
  onAddMember,
  currentUserRole = 'MANAGER',
  activeOutletName = 'Current Property',
}) => {
  const isOwner = currentUserRole === 'OWNER';

  const [name, setName] = useState('');
  const [role, setRole] = useState<TeamRole>('STAFF');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneCountry, setPhoneCountry] = useState<CountryCode>('IN');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user is Manager, force role to STAFF
  useEffect(() => {
    if (!isOwner) {
      setRole('STAFF');
    }
  }, [isOwner, open]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      setName('');
      setEmail('');
      setPhone('');
      setPhoneCountry('IN');
      setPassword('');
      setError(null);
      setRole(isOwner ? 'STAFF' : 'STAFF');
    }
  }, [open, isOwner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Name is required for everyone
    if (!name.trim()) {
      setError('Please provide the full name of the team member.');
      return;
    }

    // 2. WhatsApp / Phone number is MUST for both Manager and Staff
    if (!phone.trim()) {
      setError('WhatsApp / Phone number is required.');
      return;
    }

    const normalizedPhone = normalizePhoneNumber(phone, phoneCountry);
    if (!normalizedPhone) {
      setError('Enter a valid phone number for the selected country.');
      return;
    }

    // 3. Manager validations: Email and Password are MUST
    if (role === 'MANAGER') {
      if (!email.trim()) {
        setError('Email address is required for Manager accounts to enable web dashboard login.');
        return;
      }
      if (!password.trim() || password.trim().length < 6) {
        setError('A password with at least 6 characters is required for Manager web access.');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await onAddMember({
        name: name.trim(),
        role,
        email: email.trim() || undefined,
        phone: normalizedPhone,
        password: role === 'MANAGER' ? password.trim() : undefined,
      });

      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to add team member. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] p-0 overflow-hidden bg-[var(--card)] border-[var(--border)] shadow-2xl rounded-2xl">
        {/* Header */}
        <DialogHeader className="px-5 py-3.5 border-b border-[var(--border)] bg-[var(--muted)]/30">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                Add Team Member
              </DialogTitle>
              <DialogDescription className="text-xs text-[var(--muted-foreground)] mt-0.5">
                {isOwner
                  ? 'Add a property manager with web login or operational staff.'
                  : `Add operational staff to ${activeOutletName}.`}
              </DialogDescription>
            </div>
            {/* Property Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--muted)]/60 border border-[var(--border)] text-[11px] text-[var(--foreground)] font-medium">
              <Building2 className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
              <span className="truncate max-w-[160px]">{activeOutletName}</span>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {error && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Role Selection */}
          <div>
            <label className="block font-semibold text-[var(--foreground)] mb-1 text-[11px] uppercase tracking-wider text-[var(--muted-foreground)]">
              Role & Permissions
            </label>
            {isOwner ? (
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRole('STAFF')}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${role === 'STAFF'
                    ? 'border-[var(--primary)] bg-[var(--primary)]/5 ring-1 ring-[var(--primary)]'
                    : 'border-[var(--border)] hover:bg-[var(--muted)]/40'
                    }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-[var(--muted)] flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5 text-[var(--foreground)]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[var(--foreground)] text-xs">Staff Member</p>
                      <p className="text-[10px] text-[var(--muted-foreground)] truncate">Front Desk / Ops (WhatsApp only)</p>
                    </div>
                  </div>
                  {role === 'STAFF' && <CheckCircle2 className="w-4 h-4 text-[var(--primary)] shrink-0 ml-1.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setRole('MANAGER')}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${role === 'MANAGER'
                    ? 'border-[var(--primary)] bg-[var(--primary)]/5 ring-1 ring-[var(--primary)]'
                    : 'border-[var(--border)] hover:bg-[var(--muted)]/40'
                    }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                      <Shield className="w-3.5 h-3.5 text-indigo-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[var(--foreground)] text-xs">Property Manager</p>
                      <p className="text-[10px] text-[var(--muted-foreground)] truncate">Web Dashboard login access</p>
                    </div>
                  </div>
                  {role === 'MANAGER' && <CheckCircle2 className="w-4 h-4 text-[var(--primary)] shrink-0 ml-1.5" />}
                </button>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-bold text-[var(--foreground)]">Staff Member (Operational)</p>
                  <p className="text-[11px] text-[var(--muted-foreground)]">Front Desk / Housekeeping • Managers manage Staff</p>
                </div>
              </div>
            )}
          </div>

          {/* 2-Column Grid for Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Full Name */}
            <div>
              <label className="block font-medium text-[var(--foreground)] mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Rajesh Sharma"
                required
                className="h-8.5 text-xs"
              />
            </div>

            {/* Email field */}
            <div>
              <label className="block font-medium text-[var(--foreground)] mb-1">
                Email Address {role === 'MANAGER' ? <span className="text-red-500">*</span> : <span className="text-[var(--muted-foreground)] font-normal">(Optional)</span>}
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-[var(--muted-foreground)] absolute left-2.5 top-2.5 pointer-events-none" />
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={role === 'MANAGER' ? 'manager@hotel.com' : 'Optional internal account'}
                  required={role === 'MANAGER'}
                  className="h-8.5 pl-8 text-xs"
                />
              </div>
            </div>

            {/* Phone Number - REQUIRED for both Manager and Staff */}
            <div>
              <label className="block font-medium text-[var(--foreground)] mb-1">
                WhatsApp / Phone Number <span className="text-red-500">*</span>
              </label>
              <PhoneNumberInput
                value={phone}
                country={phoneCountry}
                onChange={(value, country) => { setPhone(value); setPhoneCountry(country); }}
                placeholder="98765 43210"
                required
              />
            </div>

            {/* Password field - MUST for Manager, not required for Staff */}
            <div>
              <label className="block font-medium text-[var(--foreground)] mb-1">
                Password {role === 'MANAGER' ? <span className="text-red-500">*</span> : <span className="text-[var(--muted-foreground)] font-normal">(Not required for Staff)</span>}
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-[var(--muted-foreground)] absolute left-2.5 top-2.5 pointer-events-none" />
                <Input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={role === 'MANAGER' ? 'Minimum 6 characters' : 'Staff accounts do not require password'}
                  disabled={role === 'STAFF'}
                  required={role === 'MANAGER'}
                  className="h-8.5 pl-8 text-xs disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Mobile Property indicator */}
          <div className="sm:hidden flex items-center gap-2 p-2 rounded-lg bg-[var(--muted)]/40 border border-[var(--border)] text-[11px] text-[var(--muted-foreground)]">
            <Building2 className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
            <span>
              Property: <strong className="text-[var(--foreground)] font-semibold">{activeOutletName}</strong>
            </span>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-[var(--border)]">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-8.5 px-4 text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-8.5 px-5 text-xs bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold shadow-sm hover:opacity-90 cursor-pointer"
            >
              {isSubmitting ? 'Adding Member…' : 'Add Team Member'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
