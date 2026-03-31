# Salon360

## Current State
- Admin Panel has full salon management (approve/reject, activate/deactivate, subscription, trial, revenue, backup)
- Salon Owner login uses mobile number + password (hashed via SHA-256)
- No password reset mechanism exists — owners who forget password are locked out
- Owner login page has no "forgot password" contact info

## Requested Changes (Diff)

### Add
- `adminResetOwnerPassword(ownerPhone, newPasswordHash)` backend function — admin sets a new hashed password for any owner by phone number
- `useAdminResetOwnerPassword` mutation hook in useQueries.ts
- "पासवर्ड Reset करें" button in each SalonManageCard (expanded section) in AdminPanel
  - Input field for new password (min 6 chars)
  - On save: hash password client-side, call backend, show success/error toast
  - Old password is immediately invalidated (overwritten)
- Contact text on Owner login screen below password field:
  "Password bhul gaye? Admin se sampark kare: 6206761169"
  — visible, professional style, not a button

### Modify
- `declarations/backend.did.js` — add IDL for `adminResetOwnerPassword`
- `declarations/backend.did.d.ts` — add ActorMethod type
- `backend.ts` — add to backendInterface and Backend class
- `backend.d.ts` — add to interface
- `AdminPanel.tsx` — add reset password UI in SalonManageCard expanded section
- `SalonOwnerAuthPage.tsx` — add forgot password contact text in login mode

### Remove
- Nothing removed

## Implementation Plan
1. Add `adminResetOwnerPassword` to main.mo — overwrites ownerPasswordMap entry for the phone
2. Add IDL declaration to backend.did.js (both idlService and idlFactory)
3. Add ActorMethod type to backend.did.d.ts
4. Add method to backendInterface and Backend class in backend.ts
5. Add to interface in backend.d.ts
6. Add `useAdminResetOwnerPassword` mutation hook in useQueries.ts
7. In AdminPanel SalonManageCard expanded section: add new password input + save button
8. In SalonOwnerAuthPage login mode: add contact text below password field
