import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getSupabaseServerClient, getSupabaseServiceClient } from "@/lib/supabase/server";
import { isRateLimited } from "@/lib/rate-limit";

/**
 * POST /api/admin/create-event — réservé à l'agence.
 *
 * Crée l'événement et, si besoin, le compte Supabase Auth du couple
 * propriétaire. Passe par le serveur car créer un utilisateur exige la clé
 * service role, qui ne doit jamais être exposée au navigateur.
 */
export async function POST(request) {
  if (await isRateLimited(request, "admin-create-event", 5, 60)) {
    return NextResponse.json(
      { ok: false, error: "Trop de tentatives. Merci de réessayer dans une minute." },
      { status: 429 },
    );
  }

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return NextResponse.json({ ok: false, error: "Non authentifié." }, { status: 401 });
  }

  const authClient = getSupabaseServerClient();
  const serviceClient = getSupabaseServiceClient();
  if (!authClient || !serviceClient) {
    return NextResponse.json({ ok: false, error: "Supabase n'est pas configuré." }, { status: 503 });
  }

  const { data: { user }, error: userError } = await authClient.auth.getUser(token);
  if (userError || !user || user.app_metadata?.role !== "agency") {
    return NextResponse.json({ ok: false, error: "Accès réservé à l'agence." }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const brideName = String(body?.brideName || "").trim();
  const groomName = String(body?.groomName || "").trim();
  const slug = String(body?.slug || "").trim();
  const ownerEmail = String(body?.ownerEmail || "").trim().toLowerCase();

  if (!brideName || !groomName || !slug || !ownerEmail) {
    return NextResponse.json(
      { ok: false, error: "Merci de renseigner les deux prénoms, un lien et un email." },
      { status: 400 },
    );
  }

  try {
    // Réutilise un compte existant pour cet email (le même couple peut
    // posséder plusieurs événements) plutôt que d'échouer sur "déjà inscrit".
    // Pagine plutôt qu'un unique appel à 1000 comptes, qui manquerait
    // silencieusement tout compte créé au-delà.
    let ownerId = await findUserIdByEmail(serviceClient, ownerEmail);
    let tempPassword = null;

    if (!ownerId) {
      tempPassword = randomBytes(9).toString("base64url");
      const { data: created, error: createUserError } = await serviceClient.auth.admin.createUser({
        email: ownerEmail,
        password: tempPassword,
        email_confirm: true,
      });
      if (createUserError) throw createUserError;
      ownerId = created.user.id;
    }

    const { data: event, error: insertError } = await serviceClient
      .from("events")
      .insert({
        slug,
        bride_name: brideName,
        groom_name: groomName,
        name: `Mariage de ${brideName} & ${groomName}`,
        owner_id: ownerId,
      })
      .select("slug")
      .single();

    if (insertError) {
      return NextResponse.json(
        insertError.code === "23505"
          ? { ok: false, error: "Ce lien est déjà utilisé, choisissez-en un autre." }
          : { ok: false, error: `Erreur : ${insertError.message}` },
        { status: insertError.code === "23505" ? 409 : 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      slug: event.slug,
      tempPassword,
      existingAccount: !tempPassword,
    });
  } catch (error) {
    console.error("create-event error:", error?.message || error);
    return NextResponse.json(
      { ok: false, error: "Une erreur est survenue. Merci de réessayer." },
      { status: 500 },
    );
  }
}

/** Recherche un compte Supabase Auth par email, page par page. */
async function findUserIdByEmail(serviceClient, email) {
  const perPage = 1000;
  for (let page = 1; ; page += 1) {
    const { data, error } = await serviceClient.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const match = data.users.find((u) => u.email?.toLowerCase() === email);
    if (match) return match.id;

    if (data.users.length < perPage) return undefined;
  }
}
