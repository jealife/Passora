-- ============================================================================
--  Mariage Myrna & Jaël — schéma Supabase
--  À exécuter dans : Supabase Dashboard > SQL Editor > New query
--
--  Architecture multi-événements : chaque table est rattachée à `events`
--  via `event_id`, ce qui permettra d'héberger d'autres événements
--  (autres mariages, anniversaires…) sans refonte.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Tables
-- ----------------------------------------------------------------------------

create table if not exists public.events (
  id                   uuid primary key default gen_random_uuid(),
  slug                 text not null unique,
  name                 text not null default '',
  bride_name           text not null default '',
  groom_name           text not null default '',
  tagline              text default '',
  wedding_date         timestamptz,
  date_confirmed       boolean not null default false,
  hero_image_url       text default '',
  story_title          text default 'Notre histoire',
  story_text           text default '',
  story_audio_url      text default '',
  footer_message       text default '',
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create table if not exists public.program (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references public.events(id) on delete cascade,
  section    text not null,
  icon       text not null default 'rings',
  time       text not null,
  label      text not null,
  sort_order integer not null default 0
);

create table if not exists public.venues (
  id             uuid primary key default gen_random_uuid(),
  event_id       uuid not null references public.events(id) on delete cascade,
  title          text not null default '',
  name           text not null,
  address        text not null default '',
  maps_url       text not null default '',
  maps_embed_url text not null default '',
  sort_order     integer not null default 0
);

create table if not exists public.gallery (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references public.events(id) on delete cascade,
  url        text not null,
  alt        text default '',
  sort_order integer not null default 0
);

create table if not exists public.guests (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references public.events(id) on delete cascade,
  full_name  text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.rsvp (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references public.events(id) on delete cascade,
  -- cascade : supprimer un invité supprime aussi sa confirmation
  guest_id   uuid references public.guests(id) on delete cascade,
  guest_name text not null,
  message    text,
  attending  boolean not null default true,
  created_at timestamptz not null default now(),
  unique (event_id, guest_id)
);

create index if not exists program_event_idx on public.program (event_id, sort_order);
create index if not exists venues_event_idx  on public.venues  (event_id, sort_order);
create index if not exists gallery_event_idx on public.gallery (event_id, sort_order);
create index if not exists guests_event_idx  on public.guests  (event_id);
create index if not exists rsvp_event_idx    on public.rsvp    (event_id, created_at desc);

-- `updated_at` automatique sur events
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists events_updated_at on public.events;
create trigger events_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 2. Sécurité (Row Level Security)
--
--   * Contenu public (events, program, venues, gallery) : lecture pour tous,
--     écriture réservée aux utilisateurs authentifiés (l'administration).
--   * guests et rsvp : AUCUN accès public. Le formulaire RSVP passe par
--     l'API du site (clé service role, côté serveur uniquement) ; seule
--     l'administration authentifiée peut les consulter.
-- ----------------------------------------------------------------------------

alter table public.events  enable row level security;
alter table public.program enable row level security;
alter table public.venues  enable row level security;
alter table public.gallery enable row level security;
alter table public.guests  enable row level security;
alter table public.rsvp    enable row level security;

-- (script ré-exécutable : on supprime les policies avant de les recréer)
drop policy if exists "events_public_read"  on public.events;
drop policy if exists "program_public_read" on public.program;
drop policy if exists "venues_public_read"  on public.venues;
drop policy if exists "gallery_public_read" on public.gallery;
drop policy if exists "events_admin_write"  on public.events;
drop policy if exists "program_admin_write" on public.program;
drop policy if exists "venues_admin_write"  on public.venues;
drop policy if exists "gallery_admin_write" on public.gallery;
drop policy if exists "guests_admin_all"    on public.guests;
drop policy if exists "rsvp_admin_all"      on public.rsvp;

-- Lecture publique du contenu affiché sur la page
create policy "events_public_read"  on public.events  for select using (true);
create policy "program_public_read" on public.program for select using (true);
create policy "venues_public_read"  on public.venues  for select using (true);
create policy "gallery_public_read" on public.gallery for select using (true);

-- Écriture / gestion réservée aux comptes authentifiés (administration)
create policy "events_admin_write"  on public.events  for all to authenticated using (true) with check (true);
create policy "program_admin_write" on public.program for all to authenticated using (true) with check (true);
create policy "venues_admin_write"  on public.venues  for all to authenticated using (true) with check (true);
create policy "gallery_admin_write" on public.gallery for all to authenticated using (true) with check (true);
create policy "guests_admin_all"    on public.guests  for all to authenticated using (true) with check (true);
create policy "rsvp_admin_all"      on public.rsvp    for all to authenticated using (true) with check (true);

-- ----------------------------------------------------------------------------
-- 3. Stockage (photos : hero + galerie ; musique d'ambiance)
-- ----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('wedding', 'wedding', true)
on conflict (id) do nothing;

drop policy if exists "wedding_public_read"  on storage.objects;
drop policy if exists "wedding_admin_insert" on storage.objects;
drop policy if exists "wedding_admin_update" on storage.objects;
drop policy if exists "wedding_admin_delete" on storage.objects;

create policy "wedding_public_read" on storage.objects
  for select using (bucket_id = 'wedding');

create policy "wedding_admin_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'wedding');

create policy "wedding_admin_update" on storage.objects
  for update to authenticated using (bucket_id = 'wedding');

create policy "wedding_admin_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'wedding');

-- ----------------------------------------------------------------------------
-- 4. Données initiales — événement « myrna-jael »
-- ----------------------------------------------------------------------------

insert into public.events
  (slug, name, bride_name, groom_name, tagline, wedding_date, date_confirmed,
   story_title, story_text, story_audio_url, footer_message)
values (
  'myrna-jael',
  'Mariage de Myrna & Jaël',
  'Myrna Rychka',
  'Jael Fidèle',
  'Nous nous disons oui',
  '2026-09-12T08:00:00+00',   -- date provisoire, à ajuster dans l'administration
  false,
  'Notre histoire',
  'Une personne peut tomber, deux peuvent se relever, mais trois liés par Dieu deviennent difficiles à briser.',
  '/audio/ambiance.mp3',
  'Une urne nuptiale sera mise à votre disposition. Votre présence à nos côtés sera notre plus beau cadeau.'
)
on conflict (slug) do nothing;

-- Programme + lieux (uniquement si l'événement vient d'être créé)
do $$
declare
  eid uuid;
begin
  select id into eid from public.events where slug = 'myrna-jael';

  if not exists (select 1 from public.program where event_id = eid) then
    insert into public.program (event_id, section, icon, time, label, sort_order) values
      (eid, 'Cérémonie coutumière', 'kola',  '08h00', 'Arrivée de la famille du futur marié', 0),
      (eid, 'Cérémonie coutumière', 'kola',  '08h30', 'Début des pourparlers',                1),
      (eid, 'Cérémonie coutumière', 'kola',  '12h00', 'Fin des pourparlers',                  2),
      (eid, 'Cérémonie coutumière', 'kola',  '12h15', 'Séance photo et cocktail',             3),
      (eid, 'Cérémonie civile',     'rings', '14h00', 'Arrivée des invités',                  4),
      (eid, 'Cérémonie civile',     'rings', '14h25', 'Arrivée du futur marié',               5),
      (eid, 'Cérémonie civile',     'rings', '14h35', 'Arrivée de la future mariée',          6),
      (eid, 'Cérémonie civile',     'rings', '14h50', 'Arrivée du Maire',                     7),
      (eid, 'Cérémonie civile',     'rings', '15h00', 'Début de la cérémonie civile',         8),
      (eid, 'Cérémonie civile',     'rings', '15h45', 'Séance photo et cocktail',             9),
      (eid, 'Réception',            'glass', '19h00', 'Arrivée des invités',                 10),
      (eid, 'Réception',            'glass', '19h15', 'Séance photo',                        11),
      (eid, 'Réception',            'glass', '20h00', 'Entrée des mariés dans la salle',     12),
      (eid, 'Réception',            'glass', '21h45', 'Présentation de la pièce montée',     13),
      (eid, 'Réception',            'glass', '22h00', 'Ouverture du bal',                    14);
  end if;

  if not exists (select 1 from public.venues where event_id = eid) then
    insert into public.venues (event_id, title, name, address, maps_url, maps_embed_url, sort_order) values
      (eid, 'Mariage coutumier', 'L''Olivier Fleuri', 'Alibandeng, Trois Manguiers',
       'https://www.google.com/maps/search/?api=1&query=L%27Olivier%20Fleuri%20Alibandeng%20Trois%20Manguiers',
       'https://www.google.com/maps?q=L%27Olivier%20Fleuri%20Alibandeng%20Trois%20Manguiers&output=embed', 0),
      (eid, 'Mariage civil', 'Salle Les Pas Joyeux', 'Salle Les Pas Joyeux',
       'https://www.google.com/maps/search/?api=1&query=Salle%20Les%20Pas%20Joyeux',
       'https://www.google.com/maps?q=Salle%20Les%20Pas%20Joyeux&output=embed', 1);
  end if;
end $$;

-- Exemple d'import d'invités (décommentez et complétez, ou utilisez
-- l'onglet « Invités » de l'administration) :
-- insert into public.guests (event_id, full_name)
-- select id, unnest(array['Awa Diallo', 'Ibrahima Sory Camara'])
-- from public.events where slug = 'myrna-jael';
