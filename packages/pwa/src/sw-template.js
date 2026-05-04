const CACHE = 'batoi-uif-v1';
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(['/'])));
});
self.addEventListener('fetch', (event) => {
  const accept = event.request.headers.get('accept') || '';
  if (accept.includes('text/html') || accept.includes('application/json')) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }
  event.respondWith(caches.match(event.request).then((r) => r || fetch(event.request)));
});
