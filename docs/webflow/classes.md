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
| `fk-section` | Band wrapper: padding `space-4` inline and top (legacy `px-4 pt-4`) |
| `fk-section is-last` | Adds `space-4` bottom padding |
| `fk-section is-open` | Unpaneled band: padding 128/64 desktop → 96/40 tablet → 64/20 mobile |
| `fk-panel` | Rounded (`radius-xl`) band content, `overflow: clip`, padding 96 → 64/40 → 48/20 |
| `fk-panel is-brand` · `is-brand-light` · `is-secondary` · `is-tertiary` · `is-surface` | Panel background token |
| `fk-panel is-compact` | Padding 80 → 48 → 24 |
| `fk-panel is-radius-lg` | Radius `radius-lg` (16px) |
| `fk-container` | **Page container**: full width, `max-width: width-container` (1200px) including a 20px (`space-5`) gutter on each side as inline padding, centered. Every section's content sits in one |
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
| `fk-text-lg` | `is-brand-muted` | `color-brand-80` |
| `fk-text-lg` | `is-inverse-muted` | `color-white-80` |
| `fk-text-md` | `is-subtle` | `color-subtle` |
| `fk-text-md` | `is-inverse-muted` | `color-white-80` |

## Utilities (closed list)

| Class | Definition |
| --- | --- |
| `fk-sr-only` | Visually hidden, accessible to screen readers |
| `fk-hide-mobile` | `display: none` at ≤767 |
| `fk-hide-desktop` | `display: none` above 991 |
| `fk-divider` | On an `hr`: a 1px-tall fill in `color-white-10` (no border), full width, no margin. No combos |

Scroll reveals are not classes: they use the `data-ix="reveal"` attribute (see `interactions.md`).

## Component classes

Elements listed are the complete allowed set per block. States use Webflow states (Hover,
Pressed, Focused-keyboard) and map to `:hover`, `:active`, `:focus-visible` in CSS.
Blocks marked **MVP** are implemented in `src/styles/components/`.

| Block | Elements | Combos | Notes |
| --- | --- | --- | --- |
| `fk-icon` | — | — | An SVG icon image, 24×24, `display: block`. Used inside controls (nav toggle and close). Icons come from `src/assets/icons/`; color and shape live in the file |
| `fk-button` **MVP** | `-icon` | `is-secondary` (white), `is-small` | Base = primary. Link with an unclassed text span. Padding: 10 × 20 (`space-2-5` / `space-5`); small 6 × 14 (`space-1-5` / `space-3-5`). No icon by default. The class holds the static legacy gradient (349.52deg); the hover rotates it 180° over 700ms through exception `x-button-gradient` (interactions.md), and until that's installed Webflow shows only the hover shadow. Pressed: no shadow, text `color-white-60`. `-icon` is an optional 20×20 SVG image after the label |
| `fk-nav` **MVP** | `-logo` (49×24), `-links`, `-link`, `-actions`, `-cta`, `-cta-rest`, `-toggle`, `-menu`, `-menu-header`, `-menu-close`, `-menu-links`, `-menu-link`, `-menu-footer` | `fk-nav is-pill` (scrolled), `fk-nav-menu is-menu-open`, `fk-nav-link w--current`, `fk-nav-menu-link w--current` | Centered with `left/right: 0` + auto margins, never a transform (the fixed menu is a child). `is-pill` transitions width/top/padding/background. One CTA (Secondary Small) in both states; `-cta-pill` was removed on 2026-09-24. `-toggle` and `-menu-close` are native 40×40 buttons holding an `fk-icon` (`menu.svg`, `x-mark.svg`): they reset the border and have a `:focus-visible` ring |
| `fk-footer` **MVP** | `-panel`, `-cta`, `-cta-text`, `-groups`, `-group`, `-group-title`, `-links`, `-link`, `-logo` (49×24), `-bottom` | — | Panel padding 80 → 48 → 32 |
| `fk-section-header` **MVP** | `-body` | `is-center`, `is-inverse` | Eyebrow uses `fk-eyebrow`, title uses the H2 tag style. `-body` stays left-aligned and stacks with `fk-text-lg is-brand-muted` |
| `fk-stats-band` **MVP** | `-grid` | — | Grid is a flex row (120px tall) on desktop, 2-column grid below |
| `fk-stat` **MVP** | `-value`, `-suffix`, `-label` | — | Value number stacks `fk-heading-display is-xl`. `-value` is the `ix-count-in` target |
| `fk-post-grid` **MVP** | `-header` | — | Header title `fk-heading-lg`, body `fk-text-md is-subtle` |
| `fk-post-card` **MVP** | `-media`, `-image`, `-body`, `-title`, `-excerpt`, `-meta`, `-avatar`, `-meta-text` | `is-featured` | Bound to Posts. Title and excerpt clamp to 2 lines through exception `x-text-rendering` (the classes only carry `overflow: hidden`). The image zooms on its own hover |
| `fk-hero` | `-content`, `-title`, `-body`, `-actions`, `-media` | `is-home`, `is-candidates`, `is-facility-partners`, `is-about`, `is-blog`, `is-article` | Consolidate variants as heroes are migrated |
| `fk-card` | `-media`, `-body`, `-title`, `-text` | `is-feature`, `is-service` | Generic content card |
| `fk-testimonial` | `-media`, `-quote`, `-name`, `-role` | `is-active` | Quote reveals on hover |
| `fk-faq` | `-item`, `-question`, `-icon`, `-answer` | `-item.is-faq-open` | Accordion |
| `fk-marquee` | `-track`, `-item` | `is-slow` | Track moved by `ix-marquee` |
| `fk-newsletter` | `-title`, `-form`, `-field`, `-submit` | `is-stacked` | Default layout is a row |
| `fk-field` | — | `is-select` | Inputs/selects. Focus: brand border + field-active shadow |
| `fk-badge` | — | `is-inverse` | Category and status pills |
| `fk-portrait` | `-image` | `is-peach`, `is-sand`, `is-brand` | Rounded image pills (About hero, avatars) |
| `fk-slider` | `-nav`, `-arrow`, `-dots` | — | Wraps the Webflow Slider (testimonials) |
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
