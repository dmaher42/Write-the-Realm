const CACHE_VERSION = 'v1';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const BASE_PATH = self.location.pathname.replace(/service-worker\.js$/, '');
const ASSETS = [BASE_PATH, `${BASE_PATH}index.html`];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== STATIC_CACHE).map(key => caches.delete(key))
      )
    )
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const assetRegex = /\.(?:html|js|css|png|jpg|jpeg|gif|svg)$/;
  if (assetRegex.test(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then(res => {
        return (
          res ||
          fetch(event.request).then(response => {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then(cache => cache.put(event.request, copy));
            return response;
          })
        );
      })
    );
  }
});

