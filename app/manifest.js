/**
 * Web App Manifest — Espace client (PWA admin), commun à tous les
 * événements. Servi automatiquement par Next.js à /manifest.webmanifest
 * et lié dans le <head> via le système Metadata.
 */
export default function manifest() {
  return {
    name: "Espace client Passora",
    short_name: "Passora Admin",
    description: "Espace d'administration privé de votre événement.",
    start_url: "/admin",
    scope: "/admin",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#faf6ef",
    theme_color: "#f2a61d",
    // Logo Passora : versions "any" (coins arrondis du logo) et "maskable"
    // (fond doré plein, "p" dans la zone sûre, pour les icônes adaptatives
    // d'Android).
    icons: [
      { src: "/icons/passora-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/passora-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/passora-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
