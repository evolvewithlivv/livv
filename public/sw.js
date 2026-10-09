const CACHE="livv-shell-v2";
const FIELD_CACHE="livv-field-guides-v1";
const SHELL=["/","/auth","/manifest.webmanifest"];

self.addEventListener("install",event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(cache=>Promise.all(SHELL.map(url=>cache.add(url).catch(()=>null))))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>![CACHE,FIELD_CACHE].includes(key)).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("message",event=>{
  if(event.data?.type!=="CACHE_FIELD_GUIDE"||typeof event.data.url!=="string")return;
  event.waitUntil((async()=>{
    const target=new URL(event.data.url,self.location.origin);
    if(target.origin!==self.location.origin||!/^\/field-offline\/[a-z0-9-]+\/?$/.test(target.pathname)){
      event.source?.postMessage({type:"FIELD_GUIDE_CACHE_FAILED",url:event.data.url});
      return;
    }
    try{
      const response=await fetch(target.href,{credentials:"same-origin",cache:"reload"});
      if(!response.ok)throw new Error("Guide response was not successful");
      await(await caches.open(FIELD_CACHE)).put(target.pathname,response);
      event.source?.postMessage({type:"FIELD_GUIDE_CACHED",url:target.pathname});
    }catch{
      event.source?.postMessage({type:"FIELD_GUIDE_CACHE_FAILED",url:target.pathname});
    }
  })());
});

self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET"||new URL(request.url).origin!==self.location.origin)return;
  const url=new URL(request.url);

  // Only public, read-only Field guide documents are eligible for offline caching.
  // Authenticated pages and API responses are deliberately never cached.
  if(url.pathname.startsWith("/field-offline/")&&request.mode==="navigate"){
    event.respondWith((async()=>{
      const cache=await caches.open(FIELD_CACHE);
      try{
        const response=await fetch(request);
        if(response.ok)await cache.put(url.pathname,response.clone());
        return response;
      }catch{
        return(await cache.match(url.pathname))||new Response("This Field guide has not been saved for offline use yet. Open it while connected and choose Save for offline access.",{status:503,headers:{"Content-Type":"text/plain; charset=utf-8","Cache-Control":"no-store"}});
      }
    })());
    return;
  }

  if(url.pathname.startsWith("/api/")||url.pathname.startsWith("/home")||url.pathname.startsWith("/auth"))return;
  event.respondWith(fetch(request).catch(()=>caches.match(request).then(cached=>cached||caches.match("/"))));
});

// Private /home and /api responses never enter either cache.
