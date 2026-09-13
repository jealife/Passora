import { ImageResponse } from "next/og";
import { OG_SIZE } from "@/lib/og-image";

export const alt = "Passora, pages et invitations en ligne pour vos événements";
export const size = OG_SIZE;
export const contentType = "image/png";

/**
 * Image OpenGraph de la vitrine (route racine) — identité Passora
 * générique, indépendante de tout événement. Chaque page /e/[slug]
 * a sa propre image (app/e/[slug]/opengraph-image.jsx).
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1b1108",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 132,
            height: 132,
            borderRadius: 36,
            backgroundColor: "#f2a61d",
            fontSize: 74,
            fontWeight: 700,
            color: "#1b1108",
            fontStyle: "italic",
            marginBottom: 36,
          }}
        >
          p
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 68,
            fontWeight: 600,
            letterSpacing: 2,
            color: "#faf6ef",
          }}
        >
          Passora
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 24,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#f2a61d",
          }}
        >
          Pages d&apos;événement en ligne
        </div>
      </div>
    ),
    size,
  );
}
