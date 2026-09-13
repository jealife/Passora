import FadeIn from "@/components/ui/FadeIn";
import Icon from "@/components/ui/Icons";

/** Recommandations libres aux invités (ponctualité, enfants, etc.). */
export default function GuestNotes({ event }) {
  return (
    <section className="bg-cream px-5 py-16 text-center sm:px-8 sm:py-20">
      <FadeIn className="mx-auto max-w-md">
        <Icon name="sparkles" className="mx-auto mb-4 h-8 w-8 text-terracotta" />
        {event.guest_notes_title && (
          <h3 className="font-serif text-2xl italic text-cocoa">{event.guest_notes_title}</h3>
        )}
        {event.guest_notes_text && (
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed font-light text-cocoa/70">
            {event.guest_notes_text}
          </p>
        )}
      </FadeIn>
    </section>
  );
}
