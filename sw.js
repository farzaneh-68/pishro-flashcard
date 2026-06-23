const CACHE_NAME = 'vazhevar-v1';
const ASSETS = [
  '/pishro-flashcard/',
  '/pishro-flashcard/index.html',
  '/pishro-flashcard/manifest.json',
  'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;700;900&display=swap'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k){return k!==CACHE_NAME;}).map(function(k){return caches.delete(k);}));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // برای Supabase همیشه از شبکه
  if(e.request.url.includes('supabase.co')||e.request.url.includes('translate.google')){
    e.respondWith(fetch(e.request).catch(function(){return new Response('',{status:503});}));
    return;
  }
  // برای بقیه: cache-first
  e.respondWith(
    caches.match(e.request).then(function(cached){
      return cached || fetch(e.request).then(function(response){
        var clone=response.clone();
        caches.open(CACHE_NAME).then(function(cache){cache.put(e.request,clone);});
        return response;
      });
    }).catch(function(){return caches.match('/pishro-flashcard/');})
  );
});
