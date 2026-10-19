import Footer from "../components/global/Footer";
import Nav from "../components/global/Nav";
import { useInteractions } from "../ix/useInteractions";
import CandidatesCta from "../sections/CandidatesCta";
import CandidatesFaq from "../sections/CandidatesFaq";
import CandidatesHero from "../sections/CandidatesHero";
import CandidatesHowFlintWorks from "../sections/CandidatesHowFlintWorks";
import CandidatesStats from "../sections/CandidatesStats";
import RoleGrid from "../sections/RoleGrid";
import Testimonials from "../sections/Testimonials";

// Candidates page at /candidates (Figma 5543:915).
export default function CandidatesPage() {
  useInteractions();

  return (
    <div className="fk-page">
      <Nav />
      <main id="main">
        <CandidatesHero />
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
