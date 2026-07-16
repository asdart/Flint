import Hero from "../sections/Hero";
import Clients from "../sections/Clients";
import TwoWays from "../sections/TwoWays";
import PartnersMap from "../sections/PartnersMap";
import HowItWorks from "../sections/HowItWorks";
import WhatWeOffer from "../sections/WhatWeOffer";
import Testimonials from "../sections/Testimonials";
import Blog from "../sections/Blog";
import Cta from "../sections/Cta";
import Footer from "../sections/Footer";
import { useStaggerReveal } from "../hooks/useStaggerReveal";

export default function HomePage() {
  const revealRef = useStaggerReveal<HTMLDivElement>();

  return (
    <div ref={revealRef} className="flex w-full flex-col">
      <Hero />
      <Clients />
      <TwoWays />
      <PartnersMap />
      <HowItWorks />
      <WhatWeOffer />
      <Testimonials />
      <Blog />
      <Cta />
      <Footer />
    </div>
  );
}
