
const MAIN_CACHE = 'main-v3';
const OFFLINE_PAGE = '/offline.html';

self.addEventListener('install', function(event) {
    console.log('[Service Worker] Installing Service Worker ...', event);
    event.waitUntil(
        caches.open(MAIN_CACHE)
            .then(function(cache) {
                console.log('[Service Worker] Precaching App Shell');
                cache.add([
                    OFFLINE_PAGE
                ]);
                
            })
    );
});

self.addEventListener('activate', function(event) {
    console.log('[Service Worker] Activating Service Worker ....', event);
    event.waitUntil(
        caches.keys()
            .then(function(keyList) {
                return Promise.all(keyList.map(function(key) {
                    if (key !== MAIN_CACHE) {
                        console.log('[Service Worker] Removing old cache.', key);
                        return caches.delete(key);
                    }
                }));
            })
    );
    return self.clients.claim();
});


self.addEventListener('fetch', function(event) {
    var url = event.request.url;
    console.log('[Service Worker] Fetching something ....', url, '\n', event);

    event.respondWith(
        //network first
        fetch(event.request)
            .then(function(res) {
                console.log('Loaded from web: ' + url);
                if (event.request.method === 'GET' &&
                        !url.startsWith('chrome-extension') &&
                        !url.includes('extension') &&
                        (url.startsWith('http'))) {
                    // Clone the response right after receiving it
                    var clonedRes = res.clone();
                    // Use the cloned response for caching
                    caches.open(MAIN_CACHE)
                        .then(function(cache) {
                            cache.put(url, clonedRes);
                        })
                }
                return res;
            }).catch(function(err) {
                console.error(err + ' while fetching: ' + url);
                //look for it in the cache
                return caches.match(url)
                    .then(function(response) {
                        if (response) {
                            console.log('Loaded from cache: ' + url);
                            return response;
                        } else if (event.request.mode === 'navigate') { 
                            //if the request is a navigation request that is not in the cache, return the offline page
                            console.log('Redirecting to offline page from: ' + url);
                            return caches.open(MAIN_CACHE)
                                .then(function(cache) {
                                    return cache.match(OFFLINE_PAGE);
                            });
                        }
                    }).catch(function(err) {
                        console.error('FAILED: ' + err + ' ' + url);
                    })
            })
    );
});