"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icons";
import { EASE } from "@/components/motion/primitives";
import { classNames } from "@/lib/utils";

/*
 * Primitives du tableau de bord agence, dans le style de la vitrine
 * (app/page.jsx) : angles francs, filets fins, pas d'ombre portée, petits
 * titres dorés espacés au-dessus de titres serif.
 */

export function Eyebrow({ children, className }) {
  return (
    <p className={classNames("text-[0.68rem] font-medium tracking-[0.3em] text-passora-gold-deep uppercase", className)}>
      {children}
    </p>
  );
}

export function PageHeader({ eyebrow, title, text, actions }) {
  return (
    <div className="flex flex-col gap-5 border-b border-passora-ink/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="mt-2 font-serif text-3xl leading-tight font-medium text-passora-ink sm:text-4xl">{title}</h1>
        {text && <p className="mt-2 max-w-xl text-sm leading-relaxed text-passora-ink/60">{text}</p>}
      </div>
      {actions && <div className="grid gap-2 sm:flex sm:flex-wrap">{actions}</div>}
    </div>
  );
}

const BUTTON_STYLES = {
  primary: "bg-passora-gold text-passora-ink hover:bg-passora-gold-deep",
  outline: "border border-passora-ink/20 text-passora-ink hover:border-passora-ink",
  dark: "bg-passora-ink text-cream hover:bg-cocoa",
  ghost: "text-passora-ink/65 hover:bg-passora-ink/5 hover:text-passora-ink",
  destructive: "bg-rust text-cream hover:bg-rust-deep",
  "danger-outline": "border border-rust/30 text-rust hover:border-rust hover:bg-rust/5",
};

export function Button({ variant = "primary", icon, busy = false, href, external, className, children, ...props }) {
  const classes = classNames(
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md px-4 py-2.5 text-xs font-medium tracking-[0.08em] uppercase transition-colors disabled:pointer-events-none disabled:opacity-40",
    BUTTON_STYLES[variant],
    className,
  );
  const content = (
    <>
      {(busy || icon) && <Icon name={busy ? "loader" : icon} className={classNames("h-4 w-4", busy && "animate-spin-slow")} />}
      {children}
    </>
  );
  if (href && external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {content}
      </a>
    );
  }
  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" {...props} disabled={busy || props.disabled} className={classes}>
      {content}
    </button>
  );
}

/** Bouton icône carré (libellé en info-bulle et pour les lecteurs d'écran). */
export function IconAction({ icon, label, danger = false, href, external, className, ...props }) {
  const classes = classNames(
    "flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors disabled:pointer-events-none disabled:opacity-30",
    danger ? "text-passora-ink/40 hover:bg-rust/8 hover:text-rust" : "text-passora-ink/50 hover:bg-passora-ink/5 hover:text-passora-ink",
    className,
  );
  if (href) {
    return (
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        title={label}
        aria-label={label}
        className={classes}
      >
        <Icon name={icon} className="h-4 w-4" />
      </a>
    );
  }
  return (
    <button type="button" title={label} aria-label={label} {...props} className={classes}>
      <Icon name={icon} className="h-4 w-4" />
    </button>
  );
}

export const fieldClass =
  "w-full rounded-md border border-passora-ink/15 bg-white px-3.5 py-2.5 text-sm text-passora-ink placeholder:text-passora-ink/35 transition-colors focus:border-passora-ink focus:outline-none";

export function TextInput({ className, ...props }) {
  return <input {...props} className={classNames(fieldClass, className)} />;
}

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.66rem] font-medium tracking-[0.16em] text-passora-ink/60 uppercase">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-passora-ink/45">{hint}</span>}
    </label>
  );
}

export function SearchField({ value, onChange, placeholder, className }) {
  return (
    <div className={classNames("relative", className)}>
      <Icon
        name="search"
        className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-passora-ink/35"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={classNames(fieldClass, "pl-10")}
      />
    </div>
  );
}

/** Choix exclusif, ex. filtres : [{ key, label, count? }]. */
export function Segmented({ options, value, onChange, className }) {
  return (
    <div
      className={classNames(
        "flex gap-0.5 overflow-x-auto rounded-md border border-passora-ink/15 bg-white p-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onChange(option.key)}
          aria-pressed={value === option.key}
          className={classNames(
            "flex flex-1 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-[5px] px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
            value === option.key ? "bg-passora-ink text-cream" : "text-passora-ink/60 hover:text-passora-ink",
          )}
        >
          {option.label}
          {option.count !== undefined && (
            <span className={classNames("lining-nums", value === option.key ? "text-passora-gold" : "text-passora-ink/35")}>
              {option.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

const TAG_STYLES = {
  neutral: "border border-passora-ink/15 text-passora-ink/60",
  gold: "bg-passora-gold text-passora-ink",
  dark: "bg-passora-ink text-cream",
  success: "bg-olive/15 text-olive-deep",
  warning: "bg-rust/10 text-rust",
};

export function Tag({ tone = "neutral", children }) {
  return (
    <span
      className={classNames(
        "inline-flex shrink-0 items-center rounded-sm px-2 py-0.5 text-[0.6rem] font-medium tracking-[0.12em] uppercase",
        TAG_STYLES[tone],
      )}
    >
      {children}
    </span>
  );
}

/** Bloc à filet fin, avec un titre et une action facultatifs. */
export function Panel({ title, action, className, bodyClassName = "p-5", children }) {
  return (
    <section className={classNames("overflow-hidden rounded-lg border border-passora-ink/10 bg-white", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-passora-ink/10 px-5 py-3.5">
          <h2 className="font-serif text-lg font-medium text-passora-ink">{title}</h2>
          {action}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function Message({ tone = "success", children }) {
  return (
    <p
      role="status"
      className={classNames(
        "animate-fade-in rounded-md border-l-2 px-4 py-2.5 text-sm",
        tone === "error" ? "border-rust bg-rust/8 text-rust" : "border-olive bg-olive/10 text-olive-deep",
      )}
    >
      {children}
    </p>
  );
}

/**
 * Fenêtre modale : panneau en bas d'écran sur mobile, boîte centrée sur
 * grand écran. Échap ou un clic à côté la ferment.
 */
export function Sheet({ open, title, description, onClose, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    const previousOverflow = document.body.style.overflow;
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-passora-ink/45 sm:items-center sm:p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="max-h-[92svh] w-full overflow-y-auto rounded-t-lg border-t-2 border-passora-gold bg-cream sm:max-w-md sm:rounded-lg"
          >
            <div className="flex items-start justify-between gap-4 border-b border-passora-ink/10 px-6 py-5">
              <div className="min-w-0">
                <h2 className="font-serif text-2xl font-medium text-passora-ink">{title}</h2>
                {description && <p className="mt-1 truncate text-sm text-passora-ink/55">{description}</p>}
              </div>
              <IconAction icon="x" label="Fermer" onClick={onClose} className="-mt-1 -mr-2" />
            </div>
            <div className="px-6 py-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
