import Button from "@/components/ui/Button";
import FadeIn from "@/components/ui/FadeIn";
import Icon from "@/components/ui/Icons";
import SectionHeading from "@/components/ui/SectionHeading";

/**
 * Lieux des cérémonies : adresse, carte Google Maps intégrée
 * et bouton d'ouverture dans Google Maps.
 */
export default function Venues({ venues = [] }) {
  return (
    <section id="lieux" className="bg-cream py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Où nous retrouver"
          title="Les lieux"
          subtitle="Deux adresses pour une même journée. Les cartes vous guident jusqu'à nous."
        />

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          {venues.map((venue, index) => (
            <FadeIn
              key={venue.name}
              delay={index * 150}
              className="group overflow-hidden rounded-[2rem] border border-terracotta/12 bg-linen shadow-lg shadow-cocoa/5 transition-transform duration-300 hover:-translate-y-1.5"
            >
              <div className="p-8 sm:p-9">
                <p className="mb-2 text-[0.68rem] font-medium uppercase tracking-[0.3em] text-terracotta">
                  {venue.title}
                </p>
                <h3 className="font-serif text-3xl font-medium text-cocoa">{venue.name}</h3>
                <p className="mt-3 flex items-start gap-2.5 text-sm leading-relaxed font-light text-cocoa/70">
                  <Icon name="map-pin" className="mt-0.5 h-4.5 w-4.5 shrink-0 text-terracotta" />
                  {venue.address}
                </p>
              </div>

              <div className="relative mx-6 mb-6 overflow-hidden rounded-3xl sm:mx-8">
                <iframe
                  src={venue.maps_embed_url}
                  title={`Carte — ${venue.name}`}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-64 w-full border-0 sm:h-72"
                  style={{ filter: "sepia(0.18) saturate(0.9)" }}
                />
              </div>

              <div className="px-8 pb-8 sm:px-9">
                <Button
                  href={venue.maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outline"
                  icon="external-link"
                  iconPosition="right"
                  className="w-full sm:w-auto"
                >
                  Ouvrir dans Google Maps
                </Button>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
