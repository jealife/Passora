import { DEFAULT_EVENT_SLUG } from "@/lib/content";
import { getEventData } from "@/lib/data";
import { OG_SIZE, renderOgImage } from "@/lib/og-image";

export const alt = "Invitation au mariage — informations et confirmation de présence";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OpengraphImage() {
  const { event } = await getEventData(DEFAULT_EVENT_SLUG);
  return renderOgImage(event);
}
