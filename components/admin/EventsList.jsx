"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatDateFr } from "@/lib/utils";
import { EASE } from "@/components/motion/primitives";
import { AdminButton, Card } from "@/components/admin/ui";
import AdminAuthGate, { FullPageLoader, PassoraLogo } from "@/components/admin/AuthGate";
import AgencyDashboard from "@/components/admin/agency/AgencyDashboard";

/**
 * `/admin` — un compte agence (`app_metadata.role === "agency"`) arrive sur
 * le tableau de bord de la plateforme ; un compte couple sur la liste de ses
 * événements, ou directement sur son événement s'il n'en a qu'un.
 */
export default function EventsList() {
  const supabase = getSupabaseBrowserClient();
  return (
    <AdminAuthGate supabase={supabase}>
      {(session) =>
        session.user.app_metadata?.role === "agency" ? (
          <AgencyDashboard supabase={supabase} session={session} />
        ) : (
          <CoupleEvents supabase={supabase} session={session} />
        )
      }
    </AdminAuthGate>
  );
}

function CoupleEvents({ supabase, session }) {
  const router = useRouter();
  const [events, setEvents] = useState(null);

  useEffect(() => {
    supabase
      .from("events")
      .select("id, slug, bride_name, groom_name, wedding_date")
      .eq("owner_id", session.user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data?.length === 1) router.replace(`/admin/${data[0].slug}`);
        else setEvents(data || []);
      });
  }, [supabase, session.user.id, router]);

  if (events === null) return <FullPageLoader />;

  return (
    <div className="min-h-svh bg-linen">
      <header className="sticky top-0 z-30 border-b border-cocoa/10 bg-cream/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <PassoraLogo className="h-8 w-8" />
            <div className="min-w-0">
              <p className="truncate font-serif text-lg italic text-cocoa">Passora</p>
              <p className="hidden text-[0.6rem] font-medium uppercase tracking-[0.25em] text-cocoa/45 sm:block">
                Mon espace
              </p>
            </div>
          </div>
          <AdminButton variant="subtle" icon="log-out" onClick={() => supabase.auth.signOut()} title="Déconnexion">
            <span className="hidden sm:inline">Déconnexion</span>
          </AdminButton>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-5">
        <h1 className="mb-6 font-serif text-2xl font-medium text-cocoa">Mes événements</h1>

        {events.length === 0 ? (
          <Card title="Aucun événement pour le moment" className="text-center">
            <p className="text-sm font-light text-cocoa/60">
              Aucun événement ne vous a encore été confié. Contactez l&apos;agence si vous pensez qu&apos;il
              s&apos;agit d&apos;une erreur.
            </p>
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
