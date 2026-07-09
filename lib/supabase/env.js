/**
 * Vérifie que les variables Supabase sont réellement renseignées :
 * les valeurs du fichier .env.local.example (« votre-projet »,
 * « votre-cle-… ») sont considérées comme absentes.
 */
export function readSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  const isPlaceholder = (value) => !value || value.includes("votre-");

  return {
    url: isPlaceholder(url) ? null : url,
    anonKey: isPlaceholder(anonKey) ? null : anonKey,
    serviceKey: isPlaceholder(serviceKey) ? null : serviceKey,
  };
}
