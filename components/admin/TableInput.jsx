"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icons";
import { classNames } from "@/lib/utils";

/**
 * Champ "Table" d'un invité, enregistré dès qu'il perd le focus (ou sur
 * Entrée). `onSave(valeur)` écrit en base et renvoie un message d'erreur, ou
 * rien si tout s'est bien passé. Partagé par la liste des invités et
 * l'écran Tables.
 */
export default function TableInput({ guestName, value, onSave, className }) {
  // null = pas de saisie en cours : on affiche la valeur enregistrée.
  const [draft, setDraft] = useState(null);
  const [state, setState] = useState(null); // saving | saved | error

  const commit = async () => {
    if (draft === null) return;
    const next = draft.trim();
    if (next === (value || "")) {
      setDraft(null);
      return;
    }
    setState("saving");
    const error = await onSave(next);
    if (error) {
      setState("error");
      return;
    }
    setDraft(null);
    setState("saved");
  };

  return (
    <span className={classNames("flex shrink-0 items-center gap-1.5", className)}>
      <input
        value={draft ?? value ?? ""}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        placeholder="Table"
        aria-label={`Table de ${guestName}`}
        className={classNames(
          "h-10 w-16 rounded-xl border bg-cream/50 px-2 text-center text-sm text-cocoa placeholder:text-cocoa/30 focus:outline-2 focus:outline-passora-gold/25 transition-colors sm:w-20",
          state === "error" ? "border-rust/60" : "border-cocoa/15 focus:border-passora-gold-deep",
        )}
      />
      <span className="flex w-4 justify-center" aria-live="polite">
        {state === "saving" && <Icon name="loader" className="h-4 w-4 animate-spin-slow text-cocoa/40" />}
        {state === "saved" && <Icon name="check" className="h-4 w-4 text-olive-deep" />}
        {state === "error" && <Icon name="x" className="h-4 w-4 text-rust" />}
      </span>
    </span>
  );
}
