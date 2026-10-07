import Footer from "../components/global/Footer";
import Nav from "../components/global/Nav";
import { privacyPolicy } from "../content/legal";
import { useInteractions } from "../ix/useInteractions";
import LegalBody from "../sections/LegalBody";
import PageHero from "../sections/PageHero";

// Privacy Policy page at /privacy-policy: Page Hero (component) and Legal Body (page markup), copy verbatim from the live site.
export default function PrivacyPolicyPage() {
  useInteractions();

  return (
    <div className="fk-page">
      <Nav />
      <main id="main">
        <PageHero title={privacyPolicy.title} body={`Effective date: ${privacyPolicy.effectiveDate}`} />
        <LegalBody page={privacyPolicy} />
      </main>
      <Footer />
    </div>
  );
}
