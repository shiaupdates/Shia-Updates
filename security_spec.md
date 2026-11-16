# Shia Updates — Security Specification & Dirty Dozen Audit

## 1. Data Invariants
1. **Identity Integrity**: A `users/{userId}` document may only be created by the authenticated user (`uid == request.auth.uid`), with `role` fixed to `'member'` on self-registration. Self-escalation to `'admin'` or `'organizer'` is rejected.
2. **PII Isolation**: User email and mobile number live strictly under `users/{userId}/private/info`, readable and writable only by `isOwner(userId)` or `isAdmin()`.
3. **Single Attendance Per User Per Event**: Attendance documents use deterministic ID `{eventId}_{userId}` matching `data.eventId + '_' + request.auth.uid`, preventing duplicate RSVPs.
4. **Attendance Privacy**: Individual attendance choices are readable only by the attendee, the event's `organizerId`, or an `admin`.
5. **Atomic Counter Integrity**: Non-owner verified users may only update aggregate counters (`yesCount`, `noCount`, `maybeCount`, `totalResponses`) on `/events/{eventId}` when accompanied by an atomic write to `/attendance/{eventId}_{uid}` (`existsAfter`).
6. **Banner Approval Gate**: Users submitting business advertisements (`banners`) must set `status == 'pending'`, `type == 'sponsored'`, and `clicks == 0`. Only admins may set `status == 'active'`.
7. **Donation Privacy**: Donation records are strictly private to `donorUid` and admins. No public donor listing is permitted.
8. **Temporal Integrity**: `createdAt` equals `request.time` on creation and is immutable on update; `updatedAt` equals `request.time` on update.

## 2. Dirty Dozen Attack Payloads (Expected: PERMISSION_DENIED)
1. **Self-Role Escalation**: Non-admin user creates `/users/uid123` with `role: "admin"`.
2. **Shadow Field Injection**: User creates `/events/ev1` with extra ghost field `isFeaturedOverride: true`.
3. **Spoofed Attendance ID**: User writes `/attendance/ev1_otherUid` while signed in as `uid123`.
4. **Duplicate / Unbound Attendance Write**: User writes `/attendance/randomId123` not matching `{eventId}_{uid}`.
5. **Unauthorized Event Edit**: Non-organizer user attempts to update `title` or `status` of another organizer's event.
6. **Unverified Email Write**: Signed-in user with `email_verified: false` attempts to publish an event or submit attendance.
7. **PII Cross-Read**: User A attempts to `get` `/users/userB/private/info`.
8. **Unauthenticated Donation Read**: Unauthenticated or non-owner user attempts to `list` `/donations`.
9. **Self-Approved Business Ad**: Business submitter creates `/banners/ad1` with `status: "active"` instead of `"pending"`.
10. **Category Tampering**: Non-admin member attempts to create or deactivate `/categories/majlis`.
11. **ID Poisoning**: User attempts to create `/events/` with a 500-character ID or invalid characters (`../bad`).
12. **Timestamp Tampering**: User updates `/events/ev1` and alters `createdAt` to an arbitrary timestamp.
