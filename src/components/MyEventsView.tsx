import { useMemo, useState } from 'react';
import { CalendarPlus, LayoutDashboard } from 'lucide-react';
import type {
  AttendanceStatus,
  CommunityEvent,
  EventCategory,
  LanguageCode,
  UserGeoLocation,
} from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { getDistanceToEventKm, getTodayDateStr, isPastEvent } from '../utils/formatters';
import { EventCard } from './EventCard';

interface MyEventsViewProps {
  events: CommunityEvent[];
  organizerEvents: CommunityEvent[];
  categories: EventCategory[];
  lang: LanguageCode;
  userLocation: UserGeoLocation;
  isSignedIn: boolean;
  userAttendanceMap: Record<string, AttendanceStatus>;
  onSelectEvent: (ev: CommunityEvent) => void;
  onCreateEvent: () => void;
  onOpenOrganizerDashboard: () => void;
  onRequireSignIn: () => void;
}

export function MyEventsView({
  events,
  organizerEvents,
  categories,
  lang,
  userLocation,
  isSignedIn,
  userAttendanceMap,
  onSelectEvent,
  onCreateEvent,
  onOpenOrganizerDashboard,
  onRequireSignIn,
}: MyEventsViewProps) {
  const t = TRANSLATIONS[lang];
  const todayStr = getTodayDateStr();
  const [subTab, setSubTab] = useState<'yes' | 'maybe' | 'created' | 'history'>('yes');

  const categoryMap = useMemo(() => {
    const m: Record<string, EventCategory> = {};
    for (const c of categories) m[c.id] = c;
    return m;
  }, [categories]);

  const attendingYesEvents = useMemo(() => {
    return events.filter(
      (ev) => userAttendanceMap[ev.id] === 'yes' && !isPastEvent(ev, todayStr)
    );
  }, [events, userAttendanceMap, todayStr]);

  const maybeEvents = useMemo(() => {
    return events.filter(
      (ev) => userAttendanceMap[ev.id] === 'maybe' && !isPastEvent(ev, todayStr)
    );
  }, [events, userAttendanceMap, todayStr]);

  const historyEvents = useMemo(() => {
    const combined = new Map<string, CommunityEvent>();
    for (const ev of events) {
      if (isPastEvent(ev, todayStr) && userAttendanceMap[ev.id]) {
        combined.set(ev.id, ev);
      }
    }
    for (const ev of organizerEvents) {
      if (isPastEvent(ev, todayStr)) {
        combined.set(ev.id, ev);
      }
    }
    return Array.from(combined.values()).sort((a, b) =>
      b.eventDate.localeCompare(a.eventDate)
    );
  }, [events, organizerEvents, userAttendanceMap, todayStr]);

  if (!isSignedIn) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-12 text-center space-y-4 max-w-xl mx-auto">
        <h2 className="text-xl font-semibold text-[#0F172A]">{t.nav.myEvents}</h2>
        <p className="text-sm text-stone-600">{t.details.signInToRsvp}</p>
        <button
          type="button"
          onClick={onRequireSignIn}
          className="px-6 py-3 rounded-xl bg-[#064E3B] text-white text-sm font-medium hover:bg-[#047857] cursor-pointer"
        >
          {t.actions.loginOrSignup}
        </button>
      </div>
    );
  }

  const activeList =
    subTab === 'yes'
      ? attendingYesEvents
      : subTab === 'maybe'
      ? maybeEvents
      : subTab === 'created'
      ? organizerEvents
      : historyEvents;

  const emptyMessage =
    subTab === 'yes'
      ? t.myEvents.emptyAttending
      : subTab === 'maybe'
      ? t.myEvents.emptyMaybe
      : subTab === 'created'
      ? t.myEvents.emptyCreated
      : t.myEvents.emptyHistory;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-semibold text-[#0F172A]">{t.nav.myEvents}</h1>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={onOpenOrganizerDashboard}
            className="min-h-[42px] px-4 py-2 rounded-xl border border-stone-200 bg-white text-sm font-medium text-[#0F172A] hover:bg-stone-50 inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <LayoutDashboard className="w-4 h-4 text-[#064E3B]" />
            <span>{t.actions.organizerStudio}</span>
          </button>
          <button
            type="button"
            onClick={onCreateEvent}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-[#064E3B] text-white text-sm font-medium hover:bg-[#047857] inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>{t.actions.createEvent}</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 bg-stone-200/70 rounded-xl w-full sm:w-auto sm:inline-flex">
        {(
          [
            { id: 'yes', label: t.myEvents.attendingYes, count: attendingYesEvents.length },
            { id: 'maybe', label: t.myEvents.attendingMaybe, count: maybeEvents.length },
            { id: 'created', label: t.myEvents.createdByMe, count: organizerEvents.length },
            { id: 'history', label: t.myEvents.history, count: historyEvents.length },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSubTab(tab.id)}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer whitespace-nowrap tabular-nums ${
              subTab === tab.id ? 'bg-white text-[#064E3B] shadow-sm' : 'text-stone-600'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {activeList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center space-y-3">
          <p className="text-sm text-stone-600">{emptyMessage}</p>
          {subTab === 'created' && (
            <button
              type="button"
              onClick={onCreateEvent}
              className="px-5 py-2.5 rounded-xl bg-[#064E3B] text-white text-sm font-medium hover:bg-[#047857] cursor-pointer"
            >
              {t.actions.createEvent}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeList.map((ev) => (
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
