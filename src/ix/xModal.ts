/*
 * Exception x-modal (docs/webflow/interactions.md): the one shared modal script. Plain DOM, no
 * dependency; it is the single source of the shipped code: `node scripts/build-x-modal.mjs`
 * minifies it into docs/webflow/custom-code/x-modal.html, and the local preview runs the same module.
 *
 * Markup contract (the markup is plain elements, the look is classes, this only drives behaviour):
 *   [data-x-modal="<id>"]     the dialog root (`fk-modal`; also `id`, role="dialog", aria-modal,
 *                             aria-labelledby). The script toggles `is-modal-open` on it
 *   [data-x-modal-open="<id>"] any button or `<a href="#<id>">` that opens it. The script sets
 *                             aria-haspopup, aria-controls and aria-expanded on it
 *   a[href="#<id>"]           also an opener, with no attribute, when `#<id>` is a [data-x-modal] (a Webflow
 *                             Button instance sets its link but can't take a custom attribute)
 *   [data-x-modal-close]      anything inside a modal that closes it. A click on the root itself
 *                             (the backdrop, outside the panel) closes too
 *
 * Open: lock page scroll (`fk-modal-lock` on html and body, body padding for the scrollbar width, so
 * the page doesn't shift), focus the dialog. Tab and Shift+Tab cycle inside it, Esc closes, and
 * closing returns focus to the trigger (or, if that trigger has tabindex="-1", to a keyboard-reachable trigger
 * of the same modal). Not `inert`: the modal may sit inside a section, and inerting
 * the page would need the ancestors walked, so the trap and aria-modal do it. Markup rule: put the
 * modal where no ancestor has a transform (a reveal wrapper would become its containing block).
 * The fade and rise are CSS on `is-modal-open`, toggled on the root and on its `fk-modal-panel` (a Webflow
 * combo class styles only its own element, never a descendant, so each part carries the combo);
 * under reduced motion the exception's CSS
 * (x-modal.css) removes them.
 */

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
const OPEN = "[data-x-modal-open]";
const LINK = 'a[href^="#"]';
const idOf = (el: HTMLElement) => el.dataset.xModalOpen ?? el.getAttribute("href")?.slice(1) ?? "";
const modalOf = (id: string) => document.querySelector<HTMLElement>(`[data-x-modal="${id}"]`);

export function xModal(): () => void {
  const html = document.documentElement;
  const body = document.body;
  let modal: HTMLElement | null = null;
  let trigger: HTMLElement | null = null;

  const lock = (on: boolean) => {
    body.style.paddingRight = on ? `${window.innerWidth - html.clientWidth}px` : "";
    html.classList.toggle("fk-modal-lock", on);
    body.classList.toggle("fk-modal-lock", on);
  };

  const toggle = (root: HTMLElement, on: boolean) => {
    root.classList.toggle("is-modal-open", on);
    root.querySelector(".fk-modal-panel")?.classList.toggle("is-modal-open", on);
  };

  const close = (restoreFocus = true) => {
    if (!modal) return;
    toggle(modal, false);
    lock(false);
    trigger?.setAttribute("aria-expanded", "false");
    if (restoreFocus) trigger?.focus();
    modal = trigger = null;
  };

  const onClick = (event: MouseEvent) => {
    const target = event.target as Element;
    const link = target.closest<HTMLElement>(LINK);
    const opener = target.closest<HTMLElement>(OPEN) || (link && modalOf(idOf(link)) ? link : null);
    if (opener) {
      const next = modalOf(idOf(opener));
      if (!next) return;
      event.preventDefault();
      if (modal) return;
      modal = next;
      // Focus returns to this trigger on close. A trigger kept out of the tab order (a duplicate, e.g. a card
      // photo next to its "Read more") hands that over to a keyboard-reachable trigger of the same modal.
      trigger =
        opener.tabIndex < 0
          ? Array.from(document.querySelectorAll<HTMLElement>(`${OPEN},${LINK}`)).filter((el) => idOf(el) === idOf(opener)).find((el) => el.tabIndex >= 0) || opener
          : opener;
      lock(true);
      toggle(next, true);
      trigger.setAttribute("aria-expanded", "true");
      next.tabIndex = -1;
      next.focus();
    } else if (modal && (target === modal || target.closest("[data-x-modal-close]"))) {
      close();
    }
  };

  const onKey = (event: KeyboardEvent) => {
    if (!modal) return;
    if (event.key === "Escape") return close();
    if (event.key !== "Tab") return;
    const items = Array.from(modal.querySelectorAll<HTMLElement>(FOCUSABLE));
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    const wrap = (event.shiftKey ? active === first || active === modal : active === last) || !modal.contains(active);
    if (!first || wrap) {
      event.preventDefault();
      (event.shiftKey ? last : first)?.focus();
    }
  };

  document.querySelectorAll<HTMLElement>(`${OPEN},${LINK}`).forEach((element) => {
    if (!element.dataset.xModalOpen && !modalOf(idOf(element))) return;
    element.setAttribute("aria-haspopup", "dialog");
    element.setAttribute("aria-controls", idOf(element));
    element.setAttribute("aria-expanded", "false");
  });
  document.addEventListener("click", onClick);
  document.addEventListener("keydown", onKey);

  return () => {
    document.removeEventListener("click", onClick);
    document.removeEventListener("keydown", onKey);
    close(false);
  };
}
