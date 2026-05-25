// AniTrack Service Worker — enables offline support and PWA install
const CACHE = "anitrack-v1";
const STATIC = [
  "/",
  "/mylist",
  "/trending",
  "/dashboard",
  "/static/js/main.chunk.js",
  "/static/js/bundle.js",
  "/manifest.json",
  "/favicon.svg",
];

// Install — cache static assets
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => {
      // Cache what we can, ignore failures for individual files
      return Promise.allSettled(STATIC.map((url) => cache.add(url).catch(() => {})));
    })
  );
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first, fallback to cache
self.addEventListener("fetch", (e) => {
  // Skip non-GET and API calls
  if (e.request.method !== "GET") return;
  if (e.request.url.includes("/api/")) return;
  if (e.request.url.includes("supabase")) return;
  if (e.request.url.includes("jikan")) return;

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // Cache successful responses
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then((cache) => cache.put(e.request, clone));
        }
        return res;
      })
      .catch(() => {
        // Fallback to cache when offline
        return caches.match(e.request).then((cached) => {
          if (cached) return cached;
          // Return offline page for navigation requests
          if (e.request.mode === "navigate") {
            return caches.match("/");
          }
        });
      })
  );
});

// Push notifications (for future use)
self.addEventListener("push", (e) => {
  const data = e.data?.json() || {};
  e.waitUntil(
    self.registration.showNotification(data.title || "AniTrack", {
      body: data.body || "You have a new notification",
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      data: data.url || "/",
    })
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data));
});
