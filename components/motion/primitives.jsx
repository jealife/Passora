"use client";

import { motion, useReducedMotion } from "framer-motion";
import Icon from "@/components/ui/Icons";

/* Primitives Framer Motion partagées par les sections du site. */

export const EASE = [0.22, 1, 0.36, 1];

/** Variants d'un conteneur qui révèle ses enfants en cascade. */
export const staggerContainer = (stagger = 0.12, delay = 0) => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

/** Variants d'un enfant : fondu montant avec léger flou de netteté. */
export const fadeUpItem = {
  hidden: { opacity: 0, y: 34, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: EASE },
  },
};

/**
 * Bandeau défilant infini (marquee) — emporte le regard entre les sections.
 * Le contenu est dupliqué pour boucler sans couture.
 */
export function Marquee({ children, duration = 26, className = "" }) {
  const reduceMotion = useReducedMotion();
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        className="flex w-max items-center"
        animate={reduceMotion ? undefined : { x: ["0%", "-50%"] }}
        transition={{ duration, ease: "linear", repeat: Infinity }}
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center" aria-hidden={copy === 1}>
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/** Cœurs qui s'élèvent doucement — célébration après un RSVP réussi. */
export function FloatingHearts({ count = 7 }) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => {
        const left = 8 + ((index * 83) % 84);
        const delay = (index * 0.9) % 4;
        const size = 12 + ((index * 5) % 12);
        return (
          <motion.span
            key={index}
            className="absolute bottom-0 text-terracotta/60"
            style={{ left: `${left}%` }}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: -320, opacity: [0, 0.9, 0], x: [0, index % 2 ? 18 : -18, 0] }}
            transition={{ duration: 5.5, delay, repeat: Infinity, ease: "easeOut" }}
          >
            <Icon name="heart" className="h-4 w-4" style={{ width: size, height: size }} />
          </motion.span>
        );
      })}
    </div>
  );
}
