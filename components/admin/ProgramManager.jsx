"use client";

import { useEffect, useState } from "react";
import { AdminButton, Card, IconButton, Input, Notice } from "@/components/admin/ui";
import Icon from "@/components/ui/Icons";

const ICON_OPTIONS = [
  { value: "kola", label: "Coutumier" },
  { value: "rings", label: "Alliances" },
  { value: "glass", label: "Réception" },
  { value: "heart", label: "Cœur" },
  { value: "music", label: "Musique" },
];

/**
 * Édition du programme : lignes (section, heure, intitulé) réordonnables.
 * L'enregistrement remplace le programme complet, dans l'ordre affiché.
 */
export default function ProgramManager({ supabase, eventId }) {
  const [rows, setRows] = useState(null);
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase
      .from("program")
      .select("*")
      .eq("event_id", eventId)
      .order("sort_order", { ascending: true })
      .then(({ data }) => setRows(data || []));
  }, [supabase, eventId]);

  const update = (index, key, value) =>
    setRows((r) => r.map((row, i) => (i === index ? { ...row, [key]: value } : row)));

  const move = (index, delta) =>
    setRows((r) => {
      const next = [...r];
      const target = index + delta;
      if (target < 0 || target >= next.length) return r;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const addRow = () =>
    setRows((r) => [
      ...r,
      {
        section: r[r.length - 1]?.section || "Cérémonie",
        icon: r[r.length - 1]?.icon || "rings",
        time: "",
        label: "",
      },
    ]);

  const save = async () => {
    setBusy(true);
    setStatus(null);
    const payload = rows
      .filter((row) => row.time.trim() && row.label.trim())
      .map((row, index) => ({
        event_id: eventId,
        section: row.section.trim(),
        icon: row.icon || "rings",
        time: row.time.trim(),
        label: row.label.trim(),
        sort_order: index,
      }));

    const { error: deleteError } = await supabase.from("program").delete().eq("event_id", eventId);
    const { error: insertError } = deleteError
      ? { error: deleteError }
      : await supabase.from("program").insert(payload);

    setStatus(
      insertError
        ? { tone: "error", text: `Erreur : ${insertError.message}` }
        : { tone: "success", text: "Programme enregistré." },
    );
    setBusy(false);
  };

  if (!rows) return <LoaderCard />;

  return (
    <Card
      title="Programme de la journée"
      description="Chaque ligne = un moment. Regroupez-les par section (cérémonie coutumière, civile, réception…)."
      actions={
        <div className="flex items-center gap-3">
          <AdminButton variant="subtle" icon="plus" onClick={addRow}>
            Ajouter un moment
          </AdminButton>
          <AdminButton icon="check" busy={busy} onClick={save}>
            Enregistrer
          </AdminButton>
        </div>
      }
    >
      {status && <div className="mb-4">{<Notice tone={status.tone}>{status.text}</Notice>}</div>}

      <div className="space-y-2.5">
        {rows.map((row, index) => (
          <div
            key={row.id ?? `new-${index}`}
            className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-2xl border border-cocoa/8 bg-cream/40 p-3 sm:grid-cols-[minmax(9rem,1.2fr)_auto_minmax(5rem,0.5fr)_2fr_auto]"
          >
            <Input
              aria-label="Section"
              placeholder="Section (ex. Réception)"
              value={row.section}
              onChange={(e) => update(index, "section", e.target.value)}
            />
            <select
              aria-label="Icône"
              value={row.icon || "rings"}
              onChange={(e) => update(index, "icon", e.target.value)}
              className="cursor-pointer rounded-xl border border-cocoa/15 bg-cream/50 px-3 py-2.5 text-sm text-cocoa focus:border-terracotta focus:outline-2 focus:outline-terracotta/25"
            >
              {ICON_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Input
              aria-label="Heure"
              placeholder="08h00"
              value={row.time}
              onChange={(e) => update(index, "time", e.target.value)}
            />
            <Input
              aria-label="Intitulé"
              placeholder="Intitulé du moment"
              value={row.label}
              onChange={(e) => update(index, "label", e.target.value)}
            />
            <div className="flex items-center justify-end gap-0.5">
              <IconButton icon="chevron-down" label="Monter" onClick={() => move(index, -1)} className="rotate-180" disabled={index === 0} />
              <IconButton icon="chevron-down" label="Descendre" onClick={() => move(index, 1)} disabled={index === rows.length - 1} />
              <IconButton
                icon="trash"
                label="Supprimer"
                variant="danger"
                onClick={() => setRows((r) => r.filter((_, i) => i !== index))}
              />
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="py-8 text-center text-sm font-light text-cocoa/50">
            Aucun moment — ajoutez-en un pour commencer.
          </p>
        )}
      </div>
    </Card>
  );
}

export function LoaderCard() {
  return (
    <div className="flex items-center justify-center rounded-3xl border border-cocoa/10 bg-white py-20">
      <Icon name="loader" className="h-6 w-6 animate-spin-slow text-terracotta" />
    </div>
  );
}
