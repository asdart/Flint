/*
 * Preview stand-in for Webflow's native Dropdown behavior (not a registered interaction: on the
 * published site webflow.js does this). Click or Enter/Space on `.w-dropdown-toggle` opens the
 * list (`w--open` on the dropdown, toggle and list, `aria-expanded` on the toggle); a click outside,
 * a click on a link or Escape closes it.
 */

type Cleanup = () => void;

const setOpen = (dropdown: Element, open: boolean) => {
  dropdown.classList.toggle("w--open", open);
  dropdown.querySelector(".w-dropdown-toggle")?.classList.toggle("w--open", open);
  dropdown.querySelector(".w-dropdown-toggle")?.setAttribute("aria-expanded", String(open));
  dropdown.querySelector(".w-dropdown-list")?.classList.toggle("w--open", open);
};

const closeAll = (except?: Element | null) =>
  document.querySelectorAll(".w-dropdown.w--open").forEach((dropdown) => {
    if (dropdown !== except) setOpen(dropdown, false);
  });

export function dropdown(): Cleanup {
  const toggle = (target: Element) => {
    const dropdownEl = target.closest(".w-dropdown");
    if (!dropdownEl) return;
    closeAll(dropdownEl);
    setOpen(dropdownEl, !dropdownEl.classList.contains("w--open"));
  };

  const onClick = (event: MouseEvent) => {
    const target = event.target as Element;
    const toggleEl = target.closest(".w-dropdown-toggle");
    if (toggleEl) toggle(toggleEl);
    else closeAll(target.closest(".w-dropdown"));
    if (target.closest(".fk-dropdown-link")) closeAll();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const target = event.target as Element;
    if (event.key === "Escape") {
      closeAll();
      return;
    }
    if ((event.key === "Enter" || event.key === " ") && target.matches(".w-dropdown-toggle")) {
      event.preventDefault();
      toggle(target);
    }
  };

  document.addEventListener("click", onClick);
  document.addEventListener("keydown", onKeyDown);
  return () => {
    document.removeEventListener("click", onClick);
    document.removeEventListener("keydown", onKeyDown);
    closeAll();
  };
}
