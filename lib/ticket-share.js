import { slugify } from "@/lib/utils";

/**
 * Remise du billet PDF à l'utilisateur : téléchargement ou feuille de
 * partage native du téléphone. Module volontairement léger, importé
 * directement par les écrans ; la génération du PDF (lib/ticket-pdf.js,
 * polices et bibliothèques plus lourdes) n'est chargée qu'à la demande.
 */

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
