"use client";

import { useState } from "react";
import { AdminButton, Card, Field, Input, Notice, TextArea } from "@/components/admin/ui";
import { THEME_PRESETS } from "@/lib/theme";
import { LAYOUT_TEMPLATES } from "@/lib/layouts";
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
    layout_template: event.layout_template || "classic",
    theme_primary: event.theme_primary || "",
    theme_secondary: event.theme_secondary || "",
    theme_background: event.theme_background || "",
    show_story: event.show_story ?? true,
    show_gallery: event.show_gallery ?? true,
    show_program: event.show_program ?? true,
    show_venues: event.show_venues ?? true,
    opening_quote: event.opening_quote || "",
    opening_quote_source: event.opening_quote_source || "",
    show_opening_quote: event.show_opening_quote ?? true,
    bride_mother_name: event.bride_mother_name || "",
    bride_father_name: event.bride_father_name || "",
    groom_mother_name: event.groom_mother_name || "",
    groom_father_name: event.groom_father_name || "",
    parents_blessing_text: event.parents_blessing_text || "",
    show_parents: event.show_parents ?? true,
    dress_code_title: event.dress_code_title || "",
    dress_code_note: event.dress_code_note || "",
    show_dress_code: event.show_dress_code ?? true,
    gift_message: event.gift_message || "",
    gift_details: event.gift_details || "",
    gift_qr_image_url: event.gift_qr_image_url || "",
    show_gifts: event.show_gifts ?? true,
    guest_notes_title: event.guest_notes_title || "",
    guest_notes_text: event.guest_notes_text || "",
    show_guest_notes: event.show_guest_notes ?? true,
    bride_contact_phone: event.bride_contact_phone || "",
    groom_contact_phone: event.groom_contact_phone || "",
    rsvp_deadline: event.rsvp_deadline || "",
  });
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingMusic, setUploadingMusic] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);

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
      setStatus({ tone: "success", text: "Photo téléversée. Pensez à enregistrer." });
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
      setStatus({ tone: "success", text: "Musique téléversée. Pensez à enregistrer." });
    }
    setUploadingMusic(false);
    e.target.value = "";
  };

  const uploadGiftQr = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingQr(true);
    setStatus(null);
    const path = `${event.id}/gift-qr-${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const { error } = await supabase.storage.from("wedding").upload(path, file, { upsert: true });
    if (error) {
      setStatus({ tone: "error", text: `Échec du téléversement : ${error.message}` });
    } else {
      const { data } = supabase.storage.from("wedding").getPublicUrl(path);
      setForm((f) => ({ ...f, gift_qr_image_url: data.publicUrl }));
      setStatus({ tone: "success", text: "QR code téléversé. Pensez à enregistrer." });
    }
    setUploadingQr(false);
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
      rsvp_deadline: form.rsvp_deadline || null,
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
        : { tone: "success", text: "Modifications enregistrées. Elles sont en ligne." },
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
              Aucune photo : décor graphique affiché
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

      <Card title="Notre histoire" description="Titre de la section « Notre histoire ».">
        <Field label="Titre de la section">
          <Input value={form.story_title} onChange={set("story_title")} />
        </Field>
      </Card>

      <Card
        title="Musique d'ambiance"
        description="Lue en boucle à l'ouverture de la page, quelle que soit la mise en page choisie."
      >
        <Field
          label="Musique"
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

      <Card
        title="Citation d'ouverture"
        description="Affichée en tête de page sur les modèles qui la prennent en charge."
      >
        <div className="space-y-5">
          <ToggleField
            checked={form.show_opening_quote}
            onChange={set("show_opening_quote")}
            label="Afficher la citation"
          />
          <Field label="Citation">
            <TextArea rows={2} value={form.opening_quote} onChange={set("opening_quote")} />
          </Field>
          <Field label="Référence" hint="Ex. « Colossiens 3:14 ».">
            <Input value={form.opening_quote_source} onChange={set("opening_quote_source")} />
          </Field>
        </div>
      </Card>

      <Card
        title="Parents des mariés"
        description="Affiché avant les noms des mariés sur les modèles qui le prennent en charge."
      >
        <div className="space-y-5">
          <ToggleField
            checked={form.show_parents}
            onChange={set("show_parents")}
            label="Afficher les parents"
          />
          <Field label="Texte de bénédiction" hint="Ex. « Avec la bénédiction de Dieu et de nos parents ». ">
            <TextArea rows={2} value={form.parents_blessing_text} onChange={set("parents_blessing_text")} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Mère de la mariée">
              <Input value={form.bride_mother_name} onChange={set("bride_mother_name")} />
            </Field>
            <Field label="Père de la mariée">
              <Input value={form.bride_father_name} onChange={set("bride_father_name")} />
            </Field>
            <Field label="Mère du marié">
              <Input value={form.groom_mother_name} onChange={set("groom_mother_name")} />
            </Field>
            <Field label="Père du marié">
              <Input value={form.groom_father_name} onChange={set("groom_father_name")} />
            </Field>
          </div>
        </div>
      </Card>

      <Card title="Code vestimentaire">
        <div className="space-y-5">
          <ToggleField
            checked={form.show_dress_code}
            onChange={set("show_dress_code")}
            label="Afficher le code vestimentaire"
          />
          <Field label="Titre" hint="Ex. « Semi formel », « Élégant ».">
            <Input value={form.dress_code_title} onChange={set("dress_code_title")} />
          </Field>
          <Field label="Précisions">
            <TextArea rows={2} value={form.dress_code_note} onChange={set("dress_code_note")} />
          </Field>
        </div>
      </Card>

      <Card title="Cadeaux" description="Suggestions de cadeaux pour les invités.">
        <div className="space-y-5">
          <ToggleField
            checked={form.show_gifts}
            onChange={set("show_gifts")}
            label="Afficher la section cadeaux"
          />
          <Field label="Message">
            <TextArea rows={2} value={form.gift_message} onChange={set("gift_message")} />
          </Field>
          <Field label="Détails" hint="Coordonnées bancaires, liste de cadeaux, etc.">
            <TextArea rows={3} value={form.gift_details} onChange={set("gift_details")} />
          </Field>
          <Field label="QR code (optionnel)" hint="Image d'un QR code déjà généré (ex. par votre banque).">
            <div className="flex flex-wrap items-center gap-5">
              {form.gift_qr_image_url ? (
                <img
                  src={form.gift_qr_image_url}
                  alt="Aperçu du QR code"
                  className="h-28 w-28 rounded-2xl border border-cocoa/12 object-contain bg-white p-2"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-champagne text-xs font-light text-cocoa/50">
                  Aucun QR code
                </div>
              )}
              <div className="space-y-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-cocoa/5 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-cocoa transition-colors hover:bg-cocoa/10">
                  <input type="file" accept="image/*" onChange={uploadGiftQr} className="hidden" />
                  {uploadingQr ? "Téléversement…" : "Téléverser un QR code"}
                </label>
                {form.gift_qr_image_url && (
                  <AdminButton
                    variant="danger"
                    icon="trash"
                    onClick={() => setForm((f) => ({ ...f, gift_qr_image_url: "" }))}
                  >
                    Retirer le QR code
                  </AdminButton>
                )}
              </div>
            </div>
          </Field>
        </div>
      </Card>

      <Card title="Recommandations aux invités" description="Ex. tenue, présence des enfants, ponctualité.">
        <div className="space-y-5">
          <ToggleField
            checked={form.show_guest_notes}
            onChange={set("show_guest_notes")}
            label="Afficher les recommandations"
          />
          <Field label="Titre">
            <Input value={form.guest_notes_title} onChange={set("guest_notes_title")} />
          </Field>
          <Field label="Texte">
            <TextArea rows={3} value={form.guest_notes_text} onChange={set("guest_notes_text")} />
          </Field>
        </div>
      </Card>

      <Card
        title="Contacts & délai RSVP"
        description="Affichés uniquement s'ils sont renseignés, aucun interrupteur nécessaire."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Contact de la mariée" hint="Numéro affiché pour les questions RSVP.">
            <Input value={form.bride_contact_phone} onChange={set("bride_contact_phone")} />
          </Field>
          <Field label="Contact du marié">
            <Input value={form.groom_contact_phone} onChange={set("groom_contact_phone")} />
          </Field>
          <Field label="Date limite de confirmation">
            <Input type="date" value={form.rsvp_deadline} onChange={set("rsvp_deadline")} />
          </Field>
        </div>
      </Card>

      {isAgency && (
      <Card title="Mise en page" description="La structure complète de la page publique de cet événement.">
        <div className="grid gap-3 sm:grid-cols-2">
          {LAYOUT_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => setForm((f) => ({ ...f, layout_template: tpl.id }))}
              className={classNames(
                "rounded-xl border p-4 text-left transition-colors cursor-pointer",
                form.layout_template === tpl.id
                  ? "border-cocoa/40 bg-cocoa/5"
                  : "border-cocoa/12 hover:border-cocoa/25",
              )}
            >
              <p className="text-sm font-medium text-cocoa">{tpl.name}</p>
              <p className="mt-1 text-xs font-light text-cocoa/55">{tpl.description}</p>
            </button>
          ))}
        </div>
      </Card>
      )}

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

/** Interrupteur de visibilité d'une section optionnelle (même style que « Date confirmée »). */
function ToggleField({ checked, onChange, label, hint }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-cocoa/12 bg-cream/50 px-4 py-3">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 accent-rust" />
      <span className="text-sm text-cocoa/80">
        {label}
        {hint && <span className="block text-xs font-light text-cocoa/50">{hint}</span>}
      </span>
    </label>
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
