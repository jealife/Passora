import { ImageResponse } from "next/og";

/**
 * Image OpenGraph générée à la volée (1200×630) : aperçu élégant du site
 * lorsque le lien est partagé (WhatsApp, iMessage, réseaux sociaux…).
 * Reprend l'identité terracotta et le contenu administrable de l'événement.
 */

export const OG_SIZE = { width: 1200, height: 630 };

/** Récupère une police Google Fonts (format TTF) limitée aux glyphes utiles. */
async function loadGoogleFont(family, text) {
  const url = `https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/);
  if (!resource) throw new Error("Police introuvable");
  const response = await fetch(resource[1]);
  if (!response.ok) throw new Error("Téléchargement de la police échoué");
  return response.arrayBuffer();
}

export async function renderOgImage(event) {
  const tagline = (event.tagline || "Nous nous disons oui").toUpperCase();
  const date = event.wedding_date ? new Date(event.wedding_date) : null;
  const dateLabel =
    date && !Number.isNaN(date.getTime())
      ? new Intl.DateTimeFormat("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(date)
      : "";

  // Police serif chargée uniquement avec les caractères affichés ;
  // en cas d'échec réseau, l'image est servie avec la police par défaut.
  let fonts;
  try {
    const usedText = `${event.bride_name}${event.groom_name}&${dateLabel}`;
    fonts = [
      {
        name: "Cormorant Garamond",
        data: await loadGoogleFont("Cormorant+Garamond:ital,wght@1,500", usedText),
        style: "italic",
        weight: 500,
      },
    ];
  } catch {
    fonts = undefined;
  }

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
          backgroundColor: "#faf6ef",
          position: "relative",
        }}
      >
        {/* Halos décoratifs */}
        <div
          style={{
            position: "absolute",
            top: -140,
            left: -120,
            width: 420,
            height: 420,
            borderRadius: 999,
            backgroundColor: "rgba(232, 154, 141, 0.22)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -180,
            right: -140,
            width: 480,
            height: 480,
            borderRadius: 999,
            backgroundColor: "rgba(183, 105, 80, 0.16)",
          }}
        />

        {/* Arches */}
        <div
          style={{
            position: "absolute",
            top: 80,
            left: 360,
            width: 480,
            height: 560,
            border: "2px solid rgba(183, 105, 80, 0.4)",
            borderTopLeftRadius: 240,
            borderTopRightRadius: 240,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 112,
            left: 390,
            width: 420,
            height: 530,
            border: "1px solid rgba(183, 105, 80, 0.22)",
            borderTopLeftRadius: 210,
            borderTopRightRadius: 210,
          }}
        />

        {/* Contenu */}
        <div
          style={{
            display: "flex",
            fontSize: 21,
            letterSpacing: 9,
            color: "#b76950",
            marginBottom: 26,
          }}
        >
          {tagline}
        </div>

        <div
          style={{
            display: "flex",
            fontFamily: "Cormorant Garamond",
            fontStyle: "italic",
            fontSize: 74,
            color: "#3e2a21",
          }}
        >
          {event.bride_name}
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "Cormorant Garamond",
            fontStyle: "italic",
            fontSize: 42,
            color: "#b76950",
            margin: "4px 0",
          }}
        >
          &
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "Cormorant Garamond",
            fontStyle: "italic",
            fontSize: 74,
            color: "#3e2a21",
          }}
        >
          {event.groom_name}
        </div>

        {/* Ornement : filet — cœur — filet */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: 30,
            marginBottom: 24,
          }}
        >
          <div style={{ width: 84, height: 1, backgroundColor: "rgba(183, 105, 80, 0.55)" }} />
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="#b76950"
            style={{ margin: "0 16px" }}
          >
            <path d="M20.84 4.9a5.4 5.4 0 0 0-7.65 0L12 6.09 10.81 4.9a5.41 5.41 0 0 0-7.65 7.65l1.18 1.19L12 21.38l7.66-7.64 1.18-1.19a5.4 5.4 0 0 0 0-7.65Z" />
          </svg>
          <div style={{ width: 84, height: 1, backgroundColor: "rgba(183, 105, 80, 0.55)" }} />
        </div>

        {dateLabel ? (
          <div
            style={{
              display: "flex",
              fontFamily: "Cormorant Garamond",
              fontStyle: "italic",
              fontSize: 30,
              color: "#7a4a2f",
              textTransform: "capitalize",
            }}
          >
            {dateLabel}
          </div>
        ) : null}
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}
