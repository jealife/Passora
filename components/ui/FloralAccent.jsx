/**
 * Motif botanique décoratif en SVG (traits fins), dans `currentColor` —
 * hérite donc automatiquement de la couleur du thème de l'événement,
 * comme `Ornament.jsx`. Utilisé en coin de section sur les modèles qui
 * veulent une touche florale (ex. TerracottaFloralLayout).
 *
 * Ce n'est pas une reproduction des illustrations aquarelle d'une
 * maquette de référence (aucun outil de génération d'image dans cet
 * environnement) — juste un sprig botanique au trait, dans le même
 * esprit.
 */
export default function FloralAccent({ className = "h-24 w-24 text-terracotta" }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {/* Tige principale */}
      <path d="M10 110C40 90 55 65 58 30" opacity="0.85" />
      {/* Feuilles */}
      <path d="M22 96c8-2 14-8 16-16-8 1-15 6-16 16Z" opacity="0.55" fill="currentColor" stroke="none" />
      <path d="M34 78c8-1 15-6 17-14-8 0-16 4-17 14Z" opacity="0.45" fill="currentColor" stroke="none" />
      <path d="M46 58c7-2 12-8 13-15-7 1-13 6-13 15Z" opacity="0.4" fill="currentColor" stroke="none" />
      {/* Petites fleurs (5 pétales simplifiés) */}
      <g opacity="0.9">
        <circle cx="58" cy="26" r="3.2" />
        <circle cx="52" cy="20" r="3.2" />
        <circle cx="64" cy="20" r="3.2" />
        <circle cx="52" cy="30" r="3.2" />
        <circle cx="64" cy="30" r="3.2" />
        <circle cx="58" cy="25" r="2.4" fill="currentColor" stroke="none" />
      </g>
      <g opacity="0.5">
        <circle cx="38" cy="66" r="2.2" />
        <circle cx="34" cy="61" r="2.2" />
        <circle cx="42" cy="61" r="2.2" />
        <circle cx="38" cy="65" r="1.6" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}
