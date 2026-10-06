import { useLocation } from "react-router-dom";
import closeIcon from "../../assets/icons/x-mark.svg";
import menuIcon from "../../assets/icons/menu.svg";
import { cx } from "../../lib/cx";
import SmartLink from "../../lib/SmartLink";
import Button from "../ui/Button";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Candidates", href: "/candidates" },
  { label: "Facility partners", href: "/facility-partners" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
] as const;

type NavProps = {
  /** Light (default) or Dark: white text and wordmark over a dark hero until the bar scrolls into its pill (`is-dark`, exception x-nav-dark). */
  variant?: "light" | "dark";
};

/**
 * Global / Nav (Light, Dark). Scroll and menu behavior come from ix-nav-pill and ix-nav-menu
 * (src/ix), not React state, so the markup matches the Webflow build.
 */
export default function Nav({ variant = "light" }: NavProps) {
  const { pathname } = useLocation();

  return (
    <nav className={cx("fk-nav", variant === "dark" && "is-dark")} aria-label="Main">
      <SmartLink href="/" className="fk-nav-logo">
        <img className="fk-nav-logo-brand" src="/assets/flint-logo-brand.svg" alt="Flint" width={49} height={24} />
        <img className="fk-nav-logo-white" src="/assets/flint-logo-white.svg" alt="" width={49} height={24} />
      </SmartLink>

      <div className="fk-nav-links">
        {LINKS.map((link) => (
          <SmartLink
            key={link.href}
            href={link.href}
            className={cx("fk-nav-link", pathname === link.href && "w--current")}
          >
            {link.label}
          </SmartLink>
        ))}
      </div>

      <div className="fk-nav-actions">
        <div className="fk-hidden-tablet">
          <Button variant="secondary" size="small" link="https://web.withflint.com/apply" />
        </div>
        <button type="button" className="fk-nav-toggle" aria-label="Open menu">
          <img className="fk-icon" src={menuIcon} alt="" width={24} height={24} />
        </button>
      </div>

      <div className="fk-nav-menu">
        <div className="fk-nav-menu-panel">
          <div className="fk-nav-menu-header">
            <SmartLink href="/" className="fk-nav-logo">
              <img src="/assets/flint-logo-brand.svg" alt="Flint" width={49} height={24} />
            </SmartLink>
            <button type="button" className="fk-nav-menu-close" aria-label="Close menu">
              <img className="fk-icon" src={closeIcon} alt="" width={24} height={24} />
            </button>
          </div>
          <div className="fk-nav-menu-links">
            {LINKS.map((link) => (
              <SmartLink
                key={link.href}
                href={link.href}
                className={cx("fk-nav-menu-link", pathname === link.href && "w--current")}
              >
                {link.label}
              </SmartLink>
            ))}
          </div>
          <div className="fk-nav-menu-footer">
            <Button variant="secondary" link="https://web.withflint.com/apply" fullWidth />
          </div>
        </div>
      </div>
    </nav>
  );
}
