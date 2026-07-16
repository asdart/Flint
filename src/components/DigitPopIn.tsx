import { useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";

type DigitPopInProps = {
  value: string;
  className?: string;
};

export default function DigitPopIn({ value, className = "" }: DigitPopInProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduceMotion = useReducedMotion();

  const stateClass = reduceMotion
    ? "is-static"
    : inView
      ? "is-animating"
      : "";

  return (
    <span
      ref={ref}
      className={`t-digit-group ${stateClass} ${className}`.trim()}
      aria-label={value}
    >
      {value.split("").map((char, i) => (
        <span
          key={`${i}-${char}`}
          className="t-digit"
          style={{ ["--digit-i" as string]: i }}
          aria-hidden
        >
          {char}
        </span>
      ))}
    </span>
  );
}
