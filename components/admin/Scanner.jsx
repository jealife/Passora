"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { AdminButton, Card } from "@/components/admin/ui";
import Icon from "@/components/ui/Icons";

const READER_ID = "passora-qr-reader";
// Conteneur requis par html5-qrcode pour décoder une photo (jamais affiché).
const FILE_READER_ID = "passora-qr-file-reader";

/** Traduit les erreurs caméra du navigateur en message exploitable pour l'utilisateur. */
function describeCameraError(err) {
  const text = String(err?.message || err || "");
  if (text.includes("NotAllowedError") || text.includes("Permission denied")) {
    return "Autorisation caméra refusée. Ouvrez les réglages du site dans votre navigateur (l'icône ⓘ ou le cadenas à côté de l'adresse), autorisez la caméra pour ce site, puis réessayez. Vous pouvez aussi prendre le billet en photo.";
  }
  if (text.includes("NotFoundError")) {
    return "Aucune caméra détectée sur cet appareil.";
  }
  if (text.includes("NotReadableError")) {
    return "La caméra est déjà utilisée par une autre application. Fermez-la puis réessayez.";
  }
  return `Impossible d'accéder à la caméra : ${text}`;
}

// La table appartient à l'invité (migration 011), lue via la liaison guest_id.
const RSVP_FIELDS = "id, guest_name, checked_in_at, guests(table_label)";

const formatTime = (value) =>
  new Date(value).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

/**
 * Lecture des billets à l'entrée : scanne le QR code (caméra en direct ou
 * photo), retrouve la confirmation correspondante pour CET événement et
 * affiche le nom et la table. "Confirmer l'entrée" horodate
 * `checked_in_at`, pour repérer un billet déjà utilisé.
 */
export default function Scanner({ supabase, event }) {
  const scannerRef = useRef(null);
  // idle → starting (juste après le clic) → scanning (caméra active) ; decoding = photo
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null); // { rsvp, justConfirmed? } | { notFound: true }
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const stopScanner = async () => {
    const instance = scannerRef.current;
    scannerRef.current = null;
    if (!instance) return;
    try {
      await instance.stop();
      instance.clear();
    } catch {
      // déjà arrêté (ex. la caméra n'a jamais démarré)
    }
  };

  const handleScan = async (rsvpId) => {
    await stopScanner();
    setStatus("idle");

    const { data } = await supabase
      .from("rsvp")
      .select(RSVP_FIELDS)
      .eq("id", rsvpId.trim())
      .eq("event_id", event.id)
      .maybeSingle();

    setResult(data ? { rsvp: data } : { notFound: true });
  };

  // Démarrée directement par le clic, dans la même fonction : certains
  // navigateurs mobiles n'affichent la demande d'autorisation caméra que si
  // elle reste rattachée au geste de l'utilisateur. `flushSync` force le
  // conteneur #passora-qr-reader à exister dans le DOM avant l'appel, sans
  // quitter ce même gestionnaire de clic.
  const start = async () => {
    setError(null);
    setResult(null);
    flushSync(() => setStatus("starting"));

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const instance = new Html5Qrcode(READER_ID);
      scannerRef.current = instance;
      await instance.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 240 },
        (decodedText) => handleScan(decodedText),
        () => {}, // échec de décodage sur une frame : ignoré, ce n'est pas une erreur
      );
      setStatus("scanning");
    } catch (err) {
      scannerRef.current = null;
      setError(describeCameraError(err));
      setStatus("idle");
    }
  };

  // Alternative sans flux vidéo : l'appareil photo natif prend une photo du
  // billet, puis le QR est décodé dans l'image.
  const scanPhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    await stopScanner();
    setError(null);
    setResult(null);
    setStatus("decoding");
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const instance = new Html5Qrcode(FILE_READER_ID);
      const text = await instance.scanFile(file, false);
      instance.clear();
      await handleScan(text);
    } catch {
      setError("Aucun QR code lisible sur cette photo. Cadrez le billet de plus près, bien éclairé, et réessayez.");
      setStatus("idle");
    }
  };

  useEffect(() => () => stopScanner(), []);

  const confirmEntry = async () => {
    if (!result?.rsvp) return;
    setConfirming(true);
    const { data, error: updateError } = await supabase
      .from("rsvp")
      .update({ checked_in_at: new Date().toISOString() })
      .eq("id", result.rsvp.id)
      .select(RSVP_FIELDS)
      .single();
    if (updateError) setError(`Entrée non enregistrée : ${updateError.message}`);
    else setResult({ rsvp: data, justConfirmed: true });
    setConfirming(false);
  };

  const cancel = async () => {
    await stopScanner();
    setStatus("idle");
  };

  const showReader = status === "starting" || status === "scanning";

  return (
    <Card title="Scanner" className="mx-auto max-w-lg">
      <div id={FILE_READER_ID} className="hidden" />

      {error && (
        <p className="mb-5 rounded-xl bg-rust/10 px-4 py-3 text-sm leading-relaxed text-rust" role="alert">
          {error}
        </p>
      )}

      {status === "idle" && !result && (
        <div className="flex flex-col items-center py-4 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-passora-gold/15 text-passora-gold-deep">
            <Icon name="camera" className="h-7 w-7" />
          </span>
          <p className="mt-4 max-w-xs text-sm leading-relaxed font-light text-cocoa/65">
            Scannez le QR code du billet pour afficher le nom de l&apos;invité et sa table.
          </p>
          <div className="mt-6 flex w-full max-w-xs flex-col gap-2.5">
            <AdminButton icon="camera" onClick={start} className="w-full justify-center py-3.5">
              Scanner un billet
            </AdminButton>
            <PhotoButton onChange={scanPhoto} />
          </div>
        </div>
      )}

      {showReader && (
        <div className="space-y-4">
          <div
            id={READER_ID}
            className="mx-auto min-h-64 w-full max-w-sm overflow-hidden rounded-2xl border border-cocoa/10 bg-passora-ink/5"
          />
          <p className="text-center text-sm font-light text-cocoa/55">
            {status === "starting" ? "Ouverture de la caméra…" : "Placez le QR code du billet dans le cadre."}
          </p>
          <AdminButton variant="subtle" icon="x" onClick={cancel} className="w-full justify-center">
            Annuler
          </AdminButton>
        </div>
      )}

      {status === "decoding" && (
        <p className="flex items-center justify-center gap-2 py-10 text-sm font-light text-cocoa/60">
          <Icon name="loader" className="h-4 w-4 animate-spin-slow" />
          Lecture du billet…
        </p>
      )}

      {status === "idle" && result?.notFound && (
        <div className="flex flex-col items-center py-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rust/10 text-rust">
            <Icon name="x" className="h-6 w-6" />
          </span>
          <p className="mt-4 font-serif text-2xl text-cocoa">Billet inconnu</p>
          <p className="mt-1 max-w-xs text-sm font-light text-cocoa/60">
            Ce billet ne correspond à aucune confirmation pour cet événement.
          </p>
          <NextActions onScan={start} onPhoto={scanPhoto} />
        </div>
      )}

      {status === "idle" && result?.rsvp && (
        <div className="flex flex-col items-center text-center">
          {result.justConfirmed ? (
            <StatusChip tone="success" icon="check">
              Entrée confirmée
            </StatusChip>
          ) : result.rsvp.checked_in_at ? (
            <StatusChip tone="warning" icon="clock">
              Déjà entré(e) à {formatTime(result.rsvp.checked_in_at)}
            </StatusChip>
          ) : null}

          <p className="mt-5 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-cocoa/45">Invité</p>
          <p className="mt-1 font-serif text-3xl leading-tight text-cocoa italic">{result.rsvp.guest_name}</p>

          <div className="mt-6 w-full max-w-[15rem] rounded-2xl bg-passora-ink px-6 py-5 text-cream">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.28em] text-cream/55">Table</p>
            {result.rsvp.guests?.table_label ? (
              <p className="mt-1 font-serif text-6xl leading-none font-medium tabular-nums text-passora-gold">
                {result.rsvp.guests.table_label}
              </p>
            ) : (
              <p className="mt-2 text-sm font-light text-cream/75">Non attribuée</p>
            )}
          </div>

          {!result.rsvp.checked_in_at && (
            <AdminButton
              icon="check"
              busy={confirming}
              onClick={confirmEntry}
              className="mt-6 w-full max-w-xs justify-center py-3.5"
            >
              Confirmer l&apos;entrée
            </AdminButton>
          )}
          <NextActions onScan={start} onPhoto={scanPhoto} subtle={!result.rsvp.checked_in_at} />
        </div>
      )}
    </Card>
  );
}

function PhotoButton({ onChange, label = "Prendre une photo" }) {
  return (
    <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-cocoa/5 px-5 py-3.5 text-xs font-medium uppercase tracking-[0.15em] text-cocoa transition-colors hover:bg-cocoa/10">
      <input type="file" accept="image/*" capture="environment" onChange={onChange} className="hidden" />
      <Icon name="image" className="h-4 w-4" />
      {label}
    </label>
  );
}

/** Enchaîner sur le billet suivant, en direct ou en photo. */
function NextActions({ onScan, onPhoto, subtle = false }) {
  return (
    <div className="mt-3 flex w-full max-w-xs flex-col gap-2.5">
      <AdminButton
        variant={subtle ? "subtle" : "primary"}
        icon="camera"
        onClick={onScan}
        className="w-full justify-center py-3.5"
      >
        Scanner le suivant
      </AdminButton>
      <PhotoButton onChange={onPhoto} label="Suivant en photo" />
    </div>
  );
}

function StatusChip({ tone, icon, children }) {
  return (
    <span
      className={
        tone === "success"
          ? "inline-flex items-center gap-1.5 rounded-full bg-olive/15 px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.12em] text-olive-deep"
          : "inline-flex items-center gap-1.5 rounded-full bg-rust/10 px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.12em] text-rust"
      }
    >
      <Icon name={icon} className="h-3.5 w-3.5" />
      {children}
    </span>
  );
}
