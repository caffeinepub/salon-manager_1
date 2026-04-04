# salon360Pro

## Current State
- Subscription submit silently falls back to localStorage on backend failure — shows fake success
- Screenshot never reaches backend when backend fails
- Plan pricing save (adminSetPlanPricing) exists in backend but fails silently at runtime
- All subscription query hooks catch errors and return [] — admin sees empty list, no error shown
- Admin pending requests poll every 30 seconds, not 10
- No sound alert when new request arrives in admin panel
- adminApproveSubRequest does not record startDate/endDate in salon profile
- No permanent subscription history separate from request status
- Trial days save button shows toast but never calls backend mutation

## Requested Changes (Diff)

### Add
- Sound alert in admin panel when new pending request arrives
- Subscription start/end date fields to SalonProfile type in backend
- Permanent subscription history: separate SubscriptionHistory type with salonId, ownerPhone, planName, planDays, finalPrice, startDate, endDate, approvedAt, transactionId
- Backend functions: adminGetSubHistory (all), getMySubHistory (by owner phone)
- Stable storage for subscription history across builds
- Error state UI in admin panel when backend query fails (instead of empty list)

### Modify
- SubscriptionPage.tsx handlePaid: remove localStorage fallback entirely; on catch show clear Hindi error toast, do NOT set step to success
- useQueries.ts all subscription/plan-pricing catch blocks: throw errors instead of returning [] so React Query surfaces them via isError
- useAdminGetPendingSubRequests: change refetchInterval from 30000 to 10000
- useAdminGetAllSubRequests: change refetchInterval from 30000 to 10000
- adminApproveSubRequest in backend: calculate startDate and endDate (startDate = now, endDate = now + planDays * 86400s), store in salon profile
- SalonProfile type: add subscriptionStartDate and subscriptionEndDate fields
- SubscriptionRequestsTab in AdminPanel: add error state display; add sound alert on new pending request count increase; add new request badge
- AdminPanel SalonManageCard trial days save: wire up to actual adminSetSalonTrialDays mutation

### Remove
- localStorage fallback in handlePaid (lines 128-151 SubscriptionPage.tsx)
- Silent catch { return [] } in all subscription/plan-pricing query hooks

## Implementation Plan
1. Update backend main.mo:
   a. Add subscriptionStartDate and subscriptionEndDate to SalonProfileV3 type
   b. Add SubscriptionHistory type
   c. Add subHistoryMap stable storage
   d. Update adminApproveSubRequest to set start/end dates and push to subHistoryMap
   e. Add adminGetSubHistory and getMySubHistory query functions
   f. Update preupgrade/postupgrade for new stable vars
   g. Add migration default values for existing salons
2. Update useQueries.ts:
   a. Remove all silent catch { return [] } — let errors propagate
   b. Change both polling intervals from 30000 to 10000
   c. Add useAdminGetSubHistory and useGetMySubHistory hooks
3. Update SubscriptionPage.tsx:
   a. Remove localStorage fallback in catch block
   b. Show clear Hindi error on failure, do not advance to success step
4. Update AdminPanel.tsx:
   a. Add isError handling in SubscriptionRequestsTab — show clear error UI
   b. Add sound alert + badge when pending count increases
   c. Wire trial days save button to adminSetSalonTrialDays mutation
   d. Add subscription history tab for admin showing subHistoryMap data
5. Update SalonOwnerDashboard.tsx or SubscriptionPage to show owner's subscription history
