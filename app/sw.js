/* KTool Mobile - service worker: chay offline + luu tam ban do nen da xem */
const BAN = 'ktm-v2';
const NEN = 'ktm-nen-v1';
const TEP = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(BAN).then(c => c.addAll(TEP)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== BAN && k !== NEN).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    // trang: lay ban moi khi co mang, mat mang thi dung ban da luu
    e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(BAN).then(x => x.put(r, c)); return res; }).catch(() => caches.match(r, {ignoreSearch: true}).then(m => m || caches.match('./index.html'))));
    return;
  }
  if (/tile\.openstreetmap\.org|arcgisonline\.com/.test(u.hostname)) {
    // o ban do nen: dung ban da luu, dong thoi cap nhat khi co mang
    e.respondWith(caches.open(NEN).then(c => c.match(r).then(m => {
      const net = fetch(r).then(res => { if (res.ok || res.type === 'opaque') c.put(r, res.clone()); return res; }).catch(() => m);
      return m || net;
    })));
  }
});
