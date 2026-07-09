import { createClient } from "@supabase/supabase-js";
import { readSupabaseEnv } from "@/lib/supabase/env";

/**
 * Client Supabase côté serveur.
 *
 * - `getSupabaseServerClient()`  : clé anon — lecture du contenu public (RLS).
 * - `getSupabaseServiceClient()` : clé service role — réservée aux routes API
 *   (vérification de la liste des invités, enregistrement des RSVP) afin de
 *   ne jamais exposer la liste des invités au public.
 */

export function getSupabaseServerClient() {
  const { url, anonKey } = readSupabaseEnv();
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function getSupabaseServiceClient() {
  const { url, serviceKey } = readSupabaseEnv();
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
