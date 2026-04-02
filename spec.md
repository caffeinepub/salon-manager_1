# salon360Pro — PWA + Owner Notification System

## Current State
- manifest.json: properly configured (standalone, start_url /, icons 192+512)
- sw.js: has install/activate/fetch/push handlers. notificationclick opens app but no action buttons.
- RoleSelect.tsx: install button exists, triggers beforeinstallprompt if available, else shows guide modal popup
- SalonOwnerDashboard.tsx: polls appointments for today, no notification permission request, no owner push subscription
- useBookAppointment: mutation in useQueries.ts, no notification trigger after booking

## Requested Changes (Diff)

### Add
- Service worker: polling logic — stores ownerSalonId + ownerPhone in IndexedDB; every 30s checks backend for new pending appointments; deduplication via IndexedDB set; shows notification with Confirm/Reject action buttons
- Service worker: notificationclick handler for 'confirm' and 'reject' actions — calls backend updateAppointmentStatus via fetch, then closes notification
- Service worker: message event handler — receives OWNER_LOGIN and OWNER_LOGOUT messages from app to store/clear owner context in IndexedDB
- Service worker: push event handler — already exists, improve to support action buttons
- SalonOwnerDashboard: on mount, request Notification permission; send OWNER_LOGIN postMessage to service worker with salonId and ownerPhone; on unmount send OWNER_LOGOUT
- After useBookAppointment success: send BOOKING_CREATED postMessage to service worker (for triggering immediate owner notification check)
- RoleSelect.tsx: when beforeinstallprompt fires → direct native prompt (already works). When it doesn't fire → instead of big modal, show a small non-intrusive bottom bar hint ("Chrome menu ⋮ → Add to Home Screen") that auto-dismisses in 5s. No blocking modal.
- sw.js: improve cache version to force refresh

### Modify
- sw.js: add persistent polling via IndexedDB for ownerSalonId + ownerPhone, notification action buttons (Confirm/Reject), notificationclick to handle actions
- RoleSelect.tsx: replace showGuide modal with small auto-dismiss toast/banner hint
- SalonOwnerDashboard.tsx: add notification permission setup + service worker owner context setup

### Remove
- RoleSelect.tsx: remove full-screen guide modal (AnimatePresence + showGuide state + modal JSX) — replace with smaller inline hint

## Implementation Plan
1. Update sw.js:
   - Add IndexedDB helper (openDB, getOwnerContext, setOwnerContext, getNotifiedIds, addNotifiedId)
   - Add message handler: OWNER_LOGIN saves {salonId, phone} to IDB; OWNER_LOGOUT clears it
   - Add polling: self.addEventListener('activate') starts a recursive setTimeout(30s) loop; each tick: read ownerContext from IDB, fetch `/api/v2/canister/{canisterId}/call` won't work — instead use `clients.matchAll()` to broadcast CHECK_NEW_BOOKINGS to app clients; if no clients, use stored backend URL to fetch pending appointments for salon
   - Add notificationclick: if action=='confirm', fetch backend confirmAppointment; if action=='reject', fetch backend rejectAppointment
   - Notification options: actions: [{action:'confirm',title:'✅ कन्फर्म'},{action:'reject',title:'❌ रद्द'}], requireInteraction:true, tag: appointment-{id} (deduplication via tag)
2. Update RoleSelect.tsx:
   - Remove showGuide state + AnimatePresence modal
   - When installPrompt is null and user taps button: show a small fixed bottom banner (not modal) with text "Chrome में ⋮ → Add to Home Screen" that shows for 4s then hides
3. Update SalonOwnerDashboard.tsx:
   - useEffect on mount: request Notification permission via Notification.requestPermission()
   - After salon data loads: postMessage to navigator.serviceWorker with {type:'OWNER_LOGIN', salonId: salon.id.toString(), phone}
   - Cleanup: postMessage OWNER_LOGOUT on unmount
4. Update useQueries.ts — useBookAppointment onSuccess: broadcast to service worker via postMessage {type:'CHECK_NOW'} to trigger immediate check
5. The service worker polling approach: when OWNER_LOGIN received, store in IDB and start a 30s poll loop using setTimeout + clients.matchAll to wake up the app. If no clients available (app closed), use stored actor URL from IDB to directly fetch appointments and show notification.
