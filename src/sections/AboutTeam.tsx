import Modal from "../components/ui/Modal";

/** Final founder bios (client copy, 2026-10-19), one string per paragraph; each paragraph is a `p` in the modal. */
const BIOS = {
  kenton: [
    "Kenton\u2019s reason for building Flint starts at home. His wife is a registered nurse, and through her he\u2019s seen what the healthcare labor shortage looks like up close: the extra shifts, the short-staffed units, and the way burnout follows good nurses from one job to the next. He\u2019s watched how one empty position puts pressure on a whole team, and how that pressure eventually reaches patients.",
    "Kenton graduated with honors from business school and has founded several businesses. Flint is the one he\u2019s most personally invested in. What drives him isn\u2019t the business model. It\u2019s the belief that nurses deserve fully staffed, stable teams, and that patients deserve the care that comes with that. Flint is his answer to a problem he\u2019s seen from the kitchen table, not just the boardroom.",
  ],
  anson: [
    "Anson grew up watching proof that Flint\u2019s model works. His mother immigrated from Hong Kong and built a 25-year career as a pediatric registered nurse, caring for thousands of children and their families before she recently retired. He saw firsthand how much an internationally educated nurse can give to our healthcare system.",
    "He also saw how hard it was to get there. Paperwork, delays, and process obstacles too often stand in the way of careers like his mother\u2019s.",
    "An engineer and entrepreneur at heart, Anson was previously CTO of A&K Robotics and served on the board of BC Rehab. He\u2019s always been drawn to solving real-world problems, and this one is personal. At Flint, he leads facility-side operations, working with hospitals and care facilities so that qualified nurses from around the world can spend less time fighting bureaucracy and more time doing the work they trained for.",
  ],
  neil: [
    "Neil was eight when his family left South Africa for a new life abroad. He often says his parents\u2019 decision to make that move is the most meaningful thing anyone has ever done for him. It opened up opportunities he wouldn\u2019t otherwise have had.",
    "He made the most of them. Neil graduated with an engineering degree and found his calling in entrepreneurship: spotting problems that matter, building something to solve them, and doing it again. Flint is the venture closest to his heart.",
    "The move itself wasn\u2019t easy. Starting over in a new country meant real practical challenges that his family had to work through largely on their own. That\u2019s why Flint\u2019s work feels personal to him. Many of the nurses Flint supports are parents making the same brave choice his did, so their children can have the kind of life he\u2019s been given. Neil\u2019s goal is to make the practical side of that journey easier, so families can focus on building their future in the country they\u2019ll come to call home.",
  ],
} as const;

const FOUNDERS = [
  { id: "kenton", name: "Kenton Jarvie", role: "CEO, Co-Founder", image: "team-kenton", size: [711, 711], bio: BIOS.kenton },
  { id: "anson", name: "Anson Kung", role: "COO, Co-Founder", image: "team-anson", size: [711, 711], bio: BIOS.anson },
  { id: "neil", name: "Neil Prigge", role: "VP Operations, Co-Founder", image: "team-neil", size: [711, 888], bio: BIOS.neil },
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
              <div className="fk-blur-reveal is-delay-1">
                <h2 className="fk-heading-xl">Who we are</h2>
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
            {founder.bio.map((paragraph) => (
              <p key={paragraph} className="fk-text-lg fk-color-brand-80">
                {paragraph}
              </p>
            ))}
          </div>
        </Modal>
      ))}
    </>
  );
}
