import NewsletterForm from "../components/ui/NewsletterForm";

type NewsletterProps = {
  title?: string;
  buttonLabel?: string;
  successMessage?: string;
  errorMessage?: string;
};

/**
 * Section / Newsletter. A reusable section (one component, placed on any page): the title and one
 * `UI / Newsletter Form` instance (Form Block, field with the Subscribe button, success and error
 * messages), its Button Label, Success Message and Error Message props bound to this section's props.
 * Where submissions go is roadmap P-05.
 *
 * One look: a full-width snug panel with a row (title left, 400px form right; stacks at Tablet).
 * The post page's narrower band is not a variant: it is the local section `ArticleNewsletter.tsx`
 * (D-27, the Stacked variant was removed).
 */
export default function Newsletter({
  title = "Subscribe to our newsletter for blog updates and original content",
  buttonLabel = "Subscribe",
  successMessage = "Thanks for subscribing. You’re on the list.",
  errorMessage = "Something went wrong while submitting the form. Please try again.",
}: NewsletterProps) {
  return (
    <section className="fk-section" id="newsletter">
      <div className="fk-panel fk-bg-brand-light is-snug">
        <div className="fk-container">
          <div className="fk-flex fk-items-center fk-justify-center fk-gap-16 fk-flex-col-tablet fk-gap-6-tablet">
            <p className="fk-text-md fk-text-center-mobile">{title}</p>
            <NewsletterForm buttonLabel={buttonLabel} successMessage={successMessage} errorMessage={errorMessage} />
          </div>
        </div>
      </div>
    </section>
  );
}
