# Salon Manager

## Current State
Admin panel works instantly because it checks session from storage and renders UI immediately — backend data loads per-tab in background. Salon Owner and Customer dashboards block the entire screen behind a loading spinner until `useGetMySalon` or `useGetMyCustomerProfile` resolves. This means if ICP is cold-starting, users see a spinner or 'Data load failed' before they even see the UI. Additionally, `useActor.ts` still has both `invalidateQueries` and `refetchQueries` causing a thundering herd on every actor load.

## Requested Changes (Diff)

### Add
- Salon Owner dashboard shows immediately (skeleton UI) — salon data loads in background, no full-screen block
- Customer dashboard shows immediately (skeleton UI) — profile and salon list load in background

### Modify
- `SalonOwnerDashboard.tsx`: Remove full-screen loading gate. Show dashboard shell immediately. Show skeleton/loading states inside components while data loads. Only show register form after data is definitively confirmed missing (not during loading).
- `CustomerDashboard.tsx`: Remove full-screen loading gate tied to profile. Show UI immediately, load profile and salon list in background with inline loading states.
- `useActor.ts`: Remove `refetchQueries` call — only keep `invalidateQueries`.
- `useGetMySalon` in `useQueries.ts`: Set `staleTime: 2 * 60 * 1000` so cached data is used within 2 minutes.

### Remove
- Full-screen `SalonLoadingScreen` blocks in SalonOwnerDashboard and CustomerDashboard that prevent the UI from rendering

## Implementation Plan
1. Fix `useActor.ts` — remove `refetchQueries`, keep only `invalidateQueries`
2. Fix `useGetMySalon` staleTime to 2 minutes
3. Refactor `SalonOwnerDashboard` — render dashboard shell immediately, show skeleton inside while `salonLoading`, only show register form when `salonFetched && !salon`
4. Refactor `CustomerDashboard` — render main UI shell immediately, show inline skeletons for salon list and profile while loading
5. Validate build
