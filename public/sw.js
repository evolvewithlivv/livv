const CACHE="livv-shell-v2";
const FIELD_CACHE="livv-field-guides-v1";
const ASSET_CACHE="livv-static-assets-v1";
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
      .then(keys=>Promise.all(keys.filter(key=>![CACHE,FIELD_CACHE,ASSET_CACHE].includes(key)).map(key=>caches.delete(key))))
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
      const html=await response.clone().text();
      await(await caches.open(FIELD_CACHE)).put(target.pathname,response);
      const assets=[...html.matchAll(/(?:src|href)=["']([^"']*\\/_next\\/static\\/[^"']+)["']/g)]
        .map(match=>new URL(match[1],self.location.origin))
        .filter(asset=>asset.origin===self.location.origin&&asset.pathname.startsWith("/_next/static/"));
      const assetCache=await caches.open(ASSET_CACHE);
      await Promise.all(assets.map(async asset=>{
        const cached=await assetCache.match(asset.href);
        if(cached)return;
        const assetResponse=await fetch(asset.href,{credentials:"same-origin"});
        if(!assetResponse.ok)throw new Error("A required offline asset could not be saved");
        await assetCache.put(asset.href,assetResponse);
      }));
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

  // Only public, read-only Field guide documents are eligible for page caching.
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

  // Cache immutable, public Next.js assets so the saved guide can render without
  // a network connection. No HTML route or API response is cached by this rule.
  if(url.pathname.startsWith("/_next/static/")&&["script","style","font","image"].includes(request.destination)){
    event.respondWith((async()=>{
      const cache=await caches.open(ASSET_CACHE);
      const cached=await cache.match(request);
      if(cached)return cached;
      try{
        const response=await fetch(request);
        if(response.ok)await cache.put(request,response.clone());
        return response;
      }catch{
        return cached||Response.error();
      }
    })());
    return;
  }

  if(url.pathname.startsWith("/api/")||url.pathname.startsWith("/home")||url.pathname.startsWith("/auth"))return;
  event.respondWith(fetch(request).catch(()=>caches.match(request).then(cached=>cached||caches.match("/"))));
});

// Private /home and /api responses never enter any cache.
