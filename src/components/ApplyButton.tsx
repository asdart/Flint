import BlurReveal from "./BlurReveal";

const SHADOW_REST = "shadow-[0px_3px_2px_-2px_rgba(0,0,0,0.25)]";
const SHADOW_HOVER =
  "hover:shadow-[0px_2px_8.4px_-1px_rgba(68,56,109,0.3),0px_3px_2px_-2px_rgba(0,0,0,0.25)]";
const SHADOW_FOCUS =
  "focus-visible:shadow-[0px_0px_0px_2px_#fff,0px_0px_0px_4px_#b8adde] focus-visible:outline-none";

type ApplyButtonProps = {
  variant?: "gradient" | "white";
  /** "sm" is the compact nav size, "lg" matches the gradient button's padding. */
  size?: "sm" | "lg";
  children?: React.ReactNode;
  /** When false, skips the staggered reveal wrapper. */
  reveal?: boolean;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};

export default function ApplyButton({
  variant = "gradient",
  size,
  children = "Apply now",
  reveal = true,
  type = "button",
  disabled = false,
}: ApplyButtonProps) {
  // Gradient CTAs were designed at the large size. Compact padding is only for
  // the white nav chip — or an explicit size="sm" on the scrolled purple pill.
  const compact = (size ?? (variant === "gradient" ? "lg" : "sm")) === "sm";
  const button =
    variant === "white" ? (
      <button
        type={type}
        disabled={disabled}
        className={`relative flex items-center justify-center rounded-[24px] border border-stone-50 bg-white text-[14px] font-medium leading-5 tracking-[-0.028px] text-ink shadow-[inset_0px_-1px_2px_0px_rgba(0,0,0,0.15)] transition-[background-color,transform] duration-300 ease-in-out hover:bg-[#f5f5f5] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${
          compact ? "px-[14px] py-[6px]" : "px-5 py-2.5"
        }`}
      >
        {children}
      </button>
    ) : (
      <button
        type={type}
        disabled={disabled}
        className={`btn-primary-gradient group relative flex items-center justify-center gap-2.5 overflow-clip rounded-[24px] border border-brand text-[14px] font-medium leading-5 tracking-[-0.028px] text-white disabled:cursor-not-allowed disabled:opacity-60 ${SHADOW_REST} ${SHADOW_HOVER} ${SHADOW_FOCUS} active:shadow-none disabled:shadow-none ${
          compact ? "py-[6px] pr-1.5 pl-[14px]" : "py-2.5 pr-2.5 pl-5"
        }`}
      >
        {/* Pressed dims the label and chevron rather than moving the button. */}
        <span className="relative transition-opacity duration-150 ease-out group-active:opacity-60">
          {children}
        </span>
        <span className="relative flex items-center rounded-full bg-white/10 p-1 transition-[background-color,opacity] duration-300 ease-out group-hover:bg-white/30 group-active:opacity-60 group-disabled:bg-white/10">
          <span className="flex size-3 items-center justify-center">
            <img src="/assets/chevron-right-white.svg" alt="" className="h-[7.5px] w-[4.5px]" />
          </span>
        </span>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_0px_5.8px_3px_rgba(255,255,255,0.25)] transition-opacity duration-300 ease-out group-active:opacity-0 group-disabled:opacity-0"
        />
      </button>
    );

  if (!reveal) return button;
  return <BlurReveal className="inline-flex">{button}</BlurReveal>;
}
