// sw.js
const CACHE_NAME = 'board-game-timer-cache-v4'; // Incremented version
const TAILWIND_URL = 'https://cdn.tailwindcss.com';

// Files that make up the app shell and are critical for offline functionality
const APP_SHELL_FILES = [
  '/',
  '/index.html',
  '/index.tsx', // Main application script
  '/manifest.json', // Web app manifest
  // Local icons (ensure these files exist in your project)
  '/assets/icons/icon-192.png',
  '/assets/icons/maskable-icon-192.png',
  '/assets/icons/icon-512.png',
  '/assets/icons/maskable-icon-512.png',
  // You might want to add other essential assets here if any
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching initial assets');

        // Cache Tailwind CSS with no-cors mode, ignore errors for this specific request
        const tailwindRequest = new Request(TAILWIND_URL, { mode: 'no-cors' });
        cache
          .add(tailwindRequest)
          .catch((err) =>
            console.warn('Failed to cache Tailwind (no-cors):', err)
          );

        // Cache all other essential app shell files
        return cache.addAll(APP_SHELL_FILES);
      })
      .then(() => self.skipWaiting()) // Activate worker immediately
      .catch((err) => {
        console.error('Service Worker installation failed:', err);
      })
  );
});

self.addEventListener('activate', (event) => {
  // Clean up old caches
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim()) // Take control of uncontrolled clients
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // For navigation requests, try network first, then cache (NetworkFallingBackToCache)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Check if we received a valid response
          if (
            !response ||
            response.status !== 200 ||
            response.type === 'basic'
          ) {
            // For opaque responses (like no-cors), cache them directly if successful
            if (response && response.ok && response.type === 'opaque') {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            // If not a basic successful response, and not an ok opaque one, it might be an error or redirect
            // that we don't want to cache as the primary response. Let the browser handle it,
            // or fall through to cache if network actually fails.
            return response;
          }

          // Cache the fetched page for basic successful responses
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Network failed, try to serve from cache
          return caches.match(request).then((cachedResponse) => {
            // If request not in cache, fallback to the root index.html for SPA behavior
            return cachedResponse || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // For non-navigation requests (static assets, API calls, etc.), use CacheFirst, then Network.
  // This includes JS modules from esm.sh, CSS, images.
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Cache hit - return response
      }

      // Not in cache - fetch from network
      return fetch(request)
        .then((networkResponse) => {
          // Check if we received a valid response to cache
          // Cache successful basic responses and opaque responses (like tailwind or esm.sh modules)
          if (
            networkResponse &&
            networkResponse.ok &&
            (networkResponse.type === 'basic' ||
              networkResponse.type === 'opaque')
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse; // Return the network response
        })
        .catch((error) => {
          console.warn(`Fetch failed for: ${request.url}`, error);
          // Optionally, return a custom offline fallback for specific asset types if needed
          // For example, for images: return caches.match('/assets/offline-image.png');
          // For now, just let it fail if not in cache and network fails.
        });
    })
  );
});
