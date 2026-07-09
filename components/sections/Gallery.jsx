"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Icon from "@/components/ui/Icons";
import Ornament from "@/components/ui/Ornament";
import { EASE } from "@/components/motion/primitives";

/**
 * Galerie immersive au défilement : la section se fige à l'écran et les
 * photos glissent horizontalement au rythme du scroll vertical (avec un
 * léger ressort), compteur et barre de progression à l'appui.
 * Un clic ouvre la visionneuse plein écran (clavier, glisser pour
 * naviguer, glisser vers le bas pour fermer).
 * Si l'utilisateur préfère réduire les animations, la galerie redevient
 * un défilement horizontal natif.
 */
export default function Gallery({ images = [] }) {
  const [lightbox, setLightbox] = useState(null); // { index, direction }
  const [activeIndex, setActiveIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const isOpen = lightbox !== null;

  /* ---- Défilement horizontal piloté par le scroll ---- */
  const sectionRef = useRef(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const [shift, setShift] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    mass: 0.5,
  });
  const x = useTransform(smoothProgress, [0, 1], [0, -shift]);

  // Largeur à parcourir = largeur de la piste − largeur visible.
  useEffect(() => {
    const measure = () => {
      if (!trackRef.current || !viewportRef.current) return;
      setShift(Math.max(0, trackRef.current.scrollWidth - viewportRef.current.clientWidth));
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (trackRef.current) observer.observe(trackRef.current);
    if (viewportRef.current) observer.observe(viewportRef.current);
    return () => observer.disconnect();
  }, [images.length]);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (!images.length) return;
    setActiveIndex(Math.min(images.length - 1, Math.round(value * (images.length - 1))));
  });

  /* ---- Visionneuse ---- */
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
  const immersive = !reduceMotion;

  return (
    <section
      ref={sectionRef}
      id="galerie"
      className="relative bg-cream"
      style={immersive ? { height: `${Math.max(220, images.length * 60)}svh` } : undefined}
    >
      <div
        className={
          immersive
            ? "sticky top-0 flex h-svh flex-col overflow-hidden"
            : "flex flex-col py-24 sm:py-28"
        }
      >
        {/* En-tête compact, toujours visible pendant le voyage */}
        <div className="px-5 pt-20 pb-4 text-center sm:pt-24">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <p className="mb-3 text-[0.7rem] font-medium uppercase tracking-[0.35em] text-terracotta">
              Nos plus beaux instants
            </p>
            <h2 className="font-serif text-4xl font-medium text-cocoa sm:text-5xl">Galerie</h2>
            <div className="mt-5">
              <Ornament />
            </div>
            <p className="mt-4 text-sm font-light text-cocoa/60">
              {immersive
                ? "Continuez à défiler — les souvenirs avancent avec vous."
                : "Faites défiler horizontalement pour parcourir nos souvenirs."}
            </p>
          </motion.div>
        </div>

        {/* Piste horizontale */}
        <div
          ref={viewportRef}
          className={`relative flex flex-1 items-center ${
            immersive ? "overflow-hidden" : "snap-x snap-mandatory overflow-x-auto"
          }`}
        >
          <motion.div
            ref={trackRef}
            style={immersive ? { x } : undefined}
            className="flex items-center gap-5 px-[9vw] py-4 sm:gap-8"
          >
            {images.map((image, index) => (
              <motion.button
                key={image.url}
                type="button"
                onClick={() => setLightbox({ index, direction: 0 })}
                aria-label={`Agrandir : ${image.alt || `photo ${index + 1}`}`}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ root: viewportRef, once: true, margin: "0px -10% 0px -10%" }}
                transition={{ duration: 0.7, ease: EASE }}
                whileHover={reduceMotion ? undefined : { y: -10, rotate: 0 }}
                whileTap={{ scale: 0.98 }}
                className={`group relative shrink-0 cursor-zoom-in snap-center overflow-hidden rounded-[1.8rem] shadow-xl shadow-cocoa/12 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rust ${
                  index % 2 ? "rotate-[1.2deg]" : "rotate-[-1.2deg]"
                }`}
              >
                <img
                  src={image.url}
                  alt={image.alt || `Photo ${index + 1}`}
                  draggable={false}
                  className="h-[44svh] w-auto max-w-[80vw] object-cover transition-transform duration-700 ease-out group-hover:scale-105 sm:h-[52svh] sm:max-w-[42rem]"
                />
                {/* Numéro fantôme et légende */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-4 left-5 font-serif text-5xl font-medium text-cream/70 italic drop-shadow-sm sm:text-6xl"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-cocoa/55 via-cocoa/10 to-transparent p-5 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <span className="text-sm font-light tracking-widest text-cream">
                    {image.alt}
                  </span>
                  <Icon name="camera" className="h-5 w-5 text-cream/90" />
                </span>
              </motion.button>
            ))}

            {/* Carte finale : invitation à confirmer */}
            <motion.a
              href="#rsvp"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ root: viewportRef, once: true, margin: "0px -10% 0px -10%" }}
              transition={{ duration: 0.7, ease: EASE }}
              whileHover={reduceMotion ? undefined : { y: -10 }}
              className="flex h-[44svh] w-64 shrink-0 snap-center flex-col items-center justify-center gap-4 rounded-[1.8rem] border border-terracotta/25 bg-linen px-8 text-center shadow-xl shadow-cocoa/8 sm:h-[52svh] sm:w-80"
            >
              <Icon name="heart" className="h-8 w-8 text-rust" />
              <p className="font-serif text-2xl italic text-cocoa">
                La suite s’écrit avec vous
              </p>
              <span className="text-[0.68rem] font-medium uppercase tracking-[0.25em] text-terracotta">
                Confirmer ma présence →
              </span>
            </motion.a>
          </motion.div>
        </div>

        {/* Compteur et progression */}
        <div className="flex flex-col items-center gap-3 px-5 pt-4 pb-9">
          <p className="font-serif text-lg text-cocoa/70 tabular-nums">
            <span className="text-2xl font-medium text-rust">
              {String(activeIndex + 1).padStart(2, "0")}
            </span>
            <span className="mx-1.5 text-cocoa/35">/</span>
            {String(images.length).padStart(2, "0")}
          </p>
          {immersive && (
            <div className="h-1 w-52 overflow-hidden rounded-full bg-cocoa/10 sm:w-72">
              <motion.div
                className="h-full origin-left rounded-full bg-gradient-to-r from-terracotta to-rust"
                style={{ scaleX: smoothProgress }}
              />
            </div>
          )}
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
