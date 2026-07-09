"use client";

import { motion, useReducedMotion } from "framer-motion";
import FadeIn from "@/components/ui/FadeIn";
import SectionHeading from "@/components/ui/SectionHeading";
import { DRESS_CODE_COLORS } from "@/lib/content";

/**
 * Dress code « Terracotta en couleurs » : moodboard officiel et nuancier
 * par palette (femmes / hommes) — les teintes surgissent en ressort.
 */
export default function DressCode({ event }) {
  const reduceMotion = useReducedMotion();
  const groups = ["Femmes", "Hommes"].map((audience) => ({
    audience,
    colors: DRESS_CODE_COLORS.filter((color) => color.for === audience),
  }));

  return (
    <section id="dresscode" className="bg-linen py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Pour être des nôtres"
          title={event.dress_code_title || "Terracotta en couleurs"}
          subtitle="Composez votre tenue dans ces teintes chaleureuses — laissez parler l'automne qui est en vous."
        />

        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {event.dress_code_image_url && (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, scale: 0.94, rotate: -1.5 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true, margin: "0px 0px -80px 0px" }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden rounded-[2rem] shadow-xl shadow-cocoa/10"
            >
              <motion.img
                src={event.dress_code_image_url}
                alt="Moodboard du dress code terracotta"
                loading="lazy"
                className="w-full"
                whileHover={reduceMotion ? undefined : { scale: 1.03 }}
                transition={{ duration: 0.7 }}
              />
            </motion.div>
          )}

          <div className="space-y-10">
            {groups.map((group, groupIndex) => (
              <div key={group.audience}>
                <FadeIn delay={groupIndex * 120}>
                  <h3 className="mb-5 font-serif text-2xl font-medium text-cocoa italic">
                    {group.audience}
                  </h3>
                </FadeIn>
                <motion.div
                  className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4"
                  initial={reduceMotion ? false : "hidden"}
                  whileInView="visible"
                  viewport={{ once: true, margin: "0px 0px -40px 0px" }}
                  variants={{
                    visible: {
                      transition: { staggerChildren: 0.08, delayChildren: groupIndex * 0.15 },
                    },
                  }}
                >
                  {group.colors.map((color) => (
                    <motion.div
                      key={color.name}
                      className="text-center"
                      variants={{
                        hidden: { opacity: 0, scale: 0.3 },
                        visible: {
                          opacity: 1,
                          scale: 1,
                          transition: { type: "spring", stiffness: 260, damping: 16 },
                        },
                      }}
                    >
                      <motion.span
                        whileHover={reduceMotion ? undefined : { scale: 1.18, rotate: 6 }}
                        transition={{ type: "spring", stiffness: 300, damping: 12 }}
                        className="mx-auto block h-16 w-16 rounded-full border-4 border-cream shadow-md sm:h-18 sm:w-18"
                        style={{ backgroundColor: color.hex }}
                      />
                      <p className="mt-3 text-[0.7rem] font-medium tracking-[0.14em] text-cocoa/75 uppercase">
                        {color.name}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
