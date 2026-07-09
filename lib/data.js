import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  DEFAULT_EVENT,
  DEFAULT_GALLERY,
  DEFAULT_PROGRAM,
  DEFAULT_VENUES,
} from "@/lib/content";

/**
 * Charge toutes les données d'un événement (infos, programme, galerie, lieux).
 *
 * Architecture multi-événements : chaque table est rattachée à `event_id`,
 * un événement est identifié par son `slug`. La page d'accueil charge le
 * slug par défaut ; `/e/[slug]` permet d'en servir d'autres sans refonte.
 *
 * En l'absence de Supabase (ou d'événement trouvé), retombe sur le contenu
 * par défaut afin que la page reste toujours fonctionnelle.
 */
export async function getEventData(slug) {
  const fallback = {
    event: DEFAULT_EVENT,
    program: DEFAULT_PROGRAM,
    venues: DEFAULT_VENUES,
    gallery: DEFAULT_GALLERY,
    isFallback: true,
  };

  const supabase = getSupabaseServerClient();
  if (!supabase) return fallback;

  try {
    const { data: event, error } = await supabase
      .from("events")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !event) return fallback;

    const [programRes, venuesRes, galleryRes] = await Promise.all([
      supabase
        .from("program")
        .select("*")
        .eq("event_id", event.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("venues")
        .select("*")
        .eq("event_id", event.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("gallery")
        .select("*")
        .eq("event_id", event.id)
        .order("sort_order", { ascending: true }),
    ]);

    return {
      event: { ...DEFAULT_EVENT, ...stripNulls(event) },
      program: groupProgram(programRes.data) ?? DEFAULT_PROGRAM,
      venues: venuesRes.data?.length ? venuesRes.data : DEFAULT_VENUES,
      gallery: galleryRes.data?.length ? galleryRes.data : DEFAULT_GALLERY,
      isFallback: false,
    };
  } catch {
    return fallback;
  }
}

/** Regroupe les lignes plates de `program` par section, dans l'ordre. */
function groupProgram(rows) {
  if (!rows?.length) return null;
  const sections = [];
  const bySection = new Map();
  for (const row of rows) {
    if (!bySection.has(row.section)) {
      const section = { section: row.section, icon: row.icon || "rings", items: [] };
      bySection.set(row.section, section);
      sections.push(section);
    }
    bySection.get(row.section).items.push({ time: row.time, label: row.label });
  }
  return sections;
}

/** Évite qu'une colonne NULL en base n'écrase un texte par défaut. */
function stripNulls(row) {
  return Object.fromEntries(
    Object.entries(row).filter(([, value]) => value !== null && value !== ""),
  );
}
