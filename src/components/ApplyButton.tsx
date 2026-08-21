/* Reconstructed from the Figma render: dark purple base, subtle blue tint on
   the left edge fading to a subtle red tint on the right. The raw Figma
   gradient export has out-of-order stops and is not valid CSS. */
const GRADIENT =
  "linear-gradient(100deg, rgb(92, 119, 224) -45%, rgb(68, 55, 109) 30%, rgb(68, 55, 109) 60%, rgb(189, 83, 93) 140%)";

type ApplyButtonProps = {
  variant?: "gradient" | "white";
  /** "sm" is the compact nav size, "lg" matches the gradient button's padding. */
  size?: "sm" | "lg";
  children?: React.ReactNode;
  /** When false, skips the staggered reveal wrapper. */
  reveal?: boolean;
  type?: "button" | "submit" | "reset";
};

export default function ApplyButton({
  variant = "gradient",
  size = "sm",
  children = "Apply now",
  reveal = true,
  type = "button",
}: ApplyButtonProps) {
  const button =
    variant === "white" ? (
      <button
        type={type}
        className={`relative flex items-center justify-center rounded-[24px] border border-stone-50 bg-white text-[14px] font-medium leading-5 tracking-[-0.028px] text-ink shadow-[inset_0px_-1px_2px_0px_rgba(0,0,0,0.15)] transition-[background-color,transform] duration-300 ease-in-out hover:bg-[#f5f5f5] active:scale-[0.98] ${
          size === "lg" ? "px-5 py-2.5" : "px-[14px] py-[6px]"
        }`}
      >
        {children}
      </button>
    ) : (
      <button
        type={type}
        className="flex items-center justify-center rounded-[24px] px-5 py-2.5 text-[14px] font-medium leading-5 tracking-[-0.028px] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0),0_0_0_0_rgba(68,55,109,0)] [background-position:0%_50%] [background-size:200%_100%] transition-[background-position,box-shadow] duration-700 ease-in-out hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2),0_6px_20px_0_rgba(68,55,109,0.22),0_2px_8px_0_rgba(92,119,224,0.12)] hover:[background-position:100%_50%] active:scale-[0.98]"
        style={{ backgroundImage: GRADIENT }}
      >
        {children}
      </button>
    );

  if (!reveal) return button;
  return <span data-reveal className="inline-flex">{button}</span>;
}
