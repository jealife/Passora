"use client";

import { motion, useReducedMotion } from "framer-motion";
import Icon from "@/components/ui/Icons";
import SectionHeading from "@/components/ui/SectionHeading";
import { EASE } from "@/components/motion/primitives";

/**
 * Programme de la journée : une carte par cérémonie ; la frise se dessine
 * à l'entrée dans l'écran et les moments apparaissent en cascade.
 */
export default function Program({ program = [] }) {
  const reduceMotion = useReducedMotion();

  return (
    <section id="programme" className="relative overflow-hidden bg-linen py-24 sm:py-32">
      <div
        aria-hidden="true"
        className="absolute top-24 -left-24 h-80 w-80 rounded-full bg-blush/15 blur-3xl"
      />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Mariage coutumier & mariage civil"
          title="Déroulement de la journée"
          subtitle="Trois temps forts pour une même promesse : la coutume, la mairie, puis la fête."
        />

        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          {program.map((block, blockIndex) => (
            <motion.article
              key={block.section}
              initial={reduceMotion ? false : { opacity: 0, y: 56 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -80px 0px" }}
              transition={{ duration: 0.9, ease: EASE, delay: blockIndex * 0.15 }}
              whileHover={reduceMotion ? undefined : { y: -8 }}
              className="flex flex-col rounded-[2rem] border border-terracotta/12 bg-cream p-8 shadow-lg shadow-cocoa/5 sm:p-9"
            >
              <div className="mb-7 flex items-center gap-4">
                <motion.span
                  initial={reduceMotion ? false : { scale: 0, rotate: -30 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    type: "spring",
                    stiffness: 220,
                    damping: 15,
                    delay: blockIndex * 0.15 + 0.25,
                  }}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta/10 text-terracotta"
                >
                  <Icon name={block.icon || "rings"} className="h-5.5 w-5.5" />
                </motion.span>
                <h3 className="font-serif text-2xl font-medium text-cocoa">{block.section}</h3>
              </div>

              <div className="relative flex-1 pl-6">
                {/* La frise se dessine du haut vers le bas */}
                <motion.span
                  aria-hidden="true"
                  className="absolute top-1 bottom-1 left-0 w-px origin-top bg-terracotta/30"
                  initial={reduceMotion ? false : { scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true, margin: "0px 0px -80px 0px" }}
                  transition={{ duration: 1.1, ease: EASE, delay: blockIndex * 0.15 + 0.3 }}
                />
                <motion.ol
                  className="space-y-6"
                  initial={reduceMotion ? false : "hidden"}
                  whileInView="visible"
                  viewport={{ once: true, margin: "0px 0px -60px 0px" }}
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.12,
                        delayChildren: blockIndex * 0.15 + 0.4,
                      },
                    },
                  }}
                >
                  {block.items.map((item) => (
                    <motion.li
                      key={`${item.time}-${item.label}`}
                      className="relative"
                      variants={{
                        hidden: { opacity: 0, x: -22 },
                        visible: {
                          opacity: 1,
                          x: 0,
                          transition: { duration: 0.6, ease: EASE },
                        },
                      }}
                    >
                      <span
                        aria-hidden="true"
                        className="absolute top-1.5 -left-[1.845rem] h-2.5 w-2.5 rounded-full border-2 border-cream bg-terracotta"
                      />
                      <p className="font-serif text-lg font-semibold text-rust tabular-nums">
                        {item.time}
                      </p>
                      <p className="mt-0.5 text-sm leading-relaxed font-light text-cocoa/75">
                        {item.label}
                      </p>
                    </motion.li>
                  ))}
                </motion.ol>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
