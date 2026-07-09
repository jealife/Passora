"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "@/components/motion/primitives";

/**
 * Révèle son contenu (fondu montant + mise au point) à l'entrée dans le
 * viewport — propulsé par Framer Motion. `delay` (ms) orchestre les cascades.
 */
export default function FadeIn({ delay = 0, className = "", children, ...props }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 34, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.9, ease: EASE, delay: delay / 1000 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
