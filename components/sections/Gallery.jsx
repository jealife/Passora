"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Icon from "@/components/ui/Icons";
import SectionHeading from "@/components/ui/SectionHeading";
import { EASE } from "@/components/motion/primitives";

/**
 * Galerie en maçonnerie + visionneuse plein écran immersive :
 * ouverture/fermeture animées, navigation au clavier (←, →, Échap),
 * glisser horizontal pour changer d'image, glisser vers le bas pour fermer.
 */
export default function Gallery({ images = [] }) {
  const [lightbox, setLightbox] = useState(null); // { index, direction }
  const reduceMotion = useReducedMotion();
  const isOpen = lightbox !== null;

  const close = useCallback(() => setLightbox(null), []);
  const next = useCallback(
    () =>
      setLightbox((state) =>
        state ? { index: (state.index + 1) % images.length, direction: 1 } : state,
      ),
    [images.length],
  );
  const previous = useCallback(
    () =>
      setLightbox((state) =>
        state
          ? { index: (state.index - 1 + images.length) % images.length, direction: -1 }
          : state,
      ),
    [images.length],
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") previous();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close, next, previous]);

  if (!images.length) return null;

  const current = isOpen ? images[lightbox.index] : null;

  return (
    <section id="galerie" className="bg-cream py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Nos plus beaux instants"
          title="Galerie"
          subtitle="Quelques images de notre aventure — touchez une photo pour l'admirer en plein écran."
        />

        <div className="columns-2 gap-4 sm:gap-5 lg:columns-3">
          {images.map((image, index) => (
            <motion.div
              key={image.url}
              className="mb-4 sm:mb-5"
              initial={reduceMotion ? false : { opacity: 0, y: 40, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "0px 0px -40px 0px" }}
              transition={{ duration: 0.8, ease: EASE, delay: (index % 3) * 0.12 }}
            >
              <motion.button
                type="button"
                onClick={() => setLightbox({ index, direction: 0 })}
                aria-label={`Agrandir : ${image.alt || `photo ${index + 1}`}`}
                whileHover={reduceMotion ? undefined : { y: -6 }}
                whileTap={{ scale: 0.98 }}
                className="group relative block w-full cursor-zoom-in overflow-hidden rounded-3xl shadow-md shadow-cocoa/8 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-rust"
              >
                <img
                  src={image.url}
                  alt={image.alt || `Photo ${index + 1}`}
                  loading="lazy"
                  className="w-full transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <span className="absolute inset-0 flex items-end justify-start bg-gradient-to-t from-cocoa/50 via-transparent to-transparent p-5 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <Icon name="camera" className="h-5 w-5 text-cream" />
                </span>
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Visionneuse plein écran */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Visionneuse de photos"
            className="fixed inset-0 z-50 flex items-center justify-center bg-cocoa/95 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={close}
          >
            <button
              type="button"
              aria-label="Fermer"
              onClick={close}
              className="absolute top-5 right-5 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-cream/10 text-cream transition-colors hover:bg-cream/20"
            >
              <Icon name="x" className="h-5 w-5" />
            </button>

            <button
              type="button"
              aria-label="Photo précédente"
              onClick={(e) => {
                e.stopPropagation();
                previous();
              }}
              className="absolute left-3 z-10 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-cream/10 text-cream transition-colors hover:bg-cream/20 sm:left-6"
            >
              <Icon name="chevron-left" className="h-6 w-6" />
            </button>

            <AnimatePresence mode="popLayout" initial={false} custom={lightbox.direction}>
              <motion.figure
                key={lightbox.index}
                custom={lightbox.direction}
                variants={{
                  enter: (direction) => ({
                    opacity: 0,
                    x: direction * 90,
                    scale: direction === 0 ? 0.86 : 0.98,
                  }),
                  center: { opacity: 1, x: 0, scale: 1 },
                  exit: (direction) => ({ opacity: 0, x: direction * -90, scale: 0.98 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: EASE }}
                drag={reduceMotion ? false : true}
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={{ left: 0.35, right: 0.35, top: 0.1, bottom: 0.5 }}
                onDragEnd={(_, info) => {
                  if (info.offset.y > 130) return close();
                  if (info.offset.x < -70) return next();
                  if (info.offset.x > 70) return previous();
                }}
                className="flex max-h-[86svh] max-w-[92vw] cursor-grab flex-col items-center active:cursor-grabbing"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={current.url}
                  alt={current.alt || `Photo ${lightbox.index + 1}`}
                  draggable={false}
                  className="max-h-[78svh] max-w-full rounded-2xl object-contain shadow-2xl"
                />
                <figcaption className="mt-4 flex items-center gap-4 text-sm font-light tracking-widest text-cream/80">
                  <span>{current.alt}</span>
                  <span className="text-cream/50 tabular-nums">
                    {lightbox.index + 1} / {images.length}
                  </span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>

            <button
              type="button"
              aria-label="Photo suivante"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-3 z-10 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-cream/10 text-cream transition-colors hover:bg-cream/20 sm:right-6"
            >
              <Icon name="chevron-right" className="h-6 w-6" />
            </button>

            <p className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 text-[0.65rem] font-light tracking-[0.2em] text-cream/40 uppercase">
              Glissez pour naviguer · vers le bas pour fermer
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
