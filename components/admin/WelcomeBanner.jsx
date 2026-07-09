"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Icon from "@/components/ui/Icons";
import { EASE, staggerContainer, fadeUpItem } from "@/components/motion/primitives";
import { formatDateFr } from "@/lib/utils";

/**
 * Bannière d'accueil personnalisée pour les mariés : salutation,
 * compte à rebours « J-x » et statistiques en direct de l'événement.
 */
export default function WelcomeBanner({ supabase, event, onNavigate }) {
  const [stats, setStats] = useState(null);
  const [now, setNow] = useState(null);

  // Horloge figée au montage : évite tout calcul impur pendant le rendu.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setNow(new Date()));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!supabase || !event) return;
    Promise.all([
      supabase.from("guests").select("id", { count: "exact", head: true }).eq("event_id", event.id),
      supabase.from("rsvp").select("id", { count: "exact", head: true }).eq("event_id", event.id),
      supabase.from("gallery").select("id", { count: "exact", head: true }).eq("event_id", event.id),
    ]).then(([guests, rsvp, gallery]) =>
      setStats({
        guests: guests.count || 0,
        rsvp: rsvp.count || 0,
        photos: gallery.count || 0,
      }),
    );
  }, [supabase, event]);

  const firstNames = `${(event.bride_name || "").split(/\s+/)[0]} & ${(event.groom_name || "").split(/\s+/)[0]}`;
  const hour = now ? now.getHours() : 12;
  const greeting = hour < 5 || hour >= 18 ? "Bonsoir" : "Bonjour";

  const daysLeft = now
    ? Math.ceil((new Date(event.wedding_date).getTime() - now.getTime()) / 86400000)
    : NaN;
  const dayLabel = Number.isNaN(daysLeft)
    ? "J-…"
    : daysLeft > 0
      ? `J-${daysLeft}`
      : daysLeft === 0
        ? "Jour J"
        : "Mariés !";

  const quickStats = [
    { key: "invites", icon: "users", value: stats?.guests, label: "invités" },
    { key: "rsvp", icon: "check", value: stats?.rsvp, label: "confirmés" },
    { key: "galerie", icon: "camera", value: stats?.photos, label: "photos" },
  ];

  return (
    <motion.section
      variants={staggerContainer(0.1, 0.05)}
      initial="hidden"
      animate="visible"
      className="relative mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-rust via-terracotta to-rust-deep text-cream shadow-xl shadow-rust/20"
    >
      {/* Décor : halo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-16 h-64 w-64 rounded-full bg-blush/25 blur-3xl"
      />
      {/* Décor : arches flottantes (desktop uniquement) */}
      <div
        aria-hidden="true"
        className="absolute -right-6 -bottom-24 hidden h-72 w-56 rounded-t-full border border-cream/20 sm:block"
      />
      <div
        aria-hidden="true"
        className="absolute -right-1 -bottom-24 hidden h-64 w-46 rounded-t-full border border-cream/10 sm:block"
      />

      {/* ── Contenu principal ─────────────────────────────────────────── */}
      <div className="relative px-6 pt-6 pb-4 sm:px-9 sm:pt-9 sm:pb-6">
        {/* Ligne haute : texte + arche compte-à-rebours côte à côte */}
        <div className="flex items-start justify-between gap-4">
          {/* Texte */}
          <div className="min-w-0 flex-1">
            <motion.p
              variants={fadeUpItem}
              className="text-[0.65rem] font-medium uppercase tracking-[0.28em] text-cream/65 sm:text-[0.68rem] sm:tracking-[0.3em]"
            >
              {greeting}, futurs mariés
            </motion.p>
            <motion.h1
              variants={fadeUpItem}
              className="mt-1 font-serif text-2xl font-medium italic leading-tight sm:mt-1.5 sm:text-4xl"
            >
              {firstNames}{" "}
            </motion.h1>
            <motion.p
              variants={fadeUpItem}
              className="mt-1.5 text-[0.78rem] font-light leading-relaxed text-cream/75 sm:mt-2 sm:text-sm sm:text-cream/80"
            >
              Votre grand jour se prépare ici : {" "}
              <span className="capitalize">{formatDateFr(event.wedding_date)}</span>
              {!event.date_confirmed && (
                <em className="font-serif italic"> (à confirmer)</em>
              )}.
            </motion.p>
          </div>

          {/* Compte à rebours dans une arche — toujours visible */}
          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 0.82, y: 16 },
              visible: {
                opacity: 1,
                scale: 1,
                y: 0,
                transition: { type: "spring", stiffness: 200, damping: 18, delay: 0.25 },
              },
            }}
            className="flex h-24 w-20 shrink-0 flex-col items-center justify-center rounded-t-full border border-cream/30 bg-cream/10 backdrop-blur-sm sm:h-36 sm:w-30"
          >
            <span className="font-serif text-2xl font-medium tabular-nums sm:text-4xl">
              {dayLabel}
            </span>
            <span className="mt-0.5 flex flex-col items-center gap-0.5 text-center text-[0.5rem] font-medium uppercase tracking-[0.15em] text-cream/65 sm:mt-1 sm:flex-row sm:gap-1 sm:text-[0.6rem] sm:tracking-[0.2em]">
              <Icon name="heart" className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              <span className="sm:hidden">
                {daysLeft > 0 ? "restants" : "🎉"}
              </span>
              <span className="hidden sm:inline">
                {daysLeft > 0 ? "avant le oui" : "félicitations"}
              </span>
            </span>
          </motion.div>
        </div>
      </div>

      {/* ── Statistiques rapides — bande défilante sur mobile ──────────── */}
      <motion.div variants={fadeUpItem} className="relative">
        {/* Fondu gauche/droite pour signaler le défilement */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-rust/50 to-transparent sm:hidden"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-rust-deep/50 to-transparent sm:hidden"
        />
        <div className="flex gap-2.5 overflow-x-auto px-6 pb-5 pt-0 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible sm:px-9 sm:pb-7 [&::-webkit-scrollbar]:hidden">
          {quickStats.map((stat) => (
            <button
              key={stat.key}
              type="button"
              onClick={() => onNavigate(stat.key)}
              className="flex shrink-0 cursor-pointer items-center gap-2 rounded-full bg-cream/12 px-4 py-2 text-xs font-light backdrop-blur-sm transition-colors hover:bg-cream/25 active:scale-95"
            >
              <Icon name={stat.icon} className="h-3.5 w-3.5 opacity-80" />
              <span className="font-medium tabular-nums">{stat.value ?? "…"}</span>
              {stat.label}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.section>
  );
}
