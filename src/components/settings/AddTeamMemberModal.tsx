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
import type { TeamRole, CreateMemberInput } from '../../types/team';

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
      setPassword('');
      setError(null);
      setRole(isOwner ? 'STAFF' : 'STAFF');
    }
  }, [open, isOwner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide the full name of the team member.');
      return;
    }

    if (role === 'MANAGER') {
      if (!email.trim()) {
        setError('Email address is required for Manager accounts to enable web dashboard login.');
        return;
      }
      if (!password || password.length < 6) {
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
        phone: phone.trim() || undefined,
        password: role === 'MANAGER' ? password : undefined,
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
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-[var(--card)] border-[var(--border)] shadow-2xl rounded-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-[var(--border)] bg-[var(--muted)]/30">
          <DialogTitle className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
            Add Team Member
          </DialogTitle>
          <DialogDescription className="text-xs text-[var(--muted-foreground)]">
            {isOwner
              ? 'Invite a property manager with web login or add operational front-desk/housekeeping staff.'
              : `Add operational staff to ${activeOutletName}.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block font-semibold text-[var(--foreground)] mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Rajesh Sharma"
              required
              className="h-9 text-xs"
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="block font-semibold text-[var(--foreground)] mb-1.5">
              Role & Permissions
            </label>
            {isOwner ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('STAFF')}
                  className={`flex flex-col text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    role === 'STAFF'
                      ? 'border-[var(--primary)] bg-[var(--primary)]/5 ring-1 ring-[var(--primary)]'
                      : 'border-[var(--border)] hover:bg-[var(--muted)]/50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-bold flex items-center gap-1.5 text-[var(--foreground)]">
                      <User className="w-3.5 h-3.5 text-[var(--primary)]" /> Staff Member
                    </span>
                    {role === 'STAFF' && <CheckCircle2 className="w-4 h-4 text-[var(--primary)]" />}
                  </div>
                  <span className="text-[11px] text-[var(--muted-foreground)] leading-tight">
                    Front Desk / Housekeeping. Operations only, no web login required.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('MANAGER')}
                  className={`flex flex-col text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    role === 'MANAGER'
                      ? 'border-[var(--primary)] bg-[var(--primary)]/5 ring-1 ring-[var(--primary)]'
                      : 'border-[var(--border)] hover:bg-[var(--muted)]/50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-bold flex items-center gap-1.5 text-[var(--foreground)]">
                      <Shield className="w-3.5 h-3.5 text-indigo-500" /> Manager
                    </span>
                    {role === 'MANAGER' && <CheckCircle2 className="w-4 h-4 text-[var(--primary)]" />}
                  </div>
                  <span className="text-[11px] text-[var(--muted-foreground)] leading-tight">
                    Full property manager access with web dashboard login credentials.
                  </span>
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-[var(--foreground)]">Staff Member (Operational)</p>
                    <p className="text-[11px] text-[var(--muted-foreground)]">
                      Front Desk / Housekeeping • Managers are restricted to adding Staff
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Email field */}
          <div>
            <label className="block font-semibold text-[var(--foreground)] mb-1.5">
              Email Address {role === 'MANAGER' ? <span className="text-red-500">*</span> : <span className="text-[var(--muted-foreground)] font-normal">(Optional)</span>}
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-[var(--muted-foreground)] absolute left-3 top-2.5 pointer-events-none" />
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={role === 'MANAGER' ? 'manager@tajhotels.com' : 'Optional (auto-generated for staff if blank)'}
                required={role === 'MANAGER'}
                className="h-9 pl-9 text-xs"
              />
            </div>
          </div>

          {/* Password field for Manager */}
          {role === 'MANAGER' && (
            <div>
              <label className="block font-semibold text-[var(--foreground)] mb-1.5">
                Initial Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-[var(--muted-foreground)] absolute left-3 top-2.5 pointer-events-none" />
                <Input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  className="h-9 pl-9 text-xs"
                />
              </div>
              <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
                The manager will use this password and email to sign into DeskFlow.
              </p>
            </div>
          )}

          {/* Phone Number */}
          <div>
            <label className="block font-semibold text-[var(--foreground)] mb-1.5">
              Phone / WhatsApp Number <span className="text-[var(--muted-foreground)] font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-[var(--muted-foreground)] absolute left-3 top-2.5 pointer-events-none" />
              <Input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="h-9 pl-9 text-xs"
              />
            </div>
          </div>

          {/* Assigned Property Note */}
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[var(--muted)]/40 border border-[var(--border)] text-[11px] text-[var(--muted-foreground)]">
            <Building2 className="w-4 h-4 text-[var(--primary)] shrink-0" />
            <span>
              Assigned Property: <strong className="text-[var(--foreground)] font-semibold">{activeOutletName}</strong>
            </span>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[var(--border)]">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-9 px-4 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9 px-5 text-xs bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold shadow-sm hover:opacity-90"
            >
              {isSubmitting ? 'Adding Member…' : 'Add Team Member'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
