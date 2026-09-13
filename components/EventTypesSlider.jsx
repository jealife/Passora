"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Icon from "@/components/ui/Icons";

const SLIDES = [
  {
    src: "/images/showcase/events/mariage.jpg",
    label: "Mariages",
    text: "Coutumier, civil, réception : chaque cérémonie, sur une seule page.",
  },
  {
    src: "/images/showcase/events/anniversaire.jpg",
    label: "Anniversaires",
    text: "Une page pour rassembler vos proches autour d'un grand jour.",
  },
  {
    src: "/images/showcase/events/bapteme.jpg",
    label: "Baptêmes",
    text: "Partagez les détails de la cérémonie avec toute la famille.",
  },
  {
    src: "/images/showcase/events/reception.jpg",
    label: "Réceptions & soirées",
    text: "Invitations, programme et confirmations, pour tous vos grands moments.",
  },
];

const AUTOPLAY_MS = 4500;

/**
 * Bandeau photo défilant (après le hero de la vitrine) illustrant les
 * occasions pensées pour Passora. Photos libres de droits (Pexels),
 * à remplacer par de vraies réalisations dès qu'elles sont disponibles.
 */
export default function EventTypesSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (paused || reduceMotion) return undefined;
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
    // `index` est inclus pour redémarrer le minuteur à chaque changement de
    // slide (manuel ou automatique), sinon un clic peut coïncider avec le
    // prochain tic et sauter une slide.
  }, [paused, reduceMotion, index]);

  const goTo = (next) => setIndex((next + SLIDES.length) % SLIDES.length);
  const slide = SLIDES[index];

  return (
    <section
      className="relative h-72 overflow-hidden border-b border-passora-ink/10 sm:h-96"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={slide.src}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
        >
          <Image
            src={slide.src}
            alt=""
            fill
            sizes="100vw"
            priority={index === 0}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-passora-ink/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-passora-ink via-passora-ink/35 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative flex h-full flex-col items-center justify-end px-5 pb-14 text-center sm:pb-16">
        <p className="text-[0.65rem] font-medium tracking-[0.35em] text-passora-gold uppercase">
          {slide.label}
        </p>
        <p className="mt-2 max-w-md font-serif text-xl text-cream italic sm:text-2xl">
          {slide.text}
        </p>
      </div>

      <button
        type="button"
        aria-label="Occasion précédente"
        onClick={() => goTo(index - 1)}
        className="absolute top-1/2 left-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md bg-cream/15 text-cream backdrop-blur transition-colors hover:bg-cream/25 sm:left-6"
      >
        <Icon name="chevron-left" className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Occasion suivante"
        onClick={() => goTo(index + 1)}
        className="absolute top-1/2 right-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md bg-cream/15 text-cream backdrop-blur transition-colors hover:bg-cream/25 sm:right-6"
      >
        <Icon name="chevron-right" className="h-4 w-4" />
      </button>

      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
        {SLIDES.map((item, i) => (
          <button
            key={item.src}
            type="button"
            aria-label={`Aller à ${item.label}`}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-sm transition-all ${
              i === index ? "w-6 bg-passora-gold" : "w-1.5 bg-cream/40 hover:bg-cream/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
