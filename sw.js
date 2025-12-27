const CACHE_NAME = 'app-cache-v1';

const FILES_TO_CACHE = [
    'index.html',
    'css/app.css',
    'js/app.js',
    'js/env.js',
    'js/core/init.js',
    // '../../img/icon-192x192.png',
];

self.addEventListener('install', event => {

    // Activate the new service worker as soon as possible.
    self.skipWaiting();

    // Cache some files manually.
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

self.addEventListener('activate', event => {

    // Control the app immediately.
    self.clients.claim();

    // Remove the old caches.
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (!key.includes(CACHE_NAME)) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});

// TODO Cache does not seem to work for CSS files, or the files seem to be fetched two times?
// FIXME Get parameters added by the history system are ignored offline.
self.addEventListener('fetch', event => {

    // Get the cached version of the file if it exists.
    event.respondWith(caches.match(event.request).then(cache_response => {

        // If the file is in the cache, check whether the network version has changed or not.
        if (cache_response) {
            return fetch(event.request, { headers: {
                'If-None-Match': cache_response.headers.get('ETag') || '',
                'If-Modified-Since': cache_response.headers.get('Last-Modified') || ''
            }})
            .then(response => {
                // If the file has not changed, return the cached version.
                if (response.status === 304) {
                    return cache_response;
                }
                // If the file has changed, update the cache and return it.
                else {
                    return getAndCacheResponseFromNetwork(event.request);
                }
            })
            // If offline.
            .catch(() => {
                return cache_response;
            });
        }
        // If the file is not in the cache, fetch it from the network and cache it.
        else {
            return getAndCacheResponseFromNetwork(event.request);
        }
    }));
});

/**
 * Fetch a file from the network, cache it, and return the response.
 * @param {Request} request
 * @returns {Promise<Response>}
 */
function getAndCacheResponseFromNetwork(request) {
    return fetch(request).then(response => {
        // Update the cache with the new response and return it.
        return caches.open(CACHE_NAME).then(cache => {
            return cache.put(request, response.clone()).then(() => response);
        });
    });
}
