import FadeIn from "@/components/ui/FadeIn";
import Ornament from "@/components/ui/Ornament";

/**
 * Texte de bénédiction + noms des parents des mariés, affiché avant les
 * noms des mariés sur les modèles qui le prennent en charge.
 */
export default function Parents({ event }) {
  const brideParents = [event.bride_mother_name, event.bride_father_name].filter(Boolean);
  const groomParents = [event.groom_mother_name, event.groom_father_name].filter(Boolean);

  return (
    <section className="bg-linen px-5 py-16 text-center sm:px-8 sm:py-20">
      <FadeIn className="mx-auto max-w-2xl">
        {event.parents_blessing_text && (
          <p className="mb-8 text-sm leading-relaxed font-light text-cocoa/75 sm:text-base">
            {event.parents_blessing_text}
          </p>
        )}
        <div className="grid gap-8 sm:grid-cols-2">
          {brideParents.length > 0 && (
            <div>
              <p className="mb-2 text-[0.68rem] font-medium uppercase tracking-[0.25em] text-terracotta">
                Parents de {event.bride_name || "la mariée"}
              </p>
              {brideParents.map((name) => (
                <p key={name} className="font-serif text-lg italic text-cocoa">
                  {name}
                </p>
              ))}
            </div>
          )}
          {groomParents.length > 0 && (
            <div>
              <p className="mb-2 text-[0.68rem] font-medium uppercase tracking-[0.25em] text-terracotta">
                Parents de {event.groom_name || "le marié"}
              </p>
              {groomParents.map((name) => (
                <p key={name} className="font-serif text-lg italic text-cocoa">
                  {name}
                </p>
              ))}
            </div>
          )}
        </div>
        <div className="mt-8 flex justify-center">
          <Ornament />
        </div>
      </FadeIn>
    </section>
  );
}
