export type LanguageCode = 'en' | 'hi' | 'ur';

export type AudienceType = 'women' | 'men' | 'both';
export type AudienceFilter = 'all' | AudienceType;

export type UserGender = 'male' | 'female' | 'prefer_not_to_say';
export type UserRole = 'member' | 'organizer' | 'admin';

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';
export type ModerationStatus = 'approved' | 'pending' | 'rejected';

export type AttendanceStatus = 'yes' | 'no' | 'maybe';

export type BannerType = 'community' | 'announcement' | 'sponsored';
export type BannerStatus = 'pending' | 'active' | 'inactive' | 'rejected';
export type BannerPlacement = 'home_carousel' | 'explore_featured';

export type DonationPurpose = 'general_community' | 'majlis_niyaz' | 'platform_support';
export type PaymentMethod = 'upi' | 'card' | 'netbanking';

export type NotificationType =
  | 'new_event'
  | 'reminder'
  | 'update'
  | 'cancellation'
  | 'announcement'
  | 'ad_status';

export type MainTab = 'home' | 'explore' | 'calendar' | 'my-events' | 'profile';

export interface UserGeoLocation {
  lat: number;
  lng: number;
  source: 'gps' | 'city';
  label: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  photoUrl?: string;
  city: string;
  preferredLanguage: LanguageCode;
  gender: UserGender;
  preferredAudience: AudienceFilter;
  role: UserRole;
  isActive: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface UserPrivateInfo {
  uid: string;
  email: string;
  mobileNumber?: string;
  notificationsEnabled: boolean;
  cityAlerts: boolean;
  eventReminders: boolean;
  privacyShowProfileToOrganizers: boolean;
  updatedAt?: unknown;
}

export interface CityItem {
  id: string;
  name: string;
  state: string;
  country: string;
  isActive: boolean;
  sortOrder: number;
  createdAt?: unknown;
}

export interface EventCategory {
  id: string;
  name: string;
  nameHi?: string;
  nameUr?: string;
  iconName: string;
  colorHex: string;
  isActive: boolean;
  sortOrder: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CommunityEvent {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  description: string;
  posterUrl?: string;
  audienceType: AudienceType;
  eventDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  preacherName?: string;
  organizerId: string;
  organizerName: string;
  contactNumber: string;
  city: string;
  venueName: string;
  address: string;
  mapQuery?: string;
  latitude?: number;
  longitude?: number;
  foodAvailable: boolean;
  foodDetails?: string;
  additionalInfo?: string;
  status: EventStatus;
  moderationStatus: ModerationStatus;
  yesCount: number;
  noCount: number;
  maybeCount: number;
  totalResponses: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface EventAttendance {
  id: string;
  eventId: string;
  userId: string;
  organizerId: string;
  status: AttendanceStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface PromotionalBanner {
  id: string;
  title: string;
  subtitle?: string;
  type: BannerType;
  businessName?: string;
  businessCategory?: string;
  contactDetails?: string;
  imageUrl: string;
  linkUrl?: string;
  city: string;
  startDate: string;
  endDate: string;
  durationDays?: number;
  placement: BannerPlacement;
  status: BannerStatus;
  submittedByUid: string;
  clicks: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface DonationRecord {
  id: string;
  donorUid: string;
  donorName: string;
  amountInr: number;
  purpose: DonationPurpose;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  status: 'completed';
  createdAt?: unknown;
}

export interface CommunityNotification {
  id: string;
  targetUid: string;
  city: string;
  title: string;
  message: string;
  type: NotificationType;
  eventId?: string;
  createdAt?: unknown;
}

export interface AppSettings {
  id: string;
  pastEventRetentionDays: number;
  autoArchivePastEvents: boolean;
  defaultCity: string;
  updatedAt?: unknown;
}

export const BLUEPRINT_LIMITS = {
  idMax: 128,
  titleMax: 140,
  descriptionMax: 3000,
  preacherMax: 120,
  organizerMax: 120,
  venueMax: 140,
  addressMax: 300,
  foodDetailsMax: 240,
  additionalInfoMax: 500,
  contactMax: 24,
  cityMax: 80,
  urlMax: 500,
  idPattern: /^[a-zA-Z0-9_-]+$/,
};
