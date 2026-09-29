import { NextResponse } from "next/server";
import { findOrCreateUser, isEmail, jsonError, requireAgency } from "@/lib/admin-auth";
import { LAYOUT_TEMPLATES } from "@/lib/layouts";
import { isRateLimited } from "@/lib/rate-limit";

/**
 * POST /api/admin/create-event — réservé à l'agence.
 *
 * Crée l'événement et, si besoin, le compte Supabase Auth du couple
 * propriétaire (même couple = même compte pour plusieurs événements).
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

  const brideName = String(body?.brideName || "").trim();
  const groomName = String(body?.groomName || "").trim();
  const slug = String(body?.slug || "").trim();
  const ownerEmail = String(body?.ownerEmail || "").trim().toLowerCase();
  const layoutTemplate = LAYOUT_TEMPLATES.some((t) => t.id === body?.layoutTemplate)
    ? body.layoutTemplate
    : LAYOUT_TEMPLATES[0].id;

  if (!brideName || !groomName || !slug || !ownerEmail) {
    return jsonError("Merci de renseigner les deux prénoms, un lien et un email.", 400);
  }
  if (!isEmail(ownerEmail)) return jsonError("Adresse email invalide.", 400);

  try {
    const owner = await findOrCreateUser(auth.service, ownerEmail, "couple");

    const { data: event, error: insertError } = await auth.service
      .from("events")
      .insert({
        slug,
        bride_name: brideName,
        groom_name: groomName,
        name: `Mariage de ${brideName} & ${groomName}`,
        owner_id: owner.id,
        layout_template: layoutTemplate,
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
