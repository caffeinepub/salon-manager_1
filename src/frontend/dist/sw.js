const CACHE_NAME = 'salon360pro-v4';
const DB_NAME = 'salon360_sw_db';
const DB_VERSION = 1;

// ── IndexedDB helpers ────────────────────────────────────────────────────────
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('owner')) {
        db.createObjectStore('owner', { keyPath: 'key' });
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(store, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result?.value ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(store, key, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).put({ key, value });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbDelete(store, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ── Service Worker Install/Activate ─────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(['/', '/index.html']).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/')) return;
  const isAsset = /\.(js|css|woff2?|ttf|svg|png|jpg|ico)$/i.test(url.pathname);
  if (isAsset) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
          }
          return res;
        }).catch(() => caches.match('/'));
      })
    );
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(event.request).then((c) => c || caches.match('/')))
  );
});

// ── Message Handler ──────────────────────────────────────────────────────────
self.addEventListener('message', async (event) => {
  const { type, salonId, phone } = event.data || {};

  if (type === 'OWNER_LOGIN' && salonId && phone) {
    await idbSet('owner', 'salonId', salonId);
    await idbSet('owner', 'phone', phone);
    await idbSet('owner', 'notifiedIds', []);
  }

  if (type === 'OWNER_LOGOUT') {
    await idbDelete('owner', 'salonId');
    await idbDelete('owner', 'phone');
    await idbDelete('owner', 'notifiedIds');
  }

  if (type === 'NEW_BOOKING_NOTIFY') {
    const { appointmentId, customerName, serviceName, date } = event.data;
    if (!appointmentId) return;

    const notifiedIds = (await idbGet('owner', 'notifiedIds')) || [];
    if (notifiedIds.includes(String(appointmentId))) return;

    notifiedIds.push(String(appointmentId));
    await idbSet('owner', 'notifiedIds', notifiedIds);

    const body = `${customerName} — ${serviceName}\nतारीख: ${date}`;
    await self.registration.showNotification('नई बुकिंग आई! 💈', {
      body,
      icon: '/assets/generated/icon-192.dim_192x192.png',
      badge: '/assets/generated/icon-192.dim_192x192.png',
      tag: `booking-${appointmentId}`,
      requireInteraction: true,
      data: { appointmentId: String(appointmentId), type: 'new_booking' },
      actions: [
        { action: 'confirm', title: '✅ कन्फर्म' },
        { action: 'reject', title: '❌ रद्द' }
      ]
    });
  }
});

// ── Push Notification Handler ────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'salon360Pro';
  const body = data.body || 'नई अपॉइंटमेंट बुक हुई!';
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/assets/generated/icon-192.dim_192x192.png',
      badge: '/assets/generated/icon-192.dim_192x192.png',
      tag: data.tag || 'salon-notification',
      requireInteraction: true,
      data: data,
      actions: data.actions || []
    })
  );
});

// ── Notification Click Handler ───────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const notifData = event.notification.data || {};
  const action = event.action;

  if (action === 'confirm' || action === 'reject') {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        const msg = {
          type: 'NOTIFICATION_ACTION',
          action,
          appointmentId: notifData.appointmentId
        };
        if (clientList.length > 0) {
          for (const client of clientList) {
            client.postMessage(msg);
          }
        } else {
          if (clients.openWindow) {
            clients.openWindow(`/?action=${action}&apptId=${notifData.appointmentId}`);
          }
        }
      })
    );
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
