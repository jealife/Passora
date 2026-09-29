"use client";

import Icon from "@/components/ui/Icons";
import { EVENT_TYPES, templatesFor } from "@/lib/event-types";
import { Button, Eyebrow, PageHeader } from "@/components/admin/agency/kit";

// Injectées au build par next.config.mjs (version de package.json, date du build).
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "";
const BUILD_DATE = process.env.NEXT_PUBLIC_BUILD_DATE || "";
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
 * L'application elle-même : types d'événements et leurs modèles de page,
 * outils d'hébergement, version en ligne.
 */
export default function PlatformPanel({ data }) {
  const real = data.events.filter((event) => !event.isDemo);
  const countOf = (typeId) => real.filter((event) => (event.event_type || "wedding") === typeId).length;

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Application"
        title="Plateforme"
        text={
          APP_VERSION
            ? `Passora ${APP_VERSION}${BUILD_DATE ? `, mise à jour le ${formatDay(BUILD_DATE)}` : ""}.`
            : "Les types d'événements, leurs modèles et les outils de l'application."
        }
      />

      <section>
        <Eyebrow>Types d&apos;événements</Eyebrow>
        <ul className="mt-4 divide-y divide-passora-ink/8 overflow-hidden rounded-lg border border-passora-ink/10 bg-white">
          {EVENT_TYPES.map((type) => {
            const templates = templatesFor(type.id);
            const count = countOf(type.id);
            return (
              <li key={type.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-5">
                <div className="flex min-w-0 flex-1 items-center gap-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-passora-gold text-passora-ink">
                    <Icon name={type.icon} className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium">{type.label}</p>
                    <p className="text-xs text-passora-ink/50">
                      {count} événement{count > 1 ? "s" : ""} ·{" "}
                      {templates.length > 0
                        ? `${templates.length} modèle${templates.length > 1 ? "s" : ""}`
                        : "aucun modèle de page pour l'instant"}
                    </p>
                  </div>
                </div>
                {templates.length > 0 && (
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    {templates.map((template) => (
                      <Button key={template.id} href={`/e/${template.demoSlug}`} external variant="outline" icon="external-link">
                        {template.name}
                      </Button>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section>
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
    </div>
  );
}

const formatDay = (iso) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
