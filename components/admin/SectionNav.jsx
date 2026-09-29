"use client";

import { motion } from "framer-motion";
import Icon from "@/components/ui/Icons";
import { classNames } from "@/lib/utils";

/**
 * Navigation de l'espace client sur mobile et tablette : barre fixe en bas
 * de l'écran (la barre latérale prend le relais sur grand écran).
 * `sections` = [{ key, label, icon }], quatre au plus pour rester lisible.
 */
export function MobileSectionNav({ sections, active, onSelect, layoutId = "admin-section-pill-mobile" }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-cocoa/10 bg-cream/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(27,17,8,0.04)] backdrop-blur-md lg:hidden"
      aria-label="Sections"
    >
      <div className="mx-auto flex h-16 max-w-md items-stretch">
        {sections.map((item) => {
          const selected = active === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
              aria-current={selected ? "page" : undefined}
              className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-1"
            >
              <span className="relative flex h-7 w-14 items-center justify-center">
                {selected && (
                  <motion.span
                    layoutId={layoutId}
                    className="absolute inset-0 rounded-full bg-passora-gold"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <Icon
                  name={item.icon}
                  className={classNames("relative h-[1.15rem] w-[1.15rem]", selected ? "text-passora-ink" : "text-cocoa/50")}
                />
              </span>
              <span
                className={classNames(
                  "text-[0.68rem] leading-none tracking-wide",
                  selected ? "font-semibold text-passora-ink" : "text-cocoa/55",
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/** Bouton d'action de l'en-tête : icône seule sur mobile, libellé sur grand écran. */
export function HeaderAction({ href, onClick, icon, label }) {
  const className =
    "flex h-9 min-w-9 cursor-pointer items-center justify-center gap-2 rounded-full px-2 text-cocoa/60 transition-colors hover:bg-cocoa/5 hover:text-cocoa lg:px-3.5 lg:text-xs lg:font-medium lg:uppercase lg:tracking-[0.15em]";
  const content = (
    <>
      <Icon name={icon} className="h-[1.1rem] w-[1.1rem] lg:h-4 lg:w-4" />
      <span className="hidden lg:inline">{label}</span>
    </>
  );
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} title={label} aria-label={label}>
      {content}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={className} title={label} aria-label={label}>
      {content}
    </button>
  );
}
