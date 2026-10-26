import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useUser } from '../hooks/useUser';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
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
            <div className="w-24 h-24 flex items-center justify-center hover:scale-105 transition-transform drop-shadow-2xl">
              <img
                src="/deskflow-logo.png"
                alt="DeskFlow Logo"
                className="w-full h-full object-contain select-none"
              />
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
          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 text-xs text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

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
                  placeholder="Enter email address"
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
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-9 pr-10"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer focus:outline-none transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
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
              <span>Shift Register: Secure Hotel Desk Engine</span>
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
