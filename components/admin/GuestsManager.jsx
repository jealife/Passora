"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminButton, Card, IconButton, Input, Notice, TextArea } from "@/components/admin/ui";
import { LoaderCard } from "@/components/admin/ProgramManager";
import TableInput from "@/components/admin/TableInput";
import { normalizeName } from "@/lib/utils";

/**
 * "Jean Mba ; 5" ou "Jean Mba<tab>5" (copié depuis un tableur) →
 * { full_name, table_label }. La table est facultative.
 */
function parseGuestLine(line) {
  const [name, table = ""] = line.split(/[;\t]/).map((part) => part.trim());
  return { full_name: name, table_label: table || null };
}

/**
 * Liste des invités : ajout individuel avec sa table, import en masse (un
 * nom par ligne, table facultative), recherche, table modifiable sur chaque
 * ligne et suppression. Seuls ces noms peuvent confirmer leur présence.
 * Supprimer un invité supprime aussi sa confirmation de présence.
 */
export default function GuestsManager({ supabase, eventId }) {
  const [guests, setGuests] = useState(null);
  const [confirmedIds, setConfirmedIds] = useState(new Set());
  const [newName, setNewName] = useState("");
  const [newTable, setNewTable] = useState("");
  const [bulk, setBulk] = useState("");
  const [showBulk, setShowBulk] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  const reload = () =>
    Promise.all([
      supabase
        .from("guests")
        .select("*")
        .eq("event_id", eventId)
        .order("full_name", { ascending: true }),
      supabase.from("rsvp").select("guest_id").eq("event_id", eventId),
    ]).then(([guestsRes, rsvpRes]) => {
      setGuests(guestsRes.data || []);
      setConfirmedIds(new Set((rsvpRes.data || []).map((row) => row.guest_id).filter(Boolean)));
    });

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, eventId]);

  const filtered = useMemo(() => {
    if (!guests) return [];
    const query = normalizeName(search);
    if (!query) return guests;
    return guests.filter((guest) => normalizeName(guest.full_name).includes(query));
  }, [guests, search]);

  const addOne = async (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    const table = newTable.trim();
    setBusy(true);
    const { error } = await supabase
      .from("guests")
      .insert({ event_id: eventId, full_name: name, table_label: table || null });
    if (error) {
      setStatus({ tone: "error", text: `Erreur : ${error.message}` });
    } else {
      setStatus({
        tone: "success",
        text: table ? `« ${name} » ajouté(e), table ${table}.` : `« ${name} » ajouté(e) à la liste.`,
      });
      // La table est gardée : pratique pour enchaîner les invités d'une même table.
      setNewName("");
    }
    await reload();
    setBusy(false);
  };

  const importBulk = async () => {
    // Dédoublonnage sur le nom (sans accents ni casse), première ligne gardée.
    const seen = new Set();
    const rows = bulk
      .split("\n")
      .map(parseGuestLine)
      .filter(({ full_name }) => {
        const key = normalizeName(full_name);
        if (key.length < 2 || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    if (!rows.length) return;
    setBusy(true);
    const { error } = await supabase
      .from("guests")
      .insert(rows.map((row) => ({ event_id: eventId, ...row })));
    setStatus(
      error
        ? { tone: "error", text: `Erreur : ${error.message}` }
        : { tone: "success", text: `${rows.length} invité(s) importé(s).` },
    );
    if (!error) {
      setBulk("");
      setShowBulk(false);
    }
    await reload();
    setBusy(false);
  };

  const saveTable = async (guest, value) => {
    const { error } = await supabase
      .from("guests")
      .update({ table_label: value || null })
      .eq("id", guest.id);
    if (error) return error.message;
    setGuests((list) => list.map((g) => (g.id === guest.id ? { ...g, table_label: value || null } : g)));
  };

  const remove = async (guest) => {
    const hasConfirmed = confirmedIds.has(guest.id);
    const question = hasConfirmed
      ? `${guest.full_name} a déjà confirmé sa présence.\nSupprimer cet invité supprimera aussi sa confirmation. Continuer ?`
      : `Retirer ${guest.full_name} de la liste des invités ?`;
    if (!window.confirm(question)) return;

    setGuests((list) => list.filter((g) => g.id !== guest.id));
    // La confirmation liée est supprimée d'abord (la base fait aussi
    // respecter cette règle via `on delete cascade`).
    await supabase.from("rsvp").delete().eq("guest_id", guest.id);
    const { error } = await supabase.from("guests").delete().eq("id", guest.id);
    if (error) {
      setStatus({ tone: "error", text: `Erreur : ${error.message}` });
      await reload();
      return;
    }
    setStatus(
      hasConfirmed
        ? { tone: "success", text: `${guest.full_name} et sa confirmation ont été supprimés.` }
        : { tone: "success", text: `${guest.full_name} a été retiré(e) de la liste.` },
    );
    setConfirmedIds((ids) => {
      const next = new Set(ids);
      next.delete(guest.id);
      return next;
    });
  };

  if (!guests) return <LoaderCard />;

  return (
    <Card
      title={`Invités (${guests.length})`}
      description="Le formulaire de confirmation n'accepte que les noms de cette liste. La table choisie s'affiche au scan du billet, à l'entrée."
      actions={
        <AdminButton
          variant="subtle"
          icon="upload"
          onClick={() => setShowBulk((v) => !v)}
          className="w-full sm:w-auto text-[10px] sm:text-xs justify-center"
        >
          Import en masse
        </AdminButton>
      }
    >
      {status && <div className="mb-4"><Notice tone={status.tone}>{status.text}</Notice></div>}

      {showBulk && (
        <div className="mb-6 space-y-3 rounded-2xl border border-passora-gold/30 bg-passora-gold/10 p-5">
          <p className="text-sm font-light text-cocoa/70">
            Collez votre liste, un nom complet par ligne. Pour attribuer une table, ajoutez-la
            après un point-virgule (ou collez directement deux colonnes d&apos;un tableur). Les
            doublons sont ignorés.
          </p>
          <TextArea
            rows={6}
            placeholder={"Jean Mba ; 5\nArmand Obiang ; 5\nClarisse Ndong\n…"}
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
          />
          <AdminButton icon="check" busy={busy} onClick={importBulk} className="w-full sm:w-auto justify-center">
            Importer
          </AdminButton>
        </div>
      )}

      <form onSubmit={addOne} className="mb-5 flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="Ajouter un invité (prénom et nom)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          aria-label="Nom de l'invité"
          className="w-full sm:flex-1"
        />
        <div className="flex gap-2">
          <div className="w-24 shrink-0">
            <Input
              placeholder="Table"
              value={newTable}
              onChange={(e) => setNewTable(e.target.value)}
              aria-label="Table (facultatif)"
              className="text-center"
            />
          </div>
          <AdminButton icon="plus" busy={busy} type="submit" className="flex-1 justify-center sm:flex-none">
            Ajouter
          </AdminButton>
        </div>
      </form>

      <Input
        type="search"
        placeholder="Rechercher un invité…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />

      <ul className="divide-y divide-cocoa/6 rounded-2xl border border-cocoa/8">
        {filtered.map((guest) => (
          <li key={guest.id} className="flex items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4">
            <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-cocoa/85">
              <span className="min-w-0 break-words">{guest.full_name}</span>
              {confirmedIds.has(guest.id) && (
                <span className="inline-flex items-center gap-1 rounded-full bg-olive/12 px-2.5 py-0.5 text-[0.62rem] font-medium uppercase tracking-[0.12em] text-olive-deep">
                  A confirmé
                </span>
              )}
            </span>
            <TableInput
              guestName={guest.full_name}
              value={guest.table_label}
              onSave={(value) => saveTable(guest, value)}
            />
            <IconButton icon="trash" label="Supprimer" variant="danger" onClick={() => remove(guest)} />
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="px-4 py-8 text-center text-sm font-light text-cocoa/50">
            {guests.length === 0 ? "Aucun invité pour le moment ." : "Aucun résultat."}
          </li>
        )}
      </ul>
    </Card>
  );
}
