const CACHE_NAME = "mzj-v13-1-5";
const CORE_ASSETS = ["./", "./index.html?v=13.1.5", "./styles.css?v=13.1.5", "./v13-controls.js?v=13.1.5", "./v13-navigation.js?v=13.1.5", "./app.js?v=13.1.5", "./manifest.json?v=13.1.5", "./photo-label-guide.png"];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(CORE_ASSETS)));self.skipWaiting();});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith("mzj-")&&key!==CACHE_NAME).map(key=>caches.delete(key)))));self.clients.claim();});
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  const url=new URL(event.request.url);
  const isCode=["document","script","style","worker"].includes(event.request.destination)||url.pathname.endsWith(".json");
  if(isCode){
    event.respondWith(fetch(event.request,{cache:"no-store"}).then(response=>{if(response&&response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));}return response;}).catch(()=>caches.match(event.request).then(hit=>hit||caches.match("./index.html?v=13.1.5"))));
    return;
  }
  event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{if(response&&response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));}return response;})));
});
