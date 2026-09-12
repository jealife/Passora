"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Icon from "@/components/ui/Icons";
import { EASE } from "@/components/motion/primitives";
import { Card, Field, Input, Notice } from "@/components/admin/ui";

/**
 * Passerelle d'authentification partagée par toutes les pages `/admin*`.
 *
 * Accès protégé par Supabase Auth (comptes créés dans le tableau de bord
 * Supabase) ; toutes les écritures sont en outre verrouillées par RLS.
 * Ne rend `children(session)` qu'une fois une session valide établie —
 * `session.user.id` et `session.user.app_metadata.role` servent à distinguer
 * un compte agence (accès à tout) d'un compte couple (son événement seul).
 */
export default function AdminAuthGate({ supabase, children }) {
  const [session, setSession] = useState(undefined); // undefined = chargement

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, nextSession) => setSession(nextSession));
    return () => subscription.unsubscribe();
  }, [supabase]);

  if (!supabase) return <SetupNotice />;
  if (session === undefined) return <FullPageLoader />;
  if (!session) return <LoginForm supabase={supabase} />;

  return children(session);
}

export function FullPageLoader() {
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
