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

// Copy of the Candidates page at /vital-healthcare-training-center. Its hero is the split Partner Hero.
export default function VitalHealthcareTrainingCenterPage() {
  useInteractions();

  return (
    <div className="fk-page">
      <Nav />
      <main id="main">
        <CandidatesPartnerHero
          title="You Trained with Vital Healthcare Training Center. Now Find a Green Card Sponsored CNA Role with Flint."
          body="Vital Healthcare Training Center and Flint are ready to help new graduates like you find a path to staying in the US with a Visa sponsored CNA role."
          image="/assets/candidates/partners/vital-healthcare-training-center.webp"
          imageSize={[904, 603]}
          imageAlt="Vital Healthcare Training Center graduates in blue scrubs holding certificates of completion beside their instructor"
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
