const CACHE_NAME = 'ai-career-copilot-v1';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './favicon.svg',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

self.addEventListener('fetch', event => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  // Strategy: Cache first, then network.
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      // For navigation requests, try network first, then cache, to get the latest version.
      if (event.request.mode === 'navigate') {
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch (error) {
          return await cache.match(event.request);
        }
      } else {
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        try {
          const networkResponse = await fetch(event.request);
          // Add the response to the cache for next time.
          // This dynamically caches all other assets like .tsx files and esm.sh modules
          if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch (error) {
          console.error('Fetch failed; user is likely offline.', error);
          // You could return a custom offline fallback page here if you had one.
        }
      }
    })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});