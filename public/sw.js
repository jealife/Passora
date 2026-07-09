/**
 * Service Worker — Myrna & Jaël Admin PWA
 *
 * Stratégies :
 *  - Cache-First  : assets buildés Next.js (_next/static/) — immuables car hashés
 *  - Network-First : tout le reste (pages, API Supabase)
 *
 * Scope limité à /admin/ — le site public (/) n'est pas affecté.
 */

const CACHE_NAME = "myrna-admin-v1";

// Pages pré-cachées à l'installation
const PRECACHE_URLS = ["/admin"];

// ─── Install ─────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ─── Activate ────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ─── Fetch ───────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Ignorer les requêtes non-GET et les extensions de navigateur
  if (request.method !== "GET") return;
  if (!request.url.startsWith("http")) return;

  const url = new URL(request.url);

  // Cache-First pour les assets statiques Next.js (hashés, donc immuables)
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            // Mettre en cache uniquement les réponses valides
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
      )
    );
    return;
  }

  // Network-First pour les pages et l'API (données fraîches prioritaires)
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Mettre en cache les pages HTML pour un fallback hors-ligne minimal
        if (response.ok && request.headers.get("accept")?.includes("text/html")) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() =>
        // Fallback : servir depuis le cache si réseau indisponible
        caches.match(request).then((cached) => cached || Response.error())
      )
  );
});
