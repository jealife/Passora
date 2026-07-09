import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";

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

// URL publique du site — ignore la valeur d'exemple non renseignée.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("votre-")
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: "Myrna & Jaël — Notre mariage",
  description:
    "Myrna Rychka & Jael Fidèle vous invitent à célébrer leur union. Retrouvez le programme, les lieux et confirmez votre présence.",
  openGraph: {
    title: "Myrna & Jaël — Notre mariage",
    description:
      "Nous serions honorés de vous compter parmi nous. Découvrez le programme et confirmez votre présence.",
    type: "website",
    locale: "fr_FR",
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
