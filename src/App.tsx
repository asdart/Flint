import Hero from "./sections/Hero";
import Stats from "./sections/Stats";
import HowItWorks from "./sections/HowItWorks";
import Benefits from "./sections/Benefits";
import Testimonials from "./sections/Testimonials";
import Faq from "./sections/Faq";
import Cta from "./sections/Cta";
import Footer from "./sections/Footer";
import { useStaggerReveal } from "./hooks/useStaggerReveal";

export default function App() {
  const revealRef = useStaggerReveal<HTMLDivElement>();

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-white">
      <div ref={revealRef} className="flex w-full flex-col">
        <Hero />
        <Stats />
        <HowItWorks />
        <Benefits />
        <Testimonials />
        <Faq />
        <Cta />
        <Footer />
      </div>
    </div>
  );
}
