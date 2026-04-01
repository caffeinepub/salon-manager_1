const CACHE_NAME = 'salon360pro-v1';

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
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Skip ICP API calls — always network
  if (url.pathname.startsWith('/api/')) return;

  // JS/CSS/fonts/images: cache-first for fast repeat loads
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

  // HTML: network-first, fall back to cached shell
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

// ── Push Notification Handler ────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'salon360Pro';
  const body = data.body || 'आपकी बारी आने वाली है!';
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/assets/generated/icon-192.dim_192x192.png',
      badge: '/assets/generated/icon-192.dim_192x192.png',
      tag: data.tag || 'salon-notification',
      requireInteraction: true,
      data: data
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
