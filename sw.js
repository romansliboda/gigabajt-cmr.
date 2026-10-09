const CACHE='gigabajt-cmr-v72';
const FILES=['./index.html','./cmr-template-perfect.png','./icon-192.png','./icon-512.png','./manifest.webmanifest'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('gigabajt-cmr-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch', event => {if(event.request.method!=='GET')return;
  if(event.request.mode==='navigate') {event.respondWith(fetch(event.request).then(response=>{if(response.ok){const clone=response.clone();caches.open(CACHE).then(cache=>cache.put('./index.html',clone));}return response;}).catch(()=>caches.match('./index.html')));return;}
  event.respondWith(caches.match(event.request).then(saved=>saved||fetch(event.request)));
});
