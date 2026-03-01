var CACHE='victor-v1';
var ASSETS=['./',
  './index.html','./css/style.css',
  './js/config.js','./js/state.js','./js/ui.js','./js/util.js',
  './js/mall.js','./js/stake.js','./js/explore.js','./js/social.js',
  './js/cosmetics.js','./js/badges.js','./js/quests.js','./js/servers.js',
  './js/vault.js','./js/status.js','./js/nametemplates.js','./js/pwa.js',
  './js/payment.js','./js/main.js'
];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS.map(function(a){return new Request(a,{cache:'reload'});})).catch(function(){});}));
  self.skipWaiting();
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));}));
  self.clients.claim();
});
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET') return;
  e.respondWith(fetch(e.request).then(function(r){var c=r.clone();caches.open(CACHE).then(function(ca){ca.put(e.request,c);});return r;}).catch(function(){return caches.match(e.request);}));
});
