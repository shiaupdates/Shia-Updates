import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  BLUEPRINT_LIMITS,
  type AppSettings,
  type AttendanceStatus,
  type CityItem,
  type CommunityEvent,
  type CommunityNotification,
  type DonationRecord,
  type EventAttendance,
  type EventCategory,
  type PromotionalBanner,
  type UserPrivateInfo,
  type UserProfile,
} from '../types';
import {
  buildStarterBanners,
  buildStarterEvents,
  INITIAL_CATEGORIES,
  INITIAL_CITIES,
} from '../data/seedData';
import { getCityCoordinates } from '../utils/formatters';

function clampStr(val: string | undefined, max: number): string {
  return (val ?? '').trim().slice(0, max);
}

export function sanitizeDocId(prefix: string): string {
  const raw = `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, BLUEPRINT_LIMITS.idMax);
}

// Subscribe to Active Categories (or all if admin)
export function subscribeCategories(
  isAdmin: boolean,
  onData: (items: EventCategory[]) => void
): Unsubscribe {
  const path = 'categories';
  const q = isAdmin
    ? query(collection(db, path))
    : query(collection(db, path), where('isActive', '==', true));

  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs
        .map((d) => d.data() as EventCategory)
        .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));
      onData(items);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, path)
  );
}

// Subscribe to Active Cities (or all if admin)
export function subscribeCities(
  isAdmin: boolean,
  onData: (items: CityItem[]) => void
): Unsubscribe {
  const path = 'cities';
  const q = isAdmin
    ? query(collection(db, path))
    : query(collection(db, path), where('isActive', '==', true));

  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs
        .map((d) => d.data() as CityItem)
        .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));
      onData(items);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, path)
  );
}

// Subscribe to Published/Completed Approved Events
export function subscribePublicEvents(onData: (items: CommunityEvent[]) => void): Unsubscribe {
  const path = 'events';
  const q = query(
    collection(db, path),
    where('status', 'in', ['published', 'completed']),
    where('moderationStatus', '==', 'approved')
  );
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs
        .map((d) => d.data() as CommunityEvent)
        .sort((a, b) => `${a.eventDate} ${a.startTime}`.localeCompare(`${b.eventDate} ${b.startTime}`));
      onData(items);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, path)
  );
}

// Subscribe to Organizer's Own Events (includes drafts, cancelled, pending)
export function subscribeOrganizerEvents(
  uid: string,
  onData: (items: CommunityEvent[]) => void
): Unsubscribe {
  const path = 'events';
  const q = query(collection(db, path), where('organizerId', '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs
        .map((d) => d.data() as CommunityEvent)
        .sort((a, b) => `${b.eventDate} ${b.startTime}`.localeCompare(`${a.eventDate} ${a.startTime}`));
      onData(items);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, path)
  );
}

// Subscribe to ALL Events (Admin only)
export function subscribeAllEventsAdmin(onData: (items: CommunityEvent[]) => void): Unsubscribe {
  const path = 'events';
  return onSnapshot(
    query(collection(db, path)),
    (snap) => {
      const items = snap.docs
        .map((d) => d.data() as CommunityEvent)
        .sort((a, b) => `${b.eventDate} ${b.startTime}`.localeCompare(`${a.eventDate} ${a.startTime}`));
      onData(items);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, path)
  );
}

// Subscribe to User's Own Attendance
export function subscribeUserAttendance(
  uid: string,
  onData: (items: Record<string, EventAttendance>) => void
): Unsubscribe {
  const path = 'attendance';
  const q = query(collection(db, path), where('userId', '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      const map: Record<string, EventAttendance> = {};
      for (const d of snap.docs) {
        const rec = d.data() as EventAttendance;
        map[rec.eventId] = rec;
      }
      onData(map);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, path)
  );
}

// Subscribe to Active Banners
export function subscribeActiveBanners(onData: (items: PromotionalBanner[]) => void): Unsubscribe {
  const path = 'banners';
  const q = query(collection(db, path), where('status', '==', 'active'));
  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => d.data() as PromotionalBanner));
    },
    (err) => handleFirestoreError(err, OperationType.LIST, path)
  );
}

// Subscribe to User's Submitted Banners
export function subscribeUserBanners(
  uid: string,
  onData: (items: PromotionalBanner[]) => void
): Unsubscribe {
  const path = 'banners';
  const q = query(collection(db, path), where('submittedByUid', '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => d.data() as PromotionalBanner));
    },
    (err) => handleFirestoreError(err, OperationType.LIST, path)
  );
}

// Subscribe to ALL Banners (Admin only)
export function subscribeAllBannersAdmin(onData: (items: PromotionalBanner[]) => void): Unsubscribe {
  const path = 'banners';
  return onSnapshot(
    query(collection(db, path)),
    (snap) => onData(snap.docs.map((d) => d.data() as PromotionalBanner)),
    (err) => handleFirestoreError(err, OperationType.LIST, path)
  );
}

// Subscribe to User Notifications
export function subscribeNotifications(
  uid: string,
  onData: (items: CommunityNotification[]) => void
): Unsubscribe {
  const path = 'notifications';
  const q = query(collection(db, path), where('targetUid', 'in', ['all', uid]));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => d.data() as CommunityNotification);
      onData(items.reverse());
    },
    (err) => handleFirestoreError(err, OperationType.LIST, path)
  );
}

// Subscribe to User Notification Read Receipts
export function subscribeReadNotifications(
  uid: string,
  onData: (readIds: Set<string>) => void
): Unsubscribe {
  const path = `users/${uid}/readNotifications`;
  return onSnapshot(
    collection(db, path),
    (snap) => {
      onData(new Set(snap.docs.map((d) => d.id)));
    },
    (err) => handleFirestoreError(err, OperationType.LIST, path)
  );
}

// Subscribe to User Donations
export function subscribeUserDonations(
  uid: string,
  onData: (items: DonationRecord[]) => void
): Unsubscribe {
  const path = 'donations';
  const q = query(collection(db, path), where('donorUid', '==', uid));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => d.data() as DonationRecord)),
    (err) => handleFirestoreError(err, OperationType.LIST, path)
  );
}

// Subscribe to ALL Donations (Admin only)
export function subscribeAllDonationsAdmin(onData: (items: DonationRecord[]) => void): Unsubscribe {
  const path = 'donations';
  return onSnapshot(
    query(collection(db, path)),
    (snap) => onData(snap.docs.map((d) => d.data() as DonationRecord)),
    (err) => handleFirestoreError(err, OperationType.LIST, path)
  );
}

// Subscribe to ALL Users (Admin only)
export function subscribeAllUsersAdmin(onData: (items: UserProfile[]) => void): Unsubscribe {
  const path = 'users';
  return onSnapshot(
    query(collection(db, path)),
    (snap) => onData(snap.docs.map((d) => d.data() as UserProfile)),
    (err) => handleFirestoreError(err, OperationType.LIST, path)
  );
}

// Subscribe to Global App Settings
export function subscribeAppSettings(onData: (settings: AppSettings | null) => void): Unsubscribe {
  const path = 'appSettings/global';
  return onSnapshot(
    doc(db, 'appSettings', 'global'),
    (snap) => {
      onData(snap.exists() ? (snap.data() as AppSettings) : null);
    },
    (err) => handleFirestoreError(err, OperationType.GET, path)
  );
}

// Check if current user is an Admin
export async function checkIsAdmin(uid: string, email: string | null | undefined): Promise<boolean> {
  if (email === 'shiaupdatesapp@gmail.com') return true;
  const path = `admins/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'admins', uid));
    return snap.exists();
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

// Load or initialize User Profile + Private Info
export async function fetchUserProfileAndPrivate(
  uid: string
): Promise<{ profile: UserProfile | null; privateInfo: UserPrivateInfo | null }> {
  try {
    const profileSnap = await getDoc(doc(db, 'users', uid));
    const privateSnap = await getDoc(doc(db, 'users', uid, 'private', 'info'));
    return {
      profile: profileSnap.exists() ? (profileSnap.data() as UserProfile) : null,
      privateInfo: privateSnap.exists() ? (privateSnap.data() as UserPrivateInfo) : null,
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${uid}`);
  }
}

export async function createOrUpdateUserProfile(
  uid: string,
  profileInput: Omit<UserProfile, 'uid' | 'role' | 'isActive' | 'createdAt' | 'updatedAt'>,
  privateInput: Omit<UserPrivateInfo, 'uid' | 'updatedAt'>,
  isNewProfile: boolean
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  const privateRef = doc(db, 'users', uid, 'private', 'info');

  try {
    if (isNewProfile) {
      const batch = writeBatch(db);
      batch.set(userRef, {
        uid,
        displayName: clampStr(profileInput.displayName, 100) || 'Community Member',
        ...(profileInput.photoUrl ? { photoUrl: clampStr(profileInput.photoUrl, 500) } : {}),
        city: clampStr(profileInput.city, 80) || 'Mumbai',
        preferredLanguage: profileInput.preferredLanguage,
        gender: profileInput.gender,
        preferredAudience: profileInput.preferredAudience,
        role: 'member',
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      batch.set(privateRef, {
        uid,
        email: clampStr(privateInput.email, 160),
        ...(privateInput.mobileNumber ? { mobileNumber: clampStr(privateInput.mobileNumber, 24) } : {}),
        notificationsEnabled: privateInput.notificationsEnabled,
        cityAlerts: privateInput.cityAlerts,
        eventReminders: privateInput.eventReminders,
        privacyShowProfileToOrganizers: privateInput.privacyShowProfileToOrganizers,
        updatedAt: serverTimestamp(),
      });
      await batch.commit();
    } else {
      await updateDoc(userRef, {
        displayName: clampStr(profileInput.displayName, 100) || 'Community Member',
        ...(profileInput.photoUrl ? { photoUrl: clampStr(profileInput.photoUrl, 500) } : {}),
        city: clampStr(profileInput.city, 80) || 'Mumbai',
        preferredLanguage: profileInput.preferredLanguage,
        gender: profileInput.gender,
        preferredAudience: profileInput.preferredAudience,
        updatedAt: serverTimestamp(),
      });
      const privSnap = await getDoc(privateRef);
      if (privSnap.exists()) {
        await updateDoc(privateRef, {
          email: clampStr(privateInput.email, 160),
          ...(privateInput.mobileNumber ? { mobileNumber: clampStr(privateInput.mobileNumber, 24) } : {}),
          notificationsEnabled: privateInput.notificationsEnabled,
          cityAlerts: privateInput.cityAlerts,
          eventReminders: privateInput.eventReminders,
          privacyShowProfileToOrganizers: privateInput.privacyShowProfileToOrganizers,
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(privateRef, {
          uid,
          email: clampStr(privateInput.email, 160),
          ...(privateInput.mobileNumber ? { mobileNumber: clampStr(privateInput.mobileNumber, 24) } : {}),
          notificationsEnabled: privateInput.notificationsEnabled,
          cityAlerts: privateInput.cityAlerts,
          eventReminders: privateInput.eventReminders,
          privacyShowProfileToOrganizers: privateInput.privacyShowProfileToOrganizers,
          updatedAt: serverTimestamp(),
        });
      }
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
  }
}

// Atomic Attendance Submission (Prevents duplicate RSVPs + keeps counts real-time)
export async function submitEventAttendance(
  eventId: string,
  userId: string,
  newStatus: AttendanceStatus
): Promise<void> {
  const attendanceId = `${eventId}_${userId}`;
  const eventRef = doc(db, 'events', eventId);
  const attendanceRef = doc(db, 'attendance', attendanceId);

  try {
    await runTransaction(db, async (tx) => {
      const eventSnap = await tx.get(eventRef);
      if (!eventSnap.exists()) {
        throw new Error('Event does not exist.');
      }
      const ev = eventSnap.data() as CommunityEvent;
      const attSnap = await tx.get(attendanceRef);

      let yes = ev.yesCount ?? 0;
      let no = ev.noCount ?? 0;
      let maybe = ev.maybeCount ?? 0;

      if (attSnap.exists()) {
        const prev = (attSnap.data() as EventAttendance).status;
        if (prev === newStatus) return; // Idempotent no-op
        if (prev === 'yes') yes = Math.max(0, yes - 1);
        if (prev === 'no') no = Math.max(0, no - 1);
        if (prev === 'maybe') maybe = Math.max(0, maybe - 1);

        if (newStatus === 'yes') yes += 1;
        if (newStatus === 'no') no += 1;
        if (newStatus === 'maybe') maybe += 1;

        tx.update(attendanceRef, {
          status: newStatus,
          updatedAt: serverTimestamp(),
        });
      } else {
        if (newStatus === 'yes') yes += 1;
        if (newStatus === 'no') no += 1;
        if (newStatus === 'maybe') maybe += 1;

        tx.set(attendanceRef, {
          id: attendanceId,
          eventId,
          userId,
          organizerId: ev.organizerId,
          status: newStatus,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      tx.update(eventRef, {
        yesCount: yes,
        noCount: no,
        maybeCount: maybe,
        totalResponses: yes + no + maybe,
        updatedAt: serverTimestamp(),
      });
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `attendance/${attendanceId}`);
  }
}

// Create or Update Event
export async function saveCommunityEvent(
  eventInput: Omit<
    CommunityEvent,
    'yesCount' | 'noCount' | 'maybeCount' | 'totalResponses' | 'moderationStatus' | 'createdAt' | 'updatedAt'
  >,
  isNew: boolean
): Promise<string> {
  const id = isNew ? sanitizeDocId('ev') : eventInput.id;
  const ref = doc(db, 'events', id);
  const fallbackCoords = getCityCoordinates(eventInput.city);
  const resolvedLat =
    typeof eventInput.latitude === 'number' &&
    Number.isFinite(eventInput.latitude) &&
    eventInput.latitude >= -90 &&
    eventInput.latitude <= 90
      ? Number(eventInput.latitude.toFixed(6))
      : fallbackCoords?.lat;
  const resolvedLng =
    typeof eventInput.longitude === 'number' &&
    Number.isFinite(eventInput.longitude) &&
    eventInput.longitude >= -180 &&
    eventInput.longitude <= 180
      ? Number(eventInput.longitude.toFixed(6))
      : fallbackCoords?.lng;

  const payload = {
    id,
    title: clampStr(eventInput.title, BLUEPRINT_LIMITS.titleMax),
    categoryId: eventInput.categoryId,
    categoryName: clampStr(eventInput.categoryName, 60),
    description: clampStr(eventInput.description, BLUEPRINT_LIMITS.descriptionMax),
    ...(eventInput.posterUrl ? { posterUrl: clampStr(eventInput.posterUrl, BLUEPRINT_LIMITS.urlMax) } : {}),
    audienceType: eventInput.audienceType,
    eventDate: eventInput.eventDate,
    ...(eventInput.endDate ? { endDate: eventInput.endDate } : {}),
    startTime: eventInput.startTime,
    endTime: eventInput.endTime,
    ...(eventInput.preacherName ? { preacherName: clampStr(eventInput.preacherName, BLUEPRINT_LIMITS.preacherMax) } : {}),
    organizerId: eventInput.organizerId,
    organizerName: clampStr(eventInput.organizerName, BLUEPRINT_LIMITS.organizerMax),
    contactNumber: clampStr(eventInput.contactNumber, BLUEPRINT_LIMITS.contactMax),
    city: clampStr(eventInput.city, BLUEPRINT_LIMITS.cityMax),
    venueName: clampStr(eventInput.venueName, BLUEPRINT_LIMITS.venueMax),
    address: clampStr(eventInput.address, BLUEPRINT_LIMITS.addressMax),
    ...(eventInput.mapQuery ? { mapQuery: clampStr(eventInput.mapQuery, BLUEPRINT_LIMITS.addressMax) } : {}),
    ...(resolvedLat !== undefined ? { latitude: resolvedLat } : {}),
    ...(resolvedLng !== undefined ? { longitude: resolvedLng } : {}),
    foodAvailable: Boolean(eventInput.foodAvailable),
    ...(eventInput.foodDetails ? { foodDetails: clampStr(eventInput.foodDetails, BLUEPRINT_LIMITS.foodDetailsMax) } : {}),
    ...(eventInput.additionalInfo ? { additionalInfo: clampStr(eventInput.additionalInfo, BLUEPRINT_LIMITS.additionalInfoMax) } : {}),
    status: eventInput.status,
  };

  try {
    if (isNew) {
      await setDoc(ref, {
        ...payload,
        moderationStatus: 'approved',
        yesCount: 0,
        noCount: 0,
        maybeCount: 0,
        totalResponses: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      if (eventInput.status === 'published') {
        await publishCityNotification({
          targetUid: 'all',
          city: payload.city,
          title: `New Event in ${payload.city}: ${payload.title}`,
          message: `${payload.categoryName} on ${payload.eventDate} at ${payload.venueName}. Confirm your attendance.`,
          type: 'new_event',
          eventId: id,
        });
      }
    } else {
      await updateDoc(ref, {
        ...payload,
        updatedAt: serverTimestamp(),
      });
      if (eventInput.status === 'cancelled') {
        await publishCityNotification({
          targetUid: 'all',
          city: payload.city,
          title: `Event Cancelled: ${payload.title}`,
          message: `The gathering scheduled for ${payload.eventDate} at ${payload.venueName} has been cancelled.`,
          type: 'cancellation',
          eventId: id,
        });
      }
    }
    return id;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `events/${id}`);
  }
}

export async function publishCityNotification(input: {
  targetUid: string;
  city: string;
  title: string;
  message: string;
  type: CommunityNotification['type'];
  eventId?: string;
}): Promise<void> {
  const id = sanitizeDocId('notif');
  try {
    await setDoc(doc(db, 'notifications', id), {
      id,
      targetUid: input.targetUid,
      city: clampStr(input.city, 80) || 'Mumbai',
      title: clampStr(input.title, 140),
      message: clampStr(input.message, 400),
      type: input.type,
      ...(input.eventId ? { eventId: input.eventId } : {}),
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `notifications/${id}`);
  }
}

export async function markNotificationRead(uid: string, notificationId: string): Promise<void> {
  const path = `users/${uid}/readNotifications/${notificationId}`;
  try {
    await setDoc(doc(db, 'users', uid, 'readNotifications', notificationId), {
      notificationId,
      readAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

// Submit Business Advertisement Request
export async function submitBusinessAdRequest(
  input: Omit<PromotionalBanner, 'id' | 'status' | 'clicks' | 'createdAt' | 'updatedAt'>,
  isAdminImmediate = false
): Promise<string> {
  const id = sanitizeDocId('ad');
  try {
    await setDoc(doc(db, 'banners', id), {
      id,
      title: clampStr(input.title, 120),
      ...(input.subtitle ? { subtitle: clampStr(input.subtitle, 220) } : {}),
      type: input.type,
      ...(input.businessName ? { businessName: clampStr(input.businessName, 120) } : {}),
      ...(input.businessCategory ? { businessCategory: clampStr(input.businessCategory, 80) } : {}),
      ...(input.contactDetails ? { contactDetails: clampStr(input.contactDetails, 160) } : {}),
      imageUrl: clampStr(input.imageUrl, 500),
      ...(input.linkUrl ? { linkUrl: clampStr(input.linkUrl, 400) } : {}),
      city: clampStr(input.city, 80),
      startDate: input.startDate,
      endDate: input.endDate,
      ...(input.durationDays ? { durationDays: input.durationDays } : {}),
      placement: input.placement,
      status: isAdminImmediate ? 'active' : 'pending',
      submittedByUid: input.submittedByUid,
      clicks: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `banners/${id}`);
  }
}

export async function recordBannerClick(banner: PromotionalBanner): Promise<void> {
  try {
    await updateDoc(doc(db, 'banners', banner.id), {
      clicks: (banner.clicks ?? 0) + 1,
      updatedAt: serverTimestamp(),
    });
  } catch {
    // Non-blocking for anonymous/unverified visitors
  }
}

// Submit Private Donation Record
export async function submitDonation(
  input: Omit<DonationRecord, 'id' | 'referenceNumber' | 'status' | 'createdAt'>
): Promise<DonationRecord> {
  const id = sanitizeDocId('don');
  const referenceNumber = `SHU-${Date.now().toString(36).toUpperCase()}`;
  const record: DonationRecord = {
    id,
    donorUid: input.donorUid,
    donorName: clampStr(input.donorName, 100),
    amountInr: Math.max(10, Math.round(input.amountInr)),
    purpose: input.purpose,
    paymentMethod: input.paymentMethod,
    referenceNumber,
    status: 'completed',
  };
  try {
    await setDoc(doc(db, 'donations', id), {
      ...record,
      createdAt: serverTimestamp(),
    });
    return record;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `donations/${id}`);
  }
}

// Admin Operations
export async function adminSaveCategory(cat: Omit<EventCategory, 'createdAt' | 'updatedAt'>, isNew: boolean): Promise<void> {
  const id = isNew ? sanitizeDocId('cat') : cat.id;
  try {
    if (isNew) {
      await setDoc(doc(db, 'categories', id), {
        ...cat,
        id,
        name: clampStr(cat.name, 60),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(doc(db, 'categories', id), {
        name: clampStr(cat.name, 60),
        ...(cat.nameHi ? { nameHi: clampStr(cat.nameHi, 60) } : {}),
        ...(cat.nameUr ? { nameUr: clampStr(cat.nameUr, 60) } : {}),
        iconName: cat.iconName,
        colorHex: cat.colorHex,
        isActive: cat.isActive,
        sortOrder: cat.sortOrder,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `categories/${id}`);
  }
}

export async function adminSaveCity(city: Omit<CityItem, 'createdAt'>, isNew: boolean): Promise<void> {
  const id = isNew ? sanitizeDocId('city') : city.id;
  try {
    if (isNew) {
      await setDoc(doc(db, 'cities', id), {
        ...city,
        id,
        name: clampStr(city.name, 80),
        state: clampStr(city.state, 80),
        country: clampStr(city.country, 80),
        createdAt: serverTimestamp(),
      });
    } else {
      await updateDoc(doc(db, 'cities', id), {
        name: clampStr(city.name, 80),
        state: clampStr(city.state, 80),
        country: clampStr(city.country, 80),
        isActive: city.isActive,
        sortOrder: city.sortOrder,
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `cities/${id}`);
  }
}

export async function adminUpdateBanner(
  bannerId: string,
  updates: Partial<Pick<PromotionalBanner, 'status' | 'startDate' | 'endDate' | 'placement'>>
): Promise<void> {
  try {
    await updateDoc(doc(db, 'banners', bannerId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `banners/${bannerId}`);
  }
}

export async function adminDeleteBanner(bannerId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'banners', bannerId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `banners/${bannerId}`);
  }
}

export async function adminUpdateEventModeration(
  eventId: string,
  updates: Partial<Pick<CommunityEvent, 'status' | 'moderationStatus'>>
): Promise<void> {
  try {
    await updateDoc(doc(db, 'events', eventId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `events/${eventId}`);
  }
}

export async function adminDeleteEvent(eventId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'events', eventId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `events/${eventId}`);
  }
}

export async function adminUpdateUserRole(
  userId: string,
  role: UserProfile['role'],
  isActive: boolean
): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', userId), {
      role,
      isActive,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
  }
}

export async function adminSaveAppSettings(settings: Omit<AppSettings, 'updatedAt'>): Promise<void> {
  try {
    await setDoc(doc(db, 'appSettings', settings.id), {
      ...settings,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `appSettings/${settings.id}`);
  }
}

// Idempotent Initial Seed + Default Category Sync for Newly & Previously Provisioned Databases
export async function seedInitialFirestoreData(adminUid: string): Promise<void> {
  try {
    const catsSnap = await getDocs(collection(db, 'categories'));
    if (!catsSnap.empty) {
      const existingCats = new Map(catsSnap.docs.map((d) => [d.id, d.data() as EventCategory]));
      const syncBatch = writeBatch(db);
      let hasChanges = false;

      const shabCat = existingCats.get('cat_shab_e_dari');
      if (shabCat && shabCat.name === 'Shab-e-Dari') {
        syncBatch.update(doc(db, 'categories', 'cat_shab_e_dari'), {
          name: 'Shabbedari',
          nameHi: 'शब्बेदारी',
          nameUr: 'شبداری',
          updatedAt: serverTimestamp(),
        });
        hasChanges = true;
      }

      for (const cat of INITIAL_CATEGORIES) {
        if (!existingCats.has(cat.id)) {
          syncBatch.set(doc(db, 'categories', cat.id), {
            ...cat,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          hasChanges = true;
        }
      }

      if (hasChanges) {
        await syncBatch.commit();
      }
      return;
    }

    const batch = writeBatch(db);

    for (const city of INITIAL_CITIES) {
      batch.set(doc(db, 'cities', city.id), {
        ...city,
        createdAt: serverTimestamp(),
      });
    }

    for (const cat of INITIAL_CATEGORIES) {
      batch.set(doc(db, 'categories', cat.id), {
        ...cat,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    for (const banner of buildStarterBanners(adminUid)) {
      batch.set(doc(db, 'banners', banner.id), {
        ...banner,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    for (const ev of buildStarterEvents(adminUid)) {
      batch.set(doc(db, 'events', ev.id), {
        ...ev,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    batch.set(doc(db, 'appSettings', 'global'), {
      id: 'global',
      pastEventRetentionDays: 30,
      autoArchivePastEvents: true,
      defaultCity: 'Mumbai',
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'seed_initial_data');
  }
}
