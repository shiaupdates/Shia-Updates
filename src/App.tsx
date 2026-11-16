import { useCallback, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, sendEmailVerification, signOut, type User } from 'firebase/auth';
import {
  Bell,
  Building2,
  Calendar,
  CalendarPlus,
  Compass,
  HeartHandshake,
  Home,
  Landmark,
  LayoutDashboard,
  Mail,
  Menu,
  RefreshCw,
  ShieldCheck,
  User as UserIcon,
  X,
} from 'lucide-react';
import { auth } from './firebase';
import type {
  AppSettings,
  AttendanceStatus,
  AudienceFilter,
  CityItem,
  CommunityEvent,
  CommunityNotification,
  DonationRecord,
  EventAttendance,
  EventCategory,
  LanguageCode,
  MainTab,
  PromotionalBanner,
  UserGender,
  UserGeoLocation,
  UserPrivateInfo,
  UserProfile,
} from './types';
import { TRANSLATIONS } from './i18n/translations';
import {
  getCityCoordinates,
  isEventWithinRadius,
  matchNearestIndianCity,
  MAX_EVENT_RADIUS_KM,
} from './utils/formatters';
import {
  buildStarterBanners,
  buildStarterEvents,
  INITIAL_CATEGORIES,
  INITIAL_CITIES,
} from './data/seedData';
import {
  adminDeleteBanner,
  adminDeleteEvent,
  adminSaveAppSettings,
  adminSaveCategory,
  adminSaveCity,
  adminUpdateBanner,
  adminUpdateEventModeration,
  adminUpdateUserRole,
  checkIsAdmin,
  createOrUpdateUserProfile,
  fetchUserProfileAndPrivate,
  markNotificationRead,
  publishCityNotification,
  recordBannerClick,
  saveCommunityEvent,
  seedInitialFirestoreData,
  submitBusinessAdRequest,
  submitDonation,
  submitEventAttendance,
  subscribeActiveBanners,
  subscribeAllBannersAdmin,
  subscribeAllDonationsAdmin,
  subscribeAllEventsAdmin,
  subscribeAllUsersAdmin,
  subscribeAppSettings,
  subscribeCategories,
  subscribeCities,
  subscribeNotifications,
  subscribeOrganizerEvents,
  subscribePublicEvents,
  subscribeReadNotifications,
  subscribeUserAttendance,
  subscribeUserBanners,
  subscribeUserDonations,
} from './services/firestoreService';
import { HomeView } from './components/HomeView';
import { ExploreView } from './components/ExploreView';
import { CalendarView } from './components/CalendarView';
import { MyEventsView } from './components/MyEventsView';
import { ProfileView } from './components/ProfileView';
import { EventDetailModal } from './components/EventDetailModal';
import { EventFormModal } from './components/EventFormModal';
import { OrganizerDashboard } from './components/OrganizerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import {
  BusinessAdModal,
  CitySelectorModal,
  DonationModal,
  NotificationsModal,
  OnboardingModal,
} from './components/CommunityModals';
import {
  AuthModal,
  PENDING_PROFILE_STORAGE_PREFIX,
  type PendingManualProfile,
} from './components/AuthModal';

const STORAGE_LANG_KEY = 'shia_updates_lang';
const STORAGE_CITY_KEY = 'shia_updates_city';
const STORAGE_AUDIENCE_KEY = 'shia_updates_audience';

export default function App() {
  // Auth & Role State
  const [authReady, setAuthReady] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userPrivateInfo, setUserPrivateInfo] = useState<UserPrivateInfo | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Persisted Preferences
  const [lang, setLang] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem(STORAGE_LANG_KEY);
    return saved === 'hi' || saved === 'ur' ? saved : 'en';
  });
  const [selectedCity, setSelectedCity] = useState<string>(
    () => localStorage.getItem(STORAGE_CITY_KEY) || 'Mumbai'
  );
  const [audienceFilter, setAudienceFilter] = useState<AudienceFilter>(() => {
    const saved = localStorage.getItem(STORAGE_AUDIENCE_KEY);
    return saved === 'women' || saved === 'men' || saved === 'both' ? saved : 'all';
  });

  // Live Firestore Data (falls back smoothly to starter catalog if DB is unseeded yet)
  const [liveEvents, setLiveEvents] = useState<CommunityEvent[]>([]);
  const [organizerEvents, setOrganizerEvents] = useState<CommunityEvent[]>([]);
  const [adminEvents, setAdminEvents] = useState<CommunityEvent[]>([]);
  const [liveCategories, setLiveCategories] = useState<EventCategory[]>([]);
  const [liveCities, setLiveCities] = useState<CityItem[]>([]);
  const [liveBanners, setLiveBanners] = useState<PromotionalBanner[]>([]);
  const [userBanners, setUserBanners] = useState<PromotionalBanner[]>([]);
  const [adminBanners, setAdminBanners] = useState<PromotionalBanner[]>([]);
  const [userAttendanceDocs, setUserAttendanceDocs] = useState<Record<string, EventAttendance>>({});
  const [notifications, setNotifications] = useState<CommunityNotification[]>([]);
  const [readNotifIds, setReadNotifIds] = useState<Set<string>>(new Set());
  const [userDonations, setUserDonations] = useState<DonationRecord[]>([]);
  const [adminDonations, setAdminDonations] = useState<DonationRecord[]>([]);
  const [adminUsers, setAdminUsers] = useState<UserProfile[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);

  // Navigation & Modal State
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [exploreCategoryInit, setExploreCategoryInit] = useState<string>('all');
  const [showOrganizerDashboard, setShowOrganizerDashboard] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showSideDrawer, setShowSideDrawer] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CommunityEvent | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CommunityEvent | null>(null);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showBusinessAdModal, setShowBusinessAdModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingManualProfile, setPendingManualProfile] = useState<PendingManualProfile | null>(null);
  const [verifyBannerMsg, setVerifyBannerMsg] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [deepLinkEventId, setDeepLinkEventId] = useState<string | null>(() => {
    try {
      return new URLSearchParams(window.location.search).get('event');
    } catch {
      return null;
    }
  });
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationMode, setLocationMode] = useState<'gps' | 'city'>('city');
  const [locatingGps, setLocatingGps] = useState(false);

  const t = TRANSLATIONS[lang];

  // Apply RTL & HTML lang attribute whenever language changes
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
    localStorage.setItem(STORAGE_LANG_KEY, lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem(STORAGE_CITY_KEY, selectedCity);
  }, [selectedCity]);

  useEffect(() => {
    localStorage.setItem(STORAGE_AUDIENCE_KEY, audienceFilter);
  }, [audienceFilter]);

  const readPendingProfile = useCallback((uid: string): PendingManualProfile | null => {
    try {
      const raw = localStorage.getItem(`${PENDING_PROFILE_STORAGE_PREFIX}${uid}`);
      return raw ? (JSON.parse(raw) as PendingManualProfile) : null;
    } catch {
      return null;
    }
  }, []);

  const loadVerifiedUserProfile = useCallback(
    async (user: User) => {
      try {
        const pending = readPendingProfile(user.uid);
        setPendingManualProfile(pending);
        if (pending?.city) setSelectedCity(pending.city);
        if (pending?.preferredLanguage) setLang(pending.preferredLanguage);

        const adminFlag = await checkIsAdmin(user.uid, user.email);
        setIsAdmin(adminFlag);
        if (adminFlag) {
          await seedInitialFirestoreData(user.uid);
        }
        const { profile, privateInfo } = await fetchUserProfileAndPrivate(user.uid);
        if (profile) {
          setUserProfile(profile);
          setUserPrivateInfo(privateInfo);
          setLang(profile.preferredLanguage);
          setSelectedCity(profile.city);
          setAudienceFilter(profile.preferredAudience);
          setShowOnboarding(false);
          try {
            localStorage.removeItem(`${PENDING_PROFILE_STORAGE_PREFIX}${user.uid}`);
          } catch {
            // Ignore storage removal errors
          }
        } else {
          setUserProfile(null);
          setUserPrivateInfo(null);
          setShowOnboarding(true);
        }
      } catch (err) {
        console.error(err);
      }
    },
    [readPendingProfile]
  );

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setAuthError(null);
      setVerifyBannerMsg(null);
      if (user) {
        if (!user.emailVerified) {
          const pending = readPendingProfile(user.uid);
          setPendingManualProfile(pending);
          setIsAdmin(false);
          setUserProfile(null);
          setUserPrivateInfo(null);
          setShowOnboarding(false);
        } else {
          await loadVerifiedUserProfile(user);
        }
      } else {
        setPendingManualProfile(null);
        setIsAdmin(false);
        setUserProfile(null);
        setUserPrivateInfo(null);
        setShowOnboarding(false);
        setShowAdminDashboard(false);
        setShowOrganizerDashboard(false);
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, [loadVerifiedUserProfile, readPendingProfile]);

  // Public & Shared Firestore Subscriptions
  useEffect(() => {
    const unsubs = [
      subscribeCategories(isAdmin, setLiveCategories),
      subscribeCities(isAdmin, setLiveCities),
      subscribePublicEvents(setLiveEvents),
      subscribeActiveBanners(setLiveBanners),
      subscribeAppSettings(setAppSettings),
    ];
    return () => unsubs.forEach((u) => u());
  }, [isAdmin]);

  // Authenticated User Subscriptions
  useEffect(() => {
    if (!authReady || !firebaseUser) {
      setOrganizerEvents([]);
      setUserAttendanceDocs({});
      setNotifications([]);
      setReadNotifIds(new Set());
      setUserDonations([]);
      setUserBanners([]);
      return;
    }
    const uid = firebaseUser.uid;
    const unsubs = [
      subscribeOrganizerEvents(uid, setOrganizerEvents),
      subscribeUserAttendance(uid, setUserAttendanceDocs),
      subscribeNotifications(uid, setNotifications),
      subscribeReadNotifications(uid, setReadNotifIds),
      subscribeUserDonations(uid, setUserDonations),
      subscribeUserBanners(uid, setUserBanners),
    ];
    return () => unsubs.forEach((u) => u());
  }, [authReady, firebaseUser]);

  // Admin Subscriptions
  useEffect(() => {
    if (!authReady || !firebaseUser || !isAdmin) {
      setAdminEvents([]);
      setAdminBanners([]);
      setAdminDonations([]);
      setAdminUsers([]);
      return;
    }
    const unsubs = [
      subscribeAllEventsAdmin(setAdminEvents),
      subscribeAllBannersAdmin(setAdminBanners),
      subscribeAllDonationsAdmin(setAdminDonations),
      subscribeAllUsersAdmin(setAdminUsers),
    ];
    return () => unsubs.forEach((u) => u());
  }, [authReady, firebaseUser, isAdmin]);

  // Effective Data (Live Firestore or Starter Preview when DB is not yet seeded by admin)
  const categories = liveCategories.length > 0 ? liveCategories : INITIAL_CATEGORIES;
  const cities = liveCities.length > 0 ? liveCities : INITIAL_CITIES;
  const starterEvents = useMemo(() => buildStarterEvents(), []);
  const starterBanners = useMemo(() => buildStarterBanners(), []);
  const events = liveEvents.length > 0 ? liveEvents : starterEvents;
  const banners = liveBanners.length > 0 ? liveBanners : starterBanners;

  const handleDetectUserGps = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;
    setLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocationMode('gps');
        setLocatingGps(false);
      },
      () => {
        setLocatingGps(false);
      },
      { enableHighAccuracy: false, timeout: 7000, maximumAge: 180000 }
    );
  }, []);

  // Attempt automatic GPS detection on mount for accurate 72 km radius discovery
  useEffect(() => {
    handleDetectUserGps();
  }, [handleDetectUserGps]);

  const userLocation = useMemo<UserGeoLocation>(() => {
    if (locationMode === 'gps' && gpsCoords) {
      const nearest = matchNearestIndianCity(
        gpsCoords.lat,
        gpsCoords.lng,
        cities.map((c) => c.name)
      );
      return {
        lat: gpsCoords.lat,
        lng: gpsCoords.lng,
        source: 'gps',
        label: `${t.location.gpsActive} (${nearest})`,
      };
    }
    const cityCoords = getCityCoordinates(selectedCity) || { lat: 19.076, lng: 72.8777 };
    return {
      lat: cityCoords.lat,
      lng: cityCoords.lng,
      source: 'city',
      label: selectedCity,
    };
  }, [locationMode, gpsCoords, selectedCity, cities, t.location.gpsActive]);

  // Only events within 72 km of the user's current location can be viewed in feeds
  const radiusEvents = useMemo(() => {
    return events.filter((ev) => isEventWithinRadius(ev, userLocation, MAX_EVENT_RADIUS_KM));
  }, [events, userLocation]);

  const userAttendanceMap = useMemo(() => {
    const m: Record<string, AttendanceStatus> = {};
    for (const [evId, rec] of Object.entries(userAttendanceDocs)) {
      m[evId] = rec.status;
    }
    return m;
  }, [userAttendanceDocs]);

  const attendingYesOrMaybeEventIds = useMemo(() => {
    const ids = new Set<string>();
    for (const [evId, rec] of Object.entries(userAttendanceDocs)) {
      if (rec.status === 'yes' || rec.status === 'maybe') {
        ids.add(evId);
      }
    }
    return ids;
  }, [userAttendanceDocs]);

  const isVerifiedSignedIn = Boolean(firebaseUser && firebaseUser.emailVerified);
  const hasActiveAttendance = isVerifiedSignedIn && attendingYesOrMaybeEventIds.size > 0;

  const eligibleNotifications = useMemo(() => {
    if (!hasActiveAttendance) return [];
    return notifications.filter((n) => {
      const cityMatches =
        !n.city || n.city === 'All' || n.city.toLowerCase() === selectedCity.toLowerCase();
      if (!cityMatches) return false;
      if (n.eventId) {
        return attendingYesOrMaybeEventIds.has(n.eventId);
      }
      return true;
    });
  }, [hasActiveAttendance, notifications, selectedCity, attendingYesOrMaybeEventIds]);

  const unreadNotifCount = useMemo(() => {
    return eligibleNotifications.filter((n) => !readNotifIds.has(n.id)).length;
  }, [eligibleNotifications, readNotifIds]);

  useEffect(() => {
    if (!hasActiveAttendance && showNotificationsModal) {
      setShowNotificationsModal(false);
    }
  }, [hasActiveAttendance, showNotificationsModal]);

  const categoryMap = useMemo(() => {
    const m: Record<string, EventCategory> = {};
    for (const c of categories) m[c.id] = c;
    return m;
  }, [categories]);

  // Keep selectedEvent synchronized with live updates
  const activeSelectedEvent = useMemo(() => {
    if (!selectedEvent) return null;
    return (
      events.find((e) => e.id === selectedEvent.id) ||
      organizerEvents.find((e) => e.id === selectedEvent.id) ||
      selectedEvent
    );
  }, [selectedEvent, events, organizerEvents]);

  // Open shared event link (?event=<id>) automatically once matching event is available
  useEffect(() => {
    if (!deepLinkEventId) return;
    const match =
      events.find((e) => e.id === deepLinkEventId) ||
      organizerEvents.find((e) => e.id === deepLinkEventId);
    if (match) {
      setSelectedEvent(match);
      setDeepLinkEventId(null);
    }
  }, [deepLinkEventId, events, organizerEvents]);

  const handleCloseSelectedEvent = () => {
    setSelectedEvent(null);
    setDeepLinkEventId(null);
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has('event')) {
        url.searchParams.delete('event');
        window.history.replaceState({}, '', url.toString());
      }
    } catch {
      // Ignore history errors
    }
  };

  const handleRequireAuth = () => {
    setAuthError(null);
    if (!firebaseUser) {
      setShowAuthModal(true);
      return;
    }
    if (!firebaseUser.emailVerified) {
      setVerifyBannerMsg(t.auth.verifyStillPending);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleRefreshVerification = async () => {
    if (!auth.currentUser) return;
    setVerifyBannerMsg(null);
    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        await auth.currentUser.getIdToken(true);
        setFirebaseUser(auth.currentUser);
        await loadVerifiedUserProfile(auth.currentUser);
      } else {
        setVerifyBannerMsg(t.auth.verifyStillPending);
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Unable to check verification status.');
    }
  };

  const handleResendVerification = async () => {
    if (!auth.currentUser) return;
    try {
      await sendEmailVerification(auth.currentUser);
      setVerifyBannerMsg(t.auth.verifyResent);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Unable to send verification email.');
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setShowSideDrawer(false);
    setActiveTab('home');
  };

  const handleCompleteOnboarding = async (data: {
    language: LanguageCode;
    displayName: string;
    mobileNumber: string;
    gender: UserGender;
    city: string;
  }) => {
    if (!firebaseUser) return;
    setLang(data.language);
    setSelectedCity(data.city);
    await createOrUpdateUserProfile(
      firebaseUser.uid,
      {
        displayName: data.displayName,
        photoUrl: firebaseUser.photoURL || undefined,
        city: data.city,
        preferredLanguage: data.language,
        gender: data.gender,
        preferredAudience: audienceFilter,
      },
      {
        email: firebaseUser.email || '',
        mobileNumber: data.mobileNumber,
        notificationsEnabled: true,
        cityAlerts: true,
        eventReminders: true,
        privacyShowProfileToOrganizers: true,
      },
      true
    );
    try {
      localStorage.removeItem(`${PENDING_PROFILE_STORAGE_PREFIX}${firebaseUser.uid}`);
    } catch {
      // Ignore storage cleanup errors
    }
    setPendingManualProfile(null);
    const { profile, privateInfo } = await fetchUserProfileAndPrivate(firebaseUser.uid);
    setUserProfile(profile);
    setUserPrivateInfo(privateInfo);
    setShowOnboarding(false);
  };

  const handleChangeLanguage = async (nextLang: LanguageCode) => {
    setLang(nextLang);
    if (firebaseUser && userProfile) {
      await createOrUpdateUserProfile(
        firebaseUser.uid,
        {
          displayName: userProfile.displayName,
          photoUrl: userProfile.photoUrl,
          city: selectedCity,
          preferredLanguage: nextLang,
          gender: userProfile.gender,
          preferredAudience: audienceFilter,
        },
        {
          email: userPrivateInfo?.email || firebaseUser.email || '',
          mobileNumber: userPrivateInfo?.mobileNumber,
          notificationsEnabled: userPrivateInfo?.notificationsEnabled ?? true,
          cityAlerts: userPrivateInfo?.cityAlerts ?? true,
          eventReminders: userPrivateInfo?.eventReminders ?? true,
          privacyShowProfileToOrganizers: userPrivateInfo?.privacyShowProfileToOrganizers ?? true,
        },
        false
      );
    }
  };

  const handleChangeCity = async (nextCity: string) => {
    setSelectedCity(nextCity);
    setLocationMode('city');
    if (firebaseUser && userProfile) {
      await createOrUpdateUserProfile(
        firebaseUser.uid,
        {
          displayName: userProfile.displayName,
          photoUrl: userProfile.photoUrl,
          city: nextCity,
          preferredLanguage: lang,
          gender: userProfile.gender,
          preferredAudience: audienceFilter,
        },
        {
          email: userPrivateInfo?.email || firebaseUser.email || '',
          mobileNumber: userPrivateInfo?.mobileNumber,
          notificationsEnabled: userPrivateInfo?.notificationsEnabled ?? true,
          cityAlerts: userPrivateInfo?.cityAlerts ?? true,
          eventReminders: userPrivateInfo?.eventReminders ?? true,
          privacyShowProfileToOrganizers: userPrivateInfo?.privacyShowProfileToOrganizers ?? true,
        },
        false
      );
    }
  };

  const handleOpenCreateEvent = () => {
    if (!isVerifiedSignedIn) {
      setShowSideDrawer(false);
      handleRequireAuth();
      return;
    }
    setEditingEvent(null);
    setShowEventForm(true);
    setShowSideDrawer(false);
  };

  // Full-Screen Web Admin Dashboard View
  if (showAdminDashboard && isAdmin && firebaseUser) {
    return (
      <AdminDashboard
        lang={lang}
        adminUid={firebaseUser.uid}
        events={adminEvents}
        categories={categories}
        cities={cities}
        banners={adminBanners}
        users={adminUsers}
        donations={adminDonations}
        appSettings={appSettings}
        onExitAdmin={() => setShowAdminDashboard(false)}
        onSaveCategory={adminSaveCategory}
        onSaveCity={adminSaveCity}
        onUpdateEventModeration={adminUpdateEventModeration}
        onDeleteEvent={adminDeleteEvent}
        onUpdateBanner={adminUpdateBanner}
        onCreateCommunityBanner={(input) => submitBusinessAdRequest(input, true).then(() => undefined)}
        onDeleteBanner={adminDeleteBanner}
        onUpdateUserRole={adminUpdateUserRole}
        onBroadcastNotification={publishCityNotification}
        onSaveSettings={adminSaveAppSettings}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#0F172A] pb-24 lg:pb-12">
      {/* Top Bar (3-zone on Desktop, Compact App Bar on Mobile) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Menu Trigger + Single Brand Wordmark */}
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowSideDrawer(true)}
              aria-label="Open menu"
              className="w-10 h-10 -ms-2 rounded-xl hover:bg-stone-100 flex items-center justify-center text-[#0F172A] cursor-pointer shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setShowOrganizerDashboard(false);
                setActiveTab('home');
              }}
              className="min-h-[40px] flex items-center gap-1.5 text-lg leading-none font-bold tracking-tight text-[#064E3B] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-3.5 h-3.5 text-[#B4832E] shrink-0"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2.5L21.5 12L12 21.5L2.5 12L12 2.5Z" />
              </svg>
              <span>{t.appName}</span>
            </button>
          </div>

          {/* Zone 2: Desktop Single-Line Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-stone-600">
            {(
              [
                { id: 'home', label: t.nav.home },
                { id: 'explore', label: t.nav.explore },
                { id: 'calendar', label: t.nav.calendar },
                { id: 'my-events', label: t.nav.myEvents },
                { id: 'profile', label: t.nav.profile },
              ] as const
            ).map((navItem) => (
              <button
                key={navItem.id}
                type="button"
                onClick={() => {
                  setShowOrganizerDashboard(false);
                  setActiveTab(navItem.id);
                }}
                className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === navItem.id && !showOrganizerDashboard
                    ? 'border-[#064E3B] text-[#064E3B] font-semibold'
                    : 'border-transparent hover:text-[#0F172A]'
                }`}
              >
                {navItem.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Notifications + Primary CTA */}
          <div className="flex items-center gap-2 shrink-0">
            {hasActiveAttendance && (
              <button
                type="button"
                onClick={() => setShowNotificationsModal(true)}
                aria-label="Notifications"
                className="relative w-10 h-10 rounded-xl hover:bg-stone-100 flex items-center justify-center text-[#0F172A] cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#B4832E] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {unreadNotifCount}
                  </span>
                )}
              </button>
            )}

            {isVerifiedSignedIn && (
              <button
                type="button"
                onClick={handleOpenCreateEvent}
                className="hidden sm:inline-flex min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#064E3B] text-white text-xs sm:text-sm font-medium hover:bg-[#047857] items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>{t.actions.createEvent}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {firebaseUser && !firebaseUser.emailVerified && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3">
          <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#B4832E]/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#B4832E] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="text-sm font-semibold text-[#0F172A]">
                  {t.auth.verifyTitle} ({firebaseUser.email})
                </div>
                <p className="text-xs text-stone-600">{t.auth.verifyMessage}</p>
                {verifyBannerMsg && (
                  <p className="text-xs font-medium text-[#064E3B] pt-1">{verifyBannerMsg}</p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => void handleRefreshVerification()}
                className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#064E3B] text-white text-xs font-semibold hover:bg-[#047857] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{t.auth.refreshVerify}</span>
              </button>
              <button
                type="button"
                onClick={() => void handleResendVerification()}
                className="min-h-[38px] px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-xs font-medium text-[#0F172A] hover:bg-stone-50 cursor-pointer whitespace-nowrap"
              >
                {t.auth.resendVerify}
              </button>
            </div>
          </div>
        </div>
      )}

      {authError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3">
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center justify-between">
            <span>{authError}</span>
            <button type="button" onClick={() => setAuthError(null)} className="cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {showOrganizerDashboard && firebaseUser ? (
          <OrganizerDashboard
            lang={lang}
            events={organizerEvents}
            retentionDays={appSettings?.pastEventRetentionDays ?? 30}
            onBack={() => setShowOrganizerDashboard(false)}
            onCreateEvent={handleOpenCreateEvent}
            onEditEvent={(ev) => {
              setEditingEvent(ev);
              setShowEventForm(true);
            }}
            onPublishDraft={async (ev) => {
              await saveCommunityEvent({ ...ev, status: 'published' }, false);
            }}
            onCancelEvent={async (ev) => {
              await saveCommunityEvent({ ...ev, status: 'cancelled' }, false);
            }}
            onSelectEvent={setSelectedEvent}
          />
        ) : activeTab === 'home' ? (
          <HomeView
            events={radiusEvents}
            categories={categories}
            banners={banners}
            lang={lang}
            selectedCity={selectedCity}
            userLocation={userLocation}
            locatingGps={locatingGps}
            onUseCurrentGps={handleDetectUserGps}
            onOpenCitySelector={() => setShowCityModal(true)}
            audienceFilter={audienceFilter}
            userAttendanceMap={userAttendanceMap}
            onAudienceChange={setAudienceFilter}
            onSelectEvent={setSelectedEvent}
            onBannerClick={(b) => void recordBannerClick(b)}
            onBrowseCategory={(catId) => {
              setExploreCategoryInit(catId);
              setActiveTab('explore');
            }}
            onViewAllEvents={() => {
              setExploreCategoryInit('all');
              setActiveTab('explore');
            }}
          />
        ) : activeTab === 'explore' ? (
          <ExploreView
            events={radiusEvents}
            categories={categories}
            lang={lang}
            userLocation={userLocation}
            initialCategoryId={exploreCategoryInit}
            userAttendanceMap={userAttendanceMap}
            onSelectEvent={setSelectedEvent}
          />
        ) : activeTab === 'calendar' ? (
          <CalendarView
            events={radiusEvents}
            categories={categories}
            lang={lang}
            userLocation={userLocation}
            userAttendanceMap={userAttendanceMap}
            onSelectEvent={setSelectedEvent}
          />
        ) : activeTab === 'my-events' ? (
          <MyEventsView
            events={radiusEvents}
            organizerEvents={organizerEvents}
            categories={categories}
            lang={lang}
            userLocation={userLocation}
            isSignedIn={isVerifiedSignedIn}
            userAttendanceMap={userAttendanceMap}
            onSelectEvent={setSelectedEvent}
            onCreateEvent={handleOpenCreateEvent}
            onOpenOrganizerDashboard={() => setShowOrganizerDashboard(true)}
            onRequireSignIn={handleRequireAuth}
          />
        ) : (
          <ProfileView
            lang={lang}
            isSignedIn={isVerifiedSignedIn}
            isAdmin={isAdmin}
            userEmail={firebaseUser?.email || undefined}
            userPhoto={firebaseUser?.photoURL || undefined}
            profile={userProfile}
            privateInfo={userPrivateInfo}
            cities={cities}
            selectedCity={selectedCity}
            onChangeLanguage={handleChangeLanguage}
            onChangeCity={handleChangeCity}
            onSaveProfile={async (prof, priv) => {
              if (!firebaseUser) return;
              await createOrUpdateUserProfile(firebaseUser.uid, prof, priv, !userProfile);
              const refreshed = await fetchUserProfileAndPrivate(firebaseUser.uid);
              setUserProfile(refreshed.profile);
              setUserPrivateInfo(refreshed.privateInfo);
            }}
            onSignIn={handleRequireAuth}
            onSignOut={handleSignOut}
            onOpenDonation={() => setShowDonationModal(true)}
            onOpenBusinessAd={() => setShowBusinessAdModal(true)}
            onOpenOrganizerDashboard={() => setShowOrganizerDashboard(true)}
            onOpenAdminPanel={() => setShowAdminDashboard(true)}
          />
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar (5 Tabs) */}
      <nav
        aria-label="Primary Mobile Navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200"
      >
        <div className="grid grid-cols-5 h-16 items-center">
          {(
            [
              { id: 'home', label: t.nav.home, icon: Home },
              { id: 'explore', label: t.nav.explore, icon: Compass },
              { id: 'calendar', label: t.nav.calendar, icon: Calendar },
              { id: 'my-events', label: t.nav.myEvents, icon: CalendarPlus },
              { id: 'profile', label: t.nav.profile, icon: UserIcon },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id && !showOrganizerDashboard;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setShowOrganizerDashboard(false);
                  setActiveTab(item.id);
                }}
                className={`h-full flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                  active ? 'text-[#064E3B] font-semibold' : 'text-stone-500'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] tracking-tight truncate max-w-[68px]">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Left Slide-Over Navigation Drawer (Includes Simple Donation Button, Language, Organizer & Admin) */}
      {showSideDrawer && (
        <div
          className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex"
          onClick={() => setShowSideDrawer(false)}
        >
          <aside
            className="w-80 max-w-[85vw] bg-white h-full flex flex-col justify-between shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Drawer Brand Header */}
              <div className="bg-[#064E3B] islamic-lattice-bg text-white p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-display text-lg font-bold">
                    <Landmark className="w-5 h-5 text-[#E5C168]" />
                    <span>{t.appName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSideDrawer(false)}
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {firebaseUser ? (
                  <div className="text-xs text-stone-200">
                    <div className="font-semibold text-white text-sm">
                      {userProfile?.displayName || firebaseUser.displayName || firebaseUser.email}
                    </div>
                    <div>{selectedCity}</div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setShowSideDrawer(false);
                      setShowAuthModal(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-white text-[#064E3B] text-xs font-semibold hover:bg-stone-100 transition-colors cursor-pointer"
                  >
                    {t.actions.loginOrSignup}
                  </button>
                )}
              </div>

              {/* Quick Language Bar */}
              <div className="p-4 border-b border-stone-100">
                <div className="text-xs font-semibold text-stone-500 mb-2">{t.profile.language}</div>
                <div className="grid grid-cols-3 gap-1.5">
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
                      onClick={() => void handleChangeLanguage(opt.code)}
                      className={`py-2 rounded-lg text-xs font-medium border cursor-pointer ${
                        lang === opt.code
                          ? 'bg-[#064E3B] text-white border-[#064E3B]'
                          : 'bg-[#FAF9F6] text-stone-700 border-stone-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Drawer Actions */}
              <div className="p-3 space-y-1 text-sm">
                <button
                  type="button"
                  onClick={handleOpenCreateEvent}
                  className="w-full px-3.5 py-3 rounded-xl hover:bg-stone-100 flex items-center gap-3 text-left font-medium text-[#0F172A] cursor-pointer"
                >
                  <CalendarPlus className="w-4 h-4 text-[#064E3B]" />
                  <span>{t.actions.createEvent}</span>
                </button>

                {firebaseUser && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowSideDrawer(false);
                      setShowOrganizerDashboard(true);
                    }}
                    className="w-full px-3.5 py-3 rounded-xl hover:bg-stone-100 flex items-center gap-3 text-left font-medium text-[#0F172A] cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#064E3B]" />
                    <span>{t.actions.organizerStudio}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowSideDrawer(false);
                    setShowBusinessAdModal(true);
                  }}
                  className="w-full px-3.5 py-3 rounded-xl hover:bg-stone-100 flex items-center gap-3 text-left font-medium text-[#0F172A] cursor-pointer"
                >
                  <Building2 className="w-4 h-4 text-[#B4832E]" />
                  <span>{t.actions.promoteBusiness}</span>
                </button>

                {/* Simple Donation Button in Side Menu */}
                <button
                  type="button"
                  onClick={() => {
                    setShowSideDrawer(false);
                    setShowDonationModal(true);
                  }}
                  className="w-full px-3.5 py-3 rounded-xl bg-[#064E3B]/8 hover:bg-[#064E3B]/15 flex items-center gap-3 text-left font-semibold text-[#064E3B] cursor-pointer"
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>{t.actions.donate}</span>
                </button>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowSideDrawer(false);
                      setShowAdminDashboard(true);
                    }}
                    className="w-full px-3.5 py-3 rounded-xl bg-[#0F172A] text-white flex items-center gap-3 text-left font-medium mt-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#E5C168]" />
                    <span>{t.actions.adminPanel}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-stone-100 flex items-center justify-between gap-2 text-xs text-stone-500">
              <span>{t.tagline}</span>
              {firebaseUser && (
                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  className="text-xs font-semibold text-[#064E3B] hover:underline whitespace-nowrap cursor-pointer"
                >
                  {t.actions.signOut}
                </button>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Modals */}
      {showAuthModal && (
        <AuthModal
          lang={lang}
          cities={cities}
          defaultCity={selectedCity}
          onClose={() => setShowAuthModal(false)}
          onAuthenticated={() => {
            if (auth.currentUser && auth.currentUser.emailVerified) {
              setFirebaseUser(auth.currentUser);
              void loadVerifiedUserProfile(auth.currentUser);
            }
          }}
        />
      )}

      {activeSelectedEvent && (
        <EventDetailModal
          event={activeSelectedEvent}
          category={categoryMap[activeSelectedEvent.categoryId]}
          lang={lang}
          userLocation={userLocation}
          locatingGps={locatingGps}
          onUseCurrentGps={handleDetectUserGps}
          isSignedIn={isVerifiedSignedIn}
          userRsvp={userAttendanceMap[activeSelectedEvent.id]}
          onClose={handleCloseSelectedEvent}
          onSubmitAttendance={async (eventId, status) => {
            if (!firebaseUser || !firebaseUser.emailVerified) return;
            const target =
              events.find((e) => e.id === eventId) ||
              organizerEvents.find((e) => e.id === eventId);
            if (!target || !isEventWithinRadius(target, userLocation, MAX_EVENT_RADIUS_KM)) {
              throw new Error(t.location.outsideRadiusTitle);
            }
            await submitEventAttendance(eventId, firebaseUser.uid, status);
          }}
          onRequireSignIn={() => {
            handleCloseSelectedEvent();
            handleRequireAuth();
          }}
        />
      )}

      {showEventForm && isVerifiedSignedIn && firebaseUser && (
        <EventFormModal
          lang={lang}
          uid={firebaseUser.uid}
          defaultOrganizerName={userProfile?.displayName || firebaseUser.displayName || ''}
          defaultCity={selectedCity}
          categories={categories}
          cities={cities}
          editingEvent={editingEvent}
          onClose={() => {
            setShowEventForm(false);
            setEditingEvent(null);
          }}
          onSave={async (payload, isNew) => {
            await saveCommunityEvent(payload, isNew);
          }}
        />
      )}

      {showOnboarding && isVerifiedSignedIn && firebaseUser && (
        <OnboardingModal
          initialName={pendingManualProfile?.displayName || firebaseUser.displayName || ''}
          initialEmail={firebaseUser.email || ''}
          initialMobileNumber={pendingManualProfile?.mobileNumber || ''}
          initialGender={pendingManualProfile?.gender || 'prefer_not_to_say'}
          initialCity={pendingManualProfile?.city || selectedCity || 'Mumbai'}
          cities={cities}
          currentLang={pendingManualProfile?.preferredLanguage || lang}
          onComplete={handleCompleteOnboarding}
        />
      )}

      {showCityModal && (
        <CitySelectorModal
          cities={cities}
          selectedCity={selectedCity}
          lang={lang}
          onSelectCity={(city) => void handleChangeCity(city)}
          onClose={() => setShowCityModal(false)}
        />
      )}

      {showDonationModal && (
        <DonationModal
          lang={lang}
          isSignedIn={isVerifiedSignedIn}
          userName={userProfile?.displayName || firebaseUser?.displayName || ''}
          userDonations={userDonations}
          onRequireSignIn={() => {
            setShowDonationModal(false);
            handleRequireAuth();
          }}
          onSubmitDonation={async (input) => {
            if (!firebaseUser || !firebaseUser.emailVerified) throw new Error('Sign in required');
            return submitDonation({
              donorUid: firebaseUser.uid,
              ...input,
            });
          }}
          onClose={() => setShowDonationModal(false)}
        />
      )}

      {showBusinessAdModal && (
        <BusinessAdModal
          lang={lang}
          isSignedIn={isVerifiedSignedIn}
          uid={firebaseUser?.uid || ''}
          cities={cities}
          defaultCity={selectedCity}
          userBanners={userBanners}
          onRequireSignIn={() => {
            setShowBusinessAdModal(false);
            handleRequireAuth();
          }}
          onSubmitAd={async (input) => {
            await submitBusinessAdRequest(input, false);
          }}
          onClose={() => setShowBusinessAdModal(false)}
        />
      )}

      {showNotificationsModal && hasActiveAttendance && (
        <NotificationsModal
          notifications={eligibleNotifications}
          readIds={readNotifIds}
          selectedCity={selectedCity}
          onMarkRead={(id) => {
            if (isVerifiedSignedIn && firebaseUser) void markNotificationRead(firebaseUser.uid, id);
          }}
          onClose={() => setShowNotificationsModal(false)}
        />
      )}
    </div>
  );
}
