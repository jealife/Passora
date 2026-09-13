import Link from "next/link";
import { PassoraLogo } from "@/components/admin/AuthGate";
import FadeIn from "@/components/ui/FadeIn";
import Icon from "@/components/ui/Icons";

const FEATURES = [
  {
    icon: "sparkles",
    title: "Sur mesure",
    text: "Couleurs, mise en page et contenu : chaque client façonne sa page à son image, en toute autonomie.",
  },
  {
    icon: "calendar",
    title: "Plusieurs temps forts",
    text: "Un même événement peut réunir plusieurs cérémonies, lieux et dates, réunis sur un seul lien.",
  },
  {
    icon: "send",
    title: "Confirmations en ligne",
    text: "Les invités confirment leur présence directement depuis la page ; le suivi se fait en temps réel.",
  },
  {
    icon: "users",
    title: "Espace client sécurisé",
    text: "Chaque client gère son propre espace d'administration, indépendant de celui des autres.",
  },
];

const EVENT_TYPES = ["Anniversaires", "Baptêmes", "Soirées d'entreprise", "Et plus encore"];

/**
 * Vitrine publique de Passora (route racine du site). Générique — ne
 * représente aucun événement en particulier : les pages de mariage
 * vivent chacune sur leur propre lien (/e/[slug]).
 */
export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col bg-cream text-passora-ink">
      <header className="sticky top-0 z-20 border-b border-passora-ink/8 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-2.5">
            <PassoraLogo className="h-9 w-9 rounded-xl" />
            <span className="font-serif text-lg font-medium italic">Passora</span>
          </div>
          <Link
            href="/admin"
            className="rounded-full border border-passora-ink/15 px-5 py-2 text-xs font-medium tracking-wide text-passora-ink/80 transition-colors hover:border-passora-gold-deep hover:text-passora-gold-deep"
          >
            Espace client
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden px-5 py-24 text-center sm:px-8 sm:py-32">
          <div
            aria-hidden="true"
            className="absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-passora-gold/15 blur-3xl"
          />
          <FadeIn className="relative mx-auto max-w-2xl">
            <p className="mb-5 text-[0.7rem] font-medium tracking-[0.35em] text-passora-gold-deep uppercase">
              Un produit JEaLiFe Agency
            </p>
            <h1 className="font-serif text-4xl leading-[1.15] font-medium sm:text-6xl">
              Des pages d&apos;événement en ligne, à l&apos;image de chaque client.
            </h1>
            <p className="mt-7 text-base leading-relaxed text-passora-ink/65 sm:text-lg">
              Aujourd&apos;hui pour les mariages, bientôt pour bien d&apos;autres occasions : chaque
              client dispose de son propre espace pour personnaliser sa page, gérer son programme
              et suivre ses confirmations de présence — en toute autonomie.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="mailto:agency@jealife.com"
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-passora-gold px-8 py-3.5 text-sm font-medium tracking-[0.1em] text-passora-ink uppercase transition-colors hover:bg-passora-gold-deep"
              >
                <Icon name="mail" className="h-4 w-4" />
                Nous contacter
              </a>
              <Link
                href="/admin"
                className="inline-flex items-center justify-center gap-2.5 rounded-full border border-passora-ink/15 px-8 py-3.5 text-sm font-medium tracking-[0.1em] text-passora-ink uppercase transition-colors hover:border-passora-gold-deep hover:text-passora-gold-deep"
              >
                Espace client
              </Link>
            </div>
          </FadeIn>
        </section>

        <section className="px-5 py-20 sm:px-8">
          <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature, index) => (
              <FadeIn
                key={feature.title}
                delay={index * 100}
                className="rounded-[1.75rem] border border-passora-ink/10 bg-white/60 p-7"
              >
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-passora-gold/12 text-passora-gold-deep">
                  <Icon name={feature.icon} className="h-5 w-5" />
                </span>
                <h3 className="font-serif text-lg font-medium">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-passora-ink/60">{feature.text}</p>
              </FadeIn>
            ))}
          </div>
        </section>

        <section className="px-5 py-16 text-center sm:px-8">
          <FadeIn className="mx-auto max-w-xl">
            <h2 className="font-serif text-2xl font-medium">Et bientôt, au-delà du mariage</h2>
            <p className="mt-3 text-sm leading-relaxed text-passora-ink/60">
              D&apos;autres modèles de page arrivent, pensés pour d&apos;autres types d&apos;événements
              et personnalisables par les clients eux-mêmes.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
              {EVENT_TYPES.map((type) => (
                <span
                  key={type}
                  className="rounded-full border border-passora-gold/40 px-4 py-1.5 text-xs font-medium tracking-wide text-passora-ink/70 uppercase"
                >
                  {type}
                </span>
              ))}
            </div>
          </FadeIn>
        </section>
      </main>

      <footer className="border-t border-passora-ink/8 px-5 py-8 text-center text-xs text-passora-ink/50 sm:px-8">
        <p>Passora — un produit JEaLiFe Agency</p>
        <a href="mailto:agency@jealife.com" className="mt-1 inline-block hover:text-passora-gold-deep">
          agency@jealife.com
        </a>
      </footer>
    </div>
  );
}
