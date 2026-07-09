"use client";

import { useState } from "react";
import { AdminButton, Card, Field, Input, Notice, TextArea } from "@/components/admin/ui";

/** timestamptz -> valeur pour <input type="datetime-local"> (heure locale). */
function toDatetimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Informations générales de l'événement (textes, date, médias). */
export default function EventForm({ supabase, event, onSaved }) {
  const [form, setForm] = useState({
    name: event.name || "",
    bride_name: event.bride_name || "",
    groom_name: event.groom_name || "",
    tagline: event.tagline || "",
    wedding_date: toDatetimeLocal(event.wedding_date),
    date_confirmed: Boolean(event.date_confirmed),
    hero_image_url: event.hero_image_url || "",
    story_title: event.story_title || "",
    story_text: event.story_text || "",
    story_audio_url: event.story_audio_url || "",
    dress_code_title: event.dress_code_title || "",
    dress_code_image_url: event.dress_code_image_url || "",
    footer_message: event.footer_message || "",
  });
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const uploadHeroPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setStatus(null);
    const path = `${event.id}/hero-${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const { error } = await supabase.storage.from("wedding").upload(path, file, { upsert: true });
    if (error) {
      setStatus({ tone: "error", text: `Échec du téléversement : ${error.message}` });
    } else {
      const { data } = supabase.storage.from("wedding").getPublicUrl(path);
      setForm((f) => ({ ...f, hero_image_url: data.publicUrl }));
      setStatus({ tone: "success", text: "Photo téléversée — pensez à enregistrer." });
    }
    setUploading(false);
    e.target.value = "";
  };

  const save = async () => {
    setBusy(true);
    setStatus(null);
    const payload = {
      ...form,
      wedding_date: form.wedding_date ? new Date(form.wedding_date).toISOString() : null,
    };
    const { data, error } = await supabase
      .from("events")
      .update(payload)
      .eq("id", event.id)
      .select()
      .single();
    setStatus(
      error
        ? { tone: "error", text: `Erreur : ${error.message}` }
        : { tone: "success", text: "Modifications enregistrées — elles sont en ligne." },
    );
    if (data) onSaved(data);
    setBusy(false);
  };

  return (
    <div className="space-y-6">
      <Card title="Les mariés" description="Noms affichés sur toute la page.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="La mariée">
            <Input value={form.bride_name} onChange={set("bride_name")} />
          </Field>
          <Field label="Le marié">
            <Input value={form.groom_name} onChange={set("groom_name")} />
          </Field>
          <Field label="Phrase d'accroche" hint="Affichée au-dessus des noms dans le hero.">
            <Input value={form.tagline} onChange={set("tagline")} />
          </Field>
          <Field label="Nom de l'événement" hint="Usage interne et titre de la page.">
            <Input value={form.name} onChange={set("name")} />
          </Field>
        </div>
      </Card>

      <Card title="Date & heure" description="Alimente le hero et le compte à rebours.">
        <div className="grid items-end gap-5 sm:grid-cols-2">
          <Field label="Date et heure du mariage">
            <Input type="datetime-local" value={form.wedding_date} onChange={set("wedding_date")} />
          </Field>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-cocoa/12 bg-cream/50 px-4 py-3">
            <input
              type="checkbox"
              checked={form.date_confirmed}
              onChange={set("date_confirmed")}
              className="h-4 w-4 accent-rust"
            />
            <span className="text-sm text-cocoa/80">
              Date confirmée
              <span className="block text-xs font-light text-cocoa/50">
                Décochée : la mention « à confirmer » apparaît sur le site.
              </span>
            </span>
          </label>
        </div>
      </Card>

      <Card title="Photo des mariés" description="Grande image du hero (recommandé : 2000 px de large).">
        <div className="flex flex-wrap items-center gap-5">
          {form.hero_image_url ? (
            <img
              src={form.hero_image_url}
              alt="Aperçu de la photo des mariés"
              className="h-28 w-44 rounded-2xl object-cover shadow"
            />
          ) : (
            <div className="flex h-28 w-44 items-center justify-center rounded-2xl bg-champagne text-xs font-light text-cocoa/50">
              Aucune photo — décor graphique affiché
            </div>
          )}
          <div className="space-y-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-cocoa/5 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-cocoa transition-colors hover:bg-cocoa/10">
              <input type="file" accept="image/*" onChange={uploadHeroPhoto} className="hidden" />
              {uploading ? "Téléversement…" : "Téléverser une photo"}
            </label>
            {form.hero_image_url && (
              <AdminButton
                variant="danger"
                icon="trash"
                onClick={() => setForm((f) => ({ ...f, hero_image_url: "" }))}
              >
                Retirer la photo
              </AdminButton>
            )}
          </div>
        </div>
      </Card>

      <Card title="Notre histoire" description="Texte de présentation et bande audio.">
        <div className="space-y-5">
          <Field label="Titre de la section">
            <Input value={form.story_title} onChange={set("story_title")} />
          </Field>
          <Field label="Texte de présentation">
            <TextArea rows={4} value={form.story_text} onChange={set("story_text")} />
          </Field>
          <Field label="URL de l'audio" hint="Fichier MP3 — par défaut : /audio/notre-histoire.mp3">
            <Input value={form.story_audio_url} onChange={set("story_audio_url")} />
          </Field>
        </div>
      </Card>

      <Card title="Dress code & mot de la fin">
        <div className="space-y-5">
          <Field label="Titre du dress code">
            <Input value={form.dress_code_title} onChange={set("dress_code_title")} />
          </Field>
          <Field label="URL de l'image du moodboard">
            <Input value={form.dress_code_image_url} onChange={set("dress_code_image_url")} />
          </Field>
          <Field label="Message de fin (pied de page)">
            <TextArea rows={3} value={form.footer_message} onChange={set("footer_message")} />
          </Field>
        </div>
      </Card>

      <div className="sticky bottom-4 flex items-center justify-end gap-4 rounded-full border border-cocoa/10 bg-cream/95 px-4 py-3 shadow-lg backdrop-blur">
        {status && <Notice tone={status.tone}>{status.text}</Notice>}
        <AdminButton icon="check" busy={busy} onClick={save}>
          Enregistrer
        </AdminButton>
      </div>
    </div>
  );
}
