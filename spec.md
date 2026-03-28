# Salon Manager

## Current State
Version 30 is live. App has Admin Panel (tabs: dashboard, pending, salons, settings, revenue, reviews), Salon Owner Dashboard, Customer Dashboard. Permanent storage works (v24+). Mobile number login is direct (no OTP). Session persists 30 days. No auto-logout on inactivity. No backup/restore feature.

## Requested Changes (Diff)

### Add
- Backend: `adminGetAllSalonsForBackup`, `adminGetAllServicesForBackup`, `adminGetAllAppointmentsForBackup`, `adminGetAllCustomersForBackup`, `adminGetOwnerPhoneMapForBackup`, `adminGetNextIdsForBackup` — query functions for full data export
- Backend: `adminRestoreAllData(salons, services, appointments, customers, ownerPhoneMap, nextSalonId, nextServiceId, nextAppointmentId)` — clears all data maps and refills from provided arrays
- Frontend: "Backup" tab in Admin Panel with "Backup Data" button (downloads JSON file) and "Restore Data" button (uploads JSON, calls restore function)
- Frontend: Auto-logout after 30 minutes of inactivity — tracks last activity via mousemove/keydown/click/touchstart, checks every 60 seconds, logs out both admin and user sessions

### Modify
- main.tsx: Add QueryClient defaultOptions (staleTime: 2min, retry: 1, refetchOnWindowFocus: false) and add `<Toaster />` component
- App.tsx: Add inactivity timer logic, auto-logout after 30 min with warning toast

### Remove
- Nothing removed

## Implementation Plan
1. Add 6 query + 1 mutation function to main.mo for backup/restore
2. Update backend.d.ts with new function signatures
3. Add useAdminGetBackupData hook in useQueries.ts (calls all backup queries in parallel)
4. Add BackupTab component in AdminPanel.tsx with download + upload/restore UI
5. Add "backup" tab to tab list in AdminPanel
6. Add 30-min inactivity auto-logout in App.tsx using event listeners + setInterval
7. Fix main.tsx: QueryClient config + Toaster
