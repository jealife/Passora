"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import FadeIn from "@/components/ui/FadeIn";
import Icon from "@/components/ui/Icons";
import Ornament from "@/components/ui/Ornament";
import { EASE } from "@/components/motion/primitives";

function getRemaining(target) {
  const diff = new Date(target).getTime() - Date.now();
  if (Number.isNaN(diff) || diff <= 0) return null;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

/** Chiffre animé : l'ancienne valeur glisse vers le haut, la nouvelle arrive. */
function AnimatedValue({ value }) {
  const reduceMotion = useReducedMotion();
  const display = value === undefined ? "—" : String(value).padStart(2, "0");

  if (reduceMotion) {
    return (
      <span className="block font-serif text-5xl font-medium text-rust tabular-nums sm:text-6xl">
        {display}
      </span>
    );
  }

  return (
    <span className="relative block h-[1.15em] overflow-hidden font-serif text-5xl font-medium text-rust tabular-nums sm:text-6xl">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={display}
          className="block"
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          {display}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/**
 * Compte à rebours jusqu'au mariage, mis à jour chaque seconde,
 * avec chiffres qui basculent et tuiles qui surgissent en ressort.
 */
export default function Countdown({ targetDate, dateConfirmed = true }) {
  const [remaining, setRemaining] = useState(undefined);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const tick = () => setRemaining(getRemaining(targetDate));
    const frame = requestAnimationFrame(tick);
    const timer = setInterval(tick, 1000);
    return () => {
      cancelAnimationFrame(frame);
      clearInterval(timer);
    };
  }, [targetDate]);

  const units = [
    { value: remaining?.days, label: "Jours" },
    { value: remaining?.hours, label: "Heures" },
    { value: remaining?.minutes, label: "Minutes" },
    { value: remaining?.seconds, label: "Secondes" },
  ];

  const isPast = remaining === null;

  return (
    <section id="compteur" className="relative bg-linen py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
        <FadeIn>
          <p className="mb-4 text-[0.7rem] font-medium uppercase tracking-[0.35em] text-terracotta">
            Le grand jour approche
          </p>
          <h2 className="font-serif text-4xl font-medium text-cocoa sm:text-5xl">
            {isPast ? "C’est le grand jour !" : "Plus que quelques instants"}
          </h2>
          <div className="mt-6">
            <Ornament />
          </div>
        </FadeIn>

        {isPast ? (
          <FadeIn delay={150} className="mt-12">
            <p className="mx-auto max-w-md font-serif text-2xl italic text-cocoa/80">
              Merci d’être à nos côtés pour célébrer notre union.
            </p>
          </FadeIn>
        ) : (
          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            {units.map((unit, index) => (
              <motion.div
                key={unit.label}
                initial={reduceMotion ? false : { opacity: 0, y: 46, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "0px 0px -60px 0px" }}
                transition={{
                  type: "spring",
                  stiffness: 190,
                  damping: 19,
                  delay: index * 0.1,
                }}
                whileHover={reduceMotion ? undefined : { y: -8, scale: 1.03 }}
                className="rounded-3xl border border-terracotta/15 bg-cream px-4 py-8 shadow-lg shadow-cocoa/5"
              >
                <AnimatedValue value={unit.value} />
                <span className="mt-3 block text-[0.68rem] font-medium uppercase tracking-[0.3em] text-cocoa/60">
                  {unit.label}
                </span>
              </motion.div>
            ))}
          </div>
        )}

        {!dateConfirmed && (
          <FadeIn delay={500} className="mt-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-terracotta/20 bg-cream px-5 py-2.5 text-xs font-light tracking-wide text-cocoa/70">
              <Icon name="sparkles" className="h-4 w-4 text-terracotta" />
              La date définitive vous sera confirmée très prochainement.
            </p>
          </FadeIn>
        )}
      </div>
    </section>
  );
}
