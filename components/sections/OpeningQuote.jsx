import FadeIn from "@/components/ui/FadeIn";
import FloralAccent from "@/components/ui/FloralAccent";

/**
 * Citation d'ouverture (souvent un verset ou une pensée), affichée en tête
 * de page sur les modèles qui la prennent en charge.
 */
export default function OpeningQuote({ event }) {
  return (
    <section className="relative overflow-hidden bg-cream px-5 py-16 text-center sm:px-8 sm:py-20">
      <FloralAccent className="absolute -top-4 -left-6 h-24 w-24 -scale-x-100 text-terracotta/70 sm:h-32 sm:w-32" />
      <FloralAccent className="absolute -top-4 -right-6 h-24 w-24 rotate-90 text-terracotta/70 sm:h-32 sm:w-32" />
      <FadeIn className="relative mx-auto max-w-xl">
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
