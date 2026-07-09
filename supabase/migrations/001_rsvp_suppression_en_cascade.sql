-- ============================================================================
--  Migration 001 — suppression en cascade des confirmations
--
--  Supprimer un invité supprime désormais automatiquement sa confirmation
--  de présence (auparavant, la confirmation restait orpheline).
--
--  À exécuter une seule fois dans : Supabase Dashboard > SQL Editor
--  (inutile pour une installation neuve : schema.sql intègre déjà la règle).
-- ============================================================================

-- Nettoie les éventuelles confirmations déjà orphelines
delete from public.rsvp where guest_id is null;

-- Remplace la règle « set null » par « cascade »
alter table public.rsvp drop constraint if exists rsvp_guest_id_fkey;
alter table public.rsvp
  add constraint rsvp_guest_id_fkey
  foreign key (guest_id) references public.guests(id) on delete cascade;
