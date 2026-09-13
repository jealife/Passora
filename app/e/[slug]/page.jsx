import { notFound } from "next/navigation";
import WeddingPage from "@/components/WeddingPage";
import { DEFAULT_EVENT } from "@/lib/content";
import { getEventData } from "@/lib/data";
import { getSiteUrl } from "@/lib/utils";

// Route multi-événements : chaque événement dispose de sa propre page
// via son slug (ex. /e/myrna-jael), sans refonte de l'architecture.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { event } = await getEventData(slug);
  const title = `${event.bride_name} & ${event.groom_name} — ${event.name}`;
  const description = `${event.tagline} — retrouvez le programme, les lieux et confirmez votre présence.`;

  // openGraph/twitter sont explicitement redéfinis ici (pas seulement title) :
  // Next.js ne fusionne pas ces objets champ par champ avec le layout racine,
  // sans quoi le lien partagé afficherait toujours le nom du premier événement.
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "fr_FR",
      url: `${getSiteUrl()}/e/${slug}`,
      siteName: `Mariage ${event.bride_name} & ${event.groom_name}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function EventPage({ params }) {
  const { slug } = await params;
  const data = await getEventData(slug);

  // Slug inconnu en base (hors événement de démonstration) : 404.
  if (data.isFallback && slug !== DEFAULT_EVENT.slug) notFound();

  return <WeddingPage data={data} />;
}
