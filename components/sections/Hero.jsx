"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useWelcome } from "@/components/layout/WelcomeContext";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icons";
import Ornament from "@/components/ui/Ornament";
import { EASE, fadeUpItem, staggerContainer } from "@/components/motion/primitives";
import { formatDateFr, formatTimeFr } from "@/lib/utils";

/**
 * Hero plein écran immersif : photo des mariés (administrable) ou
 * composition graphique terracotta ; entrée en cascade jouée quand
 * l'invité quitte l'écran de bienvenue, et parallaxe au défilement —
 * le décor glisse plus lentement que le contenu, qui s'élève et
 * s'estompe en quittant l'écran.
 */
export default function Hero({ event, venueName }) {
  const hasPhoto = Boolean(event.hero_image_url);
  const dateLabel = formatDateFr(event.wedding_date);
  const timeLabel = formatTimeFr(event.wedding_date);

  const sectionRef = useRef(null);
  const reduceMotion = useReducedMotion();
  // La cascade d'entrée attend la fermeture de l'écran de bienvenue,
  // sinon elle se joue invisible, derrière lui.
  const { entered } = useWelcome();
  const revealed = reduceMotion || entered;
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Parallaxe : le fond descend doucement, le contenu s'élève et s'estompe.
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-38%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  return (
    <section
      ref={sectionRef}
      id="accueil"
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-5 py-24 text-center"
    >
      {/* Arrière-plan : photo ou composition graphique, en parallaxe */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        style={reduceMotion ? undefined : { y: backgroundY }}
      >
        {hasPhoto ? (
          <>
            <Image
              src={event.hero_image_url}
              alt=""
              fill
              priority
              sizes="100vw"
              className="scale-110 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-cocoa/55 via-cocoa/30 to-cocoa/70" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-champagne via-cream to-linen" />
            {/* Halos de couleur qui respirent */}
            <motion.div
              className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blush/25 blur-3xl"
              animate={reduceMotion ? undefined : { y: [0, -18, 0], x: [0, 10, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-terracotta/20 blur-3xl"
              animate={reduceMotion ? undefined : { y: [0, 22, 0] }}
              transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            />
            <motion.div
              className="absolute -bottom-24 left-1/4 h-80 w-80 rounded-full bg-olive/15 blur-3xl"
              animate={reduceMotion ? undefined : { y: [0, -16, 0], x: [0, -12, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            />
            {/* Grande arche architecturale qui s'ouvre à l'entrée */}
            <motion.div
              className="absolute top-1/2 left-1/2 h-[78%] w-[min(92vw,40rem)] rounded-t-full border border-terracotta/25"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.92, x: "-50%", y: "-50%" }}
              animate={revealed ? { opacity: 1, scale: 1, x: "-50%", y: "-50%" } : undefined}
              transition={{ duration: 1.6, ease: EASE, delay: 0.2 }}
            />
            <motion.div
              className="absolute top-1/2 left-1/2 h-[74%] w-[min(86vw,37rem)] rounded-t-full border border-terracotta/15"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.88, x: "-50%", y: "-50%" }}
              animate={revealed ? { opacity: 1, scale: 1, x: "-50%", y: "-50%" } : undefined}
              transition={{ duration: 1.6, ease: EASE, delay: 0.35 }}
            />
          </>
        )}
      </motion.div>

      {/* Contenu : cascade d'entrée orchestrée */}
      <motion.div
        className="relative z-10 flex max-w-3xl flex-col items-center"
        style={reduceMotion ? undefined : { y: contentY, opacity: contentOpacity }}
        variants={staggerContainer(0.16, 0.3)}
        initial={reduceMotion ? false : "hidden"}
        animate={revealed ? "visible" : "hidden"}
      >
        <motion.p
          variants={fadeUpItem}
          className={`mb-6 text-[0.72rem] font-medium uppercase tracking-[0.45em] ${
            hasPhoto ? "text-cream/85" : "text-terracotta"
          }`}
        >
          {event.tagline || "Nous nous disons oui"}
        </motion.p>

        <h1
          className={`font-serif text-5xl leading-[1.08] font-medium sm:text-7xl md:text-8xl ${
            hasPhoto ? "text-cream" : "text-cocoa"
          }`}
        >
          <motion.span variants={fadeUpItem} className="block">
            {event.bride_name}
          </motion.span>
          <motion.span
            variants={fadeUpItem}
            className={`my-1 block font-serif text-3xl italic sm:text-5xl ${
              hasPhoto ? "text-blush-soft" : "text-terracotta"
            }`}
          >
            &amp;
          </motion.span>
          <motion.span variants={fadeUpItem} className="block">
            {event.groom_name}
          </motion.span>
        </h1>

        <motion.div variants={fadeUpItem} className="mt-8">
          <Ornament className={hasPhoto ? "text-cream/80" : "text-terracotta"} />
        </motion.div>

        {/* Date, heure, lieu */}
        <motion.div
          variants={fadeUpItem}
          className={`mt-8 flex flex-col items-center gap-3 sm:flex-row sm:gap-8 ${
            hasPhoto ? "text-cream/90" : "text-cocoa/80"
          }`}
        >
          <span className="flex items-center gap-2.5 text-sm font-light tracking-wide">
            <Icon name="calendar" className="h-4.5 w-4.5 opacity-70" />
            <span className="capitalize">{dateLabel}</span>
            {!event.date_confirmed && (
              <em className="font-serif text-xs italic opacity-70">(à confirmer)</em>
            )}
          </span>
          <span
            aria-hidden="true"
            className={`hidden h-1 w-1 rounded-full sm:block ${hasPhoto ? "bg-cream/60" : "bg-terracotta/60"}`}
          />
          <span className="flex items-center gap-2.5 text-sm font-light tracking-wide">
            <Icon name="clock" className="h-4.5 w-4.5 opacity-70" />
            {timeLabel}
          </span>
          <span
            aria-hidden="true"
            className={`hidden h-1 w-1 rounded-full sm:block ${hasPhoto ? "bg-cream/60" : "bg-terracotta/60"}`}
          />
          <span className="flex items-center gap-2.5 text-sm font-light tracking-wide">
            <Icon name="map-pin" className="h-4.5 w-4.5 opacity-70" />
            {venueName}
          </span>
        </motion.div>

        <motion.div
          variants={fadeUpItem}
          className="mt-11 flex flex-col items-center gap-4 sm:flex-row"
        >
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Button href="#rsvp" size="lg" icon="heart">
              Confirmer ma présence
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Button
              href="#compteur"
              variant={hasPhoto ? "light" : "outline"}
              size="lg"
              icon="chevron-down"
              iconPosition="right"
            >
              Découvrir
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Indicateur de défilement */}
      <motion.a
        href="#compteur"
        aria-label="Faire défiler vers le compte à rebours"
        className={`absolute bottom-7 left-1/2 -translate-x-1/2 ${
          hasPhoto ? "text-cream/70" : "text-cocoa/40"
        }`}
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={revealed ? { opacity: 1 } : undefined}
        transition={{ delay: 1.8, duration: 1 }}
      >
        <motion.span
          className="block"
          animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <Icon name="chevron-down" className="h-6 w-6" />
        </motion.span>
      </motion.a>
    </section>
  );
}
