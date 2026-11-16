import { useState } from 'react';
import { LocateFixed, X } from 'lucide-react';
import type {
  AudienceType,
  CityItem,
  CommunityEvent,
  EventCategory,
  EventStatus,
  LanguageCode,
} from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { POSTER_PRESETS } from '../data/seedData';
import { getCategoryLabel, getTodayDateStr } from '../utils/formatters';

interface EventFormModalProps {
  lang: LanguageCode;
  uid: string;
  defaultOrganizerName: string;
  defaultCity: string;
  categories: EventCategory[];
  cities: CityItem[];
  editingEvent?: CommunityEvent | null;
  onClose: () => void;
  onSave: (
    payload: Omit<
      CommunityEvent,
      'yesCount' | 'noCount' | 'maybeCount' | 'totalResponses' | 'moderationStatus' | 'createdAt' | 'updatedAt'
    >,
    isNew: boolean
  ) => Promise<void>;
}

export function EventFormModal({
  lang,
  uid,
  defaultOrganizerName,
  defaultCity,
  categories,
  cities,
  editingEvent,
  onClose,
  onSave,
}: EventFormModalProps) {
  const t = TRANSLATIONS[lang];
  const activeCategories = categories.filter((c) => c.isActive);
  const firstCat = activeCategories[0];

  const [title, setTitle] = useState(editingEvent?.title || '');
  const [categoryId, setCategoryId] = useState(editingEvent?.categoryId || firstCat?.id || 'cat_majlis');
  const [description, setDescription] = useState(editingEvent?.description || '');
  const [posterUrl, setPosterUrl] = useState(
    editingEvent?.posterUrl || POSTER_PRESETS[0].url
  );
  const [audienceType, setAudienceType] = useState<AudienceType>(
    editingEvent?.audienceType || 'both'
  );
  const [eventDate, setEventDate] = useState(editingEvent?.eventDate || getTodayDateStr());
  const [endDate, setEndDate] = useState(editingEvent?.endDate || '');
  const [startTime, setStartTime] = useState(editingEvent?.startTime || '19:30');
  const [endTime, setEndTime] = useState(editingEvent?.endTime || '21:00');
  const [preacherName, setPreacherName] = useState(editingEvent?.preacherName || '');
  const [organizerName, setOrganizerName] = useState(
    editingEvent?.organizerName || defaultOrganizerName || ''
  );
  const [contactNumber, setContactNumber] = useState(editingEvent?.contactNumber || '');
  const [city, setCity] = useState(editingEvent?.city || defaultCity || 'Mumbai');
  const [venueName, setVenueName] = useState(editingEvent?.venueName || '');
  const [address, setAddress] = useState(editingEvent?.address || '');
  const [mapQuery, setMapQuery] = useState(editingEvent?.mapQuery || '');
  const [latitude, setLatitude] = useState(
    editingEvent?.latitude !== undefined ? String(editingEvent.latitude) : ''
  );
  const [longitude, setLongitude] = useState(
    editingEvent?.longitude !== undefined ? String(editingEvent.longitude) : ''
  );
  const [locatingVenue, setLocatingVenue] = useState(false);
  const [foodAvailable, setFoodAvailable] = useState(editingEvent?.foodAvailable ?? true);
  const [foodDetails, setFoodDetails] = useState(editingEvent?.foodDetails || '');
  const [additionalInfo, setAdditionalInfo] = useState(editingEvent?.additionalInfo || '');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleUseCurrentGpsForVenue = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported in this browser.');
      return;
    }
    setLocatingVenue(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setLocatingVenue(false);
      },
      () => {
        setLocatingVenue(false);
        setErrorMsg('Unable to read GPS location. City center coordinates will be used if left blank.');
      },
      { enableHighAccuracy: true, timeout: 7000 }
    );
  };

  const handleSubmit = async (targetStatus: EventStatus) => {
    if (title.trim().length < 3) {
      setErrorMsg('Please enter an event title (at least 3 characters).');
      return;
    }
    if (description.trim().length < 10) {
      setErrorMsg('Please provide an event description (at least 10 characters).');
      return;
    }
    if (!organizerName.trim() || !contactNumber.trim() || !venueName.trim() || !address.trim()) {
      setErrorMsg('Please complete organizer, contact number, venue name, and address.');
      return;
    }

    const parsedLat = latitude.trim() ? Number(latitude) : undefined;
    const parsedLng = longitude.trim() ? Number(longitude) : undefined;
    const hasValidCoords =
      parsedLat !== undefined &&
      parsedLng !== undefined &&
      Number.isFinite(parsedLat) &&
      Number.isFinite(parsedLng) &&
      parsedLat >= -90 &&
      parsedLat <= 90 &&
      parsedLng >= -180 &&
      parsedLng <= 180;

    const chosenCat = categories.find((c) => c.id === categoryId) || firstCat;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await onSave(
        {
          id: editingEvent?.id || '',
          title: title.trim(),
          categoryId: chosenCat?.id || categoryId,
          categoryName: chosenCat?.name || 'Majlis',
          description: description.trim(),
          posterUrl: posterUrl.trim() || POSTER_PRESETS[0].url,
          audienceType,
          eventDate,
          ...(endDate && endDate >= eventDate ? { endDate } : {}),
          startTime,
          endTime,
          ...(preacherName.trim() ? { preacherName: preacherName.trim() } : {}),
          organizerId: editingEvent?.organizerId || uid,
          organizerName: organizerName.trim(),
          contactNumber: contactNumber.trim(),
          city,
          venueName: venueName.trim(),
          address: address.trim(),
          ...(mapQuery.trim() ? { mapQuery: mapQuery.trim() } : {}),
          ...(hasValidCoords ? { latitude: parsedLat, longitude: parsedLng } : {}),
          foodAvailable,
          ...(foodDetails.trim() ? { foodDetails: foodDetails.trim() } : {}),
          ...(additionalInfo.trim() ? { additionalInfo: additionalInfo.trim() } : {}),
          status: targetStatus,
        },
        !editingEvent
      );
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save event.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-2xl max-h-[92vh] sm:rounded-3xl rounded-t-3xl overflow-y-auto shadow-2xl border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-white border-b border-stone-200 px-5 sm:px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#0F172A]">
            {editingEvent ? t.actions.edit : t.actions.createEvent}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.actions.close}
            className="w-10 h-10 rounded-full hover:bg-stone-100 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4 text-sm">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-medium text-stone-600">Event Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Majlis-e-Aza & Dua-e-Kumail"
                className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:outline-none focus:border-[#064E3B]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-600">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:outline-none focus:border-[#064E3B]"
              >
                {activeCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {getCategoryLabel(c, lang)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-600">Audience *</label>
              <select
                value={audienceType}
                onChange={(e) => setAudienceType(e.target.value as AudienceType)}
                className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:outline-none focus:border-[#064E3B]"
              >
                <option value="both">{t.audience.forBoth}</option>
                <option value="women">{t.audience.womenOnly}</option>
                <option value="men">{t.audience.menOnly}</option>
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-medium text-stone-600">Description *</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Share program schedule, seating arrangements, and important community details..."
                className="w-full p-3.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:outline-none focus:border-[#064E3B]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-600">Event Date *</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:outline-none focus:border-[#064E3B]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-600">End Date (Multi-day optional)</label>
              <input
                type="date"
                value={endDate}
                min={eventDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:outline-none focus:border-[#064E3B]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-600">Start Time *</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:outline-none focus:border-[#064E3B]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-600">End Time *</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:outline-none focus:border-[#064E3B]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-600">Zakir / Preacher Name</label>
              <input
                type="text"
                value={preacherName}
                onChange={(e) => setPreacherName(e.target.value)}
                placeholder="Maulana / Zakira..."
                className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:outline-none focus:border-[#064E3B]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-600">Organizer / Anjuman *</label>
              <input
                type="text"
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:outline-none focus:border-[#064E3B]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-600">Contact Number *</label>
              <input
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="+91 98..."
                className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:outline-none focus:border-[#064E3B]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-600">City *</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:outline-none focus:border-[#064E3B]"
              >
                {cities
                  .filter((c) => c.isActive)
                  .map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-medium text-stone-600">Venue Name *</label>
              <input
                type="text"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                placeholder="e.g. Mughal Masjid & Imambargah"
                className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:outline-none focus:border-[#064E3B]"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-medium text-stone-600">Complete Address *</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, neighborhood, landmark, pincode"
                className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:outline-none focus:border-[#064E3B]"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-medium text-stone-600">Poster Image Preset</label>
              <select
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:outline-none focus:border-[#064E3B]"
              >
                {POSTER_PRESETS.map((p) => (
                  <option key={p.url} value={p.url}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-medium text-stone-600">Google Maps Search Query (Optional)</label>
              <input
                type="text"
                value={mapQuery}
                onChange={(e) => setMapQuery(e.target.value)}
                placeholder="Optional exact Google Maps location name"
                className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:outline-none focus:border-[#064E3B]"
              />
            </div>

            <div className="sm:col-span-2 space-y-2 p-3.5 rounded-xl bg-[#FAF9F6] border border-stone-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold text-[#0F172A]">
                    Venue Coordinates (for 72 km Radius Discovery)
                  </div>
                  <div className="text-[11px] text-stone-500">
                    Leave blank to automatically use {city} center coordinates.
                  </div>
                </div>
                <button
                  type="button"
                  disabled={locatingVenue}
                  onClick={handleUseCurrentGpsForVenue}
                  className="min-h-[38px] px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-xs font-medium text-[#064E3B] hover:bg-stone-50 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <LocateFixed className="w-3.5 h-3.5" />
                  <span>{locatingVenue ? t.location.detectingGps : t.location.useCurrentGps}</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="Latitude (e.g. 18.9585)"
                  className="h-10 px-3 rounded-xl border border-stone-200 bg-white text-xs focus:outline-none focus:border-[#064E3B]"
                />
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="Longitude (e.g. 72.8384)"
                  className="h-10 px-3 rounded-xl border border-stone-200 bg-white text-xs focus:outline-none focus:border-[#064E3B]"
                />
              </div>
            </div>

            <div className="sm:col-span-2 flex items-center justify-between p-3.5 rounded-xl bg-[#FAF9F6] border border-stone-200">
              <span className="font-medium text-[#0F172A]">Tabarruk / Niyaz / Refreshments Arranged</span>
              <input
                type="checkbox"
                checked={foodAvailable}
                onChange={(e) => setFoodAvailable(e.target.checked)}
                className="w-4 h-4 accent-[#064E3B]"
              />
            </div>

            {foodAvailable && (
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-medium text-stone-600">Refreshments / Niyaz Details</label>
                <input
                  type="text"
                  value={foodDetails}
                  onChange={(e) => setFoodDetails(e.target.value)}
                  placeholder="e.g. Niyaz dinner served after Majlis"
                  className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:outline-none focus:border-[#064E3B]"
                />
              </div>
            )}

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-medium text-stone-600">Additional Information</label>
              <input
                type="text"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Parking, wheelchair access, or childcare notes"
                className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:outline-none focus:border-[#064E3B]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit('draft')}
              className="min-h-[44px] px-4 py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-700 hover:bg-stone-50 cursor-pointer"
            >
              {t.actions.saveDraft}
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit('published')}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#064E3B] text-white text-sm font-medium hover:bg-[#047857] cursor-pointer disabled:opacity-60"
            >
              {submitting ? '...' : t.actions.publish}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
