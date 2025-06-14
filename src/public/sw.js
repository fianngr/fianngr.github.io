const CACHE_NAME = 'story-app-v1';
const IMAGE_CACHE = 'image-cache';
const API_CACHE = 'api-cache';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/assets/images/fallback.png', 
];

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (![CACHE_NAME, IMAGE_CACHE, API_CACHE].includes(key)) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  if (event.request.method !== 'GET') return;

  // Image cache
  if (
    requestUrl.origin === 'https://story-api.dicoding.dev' &&
    requestUrl.pathname.startsWith('/images/')
  ) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) =>
        cache.match(event.request).then((cached) =>
          cached ||
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse.ok) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => caches.match('/assets/images/fallback.png'))
        )
      )
    );
    return;
  }

  // Story detail fallback
  if (
    requestUrl.origin === 'https://story-api.dicoding.dev' &&
    requestUrl.pathname.startsWith('/v1/stories/story-')
  ) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            return response;
          }
          throw new Error('Response not OK');
        })
        .catch(() => {
          return new Response(
            JSON.stringify({
              error: true,
              message: 'Detail tidak tersedia saat offline.',
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        })
    );
    return;
  }

  // Story list → Jangan tampilkan apa-apa saat offline
  if (
    requestUrl.origin === 'https://story-api.dicoding.dev' &&
    requestUrl.pathname === '/v1/stories'
  ) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            return response;
          }
          throw new Error('Response not OK');
        })
        .catch(() => {
          return new Response(JSON.stringify([]), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }

  // Fallback untuk semua request lainnya
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).catch(() => caches.match('/index.html'))
      );
    })
  );
});

self.addEventListener('push', function (event) {
  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: 'Story App', message: 'Ada notifikasi baru!' };
  }

  const title = data.title || 'Story App';
  const options = {
    body: data.message || 'Notifikasi dari server.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: {
      url: data.url || '/' // bisa diarahkan ke halaman tertentu
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Tambahkan ini agar klik notifikasi membuka tab app
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

