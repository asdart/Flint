/*
 * ix-faq-toggle preview: a click on `.fk-faq-question` toggles `is-faq-open` on the parts of its
 * `.fk-faq-item` that change (question text, icon circle, plus, minus, answer). On Webflow the
 * interaction toggles the same combo on the same targets; the classes' transitions do the animating.
 * The preview also keeps `aria-expanded` in step. IX3 can't set an attribute, so on Webflow it stays
 * as built (the closed answer is `visibility: hidden`, so assistive tech never reads a collapsed one).
 */

type Cleanup = () => void;

const PARTS = [
  ".fk-faq-question-text",
  ".fk-faq-icon",
  ".fk-faq-icon-plus",
  ".fk-faq-icon-minus",
  ".fk-faq-answer",
];

export function faqToggle(): Cleanup {
  const onClick = (event: MouseEvent) => {
    const question = (event.target as Element).closest<HTMLElement>(".fk-faq-question");
    const item = question?.closest<HTMLElement>(".fk-faq-item");
    if (!question || !item) return;

    const open = !item.querySelector(".fk-faq-answer")?.classList.contains("is-faq-open");
    PARTS.forEach((selector) => item.querySelector(selector)?.classList.toggle("is-faq-open", open));
    question.setAttribute("aria-expanded", String(open));
  };

  document.addEventListener("click", onClick);
  return () => document.removeEventListener("click", onClick);
}
