const V = 'smq-v2';
const BASE = '/niko/sophia';
const ASSETS = [BASE+'/', BASE+'/index.html', BASE+'/css/app.css', BASE+'/js/fluid.js', BASE+'/js/questions.js', BASE+'/js/game.js', BASE+'/manifest.webmanifest'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
