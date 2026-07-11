/**
 * Contenu par défaut de l'événement.
 *
 * Utilisé comme solution de repli lorsque Supabase n'est pas configuré
 * (démo locale) ou momentanément injoignable : la page reste toujours
 * présentable. Une fois Supabase branché (voir supabase/schema.sql),
 * tout ce contenu est administrable depuis /admin.
 */

export const DEFAULT_EVENT_SLUG =
  process.env.NEXT_PUBLIC_DEFAULT_EVENT_SLUG || "myrna-jael";

export const DEFAULT_EVENT = {
  id: null,
  slug: "myrna-jael",
  name: "Mariage de Myrna & Jaël",
  bride_name: "Myrna Rychka",
  groom_name: "Jael Fidèle",
  tagline: "Nous nous disons oui",
  // Date provisoire — à confirmer par les mariés (modifiable dans l'admin).
  wedding_date: "2026-09-12T08:00:00",
  date_confirmed: false,
  hero_image_url: "",
  story_title: "Notre histoire",
  story_text:
    "Une personne peut tomber, deux peuvent se relever, mais trois liés par Dieu deviennent difficiles à briser.",
  story_audio_url: "/audio/ambiance.mp3",
  footer_message:
    "Une urne nuptiale sera mise à votre disposition. Votre présence à nos côtés sera notre plus beau cadeau.",
};

export const DEFAULT_PROGRAM = [
  {
    section: "Cérémonie coutumière",
    icon: "kola",
    items: [
      { time: "08h00", label: "Arrivée de la famille du futur marié" },
      { time: "08h30", label: "Début des pourparlers" },
      { time: "12h00", label: "Fin des pourparlers" },
      { time: "12h15", label: "Séance photo et cocktail" },
    ],
  },
  {
    section: "Cérémonie civile",
    icon: "rings",
    items: [
      { time: "14h00", label: "Arrivée des invités" },
      { time: "14h25", label: "Arrivée du futur marié" },
      { time: "14h35", label: "Arrivée de la future mariée" },
      { time: "14h50", label: "Arrivée du Maire" },
      { time: "15h00", label: "Début de la cérémonie civile" },
      { time: "15h45", label: "Séance photo et cocktail" },
    ],
  },
  {
    section: "Réception",
    icon: "glass",
    items: [
      { time: "19h00", label: "Arrivée des invités" },
      { time: "19h15", label: "Séance photo" },
      { time: "20h00", label: "Entrée des mariés dans la salle" },
      { time: "21h45", label: "Présentation de la pièce montée" },
      { time: "22h00", label: "Ouverture du bal" },
    ],
  },
];

export const DEFAULT_VENUES = [
  {
    title: "Mariage coutumier",
    name: "L'Olivier Fleuri",
    address: "Alibandeng, Trois Manguiers",
    maps_url:
      "https://www.google.com/maps/search/?api=1&query=L%27Olivier%20Fleuri%20Alibandeng%20Trois%20Manguiers",
    maps_embed_url:
      "https://www.google.com/maps?q=L%27Olivier%20Fleuri%20Alibandeng%20Trois%20Manguiers&output=embed",
  },
  {
    title: "Mariage civil",
    name: "Salle Les Pas Joyeux",
    address: "Salle Les Pas Joyeux",
    maps_url:
      "https://www.google.com/maps/search/?api=1&query=Salle%20Les%20Pas%20Joyeux",
    maps_embed_url:
      "https://www.google.com/maps?q=Salle%20Les%20Pas%20Joyeux&output=embed",
  },
];

// Illustrations décoratives affichées tant que les mariés n'ont pas
// téléversé leurs propres photos depuis l'administration.
export const DEFAULT_GALLERY = [
  { url: "/images/gallery/art-1.svg", alt: "Arches terracotta" },
  { url: "/images/gallery/art-2.svg", alt: "Soleil champagne" },
  { url: "/images/gallery/art-3.svg", alt: "Branche d'olivier" },
  { url: "/images/gallery/art-4.svg", alt: "Monogramme des mariés" },
  { url: "/images/gallery/art-5.svg", alt: "Collines rouille" },
  { url: "/images/gallery/art-6.svg", alt: "Bouquet abstrait" },
];
