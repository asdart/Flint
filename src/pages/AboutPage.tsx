import Footer from "../components/global/Footer";
import Nav from "../components/global/Nav";
import { useInteractions } from "../ix/useInteractions";
import AboutHero from "../sections/AboutHero";
import AboutMission from "../sections/AboutMission";
import AboutResidency from "../sections/AboutResidency";
import AboutStory from "../sections/AboutStory";
import AboutTeam, { AboutTeamModals } from "../sections/AboutTeam";
import CtaSplit from "../sections/CtaSplit";
import LogoGrid from "../sections/LogoGrid";
import StatsBand from "../sections/StatsBand";

const STATS = [
  { value: "2024", label: "Founded" },
  { value: "200", suffix: "+", label: "Roles placed" },
  { value: "23", label: "States" },
  { value: "100,000", suffix: "+", label: "Vetted candidates" },
];

// About page at /about (Figma 5805:3949, plan docs/webflow/plans/about.md).
// The founders' modals are rendered after the footer: a modal is position: fixed and must not sit
// inside a section that animates a transform.
export default function AboutPage() {
  useInteractions();

  return (
    <div className="fk-page">
      <Nav />
      <main>
        <AboutHero />
        <AboutMission />
        <AboutTeam />
        <AboutStory />
        <AboutResidency />
        <StatsBand title="Small team big impact" stats={STATS} />
        <LogoGrid />
        <CtaSplit />
      </main>
      <Footer />
      <AboutTeamModals />
    </div>
  );
}
