import Button from "../components/ui/Button";
import InputField from "../components/ui/InputField";

type NewsletterProps = {
  title?: string;
  buttonLabel?: string;
  placeholder?: string;
  successMessage?: string;
  errorMessage?: string;
};

/**
 * Section / Newsletter. A reusable section (one component, placed on any page): a Webflow Form
 * Block (`w-form`) holding `UI / Input Field` (action variant) with a `UI / Button` submit inside,
 * plus the block's success and error messages. Where submissions go is roadmap P-05.
 *
 * One look: a full-width snug panel with a row (title left, 400px form right; stacks at Tablet).
 * The post page's narrower band is not a variant: it is the local section `ArticleNewsletter.tsx`
 * (D-27, the Stacked variant was removed).
 */
export default function Newsletter({
  title = "Subscribe to our newsletter for blog updates and original content",
  buttonLabel = "Subscribe",
  placeholder = "Email address",
  successMessage = "Thanks for subscribing. You’re on the list.",
  errorMessage = "Something went wrong while submitting the form. Please try again.",
}: NewsletterProps) {
  return (
    <section className="fk-section">
      <div className="fk-panel fk-bg-brand-light is-snug">
        <div className="fk-container">
          <div className="fk-flex fk-items-center fk-justify-center fk-gap-16 fk-flex-col-tablet fk-gap-6-tablet">
            <p className="fk-text-md fk-text-center-mobile">{title}</p>
            <div className="fk-newsletter-form w-form">
              <form name="wf-form-Newsletter" data-name="Newsletter" method="get" aria-label="Newsletter">
                <InputField variant="action" label="Email address" name="Email" type="email" placeholder={placeholder} required>
                  <Button submit label={buttonLabel} className="fk-w-full-mobile" />
                </InputField>
              </form>
              <div className="fk-newsletter-message w-form-done" role="status">
                <div>{successMessage}</div>
              </div>
              <div className="fk-newsletter-message is-error w-form-fail" role="alert">
                <div>{errorMessage}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
