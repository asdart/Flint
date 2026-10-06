import type { ReactNode } from "react";
import xMark from "../../assets/icons/x-mark.svg";

type ModalProps = {
  /** Matches `data-x-modal-open="<id>"` on the triggers. Also the element id (aria-controls). */
  id: string;
  /** Id of the element inside that names the dialog (its name or title). */
  labelledBy: string;
  /** Accessible name of the close button. */
  closeLabel?: string;
  /** `compact` adds `is-compact` to the panel and the content (600px card, 40px padding). Default: 713px, 96px. */
  size?: "default" | "compact";
  /** The content slot: anything, laid out in `fk-modal-content` (flex column, gap 32). */
  children: ReactNode;
};

/**
 * UI / Modal. Plain elements; exception `x-modal` (src/ix/xModal.ts) opens and closes it and adds
 * `is-modal-open` to the root. Place it where no ancestor has a transform, e.g. last child of `.fk-page`.
 */
export default function Modal({ id, labelledBy, closeLabel = "Close", size = "default", children }: ModalProps) {
  const compact = size === "compact" ? " is-compact" : "";
  return (
    <div id={id} className="fk-modal" data-x-modal={id} role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
      <div className={`fk-modal-panel${compact}`}>
        <button type="button" className="fk-modal-close" data-x-modal-close aria-label={closeLabel}>
          <img className="fk-modal-close-icon" src={xMark} alt="" width={16} height={16} />
        </button>
        <div className={`fk-modal-content${compact}`}>{children}</div>
      </div>
    </div>
  );
}
