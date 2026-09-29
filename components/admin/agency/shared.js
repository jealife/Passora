import { DEMO_EVENT_SLUGS } from "@/lib/layouts";

/**
 * Outils partagés par le tableau de bord de l'agence (`/admin`).
 */

/**
 * Champs des événements, avec les compteurs calculés par Supabase. `*`
 * plutôt qu'une liste : une colonne ajoutée par migration (ex. event_type)
 * n'empêche jamais le chargement si la migration n'est pas encore passée.
 */
export const EVENT_FIELDS = "*, guests(count), rsvp(count), checked:rsvp(count), gallery(count)";

const DAY = 86400000;

/** Appelle une route `/api/admin/*` avec le jeton de la session en cours. */
export async function agencyApi(supabase, path, { method = "GET", body } = {}) {
  const { data } = await supabase.auth.getSession();
  const response = await fetch(path, {
    method,
    headers: {
      Authorization: `Bearer ${data.session?.access_token || ""}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.ok) throw new Error(payload.error || "Une erreur est survenue.");
  return payload;
}

const countOf = (embedded) => embedded?.[0]?.count ?? 0;

/** Ligne brute de Supabase → événement prêt à afficher. */
export function normalizeEvent(row, now) {
  const time = row.wedding_date ? new Date(row.wedding_date).getTime() : null;
  const isDemo = DEMO_EVENT_SLUGS.includes(row.slug);
  // Un mariage reste "à venir" jusqu'au lendemain.
  const status = isDemo ? "demo" : time === null ? "undated" : time + DAY < now ? "past" : "upcoming";
  return {
    ...row,
    guests: countOf(row.guests),
    rsvp: countOf(row.rsvp),
    checked: countOf(row.checked),
    photos: countOf(row.gallery),
    isDemo,
    status,
    daysLeft: time === null ? null : Math.ceil((time - now) / DAY),
  };
}

/** "J-12", "Jour J", "Il y a 3 j"… */
export function countdownLabel(event) {
  if (event.daysLeft === null) return "Date à définir";
  if (event.daysLeft > 0) return `J-${event.daysLeft}`;
  if (event.daysLeft === 0) return "Jour J";
  return `Il y a ${-event.daysLeft} j`;
}

const relativeFormat = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });

/** "il y a 3 heures", "hier"… */
export function relativeTime(value, now) {
  const diff = new Date(value).getTime() - now;
  const minutes = Math.round(diff / 60000);
  if (Math.abs(minutes) < 60) return relativeFormat.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return relativeFormat.format(hours, "hour");
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return relativeFormat.format(days, "day");
  return new Date(value).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export const percent = (part, total) => (total ? Math.round((part / total) * 100) : 0);

/** Message prêt à envoyer au couple avec ses identifiants. */
export function credentialsMessage(email, password) {
  return [
    "Bonjour, voici votre accès à votre espace Passora :",
    `${window.location.origin}/admin`,
    `Email : ${email}`,
    `Mot de passe : ${password}`,
  ].join("\n");
}
