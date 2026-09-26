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
import Testimonials from "../sections/Testimonials";
import TwoWays from "../sections/TwoWays";

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
        <PartnersMap />
        <HowItWorks />
        <FeatureGrid />
        <Testimonials />
        <PostGrid
          variant="home"
          title="The Flint blog"
          body="More guides on nursing careers, US immigration, and healthcare staffing."
          buttonLabel="See all posts"
          buttonLink="/blog"
        />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
