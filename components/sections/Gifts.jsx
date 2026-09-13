import FadeIn from "@/components/ui/FadeIn";
import Icon from "@/components/ui/Icons";

/** Suggestions de cadeaux : message, détails libres, QR code optionnel. */
export default function Gifts({ event }) {
  return (
    <section className="bg-linen px-5 py-16 text-center sm:px-8 sm:py-20">
      <FadeIn className="mx-auto max-w-md">
        <Icon name="gift" className="mx-auto mb-4 h-9 w-9 text-terracotta" />
        <p className="mb-3 text-[0.7rem] font-medium uppercase tracking-[0.3em] text-terracotta">
          Suggestion de cadeaux
        </p>
        {event.gift_message && (
          <p className="text-sm leading-relaxed font-light text-cocoa/70">{event.gift_message}</p>
        )}
        {event.gift_details && (
          <p className="mt-4 whitespace-pre-line font-serif text-base text-cocoa">
            {event.gift_details}
          </p>
        )}
        {event.gift_qr_image_url && (
          // eslint-disable-next-line @next/next/no-img-element -- QR statique, pas de bénéfice à next/image
          <img
            src={event.gift_qr_image_url}
            alt="QR code pour le cadeau"
            className="mx-auto mt-6 h-40 w-40 rounded-2xl border border-cocoa/10 bg-white object-contain p-3 shadow-sm"
          />
        )}
      </FadeIn>
    </section>
  );
}
