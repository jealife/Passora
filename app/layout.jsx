import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import { DEFAULT_EVENT_SLUG } from "@/lib/content";
import { getEventData } from "@/lib/data";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

// URL publique du site — doit être définie dans .env pour les partages sociaux.
// En local la valeur localhost est suffisante pour le développement.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL &&
  process.env.NEXT_PUBLIC_SITE_URL.startsWith("http")
    ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
    : "http://localhost:3000";

/**
 * Métadonnées générées dynamiquement : l'image OpenGraph reprend automatiquement
 * l'image hero de l'événement (hero_image_url) si elle est définie dans Supabase.
 * Sinon, on utilise l'image de repli statique (/og-image.jpg).
 */
export async function generateMetadata() {
  const { event } = await getEventData(DEFAULT_EVENT_SLUG);

  // Image hero depuis Supabase, ou fallback statique (photo des alliances)
  const ogImageUrl =
    event.hero_image_url && event.hero_image_url.startsWith("http")
      ? event.hero_image_url
      : `${siteUrl}/og-image.jpg`;

  const title = `${event.bride_name} & ${event.groom_name} — Notre mariage`;
  const description =
    "Nous serions honorés de vous compter parmi nous. Découvrez le programme et confirmez votre présence.";

  return {
    metadataBase: new URL(siteUrl),
    title,
    description:
      "Myrna Rychka & Jael Fidèle vous invitent à célébrer leur union. Retrouvez le programme, les lieux et confirmez votre présence.",
    openGraph: {
      title,
      description,
      type: "website",
      locale: "fr_FR",
      url: siteUrl,
      siteName: `Mariage ${event.bride_name} & ${event.groom_name}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 800,
          alt: title,
          type: ogImageUrl.endsWith(".png") ? "image/png" : "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="fr"
      className={`${cormorant.variable} ${jost.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

