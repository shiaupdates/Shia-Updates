import { useMemo, useState } from 'react';
import { ArrowLeft, CalendarPlus, Download, Edit3, Users, XCircle } from 'lucide-react';
import type { CommunityEvent, LanguageCode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import {
  exportRowsToCsv,
  formatReadableDate,
  formatTime12h,
  getTodayDateStr,
  isPastEvent,
} from '../utils/formatters';

interface OrganizerDashboardProps {
  lang: LanguageCode;
  events: CommunityEvent[];
  retentionDays: number;
  onBack: () => void;
  onCreateEvent: () => void;
  onEditEvent: (ev: CommunityEvent) => void;
  onPublishDraft: (ev: CommunityEvent) => Promise<void>;
  onCancelEvent: (ev: CommunityEvent) => Promise<void>;
  onSelectEvent: (ev: CommunityEvent) => void;
}

type OrgTab = 'upcoming' | 'past' | 'published' | 'drafts' | 'cancelled' | 'reports';

export function OrganizerDashboard({
  lang,
  events,
  retentionDays,
  onBack,
  onCreateEvent,
  onEditEvent,
  onPublishDraft,
  onCancelEvent,
  onSelectEvent,
}: OrganizerDashboardProps) {
  const t = TRANSLATIONS[lang];
  const todayStr = getTodayDateStr();
  const [tab, setTab] = useState<OrgTab>('upcoming');

  const upcomingEvents = useMemo(
    () => events.filter((e) => e.status === 'published' && !isPastEvent(e, todayStr)),
    [events, todayStr]
  );
  const pastEvents = useMemo(
    () => events.filter((e) => isPastEvent(e, todayStr) && e.status !== 'draft'),
    [events, todayStr]
  );
  const publishedEvents = useMemo(
    () => events.filter((e) => e.status === 'published'),
    [events]
  );
  const draftEvents = useMemo(
    () => events.filter((e) => e.status === 'draft'),
    [events]
  );
  const cancelledEvents = useMemo(
    () => events.filter((e) => e.status === 'cancelled'),
    [events]
  );

  const totalConfirmedYes = useMemo(
    () => events.reduce((acc, ev) => acc + (ev.yesCount || 0), 0),
    [events]
  );
  const totalMaybe = useMemo(
    () => events.reduce((acc, ev) => acc + (ev.maybeCount || 0), 0),
    [events]
  );

  const displayedList =
    tab === 'upcoming'
      ? upcomingEvents
      : tab === 'past'
      ? pastEvents
      : tab === 'published'
      ? publishedEvents
      : tab === 'drafts'
      ? draftEvents
      : cancelledEvents;

  const handleExportCsv = () => {
    exportRowsToCsv(
      `shia-updates-organizer-attendance-${todayStr}.csv`,
      ['Title', 'City', 'Date', 'Status', 'Confirmed YES', 'Maybe', 'No', 'Total Responses'],
      events.map((e) => [
        e.title,
        e.city,
        e.eventDate,
        e.status,
        e.yesCount,
        e.maybeCount,
        e.noCount,
        e.totalResponses,
      ])
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-xl border border-stone-200 bg-white flex items-center justify-center hover:bg-stone-50 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A]">{t.organizer.title}</h1>
            <p className="text-xs sm:text-sm text-stone-600">{t.organizer.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            className="min-h-[42px] px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm font-medium text-[#0F172A] hover:bg-stone-50 inline-flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#064E3B]" />
            <span>{t.actions.exportCsv}</span>
          </button>
          <button
            type="button"
            onClick={onCreateEvent}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-[#064E3B] text-white text-xs sm:text-sm font-medium hover:bg-[#047857] inline-flex items-center gap-2 cursor-pointer"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>{t.actions.createEvent}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 tabular-nums">
        <div className="bg-white rounded-2xl border border-stone-200 p-4">
          <div className="text-xs text-stone-500">{t.organizer.upcoming}</div>
          <div className="text-2xl font-bold text-[#0F172A] mt-1">{upcomingEvents.length}</div>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-4">
          <div className="text-xs text-stone-500">{t.organizer.estimatedAttendees}</div>
          <div className="text-2xl font-bold text-[#064E3B] mt-1">{totalConfirmedYes}</div>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-4">
          <div className="text-xs text-stone-500">Maybe</div>
          <div className="text-2xl font-bold text-[#B4832E] mt-1">{totalMaybe}</div>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-4">
          <div className="text-xs text-stone-500">{t.organizer.past}</div>
          <div className="text-2xl font-bold text-stone-600 mt-1">{pastEvents.length}</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 bg-stone-200/70 rounded-xl">
        {(
          [
            { id: 'upcoming', label: `${t.organizer.upcoming} (${upcomingEvents.length})` },
            { id: 'past', label: `${t.organizer.past} (${pastEvents.length})` },
            { id: 'published', label: `${t.organizer.published} (${publishedEvents.length})` },
            { id: 'drafts', label: `${t.organizer.drafts} (${draftEvents.length})` },
            { id: 'cancelled', label: `${t.organizer.cancelled} (${cancelledEvents.length})` },
            { id: 'reports', label: t.organizer.attendanceReports },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer whitespace-nowrap tabular-nums ${
              tab === item.id ? 'bg-white text-[#064E3B] shadow-sm' : 'text-stone-600'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'past' && (
        <p className="text-xs text-stone-500">
          {t.organizer.retentionNote} ({retentionDays} days default retention)
        </p>
      )}

      {tab === 'reports' ? (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#FAF9F6] border-b border-stone-200 text-xs text-stone-600">
                <tr>
                  <th className="py-3 px-4 font-semibold">Event</th>
                  <th className="py-3 px-4 font-semibold">Date & City</th>
                  <th className="py-3 px-4 font-semibold text-right">YES (Confirmed)</th>
                  <th className="py-3 px-4 font-semibold text-right">MAYBE</th>
                  <th className="py-3 px-4 font-semibold text-right">NO</th>
                  <th className="py-3 px-4 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 tabular-nums">
                {events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-stone-50">
                    <td className="py-3 px-4 font-medium text-[#0F172A]">
                      <button
                        type="button"
                        onClick={() => onSelectEvent(ev)}
                        className="hover:text-[#064E3B] text-left cursor-pointer"
                      >
                        {ev.title}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-stone-600">
                      {ev.eventDate} · {ev.city}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[#064E3B]">{ev.yesCount}</td>
                    <td className="py-3 px-4 text-right font-semibold text-[#B4832E]">{ev.maybeCount}</td>
                    <td className="py-3 px-4 text-right text-stone-500">{ev.noCount}</td>
                    <td className="py-3 px-4 text-right font-semibold text-[#0F172A]">{ev.totalResponses}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : displayedList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center text-sm text-stone-500">
          No events in this section yet.
        </div>
      ) : (
        <div className="space-y-3">
          {displayedList.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <span className="font-semibold text-[#064E3B]">{ev.categoryName}</span>
                  <span>·</span>
                  <span className="tabular-nums">{formatReadableDate(ev.eventDate, lang)}</span>
                  <span>·</span>
                  <span className="tabular-nums">{formatTime12h(ev.startTime)}</span>
                  <span>·</span>
                  <span>{ev.city}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectEvent(ev)}
                  className="text-base sm:text-lg font-semibold text-[#0F172A] hover:text-[#064E3B] text-left truncate block max-w-full cursor-pointer"
                >
                  {ev.title}
                </button>
                <div className="text-xs text-stone-600">{ev.venueName}</div>
              </div>

              <div className="flex flex-wrap items-center gap-4 justify-between lg:justify-end">
                <div className="flex items-center gap-4 text-xs tabular-nums">
                  <span className="inline-flex items-center gap-1 font-semibold text-[#064E3B]">
                    <Users className="w-3.5 h-3.5" />
                    <span>YES: {ev.yesCount}</span>
                  </span>
                  <span className="text-[#B4832E] font-medium">MAYBE: {ev.maybeCount}</span>
                  <span className="text-stone-500">NO: {ev.noCount}</span>
                </div>

                <div className="flex items-center gap-2">
                  {ev.status === 'draft' && (
                    <button
                      type="button"
                      onClick={() => onPublishDraft(ev)}
                      className="px-3 py-1.5 rounded-lg bg-[#064E3B] text-white text-xs font-medium hover:bg-[#047857] cursor-pointer"
                    >
                      {t.actions.publish}
                    </button>
                  )}
                  {ev.status !== 'completed' && !isPastEvent(ev, todayStr) && (
                    <button
                      type="button"
                      onClick={() => onEditEvent(ev)}
                      className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-medium text-[#0F172A] hover:bg-stone-50 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{t.actions.edit}</span>
                    </button>
                  )}
                  {ev.status === 'published' && !isPastEvent(ev, todayStr) && (
                    <button
                      type="button"
                      onClick={() => onCancelEvent(ev)}
                      className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-700 hover:bg-red-50 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{t.actions.cancelEvent}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
