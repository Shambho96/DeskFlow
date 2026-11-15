import React, { useState } from 'react';
import {
  Palette,
  Sun,
  Moon,
  Globe,
  Bell,
  Volume2,
  Clock,
  Save,
  CheckCircle2,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useTheme } from '../../context/ThemeContext';

export const PreferencesTab: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  // Regional preferences
  const [currency, setCurrency] = useState('INR');
  const [dateFormat, setDateFormat] = useState('DD_MMM_YYYY');
  const [timezone, setTimezone] = useState('Asia/Kolkata');

  // Sound & Audio preferences
  const [soundBell, setSoundBell] = useState(true);
  const [soundPayment, setSoundPayment] = useState(true);

  // Notification preferences
  const [notifyDailyAudit, setNotifyDailyAudit] = useState(true);
  const [notifyHighBalance, setNotifyHighBalance] = useState(true);
  const [highBalanceLimit, setHighBalanceLimit] = useState('25000');
  const [notifyLowInventory, setNotifyLowInventory] = useState(true);

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--foreground)] tracking-tight flex items-center gap-2">
            <Palette className="w-5 h-5 text-[var(--primary)]" />
            Preferences, Display &amp; Regional
          </h2>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Configure system interface theme, currency formatting, timezones, and front desk operational alerts.
          </p>
        </div>
        {isSaved && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Preferences Saved
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Interface Theme */}
        <Card>
          <CardHeader className="p-4 sm:p-5 border-b border-[var(--border)] bg-[var(--muted)]/20">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-[var(--foreground)]">
              <Palette className="w-4 h-4 text-[var(--primary)]" /> Appearance &amp; Color Mode
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Light Mode Option */}
              <div
                onClick={() => {
                  if (theme === 'dark') toggleTheme();
                }}
                className={`p-4 rounded-xl border flex items-center gap-3.5 cursor-pointer transition-all ${
                  theme === 'light'
                    ? 'bg-amber-500/10 border-amber-500 shadow-xs ring-1 ring-amber-500'
                    : 'bg-[var(--card)] border-[var(--border)] hover:bg-[var(--muted)]/30'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    theme === 'light' ? 'bg-amber-500 text-white shadow-xs' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                  }`}
                >
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-xs text-[var(--foreground)] block">
                    Day Light Mode
                  </span>
                  <span className="text-[11px] text-[var(--muted-foreground)]">
                    Clean high-contrast white and slate surfaces for bright front desks.
                  </span>
                </div>
              </div>

              {/* Dark Mode Option */}
              <div
                onClick={() => {
                  if (theme === 'light') toggleTheme();
                }}
                className={`p-4 rounded-xl border flex items-center gap-3.5 cursor-pointer transition-all ${
                  theme === 'dark'
                    ? 'bg-[var(--primary)]/10 border-[var(--primary)] shadow-xs ring-1 ring-[var(--primary)]'
                    : 'bg-[var(--card)] border-[var(--border)] hover:bg-[var(--muted)]/30'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    theme === 'dark' ? 'bg-[var(--primary)] text-white shadow-xs' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                  }`}
                >
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-xs text-[var(--foreground)] block">
                    Sleek Dark Mode (Default)
                  </span>
                  <span className="text-[11px] text-[var(--muted-foreground)]">
                    Deep executive dark background to reduce eye strain during night shifts.
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Regional & Currency Formats */}
        <Card>
          <CardHeader className="p-4 sm:p-5 border-b border-[var(--border)] bg-[var(--muted)]/20">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-[var(--foreground)]">
              <Globe className="w-4 h-4 text-[var(--primary)]" /> Regional, Currency &amp; Timezone
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-[var(--muted-foreground)] mb-1.5 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" /> Base Property Currency
                </label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] h-[38px] cursor-pointer"
                >
                  <option value="INR">₹ INR — Indian Rupee (Default)</option>
                  <option value="USD">$ USD — United States Dollar</option>
                  <option value="EUR">€ EUR — Euro</option>
                  <option value="GBP">£ GBP — British Pound</option>
                  <option value="AED">د.إ AED — UAE Dirham</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[var(--muted-foreground)] mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Date Display Format
                </label>
                <select
                  value={dateFormat}
                  onChange={e => setDateFormat(e.target.value)}
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] h-[38px] cursor-pointer"
                >
                  <option value="DD_MMM_YYYY">15 Nov 2026 (Standard India / UK)</option>
                  <option value="DD_MM_YYYY">15/11/2026 (DD/MM/YYYY)</option>
                  <option value="MM_DD_YYYY">11/15/2026 (MM/DD/YYYY US)</option>
                  <option value="YYYY_MM_DD">2026-11-15 (ISO 8601)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[var(--muted-foreground)] mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Timezone
                </label>
                <select
                  value={timezone}
                  onChange={e => setTimezone(e.target.value)}
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] h-[38px] cursor-pointer"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST +4:00)</option>
                  <option value="Asia/Singapore">Asia/Singapore (SGT +8:00)</option>
                  <option value="Europe/London">Europe/London (GMT / BST)</option>
                  <option value="America/New_York">America/New York (EST)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Audio & Sound Alerts */}
        <Card>
          <CardHeader className="p-4 sm:p-5 border-b border-[var(--border)] bg-[var(--muted)]/20">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-[var(--foreground)]">
              <Volume2 className="w-4 h-4 text-[var(--primary)]" /> Front Desk Audio &amp; Chimes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3.5 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--muted)]/20 cursor-pointer">
              <div>
                <span className="font-semibold text-[var(--foreground)] block">
                  New Online Booking Arrival Chime
                </span>
                <span className="text-[11px] text-[var(--muted-foreground)]">
                  Play an audio bell notification when an instant web reservation or OTA booking lands.
                </span>
              </div>
              <input
                type="checkbox"
                checked={soundBell}
                onChange={e => setSoundBell(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--muted)]/20 cursor-pointer">
              <div>
                <span className="font-semibold text-[var(--foreground)] block">
                  Folio Payment Settlement Sound
                </span>
                <span className="text-[11px] text-[var(--muted-foreground)]">
                  Provide an audio confirmation tone when cash, card, or UPI payments are posted.
                </span>
              </div>
              <input
                type="checkbox"
                checked={soundPayment}
                onChange={e => setSoundPayment(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] cursor-pointer"
              />
            </label>
          </CardContent>
        </Card>

        {/* 4. Automated Operations & Notifications */}
        <Card>
          <CardHeader className="p-4 sm:p-5 border-b border-[var(--border)] bg-[var(--muted)]/20">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-[var(--foreground)]">
              <Bell className="w-4 h-4 text-[var(--primary)]" /> Automated Operational Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3.5 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--muted)]/20 cursor-pointer">
              <div>
                <span className="font-semibold text-[var(--foreground)] block">
                  Automated Night Audit Email Digest
                </span>
                <span className="text-[11px] text-[var(--muted-foreground)]">
                  Send daily close-of-day revenue, occupancy %, and ADR summary to hotel management at 00:00.
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifyDailyAudit}
                onChange={e => setNotifyDailyAudit(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] cursor-pointer"
              />
            </label>

            <div className="p-3 rounded-xl border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyHighBalance}
                  onChange={e => setNotifyHighBalance(e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] cursor-pointer"
                />
                <div>
                  <span className="font-semibold text-[var(--foreground)] block">
                    High Uncollected Folio Balance Alert
                  </span>
                  <span className="text-[11px] text-[var(--muted-foreground)]">
                    Flag rooms with unsettled balances exceeding the threshold.
                  </span>
                </div>
              </label>
              <div className="flex items-center gap-2 pl-7 sm:pl-0">
                <span className="text-xs font-semibold text-[var(--muted-foreground)]">₹</span>
                <input
                  type="number"
                  value={highBalanceLimit}
                  onChange={e => setHighBalanceLimit(e.target.value)}
                  className="w-28 bg-[var(--background)] border border-[var(--border)] rounded-xl px-2.5 py-1 text-xs text-[var(--foreground)] font-mono"
                />
              </div>
            </div>

            <label className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--muted)]/20 cursor-pointer">
              <div>
                <span className="font-semibold text-[var(--foreground)] block">
                  High Occupancy Alert (&gt;90%)
                </span>
                <span className="text-[11px] text-[var(--muted-foreground)]">
                  Notify front desk when property reaches over 90% pacing to optimize walk-in rate yield.
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifyLowInventory}
                onChange={e => setNotifyLowInventory(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] cursor-pointer"
              />
            </label>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" className="bg-[var(--primary)] text-white font-bold h-9 px-6 flex items-center gap-1.5 cursor-pointer">
            <Save className="w-4 h-4" /> Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
};

