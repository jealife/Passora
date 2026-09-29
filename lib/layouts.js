/**
 * Modèles de mise en page disponibles (voir components/WeddingPage.jsx,
 * l'aiguilleur qui choisit le composant à rendre selon `layout_template`).
 * Affichés dans l'admin (agence uniquement, comme le thème de couleurs).
 */
export const LAYOUT_TEMPLATES = [
  {
    id: "classic",
    name: "Classique",
    description: "Le modèle historique de Passora : arches et compositions terracotta.",
    demoSlug: "exemple-classique",
  },
  {
    id: "terracotta-floral",
    name: "Terracotta floral",
    description: "Citation d'ouverture, parents des mariés, frise verticale, code vestimentaire, cadeaux.",
    demoSlug: "exemple-terracotta-floral",
  },
];

/** Événements de démonstration (liés depuis la vitrine), un par modèle. */
export const DEMO_EVENT_SLUGS = LAYOUT_TEMPLATES.map((template) => template.demoSlug);
