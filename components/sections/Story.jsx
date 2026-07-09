"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import FadeIn from "@/components/ui/FadeIn";
import Icon from "@/components/ui/Icons";
import Ornament from "@/components/ui/Ornament";

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * « Notre histoire » — lecteur audio élégant.
 *
 * La lecture est tentée dès l'ouverture de la page ; si le navigateur la
 * bloque (politique d'autoplay), elle démarre automatiquement à la première
 * interaction (toucher, clic, défilement), avec une invitation discrète.
 */
export default function Story({ event }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [needsGesture, setNeedsGesture] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Autoplay bloqué : on réessaie à chaque interaction jusqu'à ce que
    // la lecture démarre réellement (certains gestes, comme le défilement
    // à la molette, ne lèvent pas la restriction d'autoplay).
    const gestureEvents = ["pointerdown", "touchend", "keydown", "scroll"];
    const startOnGesture = () => {
      audio.play().then(removeGestureListeners).catch(() => {});
    };
    const removeGestureListeners = () => {
      gestureEvents.forEach((event) => window.removeEventListener(event, startOnGesture));
    };

    // Tentative de lecture automatique à l'ouverture du lien.
    const tryAutoplay = async () => {
      try {
        await audio.play();
      } catch {
        setNeedsGesture(true);
        gestureEvents.forEach((event) =>
          window.addEventListener(event, startOnGesture, { passive: true }),
        );
      }
    };

    const onPlay = () => {
      setPlaying(true);
      setNeedsGesture(false);
    };
    const onPause = () => setPlaying(false);
    const onTime = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    };
    const onMeta = () => setDuration(audio.duration);

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onPause);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);

    tryAutoplay();

    return () => {
      removeGestureListeners();
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onPause);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.pause();
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  };

  const seek = (e) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    audio.currentTime = ratio * audio.duration;
  };

  return (
    <section id="histoire" className="relative overflow-hidden bg-cream py-24 sm:py-32">
      {/* Ornements d'arrière-plan */}
      <div
        aria-hidden="true"
        className="absolute -top-16 -right-16 h-72 w-72 rounded-full bg-blush/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 -left-20 h-80 w-80 rounded-full bg-sand/40 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-5xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
        <FadeIn>
          <p className="mb-4 text-[0.7rem] font-medium uppercase tracking-[0.35em] text-terracotta">
            Écoutez-nous vous la raconter
          </p>
          <h2 className="font-serif text-4xl font-medium text-cocoa sm:text-5xl">
            {event.story_title || "Notre histoire"}
          </h2>
          <div className="mt-6 flex justify-start">
            <Ornament className="text-terracotta" />
          </div>
          <p className="mt-7 text-base leading-loose font-light text-cocoa/75">
            {event.story_text}
          </p>
        </FadeIn>

        <FadeIn delay={200}>
          <div className="relative rounded-[2rem] border border-terracotta/15 bg-linen p-8 shadow-xl shadow-cocoa/8 sm:p-10">
            <audio ref={audioRef} src={event.story_audio_url} preload="metadata" />

            <div className="flex items-center gap-6">
              <div className="relative shrink-0">
                {/* Ondes sonores qui se propagent pendant la lecture */}
                {playing && (
                  <>
                    <motion.span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full border-2 border-rust/50"
                      animate={{ scale: [1, 1.65], opacity: [0.6, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                    />
                    <motion.span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full border-2 border-terracotta/40"
                      animate={{ scale: [1, 1.65], opacity: [0.6, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
                    />
                  </>
                )}
                <motion.button
                  type="button"
                  onClick={toggle}
                  aria-label={playing ? "Mettre en pause" : "Écouter notre histoire"}
                  whileHover={{ scale: 1.07 }}
                  whileTap={{ scale: 0.94 }}
                  className={`relative flex h-18 w-18 cursor-pointer items-center justify-center rounded-full bg-rust text-cream shadow-lg shadow-rust/30 transition-colors duration-300 hover:bg-rust-deep ${
                    needsGesture ? "animate-pulse-soft" : ""
                  }`}
                >
                  <Icon name={playing ? "pause" : "play"} className="h-7 w-7 translate-x-[1px]" />
                </motion.button>
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-serif text-xl italic text-cocoa">Notre histoire</p>
                <p className="mt-1 flex items-center gap-2 text-xs font-light tracking-wide text-cocoa/60">
                  <Icon name="music" className="h-3.5 w-3.5" />
                  {playing
                    ? "Lecture en cours…"
                    : needsGesture
                      ? "Touchez l'écran pour lancer la musique"
                      : "Un message des mariés"}
                </p>
              </div>

              {/* Égaliseur animé pendant la lecture */}
              <div className="flex h-8 items-end gap-1" aria-hidden="true">
                {[0, 1, 2, 3].map((bar) => (
                  <span
                    key={bar}
                    className={`w-1 rounded-full bg-terracotta origin-bottom ${
                      playing ? "animate-equalizer" : "scale-y-[0.35]"
                    }`}
                    style={{ height: `${14 + bar * 5}px`, animationDelay: `${bar * 0.18}s` }}
                  />
                ))}
              </div>
            </div>

            {/* Barre de progression */}
            <div
              role="slider"
              aria-label="Position de lecture"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
              tabIndex={0}
              onClick={seek}
              className="group mt-8 h-6 cursor-pointer"
            >
              <div className="relative top-2 h-1.5 overflow-hidden rounded-full bg-cocoa/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-terracotta to-rust transition-[width] duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between text-[0.7rem] font-light tracking-widest text-cocoa/50 tabular-nums">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
