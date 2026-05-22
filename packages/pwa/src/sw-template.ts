const CACHE = 'batoi-uif-v1';
const sw = self as unknown as ServiceWorkerGlobalScope;

sw.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(['/'])));
});

sw.addEventListener('fetch', (event: FetchEvent) => {
  const accept = event.request.headers.get('accept') || '';
  if (accept.includes('text/html') || accept.includes('application/json')) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request) as Promise<Response>));
    return;
  }
  event.respondWith(caches.match(event.request).then((response) => response || fetch(event.request)));
});
