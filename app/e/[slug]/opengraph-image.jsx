import { getEventData } from "@/lib/data";
import { eventTitle, eventTypeOf } from "@/lib/event-types";
import { OG_SIZE, renderOgImage } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = "image/png";

export async function generateImageMetadata({ params }) {
  const { slug } = await params;
  const { event } = await getEventData(slug);

  return [
    {
      id: "og",
      alt: `${eventTypeOf(event).label} : ${eventTitle(event)}, informations et confirmation de présence`,
      size: OG_SIZE,
      contentType: "image/png",
    },
  ];
}

export default async function OpengraphImage({ params }) {
  const { slug } = await params;
  const { event } = await getEventData(slug);
  return renderOgImage(event);
}
