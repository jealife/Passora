import Link from "next/link";
import { PassoraLogo } from "@/components/admin/AuthGate";
import FadeIn from "@/components/ui/FadeIn";
import Icon from "@/components/ui/Icons";

const NAV_LINKS = [
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#mises-en-page", label: "Mises en page" },
  { href: "#comment-ca-marche", label: "Comment ça marche" },
];

const FEATURES = [
  {
    icon: "sparkles",
    title: "Mise en page & thème",
    text: "Plusieurs modèles disponibles, chacun personnalisable dans les couleurs de l'événement.",
  },
  {
    icon: "calendar",
    title: "Plusieurs cérémonies",
    text: "Coutumier, civil, réception : un programme complet, même sur plusieurs jours et plusieurs lieux.",
  },
  {
    icon: "send",
    title: "RSVP en ligne",
    text: "Les invités confirment leur présence en un lien ; le suivi se fait en temps réel dans l'espace client.",
  },
  {
    icon: "image",
    title: "Galerie & musique",
    text: "Photos et ambiance sonore intégrées directement à la page, sans réglage technique.",
  },
  {
    icon: "gift",
    title: "Contenu modulable",
    text: "Histoire, cadeaux, code vestimentaire, recommandations : chaque section ne s'affiche que si elle est renseignée.",
  },
  {
    icon: "users",
    title: "Espace client indépendant",
    text: "Chaque client gère sa page depuis son propre accès, sans jamais voir celui des autres.",
  },
];

const LAYOUTS = [
  {
    name: "Classique",
    swatches: ["#b76950", "#a63d32", "#3e2a21"],
    text: "Arches et compositions terracotta : le modèle historique de Passora.",
  },
  {
    name: "Terracotta floral",
    swatches: ["#b76950", "#8a8b62", "#faf6ef"],
    text: "Citation d'ouverture, parents des mariés, code vestimentaire, cadeaux et motifs botaniques.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Contact",
    text: "Vous nous présentez votre événement, nous configurons votre espace.",
  },
  {
    number: "02",
    title: "Personnalisation",
    text: "Vous complétez votre page depuis votre propre accès : contenu, couleurs, photos.",
  },
  {
    number: "03",
    title: "Partage",
    text: "Un lien unique à envoyer à vos invités, confirmations de présence incluses.",
  },
];

/**
 * Vitrine publique de Passora (route racine du site). Générique — ne
 * représente aucun événement en particulier : les pages de mariage
 * vivent chacune sur leur propre lien (/e/[slug]).
 */
export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col bg-cream text-passora-ink">
      <header className="sticky top-0 z-20 border-b border-passora-ink/10 bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-2.5">
            <PassoraLogo className="h-8 w-8 rounded-lg" />
            <span className="font-serif text-lg font-medium italic">Passora</span>
          </div>
          <nav className="hidden items-center gap-8 text-xs font-medium tracking-wide text-passora-ink/65 sm:flex">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="transition-colors hover:text-passora-ink">
                {link.label}
              </a>
            ))}
          </nav>
          <Link
            href="/admin"
            className="rounded-md border border-passora-ink/20 px-4 py-2 text-xs font-medium tracking-wide transition-colors hover:border-passora-ink hover:bg-passora-ink hover:text-cream"
          >
            Espace client
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="border-b border-passora-ink/10 px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
            <FadeIn>
              <p className="mb-5 text-[0.7rem] font-medium tracking-[0.35em] text-passora-gold-deep uppercase">
                Un produit JEaLiFe Agency
              </p>
              <h1 className="font-serif text-4xl leading-[1.12] font-medium sm:text-5xl lg:text-[3.4rem]">
                La page en ligne de votre événement, entièrement entre vos mains.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-passora-ink/65">
                Programme, lieux, thème, galerie, confirmations de présence : Passora réunit tout
                ce dont votre événement a besoin sur un seul lien, que vous personnalisez vous-même
                depuis votre propre espace.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href="mailto:agency@jealife.com"
                  className="inline-flex items-center justify-center gap-2.5 rounded-md bg-passora-ink px-7 py-3.5 text-sm font-medium tracking-[0.06em] text-cream transition-colors hover:bg-passora-ink/85"
                >
                  <Icon name="mail" className="h-4 w-4" />
                  Nous contacter
                </a>
                <Link
                  href="/admin"
                  className="inline-flex items-center justify-center gap-2.5 rounded-md border border-passora-ink/20 px-7 py-3.5 text-sm font-medium tracking-[0.06em] transition-colors hover:border-passora-ink"
                >
                  Espace client
                </Link>
              </div>
            </FadeIn>

            <FadeIn delay={150}>
              <div className="overflow-hidden rounded-lg border border-passora-ink/15 bg-white shadow-[0_1px_0_rgba(27,17,8,0.04)]">
                <div className="flex items-center gap-1.5 border-b border-passora-ink/10 bg-linen/60 px-4 py-3">
                  <span className="h-2 w-2 rounded-full bg-passora-ink/15" />
                  <span className="h-2 w-2 rounded-full bg-passora-ink/15" />
                  <span className="h-2 w-2 rounded-full bg-passora-ink/15" />
                  <span className="ml-3 truncate text-[0.65rem] text-passora-ink/40">
                    passora.jealife.com/e/awa-ibrahima
                  </span>
                </div>
                <div className="bg-gradient-to-b from-champagne via-cream to-linen px-8 py-16 text-center">
                  <p className="text-[0.6rem] font-medium tracking-[0.35em] text-terracotta uppercase">
                    Nous nous disons oui
                  </p>
                  <p className="mt-4 font-serif text-3xl font-medium text-cocoa italic">
                    Awa &amp; Ibrahima
                  </p>
                  <p className="mt-3 text-xs text-cocoa/55">Samedi 12 septembre 2026 · Yaoundé</p>
                  <span className="mt-7 inline-block rounded-md bg-rust px-5 py-2.5 text-[0.65rem] font-medium tracking-[0.15em] text-cream uppercase">
                    Confirmer ma présence
                  </span>
                </div>
              </div>
              <p className="mt-3 text-center text-[0.7rem] text-passora-ink/40">
                Aperçu illustratif, chaque événement a sa propre page.
              </p>
            </FadeIn>
          </div>
        </section>

        <section id="fonctionnalites" className="border-b border-passora-ink/10 px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <FadeIn className="max-w-xl">
              <p className="text-[0.7rem] font-medium tracking-[0.3em] text-passora-gold-deep uppercase">
                Fonctionnalités
              </p>
              <h2 className="mt-3 font-serif text-3xl font-medium">Ce que fait déjà Passora</h2>
            </FadeIn>
            <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-passora-ink/10 bg-passora-ink/10 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature, index) => (
                <FadeIn key={feature.title} delay={index * 60} className="bg-cream p-7">
                  <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-md border border-passora-ink/15 text-passora-gold-deep">
                    <Icon name={feature.icon} className="h-4.5 w-4.5" />
                  </span>
                  <h3 className="font-serif text-lg font-medium">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-passora-ink/60">{feature.text}</p>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        <section id="mises-en-page" className="border-b border-passora-ink/10 px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <FadeIn className="max-w-xl">
              <p className="text-[0.7rem] font-medium tracking-[0.3em] text-passora-gold-deep uppercase">
                Mises en page
              </p>
              <h2 className="mt-3 font-serif text-3xl font-medium">
                Deux modèles, un même souci du détail
              </h2>
            </FadeIn>
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {LAYOUTS.map((layout, index) => (
                <FadeIn
                  key={layout.name}
                  delay={index * 100}
                  className="rounded-lg border border-passora-ink/12 bg-white p-7"
                >
                  <div className="flex gap-1.5">
                    {layout.swatches.map((color) => (
                      <span
                        key={color}
                        className="h-5 w-5 rounded-sm border border-passora-ink/10"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <h3 className="mt-5 font-serif text-xl font-medium">{layout.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-passora-ink/60">{layout.text}</p>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        <section id="comment-ca-marche" className="px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <FadeIn className="max-w-xl">
              <p className="text-[0.7rem] font-medium tracking-[0.3em] text-passora-gold-deep uppercase">
                Comment ça marche
              </p>
              <h2 className="mt-3 font-serif text-3xl font-medium">De la demande au partage</h2>
            </FadeIn>
            <div className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
              {STEPS.map((step, index) => (
                <FadeIn key={step.number} delay={index * 100} className="border-t border-passora-ink/15 pt-5">
                  <span className="font-serif text-2xl text-passora-ink/25">{step.number}</span>
                  <h3 className="mt-3 font-medium">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-passora-ink/60">{step.text}</p>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-passora-ink px-5 py-16 text-center sm:px-8">
          <FadeIn className="mx-auto max-w-xl">
            <h2 className="font-serif text-2xl font-medium text-cream sm:text-3xl">
              Discutons de votre événement
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-cream/60">
              Décrivez-nous votre projet ; nous configurons votre espace et vous prenez le relais.
            </p>
            <a
              href="mailto:agency@jealife.com"
              className="mt-7 inline-flex items-center justify-center gap-2.5 rounded-md bg-passora-gold px-7 py-3.5 text-sm font-medium tracking-[0.06em] text-passora-ink uppercase transition-colors hover:bg-passora-gold-deep"
            >
              <Icon name="mail" className="h-4 w-4" />
              agency@jealife.com
            </a>
          </FadeIn>
        </section>
      </main>

      <footer className="border-t border-passora-ink/10 px-5 py-6 text-center text-xs text-passora-ink/45 sm:px-8">
        Passora, un produit JEaLiFe Agency
      </footer>
    </div>
  );
}
