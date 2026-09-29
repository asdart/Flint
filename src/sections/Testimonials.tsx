import TestimonialCard from "../components/ui/TestimonialCard";
import Pagination from "../components/ui/Pagination";
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

          <div className="fk-testimonials-row">
            {TESTIMONIALS.map((testimonial, index) => (
              <div
                key={`${testimonial.image}-${index}`}
                className={cx("fk-testimonials-slide", index === 3 ? "is-center" : `is-slot-${index}`)}
                data-tm-slide={index + 1}
              >
                <TestimonialCard {...testimonial} />
              </div>
            ))}
          </div>

          <div
            className="fk-flex fk-justify-center fk-w-full fk-max-w-container fk-mx-auto"
            data-ix="reveal"
          >
            <Pagination
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
