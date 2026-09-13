"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icons";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { classNames } from "@/lib/utils";
import { EASE } from "@/components/motion/primitives";
import { AdminButton, Card } from "@/components/admin/ui";
import WelcomeBanner from "@/components/admin/WelcomeBanner";
import EventForm from "@/components/admin/EventForm";
import ProgramManager from "@/components/admin/ProgramManager";
import VenuesManager from "@/components/admin/VenuesManager";
import GalleryManager from "@/components/admin/GalleryManager";
import GuestsManager from "@/components/admin/GuestsManager";
import RsvpList from "@/components/admin/RsvpList";
import AdminAuthGate, { FullPageLoader } from "@/components/admin/AuthGate";

const TABS = [
  { key: "infos", label: "Informations", shortLabel: "Infos", icon: "pencil" },
  { key: "programme", label: "Programme", shortLabel: "Prog.", icon: "clock" },
  { key: "lieux", label: "Lieux", shortLabel: "Lieux", icon: "map-pin" },
  { key: "galerie", label: "Galerie", shortLabel: "Galerie", icon: "image" },
  { key: "invites", label: "Invités", shortLabel: "Invités", icon: "users" },
  { key: "rsvp", label: "Confirmations", shortLabel: "RSVP", icon: "check" },
];

/**
 * L'espace des mariés — administration d'UN événement (`/admin/[slug]`).
 * Accès protégé par Supabase Auth (comptes créés dans le tableau de bord
 * Supabase) ; toutes les écritures sont en outre verrouillées par RLS.
 */
export default function EventAdmin({ slug }) {
  const supabase = getSupabaseBrowserClient();
  return (
    <AdminAuthGate supabase={supabase}>
      {(session) => <EventAdminContent supabase={supabase} slug={slug} session={session} />}
    </AdminAuthGate>
  );
}

function EventAdminContent({ supabase, slug, session }) {
  const [event, setEvent] = useState(undefined); // undefined = chargement, null = introuvable
  const [tab, setTab] = useState("infos");

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

  const initials = `${(event.bride_name || "M")[0]} & ${(event.groom_name || "J")[0]}`;

  return (
    <div className="min-h-svh bg-linen">
      <header className="sticky top-0 z-30 border-b border-cocoa/10 bg-cream/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
          <div className="flex items-center gap-3.5">
            {/* Monogramme du couple */}
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-passora-gold font-serif text-sm italic text-passora-ink">
              {initials.replace(/ /g, "")}
            </span>
            <div className="min-w-0">
              <p className="truncate font-serif text-base italic text-cocoa sm:text-lg">
                L’espace de {initials}
              </p>
              <Link
                href="/admin"
                className="hidden text-[0.6rem] font-medium uppercase tracking-[0.25em] text-cocoa/45 hover:text-cocoa/70 sm:block"
              >
                ← Tous les événements
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CopyLinkButton slug={event.slug} />
            <a
              href={`/e/${event.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full text-cocoa/60 transition-colors hover:bg-cocoa/5 hover:text-cocoa sm:h-auto sm:w-auto sm:flex-row sm:gap-2 sm:px-4 sm:py-2 sm:text-xs sm:font-medium sm:uppercase sm:tracking-[0.15em]"
              title="Voir le site"
            >
              <Icon name="external-link" className="h-4.5 w-4.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Voir le site</span>
            </a>
            <AdminButton
              variant="subtle"
              icon="log-out"
              onClick={() => supabase.auth.signOut()}
              className="h-9 w-9 !p-0 justify-center sm:h-auto sm:w-auto sm:!px-5 sm:!py-2.5"
              title="Déconnexion"
            >
              <span className="hidden sm:inline">Déconnexion</span>
            </AdminButton>
          </div>
        </div>

        {/* Navigation du haut pour grand écran */}
        <nav className="mx-auto hidden max-w-6xl gap-1 overflow-x-auto px-5 pb-3 sm:flex">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={classNames(
                "relative flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.15em] transition-colors",
                tab === item.key ? "text-passora-ink" : "text-cocoa/55 hover:bg-cocoa/5 hover:text-cocoa",
              )}
            >
              {tab === item.key && (
                <motion.span
                  layoutId="admin-tab-pill"
                  className="absolute inset-0 rounded-full bg-passora-gold"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative flex items-center gap-2">
                <Icon name={item.icon} className="h-3.5 w-3.5" />
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </header>

      {/* Navigation basse fixe pour mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-cocoa/10 bg-cream/95 pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.03)] backdrop-blur-md sm:hidden">
        <div className="flex h-16 items-center justify-around px-2">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={classNames(
                "flex flex-1 flex-col items-center justify-center gap-1.5 py-1 text-center transition-colors relative h-full",
                tab === item.key ? "text-passora-gold-deep" : "text-cocoa/50",
              )}
            >
              {tab === item.key && (
                <motion.span
                  layoutId="admin-tab-pill-mobile"
                  className="absolute top-0 h-0.5 w-10 rounded-full bg-passora-gold"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <Icon name={item.icon} className="h-5 w-5" />
              <span className="text-[0.58rem] font-medium tracking-wider uppercase leading-none">
                {item.shortLabel}
              </span>
            </button>
          ))}
        </div>
      </nav>

      <InstallBanner initials={initials} />
      <main className="mx-auto max-w-6xl px-4 py-6 pb-28 sm:px-5 sm:py-8">
        <WelcomeBanner supabase={supabase} event={event} onNavigate={setTab} />

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {tab === "infos" && (
              <EventForm supabase={supabase} event={event} onSaved={setEvent} isAgency={isAgency} />
            )}
            {tab === "programme" && <ProgramManager supabase={supabase} eventId={event.id} />}
            {tab === "lieux" && <VenuesManager supabase={supabase} eventId={event.id} />}
            {tab === "galerie" && <GalleryManager supabase={supabase} eventId={event.id} />}
            {tab === "invites" && <GuestsManager supabase={supabase} eventId={event.id} />}
            {tab === "rsvp" && <RsvpList supabase={supabase} eventId={event.id} />}
          </motion.div>
        </AnimatePresence>
      </main>
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
        className="fixed bottom-20 left-4 right-4 z-50 flex items-start gap-3 rounded-2xl border border-passora-gold/25 bg-cream/95 px-4 py-3 shadow-lg backdrop-blur-md sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-xs"
        role="status"
        aria-live="polite"
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-passora-gold font-serif text-xs italic text-passora-ink"
          aria-hidden="true"
        >
          {initials.replace(/ /g, "")}
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

  const copy = () => {
    const url = `${window.location.origin}/e/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="flex h-9 items-center justify-center gap-1.5 rounded-full border border-cocoa/15 bg-cream/70 px-3 text-xs font-medium uppercase tracking-[0.12em] text-cocoa/80 transition-colors hover:bg-cocoa/10 active:scale-95 cursor-pointer"
      title="Copier le lien d'invitation"
    >
      <Icon name={copied ? "check" : "send"} className="h-3.5 w-3.5 text-rust" />
      <span className="hidden sm:inline">{copied ? "Copié !" : "Copier le lien"}</span>
    </button>
  );
}
