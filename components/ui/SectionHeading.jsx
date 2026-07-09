import FadeIn from "@/components/ui/FadeIn";
import Ornament from "@/components/ui/Ornament";

/**
 * En-tête de section : surtitre, titre serif, ornement et sous-titre.
 */
export default function SectionHeading({ eyebrow, title, subtitle, tone = "dark" }) {
  const isLight = tone === "light";
  return (
    <FadeIn className="mx-auto mb-14 max-w-2xl text-center sm:mb-20">
      {eyebrow && (
        <p
          className={`mb-4 text-[0.7rem] font-medium uppercase tracking-[0.35em] ${
            isLight ? "text-cream/70" : "text-terracotta"
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={`font-serif text-4xl font-medium sm:text-5xl ${
          isLight ? "text-cream" : "text-cocoa"
        }`}
      >
        {title}
      </h2>
      <div className="mt-6">
        <Ornament className={isLight ? "text-cream/70" : "text-terracotta"} />
      </div>
      {subtitle && (
        <p
          className={`mx-auto mt-6 max-w-xl text-base leading-relaxed font-light ${
            isLight ? "text-cream/80" : "text-cocoa/70"
          }`}
        >
          {subtitle}
        </p>
      )}
    </FadeIn>
  );
}
