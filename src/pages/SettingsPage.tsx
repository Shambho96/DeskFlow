import React from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Building2,
  Award,
  Users,
  ShieldCheck,
  Sliders,
  Network,
  ChevronRight,
  Sparkles,
  Tag,
} from 'lucide-react';
import { LoyaltyTiersTab } from '../components/settings/LoyaltyTiersTab';
import { TeamManagementTab } from '../components/settings/TeamManagementTab';
import { PropertyProfileTab } from '../components/settings/PropertyProfileTab';
import { RolePermissionsTab } from '../components/settings/RolePermissionsTab';
import { PreferencesTab } from '../components/settings/PreferencesTab';
import { ChannelIntegrationsTab } from '../components/settings/ChannelIntegrationsTab';
import { SpecialRequestsAndTagsTab } from '../components/settings/SpecialRequestsAndTagsTab';

export type SettingsTabId =
  | 'loyalty'
  | 'team'
  | 'roles'
  | 'profile'
  | 'special_requests'
  | 'preferences'
  | 'integrations';

interface NavItem {
  id: SettingsTabId;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

const SETTINGS_GROUPS: NavGroup[] = [
  {
    groupTitle: 'Hotel Configuration',
    items: [
      {
        id: 'loyalty',
        label: 'VIP Loyalty Tiers',
        desc: 'Points multipliers, tier criteria & perks',
        icon: Award,
        badge: 'VIP CRM',
      },
      {
        id: 'team',
        label: 'Team Management',
        desc: 'Staff directory, logins & accounts',
        icon: Users,
        badge: 'Staff',
      },
      {
        id: 'roles',
        label: 'Role Permissions',
        desc: 'Access matrix & operational capabilities',
        icon: ShieldCheck,
      },
      {
        id: 'profile',
        label: 'Property Identity & Tax',
        desc: 'Legal entity, GSTIN & invoice sequence',
        icon: Building2,
      },
      {
        id: 'special_requests',
        label: 'Tags & Preferences',
        desc: 'Guest tags & reservation visit tags',
        icon: Tag,
        badge: 'Booking UI',
      },
    ],
  },
  {
    groupTitle: 'Preferences & Display',
    items: [
      {
        id: 'preferences',
        label: 'Preferences & Regional',
        desc: 'Theme mode, currency, time & chimes',
        icon: Sliders,
      },
    ],
  },
  {
    groupTitle: 'Channel & Integrations',
    items: [
      {
        id: 'integrations',
        label: 'OTA Distribution & Hardware',
        desc: 'Booking.com, RFID encoder & printer',
        icon: Network,
        badge: '3 Live',
      },
    ],
  },
];

export const SettingsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as SettingsTabId) || 'loyalty';

  const handleSelectTab = (id: SettingsTabId) => {
    setSearchParams({ tab: id }, { replace: true });
  };

  const currentItem = SETTINGS_GROUPS.flatMap(g => g.items).find(i => i.id === activeTab);
  const currentGroup = SETTINGS_GROUPS.find(g => g.items.some(i => i.id === activeTab));

  return (
    <div className="space-y-6 text-left pb-12">
      {/* ─── PAGE HEADER ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
              System Settings &amp; Configuration
            </h1>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Configure hotel branding, VIP loyalty tiers, staff directory, role permissions, and channel connections
          </p>
        </div>

        {/* Current Location Breadcrumb Badge */}
        {currentItem && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-xs text-[var(--foreground)] self-start sm:self-auto">
            <span className="text-[var(--muted-foreground)] text-[11px] font-medium">
              {currentGroup?.groupTitle}
            </span>
            <ChevronRight className="w-3 h-3 text-[var(--muted-foreground)]" />
            <span className="font-bold text-[var(--primary)]">{currentItem.label}</span>
          </div>
        )}
      </div>

      {/* ─── MOBILE RESPONSIVE TAB STRIP (< md) ─────────────────────────────────────── */}
      <div className="block md:hidden overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5 w-max">
          {SETTINGS_GROUPS.flatMap(g => g.items).map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--primary)] text-white shadow-xs'
                    : 'bg-[var(--card)] text-[var(--muted-foreground)] border border-[var(--border)] hover:bg-[var(--muted)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── DESKTOP 2-COLUMN SIDEBAR LAYOUT (>= md) ────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: NAVIGATION SIDEBAR */}
        <aside className="hidden md:block md:col-span-4 lg:col-span-3 space-y-5 sticky top-20">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-3 shadow-xs space-y-4">
            {SETTINGS_GROUPS.map((group, groupIdx) => (
              <div key={group.groupTitle} className={groupIdx > 0 ? 'pt-3 border-t border-[var(--border)]' : ''}>
                <h3 className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  {group.groupTitle}
                </h3>
                <nav className="space-y-1">
                  {group.items.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectTab(item.id)}
                        className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between gap-2.5 transition-all cursor-pointer group ${
                          isActive
                            ? 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30 font-bold shadow-2xs'
                            : 'text-[var(--foreground)] hover:bg-[var(--muted)]/60 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                              isActive
                                ? 'bg-[var(--primary)] text-white'
                                : 'bg-[var(--muted)] text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="block text-xs font-semibold leading-tight truncate">
                              {item.label}
                            </span>
                            <span className="block text-[10px] text-[var(--muted-foreground)] truncate mt-0.5 font-normal">
                              {item.desc}
                            </span>
                          </div>
                        </div>

                        {item.badge && (
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                              isActive
                                ? 'bg-[var(--primary)] text-white'
                                : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </aside>

        {/* RIGHT COLUMN: ACTIVE TAB CONTENT PANEL */}
        <main className="col-span-1 md:col-span-8 lg:col-span-9 min-w-0">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 shadow-xs min-h-[500px]">
            {activeTab === 'loyalty' && <LoyaltyTiersTab />}
            {activeTab === 'team' && <TeamManagementTab />}
            {activeTab === 'roles' && <RolePermissionsTab />}
            {activeTab === 'profile' && <PropertyProfileTab />}
            {activeTab === 'special_requests' && <SpecialRequestsAndTagsTab />}
            {activeTab === 'preferences' && <PreferencesTab />}
            {activeTab === 'integrations' && <ChannelIntegrationsTab />}
          </div>
        </main>
      </div>
    </div>
  );
};
