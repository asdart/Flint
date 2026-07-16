import FacilityHero from "../sections/facilities/FacilityHero";
import Stats from "../sections/Stats";
import FacilityHowItWorks from "../sections/facilities/FacilityHowItWorks";
import Benefits from "../sections/Benefits";
import Testimonials from "../sections/Testimonials";
import Faq from "../sections/Faq";
import FacilityCta from "../sections/facilities/FacilityCta";
import Footer from "../sections/Footer";
import { useStaggerReveal } from "../hooks/useStaggerReveal";

export default function FacilitiesPage() {
  const revealRef = useStaggerReveal<HTMLDivElement>();

  return (
    <div ref={revealRef} className="flex w-full flex-col">
      <FacilityHero />
      <Stats />
      <FacilityHowItWorks />
      <Benefits />
      <Testimonials />
      <Faq />
      <FacilityCta />
      <Footer />
    </div>
  );
}
