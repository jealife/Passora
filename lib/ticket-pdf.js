import {
  PDFDocument,
  appendBezierCurve,
  clip,
  closePath,
  endPath,
  lineTo,
  moveTo,
  popGraphicsState,
  pushGraphicsState,
  rgb,
  setCharacterSpacing,
} from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import QRCode from "qrcode";
import { eventPalette } from "@/lib/theme";
import { formatDateFr, formatTimeFr } from "@/lib/utils";

/**
 * Billet d'entrée PDF d'un invité, habillé comme la page de l'événement :
 * couleurs du thème (lib/theme.js), polices du site (Cormorant Garamond et
 * Jost), photo d'accueil, et un design propre à chaque mise en page
 * (`TICKET_DESIGNS`, même clé que `layout_template`). Le QR code encode
 * l'identifiant du RSVP, lu par l'onglet "Scanner" de l'admin. La table n'y
 * figure volontairement pas : elle s'affiche au scan, à l'entrée.
 *
 * Généré côté navigateur, chargé à la demande (polices et fontkit pèsent) :
 * par l'invité juste après sa confirmation (Rsvp.jsx) et par l'admin pour
 * les confirmations plus anciennes (SeatingManager.jsx).
 */

// Format carte, haut et étroit : lisible en plein écran sur un téléphone,
// imprimable tel quel.
const W = 320;
const H = 640;
const CX = W / 2;
const CARD = { x: 16, y: 16, w: 288, h: 608, r: 20 };
const CARD_TOP = CARD.y + CARD.h;
const PERFORATION_Y = 214;

const FONT_FILES = {
  serif: "/fonts/ticket/cormorant-garamond-500-normal.ttf",
  serifItalic: "/fonts/ticket/cormorant-garamond-500-italic.ttf",
  sans: "/fonts/ticket/jost-400-normal.ttf",
  sansMedium: "/fonts/ticket/jost-500-normal.ttf",
};
const FLOWER_URL = "/images/themes/terracotta-floral/bouquet.png";
// Icône "heart" de components/ui/Icons.jsx (grille 24 × 24).
const HEART_PATH =
  "M20.84 4.9a5.4 5.4 0 0 0-7.65 0L12 6.09 10.81 4.9a5.41 5.41 0 0 0-7.65 7.65l1.18 1.19L12 21.38l7.66-7.64 1.18-1.19a5.4 5.4 0 0 0 0-7.65Z";

/* ------------------------------------------------------------------------ */
/* Chargement des ressources (navigateur)                                   */
/* ------------------------------------------------------------------------ */

const assetCache = new Map();

/**
 * Polices, photo d'accueil et décor du billet, chargés une seule fois par
 * événement : les billets suivants (écran Tables) se génèrent aussitôt.
 */
export function loadTicketAssets(event) {
  const key = [event.id, event.hero_image_url, event.layout_template].join("|");
  if (!assetCache.has(key)) {
    assetCache.set(
      key,
      fetchAssets(event).catch((err) => {
        assetCache.delete(key);
        throw err;
      }),
    );
  }
  return assetCache.get(key);
}

async function fetchAssets(event) {
  const [fontEntries, photo, flower] = await Promise.all([
    Promise.all(Object.entries(FONT_FILES).map(async ([key, url]) => [key, await fetchBytes(url)])),
    // Sans photo exploitable, le billet garde un en-tête coloré : jamais bloquant.
    event.hero_image_url
      ? loadImage(event.hero_image_url, { maxSize: 1200, type: "image/jpeg", quality: 0.85 }).catch(() => null)
      : null,
    event.layout_template === "terracotta-floral"
      ? loadImage(FLOWER_URL, { maxSize: 420, type: "image/png" }).catch(() => null)
      : null,
  ]);
  return { fonts: Object.fromEntries(fontEntries), photo, flower };
}

async function fetchBytes(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} : ${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
}

/**
 * Image réduite via un canvas : PDF léger à partager, et photo remise à
 * l'endroit selon ses données EXIF (photos prises au téléphone).
 */
async function loadImage(url, { maxSize, type, quality }) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} : ${response.status}`);
  const bitmap = await createImageBitmap(await response.blob());
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  const blob = await new Promise((resolve, reject) =>
    canvas.toBlob((result) => (result ? resolve(result) : reject(new Error("canvas"))), type, quality),
  );
  return { bytes: new Uint8Array(await blob.arrayBuffer()), type: type === "image/png" ? "png" : "jpg" };
}

/* ------------------------------------------------------------------------ */
/* Génération                                                               */
/* ------------------------------------------------------------------------ */

/**
 * `assets` (facultatif) : ressources déjà chargées ({ fonts, photo, flower }),
 * sinon chargées depuis le site via `loadTicketAssets`.
 */
export async function buildTicketPdf({ event, rsvp, venueName = "", assets }) {
  const { fonts: fontBytes, photo, flower } = assets || (await loadTicketAssets(event));
  const palette = eventPalette(event);
  const text = ticketText(event, rsvp, venueName);

  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setTitle(`Billet · ${text.couple || text.guest}`);
  doc.setAuthor("Passora");
  doc.setCreator("Passora");
  doc.setProducer("Passora");

  const fonts = Object.fromEntries(
    await Promise.all(
      Object.entries(fontBytes).map(async ([key, bytes]) => [key, await doc.embedFont(bytes, { subset: true })]),
    ),
  );
  const qrDataUrl = await QRCode.toDataURL(rsvp.id, {
    margin: 0,
    width: 480,
    errorCorrectionLevel: "M",
    color: { dark: palette.cocoa, light: "#ffffff" },
  });

  const ctx = {
    page: doc.addPage([W, H]),
    fonts,
    text,
    colors: ticketColors(palette),
    photo: photo ? await embedImage(doc, photo) : null,
    flower: flower ? await embedImage(doc, flower) : null,
    qr: await doc.embedPng(qrDataUrl.split(",")[1]),
  };

  const design = TICKET_DESIGNS[event.layout_template] || TICKET_DESIGNS.classic;
  design(ctx);

  return doc.save();
}

function embedImage(doc, { bytes, type }) {
  return type === "png" ? doc.embedPng(bytes) : doc.embedJpg(bytes);
}

function ticketText(event, rsvp, venueName) {
  const bride = (event.bride_name || "").trim();
  const groom = (event.groom_name || "").trim();
  const upper = (value) => value.toLocaleUpperCase("fr-FR");
  const date = event.wedding_date ? formatDateFr(event.wedding_date) : "";
  return {
    bride,
    groom,
    couple: [bride, groom].filter(Boolean).join(" & "),
    monogram: bride && groom ? `${upper(bride[0])} & ${upper(groom[0])}` : "",
    tagline: upper(event.tagline || "Nous nous disons oui"),
    date: date ? upper(date) + (event.date_confirmed ? "" : " (À CONFIRMER)") : "",
    detail: [event.wedding_date ? formatTimeFr(event.wedding_date) : "", venueName].filter(Boolean).join("  ·  "),
    guest: rsvp.guest_name || "",
  };
}

const hexToRgb = (value) => rgb(...[1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16) / 255));

function luminance(value) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ticketColors(palette) {
  // Le QR code et le texte foncé exigent une carte claire, même si le fond
  // du thème est sombre.
  const card = luminance(palette.cream) > 0.6 ? palette.cream : "#ffffff";
  // Aplat sous du texte clair : la couleur principale si elle est déjà assez
  // foncée (sa version "deep" tomberait au noir, ex. un vert émeraude),
  // sinon sa version foncée.
  const deep = luminance(palette.terracotta) <= 0.42 ? palette.terracotta : palette["rust-deep"];
  return {
    page: hexToRgb(palette.sand),
    card: hexToRgb(card),
    ink: hexToRgb(palette.cocoa),
    accent: hexToRgb(palette.terracotta),
    accentDeep: hexToRgb(deep),
    soft: hexToRgb(palette["blush-soft"]),
    white: rgb(1, 1, 1),
  };
}

/* ------------------------------------------------------------------------ */
/* Designs, un par mise en page                                             */
/* ------------------------------------------------------------------------ */

/** Classique : en-tête photo assombri, comme l'accueil du site. */
function drawClassicTicket(ctx) {
  const { page, fonts, colors, text, photo } = ctx;
  drawCard(ctx);

  const hero = { x: CARD.x, y: 324, width: CARD.w, height: CARD_TOP - 324 };
  withClip(page, roundedTopPath(hero.x, hero.y, hero.width, hero.height, CARD.r), () => {
    if (photo) {
      drawCover(page, photo, hero);
      page.drawRectangle({ ...hero, color: colors.ink, opacity: 0.45 });
    } else {
      page.drawRectangle({ ...hero, color: colors.accentDeep });
      for (const [w, h, opacity] of [
        [200, 236, 0.18],
        [244, 280, 0.1],
      ]) {
        page.drawSvgPath(archSvg(w, h), {
          x: CX - w / 2,
          y: hero.y + h,
          borderColor: colors.card,
          borderWidth: 0.8,
          borderOpacity: opacity,
        });
      }
    }
  });

  const light = colors.card;
  if (text.monogram) {
    drawCentered(page, text.monogram, { font: fonts.serifItalic, size: 13, y: 594, color: light, opacity: 0.9 });
  }
  drawCentered(page, text.tagline, {
    font: fonts.sansMedium,
    size: 7,
    y: 540,
    color: light,
    opacity: 0.9,
    spacing: 2.6,
    maxWidth: 240,
  });
  drawCentered(page, text.bride, { font: fonts.serif, size: 34, minSize: 20, y: 498, color: light, maxWidth: 240 });
  drawCentered(page, "&", { font: fonts.serifItalic, size: 24, y: 468, color: colors.soft });
  drawCentered(page, text.groom, { font: fonts.serif, size: 34, minSize: 20, y: 432, color: light, maxWidth: 240 });
  drawOrnament(page, { y: 408, color: light, opacity: 0.85 });
  if (text.date) {
    drawCentered(page, text.date, {
      font: fonts.sansMedium,
      size: 7.5,
      y: 382,
      color: light,
      spacing: 1.6,
      maxWidth: 250,
    });
  }
  if (text.detail) {
    drawCentered(page, text.detail, { font: fonts.sans, size: 9.5, y: 364, color: light, opacity: 0.9, maxWidth: 250 });
  }

  drawGuest(ctx, { labelY: 284, nameY: 254 });
  drawStub(ctx);
}

/** Terracotta floral : photo en arche, bouquet et teintes chaudes. */
function drawFloralTicket(ctx) {
  const { page, fonts, colors, text, photo, flower } = ctx;
  drawCard(ctx);

  const arch = { x: CX - 75, y: 426, width: 150, height: 172 };
  page.drawSvgPath(archSvg(arch.width + 14, arch.height + 7), {
    x: arch.x - 7,
    y: arch.y + arch.height + 7,
    borderColor: colors.accent,
    borderWidth: 0.8,
    borderOpacity: 0.7,
  });
  withClip(page, roundedTopPath(arch.x, arch.y, arch.width, arch.height, arch.width / 2), () => {
    if (photo) drawCover(page, photo, arch);
    else page.drawRectangle({ ...arch, color: colors.soft, opacity: 0.6 });
  });
  if (!photo && text.monogram) {
    drawCentered(page, text.monogram, { font: fonts.serifItalic, size: 30, y: arch.y + 62, color: colors.accentDeep });
  }
  if (flower) {
    const height = 124;
    const width = (height * flower.width) / flower.height;
    page.drawImage(flower, { x: arch.x - width * 0.55, y: arch.y - 12, width, height });
  }

  drawCentered(page, text.tagline, {
    font: fonts.sansMedium,
    size: 7,
    y: 396,
    color: colors.accent,
    spacing: 2.6,
    maxWidth: 240,
  });
  drawCoupleLine(page, fonts, text, { y: 366, color: colors.ink, ampColor: colors.accent });
  drawOrnament(page, { y: 346, color: colors.accent });
  if (text.date) {
    drawCentered(page, text.date, {
      font: fonts.sansMedium,
      size: 7.5,
      y: 324,
      color: colors.ink,
      opacity: 0.85,
      spacing: 1.6,
      maxWidth: 250,
    });
  }
  if (text.detail) {
    drawCentered(page, text.detail, { font: fonts.sans, size: 9.5, y: 307, color: colors.ink, opacity: 0.75, maxWidth: 250 });
  }

  drawGuest(ctx, { labelY: 274, nameY: 246 });
  drawStub(ctx);
}

const TICKET_DESIGNS = {
  classic: drawClassicTicket,
  "terracotta-floral": drawFloralTicket,
};

/* ------------------------------------------------------------------------ */
/* Éléments communs                                                         */
/* ------------------------------------------------------------------------ */

/** Fond, ombre douce et carte arrondie. */
function drawCard({ page, colors }) {
  const card = roundedRectSvg(CARD.w, CARD.h, CARD.r);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: colors.page });
  page.drawSvgPath(card, { x: CARD.x, y: CARD_TOP - 3, color: colors.ink, opacity: 0.08 });
  page.drawSvgPath(card, { x: CARD.x, y: CARD_TOP, color: colors.card });
}

function drawGuest({ page, fonts, colors, text }, { labelY, nameY }) {
  drawCentered(page, "INVITATION PERSONNELLE", {
    font: fonts.sansMedium,
    size: 7,
    y: labelY,
    color: colors.accent,
    spacing: 2.2,
  });
  drawCentered(page, text.guest, {
    font: fonts.serifItalic,
    size: 26,
    minSize: 12,
    y: nameY,
    color: colors.ink,
    maxWidth: CARD.w - 40,
  });
}

/** Talon détachable : pointillés, encoches et QR code. */
function drawStub({ page, fonts, colors, qr }) {
  const y = PERFORATION_Y;
  page.drawLine({
    start: { x: CARD.x + 18, y },
    end: { x: CARD.x + CARD.w - 18, y },
    thickness: 1,
    color: colors.ink,
    opacity: 0.25,
    dashArray: [3, 4],
  });
  for (const x of [CARD.x, CARD.x + CARD.w]) page.drawCircle({ x, y, size: 10, color: colors.page });

  const frame = 132;
  const padding = 10;
  const top = y - 22;
  page.drawSvgPath(roundedRectSvg(frame, frame, 14), {
    x: CX - frame / 2,
    y: top,
    color: colors.white,
    borderColor: colors.ink,
    borderWidth: 0.6,
    borderOpacity: 0.12,
  });
  page.drawImage(qr, {
    x: CX - frame / 2 + padding,
    y: top - frame + padding,
    width: frame - 2 * padding,
    height: frame - 2 * padding,
  });

  drawCentered(page, "Présentez ce QR code à l'entrée", {
    font: fonts.sans,
    size: 8.5,
    y: 44,
    color: colors.ink,
    opacity: 0.7,
  });
  drawCentered(page, "PASSORA", { font: fonts.sansMedium, size: 6, y: 28, color: colors.ink, opacity: 0.35, spacing: 2 });
}

/** Trait, cœur, trait : l'ornement des titres du site. */
function drawOrnament(page, { y, color, opacity = 1 }) {
  const scale = 0.42;
  page.drawLine({ start: { x: CX - 58, y }, end: { x: CX - 13, y }, thickness: 0.6, color, opacity: opacity * 0.6 });
  page.drawLine({ start: { x: CX + 13, y }, end: { x: CX + 58, y }, thickness: 0.6, color, opacity: opacity * 0.6 });
  page.drawSvgPath(HEART_PATH, {
    x: CX - 12 * scale,
    y: y + 13 * scale,
    scale,
    borderColor: color,
    borderWidth: 2.2,
    borderOpacity: opacity,
  });
}

/** "Virginie & Romaric" sur une ligne, l'esperluette en italique colorée. */
function drawCoupleLine(page, fonts, text, { y, color, ampColor }) {
  const amp = " & ";
  const maxWidth = 250;
  let size = 28;
  const widthAt = (s) =>
    fonts.serif.widthOfTextAtSize(text.bride, s) +
    fonts.serifItalic.widthOfTextAtSize(amp, s) +
    fonts.serif.widthOfTextAtSize(text.groom, s);
  while (size > 18 && widthAt(size) > maxWidth) size -= 0.5;
  let x = CX - widthAt(size) / 2;
  page.drawText(text.bride, { x, y, size, font: fonts.serif, color });
  x += fonts.serif.widthOfTextAtSize(text.bride, size);
  page.drawText(amp, { x, y, size, font: fonts.serifItalic, color: ampColor });
  x += fonts.serifItalic.widthOfTextAtSize(amp, size);
  page.drawText(text.groom, { x, y, size, font: fonts.serif, color });
}

/**
 * Texte centré, avec interlettrage facultatif (`spacing`, en points) et
 * réduction automatique jusqu'à `minSize` s'il dépasse `maxWidth`.
 */
function drawCentered(page, value, { font, size, minSize = size, maxWidth = Infinity, y, color, opacity, spacing = 0 }) {
  if (!value) return;
  const widthAt = (s) => font.widthOfTextAtSize(value, s) + spacing * Math.max(0, value.length - 1);
  let fitted = size;
  while (fitted > minSize && widthAt(fitted) > maxWidth) fitted -= 0.5;
  const options = { x: CX - widthAt(fitted) / 2, y, size: fitted, font, color, opacity };
  if (!spacing) return page.drawText(value, options);
  page.pushOperators(pushGraphicsState(), setCharacterSpacing(spacing));
  page.drawText(value, options);
  page.pushOperators(popGraphicsState());
}

/** Image en mode "cover" dans `box`, cadrée vers le haut (visages). */
function drawCover(page, image, box) {
  const scale = Math.max(box.width / image.width, box.height / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  page.drawImage(image, {
    x: box.x + (box.width - width) / 2,
    y: box.y + box.height - height + (height - box.height) * 0.3,
    width,
    height,
  });
}

/** Dessine `draw()` à l'intérieur du tracé `path` (opérateurs PDF). */
function withClip(page, path, draw) {
  page.pushOperators(pushGraphicsState(), ...path, clip(), endPath());
  draw();
  page.pushOperators(popGraphicsState());
}

/** Rectangle aux coins supérieurs arrondis (r = w / 2 : une arche). */
function roundedTopPath(x, y, w, h, r) {
  const k = 0.5523 * r;
  return [
    moveTo(x, y),
    lineTo(x + w, y),
    lineTo(x + w, y + h - r),
    appendBezierCurve(x + w, y + h - r + k, x + w - r + k, y + h, x + w - r, y + h),
    lineTo(x + r, y + h),
    appendBezierCurve(x + r - k, y + h, x, y + h - r + k, x, y + h - r),
    closePath(),
  ];
}

// Tracés SVG (origine en haut à gauche, axe y vers le bas) pour drawSvgPath.
const roundedRectSvg = (w, h, r) =>
  `M${r} 0H${w - r}A${r} ${r} 0 0 1 ${w} ${r}V${h - r}A${r} ${r} 0 0 1 ${w - r} ${h}H${r}A${r} ${r} 0 0 1 0 ${h - r}V${r}A${r} ${r} 0 0 1 ${r} 0Z`;

const archSvg = (w, h) => {
  const r = w / 2;
  return `M0 ${h}V${r}A${r} ${r} 0 0 1 ${w} ${r}V${h}`;
};
