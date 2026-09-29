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
| `fk-[utility]`, `fk-[utility]-[breakpoint]` | Utility, stacked after the main class (see Utilities) | `fk-flex fk-gap-4`, `fk-hidden-tablet` |

- Lowercase, kebab-case, `fk-` prefix. No underscores, camelCase or IDs.
- An element carries one main class (a primitive, block/element or typography class), at most
  **two** combo classes on it (`fk-button is-secondary is-small`), and any number of utilities
  after it (`fk-text-md fk-color-subtle`). Utilities never carry combos.
- **Webflow stacking gotcha:** when two classes are stacked, Webflow writes any new style to a
  combo of the whole stack. Always create and edit styles on the standalone class, then stack it.
  Block/element classes must not set properties that the stacked typography class also sets, and
  a utility never sets a property its element's main class sets (between two single classes
  Webflow decides the CSS order). That holds **across breakpoints** too: a base utility must not
  set a property the main class changes at a breakpoint (in Webflow the block's breakpoint rule
  wins, in the repo `utilities.css` loads last and the utility wins, so the two would diverge);
  keep such a property fully in the block. The reverse is allowed: a responsive utility may
  override a main-class property at a breakpoint where the main class doesn't set it
  (`fk-hidden-tablet` on a flex block), since breakpoint rules come after base rules in both.
- **Interaction targets are classes or `data-*` attributes, never utilities or typography
  classes.** Before removing a class from markup, grep `src/ix/` and `interactions.md`. Text that an
  interaction splits or animates gets a `data-*` hook (`data-two-ways="title"`).
- A combo class is defined per base class. `fk-panel is-brand` and `fk-text-lg is-brand` are two
  different styles, and both must be listed in the tables below.
- Combo classes toggled by an interaction must be unique site-wide (`is-pill`, `is-menu-open`).
- No page names in classes. Pages differ through variants (`fk-hero is-about`).
- No numbers in names, except sequence combos (`is-delay-1`, `is-a1`…) and utilities, which
  mirror token names or counts (`fk-gap-4` ↔ `space-4`, `fk-cols-3`).
- Don't style unclassed elements, except through tag styles.
- Only utilities from the closed list below (generated, `scripts/gen-utilities.mjs`); everything
  else is a primitive or block class.

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
- `w--current` (Webflow's current-link state) and `w--open` (an open Dropdown, used by
  `fk-input-field is-select`) can't be created through the MCP; style them in the Designer
  (`w--current`: nav links, dropdown links, the current page in `fk-pagination`). Don't try
  `create_style` with `name: "w--current"` and a parent: on production (2026-09-29) it creates an
  ordinary combo class *named* `w--current` (selector `.fk-nav-link._w--current`), not Webflow's
  state. The push script skips the five rules that use these states
  (`fk-nav-link`, `fk-nav-menu-link`, `fk-dropdown-link`, `fk-pagination-page` + `w--current`,
  `fk-input-field.is-select` + `w--open`) and `webflow-diff.mjs` ignores them.
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

- Every heading and paragraph in Webflow markup still carries a class that sets its typography
  **and `margin: 0`**, and the body defaults live on `.fk-page`. Nothing breaks if a tag style is missing.
- Tag styles in the table below are seeded once in the Designer (any one property is enough), then
  kept in sync through the MCP like classes.

**Status (production, 2026-09-29): all nine seeded and synced from `base.css`, diff clean.**
Webflow names them by bare tag: `body`, `h1`–`h4`, `p`, `a`, `blockquote`, `img` (ids `default-<tag>`,
`type: "tag"`); `update_style` targets them with `style_name: "h1"` and no `parent_style_names`.
Webflow has no `figure` tag style until one is seeded in the Designer, so `figure { margin: 0 }`
isn't pushed (`webflow-style-actions.mjs --tags` skips it). Webflow's own defaults (Body Arial 14/20,
headings 700 with their own sizes, Blockquote 5px `#E2E2E2` left rule) are overwritten or removed,
so `.fk-page` on the wrapper div and the tag styles now agree. Body font family and color and every
heading color and font family link the Flint variables by id. Breakpoints: the repo only has a ≤767
query, so Tablet and Mobile portrait hold nothing (they inherit). `node scripts/webflow-style-actions.mjs --tags
src/styles/base.css` prints the actions; `webflow-diff.mjs` takes `base.css` among its files.

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
| `fk-section is-padded-bottom` | Adds `space-4` bottom padding (`space-2` ≤767). For a band that needs a gap below it (the Hero). A page's last section before the footer doesn't use it: the footer has its own top padding |
| `fk-section is-open` | Unpaneled band: padding 128/64 desktop → 96/40 tablet → 64/20 mobile |
| `fk-section is-x-flush` | Zeroes the section's own inline padding; the `fk-container` inside its panel supplies the side gutter instead. How It Works |
| `fk-panel` | Rounded (`radius-xl`) band content, `overflow: clip`, `position: relative` (an anchor for absolutely-positioned art inside it, e.g. the CTA ring/photo or the hero card wheel). Vertical padding only, `space-24` block → `space-16` block ≤991 (unchanged ≤767). The panel background is never a combo: it comes from the `fk-bg-*` utilities (`css-system.md`), stacked after `fk-panel` (e.g. `fk-panel fk-bg-secondary is-hero`) |
| `fk-panel is-compact` | Padding-block only: `space-20` → `space-12` ≤991 (unchanged ≤767). Footer |
| `fk-panel is-relaxed` | Padding-block only, `space-32` → `space-24` ≤991 → `space-16` ≤767. CTA |
| `fk-panel is-blog-hero` | Panel of Section / Blog Hero (Figma `5674:3866`, `5754:2221`): `padding-top: space-36` (144px, the title clears the fixed Nav, same as `is-hero`), `padding-bottom: space-20`, `space-8` ≤767 (no Tablet override). Sits before the `fk-bg-*` utility |
| `fk-panel is-snug` | Compact band: padding-block `space-10` (40px), ≤767 `space-6` top and `space-4` bottom (Figma `5763:2625`). Newsletter |
| `fk-panel is-tight-bottom` | `padding-bottom: space-12` (Figma `5674:3967`: 48px under the pagination), back to the standard `space-16` ≤991. Post Index |
| `fk-panel is-hero` | `padding-top: space-36`, `padding-bottom: 0`, no responsive override. Hero |
| `fk-panel is-radius-lg` | Radius `radius-lg` (16px) |
| `fk-panel-content` | Flex column, gap `space-16` → `space-10` ≤991 (unchanged ≤767) — the rhythm between a panel's section header and its body. Two Ways, Testimonials, Post Grid |
| `fk-container` | **Page container**: full width, `max-width: width-container` (1200px) including a 20px (`space-5`) gutter on each side as inline padding, centered. Every section's content sits in one |
| `fk-container is-md` · `is-content` · `is-content-sm` | Narrow blocks inside a page container: max width `width-container-md` / `width-content` / `width-content-sm`, no gutter (inline padding 0) |

**Grids are utilities, not a layout class:** `fk-grid` is the `display: grid` utility, with no `is-2`/`is-3`/`is-4` combos. Columns come from `fk-cols-1…4` (+ `-tablet`/`-mobile`/`-phone`) and the gap from `fk-gap-*`. The Post Grid is `fk-grid fk-cols-3 fk-cols-2-tablet fk-cols-1-mobile fk-gap-4`; Role Grid and Feature Grid cards use the same columns with `fk-gap-2`.

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
| `fk-heading-md` | `is-center` | `text-align: center` |
| `fk-heading-sm` | `is-sans` | `font-family: font-sans` (used where a block wants the sans weight instead of the serif default). Two Ways card title |

Typography classes have no color combos: text color comes from the `fk-color-*` utilities (`css-system.md`), stacked after the typography class (e.g. `fk-text-lg fk-color-brand-80`, `fk-text-md fk-color-subtle`).

## Utilities (closed list)

The utilities layer (`docs/webflow/css-system.md`, contract 1.6): single-purpose classes with
token values, stacked after an element's main class. `src/styles/utilities.css` and the table
below are **generated** by `node scripts/gen-utilities.mjs` from `tokens.css` and the script's
closed lists. To add one, edit the script's lists and re-run it; never edit either by hand.
Responsive variants apply at their breakpoint and below (Webflow is desktop-first). "Hidden on
desktop only" is `fk-hidden` plus a show utility (`fk-flex-tablet`, `fk-block-tablet`).

<!-- utilities:start -->
| Group | Utilities |
| --- | --- |
| Display | `fk-flex` (display: flex), `fk-block` (display: block), `fk-hidden` (display: none) |
| Grid | `fk-grid` (display: grid), `fk-cols-1` (grid-template-columns: minmax(0, 1fr)), `fk-cols-2` (grid-template-columns: repeat(2, minmax(0, 1fr))), `fk-cols-3` (grid-template-columns: repeat(3, minmax(0, 1fr))), `fk-cols-4` (grid-template-columns: repeat(4, minmax(0, 1fr))) |
| Flex | `fk-flex-col` (flex-direction: column), `fk-flex-row` (flex-direction: row), `fk-wrap` (flex-wrap: wrap), `fk-items-start` (align-items: flex-start), `fk-items-center` (align-items: center), `fk-items-end` (align-items: flex-end), `fk-items-stretch` (align-items: stretch), `fk-justify-start` (justify-content: flex-start), `fk-justify-center` (justify-content: center), `fk-justify-between` (justify-content: space-between), `fk-justify-end` (justify-content: flex-end), `fk-self-center` (align-self: center), `fk-self-stretch` (align-self: stretch), `fk-grow` (flex-grow: 1), `fk-shrink-0` (flex-shrink: 0) |
| Gap | `fk-gap-0-5` (gap: space-0-5), `fk-gap-1` (gap: space-1), `fk-gap-1-5` (gap: space-1-5), `fk-gap-2` (gap: space-2), `fk-gap-2-5` (gap: space-2-5), `fk-gap-3` (gap: space-3), `fk-gap-3-5` (gap: space-3-5), `fk-gap-4` (gap: space-4), `fk-gap-5` (gap: space-5), `fk-gap-6` (gap: space-6), `fk-gap-7` (gap: space-7), `fk-gap-8` (gap: space-8), `fk-gap-10` (gap: space-10), `fk-gap-12` (gap: space-12), `fk-gap-14` (gap: space-14), `fk-gap-16` (gap: space-16), `fk-gap-19` (gap: space-19), `fk-gap-20` (gap: space-20), `fk-gap-24` (gap: space-24), `fk-gap-32` (gap: space-32), `fk-gap-36` (gap: space-36) |
| Spacing | `fk-mx-auto` (margin-left: auto; margin-right: auto), `fk-mt-auto` (margin-top: auto), `fk-pt-2` (padding-top: space-2), `fk-pt-4` (padding-top: space-4) |
| Sizing | `fk-w-full` (width: 100%), `fk-h-full` (height: 100%), `fk-min-w-0` (min-width: 0), `fk-min-h-0` (min-height: 0), `fk-max-w-container` (max-width: width-container), `fk-max-w-container-md` (max-width: width-container-md), `fk-max-w-content` (max-width: width-content), `fk-max-w-content-sm` (max-width: width-content-sm) |
| Position | `fk-relative` (position: relative), `fk-absolute` (position: absolute), `fk-inset-0` (top: 0; right: 0; bottom: 0; left: 0), `fk-overflow-clip` (overflow: clip), `fk-overflow-hidden` (overflow: hidden), `fk-object-cover` (object-fit: cover) |
| Radius | `fk-rounded-sm` (border-radius: radius-sm), `fk-rounded-md` (border-radius: radius-md), `fk-rounded-lg` (border-radius: radius-lg), `fk-rounded-xl` (border-radius: radius-xl), `fk-rounded-2xl` (border-radius: radius-2xl), `fk-rounded-full` (border-radius: radius-full) |
| Background | `fk-bg-white` (background-color: color-white), `fk-bg-brand` (background-color: color-brand), `fk-bg-brand-light` (background-color: color-brand-light), `fk-bg-secondary` (background-color: color-secondary), `fk-bg-tertiary` (background-color: color-tertiary), `fk-bg-surface` (background-color: color-surface), `fk-bg-stone-50` (background-color: color-stone-50), `fk-bg-peach-100` (background-color: color-peach-100), `fk-bg-sand-100` (background-color: color-sand-100) |
| Text color | `fk-color-ink` (color: color-ink), `fk-color-ink-60` (color: color-ink-60), `fk-color-subtle` (color: color-subtle), `fk-color-subtle-80` (color: color-subtle-80), `fk-color-brand` (color: color-brand), `fk-color-brand-80` (color: color-brand-80), `fk-color-white` (color: color-white), `fk-color-white-80` (color: color-white-80), `fk-color-white-60` (color: color-white-60), `fk-color-stone-100` (color: color-stone-100), `fk-color-stone-400` (color: color-stone-400) |
| Text | `fk-text-left` (text-align: left), `fk-text-center` (text-align: center), `fk-font-medium` (font-weight: 500) |
| Responsive (`-tablet` ≤991, `-mobile` ≤767, `-phone` ≤479) | `fk-grid-*`, `fk-cols-1-*`, `fk-cols-2-*`, `fk-cols-3-*`, `fk-cols-4-*`, `fk-flex-*`, `fk-block-*`, `fk-hidden-*`, `fk-flex-col-*`, `fk-flex-row-*`, `fk-items-start-*`, `fk-items-center-*`, `fk-items-stretch-*`, `fk-justify-start-*`, `fk-justify-center-*`, `fk-text-left-*`, `fk-text-center-*`, `fk-w-full-*`, `fk-pt-2-*`, `fk-pt-4-*`, `fk-gap-2-*`, `fk-gap-3-*`, `fk-gap-4-*`, `fk-gap-5-*`, `fk-gap-6-*`, `fk-gap-8-*`, `fk-gap-10-*`, `fk-gap-12-*`, `fk-gap-16-*` |
<!-- utilities:end -->

Other utilities, not generated:

| Class | Definition |
| --- | --- |
| `fk-sr-only` | Visually hidden, accessible to screen readers |
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
Blocks marked **migrated** are implemented in `src/styles/components/`; the others are planned.

| Block | Elements | Combos | Notes |
| --- | --- | --- | --- |
| `fk-flag` **migrated** | — | `is-lg` | A country flag SVG image, 20×20 (Hero chips); `is-lg` 32×32 (testimonial cards). Position it with the parent block, not on the flag |
| `fk-carousel-dots` **migrated** | `-button`, `-bar`, `-fill` | `fk-carousel-dots-bar is-active` | Carousel dots (How It Works, Testimonials): row, centered, gap `space-2` (8px, Figma `5746:1129`). `-dot` is a native button (border reset, 8px vertical padding, `:focus-visible` ring); `-bar` 12×12 `color-stone-100`, flex, clips; `is-active` 52px wide on the starting dot only; `-fill` a normal-flow flex child (`flex: none`, full height), width 0, `color-stone-800`. Bar and fill use `radius-sm` (the exact 8px), not `radius-full`, so a tweened width never distorts them (a 12px dot is still fully round). IX3 targets `[data-dot]` (click), `[data-dot-bar]` (width 12 ↔ 52) and `[data-dot-fill]` (width 0 → 100%), values prefixed per carousel (`how-1`, `tm-1`). Page markup, not a component (`components/ui/Pagination.tsx` renders it) **Component classes (2026-09-28):** a shared component whose look must stay identical everywhere, so its non-trivial elements keep their own classes instead of utilities (`css-system.md` → Component classes). |
| `fk-icon` | — | `is-lg`, `is-sm`, `is-inverse` | An SVG icon image, 24×24, `display: block`, transition `filter` 300ms `cubic-bezier(0.16, 1, 0.3, 1)`. Used inside controls (nav toggle and close). Icons come from `src/assets/icons/`; color and shape live in the file. `is-lg`: 40×40 (service cards). `is-sm`: 16×16 (Pricing message-bubble and checklist icons). `is-inverse`: `filter: brightness(0) invert(1)`, added by `ix-card-hover` so the filter transition turns the icon white |
| `fk-button` **migrated** | `-icon` | `is-secondary` (white), `is-small`, `is-full` (`width: 100%`, for a button that fills its container, e.g. the mobile menu) | Base = primary. Link with an unclassed text span. Padding: 10 × 20 (`space-2-5` / `space-5`); small 6 × 14 (`space-1-5` / `space-3-5`). No icon by default. The class holds the static legacy gradient (349.52deg); the hover rotates it 180° over 700ms through exception `x-button-gradient` (interactions.md), and until that's installed Webflow shows only the hover shadow. Pressed: no shadow, text `color-white-60`. `-icon` is an optional 20×20 SVG image after the label **Component classes (2026-09-28):** a shared component whose look must stay identical everywhere, so its non-trivial elements keep their own classes instead of utilities (`css-system.md` → Component classes). |
| `fk-nav` **migrated** | `-logo` (49×24), `-links`, `-link`, `-actions`, `-cta`, `-cta-rest`, `-toggle`, `-menu`, `-menu-panel`, `-menu-header`, `-menu-close`, `-menu-links`, `-menu-link`, `-menu-footer` | `fk-nav is-pill` (scrolled), `fk-nav-menu is-menu-open`, `fk-nav-link w--current`, `fk-nav-menu-link w--current` | Centered with `left/right: 0` + auto margins, never a transform (the fixed menu is a child). `is-pill` transitions width/top/padding/background. One CTA (Secondary Small) in both states. `-toggle` and `-menu-close` are native 40×40 buttons holding an `fk-icon` (`menu.svg`, `x-mark.svg`): they reset the border and have a `:focus-visible` ring. Bar `top` `space-4` (tablet `space-2`, width `100% − 2 × space-2`) with `space-3` vertical padding (tablet `space-3` / `space-5`, also on `is-pill`). The mobile menu is a full-height white frame (`height: 100%`, padding `space-2`, `overflow: hidden`) around `-menu-panel`: a flex column, `space-between`, gap `space-6`, `color-secondary`, `radius-xl`. Header padding `space-3` / `space-5`; `-menu-links` scrolls if needed (`overflow-y: auto`, no gap or top margin; `overscroll-behavior: contain` on `-menu` and `-menu-links`, accepted by the style API, so no exception); each `-menu-link` has padding `space-3` / `space-6`, `color-subtle`, current page `color-ink`; `-menu-footer` padding `space-6` holding a Secondary `UI / Button` at full width (`fk-button is-full`) **Component classes (2026-09-28):** a shared component whose look must stay identical everywhere, so its non-trivial elements keep their own classes instead of utilities (`css-system.md` → Component classes). The desktop-only wrapper around the links uses the `fk-hidden-tablet` utility |
| `fk-footer` **migrated** | `-cta`, `-groups`, `-group`, `-group-title`, `-links`, `-link`, `-logo` (49×24), `-bottom` | — | Panel padding 80 → 48 → 32. The CTA text wrapper and the button's wrapper are blur-reveal triggers; `-groups` is a `reveal-stagger` parent with each group title and link as an item. ≤767 the footer gets `space-2` padding and the panel gap `space-8` with padding `space-12` / `space-5` / `space-10` / `space-5`; `-cta` stacks in a column at ≤767 only; `-groups` are 2 columns; the bottom bar doesn't stack at ≤767 **Component classes (2026-09-28):** a shared component whose look must stay identical everywhere, so its non-trivial elements keep their own classes instead of utilities (`css-system.md` → Component classes). The panel is `fk-panel is-compact fk-bg-brand`; CTA title `fk-heading-xl fk-color-white`, body and bottom text `fk-text-lg` / `fk-text-md` + `fk-color-white-80`. The container is `fk-container fk-flex fk-flex-col fk-gap-16 fk-gap-8-mobile` (no `-panel` class), and the CTA text wrapper is `fk-flex fk-flex-col fk-gap-4 fk-max-w-content` |
| `fk-section-header` **migrated** | `-body`, `-action` | `is-center`, `is-inverse`, `is-narrow` | Flex column, gap `space-4`. Eyebrow uses `fk-eyebrow`, title `fk-heading-xl`. `-body` stays left-aligned and stacks with `fk-text-lg` + `fk-color-brand-80`. `is-center`: centered text, also `margin: 0 auto` (so a centered narrow header sits centered inside a wider panel). `is-narrow`: full width up to `width-content-sm` (480px). With a blur reveal, each child sits in an `fk-blur-reveal` wrapper (Hero, How It Works, Feature Grid, Testimonials, Two Ways, Post Grid, CTA). `-action` (`fk-section-header-action`: flex, padding-top `space-4`) is the shared button row under a header (Hero, CTA) |
| `fk-stats-band` **migrated** | `-grid` | — | Section / Stats Band has no base class: it is `fk-section` > `fk-panel fk-bg-brand-light` > a plain utility flex column (`fk-max-w-container fk-mx-auto`, no `fk-container`/`fk-panel-content` shell). `-grid` still carries the desktop flex row (120px tall) → tablet 2-column grid switch, since no utility expresses a breakpoint-conditional `display` change on its own class |
| `fk-stat` **migrated** | `-value`, `-suffix`, `-label` | — | `UI / Stat`'s wrapper has no base class: it is a plain utility flex column. `-value` (`fk-heading-display is-xl` inside it) is kept only as the `ix-count-in` target; `-suffix` and `-label` keep their own local sizes (near-miss typography: close to `fk-heading-md`/`fk-text-sm` but not exact at every breakpoint, `css-system.md` → Follow-ups) |
| `fk-avatar` **migrated** | — | — | The 24px round author photo (`radius-full`, `color-stone-50` behind it, `object-fit: cover`) with a 4px right margin that, with the row's 4px gap, makes Figma's 8px to the name. Shared by `fk-post-card-meta` and `fk-featured-post-author`; replaces `fk-post-card-avatar` |
| `fk-featured-post` **migrated** | `-body`, `-meta`, `-meta-text`, `-title`, `-excerpt`, `-author`, `-author-text`, `-media`, `-image`, `-scrim` | — | The featured post card in Section / Blog Hero (Figma `5697:5164`, `5763:2560`). One link, like Post Card. Desktop: white card (`radius-xl`, 480px tall, padding 16 16 16 `space-12`), body 422px on the left, photo (`radius-lg-plus`, max 552px) on the right; the photo zooms on its own hover. Phone (≤767): 432px card with the photo filling it, `-scrim` (gradient `color-scrim` → transparent, hidden on desktop) darkening its bottom and the body over it in white (`color-white-80` for meta, snapped from Figma's `#a2a9b3`); the excerpt is hidden there with `fk-hidden-mobile`. Figma also blurs the whole phone image (`backdrop-blur 20px` on the overlay): left out on purpose (D-16) |
| `fk-blog-hero-art` **migrated** | — | — | Section / Blog Hero's background: the purple ring's two visible arcs as one absolutely positioned WebP, `public/assets/blog/hero-art.webp` (1459×800, from Figma's photo × ring mask `hero-bg.png` × `hero-mask.svg`, cropped to x ≥ 560 and y ≤ 800 of the 2019px ring box; the masking is baked in because Webflow's style API can't take mask properties). Desktop `top: 354px; left: −345px` (Figma's ring box at −905, 354); phone the same art at 0.4547 (`top: 386px; left: −17px; width: 663px`). Sits behind the header and card (`fk-container fk-relative` stacks above it) |
| `fk-dropdown` **migrated** (`UI / Dropdown`) | `-list`, `-link` | `fk-dropdown-link w--current` (Webflow state, styled in the Designer) | Webflow's **native Dropdown element** (`w-dropdown`, `w-dropdown-toggle`, `w-dropdown-list`, `w-dropdown-link` sit next to the `fk-*` classes; Webflow does open/close). Root 262px wide (full width ≤767). **The toggle is an input field**: `fk-input-field is-select` (plus `is-large`) with `fk-input-field-text` (`is-selected` once a category is chosen) and a 20px `chevron-down.svg` `fk-input-field-icon`. The list (`-list`: white, `color-stone-100` border, `radius-md`, 4px padding, soft shadow; not in Figma, my design) holds links: `All` → `/blog`, each category → `/blog-categories/{slug}`; the current one is `w--current` (`color-brand-light`, weight 500). Hover `color-neutral-hover`, focus ring `color-brand-focus`. **Repo only:** `webflow-base.css` (the base rules of Webflow's dropdown and form block) and `src/ix/dropdown.ts` (open/close) stand in for webflow.js; neither is pushed |
| `fk-pagination` **migrated** | `-arrow`, `-pages`, `-page` | `fk-pagination-arrow is-disabled` (opacity 0.4, no pointer events), `fk-pagination-page w--current` (active state: weight 600 and a `color-ink` border, Figma only draws the weight) | Numbered pagination under the Post Index (Figma `5674:3979`): 48px `radius-xl` arrows (`arrow-left.svg` / `arrow-right.svg` in `fk-icon is-sm`, aria-labelled) around 48px round page links, `color-stone-100` borders, gaps `space-3` / `space-2`. Links are `?page=n` (Webflow's native pagination is `?<id>_page=n`, roadmap P-15). ≤767: 40px buttons, tighter gaps; the row wraps if it overflows. Hidden when there is one page |
| `fk-post-card` **migrated** | `-media`, `-image`, `-body`, `-title`, `-excerpt`, `-meta`, `-meta-text` | `is-featured` | Bound to Posts. Title and excerpt clamp to 2 lines through exception `x-text-rendering` (the classes only carry `overflow: hidden`). The image zooms on its own hover. Section / Post Grid itself has no dedicated classes — it's the shared `fk-section` > `fk-panel fk-bg-brand-light` > `fk-container` > `fk-panel-content` shell, holding `fk-section-header is-center is-narrow` (title `fk-heading-lg`, body `fk-text-md` + `fk-color-subtle`, each in `fk-blur-reveal`) and a grid of post cards (`fk-grid fk-cols-3 fk-cols-2-tablet fk-cols-1-mobile fk-gap-4`). Decision: Post Grid is a reusable section with fixed content — title "The Flint blog", body copy and the "See all posts" button are hardcoded (no props), used as-is on every page that needs it (see `components.md`) **Component classes (2026-09-28):** a shared component whose look must stay identical everywhere, so its non-trivial elements keep their own classes instead of utilities (`css-system.md` → Component classes). Built as the reusable Webflow component `UI / Post Card` (`components.md`) |
| `fk-hero-*` **migrated** | `-stage`, `-wheel`, `-card`, `-card-image`, `-card-chip`, `-card-name` | `fk-hero-card is-a1`…`is-a20`; `fk-hero-card-image is-c1`…`is-c10` | Section / Hero (Home) has no `fk-hero` panel class or `fk-hero is-home` combo: it is `fk-section is-padded-bottom` > `fk-panel fk-bg-secondary is-hero` (padding-top `space-36`, no bottom padding, no responsive override) > `fk-container` > `fk-section-header is-center is-narrow` (blur reveal) holding the shared `fk-section-header-action` primitive (+ `fk-pt-2-mobile` utility), then `-stage` as the panel's next sibling. `-stage` (`data-ix="hero-arc"`) is `position: relative`, `margin-top: space-12` (`space-8` ≤767), 355px high (267.67px ≤767). `-wheel` is inset 3px from the stage top (45.6px ≤767), `transform-origin: 50% 1643px` (933.7px ≤767), rotated by `ix-hero-arc`. `-card` is the Figma card: 200×240 peach, radius `radius-xl`, placed at the stage top-centre with `transform-origin: 100px 1643px` and a static angle per `is-a1…a20` (−159.5° … +49.5°, step 11°, centre pair `is-a15`/`is-a16` at ∓5.5°: two copies of the 10 candidates, coverage rule). Figma draws the arc on a 1523px circle (card centres); ≤767 is the same arc scaled 0.5683 (card 113.665×136.398, radius 13.64px, pivot 933.7px), as in the phone frame. `-card-image` crops per candidate (`is-c1…c10`, local) are in % of the card so both sizes share them. `-card-chip` white pill (flag `fk-flag` + `-card-name` sans 14/20 medium brand), `space-3-5` from the card's left/bottom; ≤767 it is `scale(0.5683)` from its bottom-left corner at 7.83px, so the phone chip keeps the desktop markup |
| `fk-card` **migrated** | `-title`, `-text` | `-text is-subtle` | Base = service card: white, radius `radius-lg-plus` (20px), padding `space-6` (layout — flex column, justify-between, full size of its grid cell — is now utilities in the markup). `-title`/`-text` are kept only as the `ix-card-hover` targets: title `color-ink` at 0.8 opacity, text `color-brand` at 0.8 (local to the card), both tweened by the hover (background `color-white`→`color-brand`, title/text →`color-white`, plus the `fk-icon` filter). Icon is `fk-icon is-lg`, omitted when the card has none (Role Grid). `-text is-subtle`: `color-subtle` instead of `color-brand` (Role Grid). Combos (`is-feature`…) are added when another card type is migrated. The title+text blur-reveal wrapper has no class: it's a plain utility div in `ServiceCard.tsx` |
| `fk-feature-grid` **migrated** | `-cards`, `-item` | — | Section / Feature Grid inside `fk-container`. The wrapper's flex layout (centered, gap `space-16` → `space-10` ≤767) is utilities in the markup; there is no `fk-feature-grid` base class. `-cards` is `fk-feature-grid-cards fk-grid fk-cols-3 fk-cols-2-tablet fk-cols-1-mobile fk-gap-2 fk-w-full`; the class keeps only its row height (244px on desktop, auto from ≤991). `-item` (the `data-ix-item`): min-height 240px ≤991 (full height on desktop is `fk-h-full`) |
| `fk-role-grid` **no classes** | — | — | Section / Role Grid is `fk-panel fk-bg-brand-light` > `fk-container` > a utility flex column (centered, gap `space-16` → `space-10` ≤767); the cards are `fk-grid fk-cols-3 fk-cols-2-tablet fk-cols-1-mobile fk-gap-2 fk-w-full` (auto row height: no icons, so shorter than Feature Grid's). The `UI / Button` sits directly in the section header's own `fk-blur-reveal` |
| `fk-logo-marquee` **migrated** | `-viewport`, `-track`, `-row`, `-logo`, `-fade` | `fk-logo-marquee-fade is-left` · `is-right` | `fk-logo-marquee` itself keeps only its own padding, `space-8`/`space-12` (`space-8`/`space-5` ≤767) — the full-width flex row layout (column ≤767, gap `space-14` → `space-6` ≤767) is utilities on the section in the markup. `-viewport` 36px tall, clips. `-track` holds 3 `-row` copies (coverage rule) and is the `ix-marquee` target. `-row` gap and right padding `space-12`. `-logo` 36px tall at 0.8 opacity; each width is set on the image (132/96/101/187/146/121). `-fade` white gradients `space-32` → `space-12` wide. 36px is local. The "Partnering with the top facilities" blur-reveal trigger has no `-label` class: it is a plain `fk-shrink-0` div holding `fk-text-md` + `fk-color-brand-80` typography |
| `fk-two-ways-*` **migrated** | `-card`, `-art`, `-canvas`, `-nurse-right`, `-nurse-left`, `-nurse-center`, `-orb`, `-facility-image`, `-content` | `fk-two-ways-card is-brand-light` · `is-secondary`; `fk-two-ways-art is-nurses` · `is-facilities`; `fk-two-ways-orb is-left` · `is-right` | Section / Two Ways sits in the shared shell — `fk-section` > `fk-panel` > `fk-container` > `fk-panel-content` (the header-to-cards gap, `space-16` → `space-10` ≤991, comes from `fk-panel-content`), holding `fk-section-header is-center is-narrow` and the two cards. The section has no base class and no `-eyebrow`/`-title`/`-body` element classes; the two-card row, the card's text wrapper and the CTA wrapper are plain utility markup in `TwoWays.tsx` (`fk-flex fk-items-stretch fk-gap-4 fk-w-full fk-flex-col-tablet` for the row). Each card's eyebrow/title/body use the shared typography classes (`fk-text-md fk-color-brand-80`, `fk-heading-sm is-sans`, `fk-text-md fk-color-subtle`) tagged with `data-two-ways="eyebrow"` / `"title"` / `"body"` for `ix-two-ways-card`'s word-split reveal (`interactions.md`), since the reveal needs a hook that is not a class. `is-brand-light` / `is-secondary` on `-card` are only classList markers read by `twoWays.ts` and `ix-two-ways-card`; their background comes from the `fk-bg-brand-light` / `fk-bg-secondary` utilities, not the combo's own CSS. `-art` 220px high with `mask-image` (linear on nurses, radial on the facility photo); nurse photos and orbs are absolutely placed on a 592px canvas (local collage geometry, orbs `blur(12.55px)`); `-content` keeps its local padding (`0 / space-12 / space-8`, ≤767 `space-6` sides). The card is the `ix-two-ways-card` trigger; the CTA sits in `fk-blur-reveal` (no trigger attribute: the card timeline adds `is-revealed`) |
| `fk-pricing-*` **migrated** | `-card`, `-avatar-wrapper`, `-avatar`, `-thread`, `-line`, `-bubble`, `-bubble-icon`, `-bubble-detail`, `-copy`, `-checklist`, `-checklist-icon` | `fk-pricing-card is-copy`; `fk-pricing-bubble is-larger`; `fk-pricing-bubble-icon is-plain` | Section / Pricing, new (Figma nodes 6011:2380 header/cards, 6011:2529 avatar crop; no legacy source), placed on Home between Two Ways and Partners Map: `fk-section` > `fk-panel` > `fk-container` > `fk-panel-content`, holding `fk-section-header is-center is-narrow` (blur reveal) and the two-card row (a plain utility flex row, `fk-flex fk-gap-4 fk-w-full fk-flex-col-tablet`). **Deviates from Figma on request:** Figma shows one 580px card and a 480px text block 96px apart; built instead as two equal `flex: 1 1 0` (utility) cards, the second (`is-copy`) with no background. **Card content uses flex and padding, not absolute positioning:** every element flows normally and the card's height comes from its content, not a fixed value; the wrapper that holds each variant's content is a plain utility flex column. `-card` (shared by both variants): padding `space-24`/`space-10` (96/40, ≤991 inline only → `space-20`, ≤767 → `space-8`/`space-5`) plus the local box-shadow/backdrop-filter values a utility can't express; radius and background are utilities (`fk-rounded-2xl`, `fk-bg-tertiary`, stacked directly on the card); `is-copy` overrides to an asymmetric `padding-inline: space-20 0` (80px from the diagram card, flush on the outer edge; ≤767 both sides 0), since no utility expresses an asymmetric override. The "This is you." header block and the bubble/checklist rows have no wrapper classes (`-header`, `-bubble-body`, `-bubble-name`, `-checklist-item`): they are plain utility markup; the caption is a bare `fk-text-xs` paragraph (no dedicated class). `-avatar-wrapper` (104px circle, `1px dashed color-peach-200` border, padding `space-2`) frames `-avatar` (86px circle image, `object-fit: cover`, `object-position: top`, cropping `pricing-avatar.webp`). `-thread` (`padding-top: space-6`, position/gap are utilities) holds `-line` (a decorative dashed connector, `height: 100%`, `z-index: 0`) behind the three `-bubble`s (`position: relative; z-index: 1`, `max-width: 320px`, `is-larger` 360px for the wider Flint bubble). `-bubble`: `backdrop-filter: blur(10px)` + the "Pricing bubble" shadow (`tokens.md`), radius/background/layout are utilities; `-bubble-icon` 40×40 `color-brand-foreground` circle holding `fk-icon is-sm` (facility.svg) — no utility exists for `color-brand-foreground` (it would conflict with `is-plain`, `css-system.md` → Candidates), `is-plain` drops the background/padding for the Flint bubble's own circular logo asset (`Flint-logo-brand-circle.svg`, self-contained). `-bubble-detail`: local list typography (14/20). `-copy` (heading `fk-heading-md` + body `fk-text-lg` + `fk-color-subtle`) keeps only its `margin-bottom: space-6` (in place of a parent gap); `-checklist` and `-checklist-icon` (28px, padding `space-1-5`) keep only their local sizes — the rest is utilities. **Known gap:** the "This is you." caption is a plain `fk-text-xs` (12px, `color-ink`, regular), while Figma has brand purple, medium weight, 14px — flagged, not corrected, pending a decision on whether it's worth a one-off class or a new `fk-text-xs` combo |
| `fk-partners-map` **migrated** | `-image`, `-overlay`, `-inner`, `-heading`, `-viewport`, `-track`, `-row` | `fk-partners-map-row is-active` | Section / Partners Map panel (own block, `fk-section is-padded-bottom` around it for legacy's 32px gap below): 680px high (420 ≤767), `radius-xl`, map photo `blur(3px)` scale 1.05 under a local `rgba(0,0,0,0.6)` overlay (background/radius/overflow are utilities). Content row max 900px (column ≤991), wrapped in a plain utility flex-center div whose `fk-container` carries `fk-h-full`. `-inner` gap `space-19` (the `fk-gap-19` utility) between the heading and the ticker viewport, plus its own ≤991 padding-block override (`space-16`) a utility can't express. `-heading` keeps only its height 100%/auto ≤991 switch; the heading text itself is `fk-heading-xl` + `fk-color-white` typography, not a dedicated `-title` class. Viewport 340px × panel height with pl 20 (280 × 180 ≤991) and a vertical `mask-image` fade. `-track` (`data-ix="ticker"`) starts at `top: 50%` with `margin-top: −390px` (row 7 centred) and holds 29 rows: 7 padding, 14 states, the duplicate New York, 7 padding (coverage rule). Rows 52px high at 0.2 opacity; `is-active` (1) only on the starting row; each row has `data-ticker-row="n"` for IX3 targeting |
| `fk-cta-*` **migrated** | `-ring`, `-ring-image`, `-room`, `-window`, `-window-image`, `-photo` | — | Section / CTA (Art) sits in a plain `fk-section` > `fk-panel fk-bg-tertiary is-relaxed` (padding-block `space-32` → `space-24` ≤991 → `space-16` ≤767, `position: relative` from `fk-panel`) > `fk-container` > `fk-section-header is-narrow`; there is no `fk-cta` panel class — `fk-panel`'s own `position: relative` anchors the absolutely-positioned art. The button row uses the shared `fk-section-header-action` primitive. Ring and window use `mask-image` (`cta-ring.svg`, `cta-circle.svg`); room photos mirrored with `scaleX(-1)`. All art offsets are local (Figma 1408×560 card), still hidden ≤767 |
| `fk-testimonials-*` **migrated** | `-row`, `-track`, `-slide` | `fk-testimonials-slide is-center` | Section / Testimonials (Slider) sits in `fk-section` > `fk-panel fk-bg-brand-light` (`[data-ix="testimonials"]`, `ix-testimonials`'s target) > `fk-panel-content` > `fk-container` (header) + `-row` (there is no `fk-testimonials` panel class, `-header` or `-pagination`, since the header sits in normal flow inside `fk-panel-content`). `-row` (`fk-testimonials-row fk-flex fk-flex-col fk-gap-6`, full width) holds `-track` and, 24px below it, a plain utility pagination row (`fk-flex fk-justify-center fk-w-full fk-max-w-container fk-mx-auto`, no reveal). The track is `fk-testimonials-track fk-flex fk-gap-6` (`width: max-content`, `margin-left: 50%`, resting `translateX(−3582.24px)` = −(10 × 340.8 + 174.24), so the current slide is centered; it is wider than the row and the panel clips it). No absolute positioning: the track holds twenty-one `-slide`s in normal flow (`data-tm-slide="1…21"`: three copies of the seven testimonials; slides 8–14 are the real set, the others carry `aria-hidden`). A slide is `flex: none` at the card's 396px width with `margin-inline: −39.6px`, scale 0.8, opacity 0.6; `is-center` (slide 11, the middle copy's 4th card) has `margin-inline: −23.76px`, scale 0.88, opacity 1. The negative margin cancels the layout space the scale takes away, so the track gap is the visible 24px between cards. Moved by `ix-testimonials` |
| `fk-testimonial-card` **migrated** | `-media`, `-image`, `-gradient`, `-scrim`, `-quote`, `-quote-text`, `-flag`, `-person`, `-role` | `fk-testimonial-card-quote is-open` | UI / Testimonial Card: fixed 396×488 canvas (radius/background/position/overflow are utilities on the card), photo box 612×798 at top −71 (centred), static bottom gradient (transparent 61.475% → black), `-scrim` full gradient at opacity 0.6 (0.9 on hover), `-quote` left 32, 338 wide, bottom 110, 104px high (160 on hover), serif 24/32 white with a mask that `is-open` moves (transition 0.45s, decision H-10); flag wrapper bottom/right 32 with `fk-flag is-lg`; role 16/24 white at 0.6. The card, `-quote` and `-scrim` are kept as the `ix-testimonial-hover` targets (tweened height/opacity, `is-open` mask); `-quote-text` and `-role` keep their own class instead of a typography primitive (near-miss: no exact `fk-heading-sm`/`fk-text-md` match at every breakpoint, `css-system.md` → Follow-ups). The person's name is plain `fk-text-md` + `fk-font-medium` + `fk-color-white` typography (no `-name` class) |
| `fk-faq` | `-item`, `-question`, `-icon`, `-answer` | `-item.is-faq-open` | Accordion |
| `fk-marquee` | `-track`, `-item` | `is-slow` | CTA marquee on Candidates (`FacilityCta.tsx`). Reuse `fk-logo-marquee`'s structure when it's migrated |
| `fk-newsletter-*` **migrated** | `-form`, `-message` | `fk-newsletter-message is-error` | Section / Newsletter (Figma `5674:3956`, `5763:2625`). Panel, row and title are shared classes and utilities (`fk-text-md`, centered ≤767 with `fk-text-center-mobile`); only these are blocks. `-form` is the Form Block (`w-form`): 400px wide (full width ≤991), `margin: 0` (Webflow adds 15px below). `-message` is Webflow's success (`w-form-done`) and error (`w-form-fail`) message: white, `radius-md`, 14/20 centered, error in `color-accent-rose`; sets no `display` (Webflow toggles it). The design has no message styles: these are placeholders to review |
| `fk-input-field` **migrated** (`UI / Input Field`, and the toggle of `UI / Dropdown`) | `-input`, `-text`, `-icon`, `-prefix` | `fk-input-field is-large`, `is-disabled`, `is-select`, `is-action`; `fk-input-field-text is-selected`; `fk-input-field-input is-action`, `fk-input-field-input is-disabled` | Figma "Input-Container" (`5535:1635`). Container: medium 40px (padding `space-3-5`) or `is-large` 48px (`space-4`), `radius-md`, `color-stone-100` border, white, gap `space-2`. **States:** Hover `color-stone-200` border; Click = `:focus-within` (input) or `w--open` (select): `color-brand` border and a 2px `color-brand-10` ring; Focus (a select toggle's `:focus-visible`, keyboard only): 2px white gap + 2px `color-brand-focus` ring, since a text input can't tell keyboard from mouse focus; `is-disabled`: `color-stone-50` fill, not-allowed cursor; the input inside carries `fk-input-field-input is-disabled` too (not-allowed cursor, next to the native `disabled` attribute), since a `:disabled` selector isn't a class. `-input` is Webflow's Form Text Field (`w-input` sits next to it): transparent, 16/24 `color-ink`, `::placeholder` `color-stone-400` at 70%. `-text` is a select's label (placeholder look, `is-selected` = ink, opaque). `-icon` is the 20px trailing icon (a chevron for selects; "Show icon right"). `-prefix` is the phone-number prefix (`fk-flag` + chevron, `space-1` gap, `space-2` right padding, divider on its right). **`is-select`** (the Dropdown toggle): pointer, no user select, and a focused toggle is not the Click state. **`is-action`** (the newsletter variation, larger radius): `radius-full`, `space-0-5` inset, `space-5` left, no fixed height; ≤767 it stacks (input row above, button below, gap `space-3`, corners 16 top / 24 bottom, `-input is-action` 14/20 with `space-3` × `space-4` padding). A visually hidden `fk-sr-only` label names the input. Replaces the planned `fk-field` |
| `fk-badge` | — | `is-inverse` | Category and status pills |
| `fk-portrait` | `-image` | `is-peach`, `is-sand`, `is-brand` | Rounded image pills (About hero, avatars) |
| `fk-how` **migrated** | `-viewport`, `-track`, `-slide`, `-card`, `-bg`, `-scrim`, `-art`, `-copy`, `-title`, `-body`, `-pagination` | `fk-how-slide is-active`, `fk-how-card is-active`, `fk-how-card is-brand-light`, `fk-how-copy is-inverse`, `fk-how-bg is-card-3` / `is-card-5`, `fk-how-art is-card-1` / `is-card-2` / `is-card-3` / `is-card-6` | Section / How It Works (Home): white, no panel — sits in `fk-section is-x-flush` with its own flex column, gap `space-12`, padding `space-24` block (the generic wrapper/pagination-row layout otherwise moved to utilities in the markup; `fk-how` stays as `howCarousel.ts`'s `.closest(".fk-how")` interaction target). The header sits directly in `fk-container` as `fk-section-header is-center is-narrow` (`width-content-sm`, no separate header wrapper); the carousel's outer blur-reveal trigger wrapper has no class: it's a plain `fk-w-full` div, inside a `fk-flex fk-flex-col fk-gap-6 fk-w-full` wrapper that also holds the pagination row 24px below it (the pagination has no reveal of its own). `-viewport` (`data-ix="how-carousel"`) 512px high (380 ≤767), clips. `-track` (normal flow, no positioning) at `margin-left: calc(50% − 199px)`, gap 32, moved −392px per step; the carousel is finite (six slides, it rewinds after the last), unlike Testimonials. `-slide` (`data-how-slide`) 360×464, `is-active` 398×512; `-card` (`data-how-card`) fills its slide (`width`/`height: 100%`), so a current card is a real 398×512 card whose content lays out at that width (text stays 20px; it is **not** scaled at desktop, matching the Figma design). The card is a one-cell grid (`grid-template: 100% / 100%`) and every layer is a grid item in that cell (`grid-area: 1 / 1`, later on top), with no absolute positioning anywhere in the card. **Verified 2026-09-29 (production, rule 14):** child placement `grid-area: 1 / 1` is pushed as `grid-row-start: 1` + `grid-column-start: 1` (the ends stay auto, which is what `1 / 1` means); Webflow stores and reads back exactly those two longhands on `-bg`, `-scrim`, `-art` and `-copy` and `webflow-diff.mjs` reports no difference; the rendered result still needs the visual check after the first staging publish. Radius `radius-xl` (local, not the same 32px as `-card`'s own `radius-2xl`), background `color-tertiary` (`is-brand-light`: `color-brand-light`, card 5 "Start work"). Card art (decision D-12) is split into `-bg` (full-bleed photo/gradient/pattern, `object-fit: cover`, one of six `how-card-bg-*.webp`, fills the grid cell). **Cards 3 and 5** (same file: a ring quarter, 882×723) carry the combo `fk-how-bg is-card-3` / `is-card-5` and are not full-bleed (the `data-how-card` attribute stays on the card as the carousel's hook, but no CSS selects on it; combos replace the old parent-attribute selectors so every rule is a class): the image is drawn at a third of its size (294×241, `object-fit: contain`, `align-self`/`justify-self: start`) pinned to the card's top-left, card 5's combo also holds the same contained-size values (combos can't share a rule) plus `margin-left: −33px`, so the purple band enters at the top right and crosses the left edge behind the art, as in the design (local geometry, one card each) and `-art` (a floating illustration widget, one of five `how-card-art-*.webp`; card 4 "Relocate" has none), both under the live `-copy` (title sans 20/28, body). `-art` is `align-self: start; justify-self: center` at `width: calc(100% − space-16)` (card width minus `space-8` each side; `width: auto` would render the asset at its ~1,000px natural size), height from the asset's own ratio; only `margin-top` is local per card, as one combo each (raw px: `is-card-1` 50, `is-card-2` 29, `is-card-3` 32 with `width: calc(100% − space-4)`, `is-card-6` 32 with the same width; card 4 has no art, card 5's art has no combo, margin 0). `-copy` is `align-self: end` with `margin: 0 space-8 space-8`. `-scrim` is a plain element (`linear-gradient(to top, rgba(0,0,0,.6), transparent 60%)`, fills the grid cell) on cards 2 and 6 only, where inverse copy sits over a photo `-bg`. Phone (≤479, decision H-9): slides 302.11×389.39 / 334×429.67, gap 29.94; the card is fixed at 360×464 and scaled 0.8392 / 0.9278 (legacy fit, unchanged), track at `margin-left` 50% − 167px |
| `fk-webinar-*` **migrated** | `-bg`, `-stage`, `-call`, `-participants` | — | Section / Webinar, new (Figma node 5987:3227; no legacy source), placed on Home right after How It Works: `fk-section` > `fk-panel fk-bg-tertiary` > `-bg` + `fk-container fk-relative` > `fk-panel-content` > `fk-section-header is-center is-narrow` (blur reveal; title `fk-heading-xl` with a fixed line break, body `fk-text-lg fk-color-brand-80`, then the shared `fk-section-header-action` holding a `UI / Button` "Reserve seat") and `-stage` (`data-ix="reveal"`). The container is `fk-relative` so it paints above the absolutely-positioned `-bg` (positioned elements otherwise stack over a static sibling). Three images exported from Figma, all with empty alt except the informative two: `-bg` is `webinar-bg-arc.webp` (2400×668 file, 2× its 1200px max; Figma's ring is 1168px, so it renders about 3% larger): absolute, `left: 50%` + `translateX(-50%)`, `bottom: 0`, `width: 100%` of the panel up to `max-width: 1200px`, so the ring scales down with the panel at every breakpoint; decorative, `alt=""`. `-stage` is the call card's box: `max-width: 627px` (577px card + 25px each side of shadow room), `aspect-ratio: 627 / 349` (the card's bottom edge; the call image is 418 tall and overflows by its own shadow into the panel's bottom padding), centered. `-call` is `webinar-call.webp` (1254×836 file, 2× its 627×418 box), `top: 5.73%` (20px), full stage width, `alt` names the host. `-participants` is `webinar-participants.webp` (708×306 file, 2× its 354×153 box), the pill sitting on the card's top edge: `top: -1.72%` (−6px), `left: 20.25%` (127px), `width: 56.46%`; `alt="234 participants"` because the count is baked into the image. Call and pill are percentages of the stage so they scale together; ≤767 the pill is widened to `width: 75%; left: 12.5%; top: -8%` so its text stays legible. Sizes are Figma canvas values, local to this block, so they stay raw (rule 2). Images are WebP at 2× (`seo.md` S-10), converted from the Figma PNG exports with `npm run webp` (quality 90, alpha kept), have `width`/`height` set to the file size and `loading="lazy"`. The Button's link is `#reserve-seat` until the webinar sign-up target is chosen |
| `fk-illustration` | — | — | Frame for a Lottie illustration (`interactions.md`) |
| `fk-article` | `-toc`, `-toc-link`, `-body`, `-quick-answer` | — | CMS template. `-body` styles the Rich Text element |

## Example

From `src/sections/TextPanel.tsx` + `src/components/ui/SectionHeader.tsx`:

```html
<section class="fk-section">
  <div class="fk-panel fk-bg-tertiary is-radius-lg">
    <div class="fk-container is-content-sm" data-ix="reveal">
      <div class="fk-section-header is-center">
        <p class="fk-eyebrow">Mission</p>
        <h2>Why we exist</h2>
        <div class="fk-section-header-body fk-text-lg fk-color-brand-80">
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
