/* Reconstructed from the Figma render: dark purple base, subtle blue tint on
   the left edge fading to a subtle red tint on the right. The raw Figma
   gradient export has out-of-order stops and is not valid CSS. */
const GRADIENT =
  "linear-gradient(100deg, rgb(92, 119, 224) -45%, rgb(68, 55, 109) 30%, rgb(68, 55, 109) 60%, rgb(189, 83, 93) 140%)";

type ApplyButtonProps = {
  variant?: "gradient" | "white";
  children?: React.ReactNode;
  /** When false, skips the staggered reveal wrapper. */
  reveal?: boolean;
};

export default function ApplyButton({
  variant = "gradient",
  children = "Apply now",
  reveal = true,
}: ApplyButtonProps) {
  const button =
    variant === "white" ? (
      <button
        type="button"
        className="relative flex items-center justify-center rounded-[24px] border border-stone-50 bg-white px-[14px] py-[6px] text-[14px] font-medium leading-5 tracking-[-0.028px] text-ink shadow-[inset_0px_-1px_2px_0px_rgba(0,0,0,0.15)] transition-transform hover:scale-[1.03] active:scale-[0.98]"
      >
        {children}
      </button>
    ) : (
      <button
        type="button"
        className="flex items-center justify-center rounded-[24px] px-5 py-2.5 text-[14px] font-medium leading-5 tracking-[-0.028px] text-white transition-transform hover:scale-[1.03] active:scale-[0.98]"
        style={{ backgroundImage: GRADIENT }}
      >
        {children}
      </button>
    );

  if (!reveal) return button;
  return <span data-reveal className="inline-flex">{button}</span>;
}
