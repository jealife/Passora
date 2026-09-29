/**
 * Modèles de mise en page disponibles, chacun rattaché à un type
 * d'événement (`eventType`, voir lib/event-types.js). L'aiguilleur
 * components/WeddingPage.jsx choisit le composant selon `layout_template`.
 * Affichés dans l'admin (agence uniquement, comme le thème de couleurs).
 */
export const LAYOUT_TEMPLATES = [
  {
    id: "classic",
    name: "Classique",
    description: "Le modèle historique de Passora : arches et compositions terracotta.",
    eventType: "wedding",
    demoSlug: "exemple-classique",
  },
  {
    id: "terracotta-floral",
    name: "Terracotta floral",
    description: "Citation d'ouverture, parents des mariés, frise verticale, code vestimentaire, cadeaux.",
    eventType: "wedding",
    demoSlug: "exemple-terracotta-floral",
  },
];

/** Événements de démonstration (liés depuis la vitrine), un par modèle. */
export const DEMO_EVENT_SLUGS = LAYOUT_TEMPLATES.map((template) => template.demoSlug);
