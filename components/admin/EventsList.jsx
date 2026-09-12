"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { slugify, formatDateFr } from "@/lib/utils";
import { EASE } from "@/components/motion/primitives";
import { AdminButton, Card, Field, Input, Notice } from "@/components/admin/ui";
import AdminAuthGate, { FullPageLoader } from "@/components/admin/AuthGate";

/**
 * `/admin` — liste des événements gérés depuis ce projet Supabase.
 * Un compte agence (`app_metadata.role === "agency"`) voit tous les
 * événements et peut en créer ; un compte couple ne voit que le(s) sien(s)
 * (architecture multi-événements, voir `supabase/schema.sql`).
 * Chaque carte ouvre `/admin/[slug]`.
 */
export default function EventsList() {
  const supabase = getSupabaseBrowserClient();
  return (
    <AdminAuthGate supabase={supabase}>
      {(session) => <EventsListContent supabase={supabase} session={session} />}
    </AdminAuthGate>
  );
}

function EventsListContent({ supabase, session }) {
  const router = useRouter();
  const [events, setEvents] = useState(null);
  const [creating, setCreating] = useState(false);
  const isAgency = session.user.app_metadata?.role === "agency";

  const reload = () => {
    let query = supabase
      .from("events")
      .select("id, slug, name, bride_name, groom_name, wedding_date")
      .order("created_at", { ascending: false });
    if (!isAgency) query = query.eq("owner_id", session.user.id);
    return query.then(({ data }) => setEvents(data || []));
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, isAgency]);

  if (events === null) return <FullPageLoader />;

  return (
    <div className="min-h-svh bg-linen">
      <header className="sticky top-0 z-30 border-b border-cocoa/10 bg-cream/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
          <div className="min-w-0">
            <p className="truncate font-serif text-lg italic text-cocoa">Passora</p>
            <p className="hidden text-[0.6rem] font-medium uppercase tracking-[0.25em] text-cocoa/45 sm:block">
              {isAgency ? "Tous les événements" : "Mon espace"}
            </p>
          </div>
          <AdminButton
            variant="subtle"
            icon="log-out"
            onClick={() => supabase.auth.signOut()}
            title="Déconnexion"
          >
            <span className="hidden sm:inline">Déconnexion</span>
          </AdminButton>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-5">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-serif text-2xl font-medium text-cocoa">Événements</h1>
          {isAgency && events.length > 0 && (
            <AdminButton icon="plus" onClick={() => setCreating(true)}>
              Nouvel événement
            </AdminButton>
          )}
        </div>

        {isAgency && creating && (
          <div className="mb-8">
            <CreateEventForm
              session={session}
              onCancel={() => setCreating(false)}
              onCreated={(slug) => router.push(`/admin/${slug}`)}
            />
          </div>
        )}

        {events.length === 0 && !creating ? (
          <Card title="Aucun événement pour le moment" className="text-center">
            <p className="mb-6 text-sm font-light text-cocoa/60">
              {isAgency
                ? "Créez le premier événement pour commencer à en personnaliser le contenu."
                : "Aucun événement ne vous a encore été assigné."}
            </p>
            {isAgency && (
              <AdminButton icon="plus" onClick={() => setCreating(true)} className="mx-auto">
                Nouvel événement
              </AdminButton>
            )}
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <Link href={`/admin/${event.slug}`} className="block h-full">
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <p className="font-serif text-xl italic text-cocoa">
                      {event.bride_name} &amp; {event.groom_name}
                    </p>
                    <p className="mt-1 text-sm font-light text-cocoa/55">
                      {event.wedding_date ? formatDateFr(event.wedding_date) : "Date à définir"}
                    </p>
                    <p className="mt-3 text-xs font-light text-cocoa/40">/e/{event.slug}</p>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/** Formulaire minimal : les infos détaillées se complètent ensuite sur la page de l'événement. */
function CreateEventForm({ session, onCancel, onCreated }) {
  const [brideName, setBrideName] = useState("");
  const [groomName, setGroomName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [slugOverride, setSlugOverride] = useState(null);
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(null); // { slug, tempPassword, existingAccount }

  const slug = slugOverride ?? slugify(`${brideName} ${groomName}`);

  const create = async (e) => {
    e.preventDefault();
    const cleanSlug = slugify(slug);
    if (!brideName.trim() || !groomName.trim() || !cleanSlug || !ownerEmail.trim()) {
      setStatus({ tone: "error", text: "Merci de renseigner les deux prénoms, un lien et un email." });
      return;
    }
    setBusy(true);
    setStatus(null);

    const res = await fetch("/api/admin/create-event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        brideName: brideName.trim(),
        groomName: groomName.trim(),
        slug: cleanSlug,
        ownerEmail: ownerEmail.trim(),
      }),
    });
    const body = await res.json();

    if (!body.ok) {
      setStatus({ tone: "error", text: body.error || "Une erreur est survenue." });
      setBusy(false);
      return;
    }
    setCreated(body);
    setBusy(false);
  };

  if (created) {
    return (
      <Card title="Événement créé" description="Transmettez ces identifiants au couple.">
        <div className="space-y-4">
          {created.existingAccount ? (
            <Notice tone="success">
              Compte existant réutilisé pour cet email — le couple se connecte avec son mot de
              passe habituel.
            </Notice>
          ) : (
            <div className="rounded-xl border border-terracotta/20 bg-champagne/40 p-4 text-sm text-cocoa">
              <p className="mb-1 font-medium">Mot de passe temporaire (affiché une seule fois) :</p>
              <p className="font-mono text-base">{created.tempPassword}</p>
            </div>
          )}
          <AdminButton icon="check" onClick={() => onCreated(created.slug)}>
            Continuer →
          </AdminButton>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Nouvel événement" description="Vous pourrez compléter le reste juste après.">
      <form onSubmit={create} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Prénom de la mariée">
            <Input value={brideName} onChange={(e) => setBrideName(e.target.value)} required />
          </Field>
          <Field label="Prénom du marié">
            <Input value={groomName} onChange={(e) => setGroomName(e.target.value)} required />
          </Field>
        </div>
        <Field label="Lien (URL)" hint={`/e/${slug || "…"}`}>
          <Input value={slug} onChange={(e) => setSlugOverride(e.target.value)} required />
        </Field>
        <Field label="Email du couple" hint="Sert à créer (ou réutiliser) leur compte de connexion.">
          <Input
            type="email"
            value={ownerEmail}
            onChange={(e) => setOwnerEmail(e.target.value)}
            required
          />
        </Field>
        {status && <Notice tone={status.tone}>{status.text}</Notice>}
        <div className="flex flex-wrap items-center gap-3">
          <AdminButton icon="check" busy={busy} type="submit">
            Créer l’événement
          </AdminButton>
          <AdminButton variant="subtle" type="button" onClick={onCancel}>
            Annuler
          </AdminButton>
        </div>
      </form>
    </Card>
  );
}
