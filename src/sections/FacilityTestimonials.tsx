import CarouselDots from "../components/ui/CarouselDots";
import QuoteCard from "../components/ui/QuoteCard";

/** The three administrator quotes (user, 2026-10-19), copy word for word (typographic apostrophes and dashes). Portraits
 * are 104 × 104 top crops of three cut-out portraits of women, none of them a Testimonial Card photo. */
const QUOTES = [
  {
    quote:
      "My first response when I heard about Flint was: if it’s this easy, why isn’t everybody doing it? We tried everything before this — partnerships with schools, higher wages, travel staff. It truly was that easy. I don’t know why everyone’s not doing it.",
    image: "/assets/quote-photo-1.webp",
    name: "Samantha Colbenson",
    role: "Administrator — Good Shepherd Lutheran Services, Rushford MN",
  },
  {
    quote:
      "When I started we were in the 40s with two units closed. Today we are at 82. Having consistent staff means we can take more residents — and people in our community don’t have to go far away for care anymore.",
    image: "/assets/quote-photo-2.webp",
    name: "Tara Marie Adkins",
    role: "Administrator — Inter-Faith Care Center, Carlton MN",
  },
  {
    quote:
      "We’ve reduced agency CNAs from 10 down to three in under six months. The financial impact has been huge. And beyond the numbers, the staff actually fit our culture and care about our residents — that’s what agency never gave us.",
    image: "/assets/quote-photo-3.webp",
    name: "Krista Boley",
    role: "Administrator — Park Manor, Park Falls WI",
  },
];

/** Three copies in a row for the infinite loop (`x-carousel`, `data-x-copies="3"`); the first copy is the real one at
 * rest, the script moves the real copy as it loops and keeps `aria-hidden` on the others. */
const RING = [...QUOTES, ...QUOTES, ...QUOTES];

/**
 * Section / Facility Testimonials (Figma 5543:1321 > 5543:1322): a left-aligned row of Quote Cards on a brand-light
 * panel, one dot per card. Page-level markup (D-17, one page uses it). No visible title, so the carousel region
 * (`role="region"` + `aria-roledescription="carousel"`) carries the aria-label. Motion is `x-carousel` (tween, autoplay 5s, `data-x-align="start"`): the track starts at the
 * container's left edge and the cards run off the panel's right edge.
 */
export default function FacilityTestimonials() {
  return (
    <section className="fk-section">
      <div className="fk-panel fk-bg-brand-light" data-x-carousel="tween" data-x-autoplay="5000" data-x-copies="3" data-x-align="start" role="region" aria-roledescription="carousel" aria-label="Facility testimonials">
        <div className="fk-panel-content">
          <div className="fk-container">
            <div className="fk-flex fk-gap-2" data-x-track>
              {RING.map((quote, index) => (
                <div
                  key={`${quote.name}-${index}`}
                  className="fk-flex fk-shrink-0"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${(index % QUOTES.length) + 1} of ${QUOTES.length}`}
                  aria-hidden={index >= QUOTES.length || undefined}
                >
                  <QuoteCard {...quote} />
                </div>
              ))}
            </div>
          </div>
          <CarouselDots count={QUOTES.length} label={(index) => `Show testimonial ${index + 1}`} />
        </div>
      </div>
    </section>
  );
}
