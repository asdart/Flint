# Interactions and custom-code exceptions

## Principles

- All motion is a **named Webflow Interaction (IX3)** from the registry below. Interactions target
  a **block class** (`.fk-nav`) or the **`data-ix` attribute** (`data-ix="reveal"`), never an
  element ID. Use the attribute for behaviors that can sit on any element, so it never has to be
  stacked with other classes.
- Hover, pressed and focus effects are **CSS transitions on class states**, not interactions.
  They match the repo 1:1 (`AGENTS.md` rule 14). The MVP replaced the rotating button gradient
  with a background slide without asking; that is what rule 14 prevents.
- **State changes are class toggles.** An interaction adds, removes or toggles a unique combo
  class (`is-pill`, `is-menu-open`), and that combo's own transitions do the animating. Repo
  and Webflow then share one mechanism.
- Reduced motion for **class-toggle reveals** (resting CSS hidden, the interaction adds the visible
  class, e.g. the blur reveal) uses `behavior: "skip-to-end"`: `dont-animate` skips the whole
  interaction and would leave the content invisible (measured on staging, spike S1).
- Reduced motion: motion interactions use `conditionalPlayback`
  `[{ "type": "prefers-reduced-motion", "behavior": "dont-animate" }]`, so the element stays
  in its resting, visible state. Interactions that only change UI state (opening the menu) don't
  get that condition, or the UI would stop working.
- IX3 tweens `opacity`, transforms (`x`, `y`, `scale`, `rotation`…), `width`, `height` and three
  colors (`backgroundColor`, `borderColor`, `color`). It has **no `filter`**: a blur is animated by a
  class toggle whose CSS transition runs on `filter` (spike S1). Other properties (padding, top)
  change through class transitions, like `is-pill`.
- Scroll reveals start at `"top 85%"` and last at least 500ms, per the IX3 guide.
- Reversing a timeline doesn't undo a class Set (`addClass`), so `leaveBack: reverse` left the nav
  stuck as a pill. A state that must return is a **pair** of interactions, each with `restart`:
  one adds the class (`ix-nav-pill`), one removes it (`ix-nav-pill-rest`).
- A click interaction that must work on every click has **one** action group and control
  `restart`. Interactions with two or more groups only accept `play`, which goes inert once
  played, so open and close are separate interactions (`ix-nav-menu`, `ix-nav-menu-close`).
- **Infinite loops never rewind.** Marquees, tickers and looping carousels (hero arc, logo
  marquee, partner states, testimonials) are built so the last frame equals the first: duplicated
  items, and a cycle that moves by exactly one set. The timeline repeats (`repeat: -1`) with no
  visible jump. A carousel that rewinds in the repo (How It Works) animates its return as a step.
  The copies must **cover the visible area for the whole cycle**: at least the visible length plus
  one set's travel (coverage rule in `mvp2-home.md`), or the edges empty out as the set drains.
- In the repo, `src/ix/useInteractions.ts` is a small preview runtime that emulates these
  interactions for local development. It is never shipped to Webflow and must not grow beyond the registry.

## Registry

Easing and durations reference `tokens.md` → Motion.

| Interaction | Trigger | Target | Animation | Replaces (legacy) | Status |
| --- | --- | --- | --- | --- | --- |
| `ix-reveal` | Scroll, start `"top 85%"`, once | Each `[data-ix="reveal"]` | opacity 0→1, move Y 18px→0, 700ms, ease out | `data-reveal` + `hooks/useStaggerReveal.ts`, `BlurReveal.tsx` (blur dropped) | synced (`i-f8d36c90`) |
| `ix-reveal-stagger` | Scroll, start `"top 85%"`, once | Children of `[data-ix="reveal-stagger"]` | Same as `ix-reveal`, 750ms, 150ms stagger | `components/BlurReveal.tsx` | legacy |
| `ix-nav-pill` | Scroll on body, start `"top+=24 top"`, `enter: restart` | `.fk-nav` | Add `is-pill` (its transitions shrink the nav and fade in the white pill). The single CTA stays as is | `components/SiteNav.tsx` (Framer Motion) | synced (`i-b1853c2c`), verified in Preview |
| `ix-nav-pill-rest` | Same trigger, `leaveBack: restart` | `.fk-nav` | Remove `is-pill` | `components/SiteNav.tsx` | synced (`i-004f1888`), verified in Preview |
| `ix-nav-menu` | Click `.fk-nav-toggle`, control `restart` | `.fk-nav-menu`, body | Add `is-menu-open`; body `overflow: hidden`. No reduced-motion condition | `SiteNav.tsx` menu state | synced (`i-6869da77`) |
| `ix-nav-menu-close` | Click `.fk-nav-menu-close`, control `restart` | `.fk-nav-menu`, body | Remove `is-menu-open`; body `overflow: visible`. No reduced-motion condition | `SiteNav.tsx` menu state | synced (`i-0fb7a606`) |
| `ix-parallax` | While scrolling in view | `.fk-parallax` (combo `is-reverse`) | Move Y −40px→40px (reverse: 40→−40) | `Stats.tsx` `useScroll`/`useTransform` | legacy |
| `ix-marquee` | Page load, infinite loop | `.fk-marquee-track` | Move X 0→−50%, linear, 32s (`is-slow`: 48s) | `.logo-marquee-track`, `.cta-marquee-track` keyframes | legacy |
| `ix-ticker` | Page load, infinite loop | `.fk-ticker-track` | Step Y by one line (52px) every 2.2s with ease in-out 450ms. Loop of duplicated lists | `PartnersMap.tsx` interval + spring | legacy |
| `ix-count-in` | Scroll, start `"top 85%"`, once | Each `.fk-stat-value` | opacity 0→1, move Y 8px→0, 500ms, ease pop | `components/DigitPopIn.tsx` (per-digit and blur dropped, pending P-07) | synced (`i-baf0948f`) |
| `ix-faq-toggle` | Click `.fk-faq-question` | Parent `.fk-faq-item` | Toggle `is-faq-open`; height 0→auto on `.fk-faq-answer`, rotate `.fk-faq-icon` 45° | `Faq.tsx` accordion state | legacy |
| `ix-testimonial-hover` | Hover `.fk-testimonial` | Self | Fade in `.fk-testimonial-quote`, fade out media overlay | `Testimonials.tsx` hover variants | legacy |
| `ix-illustration-play` | Scroll into view (once) | `.fk-illustration` | Play Lottie from start | `*Illustration.tsx` `useInView` timelines | legacy |

Native Webflow elements are used instead of interactions for: **Slider** (testimonial carousel,
replaces `CarouselPagination.tsx` and `Testimonials.tsx` paging), **Form select** (replaces the
animated `components/Select.tsx`), **Collection List pagination** (replaces `AllPosts.tsx` paging
and `AnimatePresence`).

## Illustrations

The animated illustrations are about 1,900 lines of Framer Motion (`CasePrepIllustration`,
`NetworkIllustration`, `RetentionIllustration`, `CostSavingsIllustration`,
`SendApplicationIllustration`, `InterviewIllustration`, `ImmigrationFeesIllustration`,
`ProximityOrbit`, and the illustrated steps in `HowItWorks.tsx`). Target:

1. **Lottie** (preferred): recreate each animation in After Effects or a Figma-to-Lottie tool.
   Upload the JSON, place a Lottie element inside `.fk-illustration`, and play it with `ix-illustration-play`.
2. If an illustration is simple (a few elements fading or moving), rebuild it as an IX3 timeline instead.
3. Static fallback: the final frame as SVG, used with reduced motion.

## Custom-code exceptions

Nothing outside this table may be added through `data_scripts_tool`, Embed elements, custom
attributes that load code, or Code Components.

| ID | What | Why it can't be native | Scope | Implementation | Status |
| --- | --- | --- | --- | --- | --- |
| `x-gravity-gallery` | Physics avatar gallery in `Section / CTA` (Gallery) | Matter.js physics simulation | CTA section only | Webflow Code Component (React, via the plugin's code-component skills). Alternative: replace with `ix-reveal-stagger` on a static collage | open: roadmap P-01 |
| `x-article-toc` | Table of contents built from the article body H2s, with scroll-spy | Rich text headings can't be listed natively | Blog post template only | Small inline script registered with `data_scripts_tool`, under 2 KB | open: roadmap P-02 |
| `x-button-gradient` | Primary button hover: the gradient angle turns 349.52° → 529.52° in 700ms (ease in-out), skipped with reduced motion | Webflow styles can't transition a gradient angle, and IX3 can't animate gradients or custom properties. Only `@property` does it | Site (every `fk-button`) | Custom CSS, about 1 KB: `src/styles/exceptions/x-button-gradient.css` with each `var(--token)` renamed to `var(--_flint---token)`, in site head code inside `<style>` | approved (D-06); install blocked until the site plan allows custom code (P-06) |
| `x-text-rendering` | Two-line clamp with ellipsis on `fk-post-card-title` / `-excerpt`; antialiased font smoothing on `fk-page` | The style API rejects `-webkit-line-clamp`, `-webkit-box-orient`, `-webkit-font-smoothing` and their unprefixed names | Site | Custom CSS, under 0.5 KB: `src/styles/exceptions/x-text-rendering.css`, installed with `x-button-gradient` | approved (D-07); install blocked like `x-button-gradient` |
| `x-hero-arc-speed` | Hero arc slows to 0.35× on hover instead of pausing | IX3 can pause/resume a loop, not change its speed | Home hero | Small page script adjusting the GSAP timeline speed | **candidate, deferred** (`mvp2-home.md` H-2). Native build pauses on hover |
| `x-carousel-goto` | Pagination dot clicks animate directly from the current slide to the clicked one, backward as well as forward | IX3 keeps no "current slide" state: a click `jump` plays the target step's forward transition from its fixed start, so a smaller index snaps | How It Works and Testimonials | Small page script driving the IX3 timeline, or a Code Component | **candidate, deferred** (`mvp2-home.md` S5). Native build: forward jumps animate, backward jumps snap |
| `x-testimonial-drag` | Drag/swipe on the center-weighted testimonials carousel | No native drag on an IX3-driven carousel | Testimonials section | Page script or Code Component | **candidate, deferred** (`mvp2-home.md` H-6). Native build has autoplay, dots, hover pause |

Rules for exceptions:

- Each one has an ID, a reason, the narrowest scope possible (page before site), and a size budget.
- Prefer a Code Component over a raw script when it renders UI. Prefer a page script over a site script.
- No third-party analytics, chat or tracking without adding a row here first. Those go through
  `/custom-code-management`.
- Custom CSS lives in `src/styles/exceptions/<id>.css`, is imported by the repo like any style,
  and is never pushed through the class scripts. The class keeps the native part (the static
  gradient), so the page still looks right before the exception is installed.
