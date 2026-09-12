"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Icon from "@/components/ui/Icons";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { slugify, formatDateFr } from "@/lib/utils";
import { EASE } from "@/components/motion/primitives";
import { AdminButton, Card, Field, Input, Notice } from "@/components/admin/ui";
import AdminAuthGate, { FullPageLoader } from "@/components/admin/AuthGate";

/**
 * `/admin` — liste de tous les événements gérés depuis ce projet Supabase,
 * avec la possibilité d'en créer un nouveau (architecture multi-événements,
 * voir `supabase/schema.sql`). Chaque carte ouvre `/admin/[slug]`.
 */
export default function EventsList() {
  const supabase = getSupabaseBrowserClient();
  return (
    <AdminAuthGate supabase={supabase}>
      <EventsListContent supabase={supabase} />
    </AdminAuthGate>
  );
}

function EventsListContent({ supabase }) {
  const router = useRouter();
  const [events, setEvents] = useState(null);
  const [creating, setCreating] = useState(false);

  const reload = () =>
    supabase
      .from("events")
      .select("id, slug, name, bride_name, groom_name, wedding_date")
      .order("created_at", { ascending: false })
      .then(({ data }) => setEvents(data || []));

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  if (events === null) return <FullPageLoader />;

  return (
    <div className="min-h-svh bg-linen">
      <header className="sticky top-0 z-30 border-b border-cocoa/10 bg-cream/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
          <div className="min-w-0">
            <p className="truncate font-serif text-lg italic text-cocoa">Passora</p>
            <p className="hidden text-[0.6rem] font-medium uppercase tracking-[0.25em] text-cocoa/45 sm:block">
              Tous les événements
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
          {events.length > 0 && (
            <AdminButton icon="plus" onClick={() => setCreating(true)}>
              Nouvel événement
            </AdminButton>
          )}
        </div>

        {creating && (
          <div className="mb-8">
            <CreateEventForm
              supabase={supabase}
              onCancel={() => setCreating(false)}
              onCreated={(slug) => router.push(`/admin/${slug}`)}
            />
          </div>
        )}

        {events.length === 0 && !creating ? (
          <Card title="Aucun événement pour le moment" className="text-center">
            <p className="mb-6 text-sm font-light text-cocoa/60">
              Créez le premier événement pour commencer à en personnaliser le contenu.
            </p>
            <AdminButton icon="plus" onClick={() => setCreating(true)} className="mx-auto">
              Nouvel événement
            </AdminButton>
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
function CreateEventForm({ supabase, onCancel, onCreated }) {
  const [brideName, setBrideName] = useState("");
  const [groomName, setGroomName] = useState("");
  const [slugOverride, setSlugOverride] = useState(null);
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  const slug = slugOverride ?? slugify(`${brideName} ${groomName}`);

  const create = async (e) => {
    e.preventDefault();
    const cleanSlug = slugify(slug);
    if (!brideName.trim() || !groomName.trim() || !cleanSlug) {
      setStatus({ tone: "error", text: "Merci de renseigner les deux prénoms et un lien valide." });
      return;
    }
    setBusy(true);
    setStatus(null);
    const { data, error } = await supabase
      .from("events")
      .insert({
        slug: cleanSlug,
        bride_name: brideName.trim(),
        groom_name: groomName.trim(),
        name: `Mariage de ${brideName.trim()} & ${groomName.trim()}`,
      })
      .select()
      .single();

    if (error) {
      setStatus(
        error.code === "23505"
          ? { tone: "error", text: "Ce lien est déjà utilisé, choisissez-en un autre." }
          : { tone: "error", text: `Erreur : ${error.message}` },
      );
      setBusy(false);
      return;
    }
    onCreated(data.slug);
  };

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
          <Input
            value={slug}
            onChange={(e) => setSlugOverride(e.target.value)}
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
