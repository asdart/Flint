import TestimonialCard from "../components/ui/TestimonialCard";
import chevronLeft from "../assets/icons/chevron-left.svg";
import chevronRight from "../assets/icons/chevron-right.svg";
import { cx } from "../lib/cx";

type Testimonial = {
  name: string;
  role: string;
  image: string;
  imageSize: readonly [number, number];
  quote: string;
  flag: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Lucy",
    role: "CNA, Minnesota",
    image: "/assets/testimonial-photo-3.webp",
    imageSize: [625, 702],
    flag: "/assets/flags/ke.svg",
    quote: "Flint made everything feel easy. They gave me a path and the support I needed to finally see a permanent future here.",
  },
  {
    name: "Fabiana",
    role: "CNA, Wisconsin",
    image: "/assets/testimonial-photo-2.webp",
    imageSize: [625, 814],
    flag: "/assets/flags/ph.svg",
    quote: "Flint is more than a company — it’s an opportunity. They help people like me turn our experience and skills into a real path to permanent status.",
  },
  {
    name: "George",
    role: "CNA, North Dakota",
    image: "/assets/testimonial-photo-1.webp",
    imageSize: [625, 814],
    flag: "/assets/flags/ng.svg",
    quote: "I came across Flint by chance, and it felt like a miracle. They provided me a faster path to get permanent status. Flint makes everything so smooth and clear.",
  },
  {
    name: "Temilola",
    role: "CNA, Wisconsin",
    image: "/assets/testimonial-photo-2.webp",
    imageSize: [625, 814],
    flag: "/assets/flags/ht.svg",
    quote: "I didn\u2019t know the relocation bonus would come that fast. I didn\u2019t go through any stress with the whole process. Flint is always checking on me: how are you doing over there?",
  },
  {
    name: "Evanson",
    role: "CNA, Washington",
    image: "/assets/testimonial-photo-1.webp",
    imageSize: [625, 814],
    flag: "/assets/flags/gh.svg",
    quote: "Flint made everything easy for me. Where I work and where I live is less than five minutes apart, and my two-bedroom apartment is affordable. It makes life so much easier.",
  },
];

/** Three copies in a row: the middle one is the real set, the outer two let the track slide in
 * either direction without running out of cards (`x-carousel`, `data-x-copies="3"`). */
const RING = [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS];
const CURRENT = TESTIMONIALS.length + Math.floor(TESTIMONIALS.length / 2);

type TestimonialsProps = {
  title?: React.ReactNode;
  body?: string;
};

/** Section / Testimonials, Slider variant. Motion is `x-carousel` (spring). */
export default function Testimonials({
  title = "What candidates are saying about Flint.",
  body = "Flint has helped hundreds of healthcare professionals find green card sponsored roles across the US.",
}: TestimonialsProps) {
  return (
    <section className="fk-section">
      <div className="fk-panel fk-bg-brand-light" data-x-carousel="spring" data-x-copies="3" data-x-current="is-center" role="region" aria-roledescription="carousel" aria-label="Candidate testimonials">
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

          <div className="fk-testimonials-row fk-flex fk-flex-col" data-x-viewport>
            <div className="fk-testimonials-track fk-flex fk-gap-2" data-x-track>
              {RING.map((testimonial, index) => {
                const isClone = index < TESTIMONIALS.length || index >= TESTIMONIALS.length * 2;
                return (
                  <div
                    key={`${testimonial.image}-${index}`}
                    className={cx("fk-testimonials-slide", index === CURRENT && "is-center")}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${(index % TESTIMONIALS.length) + 1} of ${TESTIMONIALS.length}`}
                    aria-hidden={isClone || undefined}
                  >
                    <TestimonialCard {...testimonial} />
                  </div>
                );
              })}
            </div>
            <div className="fk-carousel-arrows">
              <button type="button" className="fk-carousel-arrow" data-x-prev aria-label="Previous testimonial">
                <img className="fk-carousel-arrow-icon" src={chevronLeft} alt="" width={20} height={20} />
              </button>
              <button type="button" className="fk-carousel-arrow" data-x-next aria-label="Next testimonial">
                <img className="fk-carousel-arrow-icon" src={chevronRight} alt="" width={20} height={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
