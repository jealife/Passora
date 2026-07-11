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
 * Métadonnées générées dynamiquement depuis les données de l'événement.
 * L'image OpenGraph est gérée automatiquement par app/opengraph-image.jsx
 * (Next.js file-based convention) — aucune surcharge ici.
 */
export async function generateMetadata() {
  const { event } = await getEventData(DEFAULT_EVENT_SLUG);

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
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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

