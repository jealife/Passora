import ClassicLayout from "@/components/ClassicLayout";
import TerracottaFloralLayout from "@/components/TerracottaFloralLayout";

/**
 * Aiguilleur entre les mises en page complètes d'un événement.
 * Utilisée par la page d'accueil et par /e/[slug] (multi-événements).
 *
 * `event.layout_template` ("classic" par défaut) sélectionne la mise en
 * page ; de nouveaux modèles (botanique vert, …) s'ajouteront ici au fur
 * et à mesure de leur construction.
 */
export default function WeddingPage({ data }) {
  switch (data.event.layout_template) {
    case "terracotta-floral":
      return <TerracottaFloralLayout data={data} />;
    default:
      return <ClassicLayout data={data} />;
  }
}
