import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { DEFAULT_EVENT_SLUG } from "@/lib/content";
import { normalizeName } from "@/lib/utils";
import { isRateLimited } from "@/lib/rate-limit";

/**
 * GET /api/guests/suggest?q=jae&slug=myrna-jael
 *
 * Autocomplétion du formulaire RSVP : renvoie au plus 6 noms de la liste
 * des invités dont un des mots (prénom ou nom) commence par la saisie
 * (insensible aux accents et à la casse). La liste complète n'est jamais
 * exposée : il faut au moins 3 caractères, la correspondance est en
 * préfixe (pas "contient") pour limiter ce qu'une recherche par force
 * brute peut en extraire, et la route est limitée en fréquence (voir
 * lib/rate-limit.js).
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = normalizeName(searchParams.get("q") || "");
  const slug = searchParams.get("slug") || DEFAULT_EVENT_SLUG;

  if (query.length < 3) return NextResponse.json({ suggestions: [] });

  const limited = await isRateLimited(request, "guests-suggest", 20, 60);
  if (limited) return NextResponse.json({ suggestions: [] }, { status: 429 });

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
      .map((guest) => {
        const words = normalizeName(guest.full_name).split(" ");
        // position du mot (prénom, nom...) qui commence par la saisie : un
        // prénom qui correspond remonte avant un nom de famille qui correspond
        return { name: guest.full_name, wordIndex: words.findIndex((w) => w.startsWith(query)) };
      })
      .filter((entry) => entry.wordIndex !== -1)
      .sort((a, b) => a.wordIndex - b.wordIndex || a.name.localeCompare(b.name, "fr"))
      .slice(0, 6)
      .map((entry) => entry.name);

    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
