# Salon360Pro — Enhanced Payment System

## Current State
- SubscriptionPage.tsx: 4 plans (30/90/120/365 days), plan selection, UPI QR code (upi-qr.png), screenshot upload, "मैंने भुगतान कर दिया" button
- Requests saved to localStorage only — NOT in backend
- AdminPanel has SubscriptionRequestsTab reading from localStorage — not connected to backend
- No pricing info shown on plans
- No timer system
- No automatic subscription activation on admin approval
- No notification to admin on payment submission

## Requested Changes (Diff)

### Add
- Backend: SubRequest type with fields: id, ownerPhone, salonName, planName, planDays, originalPrice, discountPercent, finalPrice, savings, requestTime, screenshotBase64, status (pending/approved/rejected/expired), approvedAt
- Backend: PlanPricing type with originalPrice and discountPercent per plan
- Backend functions: submitSubscriptionRequest, adminGetSubscriptionRequests, adminApproveSubscriptionRequest, adminRejectSubscriptionRequest, getMySubscriptionRequests, adminGetPlanPricings, adminSetPlanPricing
- SubscriptionPage: Show originalPrice (strike-through), discountPercent badge, finalPrice, savings for each plan
- SubscriptionPage: 2-hour expiry timer shown after submission ("सत्यापन लंबित — X घंटे X मिनट बचे")
- SubscriptionPage: Replace old upi-qr.png with new uploaded QR image
- AdminPanel sub_requests tab: Load from backend instead of localStorage
- AdminPanel sub_requests tab: Show screenshot, plan details, original/discount/final price, timer remaining, Approve/Reject buttons
- AdminPanel sub_requests tab: On Approve → call adminApproveSubscriptionRequest → auto-activates salon subscription with start+end dates
- AdminPanel settings: Plan pricing editor — admin can set originalPrice and discountPercent per plan, final price auto-calculated
- Salon owner dashboard: Show subscription expiry banner with days remaining
- History tab for admin showing all requests (pending/approved/rejected/expired)

### Modify
- SubscriptionPage: Save request to backend instead of localStorage
- SubscriptionPage: QR code image path updated to new Union Bank QR
- AdminPanel: sub_requests tab reads from backend, not localStorage
- useQueries.ts: Add new subscription-related hooks

### Remove
- localStorage-based subscription request storage (replace with backend)

## Implementation Plan
1. Update main.mo: Add SubRequest and PlanPricing types, stable storage, CRUD functions for subscription requests and plan pricing
2. Copy uploaded QR image as new upi-qr.png
3. Update useQueries.ts: Add hooks for new backend functions
4. Rewrite SubscriptionPage.tsx: Pricing display, new QR, backend save, 2-hour pending timer
5. Update AdminPanel.tsx: sub_requests tab uses backend, plan pricing editor in settings, history view
6. Update SalonOwnerDashboard.tsx: Show subscription expiry/status banner
7. Validate and deploy
