"use client";

import { useEffect, useState } from "react";
import { AdminButton, Card, Field, IconButton, Input, Notice } from "@/components/admin/ui";
import { LoaderCard } from "@/components/admin/ProgramManager";

/** Gestion des lieux : adresse, lien et carte Google Maps par cérémonie. */
export default function VenuesManager({ supabase, eventId }) {
  const [venues, setVenues] = useState(null);
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase
      .from("venues")
      .select("*")
      .eq("event_id", eventId)
      .order("sort_order", { ascending: true })
      .then(({ data }) => setVenues(data || []));
  }, [supabase, eventId]);

  const update = (index, key, value) =>
    setVenues((v) => v.map((venue, i) => (i === index ? { ...venue, [key]: value } : venue)));

  const addVenue = () =>
    setVenues((v) => [
      ...v,
      { title: "", name: "", address: "", maps_url: "", maps_embed_url: "" },
    ]);

  const save = async () => {
    setBusy(true);
    setStatus(null);
    const payload = venues
      .filter((venue) => venue.name.trim())
      .map((venue, index) => ({
        event_id: eventId,
        title: venue.title.trim(),
        name: venue.name.trim(),
        address: venue.address.trim(),
        maps_url: venue.maps_url.trim(),
        maps_embed_url: venue.maps_embed_url.trim(),
        sort_order: index,
      }));

    const { error: deleteError } = await supabase.from("venues").delete().eq("event_id", eventId);
    const { error } = deleteError
      ? { error: deleteError }
      : await supabase.from("venues").insert(payload);

    setStatus(
      error
        ? { tone: "error", text: `Erreur : ${error.message}` }
        : { tone: "success", text: "Lieux enregistrés." },
    );
    setBusy(false);
  };

  if (!venues) return <LoaderCard />;

  return (
    <div className="space-y-6">
      {venues.map((venue, index) => (
        <Card
          key={venue.id ?? `new-${index}`}
          title={venue.name || `Lieu ${index + 1}`}
          actions={
            <IconButton
              icon="trash"
              label="Supprimer ce lieu"
              variant="danger"
              onClick={() => setVenues((v) => v.filter((_, i) => i !== index))}
            />
          }
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Cérémonie" hint="Ex. Mariage coutumier">
              <Input value={venue.title} onChange={(e) => update(index, "title", e.target.value)} />
            </Field>
            <Field label="Nom du lieu">
              <Input value={venue.name} onChange={(e) => update(index, "name", e.target.value)} />
            </Field>
            <Field label="Adresse complète">
              <Input value={venue.address} onChange={(e) => update(index, "address", e.target.value)} />
            </Field>
            <Field label="Lien Google Maps" hint="Bouton « Ouvrir dans Google Maps »">
              <Input value={venue.maps_url} onChange={(e) => update(index, "maps_url", e.target.value)} />
            </Field>
            <Field
              label="Lien d'intégration de la carte"
              hint="Google Maps > Partager > Intégrer une carte (ou https://www.google.com/maps?q=…&output=embed)"
            >
              <Input
                value={venue.maps_embed_url}
                onChange={(e) => update(index, "maps_embed_url", e.target.value)}
              />
            </Field>
          </div>
        </Card>
      ))}

      <div className="flex items-center justify-between gap-4">
        <AdminButton variant="subtle" icon="plus" onClick={addVenue}>
          Ajouter un lieu
        </AdminButton>
        <div className="flex items-center gap-4">
          {status && <Notice tone={status.tone}>{status.text}</Notice>}
          <AdminButton icon="check" busy={busy} onClick={save}>
            Enregistrer
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
