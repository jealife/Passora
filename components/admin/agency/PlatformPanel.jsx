"use client";

import Icon from "@/components/ui/Icons";
import { LAYOUT_TEMPLATES } from "@/lib/layouts";
import { Button, Eyebrow, PageHeader } from "@/components/admin/agency/kit";

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
    <div className="space-y-10">
      <PageHeader
        eyebrow="Application"
        title="Plateforme"
        text="Les modèles proposés, les données et les outils de l'application."
      />

      <section>
        <Eyebrow>Modèles de mise en page</Eyebrow>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          {LAYOUT_TEMPLATES.map((template) => {
            const count = real.filter((event) => event.layout_template === template.id).length;
            return (
              <article key={template.id} className="flex flex-col rounded-lg border border-passora-ink/10 bg-white p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-serif text-xl font-medium">{template.name}</h3>
                  <span className="shrink-0 text-xs text-passora-ink/50 lining-nums">
                    {count} événement{count > 1 ? "s" : ""}
                  </span>
                </div>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-passora-ink/60">{template.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button href={`/e/${template.demoSlug}`} external variant="dark" icon="external-link">
                    Voir la démo
                  </Button>
                  <Button href={`/admin/${template.demoSlug}`} variant="outline" icon="pencil">
                    Modifier la démo
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section>
        <Eyebrow>Données</Eyebrow>
        <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-passora-ink/10 bg-passora-ink/10 lg:grid-cols-4">
          {totals.map((item) => (
            <div key={item.label} className="bg-white p-5">
              <dd className="font-serif text-3xl leading-none font-medium lining-nums">{item.value.toLocaleString("fr-FR")}</dd>
              <dt className="mt-2 text-xs text-passora-ink/55">
                {item.label}
                {item.hint && <span className="text-passora-ink/40"> ({item.hint})</span>}
              </dt>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <Eyebrow>Outils</Eyebrow>
          <ul className="mt-4 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-passora-ink/10 bg-passora-ink/10 sm:grid-cols-2">
            {LINKS.map((link) => (
              <li key={link.label} className="bg-white">
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full items-start gap-3.5 p-5 transition-colors hover:bg-cream"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-passora-gold text-passora-ink">
                    <Icon name={link.icon} className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{link.label}</span>
                    <span className="mt-0.5 block text-sm leading-snug text-passora-ink/60">{link.text}</span>
                  </span>
                  <Icon name="external-link" className="mt-1 h-3.5 w-3.5 shrink-0 text-passora-ink/25 group-hover:text-passora-ink/60" />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <Eyebrow>Version en ligne</Eyebrow>
          <div className="mt-4 rounded-lg bg-passora-ink p-5 text-cream">
            {COMMIT_SHA ? (
              <>
                <p className="font-mono text-sm text-passora-gold">{COMMIT_SHA.slice(0, 7)}</p>
                <p className="mt-2 text-sm leading-relaxed text-cream/75">{COMMIT_MESSAGE}</p>
              </>
            ) : (
              <p className="text-sm text-cream/70">Version de développement locale.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
