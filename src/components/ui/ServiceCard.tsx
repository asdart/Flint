type ServiceCardProps = {
  /** An SVG path, e.g. `/assets/home/offer-hospital.svg`. */
  icon: string;
  title: string;
  body: string;
};

/** UI / Service Card. Hover motion is `ix-card-hover`. */
export default function ServiceCard({ icon, title, body }: ServiceCardProps) {
  return (
    <article className="fk-card">
      <img className="fk-icon is-lg" src={icon} alt="" width={40} height={40} />
      <div className="fk-card-body" data-ix="blur-reveal">
        <div className="fk-blur-reveal">
          <h3 className="fk-card-title">{title}</h3>
        </div>
        <div className="fk-blur-reveal is-delay-1">
          <p className="fk-card-text">{body}</p>
        </div>
      </div>
    </article>
  );
}
