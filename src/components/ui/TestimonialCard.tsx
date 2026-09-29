type TestimonialCardProps = {
  image: string;
  quote: string;
  name: string;
  role: string;
};

/** UI / Testimonial Card. Hover motion is `ix-testimonial-hover`. */
export default function TestimonialCard({ image, quote, name, role }: TestimonialCardProps) {
  return (
    <article className="fk-testimonial-card fk-relative fk-rounded-2xl fk-bg-white fk-overflow-clip">
      <div className="fk-testimonial-card-media fk-absolute">
        <img
          className="fk-testimonial-card-image fk-absolute fk-inset-0 fk-block fk-w-full fk-h-full fk-object-cover"
          src={image}
          alt={name}
          width={612}
          height={798}
          draggable={false}
        />
      </div>
      <div className="fk-testimonial-card-gradient fk-absolute fk-inset-0" aria-hidden="true" />
      <div className="fk-testimonial-card-scrim fk-absolute fk-inset-0" aria-hidden="true" />
      <div className="fk-testimonial-card-quote fk-absolute">
        <blockquote className="fk-testimonial-card-quote-text fk-absolute fk-w-full fk-color-white">
          &ldquo;<span>{quote}</span>&rdquo;
        </blockquote>
      </div>
      <div className="fk-testimonial-card-flag fk-absolute">
        <img
          className="fk-flag is-lg"
          src="/assets/country-flag.svg"
          alt=""
          width={32}
          height={32}
          draggable={false}
        />
      </div>
      <div className="fk-testimonial-card-person fk-absolute fk-flex fk-flex-col fk-gap-1">
        <p className="fk-text-md fk-font-medium fk-color-white">{name}</p>
        <p className="fk-testimonial-card-role fk-color-white">{role}</p>
      </div>
    </article>
  );
}
