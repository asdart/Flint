import Footer from "../components/global/Footer";
import Nav from "../components/global/Nav";
import { useInteractions } from "../ix/useInteractions";
import FacilityPartnersHero from "../sections/FacilityPartnersHero";
import FacilityTestimonials from "../sections/FacilityTestimonials";
import FacilityValueProp from "../sections/FacilityValueProp";
import FeatureGrid from "../sections/FeatureGrid";
import LogoMarquee from "../sections/LogoMarquee";
import StatsBand from "../sections/StatsBand";

const STATS = [
  { value: "200", suffix: "+", label: "Partner facilities" },
  { value: "23", label: "States supported" },
  { value: "100,000", label: "Vetted candidates" },
];

// Facility partners page at /facility-partners (Figma 5543:1164). No Apply form section (user, 2026-10-06):
// the hero button links the external facility application.
export default function FacilityPartnersPage() {
  useInteractions();

  return (
    <div className="fk-page">
      <Nav variant="dark" />
      <main>
        <FacilityPartnersHero />
        <LogoMarquee />
        <StatsBand variant="spread" stats={STATS} />
        <FacilityValueProp />
        <FeatureGrid variant="benefits" />
        <FacilityTestimonials />
      </main>
      <Footer />
    </div>
  );
}
