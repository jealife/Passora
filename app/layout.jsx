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
 * Métadonnées génériques de repli, utilisées par les routes qui ne
 * définissent pas les leurs (ex. /admin). Chaque page d'événement
 * (app/e/[slug]/page.jsx) fournit ses propres title/openGraph/twitter
 * pour que le lien partagé affiche le nom du bon couple, pas celui du
 * premier événement créé.
 */
export const metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Passora — Invitations de mariage en ligne",
  description: "Créez et partagez l'invitation en ligne de votre mariage avec Passora.",
  openGraph: {
    title: "Passora — Invitations de mariage en ligne",
    description: "Créez et partagez l'invitation en ligne de votre mariage avec Passora.",
    type: "website",
    locale: "fr_FR",
    siteName: "Passora",
  },
  twitter: {
    card: "summary_large_image",
    title: "Passora — Invitations de mariage en ligne",
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

