# Interactions and custom-code exceptions

## Principles

- All motion is a **named Webflow Interaction (IX3)** from the registry below. Interactions are
  reusable and triggered by **class** (`fk-*`), never by element ID.
- Hover, pressed and focus effects are **CSS transitions on class states**, not interactions.
- The static end state is the default. With reduced motion, content is visible and nothing moves.
  Use the interaction's reduced-motion option, or skip the interaction.
- Animate only `transform`, `opacity` and `filter`. Width/padding are allowed only for `ix-nav-pill`.
- In the repo, `src/ix/` is a small preview runtime that emulates these interactions by class for
  local development. It is never shipped to Webflow and must not grow beyond the registry.

## Registry

Easing and durations reference `tokens.md` → Motion.

| Interaction | Trigger | Target | Animation | Replaces (legacy) | Status |
| --- | --- | --- | --- | --- | --- |
| `ix-reveal` | Scroll into view (once, 15% visible) | `.fk-reveal` (each element) | opacity 0→1, move Y 18px→0, 700ms, ease out (expo) | `data-reveal` + `hooks/useStaggerReveal.ts` | legacy |
| `ix-reveal-stagger` | Scroll into view (once) | Children of `.fk-reveal-group` | Same as `ix-reveal` plus blur 16px→0, 750ms, 150ms stagger | `components/BlurReveal.tsx` | legacy |
| `ix-nav-pill` | Page scroll > 24px (reverses at top) | `.fk-nav` | max-width 100%→`width-nav-pill`, top 32→12px, padding 0→8/8/20, 450ms, ease out (expo). Then white background + shadow fade in, 220ms | `components/SiteNav.tsx` (Framer Motion) | legacy |
| `ix-nav-menu` | Click `.fk-nav-toggle` | `.fk-nav-menu` | Show/hide the full-screen menu, toggle lines → ✕ | `SiteNav.tsx` menu state | legacy |
| `ix-parallax` | While scrolling in view | `.fk-parallax` (combo `is-reverse`) | Move Y −40px→40px (reverse: 40→−40) | `Stats.tsx` `useScroll`/`useTransform` | legacy |
| `ix-marquee` | Page load, infinite loop | `.fk-marquee-track` | Move X 0→−50%, linear, 32s (`is-slow`: 48s) | `.logo-marquee-track`, `.cta-marquee-track` keyframes | legacy |
| `ix-ticker` | Page load, infinite loop | `.fk-ticker-track` | Step Y by one line (52px) every 2.2s with ease in-out 450ms. Loop of duplicated lists | `PartnersMap.tsx` interval + spring | legacy |
| `ix-count-in` | Scroll into view (once) | `.fk-stat-value` | opacity 0→1, move Y 8px→0, blur 2px→0, 500ms, ease pop | `components/DigitPopIn.tsx` (per-digit, simplified to whole value) | legacy |
| `ix-faq-toggle` | Click `.fk-faq-question` | Parent `.fk-faq-item` | Height 0→auto on `.fk-faq-answer`, rotate `.fk-faq-icon` 45° | `Faq.tsx` accordion state | legacy |
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

Rules for exceptions:

- Each one has an ID, a reason, the narrowest scope possible (page before site), and a size budget.
- Prefer a Code Component over a raw script when it renders UI. Prefer a page script over a site script.
- No third-party analytics, chat or tracking without adding a row here first. Those go through
  `/custom-code-management`.
- Removed legacy CSS such as `@property --btn-grad-angle` doesn't come back as custom CSS. The
  button hover uses a `background-position` transition instead (`classes.md` → `fk-button`).
