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
  class) uses `behavior: "skip-to-end"`: `dont-animate` skips the whole interaction and would leave
  the content invisible (measured in the test stage, spike S1). The blur reveal still uses it, for
  its `is-revealed` Set and its FromTo (D-19).
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
- **Loops and carousels: To tweens plus Sets, never FromTo (2026-09-29).** IX3 applies every FromTo's
  from-state when the timeline is built (the latest-positioned one wins) and again on a `jump`, so a
  looping timeline of FromTo tweens starts and jumps to a broken frame. Every tween in `ix-ticker`,
  `ix-how-carousel(-phone)` and `ix-testimonials` is a **To** (`tt: 0`, values `[null, to]`): it reads its
  start lazily on its first render and reuses it on every repeat. The resting state is written by **Set**
  actions (`tt: 3`, duration 0, position 0, no repeat, bare values), one per animated element, whose values
  equal the resting CSS. See "Bug fixes (2026-09-29)" below.
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
| `ix-reveal-stagger` | Scroll on `[data-ix="reveal-stagger"]`, start `"top 85%"`, once | Its `[data-ix-item]` descendants, in DOM order | opacity 0→1, move Y 18px→0, 700ms, ease out, 90ms apart (one action with `stagger.each` 0.09s; positions can't address the Nth match of a selector) | `data-reveal` waves in `hooks/useStaggerReveal.ts` | migrated |
| `ix-blur-reveal` | Scroll on `[data-ix="blur-reveal"]`, start `"top 85%"`, once; reduced motion `skip-to-end` | Its `.fk-blur-reveal` children | **D-19 (2026-09-29):** a Set adds `is-revealed` (the class transition brings the blur 16→0 over 750ms, delayed by `is-delay-1/2/3`; the resting blur is exception `x-blur-reveal`) and a FromTo animates opacity 0→100% and Y 16→0px over 0.75s with the CSS ease-in-out as a `customEase` (`M0,0 C0.42,0 0.58,1 1,1`), staggered 0.15s in DOM order (= the `is-delay-*` steps). IX3 holds the FromTo's from-state at rest, so the Designer shows the content; the live site also blurs it | `components/BlurReveal.tsx` | migrated |
| `ix-card-hover` | Hover `.fk-card` (enter / leave) | Self, `.fk-card-title`, `.fk-card-text`, `.fk-icon` within | Enter: background `color-white`→`color-brand`, title `color-ink`→`color-white`, text `color-brand`→`color-white` and opacity 0.8→0.6, all 300ms `cubic-bezier(0.16, 1, 0.3, 1)`; add `is-inverse` to the icon (its filter transition, same timing). Leave reverses | `components/ServiceCard.tsx` group hover | migrated; easing expo.out (preset 26) = `cubic-bezier(0.16, 1, 0.3, 1)` |
| `ix-nav-pill` | Scroll on body, start `"top+=24 top"`, `enter: restart`; reduced motion `dont-animate` (the nav stays at rest, as the repo preview does: `useInteractions.ts`) | `.fk-nav` | Add `is-pill` (its transitions shrink the nav and fade in the white pill). The single CTA stays as is | `components/SiteNav.tsx` (Framer Motion) | migrated |
| `ix-nav-pill-rest` | Same trigger, `leaveBack: restart`; reduced motion `dont-animate` | `.fk-nav` | Remove `is-pill` | `components/SiteNav.tsx` | migrated |
| `ix-nav-menu` | Click `.fk-nav-toggle`, control `restart` | `.fk-nav-menu`, html, body | Add `is-menu-open`; html and body `overflow: hidden` (preview mode and iOS Safari scroll through html). No reduced-motion condition | `SiteNav.tsx` menu state | migrated |
| `ix-nav-menu-close` | Click `.fk-nav-menu-close`, control `restart` | `.fk-nav-menu`, html, body | Remove `is-menu-open`; html and body `overflow: visible`. No reduced-motion condition | `SiteNav.tsx` menu state | migrated |
| `ix-parallax` | While scrolling in view | `.fk-parallax` (combo `is-reverse`) | Move Y −40px→40px (reverse: 40→−40) | `Stats.tsx` `useScroll`/`useTransform` | legacy |
| `ix-marquee` | Page load, infinite loop (`repeat: -1`); reduced motion: don't animate | `.fk-logo-marquee-track` (later `.fk-marquee-track`) | Move X 0 → −(100 / copies)%, linear, 32s per set (`is-slow`: 48s). Logo Marquee: 3 copies → −33.333% (coverage rule) | `.logo-marquee-track`, `.cta-marquee-track` keyframes | migrated (Logo Marquee) |
| `ix-ticker` | Page load, infinite; reduced motion `dont-animate` | `[data-ix="ticker"]` (the track) and rows `[data-ticker-row="n"]` | One timeline, cycle 30.8s (14 states × 2.2s). Step k (1–14) at position 2.2·k: track y −52(k−1) → −52k px, 0.9s `back.out(1.2)`; row 6+k 100% → 20% and row 7+k 20% → 100% opacity, 0.45s `power1.inOut`. Every action `repeat: −1`, `repeatDelay` = 30.8 − duration (29.9 / 30.35), so step 14 lands on the duplicate New York and the restart frame is identical | `PartnersMap.tsx` interval + spring | migrated |
| `ix-two-ways-card` | Scroll on `.fk-two-ways-card.is-brand-light`, start `"top 70%"`, once; reduced motion `skip-to-end`. A second interaction `ix-two-ways-card-late` does the same on `is-secondary` with every position +0.12s (scroll triggers take no delay) | The trigger card and its children (`within` the trigger) | All `power4.out` unless noted. Card opacity 0→1, y 24→0, 0.7s @0. Nurses: center photo opacity 0→1, y 68→0, 0.8s @0.4; left y 52→0 @0.54; right y 52→0 @0.62; orbs opacity 0→1, 0.7s @0.55. Facilities: photo opacity 0→1, scale 1.06→1, 0.95s @0.4. Eyebrow `splitText: words` (mask) yPercent 115→0, 0.6s @0.62, stagger 0.045; title the same @0.72. Body opacity 0→0.8, y 12→0, 0.6s @1.0. CTA `.fk-blur-reveal` add `is-revealed` @1.12 (the blur's class transition) with a FromTo opacity 0→100%, Y 16→0px, 0.75s CSS ease-in-out `customEase` at the same position (D-19). The eyebrow/title/body word-split targets `[data-two-ways="eyebrow"]`, `[data-two-ways="title"]`, `[data-two-ways="body"]` inside the trigger, not classes: the card's text uses shared typography classes, which an interaction must never target | `legacy/TwoWays.tsx` Framer Motion timeline | migrated |
| `ix-count-in` | Scroll, start `"top 85%"`, once | Each `.fk-stat-value` | opacity 0→1, move Y 8px→0, 500ms, ease pop | `components/DigitPopIn.tsx` (per-digit and blur dropped, pending P-07) | migrated |
| `ix-faq-toggle` | Click `.fk-faq-question` | Parent `.fk-faq-item` | Toggle `is-faq-open`; height 0→auto on `.fk-faq-answer`, rotate `.fk-faq-icon` 45° | `Faq.tsx` accordion state | legacy |
| `ix-hero-arc` | Load, infinite; hover on `.fk-hero-stage` (`[data-ix="hero-arc"]`) pauses / resumes (decision H-2); reduced motion `dont-animate` | `.fk-hero-wheel` | rotation 0 → 110° (one set of 10 cards, 11° each), 30s linear (same on-screen speed as the legacy arc), `repeat: −1` | `legacy/Hero.tsx` arc (`useAnimationFrame`) | migrated |
| `ix-how-carousel` | Load, infinite (H-11: IX3 allows a scroll trigger only on its own, so no in-view pause); hover on `.fk-how-viewport` pause/resume; click `[data-dot="how-n"]` jump to 5·(n−1) s (dot 1: 0.01 s, see Bug fixes); breakpoint tiny `dont-animate`; reduced motion `dont-animate` | `.fk-how-track`, `[data-how-slide]`, `[data-how-card]`, `[data-dot-bar^="how"]`, `[data-dot-fill^="how"]` | Cycle 30s. Fill n: width 0 → 100%, 5s linear @5(n−1), then reset. At 5k (k = 1…5) and 30 (back to 1): track x → −392k (0 at 30); leaving slide 398×512 → 360×464, entering the reverse, 0.7s `power4.out`. The card fills its slide, so it resizes with it and needs no scale animation at desktop (the old 1.10556 ↔ 1 scale enlarged the text; the design keeps it 20px); bars 52 ↔ 12, 0.45s `power4.out`. `repeat: −1`, `repeatDelay` = 30 − duration | `legacy/HowItWorks.tsx` | migrated |
| `ix-how-carousel-phone` | Same triggers; breakpoints main/medium/small `dont-animate`, so it plays at tiny only (H-9) | Same | Same timeline with the phone numbers (step 332.0523px, slides 302.1106×389.3869 ↔ 334×429.6683, card scale 0.839196 ↔ 0.927778) | same | migrated |
| `ix-testimonials` | Load, infinite; hover on `.fk-testimonials-track` pause/resume (not the row: the pagination inside it must not freeze the carousel) (freezes a move in progress, H-12); click `[data-dot="tm-n"]` jump to that testimonial's step (tm-4 → 0.01 (not 0, see Bug fixes), tm-5 → 5 … tm-3 → 30); reduced motion `dont-animate` | `[data-tm-slide]` (21), `.fk-testimonials-track`, `[data-dot-bar^="tm"]`, `[data-dot-fill^="tm"]` | Cycle 35s (7 × 5s). Each step every slide moves one slot left: x and scale (0.8 ↔ 0.88 at the centre) over 1.4s with a `customEase` path traced from legacy's spring (duration 1.4, bounce 0.22; 8 segments, max error 0.13px on a 341px move); the card entering the centre fades 0.6 → 1 (0.5s `power4.out`), the leaving one reverses. **Track, not absolute slides (2026-09-28):** the 21 slides (3 copies of the 7 testimonials; the middle copy is the real set, the outer two are `aria-hidden`) sit in normal flow in one flex track (`fk-testimonials-track`, gap 24px). A step animates the **track** `x` by one pitch (340.8px) and only two slides: the leaving current one and the entering one animate scale 0.8 ↔ 0.88 with its side margin (−39.6px ↔ −23.76px, which cancels the layout space the scale takes and keeps the 24px gap). Track and scales share the same 1.4s `customEase`. The loop never jumps in view: 7 steps move the track exactly one copy, and identical copies make step 7's picture equal step 0's, so IX3's `repeat: −1` restart is invisible (`css-system.md` coverage rule). A dot click moves the track to the shortest target the same way (±1…3 places). Needs cards for slots −2…8 around the current one; valid up to a ~3,000px viewport. Bars 52 ↔ 12 (0.45s), fill 0 → 100% (5s). `repeat: −1`. The resting state (track offset, `is-center`, and the slides' `pointer-events`: `none`, `auto` on `is-center`) is plain CSS, so the row is laid out without the interaction. On production the timeline also moves `pointer-events` with the current slide (Stage 8c) | `legacy/Testimonials.tsx` | migrated |
| `ix-testimonial-hover` | Hover `.fk-testimonial-card` **inside the current slide only** (enter / leave, split groups; in the repo `.fk-testimonials-slide.is-center`, on production the `pointer-events` pair of D-18: side slides pass the pointer to the track, so their cards can't be hovered). A card that stops being current closes; reduced motion `skip-to-end` | Its `-quote` and `-scrim` | Enter: To quote height 160px, scrim opacity 0.9, 0.45s `power4.out`; add `is-open` to the quote (CSS mask transition, H-10). Leave: To 104px / 0.6, remove `is-open` | `legacy/Testimonials.tsx` card hover | migrated (repo). **Built on production 2026-09-29 (Stage 8c, D-18):** "current slide only" is `pointer-events` (side slides `none`, the current one `auto`, moved by `ix-testimonials`), not the `is-center` class, see Production build (Stage 8c) |
| `ix-illustration-play` | Scroll into view (once) | `.fk-illustration` | Play Lottie from start | `*Illustration.tsx` `useInView` timelines | legacy |

## Production build (Stage 8a, 2026-09-29)

Created on the production site (site scope; ids in `webflow-ids.json` → `interactions`), read back
against the rows above. Choices the registry leaves open, and how Webflow expresses the rest:

| Topic | What was built |
| --- | --- |
| Scoping to the trigger | A class or attribute trigger runs once per matching element. Actions that touch the trigger use target `wf:trigger-only`; actions that touch its descendants use the class or attribute target with `filterContext: { relationship: "within", filterBy: ["wf:trigger-only", ""], firstMatchOnly: false }` (accepted and stored; runtime check pending on staging). Used by `ix-blur-reveal`, `ix-reveal-stagger`, `ix-card-hover`, both Two Ways interactions |
| Scroll ranges | Every scroll trigger: `start` as in the row, `end: "bottom 15%"` (`"bottom bottom"` on the body for the nav pill), `enter: "play"`, other toggles `none` (nav pill: `enter: "restart"`, rest: `leaveBack: "restart"`), so each plays once |
| Reduced motion | `dont-animate`: `ix-reveal`, `ix-reveal-stagger`, `ix-marquee`, `ix-ticker`, `ix-nav-pill`, `ix-nav-pill-rest` (the repo preview also skips the pill under reduced motion). `skip-to-end`: `ix-blur-reveal`, both Two Ways interactions (class toggle and end states must land) and `ix-card-hover` (the repo switches instantly, which is what `skip-to-end` does on hover). None: `ix-nav-menu`, `ix-nav-menu-close` |
| `ix-blur-reveal` | One `addClass` `is-revealed` on `.fk-blur-reveal` within the trigger, at position 0, plus (D-19, 2026-09-29) one FromTo `br-fade` on the same target: opacity `0%`→`100%`, `y` `16px`→`0px`, 0.75s, `customEase` `M0,0 C0.42,0 0.58,1 1,1`, `stagger: { each: 0.15, from: "start" }`. The blur's stagger is still the `is-delay-1/2/3` transition delays in CSS (150 / 300 / 450ms), which the 0.15s stagger matches, so no timeline positions (they would double the delay) |
| `ix-card-hover` | Split hover (`eventMode` enter / leave, groups `g-in` / `g-out`). Colors are To tweens with literal hex (IX3 tweens colors as literals, variables can't be used: `#ffffff` `color-white`, `#44386d` `color-brand`, `#0f0e17` `color-ink`), 0.3s ease 26 (expo.out); text opacity 0.8 ↔ 0.6; icon `is-inverse` add / remove as a Set. If a token value changes, update this interaction |
| `ix-nav-menu` / `-close` | One timeline with three Sets: the class on `.fk-nav-menu` and, through target `wf:selector` `body` and `html` (added 2026-09-29), `wf:style` `overflow` `hidden` / `visible` |
| `ix-marquee` | `xPercent` 0 → −33.333 on `.fk-logo-marquee-track`, 32s, linear (`ease: 0`), `repeat: −1`. The component has 3 rows (1 real + 2 `aria-hidden`), which covers a viewport up to about 2,100px (one set is ~1,071px) |
| `ix-ticker` | **Rebuilt 2026-09-29 (To + Sets):** 58 actions: 16 Sets at position 0 (track `y` 0px, row 7 opacity 100%, rows 8…21 20%) and 42 To tweens (14 track moves, 28 row fades) generated by script, cycle 30.8s, steps at 2.2k, emitted from step 14 down to 1. Rows are targeted one by one by `[data-ticker-row="n"]` (rows 7…21 of the 29 on Home). Was 42 FromTo |
| Two Ways | Trigger on the combo classes; all ten actions sit in both interactions (`-late` shifted +0.12s), and actions whose class isn't in that card (photos, facility image) match nothing. Nurse side photos animate opacity and Y (0.8s), as in `src/ix/twoWays.ts`. Word splits use `splitText: { type: "words", mask: "words" }` on the `data-two-ways` attributes |
| Skipped | `ix-count-in`: Home has no `.fk-stat-value` |

## Production build (Stage 8b, 2026-09-29)

Created on the production site (site scope; ids in `webflow-ids.json` → `interactions`), numbers from
`src/ix/`. Hover pause/resume is two `wf:hover` triggers (`eventMode` enter → `pause`, leave → `resume`,
`multiTimeline: false`, no groups) on the same single timeline as the `wf:load` trigger; dot clicks are one
`wf:click` trigger per dot (`control: play`, `jump` in seconds). **Every tween is a To** (rebuilt
2026-09-29, was FromTo: see "Bug fixes (2026-09-29)") with per-action `repeat: -1` and `repeatDelay` = cycle −
duration, preceded by Sets at position 0 that write the resting state. Reduced motion is `dont-animate` on
all four. The tween/step descriptions below say "from → to" for the motion; only the `to` value is stored.

| Interaction | What was built |
| --- | --- |
| `ix-hero-arc` `i-dda772fb` | One action: `rotation` 0 → 110 on `.fk-hero-wheel` (origin from its CSS), 30s, linear, `repeat: -1`. Hover on `[data-ix="hero-arc"]` pauses / resumes. 1 action |
| `ix-how-carousel` `i-92770673` | 61 actions (19 Sets + 42 To tweens), cycle 30s (`repeatDelay` = 30 − duration). Per step k = 1…6 at 5k: track `x` −392(k−1) → −392k (step 6: −1960 → 0), slides `[data-how-slide]` leaving 398×512 → 360×464 and entering the reverse, 0.7s power4.out (ease 11); bars `[data-dot-bar]` 52 ↔ 12px, 0.45s ease 11; fill n `[data-dot-fill]` 0 → 100% width, 5s linear at 5(n−1), then a 0.01s 100% → 0 reset at 5n. Hover on `.fk-how-viewport`; clicks on `[data-dot="how-n"]` jump to 5(n−1)s (dot 1: 0.01s). Breakpoint `tiny` `dont-animate`. Resting CSS (slide 1 and card 1 `is-active`, track `translateX(0)`, bar 1 `is-active`) is frame 0 |
| `ix-how-carousel-phone` `i-d27f08a0` | 79 actions (25 Sets + 54 To tweens): same timeline with the phone numbers (step 332.0523px, slides 302.1106×389.3869 ↔ 334×429.6683) plus card `scale` 0.927778 ↔ 0.839196 on `[data-how-card]`. Breakpoints `main`, `medium`, `small` `dont-animate` |
| `ix-testimonials` `i-1d31deaf` | 65 tweens + 15 pointer-events Sets (Stage 8c) + 23 resting-state Sets = 103 actions, cycle 35s, ~34 KB. Track `x` −3582.24 − 340.8·k over 1.4s with a `customEase` traced from the legacy spring (8 cubic segments, max error 0.11px on 340.8px; recipe: Spring as a CustomEase in the `flint-webflow-sync` skill). Two slides per step (leaving `[data-tm-slide="10+k"]`, entering `11+k`), opacity 1 ↔ 0.6 in 0.5s power4.out; bars and fills as How It Works (7 dots, current = tm-4 at start, fill at 5(k−1)); dot jumps tm-4 → 0.01 (not 0, see Bug fixes), tm-5 → 5 … tm-3 → 30; hover on `.fk-testimonials-track` pauses. **Mechanism differs from the row above (IX3 can't tween margin, `wf:style` / `wf:transform` lists are closed):** a slide's footprint is `396 · scale`, so instead of animating its side margin the slide's `width` is animated with the same easing (entering slide, margin −39.6 in CSS: width 396 → 427.68, `x` 0 → 15.84, scale 0.8 → 0.88; leaving: reverse; slide 11, whose `is-center` margin is −23.76: width 396 → 364.32, `x` 0 → −15.84), with `transformOrigin` fixed at `198px 50%` (the card's centre). Footprint and visual centre equal the margin version at every instant. Slide 18 (the last one to become current) gets an extra leave at 40s so its next enter starts from the side state. `is-center` stays on slide 11 (never toggled) |
| `ix-testimonial-hover` | **Not built in 8b; built in Stage 8c (below).** Its "current slide only" scope needed `is-center` to follow the carousel, which IX3 can't do without a 15.84px margin snap (decision P-16, closed as D-18: option b, `pointerEvents` Sets) |

**To verify on staging (needs the publish; nothing here is proven at runtime yet):** hero arc rotates
110° per 30s with no seam and no empty edge (1440 and about 2,500px) and pauses on hover; How It Works
steps every 5s, the return from step 6 animates, hover freezes a move in progress (H-11), dot jumps
(forward animates, backward snaps, `x-carousel-goto` deferred), the fill resets when its bar narrows, and
the phone timeline runs at ≤479 only (the desktop one at ≥480); testimonials: the gap between cards stays
24px through a move, `transformOrigin: "198px 50%"` and the `width` tween behave as computed, no jump at
the 35s loop point, slide 18 is a side card again by its next enter, hover on the track freezes the move
(H-12), dot jumps; reduced motion leaves all four still, with the fills empty; that repeated actions
restart from their stored start (the model assumes each To reuses its start on every repeat, and that the position-0 Sets are applied once at build and again by a `jump` to 0). Superseded by the bug-fix checks below.

## Bug fixes (2026-09-29)

User-reported from the Designer preview; all rewritten in place (same ids, triggers unchanged, backups of
the old JSON kept in the session scratchpad).

| Bug | Cause | Fix |
| --- | --- | --- |
| Ticker started with every row from Washington down at 100%; carousel dots started as a 12px grey current dot with later bars 52px and filled; a dot `jump` (How It Works dot 1, Testimonials tm-4 → 0s, or any earlier dot) showed the last slide with the same broken bars | Every looping action was a FromTo. IX3 applies each FromTo's from-state at build (the latest-positioned tween's from-state wins, the opposite of what the descending emission assumed) and re-applies them on a jump | `ix-ticker`, `ix-how-carousel`, `ix-how-carousel-phone`, `ix-testimonials`: every FromTo became a **To** (`tt: 0`, `[null, to]`; position, duration, ease, repeat, repeatDelay and targets kept) and **Set** actions (`tt: 3`, duration 0, position 0, no repeat, bare values, one selector per element, nothing overlapping at the same position) write the resting state. Ticker: track `y` 0px, row 7 100%, rows 8–21 20%. How It Works: track `x` 0, slide 1 398×512 and slides 2–6 360×464, bar 1 52px and bars 2–6 12px, fills 0%. Phone: same plus card 1 scale 0.927778, cards 2–6 0.839196, slides 334×429.6683 / 302.1106×389.3869. Testimonials: track `x` −3582.24, slide 11 (396px, x 0, scale 0.88, opacity 1) and slides 12–18 (396px, x 0, scale 0.8, opacity 0.6, `transformOrigin` `198px 50%`), bar 4 52px and the other bars 12px, fills 0%. The 15 `pointerEvents` Sets of Stage 8c are unchanged. Resting values equal the production CSS (class diff clean) |
| Blur reveals empty in the Designer | `.fk-blur-reveal` was hidden by its own CSS (opacity 0, blur, Y 16) until `ix-blur-reveal` added `is-revealed` | **D-19 "Hybrid":** opacity and Y are a FromTo in `ix-blur-reveal` (IX3 holds it at rest, so the Designer shows the content); the resting blur is exception `x-blur-reveal` (site head code, not run in the Designer); the classes keep only the filter transition (`is-revealed`: `filter: blur(0px)`). The two Two Ways interactions got the same FromTo on the CTA at the same position (1.12s / 1.24s late). The repo preview emulates it (`src/ix/blurReveal.ts`, `twoWays.ts`; `useInteractions` is a layout effect so nothing flashes) |
| Mobile menu took the whole page height in the canvas | `height: 100%` on a fixed element stretches to the Designer canvas, which is as tall as the page | `fk-nav-menu`: `height: 100dvh` (production and `nav.css`; `dvh` accepted and read back as is). Full-screen menu pattern: fixed, inset 0, `100dvh`, internal scroll (`overscroll-behavior: contain`), lock **html and body** (`ix-nav-menu` / `-close` gained an `html` `overflow` Set) |
| Primary gradient on secondary buttons in the Designer | The stored `background-image: none` on `.fk-button.is-secondary` and on the Secondary **variants** (Secondary, Secondary Small, Secondary Full: the Nav's Apply now is Secondary Small, and an instance takes variant styles, not the combo) is not honoured by the canvas | All four now store a transparent layer, `linear-gradient(rgba(255, 255, 255, 0), rgba(255, 255, 255, 0))`. `x-button-gradient` is scoped with `:where(:not(.is-secondary))` (one class of specificity, so it can never tie with a variant's own two-class style in the published CSS) |
| Nav current state | Webflow adds `w--current` only to links that point to a page | The two Home links and both logos in `Global / Nav` are page links to Home. The other destinations are URLs until their pages exist (`components.md`) |
| Secondary buttons still showed the primary gradient (user, second report) | A Secondary variant instance carries `w-variant-<variant id>` and no `is-secondary`, so `:where(:not(.is-secondary))` still matched it and the head code painted the gradient | `x-button-gradient` also excludes the three Secondary variant classes: `.fk-button:where(:not(.is-secondary, .w-variant-57899b6f-…, .w-variant-9c3538bc-…, .w-variant-6bcbf217-…))` (full ids in `webflow-ids.json` → UI / Button → variants). Repo file and head code updated, read back identical. A new Secondary variant must be added to the list |
| Testimonials dot tm-4 did nothing / showed the wrong testimonial (user, second report) | Its `jump` was `0`, the only 0s jump besides How It Works dot 1. IX3 most likely treats `jump: 0` as "no jump" (a falsy check), so the click only calls `play` on the running timeline. Inferred from the symptom: every non-zero dot works | `jump: 0.01` on tm-4 (`ix-testimonials`) and on how-1 (`ix-how-carousel`, `ix-how-carousel-phone`); at 0.01s the fill is 0.2% full, invisible. Read back |

**To verify in the Designer preview / on staging (nothing here is proven at runtime):** ticker starts with
only the current row at 100% and steps every 2.2s through the loop; How It Works and Testimonials start
with the current bar at 52px, later bars 12px and empty fills, and clicking any dot (How dot 1, tm-4, and
earlier dots) lands on the right slide with correct bars; the carousel positions after the first loop
(each To reuses its start on repeat); the position-0 Sets are applied again by a `jump` to 0; the
`wf:transform` Sets on `x` / `width` / `height` / `scale` / `opacity` / `transformOrigin` (accepted and
read back) apply before the first tween; blur reveals visible in the Designer, fade + rise + blur on the
live site with the 0.15s stagger; Two Ways CTA fades and rises; menu locks the page (html and body) and the
overlay is exactly one viewport tall.

## Production build (Stage 8c, 2026-09-29)

Decision D-18 (user, 2026-09-29; roadmap P-16 option b): only the current testimonial slide receives
the pointer. Read back from production; the repo preview behaves the same (checked in headless
Chrome, see below).

| Piece | What was built |
| --- | --- |
| CSS (repo and production) | `.fk-testimonials-slide { pointer-events: none }`, `.fk-testimonials-slide.is-center { pointer-events: auto }` (`src/styles/components/testimonials.css`, pushed with `update_style` on base and combo, class diff clean). Slide 11 (`is-center` at rest) is the only reachable slide before the timeline runs and under reduced motion (`dont-animate`), which is also the repo's start slide. Nothing in the slides needs the pointer (no links, no drag, the dots sit outside the track), and the track still gets it, so hovering a side slide pauses the carousel without opening a card |
| `ix-testimonials` `i-1d31deaf` (updated, not re-created: same id, same 10 triggers, `dont-animate`) | 15 `pointerEvents` Sets added, 80 actions in all. Each is `tt: 3`, `wf:style` `pointerEvents`, `duration: 0`, `repeat: -1`, `repeatDelay: 35`, target `[data-tm-slide="n"]`, at the same position as the step's enter / leave tweens. Step k = 1…7 at 5k: slide 11+k `auto` (`pa`), slide 10+k `none` (`pn`); slide 11's leave at 5 is its first (and only) `none` per cycle; slide 18 (current from 35, reset to a side card at 40) also gets `none` at 40 (`pn18`). Positions and closure match the tweens, so the loop keeps the "slide 18 restarts as a side card" rule for pointer events as well |
| `ix-testimonial-hover` `i-14706c57` (created) | Split hover on `.fk-testimonial-card` (`multiTimeline: false`, groups `g-in` / `g-out`, `control: play`); every action targets the card's descendants with `filterContext { relationship: "within", filterBy: ["wf:trigger-only", ""] }`. Enter: To quote `height` `[null, "160px"]`, To scrim `opacity` `[null, "90%"]` (0.45s, ease 11 = `power4.out`), and a Set adding `is-open` (combo `0b27b9b3-…`) to `-quote`. Leave: 104px / 60% and removing `is-open`. Reduced motion `skip-to-end`. To tweens read their start lazily, so an interrupted open reverses from where it is (as `setupCardHover`) |

**Sets table** (all repeat every 35s; `auto` = reachable):

| Position | `auto` | `none` |
| --- | --- | --- |
| 0 (CSS) | 11 | all others |
| 5 | 12 | 11 |
| 10 | 13 | 12 |
| 15 | 14 | 13 |
| 20 | 15 | 14 |
| 25 | 16 | 15 |
| 30 | 17 | 16 |
| 35 | 18 | 17 |
| 40 (and 5 of the next cycle) | 12 | 18, 11 |

**Dot jumps:** a dot's `jump` is a timeline time 5m (m = 0…6), so the timeline is seeked to a time inside
its first cycle. Each Set is a zero-duration tween: every Set positioned at or before that time renders
as applied (in order), every later one renders as before its start (reverted to the value it read when
first initialised, in reverse order). Applying Sets 1…m leaves exactly slide 11+m `auto` (each step
turns its slide on and the previous one off); m = 0 applies none, so slide 11 (CSS `auto`) is the only
one. The extra `pn18` and every later `pa` / `pn` are reverted to the state before their first Set.
That holds from any earlier or later playhead, since seeking back reverts the later Sets and seeking
forward applies the earlier ones. Reasoned from GSAP timeline semantics, not observed.

**Differences from the repo, none visible in normal use:** (1) when a card is open and stops being
current (only possible if a keyboard dot press moves the carousel while the pointer rests on the
card, since hovering the track pauses it), the repo closes it in `moveBy`; natively the leaving slide
becomes `pointer-events: none` under the pointer, and the card closes only if the browser then fires
`mouseleave` (Chrome and Firefox re-hit-test on the next frame; unverified in IX3). (2) The runtime's
`isCurrent()` guard on enter is the pointer-events pair here.

**To verify on staging (nothing here is proven at runtime yet):** the `pointerEvents` Sets apply
inside a repeating timeline (a Set with `repeat: -1` and `repeatDelay: 35` fires again each cycle,
including after 35s and 40s); at every step exactly one slide is `auto` (`getComputedStyle` on the 21
slides after each step, in cycle 1 and cycle 2, and right after a dot jump for all seven dots);
hovering a side slide pauses the carousel (H-12) but opens no card; only the current card opens and
closes (height 104 ↔ 160, scrim 0.6 ↔ 0.9, `is-open` mask); a card open when a keyboard dot press moves
the carousel closes; the hover leaves the freeze intact (hover pause and card hover share the track);
reduced motion leaves slide 11 reachable and the card hover instant (`skip-to-end`); no console error
from the `wf:trigger-only` `within` targets (unverified since Stage 8a).

Native Webflow elements are used instead of interactions for: **Slider** (testimonial carousel,
replaces `CarouselPagination.tsx` and `Testimonials.tsx` paging), **Form select** (replaces the
animated `components/Select.tsx`), **Form Block** (the newsletter's success and error messages; the preview's `src/ix/form.ts` stands in for webflow.js), **Dropdown** (the blog's category select: a list of links to the category
pages; the preview's `src/ix/dropdown.ts` only stands in for webflow.js), **Collection List pagination** (replaces `AllPosts.tsx` paging
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
| `x-button-gradient` | Primary button hover: the gradient angle turns 349.52° → 529.52° in 700ms (ease in-out), skipped with reduced motion | Webflow styles can't transition a gradient angle, and IX3 can't animate gradients or custom properties. Only `@property` does it | Site (every primary `fk-button`; scoped to primaries since 2026-09-29: excludes `is-secondary` and the three Secondary variant classes `w-variant-<id>`) | Custom CSS, about 0.6 KB: `src/styles/exceptions/x-button-gradient.css` with each `var(--token)` renamed to `var(--_flint---token)`, in the site head code inside one `<style>` block. Source of the pasted block: `docs/webflow/custom-code/site-head.html` | approved (D-06); **installed 2026-09-29** on production through `data_scripts_tool` → `set_site_freeform_code` (head), read back identical (re-installed 2026-09-29 with the primary-only scope). Not published yet |
| `x-text-rendering` | Two-line clamp with ellipsis on `fk-post-card-title` / `-excerpt`; antialiased font smoothing on `fk-page` | The style API rejects `-webkit-line-clamp`, `-webkit-box-orient`, `-webkit-font-smoothing` and their unprefixed names | Site | Custom CSS, under 0.5 KB: `src/styles/exceptions/x-text-rendering.css`, in the same `<style>` block as `x-button-gradient` (`docs/webflow/custom-code/site-head.html`) | approved (D-07); **installed 2026-09-29** with `x-button-gradient`. `fk-featured-post-*` has no clamp in the repo, so the selectors are complete |
| `x-blur-reveal` | The blur's resting value on the blur reveal: `.fk-blur-reveal:not(.is-revealed) { filter: blur(16px) }` | IX3 has no `filter`, and a class can't hold the resting blur without also blurring the Designer canvas: this one rule lives in site code, which the Designer doesn't run, so the canvas shows the content while the live site blurs it until `ix-blur-reveal` adds `is-revealed` (D-19, user decision 2026-09-29: Designer visibility; the Designer preview shows fade + rise without blur, the live site the full effect) | Site | Custom CSS, under 0.2 KB: `src/styles/exceptions/x-blur-reveal.css`, in the same `<style>` block as the others (`docs/webflow/custom-code/site-head.html`) | approved (D-19); **installed 2026-09-29** with the head-code update, read back identical. Not published yet |
| `x-scroll-lock` | `overscroll-behavior: contain` on `fk-nav-menu` and `fk-nav-menu-links`, so scrolling the open mobile menu never scrolls the page behind it | The body lock is native (`ix-nav-menu` sets body `overflow: hidden`), but it doesn't stop scroll chaining | — | **Retired 2026-09-29.** The style API accepts `overscroll-behavior` (`update_style` on `fk-nav-menu` and `fk-nav-menu-links`, read back), so it lives on the two classes in `src/styles/components/nav.css` and no custom code is needed. `x-scroll-lock.css` and its import were deleted | retired (D-10, see `roadmap.md`) |
| `x-schema-site` | `Organization` + `WebSite` JSON-LD on every page, with `sameAs` social profiles (`seo.md` S-06) | Webflow's per-page JSON-LD setting would repeat the block on every page; one site-wide block keeps it in one place | Site (head) | Inline `<script type="application/ld+json">`, static, under 1 KB. Values from `seo.md` | **required** (seo.md); values pending P-08 |
| `x-schema-post` | `BlogPosting` + `BreadcrumbList` JSON-LD on each post (`seo.md` S-07, S-09) | The per-page JSON-LD setting holds static JSON; a post needs its own CMS fields | Post template page (head) | Inline JSON-LD in the template's head code with CMS fields inserted (headline, image, publish date, author, category) | **required** (seo.md); to build in phase 6 |
| `x-deferred-tracking` | Loads GTM after the `load` event; Meta, TikTok and Google Ads run as tags inside GTM (`seo.md` S-13) | Native integrations and pasted tags load in the head and hold up the page | Site (footer) | Small inline loader, under 1 KB, injecting GTM on `load` (or idle). No other tracking code anywhere | **required** (seo.md); container ID pending |
| `x-video-facade` | Inline video/webinar embed that loads only on click, behind a thumbnail (`seo.md` S-14) | Only if the native Lightbox (which loads the player on open) doesn't fit the design | Pages with inline video | Thumbnail + labelled play button; the click swaps in the iframe | **candidate**: native Lightbox first |
| `x-hero-arc-speed` | Hero arc slows to 0.35× on hover instead of pausing | IX3 can pause/resume a loop, not change its speed | Home hero | Small page script adjusting the GSAP timeline speed | **candidate, deferred** (`archive/test-site/mvp2-home.md` H-2). Native build pauses on hover |
| `x-carousel-goto` | Carousel dot clicks animate directly from the current slide to the clicked one, backward as well as forward | IX3 keeps no "current slide" state: a click `jump` plays the target step's forward transition from its fixed start, so a smaller index snaps | How It Works and Testimonials | Small page script driving the IX3 timeline, or a Code Component | **candidate, deferred** (`archive/test-site/mvp2-home.md` S5). Native build: forward jumps animate, backward jumps snap |
| `x-testimonial-drag` | Drag/swipe on the center-weighted testimonials carousel | No native drag on an IX3-driven carousel | Testimonials section | Page script or Code Component | **candidate, deferred** (`archive/test-site/mvp2-home.md` H-6). Native build has autoplay, dots, hover pause |

Rules for exceptions:

- Each one has an ID, a reason, the narrowest scope possible (page before site), and a size budget.
- Prefer a Code Component over a raw script when it renders UI. Prefer a page script over a site script.
- No third-party analytics, chat or tracking without adding a row here first. Those go through
  `/custom-code-management`.
- Custom CSS lives in `src/styles/exceptions/<id>.css`, is imported by the repo like any style,
  and is never pushed through the class scripts. The class keeps the native part (the static
  gradient), so the page still looks right before the exception is installed.
