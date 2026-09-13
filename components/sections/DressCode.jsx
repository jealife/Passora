import FadeIn from "@/components/ui/FadeIn";
import Icon from "@/components/ui/Icons";

/** Code vestimentaire : titre, précisions, petite icône (voir Icons.jsx). */
export default function DressCode({ event }) {
  return (
    <section className="bg-cream px-5 py-16 text-center sm:px-8 sm:py-20">
      <FadeIn className="mx-auto max-w-md">
        <p className="mb-3 text-[0.7rem] font-medium uppercase tracking-[0.3em] text-terracotta">
          Code vestimentaire
        </p>
        <Icon name="dress-code" className="mx-auto mb-4 h-9 w-9 text-terracotta" />
        {event.dress_code_title && (
          <h3 className="font-serif text-2xl italic text-cocoa">{event.dress_code_title}</h3>
        )}
        {event.dress_code_note && (
          <p className="mt-3 text-sm leading-relaxed font-light text-cocoa/70">
            {event.dress_code_note}
          </p>
        )}
      </FadeIn>
    </section>
  );
}
