type QuoteCardProps = {
  quote: string;
  image: string;
  name: string;
  role: string;
};

/**
 * UI / Quote Card (Figma 5899:3624): a white text card, quote at the top and the person at the bottom (photo,
 * name, role). Not a heading: the quote is a blockquote, name and role are paragraphs. Quote holds the text
 * only; the curly quotes are static text around an unclassed span, as in Testimonial Card. The photo is
 * a 104 x 104 square crop (2x the 52px it shows) of a Home portrait (quote-photo-N.webp); its alt text is the Name.
 */
export default function QuoteCard({ quote, image, name, role }: QuoteCardProps) {
  return (
    <article className="fk-quote-card">
      <blockquote className="fk-quote-card-text">
        &ldquo;<span>{quote}</span>&rdquo;
      </blockquote>
      <div className="fk-quote-card-person">
        <img className="fk-quote-card-photo" src={image} alt="" width={52} height={52} loading="lazy" draggable={false} />
        <div className="fk-quote-card-details">
          <p className="fk-quote-card-name">{name}</p>
          <p className="fk-quote-card-role">{role}</p>
        </div>
      </div>
    </article>
  );
}
