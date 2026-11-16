import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Building2,
  Calendar,
  Check,
  Download,
  HeartHandshake,
  LayoutDashboard,
  MapPin,
  Plus,
  Settings,
  Tags,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import type {
  AppSettings,
  CityItem,
  CommunityEvent,
  DonationRecord,
  EventCategory,
  LanguageCode,
  PromotionalBanner,
  UserProfile,
} from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { AVAILABLE_CATEGORY_ICONS, CategoryIcon } from './CategoryIcon';
import { POSTER_PRESETS } from '../data/seedData';
import {
  addDaysToDateStr,
  exportRowsToCsv,
  getTodayDateStr,
  isPastEvent,
} from '../utils/formatters';

interface AdminDashboardProps {
  lang: LanguageCode;
  adminUid: string;
  events: CommunityEvent[];
  categories: EventCategory[];
  cities: CityItem[];
  banners: PromotionalBanner[];
  users: UserProfile[];
  donations: DonationRecord[];
  appSettings: AppSettings | null;
  onExitAdmin: () => void;
  onSaveCategory: (cat: Omit<EventCategory, 'createdAt' | 'updatedAt'>, isNew: boolean) => Promise<void>;
  onSaveCity: (city: Omit<CityItem, 'createdAt'>, isNew: boolean) => Promise<void>;
  onUpdateEventModeration: (
    eventId: string,
    updates: Partial<Pick<CommunityEvent, 'status' | 'moderationStatus'>>
  ) => Promise<void>;
  onDeleteEvent: (eventId: string) => Promise<void>;
  onUpdateBanner: (
    bannerId: string,
    updates: Partial<Pick<PromotionalBanner, 'status' | 'startDate' | 'endDate' | 'placement'>>
  ) => Promise<void>;
  onCreateCommunityBanner: (
    input: Omit<PromotionalBanner, 'id' | 'status' | 'clicks' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  onDeleteBanner: (bannerId: string) => Promise<void>;
  onUpdateUserRole: (uid: string, role: UserProfile['role'], isActive: boolean) => Promise<void>;
  onBroadcastNotification: (input: {
    targetUid: string;
    city: string;
    title: string;
    message: string;
    type: 'announcement';
  }) => Promise<void>;
  onSaveSettings: (settings: Omit<AppSettings, 'updatedAt'>) => Promise<void>;
}

type AdminSection =
  | 'overview'
  | 'events'
  | 'categories'
  | 'banners'
  | 'cities'
  | 'users'
  | 'reports'
  | 'donations'
  | 'notifications'
  | 'settings';

export function AdminDashboard({
  lang,
  adminUid,
  events,
  categories,
  cities,
  banners,
  users,
  donations,
  appSettings,
  onExitAdmin,
  onSaveCategory,
  onSaveCity,
  onUpdateEventModeration,
  onDeleteEvent,
  onUpdateBanner,
  onCreateCommunityBanner,
  onDeleteBanner,
  onUpdateUserRole,
  onBroadcastNotification,
  onSaveSettings,
}: AdminDashboardProps) {
  const t = TRANSLATIONS[lang];
  const todayStr = getTodayDateStr();
  const [section, setSection] = useState<AdminSection>('overview');

  // Category Form State
  const [editingCat, setEditingCat] = useState<EventCategory | null>(null);
  const [catName, setCatName] = useState('');
  const [catNameHi, setCatNameHi] = useState('');
  const [catNameUr, setCatNameUr] = useState('');
  const [catIcon, setCatIcon] = useState('mic');
  const [catColor, setCatColor] = useState('#064E3B');
  const [catSort, setCatSort] = useState(categories.length + 1);

  // City Form State
  const [cityName, setCityName] = useState('');
  const [cityState, setCityState] = useState('');
  const [cityCountry, setCityCountry] = useState('India');

  // Community Banner Form State
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerType, setBannerType] = useState<'community' | 'announcement'>('community');
  const [bannerCity, setBannerCity] = useState('Mumbai');
  const [bannerImage, setBannerImage] = useState(POSTER_PRESETS[0].url);

  // Notification Broadcast State
  const [notifCity, setNotifCity] = useState('All');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMsg, setNotifMsg] = useState('');
  const [notifSent, setNotifSent] = useState(false);

  // Settings State
  const [retentionDays, setRetentionDays] = useState(appSettings?.pastEventRetentionDays ?? 30);
  const [autoArchive, setAutoArchive] = useState(appSettings?.autoArchivePastEvents ?? true);
  const [defaultCity, setDefaultCity] = useState(appSettings?.defaultCity ?? 'Mumbai');
  const [settingsSaved, setSettingsSaved] = useState(false);

  const pendingBanners = useMemo(
    () => banners.filter((b) => b.status === 'pending'),
    [banners]
  );

  const totalConfirmedAttendance = useMemo(
    () => events.reduce((acc, e) => acc + (e.yesCount || 0), 0),
    [events]
  );

  const totalDonationInr = useMemo(
    () => donations.reduce((acc, d) => acc + (d.amountInr || 0), 0),
    [donations]
  );

  const handleSaveCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    await onSaveCategory(
      {
        id: editingCat?.id || '',
        name: catName.trim(),
        nameHi: catNameHi.trim() || undefined,
        nameUr: catNameUr.trim() || undefined,
        iconName: catIcon,
        colorHex: catColor,
        isActive: editingCat ? editingCat.isActive : true,
        sortOrder: Number(catSort) || 1,
      },
      !editingCat
    );
    setEditingCat(null);
    setCatName('');
    setCatNameHi('');
    setCatNameUr('');
  };

  const handleAddCitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityName.trim() || !cityState.trim()) return;
    await onSaveCity(
      {
        id: '',
        name: cityName.trim(),
        state: cityState.trim(),
        country: cityCountry.trim() || 'India',
        isActive: true,
        sortOrder: cities.length + 1,
      },
      true
    );
    setCityName('');
    setCityState('');
  };

  const handleAddBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle.trim()) return;
    await onCreateCommunityBanner({
      title: bannerTitle.trim(),
      subtitle: bannerSubtitle.trim(),
      type: bannerType,
      imageUrl: bannerImage,
      city: bannerCity,
      startDate: todayStr,
      endDate: addDaysToDateStr(todayStr, 30),
      durationDays: 30,
      placement: 'home_carousel',
      submittedByUid: adminUid,
    });
    setBannerTitle('');
    setBannerSubtitle('');
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMsg.trim()) return;
    await onBroadcastNotification({
      targetUid: 'all',
      city: notifCity,
      title: notifTitle.trim(),
      message: notifMsg.trim(),
      type: 'announcement',
    });
    setNotifTitle('');
    setNotifMsg('');
    setNotifSent(true);
    window.setTimeout(() => setNotifSent(false), 3000);
  };

  const handleSaveSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveSettings({
      id: 'global',
      pastEventRetentionDays: Math.max(7, Number(retentionDays) || 30),
      autoArchivePastEvents: autoArchive,
      defaultCity,
    });
    setSettingsSaved(true);
    window.setTimeout(() => setSettingsSaved(false), 3000);
  };

  const navItems: Array<{ id: AdminSection; label: string; icon: React.ReactNode }> = [
    { id: 'overview', label: t.admin.overview, icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'events', label: t.admin.events, icon: <Calendar className="w-4 h-4" /> },
    { id: 'categories', label: t.admin.categories, icon: <Tags className="w-4 h-4" /> },
    { id: 'banners', label: t.admin.banners, icon: <Building2 className="w-4 h-4" /> },
    { id: 'cities', label: t.admin.cities, icon: <MapPin className="w-4 h-4" /> },
    { id: 'users', label: t.admin.users, icon: <Users className="w-4 h-4" /> },
    { id: 'reports', label: t.admin.reports, icon: <Download className="w-4 h-4" /> },
    { id: 'donations', label: t.admin.donations, icon: <HeartHandshake className="w-4 h-4" /> },
    { id: 'notifications', label: t.admin.notifications, icon: <Bell className="w-4 h-4" /> },
    { id: 'settings', label: t.admin.settings, icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="lg:w-64 bg-[#0F172A] text-white shrink-0 flex flex-col">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="text-base font-semibold tracking-tight">{t.appName}</div>
            <div className="text-xs text-[#E5C168]">{t.admin.title}</div>
          </div>
          <button
            type="button"
            onClick={onExitAdmin}
            className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>App</span>
          </button>
        </div>

        <nav className="p-3 flex lg:flex-col gap-1 overflow-x-auto no-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                section === item.id
                  ? 'bg-[#064E3B] text-white'
                  : 'text-stone-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full space-y-6">
        {section === 'overview' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-[#0F172A]">{t.admin.overview}</h1>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 tabular-nums">
              <div className="bg-white rounded-2xl border border-stone-200 p-5">
                <div className="text-xs text-stone-500">Total Events</div>
                <div className="text-2xl font-bold text-[#0F172A] mt-1">{events.length}</div>
              </div>
              <div className="bg-white rounded-2xl border border-stone-200 p-5">
                <div className="text-xs text-stone-500">Confirmed Attendance (YES)</div>
                <div className="text-2xl font-bold text-[#064E3B] mt-1">{totalConfirmedAttendance}</div>
              </div>
              <div className="bg-white rounded-2xl border border-stone-200 p-5">
                <div className="text-xs text-stone-500">Pending Business Ads</div>
                <div className="text-2xl font-bold text-[#B4832E] mt-1">{pendingBanners.length}</div>
              </div>
              <div className="bg-white rounded-2xl border border-stone-200 p-5">
                <div className="text-xs text-stone-500">Registered Users</div>
                <div className="text-2xl font-bold text-[#0F172A] mt-1">{users.length}</div>
              </div>
            </div>

            {pendingBanners.length > 0 && (
              <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3">
                <h2 className="text-base font-semibold text-[#0F172A]">Pending Business Ad Requests</h2>
                <div className="divide-y divide-stone-100">
                  {pendingBanners.map((b) => (
                    <div key={b.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-[#0F172A]">
                          {b.businessName || b.title}
                        </div>
                        <div className="text-xs text-stone-500">
                          {b.city} · {b.startDate} to {b.endDate} · {b.contactDetails}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onUpdateBanner(b.id, { status: 'active' })}
                          className="px-3 py-1.5 rounded-lg bg-[#064E3B] text-white text-xs font-medium cursor-pointer"
                        >
                          {t.actions.approve}
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateBanner(b.id, { status: 'rejected' })}
                          className="px-3 py-1.5 rounded-lg border border-red-200 text-red-700 text-xs font-medium cursor-pointer"
                        >
                          {t.actions.reject}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {section === 'events' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold text-[#0F172A]">{t.admin.events}</h1>
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#FAF9F6] border-b border-stone-200 text-xs text-stone-600">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Event</th>
                      <th className="py-3 px-4 font-semibold">City & Date</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold">Moderation</th>
                      <th className="py-3 px-4 font-semibold text-right">YES / Total</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 tabular-nums">
                    {events.map((ev) => (
                      <tr key={ev.id} className="hover:bg-stone-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-[#0F172A]">{ev.title}</div>
                          <div className="text-xs text-stone-500">{ev.organizerName}</div>
                        </td>
                        <td className="py-3 px-4 text-xs text-stone-600">
                          {ev.city} · {ev.eventDate} {isPastEvent(ev, todayStr) ? '(Past)' : ''}
                        </td>
                        <td className="py-3 px-4 text-xs font-medium">{t.statusLabels[ev.status]}</td>
                        <td className="py-3 px-4 text-xs font-medium">{t.statusLabels[ev.moderationStatus]}</td>
                        <td className="py-3 px-4 text-right font-semibold text-[#064E3B]">
                          {ev.yesCount} / {ev.totalResponses}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {ev.moderationStatus !== 'approved' && (
                              <button
                                type="button"
                                onClick={() => onUpdateEventModeration(ev.id, { moderationStatus: 'approved' })}
                                className="px-2.5 py-1 rounded-lg bg-[#064E3B] text-white text-xs cursor-pointer"
                              >
                                {t.actions.approve}
                              </button>
                            )}
                            {ev.status === 'published' && (
                              <button
                                type="button"
                                onClick={() => onUpdateEventModeration(ev.id, { status: 'cancelled' })}
                                className="px-2.5 py-1 rounded-lg border border-stone-200 text-xs text-stone-700 cursor-pointer"
                              >
                                {t.actions.cancel}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => onDeleteEvent(ev.id)}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                              title={t.actions.delete}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {section === 'categories' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-[#0F172A]">{t.admin.categories}</h1>

            <form onSubmit={handleSaveCategorySubmit} className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4 text-sm">
              <div className="text-base font-semibold text-[#0F172A]">
                {editingCat ? `Edit Category: ${editingCat.name}` : 'Add New Category'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="English Name (e.g. Milad)"
                  className="h-10 px-3 rounded-xl border border-stone-200 bg-[#FAF9F6]"
                />
                <input
                  type="text"
                  value={catNameHi}
                  onChange={(e) => setCatNameHi(e.target.value)}
                  placeholder="Hindi Name (Optional)"
                  className="h-10 px-3 rounded-xl border border-stone-200 bg-[#FAF9F6]"
                />
                <input
                  type="text"
                  value={catNameUr}
                  onChange={(e) => setCatNameUr(e.target.value)}
                  placeholder="Urdu Name (Optional)"
                  className="h-10 px-3 rounded-xl border border-stone-200 bg-[#FAF9F6]"
                />
                <select
                  value={catIcon}
                  onChange={(e) => setCatIcon(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-stone-200 bg-[#FAF9F6]"
                >
                  {AVAILABLE_CATEGORY_ICONS.map((ic) => (
                    <option key={ic.id} value={ic.id}>
                      {ic.label}
                    </option>
                  ))}
                </select>
                <input
                  type="color"
                  value={catColor}
                  onChange={(e) => setCatColor(e.target.value)}
                  className="h-10 w-full px-2 rounded-xl border border-stone-200 bg-[#FAF9F6]"
                />
                <input
                  type="number"
                  min={1}
                  value={catSort}
                  onChange={(e) => setCatSort(Number(e.target.value))}
                  placeholder="Sort Order"
                  className="h-10 px-3 rounded-xl border border-stone-200 bg-[#FAF9F6]"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#064E3B] text-white text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{editingCat ? t.actions.save : 'Add Category'}</span>
                </button>
                {editingCat && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCat(null);
                      setCatName('');
                      setCatNameHi('');
                      setCatNameUr('');
                    }}
                    className="px-4 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm cursor-pointer"
                  >
                    {t.actions.cancel}
                  </button>
                )}
              </div>
            </form>

            <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100">
              {categories.map((c) => (
                <div key={c.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                      style={{ backgroundColor: c.colorHex || '#064E3B' }}
                    >
                      <CategoryIcon iconName={c.iconName} className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="font-semibold text-sm text-[#0F172A]">
                        {c.name} <span className="text-xs text-stone-400">#{c.sortOrder}</span>
                      </div>
                      <div className="text-xs text-stone-500">
                        {c.nameHi || '—'} · {c.nameUr || '—'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCat(c);
                        setCatName(c.name);
                        setCatNameHi(c.nameHi || '');
                        setCatNameUr(c.nameUr || '');
                        setCatIcon(c.iconName);
                        setCatColor(c.colorHex);
                        setCatSort(c.sortOrder);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-medium cursor-pointer"
                    >
                      {t.actions.edit}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onSaveCategory(
                          { ...c, isActive: !c.isActive },
                          false
                        )
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                        c.isActive
                          ? 'bg-[#064E3B]/10 text-[#064E3B]'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {c.isActive ? t.statusLabels.active : t.statusLabels.inactive}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {section === 'banners' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-[#0F172A]">{t.admin.banners}</h1>

            <form onSubmit={handleAddBannerSubmit} className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4 text-sm">
              <div className="text-base font-semibold text-[#0F172A]">Publish Community Banner / Announcement</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  placeholder="Banner Headline"
                  className="h-10 px-3 rounded-xl border border-stone-200 bg-[#FAF9F6]"
                />
                <input
                  type="text"
                  value={bannerSubtitle}
                  onChange={(e) => setBannerSubtitle(e.target.value)}
                  placeholder="Subtitle"
                  className="h-10 px-3 rounded-xl border border-stone-200 bg-[#FAF9F6]"
                />
                <select
                  value={bannerType}
                  onChange={(e) => setBannerType(e.target.value as 'community' | 'announcement')}
                  className="h-10 px-3 rounded-xl border border-stone-200 bg-[#FAF9F6]"
                >
                  <option value="community">Community Graphic</option>
                  <option value="announcement">Announcement</option>
                </select>
                <select
                  value={bannerCity}
                  onChange={(e) => setBannerCity(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-stone-200 bg-[#FAF9F6]"
                >
                  {cities.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <select
                  value={bannerImage}
                  onChange={(e) => setBannerImage(e.target.value)}
                  className="sm:col-span-2 h-10 px-3 rounded-xl border border-stone-200 bg-[#FAF9F6]"
                >
                  {POSTER_PRESETS.map((p) => (
                    <option key={p.url} value={p.url}>{p.label}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#064E3B] text-white text-xs sm:text-sm font-medium cursor-pointer"
              >
                Publish Banner
              </button>
            </form>

            <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100">
              {banners.map((b) => (
                <div key={b.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-[#B4832E]">
                      {b.type.toUpperCase()} · {b.city} · {b.clicks} clicks
                    </div>
                    <div className="font-semibold text-sm text-[#0F172A]">{b.title}</div>
                    <div className="text-xs text-stone-500">
                      {b.startDate} to {b.endDate} · Status: {t.statusLabels[b.status]}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {b.status !== 'active' && (
                      <button
                        type="button"
                        onClick={() => onUpdateBanner(b.id, { status: 'active' })}
                        className="px-3 py-1.5 rounded-lg bg-[#064E3B] text-white text-xs cursor-pointer"
                      >
                        Activate
                      </button>
                    )}
                    {b.status === 'active' && (
                      <button
                        type="button"
                        onClick={() => onUpdateBanner(b.id, { status: 'inactive' })}
                        className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs cursor-pointer"
                      >
                        Deactivate
                      </button>
                    )}
                    {b.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => onUpdateBanner(b.id, { status: 'rejected' })}
                        className="px-3 py-1.5 rounded-lg border border-red-200 text-red-700 text-xs cursor-pointer"
                      >
                        {t.actions.reject}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDeleteBanner(b.id)}
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {section === 'cities' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-[#0F172A]">{t.admin.cities}</h1>
            <form onSubmit={handleAddCitySubmit} className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-wrap gap-3 text-sm">
              <input
                type="text"
                required
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                placeholder="City Name (e.g. Surat)"
                className="h-10 px-3 rounded-xl border border-stone-200 bg-[#FAF9F6] flex-1 min-w-[160px]"
              />
              <input
                type="text"
                required
                value={cityState}
                onChange={(e) => setCityState(e.target.value)}
                placeholder="State (e.g. Gujarat)"
                className="h-10 px-3 rounded-xl border border-stone-200 bg-[#FAF9F6] flex-1 min-w-[160px]"
              />
              <input
                type="text"
                value={cityCountry}
                onChange={(e) => setCityCountry(e.target.value)}
                placeholder="Country"
                className="h-10 px-3 rounded-xl border border-stone-200 bg-[#FAF9F6] w-32"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#064E3B] text-white font-medium cursor-pointer"
              >
                Add City
              </button>
            </form>
            <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100">
              {cities.map((c) => (
                <div key={c.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm text-[#0F172A]">{c.name}</div>
                    <div className="text-xs text-stone-500">{c.state}, {c.country}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSaveCity({ ...c, isActive: !c.isActive }, false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                      c.isActive ? 'bg-[#064E3B]/10 text-[#064E3B]' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {c.isActive ? t.statusLabels.active : t.statusLabels.inactive}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {section === 'users' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold text-[#0F172A]">{t.admin.users}</h1>
            <div className="bg-white rounded-2xl border border-stone-200 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#FAF9F6] border-b border-stone-200 text-xs text-stone-600">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Member</th>
                    <th className="py-3 px-4 font-semibold">City & Language</th>
                    <th className="py-3 px-4 font-semibold">Role</th>
                    <th className="py-3 px-4 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {users.map((u) => (
                    <tr key={u.uid}>
                      <td className="py-3 px-4 font-medium text-[#0F172A]">{u.displayName}</td>
                      <td className="py-3 px-4 text-xs text-stone-600">
                        {u.city} · {u.preferredLanguage.toUpperCase()}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={u.role}
                          onChange={(e) =>
                            onUpdateUserRole(u.uid, e.target.value as UserProfile['role'], u.isActive)
                          }
                          className="h-8 px-2 rounded-lg border border-stone-200 text-xs bg-white"
                        >
                          <option value="member">Member</option>
                          <option value="organizer">Organizer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onUpdateUserRole(u.uid, u.role, !u.isActive)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                            u.isActive ? 'bg-[#064E3B]/10 text-[#064E3B]' : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {u.isActive ? t.statusLabels.active : t.statusLabels.inactive}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {section === 'reports' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-[#0F172A]">{t.admin.reports}</h1>
              <button
                type="button"
                onClick={() =>
                  exportRowsToCsv(
                    `shia-updates-events-report-${todayStr}.csv`,
                    ['Title', 'Category', 'City', 'Date', 'Audience', 'YES', 'MAYBE', 'NO', 'Total'],
                    events.map((e) => [
                      e.title,
                      e.categoryName,
                      e.city,
                      e.eventDate,
                      e.audienceType,
                      e.yesCount,
                      e.maybeCount,
                      e.noCount,
                      e.totalResponses,
                    ])
                  )
                }
                className="px-4 py-2 rounded-xl bg-[#064E3B] text-white text-xs sm:text-sm font-medium inline-flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{t.actions.exportCsv}</span>
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 overflow-x-auto">
              <table className="w-full text-sm text-left tabular-nums">
                <thead className="bg-[#FAF9F6] border-b border-stone-200 text-xs text-stone-600">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Event</th>
                    <th className="py-3 px-4 font-semibold">City</th>
                    <th className="py-3 px-4 font-semibold text-right">YES</th>
                    <th className="py-3 px-4 font-semibold text-right">MAYBE</th>
                    <th className="py-3 px-4 font-semibold text-right">NO</th>
                    <th className="py-3 px-4 font-semibold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {events.map((e) => (
                    <tr key={e.id}>
                      <td className="py-3 px-4 font-medium text-[#0F172A]">{e.title}</td>
                      <td className="py-3 px-4 text-xs text-stone-600">{e.city}</td>
                      <td className="py-3 px-4 text-right font-bold text-[#064E3B]">{e.yesCount}</td>
                      <td className="py-3 px-4 text-right text-[#B4832E]">{e.maybeCount}</td>
                      <td className="py-3 px-4 text-right text-stone-500">{e.noCount}</td>
                      <td className="py-3 px-4 text-right font-semibold">{e.totalResponses}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {section === 'donations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-[#0F172A]">{t.admin.donations}</h1>
                <p className="text-sm text-stone-600 tabular-nums">
                  Total Recorded (Private Admin Ledger): ₹{totalDonationInr.toLocaleString('en-IN')}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  exportRowsToCsv(
                    `shia-updates-donations-${todayStr}.csv`,
                    ['Reference', 'Donor', 'Purpose', 'Method', 'Amount INR'],
                    donations.map((d) => [d.referenceNumber, d.donorName, d.purpose, d.paymentMethod, d.amountInr])
                  )
                }
                className="px-4 py-2 rounded-xl bg-[#064E3B] text-white text-xs sm:text-sm font-medium inline-flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{t.actions.exportCsv}</span>
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 overflow-x-auto">
              <table className="w-full text-sm text-left tabular-nums">
                <thead className="bg-[#FAF9F6] border-b border-stone-200 text-xs text-stone-600">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Reference</th>
                    <th className="py-3 px-4 font-semibold">Donor</th>
                    <th className="py-3 px-4 font-semibold">Purpose</th>
                    <th className="py-3 px-4 font-semibold">Method</th>
                    <th className="py-3 px-4 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {donations.map((d) => (
                    <tr key={d.id}>
                      <td className="py-3 px-4 font-mono-tabular text-xs">{d.referenceNumber}</td>
                      <td className="py-3 px-4 font-medium">{d.donorName}</td>
                      <td className="py-3 px-4 text-xs text-stone-600">{d.purpose}</td>
                      <td className="py-3 px-4 text-xs uppercase">{d.paymentMethod}</td>
                      <td className="py-3 px-4 text-right font-semibold text-[#064E3B]">
                        ₹{d.amountInr.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {section === 'notifications' && (
          <div className="space-y-4 max-w-xl">
            <h1 className="text-2xl font-semibold text-[#0F172A]">{t.admin.notifications}</h1>
            <form onSubmit={handleBroadcast} className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-600">Target City</label>
                <select
                  value={notifCity}
                  onChange={(e) => setNotifCity(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-[#FAF9F6]"
                >
                  <option value="All">All Cities</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-600">Announcement Title</label>
                <input
                  type="text"
                  required
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-[#FAF9F6]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-600">Message</label>
                <textarea
                  rows={3}
                  required
                  value={notifMsg}
                  onChange={(e) => setNotifMsg(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-200 bg-[#FAF9F6]"
                />
              </div>
              <div className="flex items-center justify-between">
                {notifSent ? (
                  <span className="text-xs font-medium text-[#047857] inline-flex items-center gap-1">
                    <Check className="w-4 h-4" /> Sent to community feed.
                  </span>
                ) : (
                  <span />
                )}
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#064E3B] text-white font-medium cursor-pointer"
                >
                  Send Announcement
                </button>
              </div>
            </form>
          </div>
        )}

        {section === 'settings' && (
          <div className="space-y-4 max-w-xl">
            <h1 className="text-2xl font-semibold text-[#0F172A]">{t.admin.settings}</h1>
            <form onSubmit={handleSaveSettingsSubmit} className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-600">
                  Past Event History Retention Period (Days)
                </label>
                <input
                  type="number"
                  min={7}
                  max={3650}
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-[#FAF9F6] tabular-nums"
                />
                <p className="text-xs text-stone-500">
                  Default is 30 days. Future and active events are never auto-deleted.
                </p>
              </div>
              <label className="flex items-center justify-between gap-3 cursor-pointer">
                <span className="font-medium text-[#0F172A]">Automatically move finished events to Past History</span>
                <input
                  type="checkbox"
                  checked={autoArchive}
                  onChange={(e) => setAutoArchive(e.target.checked)}
                  className="w-4 h-4 accent-[#064E3B]"
                />
              </label>
              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-600">Default Launch City</label>
                <select
                  value={defaultCity}
                  onChange={(e) => setDefaultCity(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-[#FAF9F6]"
                >
                  {cities.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between pt-2">
                {settingsSaved ? (
                  <span className="text-xs font-medium text-[#047857] inline-flex items-center gap-1">
                    <Check className="w-4 h-4" /> Policy updated.
                  </span>
                ) : (
                  <span />
                )}
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#064E3B] text-white font-medium cursor-pointer"
                >
                  {t.actions.save}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
