import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import { getSiteUrl } from "@/lib/utils";

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

/**
 * Métadonnées génériques de la vitrine Passora (route racine) et de
 * repli pour les routes qui ne définissent pas les leurs (ex. /admin).
 * Chaque page d'événement (app/e/[slug]/page.jsx) fournit ses propres
 * title/openGraph/twitter pour que le lien partagé affiche le nom du
 * bon couple, pas celui du premier événement créé.
 */
const TITLE = "Passora — Pages et invitations en ligne pour vos événements";
const DESCRIPTION =
  "Créez la page en ligne de votre événement — mariage aujourd'hui, bientôt bien d'autres — et personnalisez-la vous-même : programme, lieux, thème et confirmations de présence.";

export const metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    locale: "fr_FR",
    siteName: "Passora",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

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

