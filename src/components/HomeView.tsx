import { useMemo } from 'react';
import { ArrowRight, LocateFixed, MapPin } from 'lucide-react';
import type {
  AttendanceStatus,
  AudienceFilter,
  CommunityEvent,
  EventCategory,
  LanguageCode,
  PromotionalBanner,
  UserGeoLocation,
} from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import {
  getCategoryLabel,
  getDistanceToEventKm,
  getTodayDateStr,
  isEventOnDate,
  isEventWithinRadius,
  isPastEvent,
  MAX_EVENT_RADIUS_KM,
} from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { EventCard } from './EventCard';
import { PromoCarousel } from './PromoCarousel';

interface HomeViewProps {
  events: CommunityEvent[];
  categories: EventCategory[];
  banners: PromotionalBanner[];
  lang: LanguageCode;
  selectedCity: string;
  userLocation: UserGeoLocation;
  locatingGps?: boolean;
  onUseCurrentGps: () => void;
  onOpenCitySelector?: () => void;
  audienceFilter: AudienceFilter;
  userAttendanceMap: Record<string, AttendanceStatus>;
  onAudienceChange: (aud: AudienceFilter) => void;
  onSelectEvent: (ev: CommunityEvent) => void;
  onBannerClick: (banner: PromotionalBanner) => void;
  onBrowseCategory: (categoryId: string) => void;
  onViewAllEvents: () => void;
}

export function HomeView({
  events,
  categories,
  banners,
  lang,
  selectedCity,
  userLocation,
  locatingGps = false,
  onUseCurrentGps,
  onOpenCitySelector,
  audienceFilter,
  userAttendanceMap,
  onAudienceChange,
  onSelectEvent,
  onBannerClick,
  onBrowseCategory,
  onViewAllEvents,
}: HomeViewProps) {
  const t = TRANSLATIONS[lang];
  const todayStr = getTodayDateStr();

  const categoryMap = useMemo(() => {
    const m: Record<string, EventCategory> = {};
    for (const c of categories) m[c.id] = c;
    return m;
  }, [categories]);

  const activeBanners = useMemo(() => {
    return banners.filter(
      (b) =>
        b.status === 'active' &&
        b.placement === 'home_carousel' &&
        (!b.city || b.city === 'All' || b.city.toLowerCase() === selectedCity.toLowerCase() || b.type !== 'sponsored')
    );
  }, [banners, selectedCity]);

  const radiusEvents = useMemo(() => {
    return events.filter((ev) => {
      if (ev.status !== 'published') return false;
      if (!isEventWithinRadius(ev, userLocation, MAX_EVENT_RADIUS_KM)) return false;
      if (audienceFilter === 'all') return true;
      return ev.audienceType === audienceFilter;
    });
  }, [events, userLocation, audienceFilter]);

  const todaysEvents = useMemo(() => {
    return radiusEvents.filter((ev) => isEventOnDate(ev, todayStr));
  }, [radiusEvents, todayStr]);

  const upcomingEvents = useMemo(() => {
    return radiusEvents.filter(
      (ev) => !isPastEvent(ev, todayStr) && !isEventOnDate(ev, todayStr)
    );
  }, [radiusEvents, todayStr]);

  const popularEvents = useMemo(() => {
    return [...radiusEvents]
      .filter((ev) => !isPastEvent(ev, todayStr))
      .sort((a, b) => b.yesCount + b.totalResponses - (a.yesCount + a.totalResponses))
      .slice(0, 3);
  }, [radiusEvents, todayStr]);

  const audienceOptions: Array<{ value: AudienceFilter; label: string }> = [
    { value: 'all', label: t.audience.all },
    { value: 'women', label: t.audience.women },
    { value: 'men', label: t.audience.men },
    { value: 'both', label: t.audience.both },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Top Promotional Carousel */}
      <PromoCarousel
        banners={activeBanners.length > 0 ? activeBanners : banners}
        lang={lang}
        onBannerClick={onBannerClick}
      />

      {/* 2. 72 km Location Scope + Audience Selector Bar */}
      <section aria-label="Event Audience Filter" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center justify-between sm:justify-start gap-2 text-xs sm:text-sm font-medium text-stone-600 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin className="w-4 h-4 text-[#064E3B] shrink-0" />
            <span className="truncate">
              {t.location.withinRadius}{' '}
              {onOpenCitySelector ? (
                <button
                  type="button"
                  onClick={onOpenCitySelector}
                  className="font-semibold text-[#064E3B] hover:underline cursor-pointer"
                >
                  {userLocation.label}
                </button>
              ) : (
                <span className="font-semibold text-[#064E3B]">{userLocation.label}</span>
              )}
            </span>
          </div>
          <button
            type="button"
            disabled={locatingGps}
            onClick={onUseCurrentGps}
            className="min-h-[34px] px-2.5 py-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-xs font-medium text-[#064E3B] inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-60"
          >
            <LocateFixed className="w-3.5 h-3.5 shrink-0" />
            <span>{locatingGps ? t.location.detectingGps : t.location.useCurrentGps}</span>
          </button>
        </div>
        <div className="grid grid-cols-4 sm:inline-flex items-center gap-1 p-1 bg-stone-200/70 rounded-xl">
          {audienceOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onAudienceChange(opt.value)}
              className={`min-h-[40px] px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                audienceFilter === opt.value
                  ? 'bg-[#064E3B] text-white shadow-sm'
                  : 'text-stone-700 hover:text-[#0F172A]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Today's Events (Within 72 km) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#0F172A]">
            {t.home.todaysEvents}
          </h2>
          <button
            type="button"
            onClick={onViewAllEvents}
            className="inline-flex items-center gap-1 text-sm font-medium text-[#064E3B] hover:underline cursor-pointer whitespace-nowrap"
          >
            <span>{t.actions.viewAll}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {todaysEvents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 text-sm text-stone-600 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span>{t.home.noTodayEvents}</span>
            <button
              type="button"
              onClick={onViewAllEvents}
              className="text-sm font-semibold text-[#064E3B] hover:underline self-start cursor-pointer"
            >
              {t.actions.viewAll}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {todaysEvents.map((ev) => (
              <EventCard
                key={ev.id}
                event={ev}
                category={categoryMap[ev.categoryId]}
                lang={lang}
                userRsvp={userAttendanceMap[ev.id]}
                distanceKm={getDistanceToEventKm(ev, userLocation)}
                onSelect={onSelectEvent}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. Category Tabs */}
      <section aria-label={t.home.browseCategories}>
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
          {categories
            .filter((c) => c.isActive)
            .map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onBrowseCategory(cat.id)}
                className="min-h-[46px] px-4 py-2.5 rounded-xl bg-white border border-stone-200 hover:border-[#064E3B] hover:bg-[#064E3B]/5 text-[#0F172A] inline-flex items-center gap-2.5 text-sm font-medium transition-colors shrink-0 cursor-pointer whitespace-nowrap"
              >
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: cat.colorHex || '#064E3B' }}
                >
                  <CategoryIcon iconName={cat.iconName} className="w-4 h-4" />
                </span>
                <span>{getCategoryLabel(cat, lang)}</span>
              </button>
            ))}
        </div>
      </section>

      {/* 5. Upcoming Events Within 72 km */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#0F172A]">
            {t.home.upcomingEvents} — {userLocation.label}
          </h2>
          <button
            type="button"
            onClick={onViewAllEvents}
            className="inline-flex items-center gap-1 text-sm font-medium text-[#064E3B] hover:underline cursor-pointer whitespace-nowrap"
          >
            <span>{t.actions.viewAll}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 text-sm text-stone-600">
            {radiusEvents.length === 0 ? t.location.noEventsInRadius : t.home.noUpcomingEvents}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcomingEvents.map((ev) => (
              <EventCard
                key={ev.id}
                event={ev}
                category={categoryMap[ev.categoryId]}
                lang={lang}
                userRsvp={userAttendanceMap[ev.id]}
                distanceKm={getDistanceToEventKm(ev, userLocation)}
                onSelect={onSelectEvent}
              />
            ))}
          </div>
        )}
      </section>

      {/* 6. Popular Community Events Within 72 km */}
      {popularEvents.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-[#0F172A]">{t.home.popularEvents}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {popularEvents.map((ev) => (
              <EventCard
                key={ev.id}
                event={ev}
                category={categoryMap[ev.categoryId]}
                lang={lang}
                userRsvp={userAttendanceMap[ev.id]}
                distanceKm={getDistanceToEventKm(ev, userLocation)}
                onSelect={onSelectEvent}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
