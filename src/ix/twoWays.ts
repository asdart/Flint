/*
 * ix-two-ways-card preview. IX3 uses splitText: words; this local runtime creates the same masked
 * words, plays the per-card timeline at "top 70%", and restores the original text on cleanup.
 */

type Cleanup = () => void;

const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";
const EASE_CTA = "cubic-bezier(0.42, 0, 0.58, 1)"; // the CSS ease-in-out the blur reveal uses (D-19)
const AT = {
  card: 0,
  photoLead: 0.4,
  photoFollow: 0.54,
  eyebrow: 0.62,
  title: 0.72,
  body: 1,
  cta: 1.12,
};

type SplitResult = {
  element: HTMLElement;
  original: string;
  words: HTMLElement[];
};

function splitWords(element: HTMLElement): SplitResult {
  const original = element.textContent ?? "";
  const fragments = original.split(" ");
  element.replaceChildren();
  const words = fragments.map((word, index) => {
    const mask = document.createElement("span");
    const inner = document.createElement("span");
    // Preview-only spans; in Webflow, IX3 splitText creates its own masked words.
    mask.style.cssText =
      "display:inline-block;overflow:clip;vertical-align:top;padding-bottom:0.12em;margin-bottom:-0.12em";
    inner.style.display = "inline-block";
    inner.textContent = word;
    mask.append(inner);
    element.append(mask);
    if (index < fragments.length - 1) element.append(document.createTextNode(" "));
    return inner;
  });

  return { element, original, words };
}

function setTransform(element: HTMLElement | null, value: string, opacity?: string) {
  if (!element) return;
  element.style.transform = value;
  if (opacity !== undefined) element.style.opacity = opacity;
}

export function twoWays(): Cleanup {
  const cards = Array.from(
    document.querySelectorAll<HTMLElement>('[data-ix="two-ways-card"]'),
  );
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const animations: Animation[] = [];
  const timers: number[] = [];
  const styled = new Set<HTMLElement>();
  const splitResults: SplitResult[] = [];
  const played = new Set<HTMLElement>();
  let observer: IntersectionObserver | null = null;

  const animate = (
    element: HTMLElement | null,
    from: Keyframe,
    to: Keyframe,
    delay: number,
    duration: number,
    easing = EASE_OUT,
  ) => {
    if (!element) return;
    styled.add(element);
    animations.push(
      element.animate([from, to], {
        delay: delay * 1000,
        duration: duration * 1000,
        easing,
        fill: "forwards",
      }),
    );
  };

  const records = cards.map((card) => {
    const eyebrow = card.querySelector<HTMLElement>('[data-two-ways="eyebrow"]');
    const title = card.querySelector<HTMLElement>('[data-two-ways="title"]');
    const body = card.querySelector<HTMLElement>('[data-two-ways="body"]');
    const cta = card.querySelector<HTMLElement>(".fk-blur-reveal");
    const left = card.querySelector<HTMLElement>(".fk-two-ways-nurse-left");
    const right = card.querySelector<HTMLElement>(".fk-two-ways-nurse-right");
    const center = card.querySelector<HTMLElement>(".fk-two-ways-nurse-center");
    const facility = card.querySelector<HTMLElement>(".fk-two-ways-facility-image");
    const orbs = Array.from(card.querySelectorAll<HTMLElement>(".fk-two-ways-orb"));
    const eyebrowSplit = eyebrow ? splitWords(eyebrow) : null;
    const titleSplit = title ? splitWords(title) : null;

    if (eyebrowSplit) splitResults.push(eyebrowSplit);
    if (titleSplit) splitResults.push(titleSplit);

    const targets = [
      card,
      body,
      left,
      right,
      center,
      facility,
      ...orbs,
      cta,
      ...(eyebrowSplit?.words ?? []),
      ...(titleSplit?.words ?? []),
    ].filter((element): element is HTMLElement => !!element);
    targets.forEach((element) => styled.add(element));

    setTransform(card, "translateY(24px)", "0");
    setTransform(left, "translateY(52px)", "0");
    setTransform(right, "translateY(52px)", "0");
    setTransform(center, "translateY(68px)", "0");
    setTransform(facility, "scale(1.06)", "0");
    orbs.forEach((orb) => setTransform(orb, "", "0"));
    setTransform(body, "translateY(12px)", "0");
    setTransform(cta, "translateY(16px)", "0");
    eyebrowSplit?.words.forEach((word) => setTransform(word, "translateY(115%)"));
    titleSplit?.words.forEach((word) => setTransform(word, "translateY(115%)"));

    return {
      card,
      body,
      cta,
      left,
      right,
      center,
      facility,
      orbs,
      eyebrowWords: eyebrowSplit?.words ?? [],
      titleWords: titleSplit?.words ?? [],
      offset: card.classList.contains("is-secondary") ? 0.12 : 0,
    };
  });

  const play = (record: (typeof records)[number]) => {
    if (played.has(record.card)) return;
    played.add(record.card);
    observer?.unobserve(record.card);

    const { offset } = record;
    animate(
      record.card,
      { opacity: "0", transform: "translateY(24px)" },
      { opacity: "1", transform: "translateY(0px)" },
      offset + AT.card,
      0.7,
    );
    animate(
      record.center,
      { opacity: "0", transform: "translateY(68px)" },
      { opacity: "1", transform: "translateY(0px)" },
      offset + AT.photoLead,
      0.8,
    );
    animate(
      record.left,
      { opacity: "0", transform: "translateY(52px)" },
      { opacity: "1", transform: "translateY(0px)" },
      offset + AT.photoFollow,
      0.8,
    );
    animate(
      record.right,
      { opacity: "0", transform: "translateY(52px)" },
      { opacity: "1", transform: "translateY(0px)" },
      offset + AT.photoFollow + 0.08,
      0.8,
    );
    record.orbs.forEach((orb) =>
      animate(orb, { opacity: "0" }, { opacity: "1" }, offset + AT.photoLead + 0.15, 0.7),
    );
    animate(
      record.facility,
      { opacity: "0", transform: "scale(1.06)" },
      { opacity: "1", transform: "scale(1)" },
      offset + AT.photoLead,
      0.95,
    );
    record.eyebrowWords.forEach((word, index) =>
      animate(
        word,
        { transform: "translateY(115%)" },
        { transform: "translateY(0%)" },
        offset + AT.eyebrow + index * 0.045,
        0.6,
      ),
    );
    record.titleWords.forEach((word, index) =>
      animate(
        word,
        { transform: "translateY(115%)" },
        { transform: "translateY(0%)" },
        offset + AT.title + index * 0.045,
        0.6,
      ),
    );
    animate(
      record.body,
      { opacity: "0", transform: "translateY(12px)" },
      { opacity: "0.8", transform: "translateY(0px)" },
      offset + AT.body,
      0.6,
    );
    animate(
      record.cta,
      { opacity: "0", transform: "translateY(16px)" },
      { opacity: "1", transform: "translateY(0px)" },
      offset + AT.cta,
      0.75,
      EASE_CTA,
    );
    if (record.cta) {
      timers.push(
        window.setTimeout(
          () => record.cta?.classList.add("is-revealed"),
          (offset + AT.cta) * 1000,
        ),
      );
    }
  };

  if (reduceMotion) {
    records.forEach((record) => {
      record.card.style.opacity = "1";
      record.card.style.transform = "translateY(0px)";
      [record.left, record.right, record.center].forEach((image) =>
        setTransform(image, "translateY(0px)", "1"),
      );
      setTransform(record.facility, "scale(1)", "1");
      record.orbs.forEach((orb) => setTransform(orb, "", "1"));
      setTransform(record.body, "translateY(0px)", "0.8");
      record.eyebrowWords.forEach((word) => setTransform(word, "translateY(0%)"));
      record.titleWords.forEach((word) => setTransform(word, "translateY(0%)"));
      setTransform(record.cta, "translateY(0px)", "1");
      record.cta?.classList.add("is-revealed");
    });
  } else {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && entry.boundingClientRect.bottom >= 0) return;
          const record = records.find((item) => item.card === entry.target);
          if (record) play(record);
        });
      },
      { rootMargin: "0px 0px -30% 0px" },
    );
    records.forEach((record) => observer?.observe(record.card));
  }

  return () => {
    observer?.disconnect();
    timers.forEach((timer) => window.clearTimeout(timer));
    animations.forEach((animation) => animation.cancel());
    records.forEach((record) => record.cta?.classList.remove("is-revealed"));
    styled.forEach((element) => {
      element.style.opacity = "";
      element.style.transform = "";
    });
    splitResults.forEach(({ element, original }) => {
      element.textContent = original;
    });
  };
}
