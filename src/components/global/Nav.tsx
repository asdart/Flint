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

/**
 * Global / Nav (Light). Scroll and menu behavior come from ix-nav-pill and ix-nav-menu
 * (src/ix), not React state, so the markup matches the Webflow build.
 */
export default function Nav() {
  const { pathname } = useLocation();

  return (
    <nav className="fk-nav" aria-label="Main">
      <SmartLink href="/" className="fk-nav-logo">
        <img src="/assets/flint-logo-brand.svg" alt="Flint" width={49} height={24} />
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
          <Button variant="secondary" size="small" />
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
            <Button variant="secondary" fullWidth />
          </div>
        </div>
      </div>
    </nav>
  );
}
