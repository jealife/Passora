import Image from "next/image";
import Link from "next/link";
import { PassoraLogo } from "@/components/admin/AuthGate";
import EventTypesSlider from "@/components/EventTypesSlider";
import FadeIn from "@/components/ui/FadeIn";
import Icon from "@/components/ui/Icons";
import FloralAccent from "@/components/ui/FloralAccent";

const NAV_LINKS = [
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#mises-en-page", label: "Mises en page" },
  { href: "#comment-ca-marche", label: "Comment ça marche" },
];

const FEATURES = [
  {
    icon: "refresh",
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

// Numéro WhatsApp de l'agence (+241 02 32 03 95, au format international
// sans le 0 de tronc initial).
const CONTACT_HREF = `https://wa.me/2412320395?text=${encodeURIComponent(
  "Bonjour, je souhaite en savoir plus sur Passora.",
)}`;

/**
 * Vitrine publique de Passora (route racine du site). Générique — ne
 * représente aucun événement en particulier : les pages de mariage
 * vivent chacune sur leur propre lien (/e/[slug]).
 */
export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col overflow-x-hidden bg-cream text-passora-ink">
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

      <main className="flex-1 overflow-x-hidden">
        <section className="relative overflow-hidden border-b border-passora-ink/10 px-5 py-20 sm:px-8 sm:py-28">
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
                  href={CONTACT_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 rounded-md bg-passora-gold px-7 py-3.5 text-sm font-medium tracking-[0.06em] text-passora-ink uppercase transition-colors hover:bg-passora-gold-deep"
                >
                  <Icon name="send" className="h-4 w-4" />
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

            <FadeIn delay={150} className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-6 -z-10 rounded-full bg-passora-gold/20 blur-3xl animate-pulse-soft"
              />
              <div className="overflow-hidden rounded-lg border border-passora-ink/15 bg-white shadow-[0_1px_0_rgba(27,17,8,0.04)]">
                <div className="flex items-center gap-1.5 border-b border-passora-ink/10 bg-linen/60 px-4 py-3">
                  <span className="h-2 w-2 rounded-full bg-passora-ink/15" />
                  <span className="h-2 w-2 rounded-full bg-passora-ink/15" />
                  <span className="h-2 w-2 rounded-full bg-passora-ink/15" />
                  <span className="ml-3 truncate text-[0.65rem] text-passora-ink/40">
                    passora.jealife.com/e/awa-ibrahima
                  </span>
                </div>
                <div className="relative h-80 overflow-hidden sm:h-96">
                  <Image
                    src="/images/showcase/rings.jpg"
                    alt=""
                    fill
                    priority
                    sizes="(min-width: 1024px) 40vw, 90vw"
                    className="object-cover animate-ken-burns"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-cocoa/50 via-cocoa/35 to-cocoa/85" />
                  <div className="absolute inset-0 flex flex-col items-center justify-end px-8 pb-9 text-center">
                    <p className="text-[0.6rem] font-medium tracking-[0.35em] text-blush-soft uppercase">
                      Nous nous disons oui
                    </p>
                    <p className="mt-3 font-serif text-3xl font-medium text-cream italic">
                      Awa &amp; Ibrahima
                    </p>
                    <p className="mt-3 text-xs text-cream/70">Samedi 12 septembre 2026 · Yaoundé</p>
                    <span className="mt-6 inline-block rounded-md bg-rust px-5 py-2.5 text-[0.65rem] font-medium tracking-[0.15em] text-cream uppercase">
                      Confirmer ma présence
                    </span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        <EventTypesSlider />

        <section id="fonctionnalites" className="border-b border-passora-ink/10 px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <FadeIn className="max-w-xl">
              <p className="text-[0.7rem] font-medium tracking-[0.3em] text-passora-gold-deep uppercase">
                Fonctionnalités
              </p>
              <h2 className="mt-3 font-serif text-3xl font-medium">Ce que fait Passora</h2>
            </FadeIn>
            <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-passora-ink/10 bg-passora-ink/10 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature, index) => (
                <FadeIn
                  key={feature.title}
                  delay={index * 60}
                  className="bg-cream p-7 transition-colors hover:bg-white"
                >
                  <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-md bg-passora-gold text-passora-ink">
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
                Les modèles disponibles
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-passora-ink/60">
                Dites-nous simplement lequel vous parle en nous contactant, ou demandez un modèle
                conçu spécialement pour votre événement.
              </p>
            </FadeIn>

            <div className="mt-10 grid gap-5 sm:grid-cols-3">
              <FadeIn className="overflow-hidden rounded-lg border border-passora-ink/12 bg-white transition-all hover:-translate-y-1 hover:shadow-md hover:shadow-passora-ink/5">
                <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-b from-champagne via-cream to-linen">
                  <span
                    aria-hidden="true"
                    className="absolute h-28 w-28 rounded-t-full border border-terracotta/30"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute h-24 w-24 rounded-t-full border border-terracotta/20"
                  />
                  <div className="relative text-center">
                    <p className="text-[0.55rem] font-medium tracking-[0.3em] text-terracotta uppercase">
                      Nous nous disons oui
                    </p>
                    <p className="mt-1 font-serif text-lg text-cocoa italic">A &amp; R</p>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-lg font-medium">Classique</h3>
                  <p className="mt-2 text-sm leading-relaxed text-passora-ink/60">
                    Arches et compositions terracotta : le modèle historique de Passora.
                  </p>
                  <a
                    href="/e/exemple-classique"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-passora-gold-deep hover:text-passora-ink"
                  >
                    Voir la page complète
                    <Icon name="external-link" className="h-3.5 w-3.5" />
                  </a>
                </div>
              </FadeIn>

              <FadeIn
                delay={80}
                className="overflow-hidden rounded-lg border border-passora-ink/12 bg-white transition-all hover:-translate-y-1 hover:shadow-md hover:shadow-passora-ink/5"
              >
                <div className="relative flex h-40 items-center justify-center overflow-hidden bg-cream px-6">
                  <FloralAccent className="absolute -top-3 -left-4 h-16 w-16 -scale-x-100 text-terracotta/60" />
                  <FloralAccent className="absolute -top-3 -right-4 h-16 w-16 rotate-90 text-terracotta/60" />
                  <p className="relative text-center font-serif text-sm text-cocoa/80 italic">
                    « L&apos;amour est patient, l&apos;amour est bon »
                  </p>
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-lg font-medium">Terracotta floral</h3>
                  <p className="mt-2 text-sm leading-relaxed text-passora-ink/60">
                    Citation d&apos;ouverture, parents des mariés, code vestimentaire, cadeaux et
                    motifs botaniques.
                  </p>
                  <a
                    href="/e/exemple-terracotta-floral"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-passora-gold-deep hover:text-passora-ink"
                  >
                    Voir la page complète
                    <Icon name="external-link" className="h-3.5 w-3.5" />
                  </a>
                </div>
              </FadeIn>

              <FadeIn
                delay={160}
                className="overflow-hidden rounded-lg border border-dashed border-passora-ink/25 bg-linen/40 transition-all hover:-translate-y-1 hover:shadow-md hover:shadow-passora-ink/5"
              >
                <div className="flex h-40 flex-col items-center justify-center gap-3 px-6 text-center">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-passora-gold text-passora-ink">
                    <Icon name="pencil" className="h-4.5 w-4.5" />
                  </span>
                  <p className="text-xs text-passora-ink/60">
                    Un modèle conçu spécialement pour votre événement
                  </p>
                </div>
                <div className="p-6 pt-0">
                  <h3 className="font-serif text-lg font-medium">Sur mesure</h3>
                  <p className="mt-2 text-sm leading-relaxed text-passora-ink/60">
                    Décrivez-nous votre vision : nous le concevons et vous donnons vos accès.
                  </p>
                </div>
              </FadeIn>
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
                <FadeIn
                  key={step.number}
                  delay={index * 100}
                  className="border-t-2 border-passora-gold pt-5"
                >
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
              href={CONTACT_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center justify-center gap-2.5 rounded-md bg-passora-gold px-7 py-3.5 text-sm font-medium tracking-[0.06em] text-passora-ink uppercase transition-colors hover:bg-passora-gold-deep"
            >
              <Icon name="send" className="h-4 w-4" />
              Nous contacter
            </a>
            <a
              href="mailto:agency@jealife.com"
              className="mt-4 block text-xs text-cream/50 transition-colors hover:text-passora-gold"
            >
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
