import Footer from "../components/global/Footer";
import Nav from "../components/global/Nav";
import { useInteractions } from "../ix/useInteractions";
import CandidatesHero from "../sections/CandidatesHero";
import CandidatesHowItWorks from "../sections/CandidatesHowItWorks";
import CtaArc from "../sections/CtaArc";
import Faq from "../sections/Faq";
import RoleGrid from "../sections/RoleGrid";
import StatsBand from "../sections/StatsBand";
import Testimonials from "../sections/Testimonials";

const STATS = [
  { value: "1000", suffix: "+", label: "People relocated" },
  { value: "28", label: "States with Facility Partners" },
  { value: "500,000+", label: "Patients Served" },
];

// Candidates page at /candidates (Figma 5543:915).
export default function CandidatesPage() {
  useInteractions();

  return (
    <div className="fk-page">
      <Nav />
      <main id="main">
        <CandidatesHero />
        <StatsBand
          variant="default"
          title={
            <>
              Thousands of candidates placed.
              <br />
              Millions of lives changed.
            </>
          }
          stats={STATS}
        />
        <CandidatesHowItWorks />
        <RoleGrid />
        <Testimonials />
        <Faq />
        <CtaArc />
      </main>
      <Footer />
    </div>
  );
}
