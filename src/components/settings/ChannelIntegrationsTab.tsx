import React, { useState } from 'react';
import {
  Network,
  Cpu,
  Code2,
  CheckCircle2,
  RefreshCw,
  Printer,
  KeyRound,
  Copy,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface OTAChannel {
  id: string;
  name: string;
  logo: string;
  status: 'connected' | 'disconnected' | 'syncing';
  lastSync: string;
  rateSync: boolean;
  inventorySync: boolean;
}

const INITIAL_CHANNELS: OTAChannel[] = [
  {
    id: 'booking_com',
    name: 'Booking.com',
    logo: '🏨',
    status: 'connected',
    lastSync: '2 mins ago',
    rateSync: true,
    inventorySync: true,
  },
  {
    id: 'agoda',
    name: 'Agoda',
    logo: '🌏',
    status: 'connected',
    lastSync: '5 mins ago',
    rateSync: true,
    inventorySync: true,
  },
  {
    id: 'mmt',
    name: 'MakeMyTrip / Goibibo',
    logo: '✈️',
    status: 'connected',
    lastSync: '12 mins ago',
    rateSync: true,
    inventorySync: true,
  },
  {
    id: 'airbnb',
    name: 'Airbnb',
    logo: '🏡',
    status: 'disconnected',
    lastSync: 'Never',
    rateSync: false,
    inventorySync: false,
  },
];

export const ChannelIntegrationsTab: React.FC = () => {
  const [channels, setChannels] = useState<OTAChannel[]>(INITIAL_CHANNELS);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  // Hardware states
  const keycardBrand = 'Dormakaba Saflok RFID';
  const keycardPort = 'COM3 (USB Serial)';

  const printerModel = 'Epson TM-T88VI Thermal 80mm';
  const printerIP = '192.168.1.150:9100';

  // API states
  const [apiKey] = useState('live_sec_89f02c4b711e98d246011bc90a5f78');
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://api.grandazure.com/webhooks/pms');
  const [isWebhookSaved, setIsWebhookSaved] = useState(false);

  const handleSyncAll = () => {
    setIsSyncingAll(true);
    setSyncSuccessMsg(null);
    setTimeout(() => {
      setIsSyncingAll(false);
      setSyncSuccessMsg('All 3 connected channels successfully synced with real-time rates and room availability!');
      setChannels(prev =>
        prev.map(c => (c.status === 'connected' ? { ...c, lastSync: 'Just now' } : c))
      );
      setTimeout(() => setSyncSuccessMsg(null), 4000);
    }, 1500);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleTestPrint = () => {
    alert('🖨️ Test print command sent to thermal printer at 192.168.1.150:9100');
  };

  const handleTestKeycard = () => {
    alert('💳 Keycard encoder initialized on COM3. Ready to encode Room #101 guest key.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--foreground)] tracking-tight flex items-center gap-2">
            <Network className="w-5 h-5 text-[var(--primary)]" />
            Channel Manager, Hardware &amp; API Integrations
          </h2>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Manage two-way OTA channel connections, front desk RFID keycard encoders, ESC/POS receipt printers, and developer webhooks.
          </p>
        </div>
        <Button
          type="button"
          onClick={handleSyncAll}
          disabled={isSyncingAll}
          className="text-xs h-8 bg-[var(--primary)] text-white font-bold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
          <span>{isSyncingAll ? 'Syncing Channels...' : 'Sync All Channels Now'}</span>
        </Button>
      </div>

      {syncSuccessMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl flex items-center gap-2 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{syncSuccessMsg}</span>
        </div>
      )}

      {/* 1. OTA Channels 2-Way Sync */}
      <Card>
        <CardHeader className="p-4 sm:p-5 border-b border-[var(--border)] bg-[var(--muted)]/20 flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-[var(--foreground)]">
            <Network className="w-4 h-4 text-[var(--primary)]" /> Online Travel Agency (OTA) Distribution Channels
          </CardTitle>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            3 Active Connections
          </span>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--muted)]/10 font-bold text-[var(--muted-foreground)]">
                <th className="py-3 px-4">Channel Partner</th>
                <th className="py-3 px-4 text-center">Connection Status</th>
                <th className="py-3 px-4 text-center">Rate Sync</th>
                <th className="py-3 px-4 text-center">Inventory Sync</th>
                <th className="py-3 px-4">Last Synced</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {channels.map(ch => (
                <tr key={ch.id} className="hover:bg-[var(--muted)]/20 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-[var(--foreground)]">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{ch.logo}</span>
                      <span>{ch.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {ch.status === 'connected' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live 2-Way
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]">
                        Disconnected
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={ch.rateSync ? 'text-emerald-500 font-bold' : 'text-[var(--muted-foreground)]'}>
                      {ch.rateSync ? '✓ Enabled' : '—'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={ch.inventorySync ? 'text-emerald-500 font-bold' : 'text-[var(--muted-foreground)]'}>
                      {ch.inventorySync ? '✓ Enabled' : '—'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[var(--muted-foreground)]">
                    {ch.lastSync}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {ch.status === 'connected' ? (
                      <Button variant="outline" className="h-7 text-[11px] px-2.5 cursor-pointer">
                        Configure
                      </Button>
                    ) : (
                      <Button className="h-7 text-[11px] px-2.5 bg-[var(--primary)] text-white font-bold cursor-pointer">
                        Connect
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* 2. Hardware & Front Desk Devices */}
      <Card>
        <CardHeader className="p-4 sm:p-5 border-b border-[var(--border)] bg-[var(--muted)]/20">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-[var(--foreground)]">
            <Cpu className="w-4 h-4 text-[var(--primary)]" /> Front Desk Hardware Devices
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-5 text-xs">
          {/* Keycard Encoder */}
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-[var(--foreground)]">RFID Keycard Encoder</span>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                  Protocol: {keycardBrand} • Communication Port: {keycardPort}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button type="button" variant="outline" onClick={handleTestKeycard} className="h-8 text-xs cursor-pointer">
                Test Encode Card
              </Button>
            </div>
          </div>

          {/* Thermal Receipt Printer */}
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-[var(--foreground)]">ESC/POS Thermal Folio Printer</span>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Ready
                  </span>
                </div>
                <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                  Model: {printerModel} • Network Socket: {printerIP}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button type="button" variant="outline" onClick={handleTestPrint} className="h-8 text-xs cursor-pointer">
                Print Test Slip
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. API & Webhooks */}
      <Card>
        <CardHeader className="p-4 sm:p-5 border-b border-[var(--border)] bg-[var(--muted)]/20">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-[var(--foreground)]">
            <Code2 className="w-4 h-4 text-[var(--primary)]" /> Developer API &amp; Webhooks
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[var(--muted-foreground)] mb-1.5">
              Live REST / GraphQL Secret API Key
            </label>
            <div className="flex items-center gap-2">
              <Input
                type={isApiKeyVisible ? 'text' : 'password'}
                value={apiKey}
                readOnly
                className="font-mono text-xs bg-[var(--muted)]/40"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsApiKeyVisible(!isApiKeyVisible)}
                className="h-9 px-3 cursor-pointer shrink-0"
                title={isApiKeyVisible ? 'Hide Key' : 'Reveal Key'}
              >
                {isApiKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCopyKey}
                className="h-9 px-3 cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                {copiedKey ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copiedKey ? 'Copied' : 'Copy'}</span>
              </Button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[var(--muted-foreground)] mb-1.5">
              Event Webhook URL (Notifies on booking creation and folio checkouts)
            </label>
            <div className="flex items-center gap-2">
              <Input
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
                placeholder="https://your-domain.com/pms-webhook"
                className="font-mono text-xs"
              />
              <Button
                type="button"
                onClick={() => {
                  setIsWebhookSaved(true);
                  setTimeout(() => setIsWebhookSaved(false), 2500);
                }}
                className="h-9 px-4 bg-[var(--primary)] text-white font-bold cursor-pointer shrink-0"
              >
                {isWebhookSaved ? 'Saved!' : 'Save URL'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

