/**
 * HanssonHub Production Service Worker
 * 
 * Features:
 * - Standalone PWA installability & asset pre-caching
 * - Safe network-first navigation with graceful offline fallback
 * - Stale-while-revalidate for static UI assets, icons, and fonts
 * - Zero interference with WebSockets, SignalR, WebRTC, Camera/Microphone streams, and API/Auth endpoints
 */

const CACHE_VERSION = 'hanssonhub-v1';
const STATIC_CACHE = `hanssonhub-static-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

// Core static assets to precache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/manifest.webmanifest',
  '/offline.html',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-192-maskable.png',
  '/icons/icon-512.png',
  '/icons/icon-512-maskable.png',
  '/icons/favicon-32x32.png',
  '/icons/favicon-16x16.png',
  '/icons/apple-touch-icon.png'
];

// Helper: Check if request is an API, Auth, SignalR, WebSocket, or streaming endpoint
function isNetworkOnlyRequest(url, request) {
  // Only handle GET requests in service worker cache
  if (request.method !== 'GET') {
    return true;
  }

  const urlObj = new URL(url);
  const pathname = urlObj.pathname.toLowerCase();
  const search = urlObj.search.toLowerCase();

  // Bypass non-HTTP(S) schemes
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return true;
  }

  // Bypass API endpoints
  if (pathname.startsWith('/api/') || pathname.includes('/api/')) {
    return true;
  }

  // Bypass SignalR / WebSockets / WebRTC signaling / DevTunnels
  if (
    pathname.includes('hub') ||
    pathname.includes('negotiate') ||
    search.includes('transport=') ||
    search.includes('id=') ||
    urlObj.hostname.includes('devtunnels.ms') ||
    urlObj.port === '7190'
  ) {
    return true;
  }

  // Bypass audio/video range requests or live streams
  if (
    request.headers.get('range') ||
    pathname.endsWith('.m3u8') ||
    pathname.endsWith('.ts')
  ) {
    return true;
  }

  return false;
}

// Service Worker Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      // Precache critical assets individually so one failure does not break the entire install
      for (const asset of PRECACHE_ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn(`[SW] Precache skipped for ${asset}:`, err);
        }
      }
    }).then(() => self.skipWaiting())
  );
});

// Service Worker Activate - Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== STATIC_CACHE) {
            console.log('[SW] Deleting obsolete cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Service Worker Fetch
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // 1. Completely bypass API, WebSockets, SignalR, Auth, and Streams (Network-Only)
  if (isNetworkOnlyRequest(url, request)) {
    return;
  }

  // 2. Navigation Requests (Page Load / SPA Route transitions) -> Network First with Offline Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If network returns valid page, clone and update cache
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put('/', responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          // Network failed (offline) -> Try serving cached index / root SPA shell
          const cachedIndex = await caches.match('/');
          if (cachedIndex) {
            return cachedIndex;
          }
          const cachedDoc = await caches.match('/index.html');
          if (cachedDoc) {
            return cachedDoc;
          }
          // Fallback to offline notice page
          const offlinePage = await caches.match(OFFLINE_URL);
          if (offlinePage) {
            return offlinePage;
          }
          return new Response('HanssonHub is currently offline.', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' }
          });
        })
    );
    return;
  }

  // 3. Static Assets (CSS, JS, Images, Icons, Fonts) -> Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          // Cache successful responses for same-origin static assets or CDN fonts
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (networkResponse.type === 'basic' || networkResponse.type === 'cors')
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failed, return cached version or null
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// Allow client app to trigger instant update
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
