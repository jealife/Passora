"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icons";
import { LAYOUT_TEMPLATES } from "@/lib/layouts";

// Variables exposées automatiquement par Vercel au moment du build.
const COMMIT_SHA = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || "";
const COMMIT_MESSAGE = (process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_MESSAGE || "").split("\n")[0];
const SUPABASE_REF = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];
  } catch {
    return "";
  }
})();

const LINKS = [
  { label: "Site vitrine", text: "La page d'accueil publique de Passora.", href: "/", icon: "home" },
  {
    label: "Supabase",
    text: "Base de données, fichiers, comptes et migrations SQL.",
    href: SUPABASE_REF ? `https://supabase.com/dashboard/project/${SUPABASE_REF}` : "https://supabase.com/dashboard",
    icon: "sliders",
  },
  { label: "Vercel", text: "Mises en ligne et journaux du site.", href: "https://vercel.com/jeaguy/passora", icon: "upload" },
  { label: "GitHub", text: "Le code source de l'application.", href: "https://github.com/jealife/Passora", icon: "pencil" },
];

/**
 * L'application elle-même : modèles de mise en page et leurs démos,
 * volumes de données, version en ligne et accès aux outils d'hébergement.
 */
export default function PlatformPanel({ data }) {
  const real = data.events.filter((event) => !event.isDemo);
  const totals = [
    { label: "Événements", value: data.events.length, hint: `dont ${data.events.length - real.length} démos` },
    { label: "Comptes", value: data.users.length },
    { label: "Invités", value: data.events.reduce((sum, event) => sum + event.guests, 0) },
    { label: "Photos de galerie", value: data.events.reduce((sum, event) => sum + event.photos, 0) },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-medium text-cocoa">Plateforme</h1>
        <p className="mt-1 text-sm font-light text-cocoa/55">Les modèles proposés, les données et les outils de l&apos;application.</p>
      </div>

      <section>
        <h2 className="mb-3 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-cocoa/50">Modèles de mise en page</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {LAYOUT_TEMPLATES.map((template) => {
            const count = real.filter((event) => event.layout_template === template.id).length;
            return (
              <article key={template.id} className="flex flex-col rounded-3xl border border-cocoa/8 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-serif text-2xl font-medium text-cocoa">{template.name}</h3>
                  <span className="shrink-0 rounded-full bg-passora-gold/20 px-2.5 py-1 text-xs font-medium text-passora-ink tabular-nums">
                    {count} événement{count > 1 ? "s" : ""}
                  </span>
                </div>
                <p className="mt-2 flex-1 text-sm leading-relaxed font-light text-cocoa/60">{template.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={`/e/${template.demoSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-passora-ink px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-cream transition-colors hover:bg-cocoa"
                  >
                    <Icon name="external-link" className="h-3.5 w-3.5" />
                    Voir la démo
                  </a>
                  <Link
                    href={`/admin/${template.demoSlug}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-cocoa/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-cocoa transition-colors hover:bg-cocoa/10"
                  >
                    <Icon name="pencil" className="h-3.5 w-3.5" />
                    Modifier la démo
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-cocoa/50">Données</h2>
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {totals.map((item) => (
            <div key={item.label} className="rounded-2xl border border-cocoa/8 bg-white p-4 shadow-sm">
              <dd className="font-serif text-3xl leading-none font-medium text-cocoa lining-nums">
                {item.value.toLocaleString("fr-FR")}
              </dd>
              <dt className="mt-1.5 text-xs font-light text-cocoa/55">
                {item.label}
                {item.hint && <span className="text-cocoa/40"> ({item.hint})</span>}
              </dt>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
        <section className="lg:col-span-2">
          <h2 className="mb-3 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-cocoa/50">Outils</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full items-start gap-3.5 rounded-2xl border border-cocoa/8 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-passora-gold/40 hover:shadow-md"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-passora-gold/15 text-passora-gold-deep transition-colors group-hover:bg-passora-gold group-hover:text-passora-ink">
                    <Icon name={link.icon} className="h-[1.1rem] w-[1.1rem]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-cocoa">{link.label}</span>
                    <span className="mt-0.5 block text-sm leading-snug font-light text-cocoa/60">{link.text}</span>
                  </span>
                  <Icon name="external-link" className="mt-1 h-3.5 w-3.5 shrink-0 text-cocoa/25 group-hover:text-cocoa/60" />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-cocoa/50">Version en ligne</h2>
          <div className="rounded-2xl bg-passora-ink p-5 text-cream">
            {COMMIT_SHA ? (
              <>
                <p className="font-mono text-sm text-passora-gold">{COMMIT_SHA.slice(0, 7)}</p>
                <p className="mt-2 text-sm leading-relaxed font-light text-cream/80">{COMMIT_MESSAGE}</p>
              </>
            ) : (
              <p className="text-sm font-light text-cream/75">Version de développement locale.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
