# salon360Pro

## Current State

The app is a multi-tenant Hindi PWA for salon management with:
- Backend: Motoko on ICP with full admin/owner/customer functions
- Frontend: React + TypeScript with hooks in `useQueries.ts`
- Admin panel, owner dashboard, customer booking, subscription system all exist

**Critical Bug:** In `useQueries.ts`, ALL admin query/mutation hooks call backend functions WITHOUT passing `email` and `passwordHash`. The backend requires these for every admin function. Result: admin panel shows zero salons, zero stats, zero pending approvals.

~15 admin hooks are broken this way:
- `useAdminGetAllSalons`, `useAdminGetPendingSalons`, `useAdminGetDashboardStats`
- `useAdminSetSubscriptionPrice`, `useAdminGetSubscriptionPrice`
- `useAdminApproveSalon`, `useAdminRejectSalon`
- `useAdminSetSalonSubscription`, `useAdminSetSalonActive`
- `useAdminGetDefaultTrialDays`, `useAdminSetDefaultTrialDays`
- `useAdminProcessTrialExpirations`, `useAdminGetRevenueStats`
- Backup hooks, subscription request hooks

The admin hash is stored in `localStorage.getItem("salon360_admin_hash")` and `ADMIN_EMAIL = "amitkrji498@gmail.com"`.

**Missing Feature:** No photo upload system exists anywhere (backend, frontend, or hooks).

## Requested Changes (Diff)

### Add
- Backend: Photo upload system for salon owners
  - `SalonPhoto` type: `{ id, salonId, url, uploadedAt }`
  - `uploadSalonPhoto(ownerPhone, passwordHash, photoBase64, mimeType)` — saves base64 photo, max 10 per salon
  - `getSalonPhotos(salonId)` — public, returns all photos for a salon
  - `deleteSalonPhoto(ownerPhone, passwordHash, photoId)` — owner can delete their photo
- Frontend: Photo gallery in owner dashboard (upload 1-10 photos)
- Frontend: Photo gallery in customer salon details view (swipe/scroll gallery)

### Modify
- `useQueries.ts`: Fix ALL admin hooks to pass `ADMIN_EMAIL` and `getAdminHash()` as first two arguments to every admin backend call
  - The helper functions `ADMIN_EMAIL` and `getAdminHash()` already exist in the file
  - Every `(actor as any).adminXxx()` call must become `actor.adminXxx(ADMIN_EMAIL, getAdminHash(), ...rest)`

### Remove
- Nothing to remove

## Implementation Plan

1. **Backend:** Add photo storage to `main.mo`
   - Add `SalonPhoto` record type and `photosMap: HashMap<Text, [SalonPhoto]>`
   - Add `uploadSalonPhoto`, `getSalonPhotos`, `deleteSalonPhoto` functions
   - Persist photos in `preupgrade`/`postupgrade`

2. **Frontend `useQueries.ts`:** Fix all broken admin hooks
   - Add `ADMIN_EMAIL` constant and `getAdminHash()` helper (already exist, ensure they are used)
   - Update every admin hook to pass these as first two arguments

3. **Frontend Owner Dashboard:** Add photo management tab
   - File input (accept images, max 10)
   - Convert to base64 and call `uploadSalonPhoto`
   - Display uploaded photos with delete option

4. **Frontend Customer View:** Add photo gallery
   - When customer opens salon details, call `getSalonPhotos(salonId)`
   - Display scrollable/swipeable photo gallery
