import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Shield, User, Lock, Mail, Phone, AlertCircle, Building2, CheckCircle2 } from 'lucide-react';
import type { TeamRole, TeamMember, UpdateMemberInput } from '../../types/team';

interface EditTeamMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember | null;
  onUpdateMember: (input: UpdateMemberInput) => Promise<any>;
  currentUserRole?: string;
  activeOutletName?: string;
}

export const EditTeamMemberModal: React.FC<EditTeamMemberModalProps> = ({
  open,
  onOpenChange,
  member,
  onUpdateMember,
  currentUserRole = 'MANAGER',
  activeOutletName = 'Current Property',
}) => {
  const isOwner = currentUserRole === 'OWNER';

  const [name, setName] = useState('');
  const [role, setRole] = useState<TeamRole>('STAFF');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize state when modal opens or target member changes
  useEffect(() => {
    if (member && open) {
      setName(member.name || '');
      setRole(member.role);
      setEmail(member.email || '');
      setPhone(member.phone || '');
      setPassword('');
      setError(null);
    }
  }, [member, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;
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

    // 3. Manager validations: Email and Password are MUST
    if (role === 'MANAGER') {
      if (!email.trim()) {
        setError('Email address is required for Manager accounts.');
        return;
      }
      if (!password.trim()) {
        setError('Password is required for Manager accounts (minimum 6 characters).');
        return;
      }
      if (password.trim().length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await onUpdateMember({
        userId: member.id,
        name: name.trim(),
        role: isOwner ? role : 'STAFF',
        email: email.trim() || undefined,
        phone: phone.trim(),
        password: role === 'MANAGER' && password.trim() ? password.trim() : undefined,
      });

      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update team member. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] p-0 overflow-hidden bg-[var(--card)] border-[var(--border)] shadow-2xl rounded-2xl">
        {/* Header */}
        <DialogHeader className="px-5 py-3.5 border-b border-[var(--border)] bg-[var(--muted)]/30">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                Edit Team Member
              </DialogTitle>
              <DialogDescription className="text-xs text-[var(--muted-foreground)] mt-0.5">
                Update account details and credentials for <strong className="text-[var(--foreground)]">{member.name}</strong>
              </DialogDescription>
            </div>
            {/* Property Badge (Read-only - strictly assigned to current property) */}
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

          {/* Role Selection (Owner can toggle, Manager is restricted to Staff) */}
          <div>
            <label className="block font-semibold text-[var(--foreground)] mb-1 text-[11px] uppercase tracking-wider text-[var(--muted-foreground)]">
              Role & Permissions
            </label>
            {isOwner ? (
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRole('STAFF')}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    role === 'STAFF'
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
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    role === 'MANAGER'
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
                  <p className="text-[11px] text-[var(--muted-foreground)]">Front Desk / Housekeeping • Operations Account</p>
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
                placeholder="e.g. Sunil Patil"
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
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-[var(--muted-foreground)] absolute left-2.5 top-2.5 pointer-events-none" />
                <Input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                  className="h-8.5 pl-8 text-xs"
                />
              </div>
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
                  placeholder={role === 'MANAGER' ? 'Enter password (min. 6 chars)' : 'Staff accounts do not require password'}
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
              {isSubmitting ? 'Saving Changes…' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
