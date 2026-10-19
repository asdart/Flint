import Footer from "../components/global/Footer";
import Nav from "../components/global/Nav";
import { useInteractions } from "../ix/useInteractions";
import CandidatesCta from "../sections/CandidatesCta";
import CandidatesFaq from "../sections/CandidatesFaq";
import CandidatesHowFlintWorks from "../sections/CandidatesHowFlintWorks";
import CandidatesPartnerHero from "../sections/CandidatesPartnerHero";
import CandidatesStats from "../sections/CandidatesStats";
import RoleGrid from "../sections/RoleGrid";
import Testimonials from "../sections/Testimonials";

// Copy of the Candidates page at /caregiver-for-hire. Its hero is the split Partner Hero.
export default function CaregiverForHirePage() {
  useInteractions();

  return (
    <div className="fk-page">
      <Nav />
      <main id="main">
        <CandidatesPartnerHero
          title="Find a Green Card Sponsored CNA Job with Caregiver for Hire and Flint."
          body="Caregiver for Hire USA and Flint are ready to help you find a Green Card sponsored healthcare job in the US."
          image="/assets/candidates/partners/caregiver-for-hire.webp"
          imageSize={[904, 603]}
          imageAlt="Caregiver for Hire graduates in a classroom holding certificates and giving thumbs up"
        />
        <CandidatesStats />
        <CandidatesHowFlintWorks />
        <RoleGrid />
        <Testimonials />
        <CandidatesFaq />
        <CandidatesCta />
      </main>
      <Footer />
    </div>
  );
}
