// Service Worker — Saúde+
const CACHE = 'saude-plus-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      return c.addAll(ASSETS).catch(function(){ return null; });
    })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e){
  // Network-first para Firebase e CDNs; cache-first para assets locais
  var url = e.request.url;
  if (url.includes('firebase') || url.includes('gstatic') || url.includes('googleapis') || url.includes('cdnjs') || url.includes('jsdelivr')) {
    return; // deixa passar direto pra rede
  }
  e.respondWith(
    caches.match(e.request).then(function(cached){
      return cached || fetch(e.request).then(function(resp){
        return resp;
      }).catch(function(){
        return caches.match('./index.html');
      });
    })
  );
});
