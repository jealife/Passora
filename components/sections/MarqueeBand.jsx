"use client";

import Icon from "@/components/ui/Icons";
import { Marquee } from "@/components/motion/primitives";
import { formatDateFr } from "@/lib/utils";

/**
 * Bandeau défilant entre deux sections : les noms des mariés et la date
 * glissent en continu — une respiration immersive dans la page.
 */
export default function MarqueeBand({ event }) {
  const pieces = [
    `${event.bride_name} & ${event.groom_name}`,
    formatDateFr(event.wedding_date),
    event.tagline || "Nous nous disons oui",
  ];

  return (
    <div className="relative -rotate-1 bg-champagne py-5 shadow-inner sm:py-6" aria-hidden="true">
      <Marquee duration={30}>
        {pieces.map((piece) => (
          <span key={piece} className="flex items-center">
            <span className="mx-6 font-serif text-2xl font-medium text-terracotta italic capitalize sm:mx-10 sm:text-3xl">
              {piece}
            </span>
            <Icon name="heart" className="h-4 w-4 text-rust/50" />
          </span>
        ))}
      </Marquee>
    </div>
  );
}
