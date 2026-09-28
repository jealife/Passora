"use client";

import { useEffect, useRef, useState } from "react";
import { AdminButton, Card, Notice } from "@/components/admin/ui";

const READER_ID = "passora-qr-reader";

/**
 * Lecture des billets à l'entrée : scanne le QR code (caméra du téléphone),
 * retrouve la confirmation correspondante pour CET événement et affiche
 * nom/table/place. "Confirmer l'entrée" horodate `checked_in_at`, pour
 * repérer un billet déjà scanné plutôt que de le laisser resservir en
 * silence. Accès direct à Supabase, comme le reste de l'admin.
 */
export default function Scanner({ supabase, event }) {
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);
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
    setScanning(false);

    const { data } = await supabase
      .from("rsvp")
      .select("*")
      .eq("id", rsvpId.trim())
      .eq("event_id", event.id)
      .maybeSingle();

    setResult(data ? { rsvp: data } : { notFound: true });
  };

  // Démarre la caméra une fois que l'élément #passora-qr-reader est monté
  // (donc après le rendu déclenché par `scanning`, pas avant).
  useEffect(() => {
    if (!scanning) return undefined;
    let cancelled = false;

    (async () => {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (cancelled) return;
      const instance = new Html5Qrcode(READER_ID);
      scannerRef.current = instance;
      try {
        await instance.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 240 },
          (decodedText) => handleScan(decodedText),
          () => {}, // échec de décodage sur une frame : ignoré, ce n'est pas une erreur
        );
      } catch (err) {
        if (!cancelled) {
          setError(`Impossible d'accéder à la caméra : ${err?.message || err}`);
          setScanning(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning]);

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
    setScanning(false);
    setResult(null);
    setError(null);
  };

  return (
    <Card title="Scanner" description="Scannez le billet d'un invité à l'entrée pour retrouver sa table et sa place.">
      {error && <div className="mb-4"><Notice tone="error">{error}</Notice></div>}

      {!scanning && !result && (
        <AdminButton icon="camera" onClick={() => { setError(null); setScanning(true); }} className="w-full justify-center sm:w-auto">
          Démarrer le scan
        </AdminButton>
      )}

      {scanning && (
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
