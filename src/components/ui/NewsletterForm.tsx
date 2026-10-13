import Button from "./Button";

type NewsletterFormProps = {
  /** Webflow's ID prop: the email input's `id`, which the hidden label's `for` points at. Give each instance on one page its own. */
  id?: string;
  /** Webflow's Button Label prop: the Subscribe button's text. */
  buttonLabel?: string;
  /** Webflow's Success Message prop (the Form Block's success message). */
  successMessage?: string;
  /** Webflow's Error Message prop (the Form Block's error message). */
  errorMessage?: string;
};

/**
 * UI / Newsletter Form (new in the Designer 2026-10-11, pulled back). A Webflow Form Block
 * (`fk-newsletter-form w-form`) named "Newsletter", posting to Webflow's form inbox (roadmap P-05):
 * the form holds the newsletter's pill (`fk-input-field is-action`: a visually hidden label, the email
 * input and the Subscribe `UI / Button` submit inside it) and the block's success and error messages.
 * It is not a `UI / Input Field` instance: the pill markup lives in the component itself, as built on
 * Webflow. Used by `Section / Newsletter` and the Posts template (`ArticleNewsletter`).
 * On Webflow the field's icon image is hidden (visibility off), so it isn't rendered here.
 */
export default function NewsletterForm({
  id = "field-email",
  buttonLabel = "Subscribe",
  successMessage = "Thanks for subscribing. You’re on the list.",
  errorMessage = "Something went wrong while submitting the form. Please try again.",
}: NewsletterFormProps) {
  return (
    <div className="fk-newsletter-form w-form">
      <form name="wf-form-Newsletter" data-name="Newsletter" method="get" aria-label="Newsletter">
        <div className="fk-input-field is-action">
          <label className="fk-sr-only" htmlFor={id}>
            Email address
          </label>
          <input
            className="fk-input-field-input is-action w-input"
            id={id}
            type="email"
            name="Email"
            data-name="Email"
            placeholder="Email address"
            required
            maxLength={256}
            autoComplete="email"
          />
          <Button submit label={buttonLabel} className="fk-w-full-mobile" />
        </div>
      </form>
      <div className="fk-newsletter-message w-form-done" role="status">
        <div>{successMessage}</div>
      </div>
      <div className="fk-newsletter-message is-error w-form-fail" role="alert">
        <div>{errorMessage}</div>
      </div>
    </div>
  );
}
