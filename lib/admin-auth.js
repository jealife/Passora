import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getSupabaseServerClient, getSupabaseServiceClient } from "@/lib/supabase/server";

/**
 * Outils communs aux routes `/api/admin/*`, réservées à l'agence. Elles
 * passent par le serveur car gérer les comptes (Supabase Auth) exige la clé
 * service role, qui ne doit jamais être exposée au navigateur.
 */

/**
 * Vérifie le jeton "Authorization: Bearer <access_token>" et le rôle agence.
 * Retourne `{ user, service }`, ou `{ response }` à renvoyer tel quel.
 */
export async function requireAgency(request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return { response: jsonError("Non authentifié.", 401) };

  const authClient = getSupabaseServerClient();
  const service = getSupabaseServiceClient();
  if (!authClient || !service) return { response: jsonError("Supabase n'est pas configuré.", 503) };

  const {
    data: { user },
    error,
  } = await authClient.auth.getUser(token);
  if (error || !user || user.app_metadata?.role !== "agency") {
    return { response: jsonError("Accès réservé à l'agence.", 403) };
  }
  return { user, service };
}

export function jsonError(message, status) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

/** Mot de passe temporaire lisible, à transmettre au couple. */
export function generateTempPassword() {
  return randomBytes(9).toString("base64url");
}

/** Tous les comptes Supabase Auth, page par page. */
export async function listAllUsers(service) {
  const perPage = 1000;
  const users = [];
  for (let page = 1; ; page += 1) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    users.push(...data.users);
    if (data.users.length < perPage) return users;
  }
}

/** Compte Supabase Auth correspondant à un email (sans tenir compte de la casse). */
export async function findUserByEmail(service, email) {
  const target = email.trim().toLowerCase();
  const users = await listAllUsers(service);
  return users.find((u) => u.email?.toLowerCase() === target);
}

/**
 * Retourne l'id du compte lié à cet email, en le créant s'il n'existe pas
 * (avec un mot de passe temporaire, renvoyé une seule fois).
 */
export async function findOrCreateUser(service, email, role) {
  const existing = await findUserByEmail(service, email);
  if (existing) return { id: existing.id, tempPassword: null };

  const tempPassword = generateTempPassword();
  const { data, error } = await service.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password: tempPassword,
    email_confirm: true,
    ...(role === "agency" ? { app_metadata: { role: "agency" } } : {}),
  });
  if (error) throw error;
  return { id: data.user.id, tempPassword };
}

export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
