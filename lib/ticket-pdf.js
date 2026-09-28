import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import { formatDateFr } from "@/lib/utils";

/**
 * Génère le PDF du billet d'entrée d'un invité (format carte, A6) : nom des
 * mariés, date, nom de l'invité et un QR code qui encode l'identifiant du
 * RSVP, lu ensuite par l'onglet "Scanner" de l'admin. La table n'y figure
 * volontairement pas : elle s'affiche au scan, à l'entrée.
 * Fonctionne côté navigateur (pdf-lib et qrcode sont isomorphes) : pas de
 * route serveur nécessaire, le PDF est généré et téléchargé directement,
 * comme l'export CSV déjà en place dans RsvpList.jsx.
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

/** Déclenche le téléchargement d'un PDF déjà généré (bytes). */
export function downloadPdf(bytes, filename) {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
