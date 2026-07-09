"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icons";
import { classNames } from "@/lib/utils";

const LINKS = [
  { href: "#histoire", label: "Notre histoire" },
  { href: "#galerie", label: "Galerie" },
  { href: "#programme", label: "Programme" },
  { href: "#lieux", label: "Lieux" },
  { href: "#dresscode", label: "Dress code" },
];

/**
 * Barre de navigation fixe : transparente sur le hero,
 * fond crème translucide dès que l'on défile.
 */
export default function Navbar({ initials = "M & J" }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={classNames(
        "fixed inset-x-0 top-0 z-40 transition-all duration-500",
        scrolled
          ? "border-b border-cocoa/10 bg-cream/90 shadow-sm shadow-cocoa/5 backdrop-blur-md"
          : "bg-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <a
          href="#accueil"
          className="font-serif text-xl italic tracking-wide text-cocoa transition-colors hover:text-rust"
          onClick={() => setOpen(false)}
        >
          {initials}
        </a>

        <div className="hidden items-center gap-8 lg:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[0.72rem] font-medium uppercase tracking-[0.22em] text-cocoa/70 transition-colors hover:text-rust"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#rsvp"
            className="rounded-full bg-rust px-5 py-2 text-[0.72rem] font-medium uppercase tracking-[0.22em] text-cream transition-all hover:bg-rust-deep"
          >
            Confirmer
          </a>
        </div>

        <button
          type="button"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-cocoa transition-colors hover:bg-cocoa/5 lg:hidden"
        >
          <Icon name={open ? "x" : "chevron-down"} className="h-5 w-5" />
        </button>
      </nav>

      {/* Menu mobile */}
      <div
        className={classNames(
          "overflow-hidden border-b border-cocoa/10 bg-cream/95 backdrop-blur-md transition-all duration-400 lg:hidden",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="flex flex-col gap-1 px-6 py-4">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-[0.78rem] font-medium uppercase tracking-[0.22em] text-cocoa/75 transition-colors hover:bg-rust/5 hover:text-rust"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#rsvp"
            onClick={() => setOpen(false)}
            className="mt-2 rounded-full bg-rust px-5 py-3 text-center text-[0.78rem] font-medium uppercase tracking-[0.22em] text-cream"
          >
            Confirmer ma présence
          </a>
        </div>
      </div>
    </header>
  );
}
