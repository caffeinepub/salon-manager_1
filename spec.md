# Salon360Pro — Subscription System

## Current State
- App is a multi-tenant Hindi PWA for salon management
- Salon owners have a dashboard with tabs (Appointments, Services, Staff, Timer, Earnings)
- Admin panel has subscription management but it is fully manual (admin sets dates directly)
- No self-service subscription flow for owners exists yet
- A UPI QR code image is available at `/assets/accountqrcodeubin_-_6780_dark_theme-019d513e-82c5-728e-a000-827fcd0e447d.png`

## Requested Changes (Diff)

### Add
- Subscription button on Owner Dashboard
- Plan selection screen (30 / 90 / 120 / 365 days)
- Payment page showing selected plan + UPI QR code + screenshot upload + "I Have Paid" button
- When "I Have Paid" is clicked: save request with status=Pending, requestTime, plan details (stored in localStorage for now since no backend changes needed for v1)
- Admin Panel: "सदस्यता अनुरोध" tab showing pending requests (owner name, plan, time, screenshot preview, Approve/Reject)
- SubscriptionPage.tsx — new file for the 2-step flow
- Subscription requests stored in localStorage (key: `salon360_sub_requests`) — simple approach, no backend changes needed

### Modify
- SalonOwnerDashboard.tsx: add "सदस्यता" button in the header/top area
- AdminPanel.tsx: add new tab `subscriptions` showing all pending requests

### Remove
- Nothing removed

## Implementation Plan
1. Copy UPI QR code to `public/assets/upi-qr.png` (reference the uploaded file)
2. Create `src/frontend/src/pages/SubscriptionPage.tsx` — Step 1: plan selection, Step 2: payment with QR + upload + "I Have Paid"
3. Add subscription request storage logic using localStorage
4. Modify `SalonOwnerDashboard.tsx` — add "सदस्यता" tab or button that opens SubscriptionPage
5. Modify `AdminPanel.tsx` — add subscriptions tab reading from localStorage, with Approve (calls `adminSetSalonSubscription`) and Reject buttons
