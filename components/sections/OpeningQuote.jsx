import FadeIn from "@/components/ui/FadeIn";

/**
 * Citation d'ouverture (souvent un verset ou une pensée), affichée en tête
 * de page sur les modèles qui la prennent en charge.
 */
export default function OpeningQuote({ event }) {
  return (
    <section className="bg-cream px-5 py-16 text-center sm:px-8 sm:py-20">
      <FadeIn className="mx-auto max-w-xl">
        <p className="font-serif text-xl leading-relaxed italic text-cocoa/80 sm:text-2xl">
          «&nbsp;{event.opening_quote}&nbsp;»
        </p>
        {event.opening_quote_source && (
          <p className="mt-4 text-xs font-medium uppercase tracking-[0.25em] text-terracotta">
            {event.opening_quote_source}
          </p>
        )}
      </FadeIn>
    </section>
  );
}
