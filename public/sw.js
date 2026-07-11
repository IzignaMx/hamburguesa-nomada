/**
 * Service Worker — Hamburguesa Nómada Alleycat 5
 *
 * Estrategia: network-first para HTML, cache-first para assets estáticos.
 * Precarga el app shell en install.
 * Versión actualizada en cada build para evitar servir versiones obsoletas.
 */

const CACHE = "hm-alleycat-v4";

/* ── Instalación: precargar app shell ─────────── */

self.addEventListener("install", (event) => {
  const precache = caches.open(CACHE).then((cache) =>
    cache.addAll([
      "/",
      "/premios/",
      "/resultados/",
      "/galeria/",
      "/fonts/SS_Soapy_Hands.woff2",
      "/logos/hamburguesa-nomada.webp",
      "/favicon.ico",
      "/favicon-32x32.png",
      "/favicon-16x16.png",
      "/apple-touch-icon.png",
      "/icons/icon-192.png",
      "/icons/icon-512.png",
      "/site.webmanifest",
    ]),
  );
  event.waitUntil(precache);
  self.skipWaiting();
});

/* ── Activación: limpiar cachés antiguas ──────── */

self.addEventListener("activate", (event) => {
  const clean = caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
  );
  event.waitUntil(clean);
  self.clients.claim();
});

/* ── Estrategias de caché ─────────────────────── */

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const fresh = await fetch(request);
  if (fresh.ok) {
    const cache = await caches.open(CACHE);
    await cache.put(request, fresh.clone());
  }
  return fresh;
}

async function networkFirst(request) {
  try {
    const fresh = await fetch(request);
    if (fresh.ok) {
      const cache = await caches.open(CACHE);
      await cache.put(request, fresh.clone());
    }
    return fresh;
  } catch {
    const cached = await caches.match(request);
    return cached ?? new Response("Offline", { status: 503 });
  }
}

/* ── Fetch: network-first HTML, cache-first assets ─ */

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  /* Solo mismo origen */
  if (url.origin !== self.location.origin) return;

  /* Cache-first: archivos estáticos con hash o assets de build */
  if (
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "font" ||
    request.destination === "image" ||
    url.pathname.startsWith("/assets/")
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  /* Network-first: HTML (navegación) */
  if (request.destination === "document" || request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  /* Otros: network-only */
});
