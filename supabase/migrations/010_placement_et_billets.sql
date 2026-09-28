-- ============================================================================
-- Migration 010 — placement des invités et billets à QR code
--
-- Ajoute la table/place attribuée à chaque confirmation de présence, ainsi
-- que l'horodatage de son passage à l'entrée (scan du billet). Colonnes
-- nullables sur une table existante : rétro-compatible avec les événements
-- déjà en cours, aucune donnée à migrer. Aucune policy RLS supplémentaire
-- nécessaire — "rsvp_admin_all" (agence ou propriétaire de l'événement)
-- couvre déjà la lecture et l'écriture de ces nouvelles colonnes.
-- ============================================================================

alter table public.rsvp
  add column if not exists table_label text,
  add column if not exists seat_label text,
  add column if not exists checked_in_at timestamptz;
