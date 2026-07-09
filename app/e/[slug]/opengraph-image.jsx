import { getEventData } from "@/lib/data";
import { OG_SIZE, renderOgImage } from "@/lib/og-image";

export const alt = "Invitation au mariage — informations et confirmation de présence";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OpengraphImage({ params }) {
  const { slug } = await params;
  const { event } = await getEventData(slug);
  return renderOgImage(event);
}
