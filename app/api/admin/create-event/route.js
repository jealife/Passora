import { NextResponse } from "next/server";
import { findOrCreateUser, isEmail, jsonError, requireAgency } from "@/lib/admin-auth";
import { DEFAULT_EVENT_TYPE, EVENT_TYPES, templatesFor } from "@/lib/event-types";
import { isRateLimited } from "@/lib/rate-limit";

/**
 * POST /api/admin/create-event — réservé à l'agence.
 *
 * Crée l'événement (de n'importe quel type, voir lib/event-types.js) et,
 * si besoin, le compte Supabase Auth du client propriétaire (même client =
 * même compte pour plusieurs événements).
 */
export async function POST(request) {
  if (await isRateLimited(request, "admin-create-event", 5, 60)) {
    return jsonError("Trop de tentatives. Merci de réessayer dans une minute.", 429);
  }

  const auth = await requireAgency(request);
  if (auth.response) return auth.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Requête invalide.", 400);
  }

  const type = EVENT_TYPES.find((t) => t.id === body?.eventType) || EVENT_TYPES[0];
  const brideName = type.couple ? String(body?.brideName || "").trim() : "";
  const groomName = type.couple ? String(body?.groomName || "").trim() : "";
  const title = type.couple ? `Mariage de ${brideName} & ${groomName}` : String(body?.title || "").trim();
  const slug = String(body?.slug || "").trim();
  const ownerEmail = String(body?.ownerEmail || "").trim().toLowerCase();
  // Premier modèle du type par défaut ; aucun pour un type encore sans modèle.
  const templates = templatesFor(type.id);
  const layoutTemplate = templates.some((t) => t.id === body?.layoutTemplate)
    ? body.layoutTemplate
    : templates[0]?.id;

  if (type.couple ? !brideName || !groomName : !title) {
    return jsonError(type.couple ? "Merci de renseigner les deux prénoms." : "Merci de donner un nom à l'événement.", 400);
  }
  if (!slug || !ownerEmail) return jsonError("Merci de renseigner un lien et un email.", 400);
  if (!isEmail(ownerEmail)) return jsonError("Adresse email invalide.", 400);

  try {
    const owner = await findOrCreateUser(auth.service, ownerEmail, "couple");

    const { data: event, error: insertError } = await auth.service
      .from("events")
      .insert({
        slug,
        bride_name: brideName,
        groom_name: groomName,
        name: title,
        owner_id: owner.id,
        ...(layoutTemplate ? { layout_template: layoutTemplate } : {}),
        // Colonne ajoutée par la migration 012 ; un mariage garde la valeur par défaut.
        ...(type.id !== DEFAULT_EVENT_TYPE ? { event_type: type.id } : {}),
      })
      .select("slug")
      .single();

    if (insertError) {
      return insertError.code === "23505"
        ? jsonError("Ce lien est déjà utilisé, choisissez-en un autre.", 409)
        : jsonError(`Erreur : ${insertError.message}`, 500);
    }

    return NextResponse.json({
      ok: true,
      slug: event.slug,
      tempPassword: owner.tempPassword,
      existingAccount: !owner.tempPassword,
    });
  } catch (error) {
    console.error("create-event error:", error?.message || error);
    return jsonError("Une erreur est survenue. Merci de réessayer.", 500);
  }
}
