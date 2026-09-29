import type { ReactNode } from "react";
import { cx } from "../../lib/cx";

type InputFieldProps = {
  /** The field's accessible name: a visually hidden `<label>`, since the design shows only a placeholder. */
  label: string;
  /** Webflow's Name (and Data Name) field setting, the key of the submitted value. */
  name: string;
  type?: "email" | "text" | "tel";
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  /** Medium is 40px, large 48px. */
  size?: "medium" | "large";
  /** An SVG from src/assets/icons/ shown after the input (Figma "Show icon right"). */
  icon?: string;
  /** Slot before the input, closed off by a divider (the phone number's country picker). */
  prefix?: ReactNode;
  /** Action variant: the newsletter's pill with a control inside it. Stacks on phones. */
  variant?: "default" | "action";
  /** Slot for the `action` variant: the control that sits inside the field, usually a submit `UI / Button`. */
  children?: ReactNode;
};

/**
 * UI / Input Field (Figma Input-Container). A bordered container around Webflow's native Form
 * Text Field input (`w-input` next to `fk-input-field-input`); the container shows hover, focus
 * and disabled. Place it inside a form (Webflow's Form Block), which supplies submit and messages.
 */
export default function InputField({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
  disabled = false,
  size = "medium",
  icon,
  prefix,
  variant = "default",
  children,
}: InputFieldProps) {
  const id = `field-${name.toLowerCase()}`;
  const action = variant === "action";

  return (
    <div className={cx("fk-input-field", size === "large" && "is-large", disabled && "is-disabled", action && "is-action")}>
      {prefix ? <div className="fk-input-field-prefix">{prefix}</div> : null}
      <label className="fk-sr-only" htmlFor={id}>
        {label}
      </label>
      <input
        className={cx("fk-input-field-input w-input", action && "is-action")}
        id={id}
        type={type}
        name={name}
        data-name={name}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        maxLength={256}
        autoComplete={type === "email" ? "email" : undefined}
      />
      {icon ? <img className="fk-input-field-icon" src={icon} alt="" width={20} height={20} /> : null}
      {action ? children : null}
    </div>
  );
}
