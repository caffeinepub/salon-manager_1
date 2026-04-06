# salon360Pro

## Current State
- Notification में आवाज़ और vibration नहीं है, notification bar में रुकती नहीं
- Photo upload 403 error — blob-storage component activate नहीं है, project_id dummy है
- Subscription request से approve होने पर admin panel के 3 डब्बे (इस माह आय, कुल सक्रिय, graph) update नहीं होते

## Requested Changes (Diff)

### Add
- blob-storage component activate करना (photo upload के लिए)
- Customer notification में `requireInteraction: true`, `vibrate`, `silent: false` add करना

### Modify
- CustomerDashboard.tsx — showNotification options में sound+vibration+requireInteraction add
- AdminPanel.tsx — SubscriptionIncomeTab में backendTotal, backendMonthly, backendCount को primary data source बनाना (activeSubs के साथ merge करना)
- AdminPanel.tsx — "कुल सक्रिय सदस्यताएं" में backendCount भी जोड़ना
- AdminPanel.tsx — Graph में backendMonthly data use करना

### Remove
- कुछ नहीं

## Implementation Plan
1. blob-storage component select करो
2. CustomerDashboard.tsx — notification options fix करो (requireInteraction, vibrate, silent)
3. AdminPanel.tsx SubscriptionIncomeTab — इस माह आय = activeSubs income + backendMonthly, कुल सक्रिय = activeSubs.length + backendCount, graph में backendMonthly data merge करो
4. Frontend validate करो
