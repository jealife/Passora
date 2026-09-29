import { readFileSync } from "node:fs";

const { version } = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Version de l'application (package.json) et date de mise en ligne,
  // affichées dans l'onglet Plateforme du tableau de bord agence.
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
    NEXT_PUBLIC_BUILD_DATE: new Date().toISOString(),
  },
  turbopack: {
    root: import.meta.dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [
      {
        // Appliqués à toutes les routes. Pas de Content-Security-Policy ici :
        // le site embarque des iframes Google Maps, des polices Google Fonts
        // et des images Supabase — une CSP mal calibrée casserait ces pages
        // silencieusement ; à ajouter séparément, avec un test manuel complet.
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // camera=(self) : l'onglet Scanner de l'admin lit les billets avec la caméra.
          { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      {
        // Le service worker ne doit jamais être mis en cache par le navigateur
        // afin que les mises à jour soient immédiatement détectées.
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
