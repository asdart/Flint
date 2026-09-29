# MVP 2 — Homepage at 1:1 parity

Second vertical slice (roadmap phase 2b): the whole homepage, in the repo under the contract and in
Webflow, as close to 1:1 with the legacy `/` as native Webflow allows. Custom code stays the last
resort (`AGENTS.md` rules 8 and 14): every gap is either solved natively, or recorded as a decision
before it's built.

Inputs: section inventories produced on 2026-09-25 (Hero, Clients, Two Ways, Partners Map, How It
Works, What We Offer, Testimonials, Blog, CTA, Nav/Footer deltas). Numbers below come from them.

## Success criteria

- Draft page `/mvp-home` in Webflow and route `/mvp-home` in the repo, built only from registered
  tokens, classes, components and interactions. Legacy `/` stays untouched until parity is signed off.
- Side-by-side screenshots (legacy `/`, repo `/mvp-home`, Webflow) match at 1310 / 800 / 600 / 390px.
- Every motion from the legacy page exists, with the same trigger, duration and easing, or has a
  decision row (D-xx) that accepts the difference.
- `scripts/webflow-diff.mjs` reports no differences; all learnings recorded (rule 13).

## Page composition

| # | Legacy | Contract target | Registry today |
| --- | --- | --- | --- |
| 0 | `SiteNav` (light, overlay) | `Global / Nav` | synced |
| 1 | `Hero.tsx` | `Section / Hero` variant Home | legacy |
| 2 | `Clients.tsx` | `Section / Logo Marquee` | legacy |
| 3 | `TwoWays.tsx` | `Section / Two Ways` | legacy |
| 4 | `PartnersMap.tsx` | `Section / Partners Map` | legacy |
| 5 | `HowItWorks.tsx` (Home) | `Section / How It Works` variant Home | legacy |
| 6 | `WhatWeOffer.tsx` + `ServiceCard` | `Section / Feature Grid` + `UI / Service Card` | legacy |
| 7 | `Testimonials.tsx` | `Section / Testimonials` (Slider) + `UI / Testimonial Card` | legacy |
| 8 | `Blog.tsx` | Post Grid, variant Home (centered header + "See all posts") | synced (Related only) |
| 9 | `Cta.tsx` | `Section / CTA` variant **Art** (ring + room photo) | registry says "Gallery": wrong for Home |
| 10 | `sections/Footer.tsx` | `Global / Footer` | synced |

Registry corrections found: the home CTA doesn't use `GravityGallery` (unused file), so P-01 doesn't
block this MVP. The home How It Works cards have no internal motion, so P-04 doesn't block it either.

## Section plan

Legend: **N** native as-is · **N\*** native with a technique worth a spike · **D** needs a decision.

### Cross-cutting motion

| Legacy | Plan | |
| --- | --- | --- |
| `BlurReveal` (opacity 0→1, blur 16→0, y 16→0, 0.75s ease-in-out, 150ms per child) on most headers | Blur can't be tweened by IX3, but a class transition can: base `filter: blur(16px)` + `opacity 0` + `translateY(16px)`, combo `is-revealed` with the end values and a 750ms transition; IX3 scroll trigger adds the class, children staggered with timeline positions 0 / 0.15 / 0.3s | N\* (spike S1) |
| `useStaggerReveal` `[data-reveal]` (opacity, y 18px, 0.7s, 90ms stagger per wave) | Existing `ix-reveal` + timeline positions for the waves | N |
| Reduced motion | IX3 condition skips the timeline; a CSS transition still runs when the class lands | H-1 |

### Cross-cutting layout and sizing

- Every section's content sits in `fk-container`: the page container, 1200px wide including a
  20px (`space-5`) gutter on each side (legacy `max-w-[1200px] px-5`). Legacy sections that pad their
  container differently (`px-4`, `md:px-10`) are checked one by one against the screenshots; a real
  difference becomes a local value in that section, not a new container.
- Sizes are analyzed before they're written (`AGENTS.md` rule 2): a size used by one element of one
  block (a panel's height, an illustration offset) stays raw in that block; a repeated one gets a
  shared definition. Repeats already found in the inventories:
  - **Header copy width 436px** in Hero, Two Ways, What We Offer, Testimonials, Blog and CTA →
    token `width-header`, used by `fk-section-header is-narrow` and `fk-post-grid-header is-center`.
  - **Flags** 20px (hero chips) and 32px (testimonial cards) → `fk-flag` with a size combo.
  - **Avatars** 24px (post cards, facility call) and 40px (How It Works) → `fk-avatar` + size combo.
  - **Icons** 20/24px → existing `fk-button-icon` / `fk-icon`; the 40px service card icons become
    `fk-icon is-lg`.
  - **Pagination dots/bars** (How It Works and Testimonials) → one `fk-pagination` block.
  - **Section header typography** (32/40 → 48/52 serif headline, 16/24 → 18/28 brand-80 subcopy)
    repeats in 7 sections → existing `UI / Section Header`.

### Infinite loops

The hero arc, the logo marquee, the partner states and the testimonials never rewind: after the
last item comes the first again, moving in the same direction. Each is built so its **last frame
equals its first frame**, then the IX3 timeline repeats (`repeat: -1`) with no visible jump:

| Loop | How the end frame matches the start |
| --- | --- |
| Hero arc | Two copies of the 10 cards on the wheel; one cycle rotates by exactly one set's angle span |
| Logo marquee | Three copies of the row (coverage rule); one cycle moves X by −33.333% (one row) |
| Partner states | The 14 states followed by the first ones again; one cycle moves up 14 lines, back on "New York" |
| Testimonials | Each card runs the same 7-slot path offset by its index; the card leaving the outermost slot moves to the other end while hidden |

How It Works is different: legacy slides back from step 6 to step 1 (it rewinds). The timeline keeps
that as an animated seventh step instead of relying on the repeat, which would jump.

**Coverage rule (found in the Lab, 2026-09-25):** the copies must fill the visible area during the
*whole* cycle, not only at its start, or the edges empty out as the set drains. So the total
length of the copies is at least **visible area + one set's travel**, placed so the visible area
is covered at both the start and the end of a cycle:

| Loop | Copies needed |
| --- | --- |
| Marquee | `1 + ceil(widest viewport / one set's width)` copies; each cycle moves exactly one set (`xPercent = −100 / copies`) |
| Arc wheel | Cards from `−(half the visible arc + one set's angle)` to `+half the visible arc` |
| Ticker | Padding rows above and below the active row, as many as are visible (legacy uses 4 copies of the list on the tall desktop panel) |
| Testimonials | Cards on every visible slot plus one hidden slot at each end |

### 0 · Nav

Contract Nav already covers it. Deltas vs legacy: desktop links switch at 991 instead of 1024 and
the CTA hides at ≤479 instead of <640 (Webflow breakpoints, AGENTS §5); single CTA in both states
(D-05, already decided). **N**, nothing new.

### 1 · Hero (Home)

Peach panel 720 → 848px tall, headline block, gradient CTA, and 10 candidate cards (220×264,
radius 26, name chip with flag) sliding along a 3400px-radius arc over ±25°, 34s loop, slowed to
0.35× on hover.

- Layout, cards, chips, crops: **N** (absolute images in clipped frames).
- Arc motion: place the cards on a wheel (a parent whose `transform-origin` sits 3400px below the
  stage) at fixed angle offsets, and rotate the parent linearly with an infinite IX3 loop. Two
  copies of the set make it seamless: the first card follows the last (see Infinite loops). Same
  path, speed and look as the legacy math. **N\*** (spike S2)
- Hover slow-down to 0.35×: IX3 can pause/resume a loop on hover but not change its speed. **H-2**
- Primary button hover: exception `x-button-gradient` (D-06), unchanged.
- Local to the hero: panel heights (720 → 848px) and the stage offsets. The candidate card size
  (220×264) is only used here, so it's local too. The copy width is the shared header width.

### 2 · Logo Marquee

Six logos (per-logo widths 96–187px, 36px tall, 80% opacity), duplicated row, 32s linear loop,
white edge fades (48 → 128px). **N** via `ix-marquee` (infinite IX3 move X 0 → −50% over the two
copies, so the first logo follows the last).

### 3 · Two Ways

Header + two cards (brand-light / secondary) with photo collages, eyebrow, title, body, white CTA.
Timeline per card (from 0 at 30% in view, Facilities +0.12s): card fade-up 24px 0.7s; photos rise
52/68px 0.8s; soft orbs fade; words of eyebrow and title rise from 115% with 45ms stagger 0.6s;
body to 0.8 opacity; CTA blur-in.

- All of it: **N** — IX3 `splitText: words` with mask reproduces the word reveal exactly.
- Collage masks (`mask-image` linear/radial fades): **N\*** if the style API accepts `mask-image`
  (spike S3); otherwise export the collage pre-masked as one image. **H-3**
- Static `blur(12.55px)` orbs: **N**.

### 4 · Partners Map

Blurred map photo + 60% black overlay, headline, and a list of 14 states that steps up one line
(52px) every 2.2s with a spring (0.9s, bounce 0.28); the active row is 100% opacity, others 20%; a
vertical mask fades the edges.

- Stepping list: **N\*** — one infinite IX3 timeline with 14 steps (move Y + opacity crossfade);
  the list repeats after "Ohio" so the 14th step lands on "New York" again and the loop restarts
  on an identical frame (`ix-ticker`). Spring ≈ IX3 `back.out`/`elastic.out` with tuned
  parameters (GSAP eases), checked side by side. (spike S4)
- Edge mask over a photo: same question as S3. **H-3**

### 5 · How It Works (Home)

Header + a 6-step carousel: the active card is 398×512, the others 360×464, gap 32; the track slides
to center the active card (0.7s, ease-out); autoplay every 5s with a progress bar in the active
pagination dot (7px dot → 57px bar); pauses on hover and when out of view; dots are clickable.
The six cards are static compositions (≈20–30 elements each: photos, glass panels, tickets, badges).

- Carousel: **N\*** — one IX3 timeline of 6 steps (track `x`, card `scale`, bar `scaleX`) plus an
  animated return from step 6 to step 1, as legacy does (it rewinds, it isn't infinite), repeated;
  hover trigger pauses/resumes; dot click triggers `jump` to the step's time. Card width change
  becomes a scale on a fixed card (visually identical). Dot → bar morph: IX3 tweens `width`
  directly (7 → 57px), and the progress fill is a `width` 0 → 100% tween inside it. (spike S5)
- Card art: rebuild as elements (~150 elements total, backdrop blur, masks) or render each card's
  art to one image and keep titles/body as live text. **H-4**

### 6 · Feature Grid (What We Offer)

Secondary panel, 6 service cards (1 / 2 / 3 columns, rows 244px desktop). Card hover: white → brand
background, title and body turn white, icon inverts (300ms).

- Layout and card bg: **N**.
- Child colors and icon invert on card hover (a parent-hover effect CSS classes can't express):
  an IX3 hover trigger on the card animates its children directly — text colors tween (IX3 animates
  color), and the icon gets `is-inverse`, whose `filter` transition turns it white. **N\***
- New: `fk-card is-service` (radius 20px: new token or snap to 16/24, **H-5**), SVG icons.

### 7 · Testimonials

Brand-light panel 1102 → 900px; 7 portrait cards (396×488) in a center-weighted loop: center card
scale 0.88 at 100%, others 0.8 at 60%; spring moves (1.4s, bounce 0.22); drag/swipe with
threshold; autoplay 5s with the same progress pagination; card hover grows the quote box 104 →
160px with a moving fade mask and darkens the scrim 0.6 → 0.9.

- Carousel: infinite (see Infinite loops): every card runs the same 7-slot timeline offset by its
  index, so the card after the 7th is the 1st, still moving left; hover pause and dot jumps as in
  S5. **N\*** No drag (H-6).
- Hover quote expand + scrim: IX3 hover tweens the quote box `height` 104 → 160px and the scrim
  opacity 0.6 → 0.9 (0.45s). **N** The moving fade mask on the quote: S3.

### 8 · Post Grid (Home)

Existing Post Grid + a Home variant: centered header, title "The Flint blog", "See all posts"
(`UI / Button` Secondary) → `/blog`. Legacy excerpt/meta colors (`rgba(38,37,30,.6/.5)`) vs contract
`color-subtle` / `color-stone-400`: keep the contract tokens unless you want the legacy tints. **N**

### 9 · CTA (Art)

Tertiary panel 560px (480 min on mobile), headline, gradient CTA; on ≥768 a purple ring texture and
a room photo framed by circle masks (`cta-ring.svg`, `cta-circle.svg`), hidden on mobile. Motion:
BlurReveal only. **N** except the masks → S3 / H-3.

### 10 · Footer

Existing Footer. Deltas vs legacy: CTA title max width 580 (legacy 700), per-link staggered reveal
(legacy) vs per-group, bottom bar stacks at 767 (legacy 640). Recommend matching 700px and the
per-link stagger. **N**

## Capability spikes (first, on a draft "Lab" page)

| ID | Question | Pass = |
| --- | --- | --- |
| S1 | Does a class-toggle CSS transition on `filter` + `opacity` + `transform` run when IX3 adds the class, with staggered positions? | Blur reveal matches legacy frame by frame |
| S2 | Does an infinite IX3 rotation loop on a parent with a far `transform-origin` move 10+ cards smoothly? | Arc matches legacy path and 34s period |
| S3 | Does the style API store `mask-image` (and `-webkit-` is not needed at render)? `backdrop-filter`? `mix-blend-mode`? | Stored and rendered in Preview |
| S4 | 14-step infinite ticker timeline with `back.out`/`elastic.out` | Visually matches the spring |
| S5 | One timeline carousel: infinite loop + hover pause/resume + click `jump` to a step | Autoplay, pause and dot jumps all work |
| S6 | Seamless repeat: a timeline whose last frame equals its first, `repeat: -1` | No visible jump at the loop point (arc, marquee, ticker, testimonials) |

Spike results go straight into the skill and playbook (rule 13).

**Results (2026-09-25, measured on staging `flint-4167fa.webflow.io/lab` with CDP sampling):**

| ID | Result |
| --- | --- |
| S1 | **Pass.** Frame-by-frame identical to `BlurReveal`: opacity 0→1, blur 16→0px, y 16→0 over 750ms ease-in-out, children at 0/150/300ms. **Reduced motion:** with `dont-animate` the class is never added and the items stay invisible, so class-toggle reveals must use `skip-to-end` (update pushed, re-check pending) |
| S2 | **Pass.** Wheel rotates 1.18°/s (20° / 17s) and wraps seamlessly at the loop point |
| S3 | **Pass.** `mask-image` (linear gradients), `backdrop-filter`, `mix-blend-mode`, `filter` are stored and applied on the published page. H-3 closes: masks are native |
| S4 | **Pass with a fix.** Steps, crossfades and the `back.out` overshoot (≈2px) match the spring; the loop point is invisible. My cycle was wrong (8.8s gave the duplicate row a double hold): the cycle is **unique items × step** (6.6s here). Fix pushed, re-check pending |
| S5 | **Pass.** 5s autoplay with linear progress fill, dot width morph 7↔57px, track slide, animated return from the last step; hover pauses mid-motion and resumes; dot clicks jump to their step. Nuance: a jump replays that step's transition from its own start, so jumping two slides ahead snaps to the previous slide first. **Backward clicks** (a smaller index) snap instead of sliding back: IX3 keeps no "current slide" state. Deferred as exception candidate `x-carousel-goto` (decided 2026-09-25) |
| S6 | **Pass.** Marquee speed matches exactly (32.76 vs 32.78 px/s) with no seam |
| All loops | **Fix after your review:** with only two copies, the arc, marquee and ticker drained and left empty edges during the cycle. Copies added per the coverage rule above; re-check pending |

Under reduced motion the loops stay still, as in legacy.

## Build conventions (repo)

- **Page:** `src/pages/MvpHomePage.tsx` on route `/mvp-home`: `div.fk-page` → `Global / Nav` →
  `main` (sections in the order above) → `Global / Footer`, and `useInteractions()`. Legacy `/`
  stays on `pages/HomePage.tsx` until sign-off.
- **Files:** one section per `src/sections/<Name>.tsx` named like its component; UI components in
  `src/components/ui/`; one CSS file per block in `src/styles/components/<block>.css`, imported
  from `src/styles/index.css`. The legacy files that held those names now live in
  `src/sections/legacy/` (moved 2026-09-25, still used by the legacy pages).
- **Blur reveal** (legacy `BlurReveal`): the trigger gets `data-ix="blur-reveal"`; each child is
  wrapped in `div.fk-blur-reveal` (legacy wraps each child in a `motion.div` too, so the wrapper
  exists in both builds) with `is-delay-1` / `-2` / `-3` for the 150ms steps. The interaction adds
  `is-revealed`; the class transition animates opacity, blur and y (spike S1).
- **Staggered reveal** (legacy `[data-reveal]` waves, 90ms): the parent gets
  `data-ix="reveal-stagger"`, each staggered child `data-ix-item`. Plain `data-ix="reveal"` stays
  for single elements.
- **Motion preview:** each new interaction gets one module in `src/ix/<name>.ts` (Web Animations
  or class toggles, same trigger, timing and easing as the registry row), registered in
  `useInteractions.ts`. Never shipped to Webflow.
- **Values:** tokens for system values; local sizes raw only after checking they don't repeat
  (`AGENTS.md` rule 2). Shared blocks: `fk-icon` (+ `is-lg` 40px), `fk-section-header`,
  `UI / Button`, and later `fk-flag`, `fk-avatar`, `fk-pagination`.
- **No Tailwind, no Framer Motion, no inline styles** in new files. Legacy components are read,
  never imported.

## Work plan

| Step | Work | Who |
| --- | --- | --- |
| 1 | Spikes S1–S6 on a draft Lab page | Me (MCP) |
| 2 | Decisions H-1…H-7 with you | You |
| 3 | Size analysis across all sections (which values repeat → shared class or token, which are local), then registry rows: classes per block, shared blocks (`fk-flag`, `fk-avatar`, `fk-pagination`, `fk-icon is-lg`), components, interactions (`ix-blur-reveal`, `ix-hero-arc`, `ix-marquee`, `ix-ticker`, `ix-carousel`, `ix-card-hover`); the only new token planned is the 20px radius (H-5) | Me, drafted by a cheap subagent from the inventories |
| 4 | Asset manifest (≈70 files: photos, SVG icons, flags, logos) → MD5 → `create_asset` + `webflow-upload.mjs` | Cheap subagent prepares the manifest; I run the uploads |
| 5 | Repo: contract CSS + components + sections, one section at a time, `/mvp-home` route | Cheap subagents write each section from its inventory and the contract rules; I review every diff |
| 6 | Repo QA: screenshots legacy `/` vs `/mvp-home` at 4 widths | Browser subagent |
| 7 | Webflow: classes (`webflow-css.mjs`), components, page markup from the repo render, CMS-bound Post Grid, interactions | Me (MCP) |
| 8 | Webflow QA: `webflow-diff.mjs`, element reads, your Designer review at 4 breakpoints | Me + you |
| 9 | Log, registries, roadmap; swap legacy `/` for the contract home only after sign-off | Me |

Order inside steps 5 and 7: Nav/Footer deltas → Logo Marquee → Feature Grid → Post Grid (Home) →
CTA → Two Ways → Partners Map → Hero → How It Works → Testimonials (easiest to hardest, so shared
patterns — reveal, carousel — are proven before the heavy sections).

### Progress

**Wave 1, repo (2026-09-25): done.** Footer deltas, Logo Marquee, Feature Grid + `UI / Service
Card`, Post Grid (Home), CTA (Art) on `/mvp-home`. Measured against legacy `/` at 1310 and 390px:
same boxes for every section (headers, cards, panels, art), marquee speed 33.5px/s (one 1071px set
per 32s) with no empty edge, card hover identical. Section heights differ by 16px only where legacy
pads the bottom of a section and the contract pads the top of the next; the page total is the
same. **Webflow (step 7) done the same day** on draft `/mvp-home`: classes, 2 tokens, 17 assets, 4
components, Collection List, 4 interactions; `webflow-diff.mjs` clean. Visual review pending. Choices
made in review:

- The 436px header width repeats in six sections, so it became the token `width-header`
  (`fk-section-header is-narrow`, `fk-post-grid-header is-center`).
- Legacy panels that pad only vertically (Feature Grid, Two Ways) use `fk-panel is-flush-x`; the
  Feature Grid's extra 20px side inset is local to `fk-feature-grid`.
- Service card icon: one image and a class toggle (`fk-icon is-inverse` + a `filter` transition),
  the S1 technique, instead of crossfading two copies. It reproduces legacy's filter transition.
- No element carries two base classes (`fk-section fk-cta`, `fk-panel fk-cta-panel`): in Webflow
  the second one would become a combo of the first. The CTA panel is its own block, `fk-cta`.
- Texts inside a block get a class with `margin: 0` (Webflow's default `p` has a 10px bottom margin).
- Legacy Related Insights uses `BlurReveal` too, so both Post Grid variants now use the blur reveal.
- The legacy primary CTA's chevron pill stays out (H-8).

**Wave 1 visual check: passed (user, 2026-09-25).**

**Wave 2, repo + Webflow (2026-09-25): done.** Two Ways and Partners Map, built by GPT 5.6 Sol
subagents and reviewed. Partners Map measures identical to legacy at all four widths; its ticker
steps every 2.2s with ~2px overshoot and loops on an identical frame after 30.8s. Two Ways is
identical except two-line card titles (legacy's word masks add 3px per line). Review fixes: the
ticker title and rows had stacked `fk-heading-xl` (and legacy stays 32px up to 1023px, so they got
their own typography); the track's start offset moved from `transform` to `margin-top` so IX3 `y`
starts at 0 as in S4; preview-only word-mask classes became inline styles. Ticker rows are targeted
by `data-ticker-row` attributes instead of per-row combo classes.

**Wave 3, repo + Webflow (2026-09-25): done.** Hero, How It Works and Testimonials (+ `UI /
Testimonial Card`). Repo measured identical to legacy at 1310/800/600 and at 405 for the phone
layout. In Webflow: classes pushed (`webflow-diff.mjs` clean), markup rendered from the repo with
`scripts/webflow-markup.mjs`, 48 images linked, 13 pagination dots as native buttons, components
`Section / Hero`, `Section / How It Works`, `Section / Testimonials` (prop Body) and `UI /
Testimonial Card` (7 instances), and 5 interactions. `/mvp-home` now holds the whole homepage in
legacy order. Review changes:

- Testimonial slides got resting-slot combos (`is-slot-n`). Without them the CSS stacked all seven
  cards at the centre and only the preview script spread them, which IX3 (and reduced motion)
  wouldn't do.
- IX3 allows a scroll trigger only as the sole trigger of an interaction, so How It Works starts on
  load (H-11). Testimonials hover freezes the whole timeline (H-12). Both repo previews match, and
  with reduced motion both leave the progress fill empty, as `dont-animate` does.
- The testimonial spring is a `customEase` path traced from legacy's spring (8 cubic segments, max
  error 0.13px on a 341px move), not the fitted `back.out`.

Still to verify on staging: motion of the three carousels, the `customEase` string format, and the
Two Ways titles.

**Wave 4, repo (2026-09-27): done.** New `Section / Pricing` ("Why Flint is free?"), added between
Two Ways and Partners Map on `/mvp-home` from a fresh Figma pass (nodes 6011:2380, 6011:2507,
6011:2529) — no legacy page carries this section. Built as two equal `flex: 1 1 0` cards (`gap
space-4`, matching `fk-two-ways-cards`) instead of Figma's single 580px card + 480px text block 96px
apart, per direct instruction; the second card carries no background. The avatar photo
(`pricing-avatar.webp`) replaces Figma's placeholder "This is you" ellipse, cropped per the separate
avatar-only Figma node (6011:2529) and scaled to this card's 104px circle. Review fix: the diagram
card's avatar/line/bubbles were first placed with fixed `top`/`left` offsets copied straight from
the Figma canvas; reworked the same day to a plain flex column with padding (no absolute
positioning, no fixed card height), which also removes the earlier `flex-basis`-vs-`height` bug
(`flint-webflow-sync` skill pitfalls). Second pass (user): the dashed connector became a full circle
around the avatar (closer to the reference than the first pass's plain vertical line above it), the
bubbles got a `max-width` (320px, 360px `is-larger` for the wider Flint one) instead of stretching
edge-to-edge so the tertiary background shows around them as in Figma, and the copy card gained
extra left padding for breathing room beyond the cards' own gap. Known regression from that pass:
the "This is you." caption moved to the plain `fk-text-xs` utility and lost its Figma styling (brand
purple, medium weight, 14px) — flagged in `classes.md`, not corrected. Not yet synced to Webflow
(`sync-log.md`).

## Decisions

| ID | Question | Status |
| --- | --- | --- |
| H-1 | With reduced motion, the blur-in CSS transition still runs (IX3 can skip its own tweens, not CSS transitions) | open until spike S1. Recommendation: accept, the element is already visible and only the blur fades |
| H-2 | Hero hover: legacy slows the arc to 0.35×; IX3 can pause but not slow a loop | **decided 2026-09-25: pause on hover.** The 0.35× slow-down is kept as deferred exception candidate `x-hero-arc-speed` (`interactions.md`) |
| H-3 | CSS masks (Two Ways collage, Partners ticker edges, CTA art, testimonial quote fade) if S3 fails | **closed 2026-09-25: native.** S3 passed, so all masks are `mask-image` on their classes |
| H-4 | How It Works card art: rebuild as elements or one image per card | **decided 2026-09-25: one image per card**, rendered from the repo at 2×; titles and body stay live text. **Superseded 2026-09-27 by D-12** (`roadmap.md`): a new Figma pass split each card into a token background, a full-bleed `-bg` raster and an optional floating `-art` illustration |
| H-5 | Service card radius 20px (no token) | **decided 2026-09-25: add a 20px radius token** (named in `tokens.md` when the Feature Grid is built) |
| H-6 | Testimonials drag/swipe (no native equivalent with center weighting) | **decided 2026-09-25: no drag**; autoplay, dots and hover pause stay. Drag is kept as deferred exception candidate `x-testimonial-drag` |
| H-8 | Legacy primary CTAs (Hero, CTA) show a chevron in a translucent pill that brightens on hover; `UI / Button` has no icon by default | **decided 2026-09-25: no chevron.** Accepted difference from legacy; homepage primary buttons are plain `UI / Button` |
| H-9 | How It Works below 422px: legacy scales the carousel continuously with the viewport (`fit = (vw − 24) / 398`, min 0.72); IX3 values are fixed per breakpoint | **decided 2026-09-25: one fixed scale at ≤479 tuned for a 390px phone.** Legacy's viewport is the section's content box, so at 390 fit = (390 − 32 − 24) / 398 = 0.839 (active card 334 × 430). Exact at 390, a few px off at 360–420, smaller than legacy between ~454 and 479 |
| H-10 | Testimonial hover: the quote's fade mask interpolates its gradient end alpha; IX3 can't tween a gradient | **decided 2026-09-25: class toggle + CSS transition of `mask-size` / `mask-position`** (same end states and 0.45s timing, near-identical in-between) |
| H-11 | How It Works plays only while ≥30% of the section is visible and starts at step 1 when first seen; IX3 accepts a scroll trigger only on its own, so visibility control can't share a timeline with hover pause and dot clicks | **decided 2026-09-25: start on page load**, keep hover pause and dot clicks. The carousel keeps cycling off-screen, so a visitor may arrive mid-cycle. The repo preview matches |
| H-12 | Testimonials hover: legacy pauses only the 5s progress clock (a card mid-move finishes its move); IX3 pause freezes the whole timeline | **decided 2026-09-25: accept the freeze**, as the Hero and How It Works already do. The repo preview matches |
| H-7 | Legacy copy typos and placeholders | **decided 2026-09-25: verbatim for parity**; fixes listed in the roadmap content backlog |
