import { DEFAULT_EVENT_SLUG } from "@/lib/content";

/**
 * URL publique de base du site — configurée via .env ou valeur par défaut local.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL &&
  process.env.NEXT_PUBLIC_SITE_URL.startsWith("http")
    ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
    : "http://localhost:3000";

/**
 * Génère des métadonnées OpenGraph et Twitter dynamiques et personnalisées
 * adaptées à chaque événement (nom des mariés, accroche, URL canonique, siteName...).
 *
 * @param {Object} event Données de l'événement.
 * @param {string} [slug] Slug de l'événement (optionnel pour la page d'accueil).
 */
export function generateEventMetadata(event, slug = "") {
  if (!event) return {};

  const isDefault = !slug || slug === DEFAULT_EVENT_SLUG;
  const canonicalPath = isDefault ? "" : `/e/${slug}`;
  const canonicalUrl = `${siteUrl}${canonicalPath}`;

  const brideGroom = `${event.bride_name || "La mariée"} & ${event.groom_name || "Le marié"}`;
  const title = `${brideGroom} · ${event.name || "Notre mariage"}`;

  const taglineText = event.tagline ? `${event.tagline}. ` : "";
  const description = `${taglineText}${brideGroom} vous invitent à célébrer leur union. Retrouvez le programme, les lieux et confirmez votre présence.`;

  const siteName = `Mariage ${brideGroom}`;

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "fr_FR",
      url: canonicalUrl,
      siteName,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
