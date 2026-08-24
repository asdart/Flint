import { Children, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

type BlurRevealProps = {
  children: ReactNode;
  className?: string;
  /** Duration of each child's blur fade-in, in seconds. */
  duration?: number;
  /** Delay multiplied by the child index. */
  delay?: number;
  blur?: string;
  yOffset?: number;
};

export default function BlurReveal({
  children,
  className,
  duration = 0.75,
  delay = 0.15,
  blur = "16px",
  yOffset = 16,
}: BlurRevealProps) {
  const reduceMotion = useReducedMotion();
  const items = Children.toArray(children);

  return (
    <div className={className}>
      {items.map((child, index) => (
        <motion.div
          key={index}
          initial={reduceMotion ? false : { opacity: 0, filter: `blur(${blur})`, y: yOffset }}
          whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: reduceMotion ? 0 : duration,
            ease: "easeInOut",
            delay: reduceMotion ? 0 : delay * index,
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}
