const APP_VERSION   = 'v1.0.2';
const SHELL_CACHE   = `ktm-shell-${APP_VERSION}`;
const TILE_CACHE    = `ktm-tiles-${APP_VERSION}`;
const API_CACHE     = `ktm-api-${APP_VERSION}`;

const MAX_TILE_ENTRIES = 500;
const MAX_API_ENTRIES  = 100;
const API_CACHE_TTL    = 7 * 24 * 60 * 60 * 1000;

const SHELL_ASSETS = [
  '/KTM-TRANSIT/',
  '/KTM-TRANSIT/index.html',
  '/KTM-TRANSIT/pages/login.html',
  '/KTM-TRANSIT/pages/admin.html',
  '/KTM-TRANSIT/pages/superadmin.html',
  '/KTM-TRANSIT/css/theme.css',
  '/KTM-TRANSIT/js/db.js',
  '/KTM-TRANSIT/js/pwa.js',
  '/KTM-TRANSIT/js/supabase.js',
  '/KTM-TRANSIT/manifest.json',
  '/KTM-TRANSIT/assets/icons/icon-192.png',
  '/KTM-TRANSIT/assets/icons/icon-512.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(cache => {
      return Promise.allSettled(
        SHELL_ASSETS.map(url =>
          cache.add(url).catch(err => console.warn(`SW: couldn't cache ${url}`, err))
        )
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  const currentCaches = [SHELL_CACHE, TILE_CACHE, API_CACHE];
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => !currentCaches.includes(key))
          .map(key => {
            console.log(`SW: deleting old cache "${key}"`);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  if (url.hostname.endsWith('tile.openstreetmap.org')) {
    event.respondWith(tileFirst(request));
    return;
  }

  if (
    url.hostname === 'nominatim.openstreetmap.org' ||
    url.hostname === 'router.project-osrm.org'
  ) {
    event.respondWith(networkFirst(request, API_CACHE, MAX_API_ENTRIES));
    return;
  }

  if (
    url.hostname === 'unpkg.com' ||
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  ) {
    event.respondWith(cacheFirst(request, SHELL_CACHE));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request, SHELL_CACHE));
    return;
  }
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return offlineFallback(request);
  }
}

async function networkFirst(request, cacheName, maxEntries) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
      trimCache(cache, maxEntries);
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || offlineFallback(request);
  }
}

async function tileFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(TILE_CACHE);
      cache.put(request, response.clone());
      trimCache(cache, MAX_TILE_ENTRIES);
    }
    return response;
  } catch {
    return new Response(
      atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='),
      { headers: { 'Content-Type': 'image/png' } }
    );
  }
}

async function trimCache(cache, maxEntries) {
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    const toDelete = keys.slice(0, keys.length - maxEntries);
    await Promise.all(toDelete.map(k => cache.delete(k)));
  }
}

function offlineFallback(request) {
  const url = new URL(request.url);
  if (request.headers.get('Accept')?.includes('text/html')) {
    return caches.match('/KTM-TRANSIT/index.html');
  }
  return new Response(
    JSON.stringify({ error: 'You are offline', url: url.href }),
    { status: 503, headers: { 'Content-Type': 'application/json' } }
  );
}

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data?.type === 'GET_VERSION') {
    event.ports[0]?.postMessage({ version: APP_VERSION });
  }
});