const CACHE_NAME = "mzj-v13-cloud-dev-3";
const CORE_ASSETS = ["./", "./index.html", "./styles.css?v=13.0.0-dev.3", "./app.js?v=13.0.0-dev.3", "./manifest.json", "./photo-label-guide.png"];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(CORE_ASSETS)));self.skipWaiting();});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))));self.clients.claim();});
self.addEventListener("fetch",event=>{if(event.request.method!=="GET")return;event.respondWith(fetch(event.request).then(response=>{if(response&&response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));}return response;}).catch(()=>caches.match(event.request).then(hit=>hit||caches.match("./index.html"))));});
