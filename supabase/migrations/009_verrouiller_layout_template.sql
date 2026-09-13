-- ============================================================================
-- Migration 009 — verrouiller la mise en page côté agence
--
-- Le couple propriétaire d'un événement peut modifier son thème (couleurs)
-- librement, mais pas changer de mise en page (layout_template) : ce choix
-- reste réservé à l'agence, qui assigne le modèle une fois pour toutes.
-- La policy RLS "events_owner_update" autorisait jusqu'ici la modification
-- de n'importe quelle colonne par le propriétaire ; ce trigger referme
-- spécifiquement layout_template sans toucher au reste (dont les couleurs).
-- ============================================================================

create or replace function public.enforce_layout_template_agency_only()
returns trigger
language plpgsql
as $$
begin
  if new.layout_template is distinct from old.layout_template and not public.is_agency() then
    raise exception 'Seule l''agence peut changer la mise en page.';
  end if;
  return new;
end;
$$;

drop trigger if exists events_layout_template_agency_only on public.events;
create trigger events_layout_template_agency_only
  before update on public.events
  for each row execute function public.enforce_layout_template_agency_only();
