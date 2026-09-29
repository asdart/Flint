import TestimonialCard from "../components/ui/TestimonialCard";
import CarouselDots from "../components/ui/CarouselDots";
import { cx } from "../lib/cx";

type Testimonial = {
  name: string;
  role: string;
  image: string;
  quote: string;
};

const QUOTE =
  "Flint made everything feel easy. After years of uncertainty, they gave me a path and the support I needed to finally see a permanent future here.";

const TESTIMONIALS: Testimonial[] = [
  { name: "Brandon Terry", role: "Minesota", image: "/assets/testimonial-photo-2.webp", quote: QUOTE },
  { name: "Brandon Terry", role: "Minesota", image: "/assets/testimonial-photo-1.webp", quote: QUOTE },
  { name: "Brandon Terry", role: "Minesota", image: "/assets/testimonial-photo-3.webp", quote: QUOTE },
  { name: "Chrismene jones", role: "California", image: "/assets/testimonial-photo-3.webp", quote: QUOTE },
  { name: "Chrismene jones", role: "California", image: "/assets/testimonial-photo-1.webp", quote: QUOTE },
  { name: "Brandon Terry", role: "Minesota", image: "/assets/testimonial-photo-2.webp", quote: QUOTE },
  { name: "Chrismene jones", role: "California", image: "/assets/testimonial-photo-3.webp", quote: QUOTE },
];

/** Three copies in a row: the middle one is the real set, the outer two let the track slide in
 * either direction without running out of cards (`ix-testimonials`). */
const RING = [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS];
const CURRENT = TESTIMONIALS.length + 3;

type TestimonialsProps = {
  title?: React.ReactNode;
  body?: string;
};

/** Section / Testimonials, Slider variant. Motion is `ix-testimonials`. */
export default function Testimonials({
  title = "What candidates are saying about Flint.",
  body = "Flint has helped hundreds of healthcare professionals find green card sponsored roles across the US.",
}: TestimonialsProps) {
  return (
    <section className="fk-section">
      <div className="fk-panel fk-bg-brand-light" data-ix="testimonials">
        <div className="fk-panel-content">
          <div className="fk-container">
            <div className="fk-section-header is-center is-narrow" data-ix="blur-reveal">
              <div className="fk-blur-reveal">
                <h2 className="fk-heading-xl">{title}</h2>
              </div>
              <div className="fk-blur-reveal is-delay-1">
                <p className="fk-text-lg fk-color-brand-80">{body}</p>
              </div>
            </div>
          </div>

          <div className="fk-flex fk-flex-col fk-gap-8 fk-w-full">
            <div className="fk-testimonials-track fk-flex fk-gap-6">
              {RING.map((testimonial, index) => {
                const isClone = index < TESTIMONIALS.length || index >= TESTIMONIALS.length * 2;
                return (
                  <div
                    key={`${testimonial.image}-${index}`}
                    className={cx("fk-testimonials-slide", index === CURRENT && "is-center")}
                    data-tm-slide={index + 1}
                    aria-hidden={isClone || undefined}
                  >
                    <TestimonialCard {...testimonial} />
                  </div>
                );
              })}
            </div>
            <CarouselDots
              id="tm"
              count={TESTIMONIALS.length}
              active={3}
              label={(index) => `Go to testimonial ${index + 1}`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
