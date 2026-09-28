# Classes (FlowKit v2 naming)

FlowKit v2 naming was approved on 2026-09-23 (roadmap D-01).

This is the only list of classes allowed in the repo and in Webflow. To add a class, add it here
first, then implement it in `src/styles/`, then sync it (see `mcp-playbook.md`).

## Naming rules

| Pattern | Use | Example |
| --- | --- | --- |
| `fk-[block]` | Base class of a component or layout block | `fk-card`, `fk-nav` |
| `fk-[block]-[element]` | Child of a block (one level, never `fk-card-body-title`) | `fk-card-title` |
| `is-[variant]` | Combo class. Only on top of a base class, never alone | `fk-button is-secondary` |
| `fk-heading-*`, `fk-text-*` | Typography | `fk-heading-xl` |

- Lowercase, kebab-case, `fk-` prefix. No underscores, camelCase or IDs.
- An element carries at most: one block/element class, one typography or utility class, and
  **two** combo classes (`fk-button is-secondary is-small`).
- **Webflow stacking gotcha:** when two classes are stacked, Webflow writes any new style to a
  combo of the whole stack. Always create and edit styles on the standalone class, then stack it.
  Block/element classes must not set properties that the stacked typography class also sets.
- A combo class is defined per base class. `fk-panel is-brand` and `fk-text-lg is-brand` are two
  different styles, and both must be listed in the tables below.
- Combo classes toggled by an interaction must be unique site-wide (`is-pill`, `is-menu-open`).
- No page names in classes. Pages differ through variants (`fk-hero is-about`).
- No numbers in names, except grid column counts (`is-3`).
- Don't style unclassed elements, except through tag styles.
- Only `fk-` utilities from the closed list below; everything else is a block class.

## What a class can express

Webflow styles one class (or combo) at a time, at one breakpoint and one state. So in
`src/styles/`:

- **One selector per rule.** No grouped selectors (`.a, .b`), descendant selectors (`.a .b`) or
  child selectors.
- **No parent-state child styling.** `.fk-button:hover .fk-button-icon` has no Webflow equivalent.
  Style the element's own state, or use an interaction.
- **One state per rule**, from: `:hover`, `:active`, `:focus`, `:focus-visible`, `:focus-within`,
  `::placeholder`, `::before`, `::after`, first/last/odd/even child. States can't be combined
  (no `:hover::before`).
- **Media queries only at the §5 breakpoints, written exactly** `@media screen and (max-width: 991px)`
  (or 767/479). No `min-width` queries below 1280px: express "desktop only" as the base value plus
  an override at Tablet. No `prefers-reduced-motion` queries (see `interactions.md`).
- **Write `0px`, not `0`, before a negative value** (`inset 0px -1px …`). The WHTML builder
  minifies `0 -1px` into `0-1px`, which breaks the declaration.
- The WHTML builder only accepts `:hover`, `:focus` and `:active`, and drops a combo name that
  appears on two bases in the same call. `scripts/webflow-css.mjs` leaves out the other states;
  push them (and any dropped combo) with `scripts/webflow-style-actions.mjs` / `create_style`.
- `w--current` (Webflow's current-link state) couldn't be created through the MCP; style it in the
  Designer when the nav links point to real pages.
- **No vendor-prefixed properties** (`-webkit-line-clamp`, `-webkit-font-smoothing`…): the
  style API rejects them, prefixed or not. They go in an exception file (`interactions.md`).
- Colors, fonts, the spacing scale, radii and container widths always use tokens. A raw px size
  is allowed only after checking it's truly local (`AGENTS.md` rule 2): it belongs to one element
  in one block and isn't repeated elsewhere, like an illustration offset or one panel's height.
  Before writing one, search the registries and the other sections for the same value:
  - **Repeated elements share one definition.** Icons (20/24px), avatars, flags, chips, buttons and
    any card size used by more than one block get a shared class (`fk-icon`, `fk-button-icon`) or
    a token, never a copy of the px value in each block.
  - **A value repeated across sections** (the same copy width in several section headers) goes into
    the shared class those sections use, not into each section.

## Layers (apply in this order)

1. **Tag styles:** set the defaults so most text needs no class.
2. **Layout classes:** page, section, panel, container, grid, stack.
3. **Typography classes:** only when an element differs from its tag default.
4. **Component classes:** block + elements + combos.

## Tag styles

**The MCP can't create tag styles, but it can read and update one once it exists.** A tag style
exists after someone edits it once in the Designer (then `update_style` with `style_name: "a"`
works; the WHTML builder still rejects tag selectors). So:

- Every heading and paragraph in synced markup still carries a class that sets its typography
  **and `margin: 0`**, and the body defaults live on `.fk-page`. Nothing breaks if a tag style is missing.
- Tag styles in the table below are seeded once in the Designer (any one property is enough), then
  kept in sync through the MCP like classes.

Seeded so far: **All Links (`a`)** with `text-decoration: none` (2026-09-24). The Body tag style
exists with Webflow's defaults (Arial 14/20, `#333`); `.fk-page` overrides them.

Desktop value, then values at the breakpoints where it changes (Tablet ≤991, Mobile ≤767).
In the repo they live in `src/styles/base.css`, scoped to `:where(.fk-page)` during the transition
(see `AGENTS.md` §8).

| Tag | Font | Desktop | Mobile ≤767 | Color |
| --- | --- | --- | --- | --- |
| Body | `font-sans` 400 | 16/24 | — | `color-ink`; antialiased through exception `x-text-rendering` |
| H1 | `font-serif` 400 | 48/52, −0.96px | 32/40, −0.64px | `color-ink` |
| H2 | `font-serif` 400 | 48/52, −0.96px | 32/40, −0.64px | `color-ink` |
| H3 | `font-serif` 400 | 32/40, −0.64px | 28/36, −0.56px | `color-ink` |
| H4 | `font-sans` 500 | 20/28, −0.11px | 18/28 | `color-ink` |
| P | inherit | inherit | — | inherit |
| Link | inherit | inherit | — | inherit, no underline, color transition 300ms |
| Blockquote | `font-serif` | 24/32, −0.48px | 20/28, −0.4px | `color-ink`, no border or padding |
| Image | — | `display: block`, `max-width: 100%` | — | — |

H1–H4, P, Blockquote and Figure all have `margin: 0`. Webflow's defaults add heading and
paragraph margins, so the tag styles must set them to 0 explicitly.

## Layout

| Class | Definition |
| --- | --- |
| `fk-page` | Page wrapper div, first child of Body (the MCP can't style Body): full width, `min-height: 100vh`, white background, `overflow-x: clip`, plus the body typography defaults (`font-sans` 16/24, `color-ink`). Font smoothing comes from exception `x-text-rendering` |
| `fk-section` | Band wrapper: padding `space-4` inline and top (legacy `px-4 pt-4`); ≤767: `space-2` inline and top, no bottom |
| `fk-section is-last` | Adds `space-4` bottom padding (`space-2` ≤767) |
| `fk-section is-open` | Unpaneled band: padding 128/64 desktop → 96/40 tablet → 64/20 mobile |
| `fk-section is-x-flush` | Zeroes the section's own inline padding; the `fk-container` inside its panel supplies the side gutter instead. **Repo ahead of Webflow (2026-09-27):** replaces `fk-panel is-flush-x`, moved a level up. How It Works |
| `fk-panel` | Rounded (`radius-xl`) band content, `overflow: clip`, `position: relative` (an anchor for absolutely-positioned art inside it, e.g. the CTA ring/photo or the hero card wheel). **Repo ahead of Webflow (2026-09-27):** vertical padding only, `space-24` block → `space-16` block ≤991 (unchanged ≤767) — previously also padded the sides |
| `fk-panel is-brand` · `is-brand-light` · `is-secondary` · `is-tertiary` · `is-surface` | Panel background token |
| `fk-panel is-compact` | Padding-block only: `space-20` → `space-12` ≤991 (unchanged ≤767). **Repo ahead of Webflow (2026-09-27):** fixed from padding all sides to block-only. Footer |
| `fk-panel is-relaxed` | **Repo ahead of Webflow (2026-09-27):** padding-block only, `space-32` → `space-24` ≤991 → `space-16` ≤767. CTA |
| `fk-panel is-hero` | **Repo ahead of Webflow (2026-09-27):** `padding-top: space-36`, `padding-bottom: 0`, no responsive override. Hero |
| `fk-panel is-radius-lg` | Radius `radius-lg` (16px) |
| `fk-panel-content` | **Repo ahead of Webflow (2026-09-27):** flex column, gap `space-16` → `space-10` ≤991 (unchanged ≤767) — the rhythm between a panel's section header and its body. Two Ways, Testimonials, Post Grid |
| `fk-container` | **Page container**: full width, `max-width: width-container` (1200px) including a 20px (`space-5`) gutter on each side as inline padding, centered. Every section's content sits in one |
| `fk-container is-full-height` | **Repo ahead of Webflow (2026-09-27):** `height: 100%`, so a container fills a fixed-height panel. Partners Map |
| `fk-container is-md` · `is-content` · `is-content-sm` | Narrow blocks inside a page container: max width `width-container-md` / `width-content` / `width-content-sm`, no gutter (inline padding 0) |
| `fk-grid` | CSS grid, gap `space-4` |
| `fk-grid is-2` · `is-3` · `is-4` | Columns on desktop. `is-3`/`is-4` → 2 on tablet. All → 1 on mobile |
| `fk-stack` | Flex column, gap `space-4` |
| `fk-stack is-gap-sm` · `is-gap-lg` · `is-gap-xl` | Gap `space-2` / `space-6` / `space-8` |
| `fk-row` | Flex row, wrap, align center, gap `space-2` |

## Typography

Typography classes set font, size, line height and tracking. Color is inherited, or set with a combo.

| Class | Desktop | Mobile ≤767 | Notes |
| --- | --- | --- | --- |
| `fk-heading-display` | serif 72/80, −1.08px | 48/52, −0.72px | Stat numbers |
| `fk-heading-display is-xl` | serif 96/96, −1.44px | 40/44, −0.8px | About stats. Tablet: 72/80, −0.8px |
| `fk-heading-xl` | serif 48/52, −0.96px | 32/40, −0.64px | Same as H1/H2, for non-heading tags |
| `fk-heading-lg` | serif 40/44, −0.8px | 32/40, −0.64px | Blog/article heroes, Post Grid title |
| `fk-heading-md` | serif 32/40, −0.64px | 28/36, −0.56px | Same as H3 |
| `fk-heading-sm` | serif 24/32, −0.48px | 20/28, −0.4px | Quotes |
| `fk-text-lg` | sans 18/28 | 16/24 | Lead and long-form body |
| `fk-text-md` | sans 16/24 | — | Explicit body size |
| `fk-text-sm` | sans 14/20 | — | Meta |
| `fk-text-xs` | sans 12/16 | — | Badges, captions |
| `fk-eyebrow` | sans 16/24 | — | `color-subtle`. Label above section headings |

Combos in use (add a row here before using a new pair):

| Base | Combo | Definition |
| --- | --- | --- |
| `fk-heading-xl` | `is-inverse` | `color-white` |
| `fk-heading-md` | `is-center` | `text-align: center` |
| `fk-heading-sm` | `is-sans` | `font-family: font-sans` (used where a block wants the sans weight instead of the serif default). **Repo ahead of Webflow (2026-09-27):** Two Ways card title |
| `fk-text-lg` | `is-brand-muted` | `color-brand-80` |
| `fk-text-lg` | `is-subtle` | `color-subtle`. **MVP 2:** Pricing card copy |
| `fk-text-lg` | `is-inverse-muted` | `color-white-80` |
| `fk-text-md` | `is-brand-muted` | `color-brand-80`. **Repo ahead of Webflow (2026-09-27):** Two Ways eyebrow, Logo Marquee label |
| `fk-text-md` | `is-subtle` | `color-subtle` |
| `fk-text-md` | `is-inverse-muted` | `color-white-80` |

## Utilities (closed list)

| Class | Definition |
| --- | --- |
| `fk-sr-only` | Visually hidden, accessible to screen readers |
| `fk-hide-mobile` | `display: none` at ≤767 |
| `fk-hide-desktop` | `display: none` above 991 |
| `fk-hide-tablet` | `display: none` at ≤991 (tablet and below). **Repo ahead of Webflow (2026-09-27):** hides the secondary button next to the nav's mobile toggle |
| `fk-divider` | On an `hr`: a 1px-tall fill in `color-white-10` (no border), full width, no margin. No combos |

Scroll reveals use attributes (`data-ix="reveal"`, `"reveal-stagger"` + `data-ix-item`,
`"blur-reveal"`; see `interactions.md`). The blur reveal also needs its class, because IX3 can't
tween `filter`:

| Class | Definition |
| --- | --- |
| `fk-blur-reveal` | Wrapper around each child of a `data-ix="blur-reveal"` trigger: opacity 0, `blur(16px)`, `translateY(16px)`, transition 750ms ease-in-out on all three |
| `fk-blur-reveal is-delay-1` · `is-delay-2` · `is-delay-3` | Transition delay 150 / 300 / 450ms (legacy `BlurReveal` steps) |
| `fk-blur-reveal is-revealed` | Added by `ix-blur-reveal`: opacity 1, blur 0, no offset. Stacks on a delay combo |

## Component classes

Elements listed are the complete allowed set per block. States use Webflow states (Hover,
Pressed, Focused-keyboard) and map to `:hover`, `:active`, `:focus-visible` in CSS.
Blocks marked **MVP** are implemented in `src/styles/components/`.

| Block | Elements | Combos | Notes |
| --- | --- | --- | --- |
| `fk-flag` **MVP 2** | — | `is-lg` | A country flag SVG image, 20×20 (Hero chips); `is-lg` 32×32 (testimonial cards). Position it with the parent block, not on the flag |
| `fk-pagination` **MVP 2** | `-dot`, `-bar`, `-fill` | `fk-pagination-bar is-active` | Carousel dots (How It Works, Testimonials): row, gap 4.5px (local). `-dot` is a native button (border reset, 8px vertical padding, `:focus-visible` ring); `-bar` 7×7 `color-neutral-100`, clips; `is-active` 57px wide on the starting dot only; `-fill` absolute, width 0, `color-neutral-700`. IX3 targets `[data-dot]` (click), `[data-dot-bar]` (width 7 ↔ 57) and `[data-dot-fill]` (width 0 → 100%), values prefixed per carousel (`how-1`, `tm-1`). Page markup, not a component (`components/ui/Pagination.tsx` renders it) |
| `fk-icon` | — | `is-lg`, `is-sm`, `is-inverse` | An SVG icon image, 24×24, `display: block`, transition `filter` 300ms `cubic-bezier(0.16, 1, 0.3, 1)`. Used inside controls (nav toggle and close). Icons come from `src/assets/icons/`; color and shape live in the file. `is-lg`: 40×40 (service cards). `is-sm`: 16×16 (Pricing message-bubble and checklist icons, **MVP 2**). `is-inverse`: `filter: brightness(0) invert(1)`, added by `ix-card-hover` so the filter transition turns the icon white |
| `fk-button` **MVP** | `-icon` | `is-secondary` (white), `is-small`, `is-full` (`width: 100%`, for a button that fills its container, e.g. the mobile menu; repo only, not in Webflow yet) | Base = primary. Link with an unclassed text span. Padding: 10 × 20 (`space-2-5` / `space-5`); small 6 × 14 (`space-1-5` / `space-3-5`). No icon by default. The class holds the static legacy gradient (349.52deg); the hover rotates it 180° over 700ms through exception `x-button-gradient` (interactions.md), and until that's installed Webflow shows only the hover shadow. Pressed: no shadow, text `color-white-60`. `-icon` is an optional 20×20 SVG image after the label |
| `fk-nav` **MVP** | `-logo` (49×24), `-links`, `-link`, `-actions`, `-cta`, `-cta-rest`, `-toggle`, `-menu`, `-menu-panel`, `-menu-header`, `-menu-close`, `-menu-links`, `-menu-link`, `-menu-footer` | `fk-nav is-pill` (scrolled), `fk-nav-menu is-menu-open`, `fk-nav-link w--current`, `fk-nav-menu-link w--current` | Centered with `left/right: 0` + auto margins, never a transform (the fixed menu is a child). `is-pill` transitions width/top/padding/background. One CTA (Secondary Small) in both states; `-cta-pill` was removed on 2026-09-24. `-toggle` and `-menu-close` are native 40×40 buttons holding an `fk-icon` (`menu.svg`, `x-mark.svg`): they reset the border and have a `:focus-visible` ring. **Repo ahead of Webflow (2026-09-26):** bar `top` `space-4` (tablet `space-2`, width `100% − 2 × space-2`) with `space-3` vertical padding (tablet `space-3` / `space-5`, also on `is-pill`). The mobile menu is a full-height white frame (`height: 100%`, padding `space-2`, `overflow: hidden`) around `-menu-panel`: a flex column, `space-between`, gap `space-6`, `color-secondary`, `radius-xl`. Header padding `space-3` / `space-5`; `-menu-links` scrolls if needed (`overflow-y: auto`, no gap or top margin; `overscroll-behavior: contain` on `-menu` and `-menu-links` comes from exception `x-scroll-lock`); each `-menu-link` has padding `space-3` / `space-6`, `color-subtle`, current page `color-ink` (was brand); `-menu-footer` padding `space-6` holding a Secondary `UI / Button` at full width (`fk-button is-full`) |
| `fk-footer` **MVP** | `-panel`, `-cta`, `-cta-text`, `-groups`, `-group`, `-group-title`, `-links`, `-link`, `-logo` (49×24), `-bottom` | — | Panel padding 80 → 48 → 32. `-cta-text` and the button's wrapper are blur-reveal triggers; `-groups` is a `reveal-stagger` parent with each group title and link as an item. **Repo ahead of Webflow (2026-09-26):** ≤767 the footer gets `space-2` padding and the panel gap `space-8` with padding `space-12` / `space-5` / `space-10` / `space-5`; `-cta` stacks in a column at ≤767 only (no longer at tablet); `-groups` are 2 columns; the bottom bar no longer stacks at ≤767 |
| `fk-section-header` **MVP** | `-body` | `is-center`, `is-inverse`, `is-narrow` | Flex column, gap `space-4`. Eyebrow uses `fk-eyebrow`, title `fk-heading-xl`. `-body` stays left-aligned and stacks with `fk-text-lg is-brand-muted`. `is-center`: centered text, **repo ahead of Webflow (2026-09-27)** also `margin: 0 auto` (so a centered narrow header sits centered inside a wider panel). `is-narrow`: full width up to **repo ahead of Webflow (2026-09-27)** `width-content-sm` (480px, was 436px; token `width-header` removed 2026-09-27). With a blur reveal, each child sits in an `fk-blur-reveal` wrapper (Hero, How It Works, Feature Grid, Testimonials, Two Ways, Post Grid, CTA) |
| `fk-stats-band` **MVP** | `-grid` | — | Grid is a flex row (120px tall) on desktop, 2-column grid below |
| `fk-stat` **MVP** | `-value`, `-suffix`, `-label` | — | Value number stacks `fk-heading-display is-xl`. `-value` is the `ix-count-in` target |
| `fk-post-card` **MVP** | `-media`, `-image`, `-body`, `-title`, `-excerpt`, `-meta`, `-avatar`, `-meta-text` | `is-featured` | Bound to Posts. Title and excerpt clamp to 2 lines through exception `x-text-rendering` (the classes only carry `overflow: hidden`). The image zooms on its own hover. **Repo ahead of Webflow (2026-09-27):** Section / Post Grid itself has no dedicated classes any more — it's the shared `fk-section` > `fk-panel is-brand-light` > `fk-container` > `fk-panel-content` shell, holding `fk-section-header is-center is-narrow` (title `fk-heading-lg`, body `fk-text-md is-subtle`, each in `fk-blur-reveal`) and an `fk-grid is-3` of post cards. `fk-post-grid`, `fk-post-grid-header` (+ `is-center`) and `fk-post-grid-action` were removed as dead CSS. Decision: Post Grid is a reusable section with fixed content — title "The Flint blog", body copy and the "See all posts" button are hardcoded (no props), used as-is on every page that needs it (see `components.md`) |
| `fk-hero-*` **MVP 2** | `-action`, `-stage`, `-wheel`, `-card`, `-card-image`, `-card-chip`, `-card-name` | `fk-hero-card is-a1`…`is-a20`; `fk-hero-card-image is-c1`…`is-c10` | **Repo ahead of Webflow (2026-09-27):** Section / Hero (Home) has no `fk-hero` panel class or `fk-hero is-home` combo any more — it's `fk-section is-last` > `fk-panel is-secondary is-hero` (padding-top `space-36`, no bottom padding, no responsive override) > `fk-container` > `fk-section-header is-center is-narrow` (blur reveal) holding `-action` (pt 16 → 8), then `-stage` as the panel's next sibling (the old `-content` and `-stage-wrapper` wrappers were removed as dead CSS). `-stage` (`data-ix="hero-arc"`) is `position: relative`, `margin-top: space-12`, 355px high (240 ≤767). `-wheel` fills the stage, `transform-origin: 50% 3532px`, rotated by `ix-hero-arc`. `-card` 220×264 peach, radius `radius-xl` (legacy 26), placed at the stage top-centre with `transform-origin: 110px 3532px` and a static angle per `is-a1…a20` (−80.556° … +25°, step 5.556°: two copies of the 10 candidates, coverage rule). `-card-image` crops per candidate (`is-c1…c10`, local). `-card-chip` white pill (flag `fk-flag` + `-card-name` sans 14/20 medium brand) |
| `fk-card` **MVP 2** | `-body`, `-title`, `-text` (`-media` later) | `-text is-subtle` | Base = service card: white, radius `radius-lg-plus` (20px), padding `space-6`, flex column with space-between, full height of its grid cell. Title sans 16/24 medium `color-ink` at 0.8; text sans 16/24 `color-brand` at 0.8 (local to the card). Icon is `fk-icon is-lg`, omitted when the card has none (Role Grid). `-body` is a blur-reveal trigger. Hover: `ix-card-hover`. `-text is-subtle`: `color-subtle` instead of `color-brand` (Role Grid). Combos (`is-feature`…) are added when another card type is migrated |
| `fk-feature-grid` **MVP 2** | `-cards`, `-item` | — | Section / Feature Grid inside `fk-container`: flex column centered, gap 64 → 40 (≤767), inline padding `space-5` → 0 (≤767) so the sides total legacy's 40px. `-cards`: grid 3 / 2 (≤991) / 1 (≤767) columns, gap `space-2`, rows 244px on desktop, auto below. `-item` (the `data-ix-item`): full height, min-height 240px ≤991 |
| `fk-role-grid` **local only** | `-cards` | — | Section / Role Grid, inside `fk-panel is-brand-light` > `fk-container`: flex column centered, gap `space-16` → `space-10` (≤767). The `UI / Button` sits directly in the section header's own `fk-blur-reveal` (no dedicated action wrapper — unlike Hero/CTA, it needs no extra top padding beyond the header's `space-4` gap). `-cards`: grid 3 / 2 (≤991) / 1 (≤767) columns, gap `space-2`, auto row height (cards have no icon, so they're shorter than Feature Grid's). Not yet pushed to Webflow |
| `fk-logo-marquee` **MVP 2** | `-label`, `-viewport`, `-track`, `-row`, `-logo`, `-fade` | `fk-logo-marquee-fade is-left` · `is-right` | Full-width flex row (column ≤767), gap `space-14` (**repo ahead of Webflow, 2026-09-27:** was a raw 56px, now the `space-14` token) → `space-6` ≤767, padding `space-8`/`space-12` (`space-8`/`space-5` ≤767). `-label` is the blur-reveal trigger. `-viewport` 36px tall, clips. `-track` holds 3 `-row` copies (coverage rule) and is the `ix-marquee` target. `-row` gap and right padding `space-12`. `-logo` 36px tall at 0.8 opacity; each width is set on the image (132/96/101/187/146/121). `-fade` white gradients `space-32` → `space-12` wide. 36px is local |
| `fk-two-ways-*` **MVP 2** | `-cards`, `-card`, `-art`, `-canvas`, `-nurse-right`, `-nurse-left`, `-nurse-center`, `-orb`, `-facility-image`, `-content`, `-copy`, `-action` | `fk-two-ways-card is-brand-light` · `is-secondary`; `fk-two-ways-art is-nurses` · `is-facilities`; `fk-two-ways-orb is-left` · `is-right` | **Repo ahead of Webflow (2026-09-27):** Section / Two Ways moved into the shared shell — `fk-section` > `fk-panel` > `fk-container` > `fk-panel-content` (the header-to-cards gap, `space-16` → `space-10` ≤991, now comes from `fk-panel-content`, not from `fk-two-ways`), holding `fk-section-header is-center is-narrow` and `-cards`; the `fk-two-ways` base class, and its `-eyebrow`/`-title`/`-body` element classes, were removed as dead CSS (`-copy`'s eyebrow/title/body now use the shared typography classes `fk-text-md is-brand-muted`, `fk-heading-sm is-sans`, `fk-text-md is-subtle`). `-cards`: two banners in a row, gap `space-4`, stacked ≤991. Art frame 172px high with `mask-image` (linear on nurses, radial on the facility photo); nurse photos and orbs are absolutely placed on a 592px canvas (local collage geometry, orbs `blur(12.55px)`). The card is the `ix-two-ways-card` trigger; the CTA sits in `fk-blur-reveal` (no trigger attribute: the card timeline adds `is-revealed`) |
| `fk-pricing-*` **MVP 2** | `-cards`, `-card`, `-card-content`, `-header`, `-avatar-wrapper`, `-avatar`, `-thread`, `-line`, `-bubble`, `-bubble-icon`, `-bubble-body`, `-bubble-name`, `-bubble-detail`, `-copy`, `-checklist`, `-checklist-item`, `-checklist-icon` | `fk-pricing-card is-diagram` · `is-copy`; `fk-pricing-bubble is-larger`; `fk-pricing-bubble-icon is-plain` | Section / Pricing, new (Figma nodes 6011:2380 header/cards, 6011:2529 avatar crop; no legacy source), placed on `/mvp-home` between Two Ways and Partners Map: `fk-section` > `fk-panel` > `fk-container` > `fk-panel-content`, holding `fk-section-header is-center is-narrow` (blur reveal) and `-cards`. **Deviates from Figma on request:** Figma shows one 580px card and a 480px text block 96px apart; built instead as two equal `flex: 1 1 0` cards (`-cards`: gap `space-4`, stacked ≤991), the second (`is-copy`) with no background. **Card content uses flex and padding, not absolute positioning** (reworked 2026-09-27 after review — an earlier pass placed the avatar/line/bubbles with fixed `top`/`left` offsets copied from the Figma canvas; every element now flows normally and the card's height comes from its content, not a fixed value). `-card` (shared by both variants): flex, centered both axes, padding `space-24`/`space-10` (96/40, ≤991 inline only → `space-20`, ≤767 → `space-8`/`space-5`), `radius-2xl`; `is-diagram` adds `color-tertiary`; `is-copy` overrides to an asymmetric `padding-inline: space-20 0` (80px from the diagram card, flush on the outer edge — extra breathing room beyond the cards' own `space-4` gap; ≤767 both sides 0). `-card-content`: a plain flex column holding each variant's real content; children space themselves with their own margin, not a parent gap. In `is-diagram`: `-header` (centered, gap `space-2`) holds the "This is you." caption — plain `fk-text-xs`, no dedicated class — and `-avatar-wrapper` (104px circle, `1px dashed color-peach-200` border, padding `space-2`, framing `-avatar`: an 86px circle image, `color-sand-100` fallback background, `object-fit: cover`, `object-position: top`, cropping `Image 49.png` — replaces Figma's placeholder "This is you" ellipse). Then `-thread` (`padding-top: space-6`, gap `space-5`, `position: relative` only so `-line` — a decorative dashed connector, `height: 100%`, `z-index: 0` — can span behind it): the three `-bubble`s stack in normal flow (`position: relative; z-index: 1`, full width capped at `max-width: 320px`, `is-larger` 360px for the wider Flint bubble, centered by `-thread`'s own `align-items: center`), so the dashed line shows only through the gaps between them — it is never used to place the bubbles themselves. `-bubble`: white, `radius-xl`, backdrop-blur, "Pricing bubble" shadow (`tokens.md`); `-bubble-icon` 40×40 `color-brand-foreground` circle holding `fk-icon is-sm` (facility.svg), `is-plain` drops the background/padding for the Flint bubble's own circular logo asset (`Flint-logo-brand-circle.svg`, self-contained). In `is-copy`: `-copy` (heading `fk-heading-md` + body `fk-text-lg is-subtle`, gap `space-2`, `margin-bottom: space-6` in place of a parent gap) then `-checklist` (gap `space-4`), each `-item` a 28px `color-brand-light` circle (`fk-icon is-sm`, checkmark.svg) + `fk-text-md` label. **Known gap:** the "This is you." caption lost its Figma styling (brand purple, medium weight, 14px) when it moved to the plain `fk-text-xs` utility (12px, `color-ink`, regular) — flagged, not corrected, pending a decision on whether it's worth a one-off class or a new `fk-text-xs` combo |
| `fk-partners-map` **MVP 2** | `-image`, `-overlay`, `-content`, `-inner`, `-heading`, `-title`, `-viewport`, `-track`, `-row` | `fk-partners-map-row is-active` | Section / Partners Map panel (own block, `fk-section is-last` around it for legacy's 32px gap below): 680px high (420 ≤767), `radius-xl`, map photo `blur(3px)` scale 1.05 under a local `rgba(0,0,0,0.6)` overlay. Content row max 900px (column ≤991). `-inner` gap **repo ahead of Webflow (2026-09-27):** `space-19` (was a raw 76px) between the heading and the ticker viewport. Title and rows serif 48/52 −0.96px white (32/40 −0.64px ≤991, legacy switches at `lg`). Viewport 340px × panel height with pl 20 (280 × 180 ≤991) and a vertical `mask-image` fade. `-track` (`data-ix="ticker"`) starts at `top: 50%` with `margin-top: −390px` (row 7 centred) and holds 29 rows: 7 padding, 14 states, the duplicate New York, 7 padding (coverage rule). Rows 52px high at 0.2 opacity; `is-active` (1) only on the starting row; each row has `data-ticker-row="n"` for IX3 targeting |
| `fk-cta-*` **MVP 2** | `-ring`, `-ring-image`, `-room`, `-window`, `-window-image`, `-photo`, `-action` | — | **Repo ahead of Webflow (2026-09-27):** Section / CTA (Art) sits in a plain `fk-section` > `fk-panel is-tertiary is-relaxed` (padding-block `space-32` → `space-24` ≤991 → `space-16` ≤767, `position: relative` from `fk-panel`) > `fk-container` > `fk-section-header is-narrow`; the `fk-cta` panel base class (560px fixed height, its own padding and `z-index: 0` stacking context) was removed as dead CSS — `fk-panel`'s own `position: relative` now anchors the absolutely-positioned art. Ring and window use `mask-image` (`cta-ring.svg`, `cta-circle.svg`); room photos mirrored with `scaleX(-1)`. All art offsets are local (Figma 1408×560 card), still hidden ≤767 |
| `fk-testimonials-*` **MVP 2** | `-row`, `-slide`, `-pagination` | `fk-testimonials-slide is-center`, `fk-testimonials-slide is-slot-0`…`is-slot-6` (no `is-slot-3`) | **Repo ahead of Webflow (2026-09-27):** Section / Testimonials (Slider) sits in `fk-section` > `fk-panel is-brand-light` (`[data-ix="testimonials"]`, `ix-testimonials`'s target) > `fk-panel-content` > `fk-container` (header) + `-row` + `-pagination`; the `fk-testimonials` panel class (1102px fixed height) and `-header` (absolute positioning) were removed as dead CSS, now that the header sits in normal flow inside `fk-panel-content`. `-row` (`height: 488px`, `position: relative`) holds seven slides (`data-tm-slide="1…7"`) absolutely placed at left 50%, scale 0.8 / opacity 0.6. Each slide's resting slot is a combo (`is-slot-n`: translateX −1236.24 / −895.44 / −554.64 / 158.64 / 499.44 / 840.24px, local), so the row is laid out before and without `ix-testimonials` (reduced motion); `is-center` (slot 3, card 4) scale 0.88, opacity 1, z-index 1. Moved by `ix-testimonials` |
| `fk-testimonial-card` **MVP 2** | `-media`, `-image`, `-gradient`, `-scrim`, `-quote`, `-quote-text`, `-flag`, `-person`, `-name`, `-role` | `fk-testimonial-card-quote is-open` | UI / Testimonial Card: 396×488 canvas, radius `radius-2xl`, photo box 612×798 at top −71 (centred), static bottom gradient (transparent 61.475% → black), `-scrim` full gradient at opacity 0.6 (0.9 on hover), `-quote` left 32, 338 wide, bottom 110, 104px high (160 on hover), serif 24/32 white with a mask that `is-open` moves (transition 0.45s, decision H-10); flag wrapper bottom/right 32 with `fk-flag is-lg`; name sans 16/24 medium white, role 16/24 white at 0.6 |
| `fk-faq` | `-item`, `-question`, `-icon`, `-answer` | `-item.is-faq-open` | Accordion |
| `fk-marquee` | `-track`, `-item` | `is-slow` | CTA marquee on Candidates (`FacilityCta.tsx`). Reuse `fk-logo-marquee`'s structure when it's migrated |
| `fk-newsletter` | `-title`, `-form`, `-field`, `-submit` | `is-stacked` | Default layout is a row |
| `fk-field` | — | `is-select` | Inputs/selects. Focus: brand border + field-active shadow |
| `fk-badge` | — | `is-inverse` | Category and status pills |
| `fk-portrait` | `-image` | `is-peach`, `is-sand`, `is-brand` | Rounded image pills (About hero, avatars) |
| `fk-how` **MVP 2** | `-reveal`, `-viewport`, `-track`, `-slide`, `-card`, `-bg`, `-scrim`, `-art`, `-copy`, `-title`, `-body`, `-pagination` | `fk-how-slide is-active`, `fk-how-card is-active`, `fk-how-card is-brand-light`, `fk-how-copy is-inverse` | Section / How It Works (Home): white, no panel — sits in `fk-section is-x-flush` (moved off `fk-panel is-flush-x`, 2026-09-27) with its own flex column, gap `space-12`, padding `space-24` block. **Repo ahead of Webflow (2026-09-27):** `-inner` and `-header` were removed as dead CSS — the header sits directly in `fk-container` as `fk-section-header is-center is-narrow` (`width-content-sm`, no separate `-header` wrapper). `-viewport` (`data-ix="how-carousel"`) 512px high (380 ≤767), clips. `-track` at `left: calc(50% − 199px)`, gap 32, moved −392px per step. `-slide` (`data-how-slide`) 360×464, `is-active` 398×512; `-card` (`data-how-card`) a fixed 360×464 box centred in its slide, radius `radius-xl` (fixed from a raw `space-6` value, 2026-09-27; local, not the same 32px as `-card`'s own `radius-2xl`), scale 1 / `is-active` 1.10556, background `color-tertiary` (`is-brand-light`: `color-brand-light`, card 5 "Start work"). **Repo ahead of Webflow (2026-09-27, decision D-12, supersedes H-4):** card art split into `-bg` (full-bleed photo/gradient/pattern, `object-fit: cover`, one of six `how-card-bg-*.png`, absolute `inset: 0`) and `-art` (a floating illustration widget, one of five `how-card-art-*.png`; card 4 "Relocate" has none), both under the live `-copy` (title sans 20/28, body). `-art` insets `space-8` left/right like `-copy` (width auto, height from the asset's own ratio); only `top` is local per card (raw px, one card each: 50 / 29 / 94 / — / 0 / 32). `-scrim` is a plain element (`linear-gradient(to top, rgba(0,0,0,.6), transparent 60%)`, full `inset: 0`) on cards 2 and 6 only, where inverse copy sits over a photo `-bg`. Phone (≤479, decision H-9): slides 302.11×389.39 / 334×429.67, gap 29.94, cards scale 0.8392 / 0.9278, track at 50% − 167px |
| `fk-illustration` | — | — | Frame for a Lottie illustration (`interactions.md`) |
| `fk-article` | `-toc`, `-toc-link`, `-body`, `-quick-answer` | — | CMS template. `-body` styles the Rich Text element |

## Lab classes (temporary)

`fk-lab-*` classes exist only on the draft Webflow page `/lab` for MVP 2 capability spikes
(`mvp2-home.md`): `-row`, `-mask`, `-glass`, `-blend`, `-blur`, `-marquee(-track/-row)`, `-chip`,
`-arc(-wheel/-card is-a1…a15)`, `-label`, `-ticker(-list/-row is-r0…r5)`, `-carousel(-track)`,
`-slide`, `-dots`, `-dot is-d1…d3`, `-dot-fill is-f1…f3`, `-reveal`, `-reveal-item is-delay-1/2
is-revealed`. They are never used in `src/` and are deleted with the Lab page (with confirmation)
once the spikes are recorded.

## Example

From `src/sections/TextPanel.tsx` + `src/components/ui/SectionHeader.tsx`:

```html
<section class="fk-section">
  <div class="fk-panel is-tertiary is-radius-lg">
    <div class="fk-container is-content-sm" data-ix="reveal">
      <div class="fk-section-header is-center">
        <p class="fk-eyebrow">Mission</p>
        <h2>Why we exist</h2>
        <div class="fk-section-header-body fk-text-lg is-brand-muted">
          <p>…</p>
        </div>
      </div>
    </div>
  </div>
</section>
```

This replaces the legacy `AboutPage.tsx` markup, which repeated a
`font-serif text-[32px] leading-10 tracking-[-0.64px] … md:text-[48px]` string in every section. The H2 now
gets its style from the tag style.
