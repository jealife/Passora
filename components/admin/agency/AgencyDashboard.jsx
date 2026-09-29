"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE } from "@/components/motion/primitives";
import { FullPageLoader, PassoraLogo } from "@/components/admin/AuthGate";
import { DesktopSectionNav, HeaderAction, MobileSectionNav } from "@/components/admin/SectionNav";
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

/** Événements (avec compteurs), dernières réponses et comptes. */
async function fetchDashboard(supabase) {
  const [events, activity, accounts] = await Promise.all([
    supabase
      .from("events")
      .select(EVENT_FIELDS)
      .not("checked.checked_in_at", "is", null)
      .order("wedding_date", { ascending: true, nullsFirst: false }),
    supabase
      .from("rsvp")
      .select("id, guest_name, message, created_at, checked_in_at, event_id")
      .order("created_at", { ascending: false })
      .limit(30),
    agencyApi(supabase, "/api/admin/users").catch((err) => ({ users: [], error: err.message })),
  ]);
  const now = Date.now();
  return {
    now,
    events: (events.data || []).map((row) => normalizeEvent(row, now)),
    eventsError: events.error?.message || null,
    activity: activity.data || [],
    users: accounts.users || [],
    usersError: accounts.error || null,
  };
}

/**
 * Tableau de bord de l'agence (`/admin`, rôle "agency") : vue d'ensemble de
 * la plateforme, gestion des événements, des comptes et de l'application.
 * Les événements et réponses se lisent directement (RLS : l'agence voit
 * tout) ; les comptes passent par les routes `/api/admin/*` (clé service).
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!data) return <FullPageLoader />;

  const panelProps = { data, usersById, openDialog, goTo, session };

  return (
    <div className="min-h-svh bg-linen">
      <header className="sticky top-0 z-30 border-b border-cocoa/10 bg-cream/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <PassoraLogo className="h-9 w-9 rounded-xl" />
            <div className="min-w-0 md:hidden lg:block">
              <p className="truncate font-serif text-lg italic leading-tight text-cocoa">Passora</p>
              <p className="text-[0.6rem] font-medium uppercase tracking-[0.25em] text-cocoa/45">Espace agence</p>
            </div>
          </div>

          <DesktopSectionNav sections={SECTIONS} active={section} onSelect={(key) => goTo(key)} layoutId="agency-section-pill" />

          <div className="flex shrink-0 items-center gap-1.5">
            <HeaderAction href="/" icon="external-link" label="Vitrine" />
            <HeaderAction onClick={() => supabase.auth.signOut()} icon="log-out" label="Déconnexion" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-5 pb-[calc(6.5rem+env(safe-area-inset-bottom))] sm:px-5 sm:pt-8 md:pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={section}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: EASE }}
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

      <MobileSectionNav
        sections={SECTIONS}
        active={section}
        onSelect={(key) => goTo(key)}
        layoutId="agency-section-pill-mobile"
      />

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
