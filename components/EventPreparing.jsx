import { PassoraLogo } from "@/components/admin/AuthGate";
import Icon from "@/components/ui/Icons";
import { eventTitle, eventTypeOf } from "@/lib/event-types";
import { formatDateFr, formatTimeFr } from "@/lib/utils";

/**
 * Page publique d'un événement dont le type n'a pas encore de modèle de
 * page (voir lib/event-types.js) : les informations essentielles, dans le
 * style de la vitrine, plutôt qu'une page de mariage inadaptée.
 */
export default function EventPreparing({ event }) {
  const type = eventTypeOf(event);
  const date = event.wedding_date ? formatDateFr(event.wedding_date) : "";

  return (
    <div className="flex min-h-svh flex-col bg-cream text-passora-ink">
      <main className="flex flex-1 items-center justify-center px-5 py-20 sm:px-8">
        <div className="w-full max-w-lg text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-passora-gold">
            <Icon name={type.icon} className="h-5 w-5" />
          </span>
          <p className="mt-6 text-[0.7rem] font-medium tracking-[0.3em] text-passora-gold-deep uppercase">
            {event.tagline || type.label}
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight font-medium sm:text-5xl">{eventTitle(event)}</h1>
          {date && (
            <p className="mt-4 text-sm text-passora-ink/65">
              <span className="capitalize">{date}</span>
              {event.date_confirmed ? ` · ${formatTimeFr(event.wedding_date)}` : " (date à confirmer)"}
            </p>
          )}
          <p className="mx-auto mt-8 max-w-md border-t border-passora-ink/10 pt-8 text-sm leading-relaxed text-passora-ink/60">
            La page de cet événement est en cours de préparation par l&apos;organisateur. Revenez un
            peu plus tard pour découvrir le programme et confirmer votre présence.
          </p>
        </div>
      </main>
      <footer className="flex items-center justify-center gap-2 border-t border-passora-ink/10 px-5 py-5 text-xs text-passora-ink/45">
        <PassoraLogo className="h-5 w-5 rounded" />
        Passora, un produit JEaLiFe Agency
      </footer>
    </div>
  );
}
