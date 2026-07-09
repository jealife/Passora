import { notFound } from "next/navigation";
import WeddingPage from "@/components/WeddingPage";
import { DEFAULT_EVENT } from "@/lib/content";
import { getEventData } from "@/lib/data";

// Route multi-événements : chaque événement dispose de sa propre page
// via son slug (ex. /e/myrna-jael), sans refonte de l'architecture.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { event } = await getEventData(slug);
  return {
    title: `${event.bride_name} & ${event.groom_name} — ${event.name}`,
    description: `${event.tagline} — retrouvez le programme, les lieux et confirmez votre présence.`,
  };
}

export default async function EventPage({ params }) {
  const { slug } = await params;
  const data = await getEventData(slug);

  // Slug inconnu en base (hors événement de démonstration) : 404.
  if (data.isFallback && slug !== DEFAULT_EVENT.slug) notFound();

  return <WeddingPage data={data} />;
}
