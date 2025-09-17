const CACHE_NAME = 'wtr-v2';
const BASE_PATH = (() => {
  try {
    return new URL('./', self.registration.scope).pathname;
  } catch (err) {
    return self.location.pathname.replace(/service-worker\.js$/, '');
  }
})();
const OFFLINE_URL = `${BASE_PATH}offline.html`;

const ASSETS = [
  `${BASE_PATH}`,
  `${BASE_PATH}index.html`,
  OFFLINE_URL,
  `${BASE_PATH}assets/styles/main.css`,
  `${BASE_PATH}src/main.js`,
  `${BASE_PATH}js/realmViewer.js`,
  `${BASE_PATH}js/KokuraVillageScene.js`,
  `${BASE_PATH}assets/sprites/villageStructures.js`,
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await Promise.all(
        ASSETS.map(async (asset) => {
          try {
            await cache.add(asset);
          } catch (err) {
            console.warn('Service worker failed to cache asset', asset, err);
          }
        })
      );
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      try {
        const req = event.request;
        if (req.method !== 'GET') {
          return fetch(req);
        }

        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(req);
        if (cached) {
          return cached;
        }

        const resp = await fetch(req);
        if (resp && resp.ok) {
          cache.put(req, resp.clone());
        }
        return resp;
      } catch (err) {
        if (event.request.mode === 'navigate') {
          const cache = await caches.open(CACHE_NAME);
          const offline = await cache.match(OFFLINE_URL);
          if (offline) {
            return offline;
          }
        }
        return new Response('Offline or fetch failed', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
    })()
  );
});
