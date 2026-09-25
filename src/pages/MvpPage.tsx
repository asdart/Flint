import Footer from "../components/global/Footer";
import Nav from "../components/global/Nav";
import { useInteractions } from "../ix/useInteractions";
import PostGrid from "../sections/PostGrid";
import StatsBand from "../sections/StatsBand";
import TextPanel from "../sections/TextPanel";

// Draft page "MVP" at /mvp — roadmap phase 1. Content copied from the legacy About page.
const MISSION_BODY = [
  "U.S. hospitals are in crisis. Rural and community facilities in particular can’t find, or keep, enough nurses — and the agencies they turn to charge a fortune for staff who leave in a year. At the same time, there are millions of qualified nurses, CNAs, and medical professionals overseas who would give anything for a stable future in the United States. Two enormous problems. One obvious, underbuilt solution.",
  "Flint connects them directly. We recruit healthcare professionals from around the world, prepare them for U.S. licensure and interviews, and place them with hospitals and care facilities that don’t just need shift coverage — they’re ready to sponsor someone for permanent residency. Every step of that journey — licensing, immigration, legal fees, relocation — is covered by Flint. It costs the candidate nothing.",
  "Most staffing models optimize for the next 13 weeks. We optimize for the next 3 to 5 years, and for the decades after that. The outcome isn’t a placement. It’s a green card, a career, and often a family able to build a permanent life in the U.S.",
];

const IMPACT_STATS = [
  { value: "2024", label: "Founded" },
  { value: "200", suffix: "+", label: "Roles placed" },
  { value: "23", label: "States" },
  { value: "100,000", suffix: "+", label: "Vetted candidates" },
];

export default function MvpPage() {
  useInteractions();

  return (
    <div className="fk-page">
      <Nav />
      <main>
        <TextPanel eyebrow="Mission" title="Why we exist" body={MISSION_BODY} />
        <StatsBand title="Small team big impact" stats={IMPACT_STATS} />
        <PostGrid
          title="Related Insights"
          body="More guides on nursing careers, US immigration, and healthcare staffing."
        />
      </main>
      <Footer />
    </div>
  );
}
