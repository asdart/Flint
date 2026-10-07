import { CANDIDATES, RING_IMAGE_SIZE } from "../content/portraits";
import Button from "../components/ui/Button";

/**
 * The 12 ring slots, clockwise from the top (Figma 5543:931), filled with the Home hero's 10 portraits
 * (`CANDIDATES`, indexes into that list). Two portraits repeat, each 6 slots (half a turn) from its first
 * slot (Kwame at 4 and 10, Emeka at 5 and 11), and the slots the phone crop shows (1, 2, 6, 7, 8, 12) are all different.
 */
const SLOTS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 9];

/**
 * Hover tooltip copy per slot, "role, location" (the legacy hero's `ORBIT_PEOPLE` list by slot). Placeholder copy
 * (D-38): the client replaces it. The name and flag are the slot's portrait; slot 3 is Clara (Kenya flag).
 */
const SLOT_ROLES = [
  "RN, Minnesota",
  "ER RN, Texas",
  "CNA, North Dakota",
  "LPN, North Dakota",
  "ICU RN, Ohio",
  "Oncology RN, Georgia",
  "OR RN, Michigan",
  "CNA, South Dakota",
  "L&D RN, Florida",
  "Cardiac RN, Colorado",
  "CCRN, Illinois",
  "NICU RN, Washington",
];

/**
 * Section / Candidates Hero (Figma 5543:916, phone 5763:2667). Page-level markup (D-17: only Candidates has
 * a ring hero): a variant of Section / Hero can't swap the arc wheel for a ring. The panel centres a square
 * stage; the 12 avatars sit on it at their resting positions and the header is centred
 * on top. The orbit motion is `x-illustrations`: it moves `.fk-orbit-item`s, scales their `-avatar` on hover and shows their `fk-chip is-tooltip`.
 */
export default function CandidatesHero() {
  return (
    <section className="fk-section">
      <div className="fk-panel fk-bg-brand-light is-orbit fk-flex fk-justify-center">
        <div className="fk-orbit fk-relative fk-shrink-0 fk-flex fk-items-center fk-justify-center" data-x-illustration="orbit">
          {SLOTS.map((slot, index) => {
            const candidate = CANDIDATES[slot];
            const clara = index === 2;
            return (
              <div className={`fk-orbit-item fk-absolute is-a${index + 1}`} aria-hidden="true" key={index}>
                <div className="fk-relative fk-w-full fk-h-full fk-rounded-full fk-bg-sand-100 fk-overflow-clip" data-x-part="avatar">
                  <img className="fk-orbit-image fk-absolute fk-block fk-w-full fk-h-full fk-object-cover" src={candidate.ring} alt="" width={RING_IMAGE_SIZE[0]} height={RING_IMAGE_SIZE[1]} />
                </div>
                <div className="fk-chip is-tooltip fk-absolute fk-rounded-lg fk-bg-white fk-shadow-chip" data-x-part="tooltip">
                  <img className="fk-flag" src={clara ? "/assets/flags/ke.svg" : candidate.flag} alt="" width={20} height={20} />
                  <p className="fk-text-sm fk-font-medium fk-color-ink">{clara ? "Clara" : candidate.name}</p>
                  <span className="fk-chip-divider fk-shrink-0 fk-self-center" />
                  <p className="fk-text-sm fk-font-medium fk-color-subtle">{SLOT_ROLES[index]}</p>
                </div>
              </div>
            );
          })}
          <div className="fk-container is-inset fk-relative">
            <div className="fk-section-header is-center is-tight" data-ix="blur-reveal-hero">
              <div className="fk-blur-reveal">
                <h1 className="fk-heading-xl">Find the right sponsored healthcare role for you</h1>
              </div>
              <div className="fk-blur-reveal is-delay-1">
                <p className="fk-text-lg fk-color-subtle-80">
                  Flint helps healthcare professionals on temporary status find sponsored healthcare jobs.
                </p>
              </div>
              <div className="fk-blur-reveal is-delay-2">
                <div className="fk-section-header-action">
                  <Button link="https://web.withflint.com/apply" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
