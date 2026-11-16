import { Calendar, Clock, MapPin, User, Users, Utensils } from 'lucide-react';
import type { AttendanceStatus, CommunityEvent, EventCategory, LanguageCode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { formatDistanceLabel, formatReadableDate, formatTime12h, getCategoryLabel } from '../utils/formatters';
import { CategoryIcon, ResilientImage } from './CategoryIcon';

interface EventCardProps {
  event: CommunityEvent;
  category?: EventCategory;
  lang: LanguageCode;
  userRsvp?: AttendanceStatus;
  distanceKm?: number | null;
  onSelect: (event: CommunityEvent) => void;
  compact?: boolean;
}

export function EventCard({
  event,
  category,
  lang,
  userRsvp,
  distanceKm,
  onSelect,
  compact = false,
}: EventCardProps) {
  const t = TRANSLATIONS[lang];
  const distText = formatDistanceLabel(distanceKm ?? null);

  const audienceLabel =
    event.audienceType === 'women'
      ? t.audience.womenOnly
      : event.audienceType === 'men'
      ? t.audience.menOnly
      : t.audience.forBoth;

  const categoryText = getCategoryLabel(category, lang) || event.categoryName;

  const rsvpLabel =
    userRsvp === 'yes'
      ? t.myEvents.attendingYes
      : userRsvp === 'maybe'
      ? t.myEvents.attendingMaybe
      : userRsvp === 'no'
      ? t.details.noShort
      : null;

  return (
    <article
      onClick={() => onSelect(event)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(event);
        }
      }}
      className="group bg-white rounded-2xl border border-stone-200/90 overflow-hidden hover:border-[#064E3B]/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-[#064E3B]"
    >
      <div>
        {!compact && (
          <div className="relative aspect-[16/9] bg-stone-100 overflow-hidden">
            <ResilientImage
              src={event.posterUrl}
              alt={event.title}
              fallbackTitle={event.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
            {event.status === 'cancelled' && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-sm font-semibold text-white tracking-wide">
                  {t.statusLabels.cancelled}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="p-4 sm:p-5 space-y-3">
          {/* Quiet unboxed metadata line */}
          <div className="flex items-center justify-between gap-2 text-xs text-stone-600">
            <div className="flex items-center gap-1.5 font-medium text-[#064E3B] min-w-0">
              <CategoryIcon iconName={category?.iconName || 'calendar'} className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{categoryText}</span>
              <span aria-hidden="true" className="text-stone-400">·</span>
              <span className="text-stone-600 truncate">{audienceLabel}</span>
            </div>
            {userRsvp && (
              <span
                className={`text-xs font-semibold shrink-0 ${
                  userRsvp === 'yes'
                    ? 'text-[#047857]'
                    : userRsvp === 'maybe'
                    ? 'text-[#B4832E]'
                    : 'text-stone-500'
                }`}
              >
                {rsvpLabel}
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-semibold text-[#0F172A] leading-snug line-clamp-2 group-hover:text-[#064E3B] transition-colors">
            {event.title}
          </h3>

          <div className="space-y-1.5 text-xs sm:text-sm text-stone-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#B4832E] shrink-0" />
              <span className="tabular-nums truncate">
                {formatReadableDate(event.eventDate, lang)}
                {event.endDate && event.endDate !== event.eventDate ? ` – ${formatReadableDate(event.endDate, lang)}` : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#B4832E] shrink-0" />
              <span className="tabular-nums">
                {formatTime12h(event.startTime)} – {formatTime12h(event.endTime)}
              </span>
            </div>
            {event.preacherName && (
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span className="truncate">{event.preacherName}</span>
              </div>
            )}
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span className="truncate">
                {event.venueName}, {event.city}
              </span>
              {distText && (
                <>
                  <span aria-hidden="true" className="text-stone-400 shrink-0">·</span>
                  <span className="text-xs font-medium text-[#064E3B] whitespace-nowrap shrink-0 tabular-nums">
                    {distText}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer summary line */}
      <div className="px-4 sm:px-5 py-3 border-t border-stone-100 flex items-center justify-between gap-3 text-xs text-stone-600">
        <span className="truncate font-medium text-stone-700">{event.organizerName}</span>
        <div className="flex items-center gap-3 shrink-0 tabular-nums">
          {event.foodAvailable && (
            <span className="inline-flex items-center gap-1 text-[#047857]" title={t.details.foodProvided}>
              <Utensils className="w-3.5 h-3.5" />
            </span>
          )}
          <span className="inline-flex items-center gap-1 font-semibold text-[#064E3B]">
            <Users className="w-3.5 h-3.5" />
            <span>{event.yesCount}</span>
          </span>
        </div>
      </div>
    </article>
  );
}
