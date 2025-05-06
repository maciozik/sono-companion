const CACHE_NAME = 'my-app-cache-v1';

const file_to_cache = [
    '../index.html',
    '../css/app.css',
    '../js/app.js',
    // '/images/icon-192x192.png',
];

// Install the service worker and run the cache.
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(file_to_cache);
        })
    );
});

// Get ressources from cache or network.
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

// Update cache.
self.addEventListener('activate', event => {
    const cache_whitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cache_whitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
