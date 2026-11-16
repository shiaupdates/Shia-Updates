import { useState } from 'react';
import {
  Calendar,
  CalendarPlus,
  Check,
  Clock,
  HelpCircle,
  LocateFixed,
  MapPin,
  Navigation,
  Phone,
  Share2,
  ShieldAlert,
  User,
  Users,
  Utensils,
  X,
  XCircle,
} from 'lucide-react';
import type {
  AttendanceStatus,
  CommunityEvent,
  EventCategory,
  LanguageCode,
  UserGeoLocation,
} from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import {
  buildGoogleMapsDirectionsUrl,
  computeDurationLabel,
  downloadEventIcs,
  formatDistanceLabel,
  formatReadableDate,
  formatTime12h,
  getCategoryLabel,
  getDistanceToEventKm,
  isPastEvent,
  MAX_EVENT_RADIUS_KM,
} from '../utils/formatters';
import { CategoryIcon, ResilientImage } from './CategoryIcon';

interface EventDetailModalProps {
  event: CommunityEvent;
  category?: EventCategory;
  lang: LanguageCode;
  userLocation: UserGeoLocation;
  locatingGps?: boolean;
  onUseCurrentGps?: () => void;
  isSignedIn: boolean;
  userRsvp?: AttendanceStatus;
  onClose: () => void;
  onSubmitAttendance: (eventId: string, status: AttendanceStatus) => Promise<void>;
  onRequireSignIn: () => void;
}

export function EventDetailModal({
  event,
  category,
  lang,
  userLocation,
  locatingGps = false,
  onUseCurrentGps,
  isSignedIn,
  userRsvp,
  onClose,
  onSubmitAttendance,
  onRequireSignIn,
}: EventDetailModalProps) {
  const t = TRANSLATIONS[lang];
  const [submitting, setSubmitting] = useState<AttendanceStatus | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  const distanceKm = getDistanceToEventKm(event, userLocation);
  const withinRadius = distanceKm !== null && distanceKm <= MAX_EVENT_RADIUS_KM;
  const distLabel = formatDistanceLabel(distanceKm);

  const past = isPastEvent(event);
  const cancelled = event.status === 'cancelled';
  const duration = computeDurationLabel(event.startTime, event.endTime);
  const categoryText = getCategoryLabel(category, lang) || event.categoryName;
  const audienceText =
    event.audienceType === 'women'
      ? t.audience.womenOnly
      : event.audienceType === 'men'
      ? t.audience.menOnly
      : t.audience.forBoth;

  const handleRsvp = async (status: AttendanceStatus) => {
    if (!withinRadius) return;
    if (!isSignedIn) {
      onRequireSignIn();
      return;
    }
    if (past || cancelled) return;
    setSubmitting(status);
    setFeedbackMsg(null);
    try {
      await onSubmitAttendance(event.id, status);
      setFeedbackMsg(
        status === 'yes'
          ? t.details.yesLabel
          : status === 'no'
          ? t.details.noLabel
          : t.details.maybeLabel
      );
    } catch {
      setFeedbackMsg('Could not update attendance. Please ensure you are online and signed in.');
    } finally {
      setSubmitting(null);
    }
  };

  const getEventShareUrl = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('event', event.id);
      return url.toString();
    } catch {
      return `${window.location.origin}?event=${encodeURIComponent(event.id)}`;
    }
  };

  const copyToClipboard = async (value: string): Promise<boolean> => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return true;
      }
    } catch {
      // Fallback below
    }
    try {
      const ta = document.createElement('textarea');
      ta.value = value;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  };

  const handleShare = async () => {
    if (!withinRadius) return;
    const shareUrl = getEventShareUrl();
    const text = `${event.title}\n${formatReadableDate(event.eventDate, lang)} · ${formatTime12h(event.startTime)}\n${event.venueName}, ${event.city}`;
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: event.title, text, url: shareUrl });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        // Fallback to copying link when Web Share API is blocked (e.g., desktop/iframe)
      }
    }
    const ok = await copyToClipboard(shareUrl);
    if (ok) {
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 2500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-3xl max-h-[92vh] sm:rounded-3xl rounded-t-3xl overflow-y-auto shadow-2xl border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Hero Image */}
        <div className="relative aspect-[16/9] max-h-[280px] w-full bg-[#0F172A]">
          <ResilientImage
            src={event.posterUrl}
            alt={event.title}
            fallbackTitle={event.title}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {withinRadius && (
              <button
                type="button"
                onClick={handleShare}
                aria-label={shareCopied ? t.actions.linkCopied : t.actions.share}
                title={shareCopied ? t.actions.linkCopied : t.actions.share}
                className="w-11 h-11 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
              >
                {shareCopied ? (
                  <Check className="w-4 h-4 text-[#E5C168]" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label={t.actions.close}
              className="w-11 h-11 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#E5C168] mb-1.5">
              <CategoryIcon iconName={category?.iconName || 'calendar'} className="w-4 h-4" />
              <span>{categoryText}</span>
              <span aria-hidden="true">·</span>
              <span>{audienceText}</span>
              <span aria-hidden="true">·</span>
              <span>{event.city}</span>
              {distLabel && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{distLabel}</span>
                </>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-white leading-tight text-balance">
              {event.title}
            </h2>
          </div>
        </div>

        {!withinRadius ? (
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#B4832E]/15 text-[#B4832E] mx-auto flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-[#0F172A]">
                {t.location.outsideRadiusTitle}
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                {t.location.outsideRadiusMessage}
              </p>
              <p className="text-xs font-medium text-stone-500 pt-1 tabular-nums">
                {event.city}
                {distLabel ? ` · ${distLabel} ${t.location.kmAway}` : ''} · {userLocation.label}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              {onUseCurrentGps && (
                <button
                  type="button"
                  disabled={locatingGps}
                  onClick={onUseCurrentGps}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#064E3B] text-white text-sm font-medium hover:bg-[#047857] inline-flex items-center gap-2 cursor-pointer whitespace-nowrap disabled:opacity-60"
                >
                  <LocateFixed className="w-4 h-4" />
                  <span>{locatingGps ? t.location.detectingGps : t.location.useCurrentGps}</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-stone-100 text-sm font-medium text-stone-700 hover:bg-stone-200 cursor-pointer"
              >
                {t.actions.close}
              </button>
            </div>
          </div>
        ) : (
        <div className="p-5 sm:p-7 space-y-6">
          {cancelled && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800 font-medium">
              {t.details.cancelledBanner}
            </div>
          )}
          {past && !cancelled && (
            <div className="p-4 rounded-xl bg-stone-100 border border-stone-200 text-sm text-stone-700 font-medium">
              {t.details.pastBanner}
            </div>
          )}

          {/* MOST IMPORTANT FEATURE: YES / MAYBE / NO ATTENDANCE */}
          <section className="p-4 rounded-2xl bg-[#FAF9F6] border border-stone-200 space-y-3">
            <div>
              <h3 className="text-base font-semibold text-[#0F172A]">
                {t.details.attendanceHeading}
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                {t.details.attendanceSubheading}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={past || cancelled || submitting !== null}
                onClick={() => handleRsvp('yes')}
                className={`min-h-[42px] px-2.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap ${
                  userRsvp === 'yes'
                    ? 'bg-[#064E3B] text-white shadow-sm ring-2 ring-[#064E3B]/30'
                    : 'bg-white border border-stone-300 text-[#064E3B] hover:bg-[#064E3B]/5'
                }`}
              >
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>{t.details.yesShort}</span>
              </button>

              <button
                type="button"
                disabled={past || cancelled || submitting !== null}
                onClick={() => handleRsvp('maybe')}
                className={`min-h-[42px] px-2.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap ${
                  userRsvp === 'maybe'
                    ? 'bg-[#B4832E] text-white shadow-sm ring-2 ring-[#B4832E]/30'
                    : 'bg-white border border-stone-300 text-[#92681F] hover:bg-[#B4832E]/5'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{t.details.maybeShort}</span>
              </button>

              <button
                type="button"
                disabled={past || cancelled || submitting !== null}
                onClick={() => handleRsvp('no')}
                className={`min-h-[42px] px-2.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap ${
                  userRsvp === 'no'
                    ? 'bg-[#1E293B] text-white shadow-sm ring-2 ring-[#1E293B]/30'
                    : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <XCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{t.details.noShort}</span>
              </button>
            </div>

            {!isSignedIn && !past && !cancelled && (
              <button
                type="button"
                onClick={onRequireSignIn}
                className="text-xs font-medium text-[#064E3B] underline hover:text-[#047857] cursor-pointer"
              >
                {t.details.signInToRsvp}
              </button>
            )}

            {feedbackMsg && (
              <p className="text-xs font-medium text-[#047857]">{feedbackMsg}</p>
            )}

            {/* Real-time Attendance Estimation Summary */}
            <div className="pt-3 border-t border-stone-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3 tabular-nums">
              <div>
                <div className="text-xs text-stone-500">{t.details.confirmedEstimate}</div>
                <div className="text-xl font-bold text-[#064E3B]">{event.yesCount}</div>
              </div>
              <div>
                <div className="text-xs text-stone-500">{t.audience.all === 'All Events' ? 'Maybe' : t.myEvents.attendingMaybe}</div>
                <div className="text-xl font-bold text-[#B4832E]">{event.maybeCount}</div>
              </div>
              <div>
                <div className="text-xs text-stone-500">No</div>
                <div className="text-xl font-bold text-stone-600">{event.noCount}</div>
              </div>
              <div>
                <div className="text-xs text-stone-500">{t.details.totalResponses}</div>
                <div className="text-xl font-bold text-[#0F172A]">{event.totalResponses}</div>
              </div>
            </div>
            <p className="text-[11px] text-stone-500">{t.details.maybeNote}</p>
          </section>

          {/* Description */}
          <section className="space-y-2">
            <p className="text-sm sm:text-base text-stone-700 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </section>

          {/* Key Event Facts Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100 text-sm">
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-[#064E3B] mt-0.5 shrink-0" />
              <div>
                <div className="text-xs text-stone-500">{t.details.dateAndTime}</div>
                <div className="font-medium text-[#0F172A] tabular-nums">
                  {formatReadableDate(event.eventDate, lang)}
                  {event.endDate && event.endDate !== event.eventDate
                    ? ` – ${formatReadableDate(event.endDate, lang)}`
                    : ''}
                </div>
                <div className="text-stone-600 tabular-nums">
                  {formatTime12h(event.startTime)} – {formatTime12h(event.endTime)}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-[#064E3B] mt-0.5 shrink-0" />
              <div>
                <div className="text-xs text-stone-500">{t.details.duration}</div>
                <div className="font-medium text-[#0F172A] tabular-nums">{duration}</div>
              </div>
            </div>

            {event.preacherName && (
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-[#064E3B] mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-stone-500">{t.details.preacher}</div>
                  <div className="font-medium text-[#0F172A]">{event.preacherName}</div>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Users className="w-4 h-4 text-[#064E3B] mt-0.5 shrink-0" />
              <div>
                <div className="text-xs text-stone-500">{t.details.organizer}</div>
                <div className="font-medium text-[#0F172A]">{event.organizerName}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-[#064E3B] mt-0.5 shrink-0" />
              <div>
                <div className="text-xs text-stone-500">{t.details.contact}</div>
                <a
                  href={`tel:${event.contactNumber}`}
                  className="font-medium text-[#064E3B] hover:underline tabular-nums"
                >
                  {event.contactNumber}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Utensils className="w-4 h-4 text-[#064E3B] mt-0.5 shrink-0" />
              <div>
                <div className="text-xs text-stone-500">{t.details.foodAndNiyaz}</div>
                <div className="font-medium text-[#0F172A]">
                  {event.foodAvailable ? t.details.foodProvided : t.details.noFoodInfo}
                </div>
                {event.foodDetails && (
                  <div className="text-xs text-stone-600 mt-0.5">{event.foodDetails}</div>
                )}
              </div>
            </div>
          </section>

          {/* Venue & Map Integration */}
          <section className="pt-4 border-t border-stone-100 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#064E3B] mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-stone-500">{t.details.venueAndMap}</div>
                  <div className="font-semibold text-[#0F172A]">{event.venueName}</div>
                  <div className="text-sm text-stone-600">{event.address}, {event.city}</div>
                </div>
              </div>
              <a
                href={buildGoogleMapsDirectionsUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#064E3B] text-white text-xs sm:text-sm font-medium hover:bg-[#047857] transition-colors shrink-0 whitespace-nowrap"
              >
                <Navigation className="w-4 h-4" />
                <span>{t.actions.getDirections}</span>
              </a>
            </div>

            <div className="rounded-2xl overflow-hidden border border-stone-200 bg-stone-50 h-44">
              <iframe
                title={`Map for ${event.venueName}`}
                loading="lazy"
                className="w-full h-full border-0"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(
                  event.mapQuery || `${event.venueName}, ${event.address}, ${event.city}`
                )}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
              />
            </div>
          </section>

          {event.additionalInfo && (
            <section className="pt-3 border-t border-stone-100 text-sm">
              <div className="text-xs text-stone-500 mb-1">{t.details.additionalNotes}</div>
              <p className="text-stone-700">{event.additionalInfo}</p>
            </section>
          )}

          {/* Action Bar: Add to Calendar + Close */}
          <section className="pt-4 border-t border-stone-200 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => downloadEventIcs(event)}
              className="min-h-[44px] px-4 py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-[#0F172A] hover:bg-stone-50 inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <CalendarPlus className="w-4 h-4 text-[#064E3B]" />
              <span>{t.actions.addToCalendar}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-stone-100 text-sm font-medium text-stone-700 hover:bg-stone-200 cursor-pointer whitespace-nowrap"
            >
              {t.actions.close}
            </button>
          </section>
        </div>
        )}
      </div>
    </div>
  );
}
