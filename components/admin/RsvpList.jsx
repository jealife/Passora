"use client";

import { useEffect, useState } from "react";
import { AdminButton, Card } from "@/components/admin/ui";
import { LoaderCard } from "@/components/admin/ProgramManager";

/** Confirmations de présence : statistiques, messages et export CSV. */
export default function RsvpList({ supabase, eventId }) {
  const [rsvps, setRsvps] = useState(null);
  const [guestCount, setGuestCount] = useState(0);

  useEffect(() => {
    supabase
      .from("rsvp")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false })
      .then(({ data }) => setRsvps(data || []));
    supabase
      .from("guests")
      .select("id", { count: "exact", head: true })
      .eq("event_id", eventId)
      .then(({ count }) => setGuestCount(count || 0));
  }, [supabase, eventId]);

  const exportCsv = () => {
    const lines = [
      "Nom;Message;Date de confirmation",
      ...rsvps.map((rsvp) =>
        [
          rsvp.guest_name,
          (rsvp.message || "").replace(/[\n;]/g, " "),
          new Date(rsvp.created_at).toLocaleString("fr-FR"),
        ].join(";"),
      ),
    ];
    const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "confirmations.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  if (!rsvps) return <LoaderCard />;

  const rate = guestCount ? Math.round((rsvps.length / guestCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          { value: rsvps.length, label: "Présences" },
          { value: guestCount, label: "Invités" },
          { value: `${rate}%`, label: "Taux" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-cocoa/10 bg-white p-3 text-center shadow-sm sm:p-6 sm:rounded-3xl"
          >
            <p className="font-serif text-2xl font-medium text-rust tabular-nums sm:text-4xl">{stat.value}</p>
            <p className="mt-1 text-[0.55rem] sm:text-[0.65rem] leading-none font-medium uppercase tracking-[0.08em] sm:tracking-[0.18em] text-cocoa/55">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <Card
        title="Réponses reçues"
        description="Classées de la plus récente à la plus ancienne."
        actions={
          <AdminButton
            variant="subtle"
            icon="download"
            onClick={exportCsv}
            disabled={!rsvps.length}
            className="w-full sm:w-auto text-[10px] sm:text-xs justify-center"
          >
            Exporter (CSV)
          </AdminButton>
        }
      >
        {rsvps.length === 0 ? (
          <p className="py-10 text-center text-sm font-light text-cocoa/50">
            Aucune confirmation pour le moment.
          </p>
        ) : (
          <ul className="space-y-3">
            {rsvps.map((rsvp) => (
              <li key={rsvp.id} className="rounded-2xl border border-cocoa/8 bg-cream/40 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium text-cocoa">{rsvp.guest_name}</p>
                  <p className="text-xs font-light text-cocoa/50">
                    {new Date(rsvp.created_at).toLocaleString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {rsvp.message && (
                  <p className="mt-2 font-serif text-base italic text-cocoa/75">
                    « {rsvp.message} »
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
