import BackgroundMusic from "@/components/layout/BackgroundMusic";
import Navbar from "@/components/layout/Navbar";
import { WelcomeProvider } from "@/components/layout/WelcomeContext";
import Countdown from "@/components/sections/Countdown";
import Footer from "@/components/sections/Footer";
import Gallery from "@/components/sections/Gallery";
import Hero from "@/components/sections/Hero";
import MarqueeBand from "@/components/sections/MarqueeBand";
import Program from "@/components/sections/Program";
import Rsvp from "@/components/sections/Rsvp";
import Story from "@/components/sections/Story";
import Venues from "@/components/sections/Venues";
import { buildEventTheme, themeToCss } from "@/lib/theme";

const SECTION_LINKS = [
  { key: "story", href: "#histoire", label: "Notre histoire" },
  { key: "gallery", href: "#galerie", label: "Galerie" },
  { key: "program", href: "#programme", label: "Programme" },
  { key: "venues", href: "#lieux", label: "Lieux" },
];

/**
 * Mise en page « classique » (arches / terracotta) — modèle historique de
 * Passora, utilisé quand `event.layout_template === "classic"` (voir
 * components/WeddingPage.jsx, l'aiguilleur entre les mises en page).
 */
export default function ClassicLayout({ data }) {
  const { event, program, venues, gallery } = data;
  const initials = `${(event.bride_name || "M")[0]} & ${(event.groom_name || "J")[0]}`;
  const theme = buildEventTheme(event);

  // Une section vide ne s'affiche jamais ; `show_*` permet en plus de la
  // masquer volontairement même si elle a du contenu (réglable dans l'admin).
  const showStory = event.show_story && Boolean(event.story_text);
  const showGallery = event.show_gallery && gallery.length > 0;
  const showProgram = event.show_program && program.length > 0;
  const showVenues = event.show_venues && venues.length > 0;

  const visible = { story: showStory, gallery: showGallery, program: showProgram, venues: showVenues };
  const navLinks = SECTION_LINKS.filter((link) => visible[link.key]);

  return (
    <WelcomeProvider>
      {theme && <style dangerouslySetInnerHTML={{ __html: `:root{${themeToCss(theme)}}` }} />}
      <main className="flex-1 overflow-x-clip">
        <Navbar initials={initials} links={navLinks} />
        <BackgroundMusic
          src={event.story_audio_url}
          brideName={event.bride_name}
          groomName={event.groom_name}
        />
        <Hero event={event} venueName={venues[0]?.name || ""} />
        <Countdown targetDate={event.wedding_date} dateConfirmed={event.date_confirmed} />
        <MarqueeBand event={event} />
        {showStory && <Story event={event} />}
        {showGallery && <Gallery images={gallery} />}
        {showProgram && <Program program={program} />}
        {showVenues && <Venues venues={venues} />}
        <MarqueeBand event={event} />
        <Rsvp event={event} />
        <Footer event={event} />
      </main>
    </WelcomeProvider>
  );
}
