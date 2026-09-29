import { NextResponse } from "next/server";
import { findOrCreateUser, isEmail, jsonError, requireAgency } from "@/lib/admin-auth";

const BUCKET = "wedding";

/**
 * PATCH /api/admin/events/:id { ownerEmail } → confie l'événement au compte
 *   de cet email (créé au besoin, mot de passe temporaire renvoyé une fois) ;
 *   email vide = retirer le propriétaire.
 * DELETE /api/admin/events/:id → supprime l'événement, ses données (en
 *   cascade : programme, lieux, galerie, invités, réponses) et ses fichiers.
 * Réservé à l'agence.
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
  const email = String(body?.ownerEmail || "").trim().toLowerCase();
  if (email && !isEmail(email)) return jsonError("Adresse email invalide.", 400);

  try {
    const owner = email ? await findOrCreateUser(auth.service, email, "couple") : { id: null, tempPassword: null };
    const { error } = await auth.service.from("events").update({ owner_id: owner.id }).eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true, tempPassword: owner.tempPassword });
  } catch (error) {
    console.error("admin event owner error:", error?.message || error);
    return jsonError("Le propriétaire n'a pas pu être modifié.", 500);
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAgency(request);
  if (auth.response) return auth.response;
  const { id } = await params;
  const { service } = auth;

  try {
    // Fichiers rangés sous "<event_id>/..." (photo d'accueil, galerie, musique).
    const paths = await listFolder(service, id);
    for (let i = 0; i < paths.length; i += 100) {
      const { error } = await service.storage.from(BUCKET).remove(paths.slice(i, i + 100));
      if (error) throw error;
    }
    const { error } = await service.from("events").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true, removedFiles: paths.length });
  } catch (error) {
    console.error("admin event delete error:", error?.message || error);
    return jsonError("L'événement n'a pas pu être supprimé.", 500);
  }
}

/** Chemins de tous les fichiers d'un dossier du bucket, sous-dossiers compris. */
async function listFolder(service, folder) {
  const paths = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await service.storage.from(BUCKET).list(folder, { limit: 1000, offset });
    if (error) throw error;
    for (const entry of data) {
      const path = `${folder}/${entry.name}`;
      // Un dossier n'a pas d'id dans la réponse de Storage.
      if (entry.id) paths.push(path);
      else paths.push(...(await listFolder(service, path)));
    }
    if (data.length < 1000) return paths;
  }
}
