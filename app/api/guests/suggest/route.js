import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { DEFAULT_EVENT_SLUG } from "@/lib/content";
import { normalizeName } from "@/lib/utils";

/**
 * GET /api/guests/suggest?q=jae&slug=myrna-jael
 *
 * Autocomplétion du formulaire RSVP : renvoie au plus 6 noms de la liste
 * des invités correspondant à la saisie (insensible aux accents et à la
 * casse). La liste complète n'est jamais exposée : il faut au moins
 * 2 caractères et seules les correspondances sont renvoyées.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = normalizeName(searchParams.get("q") || "");
  const slug = searchParams.get("slug") || DEFAULT_EVENT_SLUG;

  if (query.length < 2) return NextResponse.json({ suggestions: [] });

  const supabase = getSupabaseServiceClient();
  if (!supabase) return NextResponse.json({ suggestions: [] });

  try {
    const { data: event } = await supabase
      .from("events")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!event) return NextResponse.json({ suggestions: [] });

    const { data: guests, error } = await supabase
      .from("guests")
      .select("full_name")
      .eq("event_id", event.id);
    if (error) throw error;

    const suggestions = (guests || [])
      .map((guest) => ({
        name: guest.full_name,
        // position de la correspondance : les noms qui commencent par la
        // saisie remontent en premier
        index: normalizeName(guest.full_name).indexOf(query),
      }))
      .filter((entry) => entry.index !== -1)
      .sort((a, b) => a.index - b.index || a.name.localeCompare(b.name, "fr"))
      .slice(0, 6)
      .map((entry) => entry.name);

    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
