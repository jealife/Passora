import { NextResponse } from "next/server";
import { findOrCreateUser, isEmail, jsonError, listAllUsers, requireAgency } from "@/lib/admin-auth";

/**
 * GET /api/admin/users — tous les comptes, avec leur rôle et leurs événements.
 * POST /api/admin/users — crée un compte { email, role } (ou signale qu'il existe).
 * Réservé à l'agence.
 */
export async function GET(request) {
  const auth = await requireAgency(request);
  if (auth.response) return auth.response;
  const { service } = auth;

  try {
    const [users, { data: events, error }] = await Promise.all([
      listAllUsers(service),
      // "*" : tolère une colonne encore absente (migration non appliquée).
      service.from("events").select("*"),
    ]);
    if (error) throw error;

    return NextResponse.json({
      ok: true,
      users: users
        .map((u) => ({
          id: u.id,
          email: u.email,
          role: u.app_metadata?.role === "agency" ? "agency" : "couple",
          createdAt: u.created_at,
          lastSignInAt: u.last_sign_in_at || null,
          events: (events || [])
            .filter((e) => e.owner_id === u.id)
            .map(({ id, slug, name, bride_name, groom_name, event_type }) => ({
              id,
              slug,
              name,
              bride_name,
              groom_name,
              event_type,
            })),
        }))
        .sort((a, b) => (a.role === b.role ? a.email.localeCompare(b.email) : a.role === "agency" ? -1 : 1)),
    });
  } catch (error) {
    console.error("admin users list error:", error?.message || error);
    return jsonError("Impossible de charger les comptes.", 500);
  }
}

export async function POST(request) {
  const auth = await requireAgency(request);
  if (auth.response) return auth.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Requête invalide.", 400);
  }
  const email = String(body?.email || "").trim().toLowerCase();
  const role = body?.role === "agency" ? "agency" : "couple";
  if (!isEmail(email)) return jsonError("Adresse email invalide.", 400);

  try {
    const { id, tempPassword } = await findOrCreateUser(auth.service, email, role);
    if (!tempPassword) return jsonError("Un compte existe déjà avec cet email.", 409);
    return NextResponse.json({ ok: true, id, email, tempPassword });
  } catch (error) {
    console.error("admin users create error:", error?.message || error);
    return jsonError("Le compte n'a pas pu être créé.", 500);
  }
}
