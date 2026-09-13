import { getEventData } from "@/lib/data";
import { OG_SIZE, renderOgImage } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = "image/png";

export async function generateImageMetadata({ params }) {
  const { slug } = await params;
  const { event } = await getEventData(slug);
  const brideGroom = `${event.bride_name || "La mariée"} & ${event.groom_name || "Le marié"}`;

  return [
    {
      id: "og",
      alt: `Invitation au mariage de ${brideGroom} : informations et confirmation de présence`,
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
