import Footer from "../components/global/Footer";
import Nav from "../components/global/Nav";
import { termsOfService } from "../content/legal";
import { useInteractions } from "../ix/useInteractions";
import LegalBody from "../sections/LegalBody";
import PageHero from "../sections/PageHero";

// Terms of Service page at /terms-of-service: Page Hero (component) and Legal Body (page markup), copy verbatim from the live site.
export default function TermsOfServicePage() {
  useInteractions();

  return (
    <div className="fk-page">
      <Nav />
      <main id="main">
        <PageHero title={termsOfService.title} body={`Effective date: ${termsOfService.effectiveDate}`} />
        <LegalBody page={termsOfService} />
      </main>
      <Footer />
    </div>
  );
}
