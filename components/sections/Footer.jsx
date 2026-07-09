import FadeIn from "@/components/ui/FadeIn";
import Icon from "@/components/ui/Icons";
import Ornament from "@/components/ui/Ornament";
import { formatDateFr } from "@/lib/utils";

/** Pied de page : mot des mariés et signature. */
export default function Footer({ event }) {
  const initials = `${(event.bride_name || "M")[0]} & ${(event.groom_name || "J")[0]}`;

  return (
    <footer className="bg-cocoa px-5 py-20 text-center sm:px-8">
      <FadeIn className="mx-auto max-w-xl">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-cream/20 text-cream/80">
          <Icon name="gift" className="h-6 w-6" />
        </span>

        <p className="mt-8 font-serif text-2xl leading-relaxed font-light text-cream italic sm:text-[1.7rem]">
          « {event.footer_message} »
        </p>

        <div className="mt-9">
          <Ornament className="text-terracotta" />
        </div>

        <p className="mt-9 font-serif text-3xl italic text-cream">{initials}</p>
        <p className="mt-2 text-[0.72rem] font-light uppercase tracking-[0.3em] text-cream/50">
          {event.bride_name} &amp; {event.groom_name}
          <span className="mx-2.5" aria-hidden="true">
            ·
          </span>
          <span className="capitalize">{formatDateFr(event.wedding_date)}</span>
        </p>
      </FadeIn>
    </footer>
  );
}
