-- ============================================================================
-- Migration 012 — type d'événement
--
-- Passora ne se limite plus aux mariages : chaque événement a un type
-- (mariage, anniversaire, baptême, réception, concert, masterclass,
-- conférence ; liste tenue dans lib/event-types.js). Les événements
-- existants sont des mariages, d'où la valeur par défaut. Rejouable sans
-- risque ; aucune policy RLS à modifier.
-- ============================================================================

alter table public.events
  add column if not exists event_type text not null default 'wedding';
