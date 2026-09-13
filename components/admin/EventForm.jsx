"use client";

import { useState } from "react";
import { AdminButton, Card, Field, Input, Notice, TextArea } from "@/components/admin/ui";
import { THEME_PRESETS } from "@/lib/theme";
import { classNames } from "@/lib/utils";

/** timestamptz -> valeur pour <input type="datetime-local"> (heure locale). */
function toDatetimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Couleurs par défaut de app/globals.css — utilisées comme valeur affichée
// par les sélecteurs quand l'événement n'a pas encore de thème personnalisé.
const DEFAULT_THEME = {
  theme_primary: "#b76950",
  theme_secondary: "#8a8b62",
  theme_background: "#faf6ef",
};

/** Informations générales de l'événement (textes, date, médias). */
export default function EventForm({ supabase, event, onSaved, isAgency }) {
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
    footer_message: event.footer_message || "",
    theme_primary: event.theme_primary || "",
    theme_secondary: event.theme_secondary || "",
    theme_background: event.theme_background || "",
    show_story: event.show_story ?? true,
    show_gallery: event.show_gallery ?? true,
    show_program: event.show_program ?? true,
    show_venues: event.show_venues ?? true,
  });
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingMusic, setUploadingMusic] = useState(false);

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

  const uploadMusic = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMusic(true);
    setStatus(null);
    const path = `${event.id}/ambiance-${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const { error } = await supabase.storage.from("wedding").upload(path, file, { upsert: true });
    if (error) {
      setStatus({ tone: "error", text: `Échec du téléversement : ${error.message}` });
    } else {
      const { data } = supabase.storage.from("wedding").getPublicUrl(path);
      setForm((f) => ({ ...f, story_audio_url: data.publicUrl }));
      setStatus({ tone: "success", text: "Musique téléversée — pensez à enregistrer." });
    }
    setUploadingMusic(false);
    e.target.value = "";
  };

  const save = async () => {
    setBusy(true);
    setStatus(null);
    const payload = {
      ...form,
      wedding_date: form.wedding_date ? new Date(form.wedding_date).toISOString() : null,
      theme_primary: form.theme_primary || null,
      theme_secondary: form.theme_secondary || null,
      theme_background: form.theme_background || null,
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

      <Card
        title="Notre histoire"
        description="Titre de la section et musique d'ambiance lue en boucle à l'ouverture de la page."
      >
        <div className="space-y-5">
          <Field label="Titre de la section">
            <Input value={form.story_title} onChange={set("story_title")} />
          </Field>
          <Field
            label="Musique d'ambiance"
            hint="Fichier audio (MP3 recommandé). Sans musique téléversée, le morceau par défaut est joué."
          >
            <div className="space-y-3">
              {form.story_audio_url && (
                <audio controls src={form.story_audio_url} className="w-full max-w-md" />
              )}
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-cocoa/5 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-cocoa transition-colors hover:bg-cocoa/10">
                  <input type="file" accept="audio/*" onChange={uploadMusic} className="hidden" />
                  {uploadingMusic ? "Téléversement…" : "Téléverser une musique"}
                </label>
                {form.story_audio_url && (
                  <AdminButton
                    variant="danger"
                    icon="trash"
                    onClick={() => setForm((f) => ({ ...f, story_audio_url: "" }))}
                  >
                    Retirer la musique
                  </AdminButton>
                )}
              </div>
            </div>
          </Field>
        </div>
      </Card>

      <Card
        title="Sections affichées sur le site"
        description="Une section vide ne s'affiche jamais ; désactivez-la ici pour la masquer même si elle contient déjà quelque chose."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { key: "show_story", label: "Notre histoire" },
            { key: "show_gallery", label: "Galerie" },
            { key: "show_program", label: "Programme" },
            { key: "show_venues", label: "Lieux" },
          ].map(({ key, label }) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-cocoa/12 bg-cream/50 px-4 py-3"
            >
              <input
                type="checkbox"
                checked={form[key]}
                onChange={set(key)}
                className="h-4 w-4 accent-rust"
              />
              <span className="text-sm text-cocoa/80">{label}</span>
            </label>
          ))}
        </div>
      </Card>

      {isAgency && (
      <Card
        title="Thème"
        description="Couleurs de la page publique de cet événement. Le reste de la palette (dégradés, texte) s'ajuste automatiquement."
        actions={
          (form.theme_primary || form.theme_secondary || form.theme_background) && (
            <button
              type="button"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  theme_primary: "",
                  theme_secondary: "",
                  theme_background: "",
                }))
              }
              className="cursor-pointer text-xs font-medium uppercase tracking-[0.15em] text-cocoa/50 underline-offset-4 hover:text-cocoa hover:underline"
            >
              Réinitialiser
            </button>
          )
        }
      >
        <div className="mb-5 flex flex-wrap gap-3">
          {THEME_PRESETS.map((preset) => {
            const isActive =
              (form.theme_primary || DEFAULT_THEME.theme_primary) === preset.primary &&
              (form.theme_secondary || DEFAULT_THEME.theme_secondary) === preset.secondary &&
              (form.theme_background || DEFAULT_THEME.theme_background) === preset.background;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    theme_primary: preset.primary,
                    theme_secondary: preset.secondary,
                    theme_background: preset.background,
                  }))
                }
                className={classNames(
                  "flex cursor-pointer items-center gap-2.5 rounded-full border px-3 py-2 pr-4 transition-colors",
                  isActive ? "border-cocoa/40 bg-cocoa/5" : "border-cocoa/12 hover:border-cocoa/25",
                )}
              >
                <span
                  className="h-6 w-6 shrink-0 rounded-full border border-cocoa/15"
                  style={{
                    background: `conic-gradient(${preset.primary} 0deg 120deg, ${preset.secondary} 120deg 240deg, ${preset.background} 240deg 360deg)`,
                  }}
                />
                <span className="text-xs font-medium text-cocoa/80">{preset.name}</span>
              </button>
            );
          })}
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <ColorField
            label="Accent principal"
            value={form.theme_primary}
            fallback={DEFAULT_THEME.theme_primary}
            onChange={set("theme_primary")}
          />
          <ColorField
            label="Accent secondaire"
            value={form.theme_secondary}
            fallback={DEFAULT_THEME.theme_secondary}
            onChange={set("theme_secondary")}
          />
          <ColorField
            label="Fond"
            value={form.theme_background}
            fallback={DEFAULT_THEME.theme_background}
            onChange={set("theme_background")}
          />
        </div>
      </Card>
      )}

      <Card title="Mot de la fin">
        <Field label="Message de fin (pied de page)">
          <TextArea rows={3} value={form.footer_message} onChange={set("footer_message")} />
        </Field>
      </Card>

      <div className="sticky bottom-[4.5rem] sm:bottom-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between sm:justify-end gap-3 rounded-2xl sm:rounded-full border border-cocoa/10 bg-cream/95 p-3 sm:px-4 sm:py-3 shadow-lg backdrop-blur-md z-20">
        {status && (
          <div className="text-center sm:text-left flex-1 min-w-0">
            <Notice tone={status.tone}>{status.text}</Notice>
          </div>
        )}
        <AdminButton icon="check" busy={busy} onClick={save} className="justify-center py-3 sm:py-2.5">
          Enregistrer
        </AdminButton>
      </div>
    </div>
  );
}

/** Sélecteur de couleur natif + code hexadécimal, avec une couleur de secours tant que rien n'est choisi. */
function ColorField({ label, value, fallback, onChange }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value || fallback}
          onChange={onChange}
          className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-cocoa/15 bg-transparent p-0.5"
        />
        <span className="font-mono text-xs uppercase text-cocoa/60">{value || fallback}</span>
      </div>
    </Field>
  );
}
