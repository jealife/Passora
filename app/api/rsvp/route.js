import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { DEFAULT_EVENT_SLUG } from "@/lib/content";
import { normalizeName } from "@/lib/utils";

/**
 * POST /api/rsvp — confirmation de présence.
 *
 * 1. Vérifie que le nom saisi figure dans la liste des invités (table
 *    `guests`, jamais exposée au client : la requête passe par la clé
 *    service role, côté serveur uniquement).
 * 2. Enregistre (ou met à jour) la réponse dans la table `rsvp`.
 */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const name = String(body?.name || "").trim();
  const message = String(body?.message || "").trim().slice(0, 2000);
  const slug = String(body?.slug || DEFAULT_EVENT_SLUG);

  if (normalizeName(name).length < 2) {
    return NextResponse.json(
      { ok: false, error: "Merci d'indiquer votre nom complet." },
      { status: 400 },
    );
  }

  const supabase = getSupabaseServiceClient();

  // Mode démonstration : Supabase n'est pas encore configuré.
  if (!supabase) {
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json({
        ok: true,
        guestName: name.split(/\s+/)[0],
        demo: true,
      });
    }
    return NextResponse.json(
      { ok: false, error: "Les confirmations ne sont pas encore ouvertes. Réessayez bientôt." },
      { status: 503 },
    );
  }

  try {
    const { data: event } = await supabase
      .from("events")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!event) {
      return NextResponse.json(
        { ok: false, error: "Événement introuvable." },
        { status: 404 },
      );
    }

    const { data: guests, error: guestsError } = await supabase
      .from("guests")
      .select("id, full_name")
      .eq("event_id", event.id);

    if (guestsError) throw guestsError;

    const guest = matchGuest(name, guests || []);
    if (guest === "ambiguous") {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Plusieurs invités correspondent à ce nom. Merci de préciser votre prénom et votre nom complets.",
        },
        { status: 409 },
      );
    }
    if (!guest) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Nous ne retrouvons pas ce nom sur la liste des invités. Vérifiez l'orthographe (telle qu'elle figure sur votre invitation) ou contactez les mariés.",
        },
        { status: 404 },
      );
    }

    const { error: upsertError } = await supabase.from("rsvp").upsert(
      {
        event_id: event.id,
        guest_id: guest.id,
        guest_name: guest.full_name,
        message: message || null,
        attending: true,
      },
      { onConflict: "event_id,guest_id" },
    );

    if (upsertError) throw upsertError;

    return NextResponse.json({
      ok: true,
      guestName: guest.full_name.split(/\s+/)[0],
    });
  } catch (error) {
    console.error("RSVP error:", error?.message || error);
    return NextResponse.json(
      { ok: false, error: "Une erreur est survenue. Merci de réessayer dans un instant." },
      { status: 500 },
    );
  }
}

/**
 * Recherche l'invité correspondant au nom saisi :
 * correspondance exacte (sans accents ni casse), puis inclusion
 * dans un sens ou dans l'autre ("Jaël F." ~ "Jael Fidèle").
 * Retourne "ambiguous" si plusieurs invités correspondent.
 */
function matchGuest(input, guests) {
  const query = normalizeName(input);
  if (!query) return null;

  const exact = guests.filter((g) => normalizeName(g.full_name) === query);
  if (exact.length === 1) return exact[0];
  if (exact.length > 1) return "ambiguous";

  const partial = guests.filter((g) => {
    const full = normalizeName(g.full_name);
    return full.includes(query) || query.includes(full);
  });
  if (partial.length === 1) return partial[0];
  if (partial.length > 1) return "ambiguous";

  return null;
}
