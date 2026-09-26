type TestimonialCardProps = {
  image: string;
  quote: string;
  name: string;
  role: string;
};

/** UI / Testimonial Card. Hover motion is `ix-testimonial-hover`. */
export default function TestimonialCard({ image, quote, name, role }: TestimonialCardProps) {
  return (
    <article className="fk-testimonial-card">
      <div className="fk-testimonial-card-media">
        <img
          className="fk-testimonial-card-image"
          src={image}
          alt={name}
          width={612}
          height={798}
          draggable={false}
        />
      </div>
      <div className="fk-testimonial-card-gradient" aria-hidden="true" />
      <div className="fk-testimonial-card-scrim" aria-hidden="true" />
      <div className="fk-testimonial-card-quote">
        <blockquote className="fk-testimonial-card-quote-text">&ldquo;{quote}&rdquo;</blockquote>
      </div>
      <div className="fk-testimonial-card-flag">
        <img
          className="fk-flag is-lg"
          src="/assets/country-flag.svg"
          alt=""
          width={32}
          height={32}
          draggable={false}
        />
      </div>
      <div className="fk-testimonial-card-person">
        <p className="fk-testimonial-card-name">{name}</p>
        <p className="fk-testimonial-card-role">{role}</p>
      </div>
    </article>
  );
}
