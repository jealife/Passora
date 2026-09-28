"use client";

import { useEffect, useState } from "react";
import { AdminButton, Card, Input, Notice } from "@/components/admin/ui";
import { LoaderCard } from "@/components/admin/ProgramManager";
import { buildTicketPdf, downloadPdf } from "@/lib/ticket-pdf";
import { slugify } from "@/lib/utils";

/**
 * Attribution des tables/places aux invités ayant confirmé leur présence,
 * et génération du billet PDF (QR code) à télécharger pour envoi manuel.
 * Accès direct à Supabase, comme GuestsManager/RsvpList — les policies
 * RLS existantes ("rsvp_admin_all") couvrent déjà ces colonnes.
 */
export default function SeatingManager({ supabase, event }) {
  const [rows, setRows] = useState(null);
  const [status, setStatus] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    supabase
      .from("rsvp")
      .select("*")
      .eq("event_id", event.id)
      .order("guest_name", { ascending: true })
      .then(({ data }) => setRows(data || []));
  }, [supabase, event.id]);

  const setField = (id, field, value) =>
    setRows((list) => list.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  const save = async (row) => {
    setSavingId(row.id);
    const { error } = await supabase
      .from("rsvp")
      .update({ table_label: row.table_label || null, seat_label: row.seat_label || null })
      .eq("id", row.id);
    setStatus(
      error
        ? { tone: "error", text: `Erreur : ${error.message}` }
        : { tone: "success", text: `Placement de ${row.guest_name} enregistré.` },
    );
    setSavingId(null);
  };

  const download = async (row) => {
    setDownloadingId(row.id);
    try {
      const bytes = await buildTicketPdf({ event, rsvp: row });
      downloadPdf(bytes, `billet-${slugify(row.guest_name)}.pdf`);
    } catch (error) {
      setStatus({ tone: "error", text: `Erreur lors de la génération du billet : ${error.message}` });
    }
    setDownloadingId(null);
  };

  if (!rows) return <LoaderCard />;

  return (
    <Card
      title="Placement"
      description="Attribuez une table et une place aux invités ayant confirmé, puis téléchargez leur billet."
    >
      {status && <div className="mb-4"><Notice tone={status.tone}>{status.text}</Notice></div>}

      {rows.length === 0 ? (
        <p className="py-10 text-center text-sm font-light text-cocoa/50">
          Aucune confirmation pour le moment.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-col gap-3 rounded-2xl border border-cocoa/8 bg-cream/40 p-4 sm:flex-row sm:items-end sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="mb-2 truncate font-medium text-cocoa">{row.guest_name}</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Table"
                    value={row.table_label || ""}
                    onChange={(e) => setField(row.id, "table_label", e.target.value)}
                    className="w-24"
                  />
                  <Input
                    placeholder="Place"
                    value={row.seat_label || ""}
                    onChange={(e) => setField(row.id, "seat_label", e.target.value)}
                    className="w-24"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <AdminButton
                  variant="subtle"
                  icon="check"
                  busy={savingId === row.id}
                  onClick={() => save(row)}
                  className="justify-center"
                >
                  Enregistrer
                </AdminButton>
                <AdminButton
                  icon="download"
                  busy={downloadingId === row.id}
                  onClick={() => download(row)}
                  className="justify-center"
                >
                  Billet
                </AdminButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
