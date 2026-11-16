import { useEffect, useState } from 'react';
import {
  Building2,
  Check,
  HeartHandshake,
  LayoutDashboard,
  LocateFixed,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import type {
  CityItem,
  LanguageCode,
  UserGender,
  UserPrivateInfo,
  UserProfile,
} from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { matchNearestIndianCity } from '../utils/formatters';

interface ProfileViewProps {
  lang: LanguageCode;
  isSignedIn: boolean;
  isAdmin: boolean;
  userEmail?: string;
  userPhoto?: string;
  profile: UserProfile | null;
  privateInfo: UserPrivateInfo | null;
  cities: CityItem[];
  selectedCity: string;
  onChangeLanguage: (lang: LanguageCode) => void;
  onChangeCity: (city: string) => void;
  onSaveProfile: (
    profileData: {
      displayName: string;
      city: string;
      preferredLanguage: LanguageCode;
      gender: UserGender;
      preferredAudience: UserProfile['preferredAudience'];
      photoUrl?: string;
    },
    privateData: {
      email: string;
      mobileNumber?: string;
      notificationsEnabled: boolean;
      cityAlerts: boolean;
      eventReminders: boolean;
      privacyShowProfileToOrganizers: boolean;
    }
  ) => Promise<void>;
  onSignIn: () => void;
  onSignOut: () => void;
  onOpenDonation: () => void;
  onOpenBusinessAd: () => void;
  onOpenOrganizerDashboard: () => void;
  onOpenAdminPanel: () => void;
}

export function ProfileView({
  lang,
  isSignedIn,
  isAdmin,
  userEmail,
  userPhoto,
  profile,
  privateInfo,
  cities,
  selectedCity,
  onChangeLanguage,
  onChangeCity,
  onSaveProfile,
  onSignIn,
  onSignOut,
  onOpenDonation,
  onOpenBusinessAd,
  onOpenOrganizerDashboard,
  onOpenAdminPanel,
}: ProfileViewProps) {
  const t = TRANSLATIONS[lang];

  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [mobileNumber, setMobileNumber] = useState(privateInfo?.mobileNumber || '');
  const [gender, setGender] = useState<UserGender>(profile?.gender || 'prefer_not_to_say');
  const [city, setCity] = useState(profile?.city || selectedCity || 'Mumbai');
  const [preferredLanguage, setPreferredLanguage] = useState<LanguageCode>(
    profile?.preferredLanguage || lang
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    privateInfo?.notificationsEnabled ?? true
  );
  const [cityAlerts, setCityAlerts] = useState(privateInfo?.cityAlerts ?? true);
  const [eventReminders, setEventReminders] = useState(privateInfo?.eventReminders ?? true);
  const [privacyKeepPrivate, setPrivacyKeepPrivate] = useState(
    privateInfo?.privacyShowProfileToOrganizers ?? true
  );
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setGender(profile.gender || 'prefer_not_to_say');
      setCity(profile.city || selectedCity || 'Mumbai');
      setPreferredLanguage(profile.preferredLanguage || lang);
    }
  }, [profile, selectedCity, lang]);

  useEffect(() => {
    if (privateInfo) {
      setMobileNumber(privateInfo.mobileNumber || '');
      setNotificationsEnabled(privateInfo.notificationsEnabled ?? true);
      setCityAlerts(privateInfo.cityAlerts ?? true);
      setEventReminders(privateInfo.eventReminders ?? true);
      setPrivacyKeepPrivate(privateInfo.privacyShowProfileToOrganizers ?? true);
    }
  }, [privateInfo]);

  const handleDetectCity = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const matched = matchNearestIndianCity(
          pos.coords.latitude,
          pos.coords.longitude,
          cities.map((c) => c.name)
        );
        setCity(matched);
        onChangeCity(matched);
        setLocating(false);
      },
      () => {
        setLocating(false);
      },
      { timeout: 6000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      onSignIn();
      return;
    }
    setSaving(true);
    setSavedNotice(false);
    try {
      onChangeLanguage(preferredLanguage);
      onChangeCity(city);
      await onSaveProfile(
        {
          displayName: displayName || profile?.displayName || 'Community Member',
          city,
          preferredLanguage,
          gender,
          preferredAudience: profile?.preferredAudience || 'all',
          photoUrl: userPhoto || profile?.photoUrl,
        },
        {
          email: userEmail || privateInfo?.email || '',
          mobileNumber,
          notificationsEnabled,
          cityAlerts,
          eventReminders,
          privacyShowProfileToOrganizers: privacyKeepPrivate,
        }
      );
      setSavedNotice(true);
      window.setTimeout(() => setSavedNotice(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#0F172A]">{t.profile.title}</h1>
        {isSignedIn && (
          <button
            type="button"
            onClick={onSignOut}
            className="min-h-[40px] px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm font-medium text-stone-700 hover:bg-stone-100 inline-flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.actions.signOut}</span>
          </button>
        )}
      </div>

      {!isSignedIn && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-[#0F172A]">{t.onboarding.welcomeTitle}</h2>
            <p className="text-sm text-stone-600 mt-0.5">{t.details.signInToRsvp}</p>
          </div>
          <button
            type="button"
            onClick={onSignIn}
            className="px-5 py-2.5 rounded-xl bg-[#064E3B] text-white text-sm font-medium hover:bg-[#047857] cursor-pointer whitespace-nowrap"
          >
            {t.actions.loginOrSignup}
          </button>
        </div>
      )}

      {/* Community Actions Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onOpenDonation}
          className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-[#064E3B] text-left flex items-center gap-3 transition-colors cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-[#064E3B]/10 text-[#064E3B] flex items-center justify-center shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#0F172A]">{t.actions.donate}</div>
            <div className="text-xs text-stone-500">{t.donation.title}</div>
          </div>
        </button>

        <button
          type="button"
          onClick={onOpenBusinessAd}
          className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-[#B4832E] text-left flex items-center gap-3 transition-colors cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-[#B4832E]/10 text-[#B4832E] flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#0F172A]">{t.actions.promoteBusiness}</div>
            <div className="text-xs text-stone-500">{t.ads.title}</div>
          </div>
        </button>

        {isSignedIn && (
          <button
            type="button"
            onClick={onOpenOrganizerDashboard}
            className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-[#064E3B] text-left flex items-center gap-3 transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-[#0F172A] flex items-center justify-center shrink-0">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#0F172A]">{t.actions.organizerStudio}</div>
              <div className="text-xs text-stone-500">{t.organizer.subtitle}</div>
            </div>
          </button>
        )}

        {isAdmin && (
          <button
            type="button"
            onClick={onOpenAdminPanel}
            className="p-4 rounded-2xl bg-[#0F172A] text-white text-left flex items-center gap-3 hover:bg-[#1E293B] transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#C59B38]/20 text-[#E5C168] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">{t.actions.adminPanel}</div>
              <div className="text-xs text-stone-300">{t.admin.title}</div>
            </div>
          </button>
        )}
      </div>

      {/* Language, City & Personal Info Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 space-y-5">
        {/* Language Selection (works even before sign-in!) */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-[#0F172A]">{t.profile.language}</label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { code: 'en', label: 'English' },
                { code: 'hi', label: 'हिन्दी' },
                { code: 'ur', label: 'اردو' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.code}
                type="button"
                onClick={() => {
                  setPreferredLanguage(opt.code);
                  onChangeLanguage(opt.code);
                }}
                className={`min-h-[44px] px-3 py-2 rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
                  preferredLanguage === opt.code
                    ? 'bg-[#064E3B] text-white border-[#064E3B]'
                    : 'bg-[#FAF9F6] text-[#0F172A] border-stone-200 hover:bg-stone-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* City Selection with Optional Auto-Detect */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-[#0F172A]">{t.profile.city}</label>
            <button
              type="button"
              onClick={handleDetectCity}
              disabled={locating}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#064E3B] hover:underline cursor-pointer"
            >
              <LocateFixed className="w-3.5 h-3.5" />
              <span>{locating ? '...' : t.actions.detectLocation}</span>
            </button>
          </div>
          <select
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              onChangeCity(e.target.value);
            }}
            className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-[#FAF9F6] text-sm text-[#0F172A] focus:outline-none focus:border-[#064E3B]"
          >
            {cities
              .filter((c) => c.isActive)
              .map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}, {c.state}
                </option>
              ))}
          </select>
        </div>

        {isSignedIn && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-600">{t.profile.fullName}</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-[#FAF9F6] text-sm focus:outline-none focus:border-[#064E3B]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-600">{t.profile.mobile}</label>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="+91 98..."
                  className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-[#FAF9F6] text-sm focus:outline-none focus:border-[#064E3B]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-600">{t.profile.email}</label>
                <input
                  type="email"
                  readOnly
                  value={userEmail || privateInfo?.email || ''}
                  className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-stone-100 text-sm text-stone-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-600">{t.profile.gender}</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as UserGender)}
                  className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-[#FAF9F6] text-sm focus:outline-none focus:border-[#064E3B]"
                >
                  <option value="male">{t.profile.male}</option>
                  <option value="female">{t.profile.female}</option>
                  <option value="prefer_not_to_say">{t.profile.preferNotToSay}</option>
                </select>
              </div>
            </div>

            {/* Notification & Privacy Toggles */}
            <div className="pt-3 border-t border-stone-100 space-y-3">
              <div className="text-sm font-semibold text-[#0F172A]">{t.profile.notifications}</div>
              <label className="flex items-center justify-between gap-3 text-sm text-stone-700 cursor-pointer">
                <span>{t.profile.cityAlerts}</span>
                <input
                  type="checkbox"
                  checked={cityAlerts}
                  onChange={(e) => setCityAlerts(e.target.checked)}
                  className="w-4 h-4 accent-[#064E3B]"
                />
              </label>
              <label className="flex items-center justify-between gap-3 text-sm text-stone-700 cursor-pointer">
                <span>{t.profile.eventReminders}</span>
                <input
                  type="checkbox"
                  checked={eventReminders}
                  onChange={(e) => setEventReminders(e.target.checked)}
                  className="w-4 h-4 accent-[#064E3B]"
                />
              </label>
              <label className="flex items-center justify-between gap-3 text-sm text-stone-700 cursor-pointer">
                <span>{t.profile.showProfileToOrganizers}</span>
                <input
                  type="checkbox"
                  checked={privacyKeepPrivate}
                  onChange={(e) => setPrivacyKeepPrivate(e.target.checked)}
                  className="w-4 h-4 accent-[#064E3B]"
                />
              </label>
            </div>

            <div className="pt-3 flex items-center justify-between gap-4">
              {savedNotice ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#047857]">
                  <Check className="w-4 h-4" />
                  <span>{t.profile.savedSuccess}</span>
                </span>
              ) : (
                <span />
              )}
              <button
                type="submit"
                disabled={saving}
                className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#064E3B] text-white text-sm font-medium hover:bg-[#047857] cursor-pointer disabled:opacity-60"
              >
                {saving ? '...' : t.actions.save}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
