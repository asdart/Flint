import Button from "../components/ui/Button";
import InputField from "../components/ui/InputField";
import { cx } from "../lib/cx";

type NewsletterProps = {
  variant?: "default" | "stacked";
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
 * Variants (Webflow component variants):
 * - Default: a full-width snug panel with a row (title left, 400px form right; stacks at Tablet).
 * - Stacked: a 720px (article width) centered panel with 16px padding and a centered column (title
 *   above the 400px form), used right after an article body. Its section adds 80px bottom padding
 *   (Tablet and up) to space the next panel. On phones it is a full-width card too, but keeps its
 *   16px panel padding and centered column.
 */
export default function Newsletter({
  variant = "default",
  title = "Subscribe to our newsletter for blog updates and original content",
  buttonLabel = "Subscribe",
  placeholder = "Email address",
  successMessage = "Thanks for subscribing. You’re on the list.",
  errorMessage = "Something went wrong while submitting the form. Please try again.",
}: NewsletterProps) {
  const stacked = variant === "stacked";
  return (
    <section className={cx("fk-section", stacked && "is-padded-bottom-lg")}>
      <div className={cx("fk-panel fk-bg-brand-light", stacked ? "is-tight fk-max-w-article fk-mx-auto" : "is-snug")}>
        <div className={cx("fk-container", stacked && "is-content-sm")}>
          <div
            className={cx(
              "fk-flex fk-items-center fk-justify-center",
              stacked ? "fk-flex-col fk-gap-4" : "fk-gap-16 fk-flex-col-tablet fk-gap-6-tablet",
            )}
          >
            <p className={cx("fk-text-md", stacked ? "fk-text-center" : "fk-text-center-mobile")}>{title}</p>
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
