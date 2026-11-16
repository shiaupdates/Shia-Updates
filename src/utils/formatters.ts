import type { CommunityEvent, EventCategory, LanguageCode } from '../types';

export function getTodayDateStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDaysToDateStr(baseDate: string, days: number): string {
  const [y, m, d] = baseDate.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

export function isPastEvent(ev: CommunityEvent, todayStr = getTodayDateStr()): boolean {
  const effectiveEnd = ev.endDate && ev.endDate >= ev.eventDate ? ev.endDate : ev.eventDate;
  return ev.status === 'completed' || effectiveEnd < todayStr;
}

export function isEventOnDate(ev: CommunityEvent, targetDate: string): boolean {
  const end = ev.endDate && ev.endDate >= ev.eventDate ? ev.endDate : ev.eventDate;
  return targetDate >= ev.eventDate && targetDate <= end;
}

export function formatReadableDate(dateStr: string, lang: LanguageCode = 'en'): string {
  if (!dateStr || dateStr.length !== 10) return dateStr;
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const locale = lang === 'hi' ? 'hi-IN' : lang === 'ur' ? 'ur-PK' : 'en-IN';
  return dt.toLocaleDateString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime12h(time24: string): string {
  if (!time24 || !time24.includes(':')) return time24;
  const [hh, mm] = time24.split(':').map(Number);
  const period = hh >= 12 ? 'PM' : 'AM';
  const hour12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${hour12}:${String(mm).padStart(2, '0')} ${period}`;
}

export function computeDurationLabel(startTime: string, endTime: string): string {
  if (!startTime || !endTime) return '';
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  let diffMins = eh * 60 + em - (sh * 60 + sm);
  if (diffMins <= 0) diffMins += 24 * 60;
  const hrs = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  if (hrs > 0 && mins > 0) return `${hrs} hr ${mins} min`;
  if (hrs > 0) return `${hrs} hr`;
  return `${mins} min`;
}

export function getCategoryLabel(cat: EventCategory | undefined, lang: LanguageCode): string {
  if (!cat) return '';
  if (lang === 'hi' && cat.nameHi) return cat.nameHi;
  if (lang === 'ur' && cat.nameUr) return cat.nameUr;
  return cat.name;
}

export function buildGoogleMapsDirectionsUrl(ev: CommunityEvent): string {
  const query = encodeURIComponent(ev.mapQuery || `${ev.venueName}, ${ev.address}, ${ev.city}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function downloadEventIcs(ev: CommunityEvent): void {
  const cleanDate = ev.eventDate.replace(/-/g, '');
  const cleanStart = ev.startTime.replace(':', '') + '00';
  const cleanEnd = ev.endTime.replace(':', '') + '00';
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Shia Updates//Community Events//EN',
    'BEGIN:VEVENT',
    `UID:${ev.id}@shiaupdates.app`,
    `DTSTART:${cleanDate}T${cleanStart}`,
    `DTEND:${cleanDate}T${cleanEnd}`,
    `SUMMARY:${ev.title}`,
    `LOCATION:${ev.venueName}, ${ev.address}, ${ev.city}`,
    `DESCRIPTION:${ev.description.replace(/\n/g, '\\n')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${ev.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportRowsToCsv(filename: string, headers: string[], rows: (string | number | boolean)[][]): void {
  const escape = (val: string | number | boolean) => `"${String(val).replace(/"/g, '""')}"`;
  const csvContent = [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const MAX_EVENT_RADIUS_KM = 72;

const CITY_COORDINATES: Array<{ name: string; lat: number; lng: number }> = [
  { name: 'Mumbai', lat: 19.076, lng: 72.8777 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567 },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { name: 'Hyderabad', lat: 17.385, lng: 78.4867 },
  { name: 'Delhi', lat: 28.7041, lng: 77.1025 },
  { name: 'Lucknow', lat: 26.8467, lng: 80.9462 },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
];

export function getCityCoordinates(cityName: string): { lat: number; lng: number } | null {
  const normalized = (cityName || '').trim().toLowerCase();
  if (!normalized) return null;
  const match = CITY_COORDINATES.find((c) => c.name.toLowerCase() === normalized);
  return match ? { lat: match.lat, lng: match.lng } : null;
}

export function calculateDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function getEventCoordinates(
  ev: Pick<CommunityEvent, 'latitude' | 'longitude' | 'city'>
): { lat: number; lng: number } | null {
  if (
    typeof ev.latitude === 'number' &&
    Number.isFinite(ev.latitude) &&
    typeof ev.longitude === 'number' &&
    Number.isFinite(ev.longitude)
  ) {
    return { lat: ev.latitude, lng: ev.longitude };
  }
  return getCityCoordinates(ev.city);
}

export function getDistanceToEventKm(
  ev: Pick<CommunityEvent, 'latitude' | 'longitude' | 'city'>,
  userCoords: { lat: number; lng: number } | null
): number | null {
  if (!userCoords) return null;
  const evCoords = getEventCoordinates(ev);
  if (!evCoords) return null;
  return calculateDistanceKm(userCoords.lat, userCoords.lng, evCoords.lat, evCoords.lng);
}

export function isEventWithinRadius(
  ev: Pick<CommunityEvent, 'latitude' | 'longitude' | 'city'>,
  userCoords: { lat: number; lng: number } | null,
  maxRadiusKm = MAX_EVENT_RADIUS_KM
): boolean {
  const dist = getDistanceToEventKm(ev, userCoords);
  if (dist === null) return false;
  return dist <= maxRadiusKm;
}

export function formatDistanceLabel(distanceKm: number | null): string | null {
  if (distanceKm === null || !Number.isFinite(distanceKm)) return null;
  if (distanceKm < 1) return '< 1 km';
  if (distanceKm < 10) return `${distanceKm.toFixed(1)} km`;
  return `${Math.round(distanceKm)} km`;
}

export function matchNearestIndianCity(lat: number, lng: number, availableCityNames: string[]): string {
  let best = 'Mumbai';
  let minDist = Infinity;
  for (const c of CITY_COORDINATES) {
    if (availableCityNames.length > 0 && !availableCityNames.includes(c.name)) continue;
    const dist = calculateDistanceKm(lat, lng, c.lat, c.lng);
    if (dist < minDist) {
      minDist = dist;
      best = c.name;
    }
  }
  return best;
}
