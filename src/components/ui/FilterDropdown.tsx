import type { ReactNode } from "react";
import chevronDown from "../../assets/icons/chevron-down.svg";
import { cx } from "../../lib/cx";

type FilterDropdownProps = {
  /** The toggle's text: the placeholder, or the chosen option. It is also the toggle's accessible name. */
  label?: string;
  /** Turns the label into the chosen value's look (ink, opaque) instead of the placeholder look. */
  selected?: boolean;
  /** Accessible name of the options list (Webflow: the Dropdown List's label). */
  menuLabel?: string;
  /** Medium is 40px, large 48px (the input field sizes). */
  size?: "medium" | "large";
  /** Slot: the `fk-filter-dropdown-link` links (a Collection List or static links). */
  children: ReactNode;
};

/**
 * UI / Filter Dropdown (renamed from `UI / Dropdown`, 2026-10-11). A menu of links, not a form field:
 * Webflow's native Dropdown element (`w-dropdown*` classes on the wrapper, toggle and list next to the
 * `fk-*` ones; the links are plain `fk-filter-dropdown-link`; the toggle takes the input field look,
 * `fk-input-field is-select`). Webflow does open/close, the preview's src/ix/dropdown.ts stands in for
 * it. No label above it: the toggle's text names it. For a form's select use `UI / Select Field`.
 * The options are a slot because a component can't hold a bound Collection List.
 */
export default function FilterDropdown({ label = "All", selected = false, menuLabel = "Options", size = "medium", children }: FilterDropdownProps) {
  return (
    <div className="fk-filter-dropdown w-dropdown">
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
      <nav className="fk-filter-dropdown-list w-dropdown-list" aria-label={menuLabel}>
        <div>{children}</div>
      </nav>
    </div>
  );
}
