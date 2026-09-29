import { LAYOUT_TEMPLATES } from "@/lib/layouts";

/**
 * Types d'événements proposés par Passora (colonne `events.event_type`,
 * migration 012). La structure de l'administration est commune à tous ;
 * ce qui change d'un type à l'autre, c'est le vocabulaire et le design de
 * la page publique (ses modèles, voir lib/layouts.js).
 *
 * - `couple` : l'événement se nomme par deux prénoms (mariés), sinon par
 *   son nom (`events.name`).
 * - `tagline` : accroche par défaut (page, billet).
 * - `audience` / `countdown` : formulations de l'accueil de l'espace client.
 */
export const EVENT_TYPES = [
  {
    id: "wedding",
    label: "Mariage",
    icon: "rings",
    couple: true,
    tagline: "Nous nous disons oui",
    audience: "futurs mariés",
    countdown: "avant le oui",
  },
  {
    id: "birthday",
    label: "Anniversaire",
    icon: "gift",
    tagline: "Venez fêter avec nous",
    audience: "",
    countdown: "avant la fête",
  },
  {
    id: "baptism",
    label: "Baptême",
    icon: "heart",
    tagline: "Célébrons ensemble",
    audience: "",
    countdown: "avant la cérémonie",
  },
  {
    id: "reception",
    label: "Réception & soirée",
    icon: "glass",
    tagline: "Vous êtes invités",
    audience: "",
    countdown: "avant la soirée",
  },
  {
    id: "concert",
    label: "Concert",
    icon: "music",
    tagline: "En concert",
    audience: "",
    countdown: "avant le concert",
  },
  {
    id: "masterclass",
    label: "Masterclass",
    icon: "pencil",
    tagline: "Masterclass",
    audience: "",
    countdown: "avant la session",
  },
  {
    id: "conference",
    label: "Conférence & séminaire",
    icon: "users",
    tagline: "Conférence",
    audience: "",
    countdown: "avant l'événement",
  },
];

export const DEFAULT_EVENT_TYPE = "wedding";

/** Type d'un événement (mariage pour les événements créés avant la migration 012). */
export function eventTypeOf(event) {
  return EVENT_TYPES.find((type) => type.id === event?.event_type) || EVENT_TYPES[0];
}

/** Modèles de page publique disponibles pour un type d'événement. */
export const templatesFor = (typeId) => LAYOUT_TEMPLATES.filter((template) => template.eventType === typeId);

/** Vrai si au moins un modèle de page existe pour le type de cet événement. */
export const hasTemplate = (event) => templatesFor(eventTypeOf(event).id).length > 0;

/** Nom d'affichage : "Awa & Ibrahima" pour un mariage, le nom de l'événement sinon. */
export function eventTitle(event) {
  if (eventTypeOf(event).couple) {
    const couple = [event.bride_name, event.groom_name].filter(Boolean).join(" & ");
    if (couple) return couple;
  }
  return event.name || event.slug || "";
}

/** Initiales pour les monogrammes : "A&I" ou les deux premières lettres du nom. */
export function eventInitials(event) {
  if (eventTypeOf(event).couple && event.bride_name && event.groom_name) {
    return `${event.bride_name[0]}&${event.groom_name[0]}`.toUpperCase();
  }
  const words = (event.name || event.slug || "?").split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words[0][0] + words[1][0] : words[0].slice(0, 2)).toUpperCase();
}
