-- ============================================================================
-- Migration 008 — limite de fréquence (rate limiting)
--
-- Table + fonction utilisées par les routes API publiques (RSVP,
-- autocomplétion des invités, création d'événement) pour brider le nombre
-- de requêtes par adresse IP. Appelée uniquement depuis le serveur avec la
-- clé service role (voir lib/rate-limit.js) — jamais exposée au client.
-- ============================================================================

create table if not exists public.rate_limits (
  rl_key       text primary key,
  window_start timestamptz not null default now(),
  count        integer not null default 1
);

alter table public.rate_limits enable row level security;
-- Aucune policy : seule la clé service role (qui contourne RLS) y accède.

-- Incrémente le compteur de `p_key` ; réinitialise la fenêtre si elle est
-- expirée. Retourne `true` si la limite `p_max` est dépassée pour cette
-- fenêtre de `p_window_seconds` secondes.
create or replace function public.check_rate_limit(
  p_key text,
  p_max integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
as $$
declare
  v_count integer;
begin
  insert into public.rate_limits (rl_key, window_start, count)
  values (p_key, now(), 1)
  on conflict (rl_key) do update set
    count = case
      when public.rate_limits.window_start < now() - (p_window_seconds || ' seconds')::interval
        then 1
      else public.rate_limits.count + 1
    end,
    window_start = case
      when public.rate_limits.window_start < now() - (p_window_seconds || ' seconds')::interval
        then now()
      else public.rate_limits.window_start
    end
  returning count into v_count;

  return v_count > p_max;
end;
$$;
