"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/components/ui/Button";
import FadeIn from "@/components/ui/FadeIn";
import Icon from "@/components/ui/Icons";
import Ornament from "@/components/ui/Ornament";
import { EASE, FloatingHearts } from "@/components/motion/primitives";

/**
 * Formulaire de confirmation de présence.
 * Le nom saisi est vérifié côté serveur dans la liste des invités,
 * puis la réponse est enregistrée dans Supabase.
 * Des suggestions de noms apparaissent pendant la saisie (dès 2 caractères),
 * sans jamais exposer la liste complète des invités.
 */
export default function Rsvp({ eventSlug }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [feedback, setFeedback] = useState("");
  const [confirmedName, setConfirmedName] = useState("");

  const [suggestions, setSuggestions] = useState([]);
  const [highlighted, setHighlighted] = useState(-1);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);
  const skipNextFetchRef = useRef(false);

  useEffect(() => {
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false;
      return;
    }
    const query = name.trim();
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (query.length < 2) {
        setSuggestions([]);
        setHighlighted(-1);
        return;
      }
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const params = new URLSearchParams({ q: name, slug: eventSlug || "" });
        const response = await fetch(`/api/guests/suggest?${params}`, {
          signal: controller.signal,
        });
        const payload = await response.json();
        const list = payload.suggestions || [];
        // Inutile de suggérer un nom déjà saisi à l'identique
        setSuggestions(list.length === 1 && list[0] === name.trim() ? [] : list);
        setHighlighted(-1);
      } catch {
        /* saisie rapide ou réseau : on ignore */
      }
    }, query.length < 2 ? 100 : 250);

    return () => clearTimeout(debounceRef.current);
  }, [name, eventSlug]);

  const pickSuggestion = (value) => {
    skipNextFetchRef.current = true;
    setName(value);
    setSuggestions([]);
    setHighlighted(-1);
  };

  const handleNameKeyDown = (e) => {
    if (!suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter" && highlighted >= 0) {
      e.preventDefault();
      pickSuggestion(suggestions[highlighted]);
    } else if (e.key === "Escape") {
      setSuggestions([]);
      setHighlighted(-1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setFeedback("");

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message, slug: eventSlug }),
      });
      const payload = await response.json();

      if (response.ok && payload.ok) {
        setConfirmedName(payload.guestName || name);
        setStatus("success");
      } else {
        setStatus("error");
        setFeedback(payload.error || "Une erreur est survenue. Merci de réessayer.");
      }
    } catch {
      setStatus("error");
      setFeedback("Connexion impossible. Vérifiez votre réseau puis réessayez.");
    }
  };

  return (
    <section id="rsvp" className="relative overflow-hidden bg-rust-deep py-24 sm:py-32">
      {/* Texture d'arrière-plan */}
      <div
        aria-hidden="true"
        className="absolute -top-32 left-1/2 h-96 w-[46rem] -translate-x-1/2 rounded-full bg-rust/50 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-terracotta/30 blur-3xl"
      />

      <div className="relative mx-auto max-w-2xl px-5 sm:px-8">
        <FadeIn className="text-center">
          <p className="mb-4 text-[0.7rem] font-medium uppercase tracking-[0.35em] text-blush-soft">
            Répondez-nous
          </p>
          <h2 className="font-serif text-4xl font-medium text-cream sm:text-5xl">
            Confirmer ma présence
          </h2>
          <div className="mt-6">
            <Ornament className="text-blush-soft" />
          </div>
          <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed font-light text-cream/75">
            Indiquez le nom figurant sur votre invitation, nous le retrouverons
            sur notre liste d’invités.
          </p>
        </FadeIn>

        <FadeIn delay={200} className="mt-12">
          <AnimatePresence mode="wait" initial={false}>
          {status === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.88, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 160, damping: 17 }}
              className="relative overflow-hidden rounded-[2rem] bg-cream p-10 text-center shadow-2xl sm:p-14"
            >
              <FloatingHearts />
              <motion.span
                initial={{ scale: 0, rotate: -40 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.25 }}
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-olive/15 text-olive"
              >
                <Icon name="check" className="h-9 w-9" strokeWidth={2.2} />
              </motion.span>
              <motion.h3
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.4 }}
                className="mt-7 font-serif text-3xl font-medium text-cocoa"
              >
                Merci, {confirmedName} !
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.55 }}
                className="mx-auto mt-4 max-w-sm text-sm leading-relaxed font-light text-cocoa/70"
              >
                Votre présence est confirmée. Nous avons déjà hâte de partager ce
                moment avec vous.
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.75 }}
                className="mt-6 font-serif text-lg italic text-terracotta"
              >
                Myrna &amp; Jaël
              </motion.p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              exit={{ opacity: 0, y: -26, scale: 0.97 }}
              transition={{ duration: 0.35, ease: EASE }}
              onSubmit={handleSubmit}
              className="rounded-[2rem] bg-cream p-8 shadow-2xl sm:p-12"
            >
              <div className="space-y-7">
                <div className="relative">
                  <label
                    htmlFor="rsvp-name"
                    className="mb-2.5 block text-[0.7rem] font-medium uppercase tracking-[0.25em] text-cocoa/70"
                  >
                    Votre nom <span className="text-rust">*</span>
                  </label>
                  <input
                    id="rsvp-name"
                    type="text"
                    required
                    autoComplete="off"
                    role="combobox"
                    aria-expanded={suggestions.length > 0}
                    aria-controls="rsvp-name-suggestions"
                    aria-autocomplete="list"
                    placeholder="Prénom et nom, comme sur l'invitation"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={handleNameKeyDown}
                    onBlur={() => setTimeout(() => setSuggestions([]), 150)}
                    className="w-full rounded-2xl border border-cocoa/15 bg-white px-5 py-3.5 text-sm text-cocoa placeholder:font-light placeholder:text-cocoa/35 focus:border-terracotta focus:outline-2 focus:outline-terracotta/30 transition-colors"
                  />

                  {suggestions.length > 0 && (
                    <ul
                      id="rsvp-name-suggestions"
                      role="listbox"
                      aria-label="Invités correspondants"
                      className="animate-fade-in absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-cocoa/10 bg-white shadow-xl shadow-cocoa/15"
                      style={{ animationDuration: "0.2s" }}
                    >
                      {suggestions.map((suggestion, index) => (
                        <li key={suggestion} role="option" aria-selected={index === highlighted}>
                          <button
                            type="button"
                            // onMouseDown pour devancer le blur du champ
                            onMouseDown={(e) => {
                              e.preventDefault();
                              pickSuggestion(suggestion);
                            }}
                            onMouseEnter={() => setHighlighted(index)}
                            className={`flex w-full cursor-pointer items-center gap-3 px-5 py-3 text-left text-sm transition-colors ${
                              index === highlighted
                                ? "bg-terracotta/10 text-rust"
                                : "text-cocoa/80"
                            }`}
                          >
                            <Icon name="users" className="h-4 w-4 shrink-0 opacity-50" />
                            {suggestion}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="rsvp-message"
                    className="mb-2.5 block text-[0.7rem] font-medium uppercase tracking-[0.25em] text-cocoa/70"
                  >
                    Message aux mariés{" "}
                    <span className="font-light normal-case tracking-normal text-cocoa/40">
                      (optionnel)
                    </span>
                  </label>
                  <textarea
                    id="rsvp-message"
                    rows={4}
                    placeholder="Quelques mots doux pour Myrna & Jaël…"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full resize-none rounded-2xl border border-cocoa/15 bg-white px-5 py-3.5 text-sm text-cocoa placeholder:font-light placeholder:text-cocoa/35 focus:border-terracotta focus:outline-2 focus:outline-terracotta/30 transition-colors"
                  />
                </div>

                {status === "error" && (
                  <p
                    role="alert"
                    className="animate-fade-in flex items-start gap-2.5 rounded-2xl bg-rust/8 px-4 py-3 text-sm font-light text-rust"
                  >
                    <Icon name="x" className="mt-0.5 h-4 w-4 shrink-0" />
                    {feedback}
                  </p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  icon={status === "submitting" ? "loader" : "send"}
                  disabled={status === "submitting"}
                  className={`w-full ${status === "submitting" ? "[&_svg]:animate-spin-slow" : ""}`}
                >
                  {status === "submitting" ? "Envoi en cours…" : "Je confirme ma présence"}
                </Button>
              </div>
            </motion.form>
          )}
          </AnimatePresence>
        </FadeIn>
      </div>
    </section>
  );
}
