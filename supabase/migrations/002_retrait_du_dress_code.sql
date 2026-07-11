-- ----------------------------------------------------------------------------
-- Retrait de la section « Dress code » du site : les colonnes associées
-- ne sont plus utilisées ni par la page publique ni par l'administration.
-- ----------------------------------------------------------------------------

alter table public.events
  drop column if exists dress_code_title,
  drop column if exists dress_code_image_url;
