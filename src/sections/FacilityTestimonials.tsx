import CarouselDots from "../components/ui/CarouselDots";
import QuoteCard from "../components/ui/QuoteCard";

/** The first five cards of the Figma slider (5899:3648), copy word for word (typographic apostrophes). Portraits are
 * Home's three testimonial photos, matched to each name (2, 1, 3, 1, 2) so no two neighbours share a face. */
const QUOTES = [
  {
    quote:
      "We serve both military and civilian patients and previously faced high turnover rates, which made maintaining a reliable workforce challenging. Flint provided a solution by filling 12 critical roles with committed, full-time professionals.",
    image: "/assets/testimonial-photo-2.webp",
    name: "Sarah Jennings",
    role: "Operations Manager, Metro General Hospital",
  },
  {
    quote:
      "Thanks to the innovative staffing approach, we reduced our hiring time by 40%, allowing us to focus on patient care rather than recruitment.",
    image: "/assets/testimonial-photo-1.webp",
    name: "Michael Thompson",
    role: "HR Director, Coastal Health System",
  },
  {
    quote:
      "By leveraging technology and analytics, we were able to optimize our scheduling and ensure better coverage for our patients.",
    image: "/assets/testimonial-photo-3.webp",
    name: "Emily Chen",
    role: "Director of Operations, City Care Clinic",
  },
  {
    quote:
      "We recognized that our previous approach was unsustainable, and Flint’s expertise helped us to stabilize our workforce effectively.",
    image: "/assets/testimonial-photo-1.webp",
    name: "Richard Martin",
    role: "Chief Executive Officer, West Valley Medical Center",
  },
  {
    quote:
      "Their commitment to understanding our unique challenges has made all the difference in our staffing stability.",
    image: "/assets/testimonial-photo-2.webp",
    name: "Jessica Lee",
    role: "Nurse Manager, Riverside Hospital",
  },
];

/** Three copies in a row for the infinite loop (`x-carousel`, `data-x-copies="3"`); the first copy is the real one at
 * rest, the script moves the real copy as it loops and keeps `aria-hidden` on the others. */
const RING = [...QUOTES, ...QUOTES, ...QUOTES];

/**
 * Section / Facility Testimonials (Figma 5543:1321 > 5543:1322): a left-aligned row of Quote Cards on a brand-light
 * panel, one dot per card. Page-level markup (D-17, one page uses it). No visible title, so the section has an
 * aria-label. Motion is `x-carousel` (tween, autoplay 5s, `data-x-align="start"`): the track starts at the
 * container's left edge and the cards run off the panel's right edge.
 */
export default function FacilityTestimonials() {
  return (
    <section className="fk-section" aria-label="Testimonials">
      <div className="fk-panel fk-bg-brand-light" data-x-carousel="tween" data-x-autoplay="5000" data-x-copies="3" data-x-align="start">
        <div className="fk-panel-content">
          <div className="fk-container is-bleed">
            <div className="fk-flex fk-gap-2" data-x-track>
              {RING.map((quote, index) => (
                <div key={`${quote.name}-${index}`} className="fk-flex fk-shrink-0" aria-hidden={index >= QUOTES.length || undefined}>
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
