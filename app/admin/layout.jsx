/**
 * Layout dédié à la route /admin.
 *
 * Injecte les méta-tags spécifiques à la PWA (Apple Web App, icône, manifest)
 * sans toucher au layout racine du site public.
 * La page.jsx conserve ses propres métadonnées (title, robots).
 */

export const metadata = {
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "M&J Admin",
  },
  icons: {
    apple: "/icons/pwa-192.png",
  },
  manifest: "/manifest.webmanifest",
};

export default function AdminLayout({ children }) {
  return children;
}
