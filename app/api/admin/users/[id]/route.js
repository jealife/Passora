import { NextResponse } from "next/server";
import { generateTempPassword, jsonError, requireAgency } from "@/lib/admin-auth";

/**
 * PATCH /api/admin/users/:id
 *   { action: "reset-password" } → nouveau mot de passe temporaire (renvoyé une fois)
 *   { action: "set-role", role: "agency" | "couple" }
 * DELETE /api/admin/users/:id → supprime le compte ; ses événements restent,
 *   sans propriétaire (owner_id → null, voir supabase/schema.sql).
 * Réservé à l'agence, qui ne peut ni se rétrograder ni se supprimer elle-même.
 */
export async function PATCH(request, { params }) {
  const auth = await requireAgency(request);
  if (auth.response) return auth.response;
  const { id } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Requête invalide.", 400);
  }

  try {
    if (body?.action === "reset-password") {
      const tempPassword = generateTempPassword();
      const { error } = await auth.service.auth.admin.updateUserById(id, { password: tempPassword });
      if (error) throw error;
      return NextResponse.json({ ok: true, tempPassword });
    }

    if (body?.action === "set-role") {
      if (id === auth.user.id) return jsonError("Vous ne pouvez pas modifier votre propre rôle.", 400);
      // Supabase fusionne app_metadata : une clé absente serait conservée,
      // `null` la supprime.
      const { error } = await auth.service.auth.admin.updateUserById(id, {
        app_metadata: { role: body.role === "agency" ? "agency" : null },
      });
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    return jsonError("Action inconnue.", 400);
  } catch (error) {
    console.error("admin user update error:", error?.message || error);
    return jsonError("La modification n'a pas pu être enregistrée.", 500);
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAgency(request);
  if (auth.response) return auth.response;
  const { id } = await params;
  if (id === auth.user.id) return jsonError("Vous ne pouvez pas supprimer votre propre compte.", 400);

  const { error } = await auth.service.auth.admin.deleteUser(id);
  if (error) {
    console.error("admin user delete error:", error.message);
    return jsonError("Le compte n'a pas pu être supprimé.", 500);
  }
  return NextResponse.json({ ok: true });
}
