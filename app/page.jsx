import WeddingPage from "@/components/WeddingPage";
import { DEFAULT_EVENT_SLUG } from "@/lib/content";
import { getEventData } from "@/lib/data";

// Rendu à la demande : les modifications faites dans l'administration
// sont visibles immédiatement par les invités.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getEventData(DEFAULT_EVENT_SLUG);
  return <WeddingPage data={data} />;
}
