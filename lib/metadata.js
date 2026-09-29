import { DEFAULT_EVENT_SLUG } from "@/lib/content";
import { eventTitle, eventTypeOf } from "@/lib/event-types";

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
 * adaptées à chaque événement et à son type (mariés ou nom de l'événement,
 * accroche, URL canonique, siteName...).
 *
 * @param {Object} event Données de l'événement.
 * @param {string} [slug] Slug de l'événement (optionnel pour la page d'accueil).
 */
export function generateEventMetadata(event, slug = "") {
  if (!event) return {};

  const isDefault = !slug || slug === DEFAULT_EVENT_SLUG;
  const canonicalPath = isDefault ? "" : `/e/${slug}`;
  const canonicalUrl = `${siteUrl}${canonicalPath}`;

  const type = eventTypeOf(event);
  const taglineText = event.tagline ? `${event.tagline}. ` : "";
  let title;
  let description;
  let siteName;
  if (type.couple) {
    const brideGroom = `${event.bride_name || "La mariée"} & ${event.groom_name || "Le marié"}`;
    title = `${brideGroom} · ${event.name || "Notre mariage"}`;
    description = `${taglineText}${brideGroom} vous invitent à célébrer leur union. Retrouvez le programme, les lieux et confirmez votre présence.`;
    siteName = `Mariage ${brideGroom}`;
  } else {
    title = `${eventTitle(event)} · ${type.label}`;
    description = `${taglineText}Retrouvez toutes les informations de l'événement et confirmez votre présence.`;
    siteName = eventTitle(event);
  }

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
