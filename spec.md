# Salon Manager

## Current State
- CustomerDashboard.tsx has appointment list with status (pending, confirmed, inprogress, completed, cancelled)
- AppointmentCard component shows appointment details and status
- AdminPanel.tsx manages salons, approvals, subscriptions
- SalonListTab in CustomerDashboard shows active salons
- No rating/review system exists anywhere

## Requested Changes (Diff)

### Add
- RatingPopup component: modal that appears when appointment status is "completed" and user hasn't rated yet. Shows 1-5 star selector + short text review input. Ratings stored in localStorage keyed by appointmentId.
- Star rating display on SalonCard/salon list: show average rating, total review count, and "Top Rated" badge (gold) if average >= 4.5
- Admin Panel: new "समीक्षाएं" (Reviews) tab showing all reviews with delete button per review

### Modify
- AppointmentCard: if appointment is completed and not yet rated, show "रेटिंग दें" button that opens RatingPopup
- SalonListTab / salon cards: show star rating + badge
- AdminPanel: add Reviews tab

### Remove
- Nothing removed

## Implementation Plan
1. Create localStorage-based ratings store (key: `salon_ratings`, value: array of {appointmentId, salonId, salonName, customerPhone, stars, review, date})
2. Build RatingPopup component (Dialog with 5 star buttons + textarea + submit)
3. Add "रेटिंग दें" button in AppointmentCard for completed+unrated appointments
4. Helper: compute average rating per salonId from localStorage
5. Update salon cards in SalonListTab to show average stars + Top Rated badge
6. Add "समीक्षाएं" tab in AdminPanel listing all reviews with delete button
