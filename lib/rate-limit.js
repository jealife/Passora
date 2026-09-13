import { getSupabaseServiceClient } from "@/lib/supabase/server";

/** Adresse IP du client telle que transmise par le proxy Vercel. */
function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

/**
 * Limite de fréquence par IP, appuyée sur la fonction Postgres
 * `check_rate_limit` (voir supabase/migrations/008_limite_de_frequence.sql).
 * Retourne `true` si l'appelant a dépassé `maxCount` requêtes sur les
 * `windowSeconds` dernières secondes pour cette route. Ne bloque jamais si
 * Supabase n'est pas configuré ou si le contrôle échoue : la disponibilité
 * du service prime sur la limite en cas de panne du rate-limit lui-même.
 */
export async function isRateLimited(request, routeKey, maxCount, windowSeconds) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return false;

  const ip = getClientIp(request);
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_key: `${routeKey}:${ip}`,
    p_max: maxCount,
    p_window_seconds: windowSeconds,
  });

  if (error) {
    console.error("rate-limit error:", error.message);
    return false;
  }
  return Boolean(data);
}
