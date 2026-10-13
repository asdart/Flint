import type { ReactNode } from "react";
import { cx } from "../../lib/cx";

type InputFieldProps = {
  /** The field's name: a visible `<label for>` above the field, which names the input. The Webflow TEMPLATE also binds the Label prop to an `aria-label` (the one documented difference); a plain field doesn't need it. */
  label?: string;
  /** The hint inside the empty field: the plain field's Placeholder setting on Webflow (set per field after unlinking the template). It is not a name. */
  placeholder?: string;
  /** Webflow's ID prop (the input's `id`, which the label's `for` points at). Default `field-` + the lowercase name. */
  id?: string;
  /** The plain field's Name setting on Webflow (also Data Name), the key of the submitted value. Per use. */
  name: string;
  /** The plain field's Type setting on Webflow. Per use. */
  type?: "email" | "text" | "tel";
  required?: boolean;
  disabled?: boolean;
  /** Medium is 40px, large 48px. */
  size?: "medium" | "large";
  /** Slot before the input, closed off by a divider (the phone number's country picker). */
  prefix?: ReactNode;
};

/**
 * UI / Input Field (Figma Input_text 5535:1646 / Input-Container 5535:1644). `fk-input-container`
 * (column, 4px gap) around an `fk-input-field-label` and the bordered `fk-input-field` that
 * holds Webflow's native Form Text Field input (`w-input` next to `fk-input-field-input`); the field shows hover, focus and disabled. A plain field: the newsletter's pill with a
 * button inside is `UI / Newsletter Form`. Place it inside a form (Webflow's Form Block), which supplies
 * submit and messages. Rebuilt in the Designer 2026-10-11 and pulled back.
 *
 * Roadmap D-67: on Webflow a Form Text Field's Name, Placeholder and Type can't be bound to props or
 * varied per instance, so `UI / Input Field` is a TEMPLATE component: an editor places it, unlinks it,
 * and sets Name / Placeholder / Type on the resulting plain field. Agents don't place and unlink it: they
 * build each field as plain elements, using the template only as a reference for structure and classes,
 *; a field gets an icon image only when it needs one (no hidden icons, no icon prop). Each use of this helper in React is
 * therefore one plain-markup field per form on Webflow (page-level markup, never a linked instance),
 * and `name` / `placeholder` / `type` are per-use props here.
 */
export default function InputField({
  label = "Email",
  placeholder = "Email address",
  id,
  name,
  type = "text",
  required = false,
  disabled = false,
  size = "medium",
  prefix,
}: InputFieldProps) {
  const inputId = id || `field-${name.toLowerCase()}`;

  return (
    <div className="fk-input-container">
      <label className="fk-input-field-label" htmlFor={inputId}>
        {label}
      </label>
      <div className={cx("fk-input-field", size === "large" && "is-large", disabled && "is-disabled")}>
        {prefix ? <div className="fk-input-field-prefix">{prefix}</div> : null}
        <input
          className={cx("fk-input-field-input w-input", disabled && "is-disabled")}
          id={inputId}
          type={type}
          name={name}
          data-name={name}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          maxLength={256}
          autoComplete={type === "email" ? "email" : undefined}
        />
      </div>
    </div>
  );
}
