import Footer from "../components/global/Footer";
import Nav from "../components/global/Nav";
import { useInteractions } from "../ix/useInteractions";
import Cta from "../sections/Cta";
import FeatureGrid from "../sections/FeatureGrid";
import Hero from "../sections/Hero";
import HowItWorks from "../sections/HowItWorks";
import LogoMarquee from "../sections/LogoMarquee";
import PartnersMap from "../sections/PartnersMap";
import PostGrid from "../sections/PostGrid";
import Pricing from "../sections/Pricing";
import RoleGrid from "../sections/RoleGrid";
import Testimonials from "../sections/Testimonials";
import TwoWays from "../sections/TwoWays";
import Webinar from "../sections/Webinar";

// Draft page "MVP Home" at /mvp-home — roadmap phase 2b (docs/webflow/mvp2-home.md). The homepage
// rebuilt from contract sections, compared against the legacy / until sign-off.
export default function MvpHomePage() {
  useInteractions();

  return (
    <div className="fk-page">
      <Nav />
      <main>
        <Hero />
        <LogoMarquee />
        <TwoWays />
        <Pricing />
        <PartnersMap />
        <HowItWorks />
        <Webinar />
        <RoleGrid />
        <FeatureGrid />
        <Testimonials />
        <PostGrid />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
