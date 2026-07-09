"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icons";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { classNames } from "@/lib/utils";
import { EASE } from "@/components/motion/primitives";
import { AdminButton, Card, Field, Input, Notice } from "@/components/admin/ui";
import WelcomeBanner from "@/components/admin/WelcomeBanner";
import EventForm from "@/components/admin/EventForm";
import ProgramManager from "@/components/admin/ProgramManager";
import VenuesManager from "@/components/admin/VenuesManager";
import GalleryManager from "@/components/admin/GalleryManager";
import GuestsManager from "@/components/admin/GuestsManager";
import RsvpList from "@/components/admin/RsvpList";

const TABS = [
  { key: "infos", label: "Informations", shortLabel: "Infos", icon: "pencil" },
  { key: "programme", label: "Programme", shortLabel: "Prog.", icon: "clock" },
  { key: "lieux", label: "Lieux", shortLabel: "Lieux", icon: "map-pin" },
  { key: "galerie", label: "Galerie", shortLabel: "Galerie", icon: "image" },
  { key: "invites", label: "Invités", shortLabel: "Invités", icon: "users" },
  { key: "rsvp", label: "Confirmations", shortLabel: "RSVP", icon: "check" },
];

/**
 * L'espace des mariés — administration personnalisée de l'événement.
 * Accès protégé par Supabase Auth (comptes créés dans le tableau de bord
 * Supabase) ; toutes les écritures sont en outre verrouillées par RLS.
 */
export default function AdminApp() {
  const supabase = getSupabaseBrowserClient();
  const [session, setSession] = useState(undefined); // undefined = chargement
  const [event, setEvent] = useState(null);
  const [tab, setTab] = useState("infos");

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, nextSession) => setSession(nextSession));
    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!supabase || !session) return;
    supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setEvent(data));
  }, [supabase, session]);

  if (!supabase) return <SetupNotice />;
  if (session === undefined) return <FullPageLoader />;
  if (!session) return <LoginForm supabase={supabase} />;

  const initials = event
    ? `${(event.bride_name || "M")[0]} & ${(event.groom_name || "J")[0]}`
    : "M & J";

  return (
    <div className="min-h-svh bg-linen">
      <header className="sticky top-0 z-30 border-b border-cocoa/10 bg-cream/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
          <div className="flex items-center gap-3.5">
            {/* Monogramme dans une petite arche */}
            <span className="flex h-11 w-9 items-end justify-center rounded-t-full border border-terracotta/40 bg-champagne/60 pb-1 font-serif text-sm italic text-rust">
              {initials.replace(/ /g, "")}
            </span>
            <div className="min-w-0">
              <p className="truncate font-serif text-base italic text-cocoa sm:text-lg">
                {event ? `L’espace de ${initials}` : "Administration"}
              </p>
              <p className="hidden text-[0.6rem] font-medium uppercase tracking-[0.25em] text-cocoa/45 sm:block">
                Notre mariage, à notre image
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
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
                tab === item.key ? "text-cream" : "text-cocoa/55 hover:bg-cocoa/5 hover:text-cocoa",
              )}
            >
              {tab === item.key && (
                <motion.span
                  layoutId="admin-tab-pill"
                  className="absolute inset-0 rounded-full bg-rust"
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
                tab === item.key ? "text-rust" : "text-cocoa/50",
              )}
            >
              {tab === item.key && (
                <motion.span
                  layoutId="admin-tab-pill-mobile"
                  className="absolute top-0 h-0.5 w-10 rounded-full bg-rust"
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

      <main className="mx-auto max-w-6xl px-4 py-6 pb-28 sm:px-5 sm:py-8">
        {!event ? (
          <Card title="Aucun événement trouvé">
            <p className="text-sm font-light text-cocoa/70">
              Exécutez le script{" "}
              <code className="rounded bg-cocoa/8 px-1.5 py-0.5">supabase/schema.sql</code> dans
              l’éditeur SQL de Supabase pour créer les tables et l’événement initial.
            </p>
          </Card>
        ) : (
          <>
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
                  <EventForm supabase={supabase} event={event} onSaved={setEvent} />
                )}
                {tab === "programme" && <ProgramManager supabase={supabase} eventId={event.id} />}
                {tab === "lieux" && <VenuesManager supabase={supabase} eventId={event.id} />}
                {tab === "galerie" && <GalleryManager supabase={supabase} eventId={event.id} />}
                {tab === "invites" && <GuestsManager supabase={supabase} eventId={event.id} />}
                {tab === "rsvp" && <RsvpList supabase={supabase} eventId={event.id} />}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </main>
    </div>
  );
}

function FullPageLoader() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-linen">
      <Icon name="loader" className="h-8 w-8 animate-spin-slow text-terracotta" />
    </div>
  );
}

function SetupNotice() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-linen px-5">
      <Card title="Supabase n'est pas configuré" className="max-w-lg">
        <ol className="list-decimal space-y-2 pl-5 text-sm font-light text-cocoa/75">
          <li>Créez un projet sur supabase.com.</li>
          <li>
            Exécutez <code className="rounded bg-cocoa/8 px-1.5 py-0.5">supabase/schema.sql</code>{" "}
            dans l’éditeur SQL.
          </li>
          <li>
            Copiez <code className="rounded bg-cocoa/8 px-1.5 py-0.5">.env.local.example</code> vers{" "}
            <code className="rounded bg-cocoa/8 px-1.5 py-0.5">.env.local</code> et renseignez vos
            clés.
          </li>
          <li>Créez un utilisateur (Authentication &gt; Users) pour vous connecter ici.</li>
        </ol>
      </Card>
    </div>
  );
}

function LoginForm({ supabase }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) setError("Identifiants incorrects. Merci de réessayer.");
    setBusy(false);
  };

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-linen px-5">
      {/* Décor terracotta */}
      <div
        aria-hidden="true"
        className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blush/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -right-28 -bottom-28 h-96 w-96 rounded-full bg-terracotta/15 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="relative w-full max-w-md"
      >
        <div className="mb-8 text-center">
          {/* Monogramme dans une arche */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
            className="mx-auto flex h-24 w-20 items-end justify-center rounded-t-full border border-terracotta/40 bg-champagne/50 pb-2"
          >
            <p className="font-serif text-3xl italic text-rust">M&amp;J</p>
          </motion.div>
          <p className="mt-4 font-serif text-2xl italic text-cocoa">Bienvenue chez vous</p>
          <p className="mt-1.5 text-[0.68rem] font-medium uppercase tracking-[0.3em] text-cocoa/50">
            L’espace des mariés
          </p>
        </div>
        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Adresse e-mail">
              <Input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label="Mot de passe">
              <Input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            {error && <Notice tone="error">{error}</Notice>}
            <button
              type="submit"
              disabled={busy}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-rust px-5 py-3 text-xs font-medium uppercase tracking-[0.2em] text-cream transition-colors hover:bg-rust-deep disabled:opacity-50"
            >
              {busy && <Icon name="loader" className="h-4 w-4 animate-spin-slow" />}
              Ouvrir notre espace
            </button>
          </form>
        </Card>
        <p className="mt-6 text-center font-serif text-sm italic text-cocoa/50">
          « Deux cœurs, une seule organisation. »
        </p>
      </motion.div>
    </div>
  );
}
