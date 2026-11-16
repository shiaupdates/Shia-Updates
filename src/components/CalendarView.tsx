import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import type {
  AttendanceStatus,
  CommunityEvent,
  EventCategory,
  LanguageCode,
  UserGeoLocation,
} from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import {
  formatReadableDate,
  getCategoryLabel,
  getDistanceToEventKm,
  getTodayDateStr,
  isEventOnDate,
  isEventWithinRadius,
  MAX_EVENT_RADIUS_KM,
} from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { EventCard } from './EventCard';

interface CalendarViewProps {
  events: CommunityEvent[];
  categories: EventCategory[];
  lang: LanguageCode;
  userLocation: UserGeoLocation;
  userAttendanceMap: Record<string, AttendanceStatus>;
  onSelectEvent: (event: CommunityEvent) => void;
}

export function CalendarView({
  events,
  categories,
  lang,
  userLocation,
  userAttendanceMap,
  onSelectEvent,
}: CalendarViewProps) {
  const t = TRANSLATIONS[lang];
  const todayStr = getTodayDateStr();

  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const activeCategories = useMemo(
    () => categories.filter((c) => c.isActive),
    [categories]
  );

  const radiusEvents = useMemo(() => {
    return events.filter((ev) => isEventWithinRadius(ev, userLocation, MAX_EVENT_RADIUS_KM));
  }, [events, userLocation]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const ev of radiusEvents) {
      counts[ev.categoryId] = (counts[ev.categoryId] || 0) + 1;
    }
    return counts;
  }, [radiusEvents]);

  const scopedEvents = useMemo(() => {
    if (categoryFilter === 'all') return radiusEvents;
    return radiusEvents.filter((ev) => ev.categoryId === categoryFilter);
  }, [radiusEvents, categoryFilter]);

  const categoryColorMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of categories) m[c.id] = c.colorHex || '#064E3B';
    return m;
  }, [categories]);

  const categoryMap = useMemo(() => {
    const m: Record<string, EventCategory> = {};
    for (const c of categories) m[c.id] = c;
    return m;
  }, [categories]);

  const daysInMonth = new Date(viewDate.year, viewDate.month + 1, 0).getDate();
  const firstDayWeekday = new Date(viewDate.year, viewDate.month, 1).getDay();

  const calendarCells = useMemo(() => {
    const cells: Array<{ dateStr: string; dayNum: number } | null> = [];
    for (let i = 0; i < firstDayWeekday; i += 1) cells.push(null);
    for (let d = 1; d <= daysInMonth; d += 1) {
      const mStr = String(viewDate.month + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      cells.push({
        dateStr: `${viewDate.year}-${mStr}-${dStr}`,
        dayNum: d,
      });
    }
    return cells;
  }, [viewDate.year, viewDate.month, daysInMonth, firstDayWeekday]);

  const selectedDayEvents = useMemo(() => {
    return scopedEvents.filter((ev) => isEventOnDate(ev, selectedDate));
  }, [scopedEvents, selectedDate]);

  const monthTitle = new Date(viewDate.year, viewDate.month, 1).toLocaleDateString(
    lang === 'hi' ? 'hi-IN' : lang === 'ur' ? 'ur-PK' : 'en-IN',
    { month: 'long', year: 'numeric' }
  );

  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const shiftMonth = (delta: number) => {
    setViewDate((prev) => {
      const dt = new Date(prev.year, prev.month + delta, 1);
      return { year: dt.getFullYear(), month: dt.getMonth() };
    });
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Monthly Calendar Grid */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-[#0F172A]">{monthTitle}</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  setViewDate({ year: now.getFullYear(), month: now.getMonth() });
                  setSelectedDate(todayStr);
                }}
                className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-medium text-[#064E3B] hover:bg-stone-50 cursor-pointer"
              >
                {t.calendar.today}
              </button>
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                aria-label="Previous month"
                className="w-10 h-10 rounded-xl border border-stone-200 flex items-center justify-center hover:bg-stone-50 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                aria-label="Next month"
                className="w-10 h-10 rounded-xl border border-stone-200 flex items-center justify-center hover:bg-stone-50 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-medium text-stone-500">
            {weekdayLabels.map((w) => (
              <div key={w} className="py-1.5">
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {calendarCells.map((cell, index) => {
              if (!cell) {
                return <div key={`empty-${index}`} className="h-12 sm:h-14" />;
              }
              const dayEvents = scopedEvents.filter((ev) => isEventOnDate(ev, cell.dateStr));
              const isToday = cell.dateStr === todayStr;
              const isSelected = cell.dateStr === selectedDate;
              const dotColors = Array.from(
                new Set(dayEvents.map((ev) => categoryColorMap[ev.categoryId] || '#064E3B'))
              ).slice(0, 3);

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  onClick={() => setSelectedDate(cell.dateStr)}
                  className={`h-12 sm:h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer tabular-nums relative ${
                    isSelected
                      ? 'bg-[#064E3B] text-white font-semibold shadow-sm'
                      : isToday
                      ? 'bg-[#064E3B]/10 text-[#064E3B] font-semibold border border-[#064E3B]/30'
                      : 'hover:bg-stone-100 text-[#0F172A]'
                  }`}
                >
                  <span className="text-sm">{cell.dayNum}</span>
                  <div className="flex items-center gap-1 h-1.5">
                    {dotColors.map((hex, i) => (
                      <span
                        key={`${cell.dateStr}-dot-${i}`}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: isSelected ? '#E5C168' : hex }}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Events List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-[#0F172A]">
              {t.calendar.eventsOnDate} {formatReadableDate(selectedDate, lang)}
            </h2>
            <span className="text-xs font-medium text-stone-500 tabular-nums">
              {selectedDayEvents.length}
            </span>
          </div>

          {selectedDayEvents.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-sm text-stone-500">
              {t.calendar.noEventsOnDate}
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDayEvents.map((ev) => (
                <EventCard
                  key={ev.id}
                  event={ev}
                  category={categoryMap[ev.categoryId]}
                  lang={lang}
                  userRsvp={userAttendanceMap[ev.id]}
                  distanceKm={getDistanceToEventKm(ev, userLocation)}
                  onSelect={onSelectEvent}
                  compact
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
