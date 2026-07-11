import FadeIn from "@/components/ui/FadeIn";
import Ornament from "@/components/ui/Ornament";

/**
 * « Notre histoire » — une citation, simplement.
 * La musique d'ambiance de la page est gérée par <BackgroundMusic />.
 */
export default function Story({ event }) {
  return (
    <section id="histoire" className="relative overflow-hidden bg-cream py-24 sm:py-32">
      {/* Ornements d'arrière-plan */}
      <div
        aria-hidden="true"
        className="absolute -top-16 -right-16 h-72 w-72 rounded-full bg-blush/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 -left-20 h-80 w-80 rounded-full bg-sand/40 blur-3xl"
      />

      <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
        <FadeIn>
          <h2 className="font-serif text-4xl font-medium text-cocoa sm:text-5xl">
            {event.story_title || "Notre histoire"}
          </h2>
          <div className="mt-6 flex justify-center">
            <Ornament className="text-terracotta" />
          </div>
          <blockquote className="mt-10 font-serif text-2xl leading-relaxed italic text-cocoa/85 sm:text-3xl">
            «&nbsp;Une personne peut tomber, deux peuvent se relever, mais trois liés par Dieu
            deviennent difficiles à briser.&nbsp;»
          </blockquote>
        </FadeIn>
      </div>
    </section>
  );
}
