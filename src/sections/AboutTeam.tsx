import Modal from "../components/ui/Modal";

/**
 * PLACEHOLDER BIO (user decision, 2026-10-01): Kenton's bio from Figma node 5985:2970 is used for all three
 * founders until the client sends the other two. Replace `BIO` (or give each founder its own `bio`) then.
 */
const BIO =
  "Kenton Jarvie didn't set out to build a company — he set out to solve a problem he couldn't stop thinking about. Growing up, he watched his mother immigrate from South Africa to the United States and navigate the grueling, opaque process of building a career in a new country. That experience left a mark. Years later, as he met healthcare workers from around the world — nurses, doctors, specialists — he kept hearing the same story: talented professionals desperate to work in the U.S., trapped in a system that seemed designed to keep them out. In 2024, Kenton co-founded Flint with Anson Kung and Neil Prigge, bringing together their shared frustration into something actionable. As CEO, Kenton leads with a simple belief: the world's best healthcare workers shouldn't be held back by paperwork, bureaucracy, or broken systems. Under his leadership, Flint is building the infrastructure to match international healthcare talent with the American hospitals that need them — faster, more transparently, and more humanely than ever before.";

const FOUNDERS = [
  { id: "kenton", name: "Kenton Jarvie", role: "CEO, Co-Founder", image: "team-kenton", size: [711, 711], bio: BIO },
  { id: "anson", name: "Anson Kung", role: "COO, Co-Founder", image: "team-anson", size: [711, 711], bio: BIO },
  { id: "neil", name: "Neil Prigge", role: "VP Operations, Co-Founder", image: "team-neil", size: [711, 888], bio: BIO },
] as const;

/**
 * Team on About (Figma 5805:4114, phone 5974:7579). Page-level markup (D-17, user decision 2026-10-01: not a component). The header
 * copy is Figma's, which repeats the Investors header (known content issue, user decision: keep it). A card's photo
 * and its "Read more" both open that founder's modal (exception x-modal): the photo link is
 * out of the tab order and hidden from assistive tech so each card has one tab stop, "Read more about <name>".
 * The three `Modal`s are in `AboutTeamModals`: a modal is `position: fixed`, so it must have no transformed ancestor
 * (the revealed cards are animated), and the page renders it after the footer.
 */
export default function AboutTeam() {
  return (
    <section className="fk-section">
      <div className="fk-panel is-relaxed">
        <div className="fk-container">
          <div className="fk-flex fk-flex-col fk-gap-16 fk-gap-12-mobile">
            <div className="fk-section-header is-center is-narrow" data-ix="blur-reveal">
              <div className="fk-blur-reveal">
                <p className="fk-eyebrow">What makes Flint different</p>
              </div>
              <div className="fk-blur-reveal is-delay-1">
                <h2 className="fk-heading-xl">Backed by the best</h2>
              </div>
              <div className="fk-blur-reveal is-delay-2">
                <p className="fk-text-lg fk-color-brand-80">
                  Investors who saw the same gap we did: a healthcare system in crisis, and a global workforce ready to
                  fill it, if only someone built the bridge.
                </p>
              </div>
            </div>
            <div className="fk-grid fk-cols-3 fk-cols-1-mobile fk-gap-4 fk-gap-8-mobile fk-w-full" data-ix="reveal-stagger">
              {FOUNDERS.map((founder) => (
                <article key={founder.id} className="fk-flex fk-flex-col fk-gap-4" data-ix-item>
                  <a
                    className="fk-team-photo fk-rounded-lg fk-overflow-hidden"
                    href={`#bio-${founder.id}`}
                    data-x-modal-open={`bio-${founder.id}`}
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    <img
                      className="fk-team-image"
                      src={`/assets/about/${founder.image}.webp`}
                      alt=""
                      width={founder.size[0]}
                      height={founder.size[1]}
                      loading="lazy"
                    />
                  </a>
                  <div className="fk-flex fk-flex-col fk-gap-4">
                    <div className="fk-flex fk-flex-col fk-gap-1">
                      <h3 className="fk-text-lg fk-font-medium fk-color-ink-80">{founder.name}</h3>
                      <p className="fk-text-lg fk-color-subtle">{founder.role}</p>
                    </div>
                    <a className="fk-team-link fk-text-lg" href={`#bio-${founder.id}`} data-x-modal-open={`bio-${founder.id}`}>
                      Read more<span className="fk-sr-only"> about {founder.name}</span>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** One `UI / Modal` per founder (Figma 5985:2725). The name is a `p`, not a heading: it names the dialog (`aria-labelledby`) and is not part of the page outline. */
export function AboutTeamModals() {
  return (
    <>
      {FOUNDERS.map((founder) => (
        <Modal key={founder.id} id={`bio-${founder.id}`} labelledBy={`bio-${founder.id}-title`}>
          <div className="fk-flex fk-flex-col fk-gap-1">
            <p id={`bio-${founder.id}-title`} className="fk-text-lg fk-font-medium fk-color-ink-80">
              {founder.name}
            </p>
            <p className="fk-text-lg fk-color-subtle">{founder.role}</p>
          </div>
          <div className="fk-flex fk-flex-col fk-gap-4">
            <p className="fk-text-lg fk-color-brand-80">{founder.bio}</p>
          </div>
        </Modal>
      ))}
    </>
  );
}
