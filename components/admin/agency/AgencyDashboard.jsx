"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icons";
import { EASE } from "@/components/motion/primitives";
import { classNames } from "@/lib/utils";
import { FullPageLoader, PassoraLogo } from "@/components/admin/AuthGate";
import AgencyDialogs from "@/components/admin/agency/Dialogs";
import Overview from "@/components/admin/agency/Overview";
import EventsPanel from "@/components/admin/agency/EventsPanel";
import AccountsPanel from "@/components/admin/agency/AccountsPanel";
import PlatformPanel from "@/components/admin/agency/PlatformPanel";
import { EVENT_FIELDS, agencyApi, normalizeEvent } from "@/components/admin/agency/shared";

const SECTIONS = [
  { key: "apercu", label: "Aperçu", icon: "home" },
  { key: "evenements", label: "Événements", icon: "calendar" },
  { key: "comptes", label: "Comptes", icon: "users" },
  { key: "plateforme", label: "Plateforme", icon: "sliders" },
];

/** Événements (avec leurs compteurs) et comptes : de quoi superviser la plateforme. */
async function fetchDashboard(supabase) {
  const [events, accounts] = await Promise.all([
    supabase
      .from("events")
      .select(EVENT_FIELDS)
      .not("checked.checked_in_at", "is", null)
      .order("wedding_date", { ascending: true, nullsFirst: false }),
    agencyApi(supabase, "/api/admin/users").catch((err) => ({ users: [], error: err.message })),
  ]);
  const now = Date.now();
  return {
    now,
    events: (events.data || []).map((row) => normalizeEvent(row, now)),
    eventsError: events.error?.message || null,
    users: accounts.users || [],
    usersError: accounts.error || null,
  };
}

/**
 * Tableau de bord de l'agence (`/admin`, rôle "agency"), dans le style de
 * la vitrine : supervision de la plateforme, des événements et des comptes.
 * Le détail d'un événement (réponses, invités…) reste dans sa propre page.
 * Les événements se lisent directement (RLS : l'agence voit tout) ; les
 * comptes passent par les routes `/api/admin/*` (clé service).
 */
export default function AgencyDashboard({ supabase, session }) {
  const [section, setSection] = useState("apercu");
  const [eventFilter, setEventFilter] = useState("upcoming");
  const [data, setData] = useState(null);
  const [dialog, setDialog] = useState(null); // { type, payload }

  const reload = useCallback(() => fetchDashboard(supabase).then(setData), [supabase]);

  useEffect(() => {
    let active = true;
    fetchDashboard(supabase).then((next) => active && setData(next));
    return () => {
      active = false;
    };
  }, [supabase]);

  const usersById = useMemo(() => new Map((data?.users || []).map((u) => [u.id, u])), [data]);
  const openDialog = useCallback((type, payload) => setDialog({ type, payload }), []);
  const closeDialog = useCallback(() => setDialog(null), []);

  /** Ouvre une section ; `filter` présélectionne un filtre de la liste des événements. */
  const goTo = (key, filter) => {
    if (filter) setEventFilter(filter);
    setSection(key);
    window.scrollTo({ top: 0 });
  };

  if (!data) return <FullPageLoader />;

  const panelProps = { data, usersById, openDialog, goTo, session };

  return (
    <div className="min-h-svh bg-cream text-passora-ink">
      <header className="sticky top-0 z-30 border-b border-passora-ink/10 bg-cream/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-stretch justify-between gap-6 px-5 sm:px-8">
          <div className="flex min-w-0 items-center gap-2.5">
            <PassoraLogo className="h-8 w-8 rounded-lg" />
            <span className="font-serif text-lg font-medium italic">Passora</span>
            <span className="hidden border-l border-passora-ink/15 pl-2.5 text-[0.62rem] font-medium tracking-[0.25em] text-passora-ink/45 uppercase sm:inline">
              Agence
            </span>
          </div>

          <nav className="hidden items-stretch gap-7 md:flex" aria-label="Sections">
            {SECTIONS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => goTo(item.key)}
                aria-current={section === item.key ? "page" : undefined}
                className={classNames(
                  "relative flex cursor-pointer items-center text-xs font-medium tracking-wide transition-colors",
                  section === item.key ? "text-passora-ink" : "text-passora-ink/55 hover:text-passora-ink",
                )}
              >
                {item.label}
                {section === item.key && (
                  <motion.span
                    layoutId="agency-tab"
                    className="absolute inset-x-0 -bottom-px h-0.5 bg-passora-gold"
                    transition={{ type: "spring", stiffness: 420, damping: 36 }}
                  />
                )}
              </button>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1">
            <HeaderLink href="/" icon="external-link" label="Vitrine" external />
            <HeaderLink onClick={() => supabase.auth.signOut()} icon="log-out" label="Déconnexion" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pt-7 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-8 sm:pt-10 md:pb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={section}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
          >
            {section === "apercu" && <Overview {...panelProps} />}
            {section === "evenements" && (
              <EventsPanel {...panelProps} filter={eventFilter} onFilterChange={setEventFilter} />
            )}
            {section === "comptes" && <AccountsPanel {...panelProps} />}
            {section === "plateforme" && <PlatformPanel {...panelProps} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Barre du bas (mobile) : filet doré au-dessus de la section active. */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-passora-ink/10 bg-cream/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        aria-label="Sections"
      >
        <div className="mx-auto flex h-16 max-w-md">
          {SECTIONS.map((item) => {
            const active = section === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => goTo(item.key)}
                aria-current={active ? "page" : undefined}
                className={classNames(
                  "relative flex flex-1 cursor-pointer flex-col items-center justify-center gap-1.5 transition-colors",
                  active ? "text-passora-ink" : "text-passora-ink/45",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="agency-tab-mobile"
                    className="absolute inset-x-5 top-0 h-0.5 bg-passora-gold"
                    transition={{ type: "spring", stiffness: 420, damping: 36 }}
                  />
                )}
                <Icon name={item.icon} className="h-[1.15rem] w-[1.15rem]" />
                <span className={classNames("text-[0.66rem] leading-none tracking-wide", active && "font-semibold")}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <AgencyDialogs
        dialog={dialog}
        onClose={closeDialog}
        supabase={supabase}
        users={data.users}
        onChanged={reload}
      />
    </div>
  );
}

/** Lien d'en-tête : icône seule sur mobile, libellé sur grand écran. */
function HeaderLink({ href, external, onClick, icon, label }) {
  const className =
    "flex h-9 min-w-9 cursor-pointer items-center justify-center gap-2 rounded-md px-2 text-passora-ink/60 transition-colors hover:bg-passora-ink/5 hover:text-passora-ink lg:px-3 lg:text-xs lg:font-medium lg:tracking-wide";
  const content = (
    <>
      <Icon name={icon} className="h-4 w-4" />
      <span className="hidden lg:inline">{label}</span>
    </>
  );
  return href ? (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={className}
      title={label}
      aria-label={label}
    >
      {content}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={className} title={label} aria-label={label}>
      {content}
    </button>
  );
}
