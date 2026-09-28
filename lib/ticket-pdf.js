import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import { formatDateFr, slugify } from "@/lib/utils";

/**
 * Génère le PDF du billet d'entrée d'un invité (format carte, A6) : nom des
 * mariés, date, nom de l'invité et un QR code qui encode l'identifiant du
 * RSVP, lu ensuite par l'onglet "Scanner" de l'admin. La table n'y figure
 * volontairement pas : elle s'affiche au scan, à l'entrée.
 * Fonctionne côté navigateur (pdf-lib et qrcode sont isomorphes) : pas de
 * route serveur nécessaire. Utilisé par l'invité juste après sa
 * confirmation (Rsvp.jsx) et par l'admin pour les confirmations plus
 * anciennes (SeatingManager.jsx).
 */
export async function buildTicketPdf({ event, rsvp }) {
  const gold = rgb(0.949, 0.651, 0.114); // --color-passora-gold
  const ink = rgb(0.106, 0.067, 0.031); // --color-passora-ink

  // A6 en points (72 dpi par pouce, 1 mm ≈ 2.8346 pt)
  const width = 297.6;
  const height = 419.5;

  const doc = await PDFDocument.create();
  const page = doc.addPage([width, height]);
  const serif = await doc.embedFont(StandardFonts.TimesRomanItalic);
  const sans = await doc.embedFont(StandardFonts.Helvetica);
  const sansBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const centerX = (text, font, size) => (width - font.widthOfTextAtSize(text, size)) / 2;
  const drawCentered = (text, { font, size, y, color = ink }) => {
    page.drawText(text, { x: centerX(text, font, size), y, size, font, color });
  };

  page.drawRectangle({ x: 0, y: height - 10, width, height: 10, color: gold });

  let y = height - 48;
  const coupleLine = `${event.bride_name || ""} & ${event.groom_name || ""}`.trim();
  if (coupleLine) {
    drawCentered(coupleLine, { font: serif, size: 19, y });
    y -= 20;
  }

  const dateLine = formatDateFr(event.wedding_date);
  if (dateLine) {
    drawCentered(dateLine, { font: sans, size: 9, y });
  }
  y -= 34;

  drawCentered("BILLET D'ENTREE", { font: sansBold, size: 8, y, color: gold });
  y -= 28;

  drawCentered(rsvp.guest_name || "", { font: sansBold, size: 16, y });
  y -= 30;

  const qrDataUrl = await QRCode.toDataURL(rsvp.id, { margin: 1, width: 400 });
  const qrImage = await doc.embedPng(qrDataUrl.split(",")[1]);
  const qrSize = 150;
  page.drawImage(qrImage, { x: (width - qrSize) / 2, y: y - qrSize, width: qrSize, height: qrSize });
  y -= qrSize + 24;

  drawCentered("Présentez ce billet à l'entrée", { font: sans, size: 10, y });

  drawCentered("Passora", { font: sans, size: 8, y: 18, color: ink });

  return doc.save();
}

/** Nom du fichier PDF d'un billet, ex. "billet-jean-mba.pdf". */
export const ticketFileName = (guestName) => `billet-${slugify(guestName || "invite")}.pdf`;

/** Déclenche le téléchargement d'un PDF déjà généré (bytes). */
export function downloadPdf(bytes, filename) {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Révocation différée : certains navigateurs mobiles lisent encore le blob
  // après le clic.
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/**
 * Vrai si le navigateur peut partager un fichier PDF via la feuille de
 * partage native (WhatsApp, e-mail, etc.) : mobiles récents, Safari macOS.
 */
export function canSharePdf() {
  if (typeof navigator === "undefined" || !navigator.canShare) return false;
  try {
    return navigator.canShare({ files: [new File([""], "billet.pdf", { type: "application/pdf" })] });
  } catch {
    return false;
  }
}

/**
 * Ouvre la feuille de partage du téléphone avec le PDF en pièce jointe.
 * Seul le fichier est transmis (pas de texte d'accompagnement) : certaines
 * applications ignorent la pièce jointe quand un texte l'accompagne.
 * Si le partage est refusé par le navigateur, le PDF est téléchargé à la
 * place ; une annulation par l'utilisateur ne déclenche rien.
 */
export async function sharePdf(bytes, filename, title) {
  const file = new File([bytes], filename, { type: "application/pdf" });
  try {
    await navigator.share({ files: [file], title });
  } catch (err) {
    if (err?.name !== "AbortError") downloadPdf(bytes, filename);
  }
}
