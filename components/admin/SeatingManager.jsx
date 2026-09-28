"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, IconButton, Input, Notice } from "@/components/admin/ui";
import { LoaderCard } from "@/components/admin/ProgramManager";
import TableInput from "@/components/admin/TableInput";
import { buildTicketPdf, canSharePdf, downloadPdf, sharePdf, ticketFileName } from "@/lib/ticket-pdf";
import { classNames, normalizeName } from "@/lib/utils";

/**
 * Invités ayant confirmé : attribuer une table à ceux qui n'en ont pas
 * encore, et leur envoyer leur billet PDF (téléchargement ou partage via
 * WhatsApp, e-mail…). Utile surtout pour les confirmations antérieures aux
 * billets : les nouveaux invités téléchargent le leur dès leur confirmation.
 * La table appartient à l'invité (`guests.table_label`, migration 011) :
 * c'est la même valeur que dans la liste des invités.
 */
export default function SeatingManager({ supabase, event }) {
  const [rows, setRows] = useState(null); // [{ id, guest_id, guest_name, table_label }]
  const [search, setSearch] = useState("");
  const [onlyUnassigned, setOnlyUnassigned] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null); // { id, action } pendant la génération d'un billet
  // L'admin n'est rendu que côté navigateur : `navigator` est disponible ici.
  const [canShare] = useState(() => typeof navigator !== "undefined" && canSharePdf());

  useEffect(() => {
    supabase
      .from("rsvp")
      .select("id, guest_id, guest_name, guests(table_label)")
      .eq("event_id", event.id)
      .order("guest_name", { ascending: true })
      .then(({ data, error: loadError }) => {
        if (loadError) setError(`Chargement impossible : ${loadError.message}`);
        setRows(
          (data || []).map(({ guests, ...row }) => ({ ...row, table_label: guests?.table_label || "" })),
        );
      });
  }, [supabase, event.id]);

  const byTable = useMemo(() => {
    const counts = new Map();
    for (const row of rows || []) {
      if (row.table_label) counts.set(row.table_label, (counts.get(row.table_label) || 0) + 1);
    }
    return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b, "fr", { numeric: true }));
  }, [rows]);

  const visible = useMemo(() => {
    if (!rows) return [];
    const query = normalizeName(search);
    return rows.filter(
      (row) =>
        (!query || normalizeName(row.guest_name).includes(query)) &&
        (!onlyUnassigned || !row.table_label),
    );
  }, [rows, search, onlyUnassigned]);

  const saveTable = async (row, value) => {
    const { error: updateError } = await supabase
      .from("guests")
      .update({ table_label: value || null })
      .eq("id", row.guest_id);
    if (updateError) return updateError.message;
    setRows((list) => list.map((r) => (r.guest_id === row.guest_id ? { ...r, table_label: value } : r)));
  };

  const sendTicket = async (row, action) => {
    setBusy({ id: row.id, action });
    try {
      const bytes = await buildTicketPdf({ event, rsvp: row });
      const filename = ticketFileName(row.guest_name);
      if (action === "share") await sharePdf(bytes, filename, `Billet · ${row.guest_name}`);
      else downloadPdf(bytes, filename);
    } catch (err) {
      setError(`Billet de ${row.guest_name} non généré : ${err.message}`);
    }
    setBusy(null);
  };

  if (!rows) return <LoaderCard />;

  const unassigned = rows.filter((row) => !row.table_label).length;
  const isBusy = (row, action) => busy?.id === row.id && busy.action === action;

  return (
    <Card
      title="Tables et billets"
      description="Les invités qui ont confirmé. Attribuez une table à ceux qui n'en ont pas encore, et envoyez leur billet à ceux qui ont confirmé avant l'arrivée des billets. La table n'est pas imprimée sur le billet : elle s'affiche au scan, à l'entrée."
    >
      {rows.length === 0 ? (
        <p className="py-10 text-center text-sm font-light text-cocoa/50">
          Aucune confirmation pour le moment. Les invités apparaissent ici dès qu&apos;ils confirment leur présence.
        </p>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-cocoa/65">
            <span>
              <strong className="font-medium text-cocoa tabular-nums">{rows.length}</strong>{" "}
              {rows.length > 1 ? "confirmés" : "confirmé"}
            </span>
            <span className={unassigned ? "text-rust" : "text-olive-deep"}>
              <strong className="font-medium tabular-nums">{unassigned}</strong> sans table
            </span>
          </div>

          {byTable.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {byTable.map(([table, count]) => (
                <span
                  key={table}
                  className="rounded-lg border border-cocoa/10 bg-cream/60 px-2.5 py-1 text-xs text-cocoa/75"
                >
                  Table <strong className="font-medium text-cocoa">{table}</strong>
                  <span className="text-cocoa/45"> · {count}</span>
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="search"
              placeholder="Rechercher un invité…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sm:flex-1"
            />
            <button
              type="button"
              onClick={() => setOnlyUnassigned((v) => !v)}
              aria-pressed={onlyUnassigned}
              className={classNames(
                "shrink-0 cursor-pointer rounded-xl border px-4 py-2.5 text-sm transition-colors",
                onlyUnassigned
                  ? "border-passora-gold-deep bg-passora-gold/15 text-cocoa"
                  : "border-cocoa/15 text-cocoa/65 hover:border-cocoa/30",
              )}
            >
              Sans table uniquement
            </button>
          </div>

          {error && <Notice tone="error">{error}</Notice>}

          <ul className="divide-y divide-cocoa/6 overflow-hidden rounded-2xl border border-cocoa/8">
            {visible.map((row) => (
              <li key={row.id} className="flex items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4">
                <p className="min-w-0 flex-1 text-sm break-words text-cocoa">{row.guest_name}</p>
                <TableInput
                  guestName={row.guest_name}
                  value={row.table_label}
                  onSave={(value) => saveTable(row, value)}
                />
                {canShare && (
                  <IconButton
                    icon={isBusy(row, "share") ? "loader" : "share"}
                    label={`Partager le billet de ${row.guest_name}`}
                    onClick={() => sendTicket(row, "share")}
                    disabled={Boolean(busy)}
                    className={isBusy(row, "share") ? "[&_svg]:animate-spin-slow" : ""}
                  />
                )}
                <IconButton
                  icon={isBusy(row, "download") ? "loader" : "download"}
                  label={`Télécharger le billet de ${row.guest_name}`}
                  onClick={() => sendTicket(row, "download")}
                  disabled={Boolean(busy)}
                  className={isBusy(row, "download") ? "[&_svg]:animate-spin-slow" : ""}
                />
              </li>
            ))}
            {visible.length === 0 && (
              <li className="px-4 py-8 text-center text-sm font-light text-cocoa/50">Aucun résultat.</li>
            )}
          </ul>
        </div>
      )}
    </Card>
  );
}
