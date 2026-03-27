# Salon Manager

## Current State
- Subscription price is hardcoded as `platformSubscriptionPrice : Float = 149.0` in backend but has no public getter/setter methods
- Admin panel Settings tab has no price editing UI
- PWA manifest.json is missing `purpose` on icons, missing `id` and `scope` fields
- No service worker exists — Android Chrome requires a registered SW to show Add to Home Screen prompt

## Requested Changes (Diff)

### Add
- Backend: `adminGetSubscriptionPrice()` query and `adminSetSubscriptionPrice(price)` update methods
- Frontend hooks: `useAdminGetSubscriptionPrice`, `useAdminSetSubscriptionPrice`
- AdminPanel Settings tab: subscription price card (show current price, input + save button)
- `src/frontend/public/sw.js`: minimal service worker for PWA installability
- SalonOwnerDashboard: show current subscription price when trial expired

### Modify
- `backend.did.js` and `backend.did.d.ts`: add two new subscription price methods
- `manifest.json`: add `id`, `scope`, fix icon `purpose` to `"any maskable"`
- `index.html`: register service worker on load

### Remove
- Nothing removed

## Implementation Plan
1. Add `adminGetSubscriptionPrice` and `adminSetSubscriptionPrice` to main.mo
2. Update backend.did.js and backend.did.d.ts declarations
3. Add two hooks to useQueries.ts
4. Add price editing card to AdminPanel Settings tab
5. Show price in SalonOwnerDashboard when expired
6. Fix manifest.json for Android PWA
7. Create sw.js service worker
8. Register SW in index.html
