"use client";

import Icon from "@/components/ui/Icons";
import { classNames } from "@/lib/utils";

/* Primitives d'interface partagées par tous les écrans d'administration. */

export function Card({ title, description, actions, children, className = "" }) {
  return (
    <section className={classNames("rounded-3xl border border-cocoa/10 bg-white p-6 shadow-sm sm:p-8", className)}>
      {(title || actions) && (
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="font-serif text-2xl font-medium text-cocoa">{title}</h2>}
            {description && (
              <p className="mt-1 text-sm font-light text-cocoa/60">{description}</p>
            )}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-[0.18em] text-cocoa/65">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1.5 block text-xs font-light text-cocoa/45">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-cocoa/15 bg-cream/50 px-4 py-2.5 text-sm text-cocoa placeholder:text-cocoa/30 focus:border-terracotta focus:outline-2 focus:outline-terracotta/25 transition-colors";

export function Input(props) {
  return <input {...props} className={classNames(inputClass, props.className)} />;
}

export function TextArea(props) {
  return <textarea {...props} className={classNames(inputClass, "resize-y", props.className)} />;
}

export function AdminButton({ icon, variant = "primary", busy = false, className = "", children, ...props }) {
  const styles = {
    primary: "bg-rust text-cream hover:bg-rust-deep",
    subtle: "bg-cocoa/5 text-cocoa hover:bg-cocoa/10",
    danger: "bg-transparent text-rust hover:bg-rust/10",
  };
  return (
    <button
      type="button"
      {...props}
      disabled={busy || props.disabled}
      className={classNames(
        "inline-flex cursor-pointer items-center gap-2 rounded-full px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] transition-colors disabled:pointer-events-none disabled:opacity-50",
        styles[variant],
        className,
      )}
    >
      {(busy || icon) && (
        <Icon name={busy ? "loader" : icon} className={classNames("h-4 w-4", busy && "animate-spin-slow")} />
      )}
      {children}
    </button>
  );
}

export function IconButton({ icon, label, variant = "subtle", className = "", ...props }) {
  const styles = {
    subtle: "text-cocoa/50 hover:bg-cocoa/8 hover:text-cocoa",
    danger: "text-cocoa/40 hover:bg-rust/10 hover:text-rust",
  };
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...props}
      className={classNames(
        "flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors disabled:pointer-events-none disabled:opacity-40",
        styles[variant],
        className,
      )}
    >
      <Icon name={icon} className="h-4 w-4" />
    </button>
  );
}

export function Notice({ tone = "success", children }) {
  const styles = {
    success: "bg-olive/10 text-olive-deep",
    error: "bg-rust/10 text-rust",
  };
  return (
    <p className={classNames("animate-fade-in rounded-xl px-4 py-2.5 text-sm", styles[tone])} role="status">
      {children}
    </p>
  );
}
