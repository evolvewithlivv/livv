const CACHE="livv-shell-v2";
const SHELL=["/","/auth","/manifest.webmanifest"];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE).then(cache=>Promise.all(SHELL.map(url=>cache.add(url).catch(()=>null)))).then(()=>self.skipWaiting()));});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",event=>{const request=event.request;if(request.method!=="GET"||new URL(request.url).origin!==self.location.origin)return;const url=new URL(request.url);if(url.pathname.startsWith("/api/")||url.pathname.startsWith("/home")||url.pathname.startsWith("/auth"))return;event.respondWith(fetch(request).catch(()=>caches.match(request).then(cached=>cached||caches.match("/"))));});
// This serviceWorker is intentionally a small public shell cache. Authenticated /home and /api responses never enter it.