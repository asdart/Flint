import Footer from "../components/global/Footer";
import Nav from "../components/global/Nav";
import { useInteractions } from "../ix/useInteractions";
import PageHero from "../sections/PageHero";

// 404 at any unknown path (Webflow's 404 utility page): Page Hero (Half Screen, with the button), no extra sections.
export default function NotFoundPage() {
  useInteractions();

  return (
    <div className="fk-page">
      <Nav />
      <main id="main">
        <PageHero
          variant="half-screen"
          title="Page not found"
          body={"That page doesn't exist or has moved.\n"}
          showButton
        />
      </main>
      <Footer />
    </div>
  );
}
