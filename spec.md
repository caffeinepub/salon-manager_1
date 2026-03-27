# Salon Manager — Core SaaS System (Phase 1)

## Current State
The app has a backend with salon registration (auto-approved), trial system, subscriptions, admin email+password login, and a frontend with Admin Panel, Salon Owner Dashboard, Customer Dashboard.

## Requested Changes (Diff)

### Add
- Shop registration requires admin approval before becoming active
- Hard limit: maximum 100 shops total (reject registration if limit reached)
- Admin can approve or reject pending shop registrations
- Admin dashboard shows: total shops, active shops, expired/inactive shops, pending approvals
- `pendingApproval` field on shop profile

### Modify
- `registerSalon`: shops created with `isActive=false`, `pendingApproval=true` — not visible to customers until approved
- Trial starts only after admin approves the shop
- Admin dashboard rebuilt to show 4 key stats: total, active, expired, pending
- Salon owner dashboard shows approval status message if shop is pending

### Remove
- Old complex state that is not needed for this phase

## Implementation Plan
1. Update backend: add `pendingApproval: Bool` to `SalonProfile`, add shop count limit check (100), change `registerSalon` to set `isActive=false, pendingApproval=true`, trial starts on approval
2. Add backend methods: `adminApproveSalon(id)`, `adminRejectSalon(id)`, `adminGetPendingSalons()`, `adminGetDashboardStats()` returning counts
3. Update frontend AdminPanel: show pending approvals list with approve/reject buttons, show 4 stat cards
4. Update SalonOwnerDashboard: show pending message if shop not yet approved
5. Keep email+password admin login (`amitkrji498@gmail.com`) as-is
6. Hindi language throughout
