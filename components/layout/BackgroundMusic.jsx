"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useWelcome } from "@/components/layout/WelcomeContext";
import { EASE, fadeUpItem, staggerContainer } from "@/components/motion/primitives";
import Icon from "@/components/ui/Icons";
import Ornament from "@/components/ui/Ornament";

/**
 * Musique d'ambiance de la page.
 *
 * ── Pour changer le morceau : téléversez-le depuis l'admin (carte
 *    « Notre histoire »), ou remplacez public/audio/ambiance.mp3. ──
 */
const DEFAULT_SRC = "/audio/ambiance.mp3";

// Ancien chemin encore présent dans les bases installées avant le
// renommage du fichier : on le rabat sur le morceau par défaut.
const LEGACY_SRC = "/audio/notre-histoire.mp3";

/** Prénom seul, pour l'écran de bienvenue. */
const firstName = (name) => (name || "").trim().split(/\s+/)[0];

/**
 * Les navigateurs interdisent tout son avant un geste de l'utilisateur
 * (politique d'autoplay). Un écran de bienvenue accueille donc l'invité :
 * son clic pour entrer sert de geste et lance la musique à coup sûr.
 * Si l'autoplay est exceptionnellement autorisé, l'écran s'efface seul.
 * Un petit bouton flottant permet ensuite de couper ou relancer la musique.
 */
export default function BackgroundMusic({ src, brideName, groomName }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const { entered, enter: markEntered } = useWelcome();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => {
      setPlaying(true);
      // Autoplay autorisé sans geste : inutile de retenir l'invité.
      markEntered();
    };
    const onPause = () => setPlaying(false);

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    // Tentative de lecture dès l'ouverture — presque toujours bloquée,
    // l'écran de bienvenue prend alors le relais.
    audio.play().catch(() => {});

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.pause();
    };
  }, []);

  // Bloque le défilement tant que l'écran de bienvenue est affiché.
  useEffect(() => {
    if (entered) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [entered]);

  const enter = () => {
    markEntered();
    const audio = audioRef.current;
    if (audio) audio.play().catch(() => {});
  };

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={!src || src === LEGACY_SRC ? DEFAULT_SRC : src}
        loop
        preload="auto"
      />

      {/* Écran de bienvenue — le clic lance la musique */}
      <AnimatePresence>
        {!entered && (
          <motion.div
            role="dialog"
            aria-label="Bienvenue"
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            onClick={enter}
            className="fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center overflow-hidden bg-cream px-6 text-center"
          >
            {/* Halos de couleur qui respirent */}
            <motion.div
              aria-hidden="true"
              className="absolute -top-24 -right-20 h-80 w-80 rounded-full bg-blush/20 blur-3xl"
              animate={reduceMotion ? undefined : { y: [0, -16, 0], x: [0, 10, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              aria-hidden="true"
              className="absolute -bottom-28 -left-24 h-96 w-96 rounded-full bg-sand/50 blur-3xl"
              animate={reduceMotion ? undefined : { y: [0, 18, 0], x: [0, -10, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
            />

            {/* Arche architecturale qui s'ouvre — écho du hero */}
            <motion.div
              aria-hidden="true"
              className="absolute top-1/2 left-1/2 h-[72%] w-[min(88vw,34rem)] rounded-t-full border border-terracotta/25"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.9, x: "-50%", y: "-46%" }}
              animate={{ opacity: 1, scale: 1, x: "-50%", y: "-46%" }}
              transition={{ duration: 1.6, ease: EASE, delay: 0.15 }}
            />

            {/* Contenu révélé en cascade */}
            <motion.div
              className="relative flex flex-col items-center"
              variants={staggerContainer(0.16, 0.35)}
              initial={reduceMotion ? false : "hidden"}
              animate="visible"
            >
              <motion.p
                variants={fadeUpItem}
                className="text-[0.7rem] font-medium uppercase tracking-[0.35em] text-terracotta"
              >
                Bienvenue au mariage de
              </motion.p>
              <motion.p
                variants={fadeUpItem}
                className="mt-5 font-serif text-5xl font-medium italic text-cocoa sm:text-6xl"
              >
                {firstName(brideName) || "M"} <span className="text-terracotta">&</span>{" "}
                {firstName(groomName) || "J"}
              </motion.p>
              <motion.div variants={fadeUpItem} className="mt-7 flex justify-center">
                <Ornament className="text-terracotta" />
              </motion.div>

              <motion.div variants={fadeUpItem} className="relative mt-10">
                {/* Onde qui se propage — invitation au clic */}
                {!reduceMotion && (
                  <motion.span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full border-2 border-rust/40"
                    animate={{ scale: [1, 1.35], opacity: [0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 1.8 }}
                  />
                )}
                <motion.button
                  type="button"
                  onClick={enter}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative inline-flex cursor-pointer items-center gap-3 rounded-full bg-rust px-8 py-3.5 text-[0.72rem] font-medium uppercase tracking-[0.22em] text-cream shadow-lg shadow-rust/30 transition-colors duration-300 hover:bg-rust-deep"
                >
                  <Icon name="music" className="h-4 w-4" />
                  Entrer
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bouton flottant : couper / relancer la musique */}
      <div className="fixed right-5 bottom-5 z-40">
        {/* Ondes sonores qui se propagent pendant la lecture */}
        {playing && (
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full border-2 border-rust/50"
            animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <motion.button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Couper la musique" : "Lancer la musique"}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-rust text-cream shadow-lg shadow-rust/30 transition-colors duration-300 hover:bg-rust-deep"
        >
          <Icon name={playing ? "pause" : "music"} className="h-5 w-5" />
        </motion.button>
      </div>
    </>
  );
}
