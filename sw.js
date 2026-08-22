const CACHE='garazh-v3.1-2026-08-22-task-icons';
const CORE=[
  './','./index.html','./styles.css','./app.js','./manifest.json',
  './icon-192.png','./icon-512.png',
  './assets/01_BRAND/logo-primary.png',
  './assets/02_ROLES/role-child.png','./assets/02_ROLES/role-parent.png','./assets/02_ROLES/role-master.png',
  './assets/04_SKETCHES_AND_IMAGES/sketch-birdhouse.png','./assets/04_SKETCHES_AND_IMAGES/photo-birdhouse.png','./assets/04_SKETCHES_AND_IMAGES/photo-wood-crack.png'
];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin) return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).then(resp=>{
      const copy=resp.clone(); caches.open(CACHE).then(c=>c.put('./index.html',copy)); return resp;
    }).catch(()=>caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(resp=>{
    if(resp.ok){const copy=resp.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));}return resp;
  })));
});
