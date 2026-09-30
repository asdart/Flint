import type { ReactNode } from "react";
import chevronDown from "../../assets/icons/chevron-down.svg";
import { cx } from "../../lib/cx";

type DropdownProps = {
  /** The toggle's text: the placeholder, or the chosen option. */
  label?: string;
  /** Turns the label into the chosen value's look (ink, opaque) instead of the placeholder look. */
  selected?: boolean;
  /** Accessible name of the options list (Webflow: the Dropdown List's label). */
  menuLabel?: string;
  /** Medium is 40px, large 48px (the input field sizes). */
  size?: "medium" | "large";
  /** Slot: the `fk-dropdown-link` links (a Collection List or static links). */
  children: ReactNode;
};

/**
 * UI / Dropdown. Webflow's native Dropdown element (`w-dropdown*` classes on the wrapper, toggle and list next to the `fk-*` ones; the links are plain `fk-dropdown-link`; the toggle is an
 * input field, `fk-input-field is-select`;
 * Webflow does open/close, the preview's src/ix/dropdown.ts stands in for it). The options are a
 * slot because a component can't hold a bound Collection List.
 */
export default function Dropdown({ label = "All", selected = false, menuLabel = "Options", size = "medium", children }: DropdownProps) {
  return (
    <div className="fk-dropdown w-dropdown">
      <div
        className={cx("fk-input-field is-select w-dropdown-toggle", size === "large" && "is-large")}
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded="false"
      >
        <div className={cx("fk-input-field-text", selected && "is-selected")}>{label}</div>
        <img className="fk-input-field-icon" src={chevronDown} alt="" width={20} height={20} />
      </div>
      <nav className="fk-dropdown-list w-dropdown-list" aria-label={menuLabel}>
        <div>{children}</div>
      </nav>
    </div>
  );
}
