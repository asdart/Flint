import type { ReactNode } from "react";

type FlowerSide = "left" | "right" | false;

export default function IllustrationPanel({
  children,
  tone = "tertiary",
  flower = false,
  className = "",
}: {
  children: ReactNode;
  tone?: "tertiary" | "brand";
  flower?: FlowerSide;
  className?: string;
}) {
  return (
    <div
      className={`relative h-[696px] w-[580px] max-w-[580px] shrink-0 overflow-clip rounded-[40px] ${
        tone === "brand" ? "bg-brand-light" : "bg-tertiary"
      } ${className}`}
    >
      {flower ? (
        <div
          className={`pointer-events-none absolute size-[1160px] ${
            flower === "right"
              ? "-top-4 left-[63px] rotate-90"
              : "-top-4 -left-[718px] rotate-90"
          }`}
          style={{
            maskImage: "url(/assets/stats-mask-1.svg)",
            WebkitMaskImage: "url(/assets/stats-mask-1.svg)",
            maskSize: "contain",
            WebkitMaskSize: "contain",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
          }}
          aria-hidden
        >
          <img
            src="/assets/stats-bg.png"
            alt=""
            className="size-full object-cover"
          />
        </div>
      ) : null}
      {children}
    </div>
  );
}
