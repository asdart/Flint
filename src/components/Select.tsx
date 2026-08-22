import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  "aria-label"?: string;
};

const TRIGGER =
  "flex h-10 w-full items-center gap-2 rounded-[12px] border border-stone-100 bg-white py-2 pl-[14px] pr-[14px] text-[16px] leading-6 outline-none transition-[border-color,box-shadow] focus:field-active";

const MENU_SHADOW =
  "shadow-[0px_8px_9px_rgba(0,0,0,0.01),0px_32px_16px_rgba(0,0,0,0.01),0px_72px_21.5px_rgba(0,0,0,0.01)]";

const MENU_EASE = [0.22, 1, 0.36, 1] as const;

export default function Select({
  value,
  onChange,
  options,
  placeholder,
  className,
  "aria-label": ariaLabel,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const reduceMotion = useReducedMotion();
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative z-30 ${className ?? ""}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        className={`${TRIGGER} ${open ? "field-active" : ""} ${
          selected ? "text-ink" : "text-[#8c929b]"
        }`}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="min-w-0 flex-1 truncate text-left">
          {selected?.label ?? placeholder}
        </span>
        <span className="flex size-5 shrink-0 items-center justify-center overflow-clip">
          <img
            src="/assets/blog/chevron-down.svg"
            alt=""
            className={`h-[6px] w-2.5 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.ul
            id={listId}
            role="listbox"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: MENU_EASE }}
            className={`absolute top-[calc(100%+4px)] left-0 z-30 w-full origin-top overflow-clip rounded-[12px] border border-stone-100 bg-white ${MENU_SHADOW}`}
          >
            {options.map((option) => {
              const active = option.value === value;
              return (
                <li key={option.value} className="flex w-full bg-white p-1">
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    className={`flex w-full items-center rounded-[8px] px-3 py-2 text-left text-[16px] leading-6 transition-colors hover:bg-brand-light hover:text-brand ${
                      active ? "bg-brand-light text-brand" : "text-subtle"
                    }`}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <span className="truncate">{option.label}</span>
                  </button>
                </li>
              );
            })}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
