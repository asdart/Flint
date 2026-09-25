import { cx } from "../../lib/cx";
import SmartLink from "../../lib/SmartLink";

type ButtonProps = {
  label?: string;
  link?: string;
  variant?: "primary" | "secondary";
  size?: "default" | "small";
};

/** UI / Button. In Webflow the Secondary variant hides the icon (display: none). */
export default function Button({
  label = "Apply now",
  link = "#apply",
  variant = "primary",
  size = "default",
}: ButtonProps) {
  return (
    <SmartLink
      href={link}
      className={cx("fk-button", variant === "secondary" && "is-secondary", size === "small" && "is-small")}
    >
      <span>{label}</span>
      {variant === "primary" ? <span className="fk-button-icon" aria-hidden /> : null}
    </SmartLink>
  );
}
