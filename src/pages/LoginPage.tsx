import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bed, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('sarah.jenkins@deskflow.app');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/app/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[var(--primary)]/10 blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center gap-3 cursor-pointer mb-3"
            onClick={() => navigate('/')}
          >
            <div className="w-12 h-12 rounded-xl bg-[var(--primary)] flex items-center justify-center shadow-lg shadow-[var(--primary)]/30">
              <Bed className="w-6 h-6 text-[var(--primary-foreground)]" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Desk<span className="text-[var(--primary)]">Flow</span> — Operations Portal
          </h1>
          <p className="text-xs text-[var(--muted-foreground)] mt-1 font-medium">
            Intelligent Hotel Operations Platform • Sign-In
          </p>
        </div>

        <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1.5">
                Staff Email / Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[var(--muted-foreground)] absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1.5">
                Staff Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[var(--muted-foreground)] absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-[var(--border)] bg-[var(--input)] text-[var(--primary)]" />
                <span>Remember shift session</span>
              </label>
              <a href="#" className="text-[var(--primary)] hover:underline">Forgot password?</a>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] h-11 font-semibold rounded-xl gap-2 shadow-lg shadow-[var(--primary)]/20 cursor-pointer"
            >
              {loading ? 'Authenticating Shift...' : 'Sign In to Front Desk Engine'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-[var(--border)] text-center">
            <div className="inline-flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Shift Register: Sarah Jenkins (Drawer #SH-24)</span>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
          Back to <button onClick={() => navigate('/')} className="text-[var(--primary)] underline hover:opacity-80">Marketing Website</button>
        </p>
      </div>
    </div>
  );
};
