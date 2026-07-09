"use client";

import { createClient } from "@supabase/supabase-js";
import { readSupabaseEnv } from "@/lib/supabase/env";

let browserClient = null;

/**
 * Client Supabase côté navigateur (clé anon, session persistée).
 * Retourne `null` si les variables d'environnement ne sont pas définies,
 * ce qui permet au site de fonctionner en mode démo sans Supabase.
 */
export function getSupabaseBrowserClient() {
  const { url, anonKey } = readSupabaseEnv();
  if (!url || !anonKey) return null;
  if (!browserClient) {
    browserClient = createClient(url, anonKey);
  }
  return browserClient;
}
