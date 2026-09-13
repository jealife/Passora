/** URL publique du site (sans slash final) — définie dans .env pour les partages sociaux. */
export function getSiteUrl() {
  const value = process.env.NEXT_PUBLIC_SITE_URL;
  return value && value.startsWith("http") ? value.replace(/\/$/, "") : "http://localhost:3000";
}

/** Normalise un nom pour comparaison : minuscules, sans accents, espaces réduits. */
export function normalizeName(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** "Myrna Rychka & Jaël Fidèle" -> "myrna-rychka-jael-fidele" */
export function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** "2026-09-12T08:00:00" -> "samedi 12 septembre 2026" */
export function formatDateFr(dateInput) {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** "2026-09-12T08:00:00" -> "08h00" */
export function formatTimeFr(dateInput) {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(date)
    .replace(":", "h");
}

export function classNames(...values) {
  return values.filter(Boolean).join(" ");
}
