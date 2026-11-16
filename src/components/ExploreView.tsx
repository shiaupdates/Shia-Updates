import { useEffect, useMemo, useState } from 'react';
import { LayoutGrid } from 'lucide-react';
import type {
  AttendanceStatus,
  CommunityEvent,
  EventCategory,
  LanguageCode,
  UserGeoLocation,
} from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import {
  getCategoryLabel,
  getDistanceToEventKm,
  getTodayDateStr,
  isEventWithinRadius,
  isPastEvent,
  MAX_EVENT_RADIUS_KM,
} from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { EventCard } from './EventCard';

interface ExploreViewProps {
  events: CommunityEvent[];
  categories: EventCategory[];
  lang: LanguageCode;
  userLocation: UserGeoLocation;
  initialCategoryId?: string;
  userAttendanceMap: Record<string, AttendanceStatus>;
  onSelectEvent: (ev: CommunityEvent) => void;
}

export function ExploreView({
  events,
  categories,
  lang,
  userLocation,
  initialCategoryId = 'all',
  userAttendanceMap,
  onSelectEvent,
}: ExploreViewProps) {
  const t = TRANSLATIONS[lang];
  const todayStr = getTodayDateStr();

  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategoryId);

  useEffect(() => {
    setCategoryFilter(initialCategoryId);
  }, [initialCategoryId]);

  const activeCategories = useMemo(
    () => categories.filter((c) => c.isActive),
    [categories]
  );

  const categoryMap = useMemo(() => {
    const m: Record<string, EventCategory> = {};
    for (const c of categories) m[c.id] = c;
    return m;
  }, [categories]);

  const radiusEvents = useMemo(() => {
    return events.filter(
      (ev) => !isPastEvent(ev, todayStr) && isEventWithinRadius(ev, userLocation, MAX_EVENT_RADIUS_KM)
    );
  }, [events, todayStr, userLocation]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const ev of radiusEvents) {
      counts[ev.categoryId] = (counts[ev.categoryId] || 0) + 1;
    }
    return counts;
  }, [radiusEvents]);

  const filteredEvents = useMemo(() => {
    if (categoryFilter === 'all') return radiusEvents;
    return radiusEvents.filter((ev) => ev.categoryId === categoryFilter);
  }, [radiusEvents, categoryFilter]);

  return (
    <div className="space-y-6">
      {/* Category Selector Strip */}
      <section aria-label={t.home.browseCategories}>
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`min-h-[46px] px-4 py-2.5 rounded-xl border inline-flex items-center gap-2.5 text-sm font-medium transition-colors shrink-0 cursor-pointer whitespace-nowrap ${
              categoryFilter === 'all'
                ? 'bg-[#064E3B] text-white border-[#064E3B] shadow-sm'
                : 'bg-white text-[#0F172A] border-stone-200 hover:border-[#064E3B] hover:bg-[#064E3B]/5'
            }`}
          >
            <span
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                categoryFilter === 'all' ? 'bg-white/15 text-white' : 'bg-stone-100 text-[#064E3B]'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </span>
            <span>{t.explore.allCategories}</span>
            <span
              className={`text-xs tabular-nums ${
                categoryFilter === 'all' ? 'text-white/80' : 'text-stone-500'
              }`}
            >
              ({radiusEvents.length})
            </span>
          </button>

          {activeCategories.map((cat) => {
            const selected = categoryFilter === cat.id;
            const count = categoryCounts[cat.id] || 0;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`min-h-[46px] px-4 py-2.5 rounded-xl border inline-flex items-center gap-2.5 text-sm font-medium transition-colors shrink-0 cursor-pointer whitespace-nowrap ${
                  selected
                    ? 'bg-[#064E3B] text-white border-[#064E3B] shadow-sm'
                    : 'bg-white text-[#0F172A] border-stone-200 hover:border-[#064E3B] hover:bg-[#064E3B]/5'
                }`}
              >
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: cat.colorHex || '#064E3B' }}
                >
                  <CategoryIcon iconName={cat.iconName} className="w-4 h-4" />
                </span>
                <span>{getCategoryLabel(cat, lang)}</span>
                <span
                  className={`text-xs tabular-nums ${
                    selected ? 'text-white/80' : 'text-stone-500'
                  }`}
                >
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Results */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center text-sm text-stone-500">
          {radiusEvents.length === 0 ? t.location.noEventsInRadius : t.explore.noResults}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((ev) => (
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
    </div>
  );
}
