"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, IconButton, Input, Notice } from "@/components/admin/ui";
import Icon from "@/components/ui/Icons";
import { LoaderCard } from "@/components/admin/ProgramManager";
import { buildTicketPdf, downloadPdf } from "@/lib/ticket-pdf";
import { classNames, normalizeName, slugify } from "@/lib/utils";

/**
 * Attribution d'une table aux invités ayant confirmé, et téléchargement de
 * leur billet PDF (QR code) pour envoi manuel. La table est enregistrée
 * dès que le champ perd le focus. Accès direct à Supabase, comme
 * GuestsManager/RsvpList : "rsvp_admin_all" couvre déjà ces colonnes.
 */
export default function SeatingManager({ supabase, event }) {
  const [rows, setRows] = useState(null);
  const [saved, setSaved] = useState({}); // id -> dernière table enregistrée
  const [rowState, setRowState] = useState({}); // id -> "saving" | "saved" | "error"
  const [search, setSearch] = useState("");
  const [onlyUnassigned, setOnlyUnassigned] = useState(false);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    supabase
      .from("rsvp")
      .select("*")
      .eq("event_id", event.id)
      .order("guest_name", { ascending: true })
      .then(({ data }) => {
        const list = data || [];
        setRows(list);
        setSaved(Object.fromEntries(list.map((r) => [r.id, r.table_label || ""])));
      });
  }, [supabase, event.id]);

  const byTable = useMemo(() => {
    const counts = new Map();
    for (const value of Object.values(saved)) {
      if (value) counts.set(value, (counts.get(value) || 0) + 1);
    }
    return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b, "fr", { numeric: true }));
  }, [saved]);

  const visible = useMemo(() => {
    if (!rows) return [];
    const query = normalizeName(search);
    return rows.filter(
      (row) =>
        (!query || normalizeName(row.guest_name).includes(query)) &&
        (!onlyUnassigned || !saved[row.id]),
    );
  }, [rows, search, onlyUnassigned, saved]);

  const setTable = (id, value) =>
    setRows((list) => list.map((r) => (r.id === id ? { ...r, table_label: value } : r)));

  const saveTable = async (row) => {
    const value = (row.table_label || "").trim();
    if (value === (saved[row.id] || "")) return;
    setRowState((s) => ({ ...s, [row.id]: "saving" }));
    const { error: updateError } = await supabase
      .from("rsvp")
      .update({ table_label: value || null })
      .eq("id", row.id);
    if (updateError) {
      setRowState((s) => ({ ...s, [row.id]: "error" }));
      setError(`Table de ${row.guest_name} non enregistrée : ${updateError.message}`);
      return;
    }
    setSaved((s) => ({ ...s, [row.id]: value }));
    setRowState((s) => ({ ...s, [row.id]: "saved" }));
    setError(null);
  };

  const download = async (row) => {
    setDownloadingId(row.id);
    try {
      const bytes = await buildTicketPdf({ event, rsvp: row });
      downloadPdf(bytes, `billet-${slugify(row.guest_name)}.pdf`);
    } catch (err) {
      setError(`Billet de ${row.guest_name} non généré : ${err.message}`);
    }
    setDownloadingId(null);
  };

  if (!rows) return <LoaderCard />;

  const unassigned = rows.filter((row) => !saved[row.id]).length;

  return (
    <Card
      title="Tables"
      description="Attribuez une table à chaque invité ayant confirmé. Le billet ne mentionne pas la table : elle s'affiche au scan, à l'entrée."
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
            {visible.map((row) => {
              const state = rowState[row.id];
              return (
                <li key={row.id} className="flex items-center gap-2.5 px-3 py-2.5 sm:gap-3 sm:px-4">
                  <p className="min-w-0 flex-1 truncate text-sm text-cocoa">{row.guest_name}</p>
                  <input
                    value={row.table_label || ""}
                    onChange={(e) => setTable(row.id, e.target.value)}
                    onBlur={() => saveTable(row)}
                    onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                    placeholder="Table"
                    aria-label={`Table de ${row.guest_name}`}
                    className={classNames(
                      "h-10 w-20 shrink-0 rounded-xl border bg-cream/50 px-2 text-center text-sm text-cocoa placeholder:text-cocoa/30 focus:outline-2 focus:outline-passora-gold/25 transition-colors",
                      state === "error" ? "border-rust/60" : "border-cocoa/15 focus:border-passora-gold-deep",
                    )}
                  />
                  <span className="flex w-4 shrink-0 justify-center" aria-live="polite">
                    {state === "saving" && <Icon name="loader" className="h-4 w-4 animate-spin-slow text-cocoa/40" />}
                    {state === "saved" && <Icon name="check" className="h-4 w-4 text-olive-deep" />}
                    {state === "error" && <Icon name="x" className="h-4 w-4 text-rust" />}
                  </span>
                  <IconButton
                    icon={downloadingId === row.id ? "loader" : "download"}
                    label={`Télécharger le billet de ${row.guest_name}`}
                    onClick={() => download(row)}
                    disabled={downloadingId === row.id}
                    className={downloadingId === row.id ? "[&_svg]:animate-spin-slow" : ""}
                  />
                </li>
              );
            })}
            {visible.length === 0 && (
              <li className="px-4 py-8 text-center text-sm font-light text-cocoa/50">Aucun résultat.</li>
            )}
          </ul>
        </div>
      )}
    </Card>
  );
}
