import checkmarkIcon from "../assets/icons/checkmark.svg";
import { cx } from "../lib/cx";

const NOTICES = [
  {
    name: "Yuki Tanaka",
    image: "/assets/candidates/steps/send-yuki.webp",
    size: [240, 320],
    flag: "/assets/flags/cn.svg",
    bg: "fk-bg-sand-100",
    crop: "is-top",
    position: "is-n1",
  },
  {
    name: "Amara Okafor",
    image: "/assets/candidates/steps/send-amara.webp",
    size: [200, 200],
    flag: "/assets/flags/ph.svg",
    bg: "fk-bg-sand-100",
    crop: "",
    position: "is-n2",
  },
  {
    name: "Raj Patel",
    image: "/assets/candidates/steps/send-raj.webp",
    size: [200, 200],
    flag: "/assets/flags/in.svg",
    bg: "fk-bg-peach-100",
    crop: "",
    position: "is-n3",
  },
  {
    name: "Kwame Asante",
    image: "/assets/candidates/steps/send-kwame.webp",
    size: [240, 300],
    flag: "/assets/flags/ng.svg",
    bg: "fk-bg-peach-100",
    crop: "is-face",
    position: "is-n4",
  },
] as const;

const FEES = [
  "Immigration lawyer fees",
  "USCIS filing fees",
  "Green card case preparation",
  "Licensing expenses",
  "Immigration administration",
  "Relocation assistance",
];

/** The six nodes of the case-preparation orbit, clockwise from the top (Figma 5543:995). */
const NODES = [
  { icon: "cp-doc", position: "is-n1", label: "Case preparation" },
  { icon: "cp-topright", position: "is-n2", label: "Legal filing" },
  { icon: "cp-bottomright", position: "is-n3", label: "USCIS filing" },
  { icon: "cp-bottom", position: "is-n4", label: "Relocation" },
  { icon: "cp-bottomleft", position: "is-n5", label: "Visa processing" },
  { icon: "cp-topleft", position: "is-n6", label: "Licensing" },
] as const;

type StepProps = {
  number?: string;
  title: string;
  body: string;
  reverse?: boolean;
  bullets?: string[];
  children: React.ReactNode;
};

function Step({ number, title, body, reverse, bullets, children }: StepProps) {
  return (
    <div className={cx("fk-split fk-items-center fk-justify-end fk-gap-24 fk-gap-10-tablet fk-w-full", reverse && "is-reverse")} data-ix="reveal">
      <div className="fk-split-copy fk-gap-2">
        <h3 className="fk-heading-md fk-flex">
          {number ? <span className="fk-steps-number fk-shrink-0">{number}</span> : null}
          <span>{title}</span>
        </h3>
        <p className="fk-text-lg fk-color-subtle">{body}</p>
        {bullets ? (
          <div className="fk-pt-4">
            <ul className="fk-list-none fk-flex fk-flex-col fk-gap-3">
              {bullets.map((bullet, index) => (
                <li className="fk-flex fk-items-center fk-gap-3" key={`${bullet}-${index}`}>
                  <span className="fk-icon-badge is-sm fk-bg-brand-light">
                    <img className="fk-icon is-sm" src={checkmarkIcon} alt="" width={16} height={16} loading="lazy" />
                  </span>
                  <p className="fk-text-md">{bullet}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
      {children}
    </div>
  );
}

/**
 * Section / How It Works, Candidates: five alternating text / art rows (Figma 5543:978). Page-level markup (D-17),
 * not the Home carousel. Each art panel is the final frame of a legacy illustration, built from real elements
 * so `x-illustrations` can animate the parts that moved there (`data-x-illustration` names the panel,
 * `data-x-part` the pieces). Bullets are placeholder copy until the client supplies it (D-38).
 */
export default function CandidatesHowItWorks() {
  return (
    <section className="fk-section">
      <div className="fk-panel fk-bg-white">
        <div className="fk-container">
          <div className="fk-panel-content">
            <div className="fk-section-header is-center is-narrow" data-ix="blur-reveal">
              <div className="fk-blur-reveal">
                <h2 className="fk-heading-xl">How Flint works</h2>
              </div>
              <div className="fk-blur-reveal is-delay-1">
                <p className="fk-text-lg fk-color-brand-80">
                  See how Flint matches you with facilities, covers cost, and gets you to permanent residency.
                </p>
              </div>
            </div>

            <Step
              number="1."
              title="Apply in under one minute."
              body={"We’ll reach out directly by calling or texting to learn more about you, your role, and your unique immigration situation."}
              bullets={["Bullet", "Bullet"]}
            >
              <div className="fk-steps-art fk-relative fk-shrink-0 fk-rounded-2xl fk-overflow-clip fk-bg-brand-light" data-x-illustration="send" aria-hidden="true">
                <div className="fk-steps-canvas fk-absolute">
                  <div className="fk-steps-stack fk-absolute">
                    {NOTICES.map((notice) => (
                      <div className={cx("fk-steps-notice fk-absolute fk-rounded-xl fk-bg-white fk-shadow-float", notice.position)} data-x-part="notice" key={notice.name}>
                        <div className="fk-steps-notice-avatar fk-relative fk-shrink-0">
                          <div className={cx("fk-steps-notice-photo fk-relative fk-rounded-full fk-overflow-clip", notice.bg)}>
                            <img
                              className={cx("fk-steps-notice-image fk-absolute fk-block fk-object-cover", notice.crop)}
                              src={notice.image}
                              alt=""
                              width={notice.size[0]}
                              height={notice.size[1]}
                              loading="lazy"
                            />
                          </div>
                          <img className="fk-flag is-ring fk-steps-notice-flag fk-absolute" src={notice.flag} alt="" width={12} height={12} loading="lazy" />
                        </div>
                        <div className="fk-steps-notice-text fk-flex fk-flex-col fk-justify-center fk-min-w-0">
                          <p className="fk-text-sm fk-color-ink">{notice.name}</p>
                          <p className="fk-text-sm fk-color-ink-60">Applications sent</p>
                        </div>
                        <div className="fk-steps-notice-action fk-flex fk-shrink-0 fk-items-center fk-justify-center fk-rounded-full fk-bg-brand-light">
                          <img className="fk-steps-notice-action-icon fk-block" src="/assets/how-flint-works/ic-send.svg" alt="" width={14} height={15} loading="lazy" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Step>

            <Step
              number="2."
              title="Interview directly with Facilities"
              body={"We’ll connect you directly with facilities ready to sponsor your green card, so you can ask questions and find the right facility for you."}
              reverse
            >
              <div className="fk-steps-art fk-relative fk-shrink-0 fk-rounded-2xl fk-overflow-clip fk-bg-tertiary" data-x-illustration="interview" aria-hidden="true">
                <div className="fk-ring is-panel-right">
                  <img className="fk-ring-image is-rotated" src="/assets/home/cta-flower.webp" alt="" width={1672} height={941} loading="lazy" />
                </div>
                <div className="fk-steps-canvas fk-absolute">
                  <div className="fk-steps-call fk-absolute" data-x-part="call">
                    <div className="fk-steps-window fk-absolute fk-rounded-lg fk-overflow-clip">
                      <img className="fk-steps-call-photo fk-absolute fk-block fk-rounded-md fk-object-cover" src="/assets/candidates/steps/call-main.webp" alt="" width={924} height={520} loading="lazy" />
                      <p className="fk-steps-call-name fk-absolute fk-rounded-full fk-color-white">Cristine</p>
                      <img className="fk-steps-call-people fk-absolute fk-block" src="/assets/how-flint-works/ic-people.svg" alt="" width={16} height={16} loading="lazy" />
                      <div className="fk-steps-call-controls fk-absolute fk-flex fk-items-center">
                        {[
                          ["ic-participants", "is-camera"],
                          ["ic-video", "is-mic"],
                          ["ic-mic", "is-dots"],
                        ].map(([icon, shape]) => (
                          <img className={cx("fk-steps-call-control fk-block fk-shrink-0", shape)} data-x-part="control" src={`/assets/how-flint-works/${icon}.svg`} alt="" width={16} height={16} loading="lazy" key={icon} />
                        ))}
                        <img className="fk-steps-call-end fk-block" data-x-part="control" src="/assets/candidates/steps/call-end.svg" alt="" width={24} height={24} loading="lazy" />
                      </div>
                    </div>
                    <img className="fk-steps-call-pip fk-absolute fk-block fk-rounded-md fk-object-cover" data-x-part="pip" src="/assets/candidates/steps/call-pip.webp" alt="" width={420} height={236} loading="lazy" />
                  </div>
                </div>
              </div>
            </Step>

            <Step
              number="3."
              title="Save thousands on immigration fees"
              body="After you're hired, we cover all licensing and immigration costs for you. We even provide a relocation bonus."
            >
              <div className="fk-steps-art fk-relative fk-shrink-0 fk-rounded-2xl fk-overflow-clip fk-bg-brand-light" data-x-illustration="fees">
                <div className="fk-ring is-panel-left" aria-hidden="true">
                  <img className="fk-ring-image is-rotated" src="/assets/home/cta-flower.webp" alt="" width={1672} height={941} loading="lazy" />
                </div>
                <div className="fk-steps-canvas fk-absolute">
                  <div className="fk-steps-fees fk-absolute">
                    <div className="fk-steps-back is-n1 fk-absolute fk-bg-white" data-x-part="back" aria-hidden="true" />
                    <div className="fk-steps-back is-n2 fk-absolute fk-bg-white" data-x-part="back" aria-hidden="true" />
                    <ul className="fk-steps-fees-card fk-absolute fk-flex fk-flex-col fk-gap-3 fk-rounded-2xl fk-bg-white" data-x-part="card">
                      {FEES.map((fee) => (
                        <li className="fk-flex fk-items-center fk-gap-3" data-x-part="fee" key={fee}>
                          <img className="fk-steps-fees-icon fk-block fk-shrink-0" src="/assets/candidates/steps/check-circle.svg" alt="" width={32} height={32} loading="lazy" />
                          <p className="fk-text-md fk-color-ink">{fee}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Step>

            <Step
              title="Work while your green card processes"
              body="Once you start working, you'll earn your full salary while we process your green card. No hidden fees or deductions."
              reverse
            >
              <div className="fk-steps-art fk-relative fk-shrink-0 fk-rounded-2xl fk-overflow-clip fk-bg-tertiary" data-x-illustration="case-prep" aria-hidden="true">
                <div className="fk-steps-canvas fk-absolute">
                  <img className="fk-steps-orbit-ring fk-absolute fk-block" data-x-part="ring" src="/assets/candidates/steps/orbit-ring.svg" alt="" width={296} height={296} loading="lazy" />
                  <img className="fk-steps-orbit-ring is-progress fk-absolute fk-block" data-x-part="progress" src="/assets/candidates/steps/orbit-progress.svg" alt="" width={296} height={296} loading="lazy" />
                  <div className="fk-steps-orbit-avatar fk-absolute fk-rounded-full fk-bg-sand-100 fk-overflow-clip" data-x-part="avatar">
                    <img className="fk-steps-orbit-avatar-image fk-absolute fk-block fk-object-cover" src="/assets/candidates/steps/orbit-avatar.webp" alt="" width={460} height={613} loading="lazy" />
                  </div>
                  {NODES.map((node, index) => (
                    <div className={cx("fk-steps-orbit-node fk-absolute fk-flex fk-items-center fk-justify-center fk-rounded-full fk-bg-tertiary", node.position)} data-x-part="node" data-x-label={node.label} key={node.icon}>
                      <img className="fk-steps-orbit-node-ring fk-absolute fk-block" src="/assets/candidates/steps/orbit-node-ring.svg" alt="" width={72} height={72} loading="lazy" />
                      <img
                        className={cx("fk-steps-orbit-node-ring is-progress fk-absolute fk-block", index === 0 && "is-on")}
                        data-x-part="arc"
                        src="/assets/candidates/steps/orbit-node-ring-active.svg"
                        alt=""
                        width={72}
                        height={72}
                        loading="lazy"
                      />
                      <div className="fk-steps-orbit-node-face fk-relative fk-flex fk-items-center fk-justify-center fk-rounded-full fk-bg-white">
                        <img className="fk-icon" src={`/assets/how-flint-works/${node.icon}.svg`} alt="" width={24} height={24} loading="lazy" />
                      </div>
                    </div>
                  ))}
                  <p className="fk-steps-orbit-label fk-absolute fk-text-xs fk-text-center fk-color-ink" data-x-part="label">
                    Case preparation
                  </p>
                </div>
              </div>
            </Step>

            <Step
              title="Find permanent stability in the US"
              body="After you earn your green card, what you do and where you go next is up to you."
            >
              <div className="fk-steps-art fk-relative fk-shrink-0 fk-rounded-2xl fk-overflow-clip fk-bg-brand-light" data-x-illustration="portrait">
                <img
                  className="fk-steps-photo fk-absolute fk-block fk-object-cover"
                  src="/assets/candidates/steps/portrait.webp"
                  alt="Fabiana, a registered nurse, smiling with her arms crossed in a hospital corridor"
                  width={1400}
                  height={1900}
                  loading="lazy"
                />
                <div className="fk-chip is-portrait fk-absolute fk-rounded-lg fk-bg-white fk-shadow-chip">
                  <img className="fk-flag" src="/assets/flags/mx.svg" alt="" width={20} height={20} loading="lazy" />
                  <p className="fk-text-sm fk-font-medium fk-color-ink">Fabiana</p>
                  <span className="fk-chip-divider fk-shrink-0 fk-self-center" />
                  <p className="fk-text-sm fk-font-medium fk-color-subtle">RN, Maplewood</p>
                </div>
              </div>
            </Step>
          </div>
        </div>
      </div>
    </section>
  );
}
