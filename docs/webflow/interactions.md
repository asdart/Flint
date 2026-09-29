# Interactions and custom-code exceptions

## Principles

- All motion is a **named Webflow Interaction (IX3)** from the registry below. Interactions target
  a **block class** (`.fk-nav`) or the **`data-ix` attribute** (`data-ix="reveal"`), never an
  element ID. Use the attribute for behaviors that can sit on any element, so it never has to be
  stacked with other classes.
- Hover, pressed and focus effects are **CSS transitions on class states**, not interactions.
  They match the repo 1:1 (`AGENTS.md` rule 14). In the test stage the rotating button gradient
  was replaced with a background slide without asking; that is what rule 14 prevents.
- **State changes are class toggles.** An interaction adds, removes or toggles a unique combo
  class (`is-pill`, `is-menu-open`), and that combo's own transitions do the animating. Repo
  and Webflow then share one mechanism.
- Reduced motion for **class-toggle reveals** (resting CSS hidden, the interaction adds the visible
  class, e.g. the blur reveal) uses `behavior: "skip-to-end"`: `dont-animate` skips the whole
  interaction and would leave the content invisible (measured in the test stage, spike S1).
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
  one set's travel (coverage rule in `archive/test-site/mvp2-home.md`), or the edges empty out as the set drains.
- In the repo, `src/ix/useInteractions.ts` is a small preview runtime that emulates these
  interactions for local development. It is never shipped to Webflow and must not grow beyond the registry.

## Registry

Easing and durations reference `tokens.md` → Motion.

**Status values:** `migrated` = built to the contract in the repo (the preview runtime in `src/ix/`
emulates it) · `legacy` = exists only in pre-contract code.

| Interaction | Trigger | Target | Animation | Replaces (legacy) | Status |
| --- | --- | --- | --- | --- | --- |
| `ix-reveal` | Scroll, start `"top 85%"`, once | Each `[data-ix="reveal"]` | opacity 0→1, move Y 18px→0, 700ms, ease out | `data-reveal` + `hooks/useStaggerReveal.ts`, `BlurReveal.tsx` (blur dropped) | migrated |
| `ix-reveal-stagger` | Scroll on `[data-ix="reveal-stagger"]`, start `"top 85%"`, once | Its `[data-ix-item]` descendants, in DOM order | opacity 0→1, move Y 18px→0, 700ms, ease out, 90ms apart (timeline positions) | `data-reveal` waves in `hooks/useStaggerReveal.ts` | migrated |
| `ix-blur-reveal` | Scroll on `[data-ix="blur-reveal"]`, start `"top 85%"`, once; reduced motion `skip-to-end` | Its `.fk-blur-reveal` children | Add `is-revealed`; the class transition animates opacity, blur 16→0 and Y 16→0 over 750ms ease-in-out, children delayed by `is-delay-1/2/3` (spike S1) | `components/BlurReveal.tsx` | migrated |
| `ix-card-hover` | Hover `.fk-card` (enter / leave) | Self, `.fk-card-title`, `.fk-card-text`, `.fk-icon` within | Enter: background `color-white`→`color-brand`, title `color-ink`→`color-white`, text `color-brand`→`color-white` and opacity 0.8→0.6, all 300ms `cubic-bezier(0.16, 1, 0.3, 1)`; add `is-inverse` to the icon (its filter transition, same timing). Leave reverses | `components/ServiceCard.tsx` group hover | migrated; easing expo.out (preset 26) = `cubic-bezier(0.16, 1, 0.3, 1)` |
| `ix-nav-pill` | Scroll on body, start `"top+=24 top"`, `enter: restart` | `.fk-nav` | Add `is-pill` (its transitions shrink the nav and fade in the white pill). The single CTA stays as is | `components/SiteNav.tsx` (Framer Motion) | migrated |
| `ix-nav-pill-rest` | Same trigger, `leaveBack: restart` | `.fk-nav` | Remove `is-pill` | `components/SiteNav.tsx` | migrated |
| `ix-nav-menu` | Click `.fk-nav-toggle`, control `restart` | `.fk-nav-menu`, body | Add `is-menu-open`; body `overflow: hidden`. No reduced-motion condition | `SiteNav.tsx` menu state | migrated |
| `ix-nav-menu-close` | Click `.fk-nav-menu-close`, control `restart` | `.fk-nav-menu`, body | Remove `is-menu-open`; body `overflow: visible`. No reduced-motion condition | `SiteNav.tsx` menu state | migrated |
| `ix-parallax` | While scrolling in view | `.fk-parallax` (combo `is-reverse`) | Move Y −40px→40px (reverse: 40→−40) | `Stats.tsx` `useScroll`/`useTransform` | legacy |
| `ix-marquee` | Page load, infinite loop (`repeat: -1`); reduced motion: don't animate | `.fk-logo-marquee-track` (later `.fk-marquee-track`) | Move X 0 → −(100 / copies)%, linear, 32s per set (`is-slow`: 48s). Logo Marquee: 3 copies → −33.333% (coverage rule) | `.logo-marquee-track`, `.cta-marquee-track` keyframes | migrated (Logo Marquee) |
| `ix-ticker` | Page load, infinite; reduced motion `dont-animate` | `[data-ix="ticker"]` (the track) and rows `[data-ticker-row="n"]` | One timeline, cycle 30.8s (14 states × 2.2s). Step k (1–14) at position 2.2·k: track y −52(k−1) → −52k px, 0.9s `back.out(1.2)`; row 6+k 100% → 20% and row 7+k 20% → 100% opacity, 0.45s `power1.inOut`. Every action `repeat: −1`, `repeatDelay` = 30.8 − duration (29.9 / 30.35), so step 14 lands on the duplicate New York and the restart frame is identical | `PartnersMap.tsx` interval + spring | migrated |
| `ix-two-ways-card` | Scroll on `.fk-two-ways-card.is-brand-light`, start `"top 70%"`, once; reduced motion `skip-to-end`. A second interaction `ix-two-ways-card-late` does the same on `is-secondary` with every position +0.12s (scroll triggers take no delay) | The trigger card and its children (`within` the trigger) | All `power4.out` unless noted. Card opacity 0→1, y 24→0, 0.7s @0. Nurses: center photo opacity 0→1, y 68→0, 0.8s @0.4; left y 52→0 @0.54; right y 52→0 @0.62; orbs opacity 0→1, 0.7s @0.55. Facilities: photo opacity 0→1, scale 1.06→1, 0.95s @0.4. Eyebrow `splitText: words` (mask) yPercent 115→0, 0.6s @0.62, stagger 0.045; title the same @0.72. Body opacity 0→0.8, y 12→0, 0.6s @1.0. CTA `.fk-blur-reveal` add `is-revealed` @1.12 (its class transition, 0.75s ease-in-out). The eyebrow/title/body word-split targets `[data-two-ways="eyebrow"]`, `[data-two-ways="title"]`, `[data-two-ways="body"]` inside the trigger, not classes: the card's text uses shared typography classes, which an interaction must never target | `legacy/TwoWays.tsx` Framer Motion timeline | migrated |
| `ix-count-in` | Scroll, start `"top 85%"`, once | Each `.fk-stat-value` | opacity 0→1, move Y 8px→0, 500ms, ease pop | `components/DigitPopIn.tsx` (per-digit and blur dropped, pending P-07) | migrated |
| `ix-faq-toggle` | Click `.fk-faq-question` | Parent `.fk-faq-item` | Toggle `is-faq-open`; height 0→auto on `.fk-faq-answer`, rotate `.fk-faq-icon` 45° | `Faq.tsx` accordion state | legacy |
| `ix-hero-arc` | Load, infinite; hover on `.fk-hero-stage` (`[data-ix="hero-arc"]`) pauses / resumes (decision H-2); reduced motion `dont-animate` | `.fk-hero-wheel` | rotation 0 → 55.5556° (one set of 10), 34s linear, `repeat: −1` | `legacy/Hero.tsx` arc (`useAnimationFrame`) | migrated |
| `ix-how-carousel` | Load, infinite (H-11: IX3 allows a scroll trigger only on its own, so no in-view pause); hover on `.fk-how-viewport` pause/resume; click `[data-dot="how-n"]` jump to 5·(n−1) s; breakpoint tiny `dont-animate`; reduced motion `dont-animate` | `.fk-how-track`, `[data-how-slide]`, `[data-how-card]`, `[data-dot-bar^="how"]`, `[data-dot-fill^="how"]` | Cycle 30s. Fill n: width 0 → 100%, 5s linear @5(n−1), then reset. At 5k (k = 1…5) and 30 (back to 1): track x → −392k (0 at 30); leaving slide 398×512 → 360×464, entering the reverse, 0.7s `power4.out`. The card fills its slide, so it resizes with it and needs no scale animation at desktop (the old 1.10556 ↔ 1 scale enlarged the text; the design keeps it 20px); bars 52 ↔ 12, 0.45s `power4.out`. `repeat: −1`, `repeatDelay` = 30 − duration | `legacy/HowItWorks.tsx` | migrated |
| `ix-how-carousel-phone` | Same triggers; breakpoints main/medium/small `dont-animate`, so it plays at tiny only (H-9) | Same | Same timeline with the phone numbers (step 332.0523px, slides 302.1106×389.3869 ↔ 334×429.6683, card scale 0.839196 ↔ 0.927778) | same | migrated |
| `ix-testimonials` | Load, infinite; hover on `.fk-testimonials-track` pause/resume (not the row: the pagination inside it must not freeze the carousel) (freezes a move in progress, H-12); click `[data-dot="tm-n"]` jump to that testimonial's step (tm-4 → 0, tm-5 → 5 … tm-3 → 30); reduced motion `dont-animate` | `[data-tm-slide]` (21), `.fk-testimonials-track`, `[data-dot-bar^="tm"]`, `[data-dot-fill^="tm"]` | Cycle 35s (7 × 5s). Each step every slide moves one slot left: x and scale (0.8 ↔ 0.88 at the centre) over 1.4s with a `customEase` path traced from legacy's spring (duration 1.4, bounce 0.22; 8 segments, max error 0.13px on a 341px move); the card entering the centre fades 0.6 → 1 (0.5s `power4.out`), the leaving one reverses. **Track, not absolute slides (2026-09-28):** the 21 slides (3 copies of the 7 testimonials; the middle copy is the real set, the outer two are `aria-hidden`) sit in normal flow in one flex track (`fk-testimonials-track`, gap 24px). A step animates the **track** `x` by one pitch (340.8px) and only two slides: the leaving current one and the entering one animate scale 0.8 ↔ 0.88 with its side margin (−39.6px ↔ −23.76px, which cancels the layout space the scale takes and keeps the 24px gap). Track and scales share the same 1.4s `customEase`. The loop never jumps in view: 7 steps move the track exactly one copy, and identical copies make step 7's picture equal step 0's, so IX3's `repeat: −1` restart is invisible (`css-system.md` coverage rule). A dot click moves the track to the shortest target the same way (±1…3 places). Needs cards for slots −2…8 around the current one; valid up to a ~3,000px viewport. Bars 52 ↔ 12 (0.45s), fill 0 → 100% (5s). `repeat: −1`. The resting state (track offset, `is-center`) is plain CSS, so the row is laid out without the interaction | `legacy/Testimonials.tsx` | migrated |
| `ix-testimonial-hover` | Hover `.fk-testimonial-card` **inside the current slide only** (`.fk-testimonials-slide.is-center`; enter / leave, split groups). Side cards don't react, and a card that stops being current closes; reduced motion `skip-to-end` | Its `-quote` and `-scrim` | Enter: To quote height 160px, scrim opacity 0.9, 0.45s `power4.out`; add `is-open` to the quote (CSS mask transition, H-10). Leave: To 104px / 0.6, remove `is-open` | `legacy/Testimonials.tsx` card hover | migrated |
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
| `x-button-gradient` | Primary button hover: the gradient angle turns 349.52° → 529.52° in 700ms (ease in-out), skipped with reduced motion | Webflow styles can't transition a gradient angle, and IX3 can't animate gradients or custom properties. Only `@property` does it | Site (every `fk-button`) | Custom CSS, about 1 KB: `src/styles/exceptions/x-button-gradient.css` with each `var(--token)` renamed to `var(--_flint---token)`, in site head code inside `<style>` | approved (D-06); install on production in roadmap P.2 (the plan allows custom code, D-09) |
| `x-text-rendering` | Two-line clamp with ellipsis on `fk-post-card-title` / `-excerpt`; antialiased font smoothing on `fk-page` | The style API rejects `-webkit-line-clamp`, `-webkit-box-orient`, `-webkit-font-smoothing` and their unprefixed names | Site | Custom CSS, under 0.5 KB: `src/styles/exceptions/x-text-rendering.css`, installed with `x-button-gradient` | approved (D-07); installed with `x-button-gradient` in P.2 |
| `x-scroll-lock` | `overscroll-behavior: contain` on `fk-nav-menu` and `fk-nav-menu-links`, so scrolling the open mobile menu never scrolls the page behind it | The body lock is native (`ix-nav-menu` sets body `overflow: hidden`), but it doesn't stop scroll chaining, and `overscroll-behavior` may be rejected by the style API (to confirm when installed; if it is accepted, move it to the classes and drop this exception) | Site | Custom CSS, under 0.2 KB: `src/styles/exceptions/x-scroll-lock.css`, installed with `x-button-gradient` and `x-text-rendering` | approved (D-10); installed with `x-button-gradient` in P.2 |
| `x-schema-site` | `Organization` + `WebSite` JSON-LD on every page, with `sameAs` social profiles (`seo.md` S-06) | Webflow's per-page JSON-LD setting would repeat the block on every page; one site-wide block keeps it in one place | Site (head) | Inline `<script type="application/ld+json">`, static, under 1 KB. Values from `seo.md` | **required** (seo.md); values pending P-08 |
| `x-schema-post` | `BlogPosting` + `BreadcrumbList` JSON-LD on each post (`seo.md` S-07, S-09) | The per-page JSON-LD setting holds static JSON; a post needs its own CMS fields | Post template page (head) | Inline JSON-LD in the template's head code with CMS fields inserted (headline, image, publish date, author, category) | **required** (seo.md); to build in phase 6 |
| `x-deferred-tracking` | Loads GTM after the `load` event; Meta, TikTok and Google Ads run as tags inside GTM (`seo.md` S-13) | Native integrations and pasted tags load in the head and hold up the page | Site (footer) | Small inline loader, under 1 KB, injecting GTM on `load` (or idle). No other tracking code anywhere | **required** (seo.md); container ID pending |
| `x-video-facade` | Inline video/webinar embed that loads only on click, behind a thumbnail (`seo.md` S-14) | Only if the native Lightbox (which loads the player on open) doesn't fit the design | Pages with inline video | Thumbnail + labelled play button; the click swaps in the iframe | **candidate**: native Lightbox first |
| `x-hero-arc-speed` | Hero arc slows to 0.35× on hover instead of pausing | IX3 can pause/resume a loop, not change its speed | Home hero | Small page script adjusting the GSAP timeline speed | **candidate, deferred** (`archive/test-site/mvp2-home.md` H-2). Native build pauses on hover |
| `x-carousel-goto` | Pagination dot clicks animate directly from the current slide to the clicked one, backward as well as forward | IX3 keeps no "current slide" state: a click `jump` plays the target step's forward transition from its fixed start, so a smaller index snaps | How It Works and Testimonials | Small page script driving the IX3 timeline, or a Code Component | **candidate, deferred** (`archive/test-site/mvp2-home.md` S5). Native build: forward jumps animate, backward jumps snap |
| `x-testimonial-drag` | Drag/swipe on the center-weighted testimonials carousel | No native drag on an IX3-driven carousel | Testimonials section | Page script or Code Component | **candidate, deferred** (`archive/test-site/mvp2-home.md` H-6). Native build has autoplay, dots, hover pause |

Rules for exceptions:

- Each one has an ID, a reason, the narrowest scope possible (page before site), and a size budget.
- Prefer a Code Component over a raw script when it renders UI. Prefer a page script over a site script.
- No third-party analytics, chat or tracking without adding a row here first. Those go through
  `/custom-code-management`.
- Custom CSS lives in `src/styles/exceptions/<id>.css`, is imported by the repo like any style,
  and is never pushed through the class scripts. The class keeps the native part (the static
  gradient), so the page still looks right before the exception is installed.
