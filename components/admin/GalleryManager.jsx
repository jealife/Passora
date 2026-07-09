"use client";

import { useEffect, useState } from "react";
import { AdminButton, Card, IconButton, Input, Notice } from "@/components/admin/ui";
import { LoaderCard } from "@/components/admin/ProgramManager";

/**
 * Galerie : téléversement vers Supabase Storage (bucket « wedding »),
 * légende, réordonnancement et suppression.
 */
export default function GalleryManager({ supabase, eventId }) {
  const [images, setImages] = useState(null);
  const [status, setStatus] = useState(null);
  const [uploading, setUploading] = useState(false);

  const reload = () =>
    supabase
      .from("gallery")
      .select("*")
      .eq("event_id", eventId)
      .order("sort_order", { ascending: true })
      .then(({ data }) => setImages(data || []));

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, eventId]);

  const upload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setStatus(null);

    let errorMessage = null;
    let nextOrder = images.length;
    for (const file of files) {
      const path = `${eventId}/gallery-${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
      const { error: uploadError } = await supabase.storage.from("wedding").upload(path, file);
      if (uploadError) {
        errorMessage = uploadError.message;
        break;
      }
      const { data } = supabase.storage.from("wedding").getPublicUrl(path);
      const { error: insertError } = await supabase.from("gallery").insert({
        event_id: eventId,
        url: data.publicUrl,
        alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
        sort_order: nextOrder++,
      });
      if (insertError) {
        errorMessage = insertError.message;
        break;
      }
    }

    await reload();
    setStatus(
      errorMessage
        ? { tone: "error", text: `Erreur : ${errorMessage}` }
        : { tone: "success", text: `${files.length} photo(s) ajoutée(s).` },
    );
    setUploading(false);
    e.target.value = "";
  };

  const updateAlt = async (image, alt) => {
    setImages((list) => list.map((i) => (i.id === image.id ? { ...i, alt } : i)));
    await supabase.from("gallery").update({ alt }).eq("id", image.id);
  };

  const move = async (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    setImages(next);
    await Promise.all(
      next.map((image, i) => supabase.from("gallery").update({ sort_order: i }).eq("id", image.id)),
    );
  };

  const remove = async (image) => {
    setImages((list) => list.filter((i) => i.id !== image.id));
    await supabase.from("gallery").delete().eq("id", image.id);
    // Supprime aussi le fichier du bucket s'il y est hébergé.
    const marker = "/storage/v1/object/public/wedding/";
    const markerIndex = image.url.indexOf(marker);
    if (markerIndex !== -1) {
      await supabase.storage.from("wedding").remove([decodeURIComponent(image.url.slice(markerIndex + marker.length))]);
    }
  };

  if (!images) return <LoaderCard />;

  return (
    <Card
      title="Galerie"
      description="Les photos apparaissent sur le site dans l'ordre ci-dessous. Tant que la galerie est vide, des illustrations décoratives sont affichées."
      actions={
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-rust px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-cream transition-colors hover:bg-rust-deep">
          <input type="file" accept="image/*" multiple onChange={upload} className="hidden" />
          {uploading ? "Téléversement…" : "Ajouter des photos"}
        </label>
      }
    >
      {status && <div className="mb-4"><Notice tone={status.tone}>{status.text}</Notice></div>}

      {images.length === 0 ? (
        <p className="py-10 text-center text-sm font-light text-cocoa/50">
          Aucune photo pour l’instant.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => (
            <figure key={image.id} className="group overflow-hidden rounded-2xl border border-cocoa/8 bg-cream/40">
              <img src={image.url} alt={image.alt || ""} className="aspect-square w-full object-cover" />
              <figcaption className="space-y-2 p-3">
                <Input
                  aria-label="Légende"
                  placeholder="Légende"
                  value={image.alt || ""}
                  onChange={(e) => updateAlt(image, e.target.value)}
                  className="px-3 py-1.5 text-xs"
                />
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5">
                    <IconButton
                      icon="chevron-left"
                      label="Avancer"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                    />
                    <IconButton
                      icon="chevron-right"
                      label="Reculer"
                      onClick={() => move(index, 1)}
                      disabled={index === images.length - 1}
                    />
                  </div>
                  <IconButton icon="trash" label="Supprimer" variant="danger" onClick={() => remove(image)} />
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </Card>
  );
}
