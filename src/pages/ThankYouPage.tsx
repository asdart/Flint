import Footer from "../components/global/Footer";
import Nav from "../components/global/Nav";
import { useInteractions } from "../ix/useInteractions";
import PageHero from "../sections/PageHero";

// Thank You page at /thank-you (where the application ends): Page Hero (Half Screen, with the button), no extra sections.
export default function ThankYouPage() {
  useInteractions();

  return (
    <div className="fk-page">
      <Nav />
      <main id="main">
        <PageHero
          variant="half-screen"
          title="Thanks for applying!"
          body={"We're reviewing your application now.\nWe will send a text message or call as soon as we have an update."}
          showButton
        />
      </main>
      <Footer />
    </div>
  );
}
