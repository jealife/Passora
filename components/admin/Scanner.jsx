"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { AdminButton, Card, Notice } from "@/components/admin/ui";

const READER_ID = "passora-qr-reader";

/** Traduit les erreurs caméra du navigateur en message exploitable pour l'utilisateur. */
function describeCameraError(err) {
  const text = String(err?.message || err || "");
  if (text.includes("NotAllowedError") || text.includes("Permission denied")) {
    return "Autorisation caméra refusée. Ouvrez les réglages du site dans votre navigateur (l'icône ⓘ ou le cadenas à côté de l'adresse), autorisez la caméra pour ce site, puis réessayez.";
  }
  if (text.includes("NotFoundError")) {
    return "Aucune caméra détectée sur cet appareil.";
  }
  if (text.includes("NotReadableError")) {
    return "La caméra est déjà utilisée par une autre application. Fermez-la puis réessayez.";
  }
  return `Impossible d'accéder à la caméra : ${text}`;
}

/**
 * Lecture des billets à l'entrée : scanne le QR code (caméra du téléphone),
 * retrouve la confirmation correspondante pour CET événement et affiche
 * nom/table/place. "Confirmer l'entrée" horodate `checked_in_at`, pour
 * repérer un billet déjà scanné plutôt que de le laisser resservir en
 * silence. Accès direct à Supabase, comme le reste de l'admin.
 */
export default function Scanner({ supabase, event }) {
  const scannerRef = useRef(null);
  // idle → starting (juste après le clic) → scanning (caméra active)
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null); // { rsvp } | { notFound: true }
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
      .select("*")
      .eq("id", rsvpId.trim())
      .eq("event_id", event.id)
      .maybeSingle();

    setResult(data ? { rsvp: data } : { notFound: true });
  };

  // Démarrée directement par le clic, dans la même fonction : certains
  // navigateurs mobiles (Safari iOS notamment) n'affichent la demande
  // d'autorisation caméra que si elle reste rattachée au geste de
  // l'utilisateur — passer par un useEffect séparé (déclenché par un
  // changement d'état sur un rendu ultérieur) la fait parfois refuser en
  // silence, sans même l'afficher. `flushSync` force le conteneur
  // #passora-qr-reader à exister dans le DOM avant l'appel, sans quitter
  // ce même gestionnaire de clic.
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

  useEffect(() => () => stopScanner(), []);

  const confirmEntry = async () => {
    if (!result?.rsvp) return;
    setConfirming(true);
    const { data, error: updateError } = await supabase
      .from("rsvp")
      .update({ checked_in_at: new Date().toISOString() })
      .eq("id", result.rsvp.id)
      .select("*")
      .single();
    if (!updateError) setResult({ rsvp: data });
    setConfirming(false);
  };

  const reset = async () => {
    await stopScanner();
    setStatus("idle");
    setResult(null);
    setError(null);
  };

  const showReader = status === "starting" || status === "scanning";

  return (
    <Card title="Scanner" description="Scannez le billet d'un invité à l'entrée pour retrouver sa table et sa place.">
      {error && <div className="mb-4"><Notice tone="error">{error}</Notice></div>}

      {status === "idle" && !result && (
        <AdminButton icon="camera" onClick={start} className="w-full justify-center sm:w-auto">
          Démarrer le scan
        </AdminButton>
      )}

      {showReader && (
        <div className="space-y-4">
          <div id={READER_ID} className="mx-auto max-w-sm overflow-hidden rounded-2xl border border-cocoa/10" />
          <AdminButton variant="subtle" icon="x" onClick={reset} className="w-full justify-center sm:w-auto">
            Annuler
          </AdminButton>
        </div>
      )}

      {result?.notFound && (
        <div className="space-y-4 text-center">
          <Notice tone="error">Ce billet ne correspond à aucune confirmation pour cet événement.</Notice>
          <AdminButton icon="refresh" onClick={reset} className="justify-center">
            Scanner un autre billet
          </AdminButton>
        </div>
      )}

      {result?.rsvp && (
        <div className="space-y-5 text-center">
          <div className="rounded-2xl border border-cocoa/10 bg-cream/50 p-6">
            <p className="font-serif text-2xl italic text-cocoa">{result.rsvp.guest_name}</p>
            <p className="mt-2 text-sm text-cocoa/70">
              {[
                result.rsvp.table_label && `Table ${result.rsvp.table_label}`,
                result.rsvp.seat_label && `Place ${result.rsvp.seat_label}`,
              ]
                .filter(Boolean)
                .join(" · ") || "Aucun placement attribué"}
            </p>
            {result.rsvp.checked_in_at && (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-olive/12 px-3 py-1 text-xs font-medium uppercase tracking-[0.12em] text-olive-deep">
                Déjà entré(e) à{" "}
                {new Date(result.rsvp.checked_in_at).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            {!result.rsvp.checked_in_at && (
              <AdminButton icon="check" busy={confirming} onClick={confirmEntry} className="justify-center">
                Confirmer l&apos;entrée
              </AdminButton>
            )}
            <AdminButton variant="subtle" icon="refresh" onClick={reset} className="justify-center">
              Scanner un autre billet
            </AdminButton>
          </div>
        </div>
      )}
    </Card>
  );
}
