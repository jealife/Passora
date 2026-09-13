import Icon from "@/components/ui/Icons";
import SectionHeading from "@/components/ui/SectionHeading";
import FadeIn from "@/components/ui/FadeIn";

/**
 * Frise verticale continue du déroulement de la journée — une seule
 * colonne, contrairement à `Program.jsx` (grille de cartes, chacune avec
 * sa propre mini-frise). Même forme de données (`program` groupé par
 * section via `groupProgram()`, voir lib/data.js).
 */
export default function Timeline({ program = [] }) {
  return (
    <section id="programme" className="bg-linen py-24 sm:py-32">
      <div className="mx-auto max-w-xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Déroulement de la journée"
          title="Itinéraire"
          subtitle="Les temps forts de notre journée, minute par minute."
        />

        <div className="space-y-10">
          {program.map((section, sectionIndex) => (
            <FadeIn key={section.section} delay={sectionIndex * 120}>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-terracotta text-cream">
                  <Icon name={section.icon} className="h-4.5 w-4.5" />
                </span>
                <h3 className="font-serif text-xl italic text-cocoa">{section.section}</h3>
              </div>
              <ul className="ml-5 space-y-4 border-l border-terracotta/20 pl-7">
                {section.items.map((item) => (
                  <li key={`${item.time}-${item.label}`} className="relative">
                    <span className="absolute top-1.5 -left-[1.95rem] h-2.5 w-2.5 rounded-full bg-terracotta" />
                    <span className="block text-xs font-medium tracking-wide text-terracotta">
                      {item.time}
                    </span>
                    <p className="text-sm font-light text-cocoa/80">{item.label}</p>
                  </li>
                ))}
              </ul>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
