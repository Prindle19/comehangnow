// public/sw.js
const CACHE_NAME = 'clubconnect-v1';

// This is a basic service worker that will cache assets on the fly.
// It will make the app installable.

self.addEventListener('install', (event) => {
  // The service worker is installed.
  // We don't need to precache anything right now.
  event.waitUntil(self.skipWaiting()); // Activate worker immediately
});

self.addEventListener('activate', (event) => {
  // The service worker is activated.
  event.waitUntil(self.clients.claim()); // Become available to all pages
});

self.addEventListener('fetch', (event) => {
  // This fetch event handler is required for the app to be installable.
  // For now, we are just using a network-first strategy.
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    fetch(event.request).catch(() => {
      // If the network fails, you could try to return a fallback from cache.
      // For now, we'll just let the browser handle the offline error.
    })
  );
});
