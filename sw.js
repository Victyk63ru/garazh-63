const CACHE='garazh-v8-2026-08-22-icons-fix';
// Keep these two in sync with the ?v= query strings in index.html - a version
// bump changes the URL, which is what actually forces a cache miss on old
// installs. Bumping only CACHE without bumping these would still serve the
// stale app.js/styles.css bytes to anyone whose browser had them cached
// under the old (now still identical) URL.
const VERSIONED_APP_JS='./app.js?v=2026-08-22-8';
const VERSIONED_STYLES_CSS='./styles.css?v=2026-08-22-8';
const CORE=[
  './','./index.html',VERSIONED_STYLES_CSS,VERSIONED_APP_JS,'./manifest.json',
  './icon-192.png','./icon-512.png',
  './assets/01_BRAND/logo-primary.png',
  './assets/02_ROLES/role-child.png','./assets/02_ROLES/role-child-varya.png','./assets/02_ROLES/role-parent.png','./assets/02_ROLES/role-master.png',
  './assets/04_SKETCHES_AND_IMAGES/sketch-birdhouse.png','./assets/04_SKETCHES_AND_IMAGES/photo-birdhouse.png','./assets/04_SKETCHES_AND_IMAGES/photo-wood-crack.png'
];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
function isCriticalRequest(request, url){
  // index.html/app.js/styles.css must never be served stale-first: a returning
  // visitor's cache can hold a previous release's bytes under the exact same
  // path (or, for the two versioned files, the version query is what changes
  // between releases in the first place). Match by pathname so this still
  // catches app.js/styles.css regardless of which ?v= they were requested
  // with.
  if(request.mode==='navigate') return true;
  return url.pathname.endsWith('/app.js') || url.pathname.endsWith('/styles.css');
}
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin) return;

  if(isCriticalRequest(event.request, url)){
    // Network-first: always prefer whatever is live right now, and only fall
    // back to whatever we have cached (offline, or a flaky connection).
    event.respondWith(
      fetch(event.request).then(resp=>{
        const copy=resp.clone();
        caches.open(CACHE).then(c=>c.put(event.request,copy));
        return resp;
      }).catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./index.html')))
    );
    return;
  }

  // Everything else (icons, images, manifest) - cache-first is fine, these
  // don't change without also changing their own filename/path.
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(resp=>{
    if(resp.ok){const copy=resp.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));}return resp;
  })));
});
