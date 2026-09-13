-- ============================================================================
--  Migration 007 — contenu optionnel étendu + modèles de mise en page
--
--  Nouveaux champs universels (utilisables par n'importe quel modèle de
--  mise en page, actuel ou futur) : citation d'ouverture, parents des
--  mariés, code vestimentaire, suggestions de cadeaux, recommandations
--  aux invités, contacts & délai RSVP. Comme pour Histoire/Galerie/
--  Programme/Lieux, chaque section optionnelle ne s'affiche que si elle a
--  du contenu réel ET n'a pas été désactivée (voir lib/data.js / les
--  composants de mise en page) — les `show_*` par défaut à true ne
--  changent donc rien pour un événement qui laisse ces champs vides.
--
--  `layout_template` sélectionne la mise en page complète de l'événement
--  ('classic' = comportement actuel, inchangé).
--
--  À exécuter une seule fois dans : Supabase Dashboard > SQL Editor
--  (inutile pour une installation neuve : schema.sql intègre déjà ces colonnes).
-- ============================================================================

alter table public.events add column if not exists layout_template       text not null default 'classic';
alter table public.events add column if not exists opening_quote         text;
alter table public.events add column if not exists opening_quote_source  text;
alter table public.events add column if not exists show_opening_quote    boolean not null default true;
alter table public.events add column if not exists bride_mother_name     text;
alter table public.events add column if not exists bride_father_name     text;
alter table public.events add column if not exists groom_mother_name     text;
alter table public.events add column if not exists groom_father_name     text;
alter table public.events add column if not exists parents_blessing_text text;
alter table public.events add column if not exists show_parents          boolean not null default true;
alter table public.events add column if not exists dress_code_title      text;
alter table public.events add column if not exists dress_code_note       text;
alter table public.events add column if not exists show_dress_code       boolean not null default true;
alter table public.events add column if not exists gift_message          text;
alter table public.events add column if not exists gift_details          text;
alter table public.events add column if not exists gift_qr_image_url     text;
alter table public.events add column if not exists show_gifts            boolean not null default true;
alter table public.events add column if not exists guest_notes_title     text;
alter table public.events add column if not exists guest_notes_text      text;
alter table public.events add column if not exists show_guest_notes      boolean not null default true;
alter table public.events add column if not exists bride_contact_phone   text;
alter table public.events add column if not exists groom_contact_phone  text;
alter table public.events add column if not exists rsvp_deadline         date;
