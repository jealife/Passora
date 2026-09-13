-- ============================================================================
--  Migration 006 — visibilité des sections optionnelles par événement
--
--  Chaque section optionnelle (histoire, galerie, programme, lieux) peut être
--  désactivée volontairement même si elle a du contenu. Une section vide ne
--  s'affiche de toute façon jamais (voir lib/data.js et components/WeddingPage.jsx) —
--  ces colonnes servent uniquement à la masquer *volontairement*.
--
--  À exécuter une seule fois dans : Supabase Dashboard > SQL Editor
--  (inutile pour une installation neuve : schema.sql intègre déjà ces colonnes).
-- ============================================================================

alter table public.events
  add column if not exists show_story    boolean not null default true,
  add column if not exists show_gallery  boolean not null default true,
  add column if not exists show_program  boolean not null default true,
  add column if not exists show_venues   boolean not null default true;
