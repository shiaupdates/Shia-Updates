import { useState } from 'react';
import {
  Bell,
  Check,
  HeartHandshake,
  LocateFixed,
  MapPin,
  Search,
  X,
} from 'lucide-react';
import type {
  BannerPlacement,
  CityItem,
  CommunityNotification,
  DonationPurpose,
  DonationRecord,
  LanguageCode,
  PaymentMethod,
  PromotionalBanner,
  UserGender,
} from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { POSTER_PRESETS } from '../data/seedData';
import { addDaysToDateStr, getTodayDateStr, matchNearestIndianCity } from '../utils/formatters';

/* -------------------------------------------------------------------------- */
/* 1. Onboarding Modal (Post-Login Language & City Setup)                     */
/* -------------------------------------------------------------------------- */
export function OnboardingModal({
  initialName,
  initialEmail,
  initialMobileNumber = '',
  initialGender = 'prefer_not_to_say',
  initialCity = 'Mumbai',
  cities,
  currentLang,
  onComplete,
}: {
  initialName: string;
  initialEmail: string;
  initialMobileNumber?: string;
  initialGender?: UserGender;
  initialCity?: string;
  cities: CityItem[];
  currentLang: LanguageCode;
  onComplete: (data: {
    language: LanguageCode;
    displayName: string;
    mobileNumber: string;
    gender: UserGender;
    city: string;
  }) => Promise<void>;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [language, setLanguage] = useState<LanguageCode>(currentLang);
  const [displayName, setDisplayName] = useState(initialName);
  const [mobileNumber, setMobileNumber] = useState(initialMobileNumber);
  const [gender, setGender] = useState<UserGender>(initialGender);
  const [city, setCity] = useState(initialCity || 'Mumbai');
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);

  const t = TRANSLATIONS[language];

  const handleDetect = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCity(
          matchNearestIndianCity(
            pos.coords.latitude,
            pos.coords.longitude,
            cities.map((c) => c.name)
          )
        );
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 6000 }
    );
  };

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onComplete({
        language,
        displayName: displayName.trim() || initialName || 'Community Member',
        mobileNumber: mobileNumber.trim(),
        gender,
        city,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-stone-200 space-y-6">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-[#B4832E]">{t.appName}</div>
          <h2 className="text-xl font-semibold text-[#0F172A]">
            {step === 1 ? t.onboarding.chooseLanguage : t.onboarding.setupProfile}
          </h2>
          <p className="text-xs text-stone-500">{initialEmail}</p>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <div className="space-y-2.5">
              {(
                [
                  { code: 'en', title: 'English', sub: 'Left-to-right · Mumbai & India' },
                  { code: 'hi', title: 'हिन्दी (Hindi)', sub: 'देवनागरी लिपि · भारत' },
                  { code: 'ur', title: 'اردو (Urdu)', sub: 'دائیں سے بائیں (RTL) ترتیب' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => setLanguage(opt.code)}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    language === opt.code
                      ? 'border-[#064E3B] bg-[#064E3B]/5 ring-2 ring-[#064E3B]/20'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-[#0F172A]">{opt.title}</div>
                    <div className="text-xs text-stone-500 mt-0.5">{opt.sub}</div>
                  </div>
                  {language === opt.code && <Check className="w-5 h-5 text-[#064E3B]" />}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full min-h-[48px] rounded-xl bg-[#064E3B] text-white text-sm font-semibold hover:bg-[#047857] cursor-pointer"
            >
              {t.actions.continue}
            </button>
          </div>
        ) : (
          <form onSubmit={handleFinish} className="space-y-4 text-sm">
            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-600">{t.profile.fullName}</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-[#FAF9F6]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-600">{t.profile.mobile}</label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="+91 98..."
                className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-[#FAF9F6]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-600">{t.profile.gender}</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as UserGender)}
                className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-[#FAF9F6]"
              >
                <option value="male">{t.profile.male}</option>
                <option value="female">{t.profile.female}</option>
                <option value="prefer_not_to_say">{t.profile.preferNotToSay}</option>
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-stone-600">{t.onboarding.selectCity}</label>
                <button
                  type="button"
                  onClick={handleDetect}
                  disabled={locating}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#064E3B] hover:underline cursor-pointer"
                >
                  <LocateFixed className="w-3.5 h-3.5" />
                  <span>{locating ? '...' : t.actions.detectLocation}</span>
                </button>
              </div>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-[#FAF9F6]"
              >
                {cities
                  .filter((c) => c.isActive)
                  .map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}, {c.state}
                    </option>
                  ))}
              </select>
            </div>

            <div className="pt-2 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="min-h-[46px] px-4 rounded-xl border border-stone-200 text-sm font-medium text-stone-700 cursor-pointer"
              >
                {t.actions.back}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 min-h-[46px] rounded-xl bg-[#064E3B] text-white text-sm font-semibold hover:bg-[#047857] cursor-pointer disabled:opacity-60"
              >
                {saving ? '...' : t.onboarding.completeSetup}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 2. Searchable City Selector Modal                                          */
/* -------------------------------------------------------------------------- */
export function CitySelectorModal({
  cities,
  selectedCity,
  lang,
  onSelectCity,
  onClose,
}: {
  cities: CityItem[];
  selectedCity: string;
  lang: LanguageCode;
  onSelectCity: (city: string) => void;
  onClose: () => void;
}) {
  const t = TRANSLATIONS[lang];
  const [query, setQuery] = useState('');
  const [locating, setLocating] = useState(false);

  const filtered = cities.filter(
    (c) =>
      c.isActive &&
      (`${c.name} ${c.state} ${c.country}`).toLowerCase().includes(query.trim().toLowerCase())
  );

  const handleAutoDetect = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const matched = matchNearestIndianCity(
          pos.coords.latitude,
          pos.coords.longitude,
          cities.map((c) => c.name)
        );
        onSelectCity(matched);
        setLocating(false);
        onClose();
      },
      () => setLocating(false),
      { timeout: 6000 }
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-5 sm:p-6 space-y-4 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#0F172A]">{t.onboarding.selectCity}</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-stone-100 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Mumbai, Pune, Hyderabad..."
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-stone-200 bg-[#FAF9F6] text-sm focus:outline-none focus:border-[#064E3B]"
            />
          </div>
          <button
            type="button"
            onClick={handleAutoDetect}
            disabled={locating}
            className="h-10 px-3 rounded-xl border border-stone-200 text-xs font-medium text-[#064E3B] hover:bg-[#064E3B]/5 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <LocateFixed className="w-3.5 h-3.5" />
            <span>{locating ? '...' : t.actions.detectLocation}</span>
          </button>
        </div>

        <div className="overflow-y-auto divide-y divide-stone-100 flex-1">
          {filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                onSelectCity(c.name);
                onClose();
              }}
              className="w-full py-3.5 px-2 flex items-center justify-between text-left hover:bg-stone-50 rounded-xl cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#064E3B]" />
                <div>
                  <div className="text-sm font-semibold text-[#0F172A]">{c.name}</div>
                  <div className="text-xs text-stone-500">
                    {c.state}, {c.country}
                  </div>
                </div>
              </div>
              {selectedCity.toLowerCase() === c.name.toLowerCase() && (
                <Check className="w-4 h-4 text-[#064E3B]" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 3. Simple Community Donation Modal (No Public Targets / No Donor Lists)    */
/* -------------------------------------------------------------------------- */
export function DonationModal({
  lang,
  isSignedIn,
  userName,
  userDonations,
  onRequireSignIn,
  onSubmitDonation,
  onClose,
}: {
  lang: LanguageCode;
  isSignedIn: boolean;
  userName: string;
  userDonations: DonationRecord[];
  onRequireSignIn: () => void;
  onSubmitDonation: (input: {
    donorName: string;
    amountInr: number;
    purpose: DonationPurpose;
    paymentMethod: PaymentMethod;
  }) => Promise<DonationRecord>;
  onClose: () => void;
}) {
  const t = TRANSLATIONS[lang];
  const [purpose, setPurpose] = useState<DonationPurpose>('general_community');
  const [amountInr, setAmountInr] = useState<number>(501);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [donorName, setDonorName] = useState(userName || '');
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<DonationRecord | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      onRequireSignIn();
      return;
    }
    setSubmitting(true);
    try {
      const rec = await onSubmitDonation({
        donorName: donorName.trim() || userName || 'Community Member',
        amountInr: Math.max(10, amountInr),
        purpose,
        paymentMethod,
      });
      setReceipt(rec);
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
        className="bg-white w-full sm:max-w-lg max-h-[90vh] overflow-y-auto sm:rounded-3xl rounded-t-3xl p-5 sm:p-6 space-y-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <HeartHandshake className="w-5 h-5 text-[#064E3B]" />
            <h2 className="text-lg font-semibold text-[#0F172A]">{t.donation.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-stone-100 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-stone-600">{t.donation.subtitle}</p>

        {receipt ? (
          <div className="p-5 rounded-2xl bg-[#064E3B]/5 border border-[#064E3B]/20 space-y-3">
            <div className="text-base font-semibold text-[#064E3B]">{t.donation.receiptTitle}</div>
            <p className="text-xs sm:text-sm text-stone-700">{t.donation.receiptMessage}</p>
            <div className="pt-2 border-t border-stone-200 text-xs space-y-1 font-mono-tabular text-stone-700">
              <div>Ref: {receipt.referenceNumber}</div>
              <div>Amount: ₹{receipt.amountInr.toLocaleString('en-IN')}</div>
              <div>Method: {receipt.paymentMethod.toUpperCase()}</div>
            </div>
            <button
              type="button"
              onClick={() => setReceipt(null)}
              className="mt-2 px-4 py-2 rounded-xl bg-[#064E3B] text-white text-xs font-medium cursor-pointer"
            >
              {t.actions.close}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-600">{t.donation.purposeLabel}</label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value as DonationPurpose)}
                className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-[#FAF9F6]"
              >
                <option value="general_community">{t.donation.purposes.general_community}</option>
                <option value="majlis_niyaz">{t.donation.purposes.majlis_niyaz}</option>
                <option value="platform_support">{t.donation.purposes.platform_support}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-600">{t.donation.amountLabel}</label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[251, 501, 1100, 2500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmountInr(amt)}
                    className={`h-10 rounded-xl border text-xs font-semibold tabular-nums cursor-pointer ${
                      amountInr === amt
                        ? 'bg-[#064E3B] text-white border-[#064E3B]'
                        : 'bg-[#FAF9F6] border-stone-200 text-[#0F172A]'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={10}
                value={amountInr}
                onChange={(e) => setAmountInr(Number(e.target.value))}
                className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-[#FAF9F6] tabular-nums"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-600">{t.profile.fullName}</label>
              <input
                type="text"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-[#FAF9F6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-600">{t.donation.methodLabel}</label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'upi', label: 'UPI' },
                    { id: 'card', label: 'Card' },
                    { id: 'netbanking', label: 'NetBanking' },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`h-10 rounded-xl border text-xs font-medium cursor-pointer ${
                      paymentMethod === m.id
                        ? 'bg-[#0F172A] text-white border-[#0F172A]'
                        : 'bg-white border-stone-200 text-stone-700'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[48px] rounded-xl bg-[#064E3B] text-white text-sm font-semibold hover:bg-[#047857] cursor-pointer disabled:opacity-60"
            >
              {submitting ? '...' : `${t.donation.confirmButton} · ₹${amountInr.toLocaleString('en-IN')}`}
            </button>
          </form>
        )}

        {isSignedIn && userDonations.length > 0 && (
          <div className="pt-4 border-t border-stone-100 space-y-2">
            <div className="text-xs font-semibold text-stone-500">{t.donation.yourHistory}</div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {userDonations.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#FAF9F6] border border-stone-200/70 tabular-nums"
                >
                  <div>
                    <div className="font-medium text-[#0F172A]">
                      {t.donation.purposes[d.purpose]}
                    </div>
                    <div className="font-mono-tabular text-[11px] text-stone-500">{d.referenceNumber}</div>
                  </div>
                  <div className="font-semibold text-[#064E3B]">₹{d.amountInr.toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 4. Business Advertisement Request Modal                                    */
/* -------------------------------------------------------------------------- */
export function BusinessAdModal({
  lang,
  isSignedIn,
  uid,
  cities,
  defaultCity,
  userBanners,
  onRequireSignIn,
  onSubmitAd,
  onClose,
}: {
  lang: LanguageCode;
  isSignedIn: boolean;
  uid: string;
  cities: CityItem[];
  defaultCity: string;
  userBanners: PromotionalBanner[];
  onRequireSignIn: () => void;
  onSubmitAd: (
    input: Omit<PromotionalBanner, 'id' | 'status' | 'clicks' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  onClose: () => void;
}) {
  const t = TRANSLATIONS[lang];
  const today = getTodayDateStr();

  const [businessName, setBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('Halal Food & Catering');
  const [contactDetails, setContactDetails] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState(POSTER_PRESETS[4].url);
  const [linkUrl, setLinkUrl] = useState('');
  const [city, setCity] = useState(defaultCity || 'Mumbai');
  const [startDate, setStartDate] = useState(today);
  const [durationDays, setDurationDays] = useState(14);
  const [placement, setPlacement] = useState<BannerPlacement>('home_carousel');
  const [submitting, setSubmitting] = useState(false);
  const [submittedNotice, setSubmittedNotice] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      onRequireSignIn();
      return;
    }
    setSubmitting(true);
    setSubmittedNotice(false);
    try {
      await onSubmitAd({
        title: title.trim() || businessName.trim(),
        subtitle: subtitle.trim(),
        type: 'sponsored',
        businessName: businessName.trim(),
        businessCategory,
        contactDetails: contactDetails.trim(),
        imageUrl,
        ...(linkUrl.trim() ? { linkUrl: linkUrl.trim() } : {}),
        city,
        startDate,
        endDate: addDaysToDateStr(startDate, durationDays),
        durationDays,
        placement,
        submittedByUid: uid,
      });
      setSubmittedNotice(true);
      setBusinessName('');
      setTitle('');
      setSubtitle('');
      setContactDetails('');
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
        className="bg-white w-full sm:max-w-xl max-h-[90vh] overflow-y-auto sm:rounded-3xl rounded-t-3xl p-5 sm:p-6 space-y-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#0F172A]">{t.ads.title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-stone-100 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-stone-600">{t.ads.subtitle}</p>

        {submittedNotice && (
          <div className="p-3.5 rounded-xl bg-[#064E3B]/10 text-[#064E3B] text-xs font-medium">
            Advertisement request submitted for Admin approval.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-600">{t.ads.businessName} *</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-[#FAF9F6]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-600">{t.ads.businessCategory}</label>
              <select
                value={businessCategory}
                onChange={(e) => setBusinessCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-[#FAF9F6]"
              >
                <option value="Halal Food & Catering">Halal Food & Catering</option>
                <option value="Islamic Books & Crafts">Islamic Books & Crafts</option>
                <option value="Ziyarat & Travel">Ziyarat & Travel</option>
                <option value="Education & Coaching">Education & Coaching</option>
                <option value="Healthcare & Clinics">Healthcare & Clinics</option>
                <option value="Community Retail">Community Retail</option>
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-medium text-stone-600">{t.ads.bannerTitle} *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-[#FAF9F6]"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-medium text-stone-600">{t.ads.bannerSubtitle}</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-[#FAF9F6]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-600">{t.ads.contactDetails} *</label>
              <input
                type="text"
                required
                value={contactDetails}
                onChange={(e) => setContactDetails(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-[#FAF9F6]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-600">{t.profile.city}</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-[#FAF9F6]"
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

            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-600">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-[#FAF9F6]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-600">{t.ads.duration}</label>
              <select
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-[#FAF9F6]"
              >
                <option value={7}>7 Days</option>
                <option value={14}>14 Days</option>
                <option value={30}>30 Days</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-600">{t.ads.placement}</label>
              <select
                value={placement}
                onChange={(e) => setPlacement(e.target.value as BannerPlacement)}
                className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-[#FAF9F6]"
              >
                <option value="home_carousel">Home Carousel</option>
                <option value="explore_featured">Explore Featured</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-600">Banner Visual</label>
              <select
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-[#FAF9F6]"
              >
                {POSTER_PRESETS.map((p) => (
                  <option key={p.url} value={p.url}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-medium text-stone-600">{t.ads.websiteLink}</label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-[#FAF9F6]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full min-h-[46px] rounded-xl bg-[#064E3B] text-white text-sm font-semibold hover:bg-[#047857] cursor-pointer"
          >
            {submitting ? '...' : t.ads.submitRequest}
          </button>
        </form>

        {userBanners.length > 0 && (
          <div className="pt-4 border-t border-stone-100 space-y-2">
            <div className="text-xs font-semibold text-stone-500">{t.ads.myRequests}</div>
            <div className="space-y-2">
              {userBanners.map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-xl bg-[#FAF9F6] border border-stone-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-[#0F172A]">{b.title}</div>
                    <div className="text-stone-500">
                      {b.city} · {b.startDate} to {b.endDate}
                    </div>
                  </div>
                  <span
                    className={`font-semibold ${
                      b.status === 'active'
                        ? 'text-[#047857]'
                        : b.status === 'rejected'
                        ? 'text-red-700'
                        : 'text-[#B4832E]'
                    }`}
                  >
                    {t.statusLabels[b.status]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 5. Notifications Drawer / Modal                                            */
/* -------------------------------------------------------------------------- */
export function NotificationsModal({
  notifications,
  readIds,
  selectedCity,
  onMarkRead,
  onClose,
}: {
  notifications: CommunityNotification[];
  readIds: Set<string>;
  selectedCity: string;
  onMarkRead: (id: string) => void;
  onClose: () => void;
}) {
  const relevant = notifications.filter(
    (n) => !n.city || n.city === 'All' || n.city.toLowerCase() === selectedCity.toLowerCase()
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-5 sm:p-6 max-h-[82vh] flex flex-col space-y-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#064E3B]" />
            <h2 className="text-lg font-semibold text-[#0F172A]">Notifications</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-stone-100 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-2.5 flex-1">
          {relevant.length === 0 ? (
            <p className="text-sm text-stone-500 py-8 text-center">
              No notifications for {selectedCity} yet.
            </p>
          ) : (
            relevant.map((n) => {
              const isRead = readIds.has(n.id);
              return (
                <div
                  key={n.id}
                  onClick={() => {
                    if (!isRead) onMarkRead(n.id);
                  }}
                  className={`p-3.5 rounded-2xl border transition-colors cursor-pointer ${
                    isRead
                      ? 'bg-white border-stone-200/70 opacity-75'
                      : 'bg-[#FAF9F6] border-[#064E3B]/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[11px] text-stone-500 mb-1">
                    <span className="font-semibold text-[#064E3B]">{n.city}</span>
                    <span>{isRead ? 'Read' : 'New'}</span>
                  </div>
                  <div className="text-sm font-semibold text-[#0F172A]">{n.title}</div>
                  <p className="text-xs text-stone-600 mt-1">{n.message}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
