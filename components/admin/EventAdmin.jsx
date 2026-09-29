"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icons";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { eventInitials, eventTitle, eventTypeOf } from "@/lib/event-types";
import { classNames } from "@/lib/utils";
import { EASE } from "@/components/motion/primitives";
import { Card } from "@/components/admin/ui";
import { HeaderAction, MobileSectionNav } from "@/components/admin/SectionNav";
import WelcomeBanner from "@/components/admin/WelcomeBanner";
import EventForm from "@/components/admin/EventForm";
import ProgramManager from "@/components/admin/ProgramManager";
import VenuesManager from "@/components/admin/VenuesManager";
import GalleryManager from "@/components/admin/GalleryManager";
import GuestsManager from "@/components/admin/GuestsManager";
import RsvpList from "@/components/admin/RsvpList";
import SeatingManager from "@/components/admin/SeatingManager";
import Scanner from "@/components/admin/Scanner";
import AdminAuthGate, { FullPageLoader } from "@/components/admin/AuthGate";

// Quatre destinations principales ; les écrans d'une même famille sont
// regroupés en sous-onglets. Barre latérale sur grand écran, barre du bas
// et onglets sous l'en-tête sur mobile et tablette.
const SECTIONS = [
  { key: "accueil", label: "Accueil", icon: "home" },
  {
    key: "page",
    label: "Ma page",
    icon: "pencil",
    tabs: [
      { key: "infos", label: "Informations" },
      { key: "programme", label: "Programme" },
      { key: "lieux", label: "Lieux" },
      { key: "galerie", label: "Galerie" },
    ],
  },
  {
    key: "invites",
    label: "Invités",
    icon: "users",
    tabs: [
      { key: "liste", label: "Liste" },
      { key: "reponses", label: "Réponses" },
      { key: "tables", label: "Tables" },
    ],
  },
  { key: "scanner", label: "Scanner", icon: "camera" },
];

const sectionOf = (view) =>
  SECTIONS.find((s) => s.key === view || s.tabs?.some((t) => t.key === view));

function copyInviteLink(slug) {
  return navigator.clipboard.writeText(`${window.location.origin}/e/${slug}`);
}

/**
 * L'espace client : administration d'UN événement (`/admin/[slug]`), la
 * même pour tous les types d'événements (seul le vocabulaire s'adapte).
 * Accès protégé par Supabase Auth ; toutes les écritures sont en outre
 * verrouillées par RLS.
 */
export default function EventAdmin({ slug }) {
  const supabase = getSupabaseBrowserClient();
  return (
    <AdminAuthGate supabase={supabase}>
      {(session) => <EventAdminContent supabase={supabase} slug={slug} session={session} />}
    </AdminAuthGate>
  );
}

/** Contenu de l'espace client, une fois la session connue. */
export function EventAdminContent({ supabase, slug, session }) {
  const [event, setEvent] = useState(undefined); // undefined = chargement, null = introuvable
  const [section, setSection] = useState("accueil");
  // Dernier sous-onglet ouvert dans chaque section, retrouvé en y revenant.
  const [subTabs, setSubTabs] = useState({ page: "infos", invites: "liste" });

  // ── Service Worker ────────────────────────────────────────────────────────
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/admin/" })
        .catch(() => {}); // silencieux si HTTPS absent (dev local)
    }
  }, []);

  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => setEvent(data ?? null));
  }, [supabase, slug]);

  if (event === undefined) return <FullPageLoader />;
  if (event === null) return <EventNotFound />;

  const isAgency = session.user.app_metadata?.role === "agency";
  const isOwner = event.owner_id === session.user.id;
  if (!isAgency && !isOwner) return <AccessDenied />;

  const type = eventTypeOf(event);
  const initials = eventInitials(event);
  const title = type.couple ? `L'espace de ${initials.replace("&", " & ")}` : eventTitle(event);
  const current = SECTIONS.find((s) => s.key === section);
  const view = current.tabs ? subTabs[section] : section;
  const signOut = () => supabase.auth.signOut();

  /** Ouvre un écran précis, qu'il soit une section ou un sous-onglet. */
  const goTo = (target) => {
    const owner = sectionOf(target);
    if (!owner) return;
    if (owner.tabs && owner.key !== target) setSubTabs((prev) => ({ ...prev, [owner.key]: target }));
    setSection(owner.key);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="min-h-svh bg-linen">
      {/* ── Barre latérale (grand écran) ─────────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-cocoa/10 bg-cream lg:flex">
        <div className="flex items-center gap-3 border-b border-cocoa/10 px-5 py-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-passora-gold font-serif text-sm italic text-passora-ink">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate font-serif text-lg leading-tight italic text-cocoa">{eventTitle(event)}</p>
            <p className="mt-0.5 text-[0.6rem] font-medium tracking-[0.22em] text-cocoa/45 uppercase">{type.label}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Sections">
          {SECTIONS.map((item) => {
            const active = section === item.key;
            return (
              <div key={item.key}>
                <button
                  type="button"
                  onClick={() => goTo(item.key)}
                  aria-current={active && !item.tabs ? "page" : undefined}
                  className={classNames(
                    "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                    active ? "bg-white font-medium text-cocoa shadow-sm" : "text-cocoa/65 hover:bg-white/60 hover:text-cocoa",
                  )}
                >
                  <Icon name={item.icon} className={classNames("h-4 w-4", active ? "text-passora-gold-deep" : "text-cocoa/40")} />
                  {item.label}
                </button>
                {item.tabs && (
                  <div className="mt-1 mb-2 ml-5 space-y-0.5 border-l border-cocoa/10 pl-3">
                    {item.tabs.map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => goTo(tab.key)}
                        aria-current={view === tab.key ? "page" : undefined}
                        className={classNames(
                          "block w-full cursor-pointer rounded-lg px-3 py-1.5 text-left text-sm transition-colors",
                          view === tab.key ? "font-medium text-passora-gold-deep" : "text-cocoa/55 hover:text-cocoa",
                        )}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="space-y-0.5 border-t border-cocoa/10 px-3 py-3">
          <SidebarCopyLink slug={event.slug} />
          <SidebarAction href={`/e/${event.slug}`} external icon="external-link" label="Voir la page" />
          {isAgency && <SidebarAction href="/admin" icon="chevron-left" label="Tous les événements" />}
          <SidebarAction onClick={signOut} icon="log-out" label="Déconnexion" />
        </div>
      </aside>

      <div className="lg:pl-64">
        {/* ── En-tête (mobile et tablette) ───────────────────────────────── */}
        <header className="sticky top-0 z-30 border-b border-cocoa/10 bg-cream/90 backdrop-blur-md lg:hidden">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-5">
            <div className="flex min-w-0 items-center gap-2.5">
              {isAgency && (
                <Link
                  href="/admin"
                  aria-label="Tous les événements"
                  className="-ml-1 flex h-9 w-7 shrink-0 items-center justify-center text-cocoa/50 hover:text-cocoa"
                >
                  <Icon name="chevron-left" className="h-5 w-5" />
                </Link>
              )}
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-passora-gold font-serif text-sm italic text-passora-ink">
                {initials}
              </span>
              <p className="min-w-0 truncate font-serif text-base italic text-cocoa">{title}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <CopyLinkButton slug={event.slug} />
              <HeaderAction href={`/e/${event.slug}`} icon="external-link" label="Voir le site" />
              <HeaderAction onClick={signOut} icon="log-out" label="Déconnexion" />
            </div>
          </div>

          {current.tabs && (
            <nav
              className="flex gap-1 overflow-x-auto px-3 [scrollbar-width:none] sm:px-4 [&::-webkit-scrollbar]:hidden"
              aria-label={current.label}
            >
              {current.tabs.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => goTo(item.key)}
                  aria-current={view === item.key ? "page" : undefined}
                  className={classNames(
                    "relative shrink-0 cursor-pointer px-3 pt-1 pb-3 text-sm transition-colors",
                    view === item.key ? "font-medium text-cocoa" : "text-cocoa/50 hover:text-cocoa/80",
                  )}
                >
                  {item.label}
                  {view === item.key && (
                    <motion.span
                      layoutId={`admin-subtab-${current.key}`}
                      className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-passora-gold-deep"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                </button>
              ))}
            </nav>
          )}
        </header>

        <InstallBanner initials={initials} />

        <main className="mx-auto max-w-5xl px-4 pt-5 pb-[calc(6.5rem+env(safe-area-inset-bottom))] sm:px-5 sm:pt-8 lg:px-10 lg:pt-10 lg:pb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: EASE }}
            >
              {view === "accueil" && (
                <>
                  <WelcomeBanner supabase={supabase} event={event} onNavigate={goTo} />
                  <HomeShortcuts slug={event.slug} onNavigate={goTo} />
                </>
              )}
              {view === "infos" && (
                <EventForm supabase={supabase} event={event} onSaved={setEvent} isAgency={isAgency} />
              )}
              {view === "programme" && <ProgramManager supabase={supabase} eventId={event.id} />}
              {view === "lieux" && <VenuesManager supabase={supabase} eventId={event.id} />}
              {view === "galerie" && <GalleryManager supabase={supabase} eventId={event.id} />}
              {view === "liste" && <GuestsManager supabase={supabase} eventId={event.id} />}
              {view === "reponses" && <RsvpList supabase={supabase} eventId={event.id} />}
              {view === "tables" && <SeatingManager supabase={supabase} event={event} />}
              {view === "scanner" && <Scanner supabase={supabase} event={event} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Barre de navigation du bas (mobile et tablette) : 4 destinations */}
      <MobileSectionNav sections={SECTIONS} active={section} onSelect={goTo} />
    </div>
  );
}

/** Action du pied de la barre latérale (lien ou bouton). */
function SidebarAction({ href, external, onClick, icon, label }) {
  const className =
    "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-cocoa/60 transition-colors hover:bg-white/60 hover:text-cocoa";
  const content = (
    <>
      <Icon name={icon} className="h-4 w-4 text-cocoa/40" />
      {label}
    </>
  );
  if (href && external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }
  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

function SidebarCopyLink({ slug }) {
  const [copied, setCopied] = useState(false);
  const copy = () =>
    copyInviteLink(slug).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  return <SidebarAction onClick={copy} icon={copied ? "check" : "send"} label={copied ? "Lien copié" : "Copier le lien"} />;
}

/** Raccourcis de l'accueil : les tâches courantes, expliquées en une ligne. */
function HomeShortcuts({ slug, onNavigate }) {
  const [copied, setCopied] = useState(false);

  const share = () =>
    copyInviteLink(slug).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });

  const items = [
    {
      icon: copied ? "check" : "send",
      title: copied ? "Lien copié" : "Partager l'invitation",
      text: "Copiez le lien de votre page pour l'envoyer à vos invités.",
      onClick: share,
    },
    { icon: "pencil", title: "Ma page", text: "Textes, photo, programme, lieux et galerie.", onClick: () => onNavigate("infos") },
    { icon: "users", title: "Liste des invités", text: "Seuls ces noms peuvent confirmer leur présence.", onClick: () => onNavigate("liste") },
    { icon: "check", title: "Réponses", text: "Qui a confirmé, et leurs petits mots.", onClick: () => onNavigate("reponses") },
    { icon: "seat", title: "Tables et billets", text: "Attribuez les tables et envoyez les billets.", onClick: () => onNavigate("tables") },
    { icon: "camera", title: "Scanner les billets", text: "À l'entrée, le jour J : nom et table de l'invité.", onClick: () => onNavigate("scanner") },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <button
          key={item.icon + item.title}
          type="button"
          onClick={item.onClick}
          className="group flex cursor-pointer items-start gap-4 rounded-2xl border border-cocoa/8 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-passora-gold/40 hover:shadow-md active:scale-[0.99] sm:p-5"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-passora-gold/15 text-passora-gold-deep transition-colors group-hover:bg-passora-gold group-hover:text-passora-ink">
            <Icon name={item.icon} className="h-[1.1rem] w-[1.1rem]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-medium text-cocoa">{item.title}</span>
            <span className="mt-0.5 block text-sm leading-snug font-light text-cocoa/60">{item.text}</span>
          </span>
          <Icon name="chevron-right" className="mt-2.5 h-4 w-4 shrink-0 text-cocoa/25 transition-colors group-hover:text-cocoa/60" />
        </button>
      ))}
    </div>
  );
}

function EventNotFound() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-linen px-5">
      <Card title="Événement introuvable" className="max-w-md text-center">
        <p className="mb-6 text-sm font-light text-cocoa/60">
          Ce lien ne correspond à aucun événement.
        </p>
        <Link
          href="/admin"
          className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-passora-gold px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-passora-ink transition-colors hover:bg-passora-gold-deep"
        >
          ← Tous les événements
        </Link>
      </Card>
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-linen px-5">
      <Card title="Accès non autorisé" className="max-w-md text-center">
        <p className="mb-6 text-sm font-light text-cocoa/60">
          Cet événement n’est pas géré par votre compte.
        </p>
        <Link
          href="/admin"
          className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-passora-gold px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-passora-ink transition-colors hover:bg-passora-gold-deep"
        >
          ← Mon espace
        </Link>
      </Card>
    </div>
  );
}

/**
 * Bandeau d'installation PWA — affiché uniquement sur iOS Safari
 * quand l'app n'est pas encore ajoutée à l'écran d'accueil.
 * Dismissible ; la décision est mémorisée dans localStorage.
 */
function InstallBanner({ initials }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("pwa-banner-dismissed")) return;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    // Détection ponctuelle de plateforme au montage — pas une souscription à
    // une source externe changeante, donc pas de meilleur pattern applicable ici.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isIOS && !isStandalone) setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem("pwa-banner-dismissed", "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-4 right-4 z-50 flex items-start gap-3 rounded-2xl border border-passora-gold/25 bg-cream/95 px-4 py-3 shadow-lg backdrop-blur-md lg:bottom-6 lg:left-auto lg:right-6 lg:max-w-xs"
        role="status"
        aria-live="polite"
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-passora-gold font-serif text-xs italic text-passora-ink"
          aria-hidden="true"
        >
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-cocoa">Ajouter à l’écran d’accueil</p>
          <p className="mt-0.5 text-[0.65rem] leading-relaxed text-cocoa/60">
            Appuyez sur <span aria-label="Partager">⎋</span> puis{" "}
            <strong className="font-medium">Sur l’écran d’accueil</strong>{" "}
            <span aria-label="Plus">➕</span>
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 text-cocoa/40 transition-colors hover:text-cocoa"
          aria-label="Fermer"
        >
          <Icon name="x" className="h-4 w-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

function CopyLinkButton({ slug }) {
  const [copied, setCopied] = useState(false);

  const copy = () =>
    copyInviteLink(slug).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });

  return (
    <button
      type="button"
      onClick={copy}
      className="flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-cocoa/15 bg-cream/70 px-3 text-xs font-medium uppercase tracking-[0.12em] text-cocoa/80 transition-colors hover:bg-cocoa/10 active:scale-95"
      title="Copier le lien d'invitation"
      aria-label="Copier le lien d'invitation"
    >
      <Icon name={copied ? "check" : "send"} className="h-3.5 w-3.5 text-rust" />
      <span className="hidden lg:inline">{copied ? "Copié !" : "Copier le lien"}</span>
    </button>
  );
}
