import chevronDown from "../../assets/icons/chevron-down.svg";
import { cx } from "../../lib/cx";

type SelectFieldProps = {
  /** The field's name: a visible `<label for>` above the field, which names the select. The Webflow TEMPLATE also binds the Label prop to an `aria-label` (the one documented difference); a plain field doesn't need it. */
  label?: string;
  /** Webflow's ID prop (the select's `id`, which the label's `for` points at). Default `field-` + the lowercase name. */
  id?: string;
  /** The plain select's Name setting on Webflow (also Data Name), the key of the submitted value. Per use. */
  name: string;
  /** The first option, with an empty value: shown until the visitor picks one. */
  placeholder?: string;
  /**
   * The options, per use. On Webflow they are the plain select's Options setting (a list of value +
   * label), which can't be bound to a prop: each form's select is an unlinked, plain field with its own list.
   */
  options: { value: string; label: string }[];
  required?: boolean;
  disabled?: boolean;
  /** Medium is 40px, large 48px. */
  size?: "medium" | "large";
};

/**
 * UI / Select Field (Figma Date field, FormBody 5985:3085). Built like `UI / Input Field`:
 * `fk-input-container` > `fk-input-field-label` (a real `<label for>`, which does name a
 * `<select>`) > `fk-input-field` holding Webflow's native Form Select (`w-select` next to
 * `fk-input-field-input fk-input-field-select`) and the chevron-down icon. The native popup lists the
 * options, so no script is needed. Place it inside a form (Webflow's Form Block).
 *
 * Roadmap D-67: on Webflow `UI / Select Field` is a TEMPLATE component (a Form Select's Name and options
 * can't be bound or varied per instance) for Designer use: place it, unlink it, set Name and options. The
 * template carries example options (Select one..., Option 1 to 3). Agents don't place and unlink it: they
 * build each form's select as plain elements, using the template only as a reference for structure and
 * classes. Each use of this helper in React is one plain-markup select per form on Webflow, never a
 * linked instance. The chevron is part of a select (its only affordance), so it is always rendered.
 */
export default function SelectField({
  label = "Select",
  id,
  name,
  placeholder = "Select one...",
  options,
  required = false,
  disabled = false,
  size = "medium",
}: SelectFieldProps) {
  const selectId = id || `field-${name.toLowerCase()}`;

  return (
    <div className="fk-input-container">
      <label className="fk-input-field-label" htmlFor={selectId}>
        {label}
      </label>
      <div className={cx("fk-input-field", size === "large" && "is-large", disabled && "is-disabled")}>
        <select
          className={cx("fk-input-field-input fk-input-field-select w-select", disabled && "is-disabled")}
          id={selectId}
          name={name}
          data-name={name}
          required={required}
          disabled={disabled}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <img className="fk-input-field-icon" src={chevronDown} alt="" width={20} height={20} />
      </div>
    </div>
  );
}
