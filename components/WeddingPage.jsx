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

/**
 * Page complète d'un événement — composée de sections réutilisables.
 * Utilisée par la page d'accueil et par /e/[slug] (multi-événements).
 */
export default function WeddingPage({ data }) {
  const { event, program, venues, gallery } = data;
  const initials = `${(event.bride_name || "M")[0]} & ${(event.groom_name || "J")[0]}`;

  return (
    <WelcomeProvider>
      <main className="flex-1 overflow-x-clip">
        <Navbar initials={initials} />
        <BackgroundMusic
          src={event.story_audio_url}
          brideName={event.bride_name}
          groomName={event.groom_name}
        />
        <Hero event={event} venueName={venues[0]?.name || ""} />
        <Countdown targetDate={event.wedding_date} dateConfirmed={event.date_confirmed} />
        <MarqueeBand event={event} />
        <Story event={event} />
        <Gallery images={gallery} />
        <Program program={program} />
        <Venues venues={venues} />
        <MarqueeBand event={event} />
        <Rsvp eventSlug={event.slug} />
        <Footer event={event} />
      </main>
    </WelcomeProvider>
  );
}
