import { cx } from "../../lib/cx";
import SmartLink from "../../lib/SmartLink";

type ButtonProps = {
  label?: string;
  link?: string;
  variant?: "primary" | "secondary";
  size?: "default" | "small";
  /** Stretches the button to its container (`is-full`), e.g. in the mobile menu. */
  fullWidth?: boolean;
  /** An SVG from src/assets/icons/, shown after the label. No icon by default. */
  icon?: string;
};

/** UI / Button. */
export default function Button({
  label = "Apply now",
  link = "#apply",
  variant = "primary",
  size = "default",
  fullWidth = false,
  icon,
}: ButtonProps) {
  return (
    <SmartLink
      href={link}
      className={cx(
        "fk-button",
        variant === "secondary" && "is-secondary",
        size === "small" && "is-small",
        fullWidth && "is-full",
      )}
    >
      <span>{label}</span>
      {icon ? <img className="fk-button-icon" src={icon} alt="" width={20} height={20} /> : null}
    </SmartLink>
  );
}
