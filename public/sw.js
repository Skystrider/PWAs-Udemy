
const STATIC_CACHE_NAME = 'static-v11';
const DYNAMIC_CACHE_NAME = 'dynamic-v3';

self.addEventListener('install', function(event) {
    console.log('[Service Worker] Installing Service Worker ...', event);
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then(function(cache) {
                console.log('[Service Worker] Precaching App Shell');
                cache.addAll([
                    '/src/js/app.js',
                    '/src/js/feed.js',
                    '/src/js/promise.js',
                    '/src/js/fetch.js',
                    '/src/js/material.min.js',
                    '/index.html',
                    '/offline.html',
                    '/',
                    '/manifest.json',
                    '/src/images/',
                    '/src/css/app.css',
                    '/src/css/feed.css',
                    '/src/css/help.css',
                    '/favicon.ico',
                    '/src/images/sf-boat.jpg',
                    '/src/images/main-image.jpg',
                    '/src/images/main-image-lg.jpg',
                    '/src/images/main-image-sm.jpg',
                    '/src/images/icons/app-icon-144x144.png',
                    '/src/images/icons/app-icon-96x96.png',
                    '/src/images/icons/app-icon-48x48.png',
                    '/src/images/icons/app-icon-192x192.png',
                    '/src/images/icons/app-icon-512x512.png',
                    '/src/images/icons/app-icon-384x384.png',
                    '/src/images/icons/app-icon-256x256.png',
                    '/src/images/icons/apple-icon-57x57.png',
                    '/src/images/icons/apple-icon-60x60.png',
                    '/src/images/icons/apple-icon-72x72.png',
                    '/src/images/icons/apple-icon-76x76.png',
                    '/src/images/icons/apple-icon-114x114.png',
                    '/src/images/icons/apple-icon-120x120.png',
                    '/src/images/icons/apple-icon-144x144.png',
                    '/src/images/icons/apple-icon-152x152.png',
                    '/src/images/icons/apple-icon-180x180.png',
                    'https://fonts.googleapis.com/css?family=Roboto:400,700"',
                    'https://fonts.googleapis.com/icon?family=Material+Icons',
                    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
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
                                        if (key !== STATIC_CACHE_NAME 
                                            && key !== DYNAMIC_CACHE_NAME
                                        ) {
                                                console.log('[Service Worker] Removing old cache.', key);
                                                return caches.delete(key);
                                        }
                                }));
                        })
        );
        return self.clients.claim();
});

// self.addEventListener('fetch', function(event) {
// //   console.log('[Service Worker] Fetching something ....', event);
//         url = event.request.url;
//         if (
//                 url.startsWith('chrome-extension') ||
//                 url.includes('extension') ||
//                 !(url.indexOf('http') === 0)
//         ) return;
//         event.respondWith(
//                 caches.match(event.request)
//                 .then(function(response) {
//                         if (response) {
//                         return response;
//                         } else {
//                         return fetch(event.request)
//                                 //returning the fetched response but first lets cache it:
//                                 .then(function(res) {
//                                 return caches.open(DYNAMIC_CACHE_NAME)
//                                         .then(function(cache) {
//                                         cache.put(event.request, res.clone());
//                                         return res;
//                                         })
//                                 }).catch(function(err) {
//                                     console.error(err + ' ' + url);
//                                     return caches.open(STATIC_CACHE_NAME)
//                                             .then(function(cache) {
//                                             return cache.match('/offline.html');
//                                         });
//                                 });
//                         }
//                 }).catch(function(err) {
//                         console.error(err + ' ' + url);
//                 })  
//         );
// });

//TODO: refactor from feed.js the strategy to load value from both network and cache, prefering the network value due to being updated -
// I think we really only want to use our own caching if we are not online, and we want to use the network if we are online
// since we can rely on standard browser caching for the network, and we can rely on our own caching for offline
self.addEventListener('fetch', function(event) {
    console.log('[Service Worker] Fetching something ....', event);


    if(event.request.url.indexOf('https://httpbin.org/get') > -1) {
        event.respondWith(
            caches.open(DYNAMIC_CACHE_NAME)
                .then(function(cache) {
                    return fetch(event.request)
                        .then(function(res) {
                            cache.put(event.request, res.clone());
                            return res;
                        });
                })
        );
    } else {
        event.respondWith(
                caches.match(event.request)
                .then(function(response) {
                        if (response) {
                        return response;
                        } else {
                        return fetch(event.request)
                                //returning the fetched response but first lets cache it:
                                .then(function(res) {
                                return caches.open(DYNAMIC_CACHE_NAME)
                                        .then(function(cache) {
                                        cache.put(event.request, res.clone());
                                        return res;
                                        })
                                }).catch(function(err) {
                                    console.error(err + ' ' + url);
                                    return caches.open(STATIC_CACHE_NAME)
                                            .then(function(cache) {
                                            return cache.match('/offline.html');
                                        });
                                });
                        }
                }).catch(function(err) {
                        console.error(err + ' ' + url);
                })  
        );
    }
});