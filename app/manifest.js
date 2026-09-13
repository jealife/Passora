/**
 * Web App Manifest — Espace client (PWA admin), commun à tous les
 * événements. Servi automatiquement par Next.js à /manifest.webmanifest
 * et lié dans le <head> via le système Metadata.
 */
export default function manifest() {
  return {
    name: "Passora — Espace client",
    short_name: "Passora Admin",
    description: "Espace d'administration privé de votre événement.",
    start_url: "/admin",
    scope: "/admin",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#faf6ef",
    theme_color: "#f2a61d",
    icons: [
      {
        src: "/icons/pwa-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/pwa-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
