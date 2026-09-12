-- ============================================================================
--  Migration 004 — accès admin restreint par événement
--
--  Chaque événement peut désormais avoir un propriétaire (`owner_id`, le
--  compte du couple client) qui ne peut gérer que son propre événement.
--  Un compte « agence » (app_metadata.role = 'agency') garde un accès total
--  à tous les événements. Le contenu déjà public (events/program/venues/
--  gallery) reste lisible par tous — seule l'écriture est restreinte.
--  guests/rsvp n'ont aucune lecture publique : ils passent en lecture ET
--  écriture restreintes.
--
--  À exécuter une seule fois dans : Supabase Dashboard > SQL Editor
--  (inutile pour une installation neuve : schema.sql intègre déjà ce modèle).
-- ============================================================================

alter table public.events
  add column if not exists owner_id uuid references auth.users(id) on delete set null;

create or replace function public.is_agency()
returns boolean
language sql stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'agency', false);
$$;

-- ----------------------------------------------------------------------------
-- events : create réservé à l'agence, update/delete à l'agence ou au propriétaire
-- ----------------------------------------------------------------------------
drop policy if exists "events_admin_write" on public.events;
drop policy if exists "events_agency_insert" on public.events;
drop policy if exists "events_owner_update" on public.events;
drop policy if exists "events_agency_delete" on public.events;

create policy "events_agency_insert" on public.events
  for insert to authenticated with check (public.is_agency());

create policy "events_owner_update" on public.events
  for update to authenticated
  using (public.is_agency() or owner_id = auth.uid())
  with check (public.is_agency() or owner_id = auth.uid());

create policy "events_agency_delete" on public.events
  for delete to authenticated using (public.is_agency());

-- ----------------------------------------------------------------------------
-- program / venues / gallery : agence ou propriétaire de l'événement parent
-- ----------------------------------------------------------------------------
drop policy if exists "program_admin_write" on public.program;
create policy "program_admin_write" on public.program
  for all to authenticated
  using (public.is_agency() or exists (
    select 1 from public.events e where e.id = program.event_id and e.owner_id = auth.uid()
  ))
  with check (public.is_agency() or exists (
    select 1 from public.events e where e.id = program.event_id and e.owner_id = auth.uid()
  ));

drop policy if exists "venues_admin_write" on public.venues;
create policy "venues_admin_write" on public.venues
  for all to authenticated
  using (public.is_agency() or exists (
    select 1 from public.events e where e.id = venues.event_id and e.owner_id = auth.uid()
  ))
  with check (public.is_agency() or exists (
    select 1 from public.events e where e.id = venues.event_id and e.owner_id = auth.uid()
  ));

drop policy if exists "gallery_admin_write" on public.gallery;
create policy "gallery_admin_write" on public.gallery
  for all to authenticated
  using (public.is_agency() or exists (
    select 1 from public.events e where e.id = gallery.event_id and e.owner_id = auth.uid()
  ))
  with check (public.is_agency() or exists (
    select 1 from public.events e where e.id = gallery.event_id and e.owner_id = auth.uid()
  ));

-- ----------------------------------------------------------------------------
-- guests / rsvp : aucune lecture publique — agence ou propriétaire, en lecture
-- ET en écriture (remplace l'ancien "n'importe quel compte connecté")
-- ----------------------------------------------------------------------------
drop policy if exists "guests_admin_all" on public.guests;
create policy "guests_admin_all" on public.guests
  for all to authenticated
  using (public.is_agency() or exists (
    select 1 from public.events e where e.id = guests.event_id and e.owner_id = auth.uid()
  ))
  with check (public.is_agency() or exists (
    select 1 from public.events e where e.id = guests.event_id and e.owner_id = auth.uid()
  ));

drop policy if exists "rsvp_admin_all" on public.rsvp;
create policy "rsvp_admin_all" on public.rsvp
  for all to authenticated
  using (public.is_agency() or exists (
    select 1 from public.events e where e.id = rsvp.event_id and e.owner_id = auth.uid()
  ))
  with check (public.is_agency() or exists (
    select 1 from public.events e where e.id = rsvp.event_id and e.owner_id = auth.uid()
  ));

-- ----------------------------------------------------------------------------
-- Stockage : lecture publique inchangée, écriture restreinte au propriétaire
-- de l'événement (premier segment du chemin, ex. "<event_id>/hero-....jpg")
-- ----------------------------------------------------------------------------
drop policy if exists "wedding_admin_insert" on storage.objects;
drop policy if exists "wedding_admin_update" on storage.objects;
drop policy if exists "wedding_admin_delete" on storage.objects;

create policy "wedding_admin_insert" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'wedding' and (
      public.is_agency() or exists (
        select 1 from public.events e
        where e.owner_id = auth.uid()
          and e.id::text = (storage.foldername(name))[1]
      )
    )
  );

create policy "wedding_admin_update" on storage.objects
  for update to authenticated using (
    bucket_id = 'wedding' and (
      public.is_agency() or exists (
        select 1 from public.events e
        where e.owner_id = auth.uid()
          and e.id::text = (storage.foldername(name))[1]
      )
    )
  );

create policy "wedding_admin_delete" on storage.objects
  for delete to authenticated using (
    bucket_id = 'wedding' and (
      public.is_agency() or exists (
        select 1 from public.events e
        where e.owner_id = auth.uid()
          and e.id::text = (storage.foldername(name))[1]
      )
    )
  );
