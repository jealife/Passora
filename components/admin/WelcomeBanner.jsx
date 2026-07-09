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
      className="relative mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-rust via-terracotta to-rust-deep p-7 text-cream shadow-xl shadow-rust/20 sm:p-9"
    >
      {/* Décor : halo et arche */}
      <div
        aria-hidden="true"
        className="absolute -top-20 -right-16 h-64 w-64 rounded-full bg-blush/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -right-6 -bottom-24 hidden h-72 w-56 rounded-t-full border border-cream/20 sm:block"
      />
      <div
        aria-hidden="true"
        className="absolute -right-1 -bottom-24 hidden h-64 w-46 rounded-t-full border border-cream/10 sm:block"
      />

      <div className="relative flex flex-wrap items-center justify-between gap-6">
        <div className="min-w-0">
          <motion.p
            variants={fadeUpItem}
            className="text-[0.68rem] font-medium uppercase tracking-[0.3em] text-cream/70"
          >
            {greeting}, futurs mariés
          </motion.p>
          <motion.h1
            variants={fadeUpItem}
            className="mt-1.5 font-serif text-3xl font-medium italic sm:text-4xl"
          >
            {firstNames} <span className="not-italic">✨</span>
          </motion.h1>
          <motion.p variants={fadeUpItem} className="mt-2 text-sm font-light text-cream/80">
            Votre grand jour se prépare ici —{" "}
            <span className="capitalize">{formatDateFr(event.wedding_date)}</span>
            {!event.date_confirmed && <em className="font-serif italic"> (à confirmer)</em>}.
          </motion.p>

          <motion.div variants={fadeUpItem} className="mt-5 flex flex-wrap gap-2.5">
            {quickStats.map((stat) => (
              <button
                key={stat.key}
                type="button"
                onClick={() => onNavigate(stat.key)}
                className="flex cursor-pointer items-center gap-2 rounded-full bg-cream/12 px-4 py-2 text-xs font-light backdrop-blur transition-colors hover:bg-cream/25"
              >
                <Icon name={stat.icon} className="h-3.5 w-3.5 opacity-80" />
                <span className="font-medium tabular-nums">{stat.value ?? "…"}</span>
                {stat.label}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Compte à rebours dans une arche */}
        <motion.div
          variants={{
            hidden: { opacity: 0, scale: 0.8, y: 20 },
            visible: {
              opacity: 1,
              scale: 1,
              y: 0,
              transition: { type: "spring", stiffness: 180, damping: 16, delay: 0.3 },
            },
          }}
          className="flex h-32 w-27 shrink-0 flex-col items-center justify-center rounded-t-full border border-cream/30 bg-cream/10 backdrop-blur sm:h-36 sm:w-30"
        >
          <span className="font-serif text-3xl font-medium tabular-nums sm:text-4xl">
            {dayLabel}
          </span>
          <span className="mt-1 flex items-center gap-1 text-[0.6rem] font-medium uppercase tracking-[0.2em] text-cream/70">
            <Icon name="heart" className="h-3 w-3" />
            {daysLeft > 0 ? "avant le oui" : "félicitations"}
          </span>
        </motion.div>
      </div>
    </motion.section>
  );
}
