import BackgroundMusic from "@/components/layout/BackgroundMusic";
import Navbar from "@/components/layout/Navbar";
import { WelcomeProvider } from "@/components/layout/WelcomeContext";
import Countdown from "@/components/sections/Countdown";
import DressCode from "@/components/sections/DressCode";
import Footer from "@/components/sections/Footer";
import Gallery from "@/components/sections/Gallery";
import Gifts from "@/components/sections/Gifts";
import GuestNotes from "@/components/sections/GuestNotes";
import Hero from "@/components/sections/Hero";
import OpeningQuote from "@/components/sections/OpeningQuote";
import Parents from "@/components/sections/Parents";
import Rsvp from "@/components/sections/Rsvp";
import Timeline from "@/components/sections/Timeline";
import Venues from "@/components/sections/Venues";
import { buildEventTheme, themeToCss } from "@/lib/theme";

const SECTION_LINKS = [
  { key: "gallery", href: "#galerie", label: "Galerie" },
  { key: "program", href: "#programme", label: "Programme" },
  { key: "venues", href: "#lieux", label: "Lieux" },
];

/**
 * Mise en page « terracotta floral » — inspirée d'une maquette de
 * référence (citation d'ouverture, parents des mariés, frise verticale,
 * code vestimentaire, cadeaux). Sélectionnée via
 * `event.layout_template === "terracotta-floral"` (voir WeddingPage.jsx).
 */
export default function TerracottaFloralLayout({ data }) {
  const { event, program, venues, gallery } = data;
  const initials = `${(event.bride_name || "M")[0]} & ${(event.groom_name || "J")[0]}`;
  const theme = buildEventTheme(event);

  const showOpeningQuote = event.show_opening_quote && Boolean(event.opening_quote);
  const showParents = event.show_parents && Boolean(
    event.bride_mother_name || event.bride_father_name || event.groom_mother_name || event.groom_father_name,
  );
  const showGallery = event.show_gallery && gallery.length > 0;
  const showProgram = event.show_program && program.length > 0;
  const showVenues = event.show_venues && venues.length > 0;
  const showDressCode = event.show_dress_code && Boolean(event.dress_code_title || event.dress_code_note);
  const showGifts = event.show_gifts && Boolean(event.gift_message || event.gift_details || event.gift_qr_image_url);
  const showGuestNotes = event.show_guest_notes && Boolean(event.guest_notes_title || event.guest_notes_text);

  const visible = { gallery: showGallery, program: showProgram, venues: showVenues };
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
        {showOpeningQuote && <OpeningQuote event={event} />}
        <Hero event={event} venueName={venues[0]?.name || ""} />
        {showParents && <Parents event={event} />}
        <Countdown targetDate={event.wedding_date} dateConfirmed={event.date_confirmed} />
        {showProgram && <Timeline program={program} />}
        {showGallery && <Gallery images={gallery} />}
        {showVenues && <Venues venues={venues} />}
        {showDressCode && <DressCode event={event} />}
        {showGifts && <Gifts event={event} />}
        {showGuestNotes && <GuestNotes event={event} />}
        <Rsvp event={event} />
        <Footer event={event} />
      </main>
    </WelcomeProvider>
  );
}
