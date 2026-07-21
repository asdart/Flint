import FacilityPartnersHero from "../sections/facility-partners/FacilityPartnersHero";
import Clients from "../sections/Clients";
import FacilityStats from "../sections/facility-partners/FacilityStats";
import FacilityHowItWorks from "../sections/facilities/FacilityHowItWorks";
import ModernFacility from "../sections/facility-partners/ModernFacility";
import FeaturedFacilities from "../sections/facility-partners/FeaturedFacilities";
import WhyFacilities from "../sections/facility-partners/WhyFacilities";
import FacilityTestimonial from "../sections/facility-partners/FacilityTestimonial";
import FacilityApply from "../sections/facility-partners/FacilityApply";
import Footer from "../sections/Footer";
import { useStaggerReveal } from "../hooks/useStaggerReveal";

export default function FacilityPartnersPage() {
  const revealRef = useStaggerReveal<HTMLDivElement>();

  return (
    <div ref={revealRef} className="flex w-full flex-col">
      <FacilityPartnersHero />
      <Clients />
      <FacilityStats />
      <FacilityHowItWorks />
      <ModernFacility />
      <FeaturedFacilities />
      <WhyFacilities />
      <FacilityTestimonial />
      <FacilityApply />
      <Footer />
    </div>
  );
}
