/**
 * Web App Manifest — Espace des mariés (PWA admin)
 * Servi automatiquement par Next.js à /manifest.webmanifest
 * et lié dans le <head> via le système Metadata.
 */
export default function manifest() {
  return {
    name: "L'espace des mariés — Myrna & Jaël",
    short_name: "M&J Admin",
    description: "Espace d'administration privé du mariage.",
    start_url: "/admin",
    scope: "/admin",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f5efe6",
    theme_color: "#b35b3c",
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
