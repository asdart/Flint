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
 *   iframe[data-src]          an iframe inside the modal that ships with `data-src` and no `src` (a third-party
 *                             embed): the first time its modal opens, `data-src` is copied to `src`, so the embed
 *                             (and its fonts) load on first open, not on page view. Keep a `title` on it
 *
 * Open: lock page scroll (`fk-modal-lock` on html and body, body padding for the scrollbar width, so
 * the page doesn't shift), focus the dialog. Tab and Shift+Tab cycle inside it, Esc closes, and
 * closing returns focus to the trigger (or, if that trigger has tabindex="-1", to a keyboard-reachable trigger
 * of the same modal). An iframe is a tab stop: Tab enters it natively, the parent can't see keys typed inside it,
 * so when focus leaves the modal (Tab past the embed's last control) a focusin guard returns it to the first
 * control. Not `inert`: the modal may sit inside a section, and inerting
 * the page would need the ancestors walked, so the trap and aria-modal do it. Markup rule: put the
 * modal where no ancestor has a transform (a reveal wrapper would become its containing block).
 * The fade and rise are CSS on `is-modal-open`, toggled on the root and on its `fk-modal-panel` (a Webflow
 * combo class styles only its own element, never a descendant, so each part carries the combo);
 * under reduced motion the exception's CSS
 * (x-modal.css) removes them.
 */

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),iframe,[tabindex]:not([tabindex="-1"])';
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
    const back = trigger;
    modal = trigger = null; // before focusing: the focusin guard must not see the modal as open
    if (restoreFocus) back?.focus();
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
      next.querySelectorAll<HTMLIFrameElement>("iframe[data-src]").forEach((frame) => (frame.src ||= frame.dataset.src!));
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
    const items = [...modal.querySelectorAll<HTMLElement>(FOCUSABLE)];
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    // Forward from a focused iframe: let Tab enter it (wrapping would trap the user outside the embed).
    const wrap = (event.shiftKey ? active === first || active === modal : active === last && last.tagName !== "IFRAME") || !modal.contains(active);
    if (!first || wrap) {
      event.preventDefault();
      (event.shiftKey ? last : first)?.focus();
    }
  };

  // Focus that leaves the modal (Tab out of an iframe's last control) comes back to its first control.
  const onFocusIn = (event: FocusEvent) => {
    if (!modal || modal.contains(event.target as Node)) return;
    modal.querySelector<HTMLElement>(FOCUSABLE)?.focus();
  };

  document.querySelectorAll<HTMLElement>(`${OPEN},${LINK}`).forEach((element) => {
    if (!element.dataset.xModalOpen && !modalOf(idOf(element))) return;
    element.setAttribute("aria-haspopup", "dialog");
    element.setAttribute("aria-controls", idOf(element));
    element.setAttribute("aria-expanded", "false");
  });
  document.addEventListener("click", onClick);
  document.addEventListener("keydown", onKey);
  document.addEventListener("focusin", onFocusIn);

  return () => {
    document.removeEventListener("click", onClick);
    document.removeEventListener("keydown", onKey);
    document.removeEventListener("focusin", onFocusIn);
    close(false);
  };
}
