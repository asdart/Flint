import Footer from "../components/global/Footer";
import Nav from "../components/global/Nav";
import Button from "../components/ui/Button";
import { useInteractions } from "../ix/useInteractions";
import PageHero from "../sections/PageHero";

// 404 at any unknown path (Webflow's 404 utility page): Page Hero, a button home (page-level row), no extra sections.
export default function NotFoundPage() {
  useInteractions();

  return (
    <div className="fk-page">
      <Nav />
      <main id="main">
        <PageHero title="Page not found" body="That page doesn't exist or has moved. Head back to the home page or read the Flint blog." />
        <section className="fk-section is-padded-bottom">
          <div className="fk-container">
            <div className="fk-flex fk-justify-center">
              <Button label="Back to home" link="/" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
