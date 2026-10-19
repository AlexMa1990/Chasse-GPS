// Met l'app en cache pour qu'elle fonctionne sans réseau en forêt
const CACHE = "chasse-gps-v2";
const ESSENTIELS = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-512.png"];
const OPTIONNELS = ["fond.json", "fond.jpg"]; // fond satellite, s'il existe
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(async c => {
    await c.addAll(ESSENTIELS);
    await Promise.all(OPTIONNELS.map(f => c.add(f).catch(() => {})));
  }));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  // Réseau d'abord (pour recevoir les mises à jour), cache si pas de signal
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok) { const copie = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copie)); }
    return r;
  }).catch(() => caches.match(e.request, {ignoreSearch: true}).then(r => r || caches.match("index.html"))));
});
