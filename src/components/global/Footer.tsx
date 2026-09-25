import { Fragment } from "react";
import SmartLink from "../../lib/SmartLink";
import Button from "../ui/Button";

// Links marked "#" have no destination yet (roadmap backlog).
const LINK_GROUPS = [
  {
    title: "Institutional",
    links: [
      { label: "For nurses", href: "/" },
      { label: "For facilities", href: "/candidates" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Webinars", href: "#" },
      { label: "About us", href: "/about" },
      { label: "Brand", href: "#" },
      { label: "Careers", href: "#" },
    ],
  },
  {
    title: "Social",
    links: [
      { label: "Instagram", href: "#" },
      { label: "LinkedIn", href: "#" },
      { label: "TikTok", href: "#" },
      { label: "Facebook", href: "#" },
      { label: "X", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Cookie settings", href: "#" },
    ],
  },
] as const;

type FooterProps = {
  /** Multiline text prop in Webflow: line breaks render as <br>. */
  ctaTitle?: string;
  ctaBody?: string;
};

/** Global / Footer. */
export default function Footer({
  ctaTitle = "It’s time to find your\ngreen card sponsor.",
  ctaBody = "Apply now, it is free.",
}: FooterProps) {
  const titleLines = ctaTitle.split("\n");

  return (
    <footer className="fk-footer">
      <div className="fk-footer-panel">
        <div className="fk-footer-cta">
          <div className="fk-footer-cta-text" data-ix="reveal">
            <p className="fk-heading-xl is-inverse">
              {titleLines.map((line, index) => (
                <Fragment key={line}>
                  {index > 0 ? <br /> : null}
                  {line}
                </Fragment>
              ))}
            </p>
            <p className="fk-text-lg is-inverse-muted">{ctaBody}</p>
          </div>
          <Button variant="secondary" />
        </div>

        <hr className="fk-divider" />

        <div className="fk-footer-groups">
          {LINK_GROUPS.map((group) => (
            <div key={group.title} className="fk-footer-group" data-ix="reveal">
              <p className="fk-footer-group-title">{group.title}</p>
              <div className="fk-footer-links">
                {group.links.map((link) => (
                  <SmartLink key={link.label} href={link.href} className="fk-footer-link">
                    {link.label}
                  </SmartLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        <hr className="fk-divider" />

        <div className="fk-footer-bottom">
          <SmartLink href="/" className="fk-footer-logo">
            <img src="/assets/wordmark-white.svg" alt="Flint" width={49} height={24} />
          </SmartLink>
          <p className="fk-text-md is-inverse-muted">© 2026 Flint. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
