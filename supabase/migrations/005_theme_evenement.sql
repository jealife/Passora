-- ============================================================================
--  Migration 005 — thème de couleurs par événement
--
--  Chaque événement peut définir 3 couleurs (accent principal, accent
--  secondaire, fond) ; le reste de la palette est dérivé automatiquement
--  côté application (voir lib/theme.js). Nul = palette par défaut inchangée.
--
--  À exécuter une seule fois dans : Supabase Dashboard > SQL Editor
--  (inutile pour une installation neuve : schema.sql intègre déjà ces colonnes).
-- ============================================================================

alter table public.events
  add column if not exists theme_primary    text,
  add column if not exists theme_secondary  text,
  add column if not exists theme_background text;
