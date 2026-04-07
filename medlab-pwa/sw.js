/**
 * Service Worker — MedLab Inventory PWA
 * โฮสต์ไฟล์นี้บน GitHub Pages / Firebase Hosting
 * ไม่ cache URL ของ GAS โดยตรง เพราะ redirect ตลอดเวลา
 */

const CACHE_NAME   = 'medlab-v1';
const OFFLINE_URL  = 'https://naiall.github.io/BBSys/medlab-pwa/offline.html';

/* ─── ไฟล์ Static ที่ cache ได้ (โฮสต์บน GitHub Pages) ─── */
const STATIC_ASSETS = [
  'https://naiall.github.io/BBSys/medlab-pwa/index.html',   // ✅ เพิ่มบรรทัดนี้
  OFFLINE_URL,
  'https://naiall.github.io/BBSys/medlab-pwa/icons/icon-192.png',
  'https://naiall.github.io/BBSys/medlab-pwa/icons/icon-512.png',
  /* Google Fonts — cache ตอน install ทันที */
  'https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap'
];

/* ════════════════════════════════════════
   INSTALL — cache static assets
════════════════════════════════════════ */
self.addEventListener('install', function(event) {
  console.log('[SW] Installing MedLab SW...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS);
    }).then(function() {
      return self.skipWaiting(); /* activate ทันที */
    })
  );
});

/* ════════════════════════════════════════
   ACTIVATE — ลบ cache เก่า
════════════════════════════════════════ */
self.addEventListener('activate', function(event) {
  console.log('[SW] Activating MedLab SW...');
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k)   { return caches.delete(k);  })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

/* ════════════════════════════════════════
   FETCH — Strategy:
   • GAS URLs      → Network only (ห้าม cache)
   • Fonts / Icons → Cache first, fallback network
   • อื่นๆ         → Network first, fallback cache
════════════════════════════════════════ */
self.addEventListener('fetch', function(event) {
  var url = event.request.url;

  /* ── 1. GAS URLs — ผ่าน network เสมอ ── */
  if (url.includes('script.google.com') ||
      url.includes('googleapis.com/macros')) {
    event.respondWith(fetch(event.request));
    return;
  }

  /* ── 2. Google Fonts & Static Icons — Cache First ── */
  if (url.includes('fonts.googleapis.com') ||
      url.includes('fonts.gstatic.com')    ||
      url.includes('/medlab-pwa/icons/')) {
    event.respondWith(
      caches.match(event.request).then(function(cached) {
        if (cached) return cached;
        return fetch(event.request).then(function(response) {
          if (!response || response.status !== 200) return response;
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clone);
          });
          return response;
        });
      })
    );
    return;
  }

  /* ── 3. อื่นๆ — Network First, fallback offline page ── */
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request).then(function(cached) {
        return cached || caches.match(OFFLINE_URL);
      });
    })
  );
});
