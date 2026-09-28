-- ============================================================================
-- Migration 011 — la table appartient à l'invité, plus à la confirmation
--
-- La table peut désormais être choisie dès l'ajout d'un invité à la liste,
-- avant même qu'il confirme sa présence. Elle est donc portée par `guests`
-- (source unique), et lue via `rsvp.guest_id` par l'écran Tables et par le
-- scanner. Les tables déjà attribuées sur `rsvp` sont recopiées sur l'invité
-- correspondant, puis les anciennes colonnes `rsvp.table_label` et
-- `rsvp.seat_label` (la place n'est plus utilisée) sont supprimées.
-- Rejouable sans risque. Aucune policy RLS supplémentaire : "guests_admin_all"
-- couvre déjà la lecture et l'écriture de la nouvelle colonne.
-- ============================================================================

alter table public.guests add column if not exists table_label text;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'rsvp' and column_name = 'table_label'
  ) then
    update public.guests g
       set table_label = r.table_label
      from public.rsvp r
     where r.guest_id = g.id
       and r.table_label is not null
       and g.table_label is null;
  end if;
end $$;

alter table public.rsvp
  drop column if exists table_label,
  drop column if exists seat_label;
