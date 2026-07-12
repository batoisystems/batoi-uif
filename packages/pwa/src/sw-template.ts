const CACHE_VERSION = 'v2';
const CACHE = `batoi-uif-${CACHE_VERSION}`;
const sw = self as unknown as ServiceWorkerGlobalScope;

sw.addEventListener('fetch', (event: FetchEvent) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== sw.location.origin || event.request.headers.has('authorization')) {
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith(fetch(event.request).then((response) => {
    const cacheControl = response.headers.get('cache-control')?.toLowerCase() ?? '';
    if (response.ok && !cacheControl.includes('private') && !cacheControl.includes('no-store') && (cacheControl.includes('public') || cacheControl.includes('max-age='))) {
      void caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()));
    }
    return response;
  }).catch(() => caches.match(event.request).then((cached) => cached ?? Promise.reject(new Error('No cached response')))));
});

sw.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('batoi-uif-') && key !== CACHE).map((key) => caches.delete(key)))).then(() => sw.clients.claim()));
});
