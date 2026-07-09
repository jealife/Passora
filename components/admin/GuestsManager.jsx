"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminButton, Card, IconButton, Input, Notice, TextArea } from "@/components/admin/ui";
import { LoaderCard } from "@/components/admin/ProgramManager";
import { normalizeName } from "@/lib/utils";

/**
 * Liste des invités : ajout individuel, import en masse (un nom par ligne),
 * recherche et suppression. Seuls ces noms peuvent confirmer leur présence.
 * Supprimer un invité supprime aussi sa confirmation de présence.
 */
export default function GuestsManager({ supabase, eventId }) {
  const [guests, setGuests] = useState(null);
  const [confirmedIds, setConfirmedIds] = useState(new Set());
  const [newName, setNewName] = useState("");
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
    setBusy(true);
    const { error } = await supabase.from("guests").insert({ event_id: eventId, full_name: name });
    setStatus(
      error
        ? { tone: "error", text: `Erreur : ${error.message}` }
        : { tone: "success", text: `« ${name} » ajouté(e) à la liste.` },
    );
    setNewName("");
    await reload();
    setBusy(false);
  };

  const importBulk = async () => {
    const names = [...new Set(
      bulk
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 1),
    )];
    if (!names.length) return;
    setBusy(true);
    const { error } = await supabase
      .from("guests")
      .insert(names.map((full_name) => ({ event_id: eventId, full_name })));
    setStatus(
      error
        ? { tone: "error", text: `Erreur : ${error.message}` }
        : { tone: "success", text: `${names.length} invité(s) importé(s).` },
    );
    setBulk("");
    setShowBulk(false);
    await reload();
    setBusy(false);
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
      description="Le formulaire de confirmation n'accepte que les noms de cette liste."
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
        <div className="mb-6 space-y-3 rounded-2xl border border-terracotta/20 bg-champagne/40 p-5">
          <p className="text-sm font-light text-cocoa/70">
            Collez votre liste — un nom complet par ligne. Les doublons sont ignorés.
          </p>
          <TextArea
            rows={6}
            placeholder={"Awa Diallo\nIbrahima Sory Camara\n…"}
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
          />
          <AdminButton icon="check" busy={busy} onClick={importBulk} className="w-full sm:w-auto justify-center">
            Importer
          </AdminButton>
        </div>
      )}

      <form onSubmit={addOne} className="mb-5 flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Ajouter un invité (prénom et nom)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-full"
        />
        <AdminButton icon="plus" busy={busy} onClick={addOne} type="submit" className="w-full sm:w-auto justify-center">
          Ajouter
        </AdminButton>
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
          <li key={guest.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
            <span className="flex flex-wrap items-center gap-2.5 text-sm text-cocoa/85">
              {guest.full_name}
              {confirmedIds.has(guest.id) && (
                <span className="inline-flex items-center gap-1 rounded-full bg-olive/12 px-2.5 py-0.5 text-[0.62rem] font-medium uppercase tracking-[0.12em] text-olive-deep">
                  A confirmé
                </span>
              )}
            </span>
            <IconButton icon="trash" label="Supprimer" variant="danger" onClick={() => remove(guest)} />
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="px-4 py-8 text-center text-sm font-light text-cocoa/50">
            {guests.length === 0 ? "Aucun invité — importez votre liste." : "Aucun résultat."}
          </li>
        )}
      </ul>
    </Card>
  );
}
