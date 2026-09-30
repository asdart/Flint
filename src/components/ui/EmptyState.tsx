import type { ReactNode } from "react";
import Button from "./Button";

type EmptyStateProps = {
  title: string;
  body: string;
  /** Secondary button under the copy. Omitted where the section already has its own button. */
  button?: { label: string; link: string };
};

/**
 * Empty state of a Collection List (roadmap P-20, D-32). Mirrors Webflow: the list wrapper holds the
 * list and a `w-dyn-empty` sibling (Webflow's Empty State, here `DynamoEmpty`) whose one Block is the
 * container. A markup pattern (like Carousel Dots), not a Webflow component, because the same four elements are written by hand into each list's
 * Empty State in the Designer. Shown only when the list is empty. The title is an `h3`: the section
 * title above the list is an `h2` (rule 10); the eyebrow is a `p`.
 */
export default function EmptyState({ title, body, button }: EmptyStateProps): ReactNode {
  return (
    <div className="w-dyn-empty">
      <div className="fk-section-header is-center is-narrow">
        <p className="fk-eyebrow">Coming soon</p>
        <h3 className="fk-heading-md">{title}</h3>
        <p className="fk-text-lg fk-color-subtle">{body}</p>
        {button ? <Button label={button.label} link={button.link} variant="secondary" /> : null}
      </div>
    </div>
  );
}
