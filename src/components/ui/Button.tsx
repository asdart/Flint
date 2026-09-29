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
  /** A form's submit control: Webflow's Submit Button, an `<input type="submit">` whose Value is the label (no icon). */
  submit?: boolean;
  /** Utility classes stacked after the main class, like classes added to an instance in Webflow. */
  className?: string;
};

/** UI / Button. */
export default function Button({
  label = "Apply now",
  link = "#apply",
  variant = "primary",
  size = "default",
  fullWidth = false,
  icon,
  submit = false,
  className,
}: ButtonProps) {
  const classes = cx(
    "fk-button",
    variant === "secondary" && "is-secondary",
    size === "small" && "is-small",
    fullWidth && "is-full",
    className,
  );

  if (submit) {
    return <input type="submit" className={cx(classes, "w-button")} value={label} data-wait="Please wait..." />;
  }

  return (
    <SmartLink href={link} className={classes}>
      <span>{label}</span>
      {icon ? <img className="fk-button-icon" src={icon} alt="" width={20} height={20} /> : null}
    </SmartLink>
  );
}
