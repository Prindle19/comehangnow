
// A fetch handler is required for a PWA to be installable.
self.addEventListener('fetch', (event) => {
  // This is a network-first strategy.
  // You can implement more sophisticated caching strategies here.
  event.respondWith(fetch(event.request));
});
