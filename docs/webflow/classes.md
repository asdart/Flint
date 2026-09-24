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
- No page names in classes. Pages differ through variants (`fk-hero is-about`).
- No numbers in names, except grid column counts (`is-3`).
- Don't style unclassed elements, except through tag styles.
- Only `fk-` utilities from the closed list below; everything else is a block class.

## Layers (apply in this order)

1. **Tag styles:** set the defaults so most text needs no class.
2. **Layout classes:** page, section, panel, container, grid, stack.
3. **Typography classes:** only when an element differs from its tag default.
4. **Component classes:** block + elements + combos.

## Tag styles

Desktop value, then values at the breakpoints where it changes (Tablet ≤991, Mobile ≤767).

| Tag | Font | Desktop | Mobile ≤767 | Color |
| --- | --- | --- | --- | --- |
| Body | `font-sans` 400 | 16/24 | — | `color-ink`, antialiased |
| H1 | `font-serif` 400 | 48/52, −0.96px | 32/40, −0.64px | `color-ink` |
| H2 | `font-serif` 400 | 48/52, −0.96px | 32/40, −0.64px | `color-ink` |
| H3 | `font-serif` 400 | 32/40, −0.64px | 28/36, −0.56px | `color-ink` |
| H4 | `font-sans` 500 | 20/28, −0.11px | 18/28 | `color-ink` |
| P | inherit | inherit | — | inherit |
| Link | inherit | inherit | — | inherit, no underline, color transition 300ms |
| Blockquote | `font-serif` | 24/32, −0.48px | 20/28, −0.4px | `color-ink` |

Also: `html { scroll-behavior: smooth; }`, and body/html `overflow-x: hidden`.

## Layout

| Class | Definition |
| --- | --- |
| `fk-page` | Page wrapper: full width, flex column, white background, `overflow-x: clip` |
| `fk-section` | Band wrapper: padding `space-4` inline and top (legacy `px-4 pt-4`) |
| `fk-section is-last` | Adds `space-4` bottom padding (last band before the footer) |
| `fk-section is-open` | Unpaneled band: padding 128/70 desktop → 96/40 tablet → 64/20 mobile |
| `fk-panel` | Rounded (`radius-xl`) band content, `overflow: clip`, padding 96/104 → 64/40 → 48/20 |
| `fk-panel is-brand` · `is-brand-light` · `is-secondary` · `is-tertiary` · `is-surface` | Panel background token |
| `fk-panel is-compact` | Padding 64/40 → 48/20 |
| `fk-container` | `max-width: width-container`, centered, full width |
| `fk-container is-md` · `is-content` · `is-content-sm` | Max width `width-container-md` / `width-content` / `width-content-sm` |
| `fk-grid` | CSS grid, gap `space-4` |
| `fk-grid is-2` · `is-3` · `is-4` | Columns on desktop. `is-3`/`is-4` → 2 on tablet. All → 1 on mobile |
| `fk-stack` | Flex column, gap `space-4` |
| `fk-stack is-gap-sm` · `is-gap-lg` · `is-gap-xl` | Gap `space-2` / `space-6` / `space-8` |
| `fk-row` | Flex row, wrap, align center, gap `space-2` |

## Typography

| Class | Desktop | Mobile ≤767 | Notes |
| --- | --- | --- | --- |
| `fk-heading-display` | serif 72/80, −1.08px | 48/52, −0.72px | Stat numbers |
| `fk-heading-display is-xl` | serif 96/96, −1.44px | 40/44, −0.8px | About stats (tablet 72/80) |
| `fk-heading-xl` | serif 48/52, −0.96px | 32/40, −0.64px | Same as H1/H2, for non-heading tags |
| `fk-heading-lg` | serif 40/44, −0.8px | 32/40, −0.64px | Blog and article heroes |
| `fk-heading-md` | serif 32/40, −0.64px | 28/36, −0.56px | Same as H3 |
| `fk-heading-sm` | serif 24/32, −0.48px | 20/28, −0.4px | Card titles, quotes |
| `fk-text-lg` | sans 18/28 | 16/24 | Lead and long-form body |
| `fk-text-md` | sans 16/24 | — | Explicit body size |
| `fk-text-sm` | sans 14/20 | — | Nav links, footer, meta |
| `fk-text-xs` | sans 12/16 | — | Badges, captions |
| `fk-eyebrow` | sans 16/24 | — | `color-subtle`. Label above section headings |

Color combos, valid on any typography class: `is-subtle` (`color-subtle`), `is-brand`
(`color-brand`), `is-brand-muted` (brand at 80%), `is-inverse` (white), `is-inverse-muted`
(white at 80%). Alignment: `is-center`. Weight: `is-medium` (500).

## Utilities (closed list)

| Class | Definition |
| --- | --- |
| `fk-reveal` | Interaction target for `ix-reveal` (see `interactions.md`). No visual styles |
| `fk-reveal-group` | Interaction target for `ix-reveal-stagger`. Children reveal in sequence |
| `fk-sr-only` | Visually hidden, accessible to screen readers |
| `fk-hide-mobile` | `display: none` at ≤767 |
| `fk-hide-desktop` | `display: none` above 991 |
| `fk-divider` | 1px top border, full width. Combo `is-inverse` → white at 20% |

## Component classes

Elements listed are the complete allowed set per block. States use Webflow states (Hover,
Pressed, Focused-keyboard) and map to `:hover`, `:active`, `:focus-visible` in CSS.

| Block | Elements | Combos | Notes |
| --- | --- | --- | --- |
| `fk-button` | `-label`, `-icon` | `is-primary` (gradient, default), `is-secondary` (white), `is-small` | Radius `radius-xl`, 14/20 medium. Primary hover shifts gradient via `background-position` (no `@property`). Pressed dims label/icon to 60% |
| `fk-nav` | `-logo`, `-links`, `-link`, `-actions`, `-toggle`, `-menu`, `-menu-link` | `is-dark`, `is-pill` (scrolled), `is-open` | `-link` combo `is-active`. `is-pill` is set by `ix-nav-pill` |
| `fk-footer` | `-cta`, `-groups`, `-group`, `-group-title`, `-link`, `-bottom`, `-copyright` | — | Inside `fk-panel is-brand` |
| `fk-section-header` | `-eyebrow`, `-title`, `-body` | `is-center`, `is-inverse` | Standard eyebrow + heading + body block |
| `fk-hero` | `-content`, `-title`, `-body`, `-actions`, `-media` | `is-home`, `is-candidates`, `is-facility-partners`, `is-about`, `is-blog`, `is-article` | Consolidate variants as heroes are migrated |
| `fk-card` | `-media`, `-body`, `-title`, `-text` | `is-feature`, `is-service` | Generic content card |
| `fk-post-card` | `-image`, `-meta`, `-category`, `-title`, `-excerpt`, `-author` | `is-featured` | Bound to the Posts collection |
| `fk-stat` | `-value`, `-suffix`, `-label` | — | Stat item in the Stats Band |
| `fk-testimonial` | `-media`, `-quote`, `-name`, `-role` | `is-active` | Quote reveals on hover |
| `fk-faq` | `-item`, `-question`, `-icon`, `-answer` | `-item.is-open` | Accordion |
| `fk-marquee` | `-track`, `-item` | `is-slow` | Track moved by `ix-marquee` |
| `fk-newsletter` | `-title`, `-form`, `-field`, `-submit` | `is-stacked` | Default layout is a row |
| `fk-field` | — | `is-select` | Inputs/selects. Focus: brand border + field-active shadow |
| `fk-badge` | — | `is-inverse` | Category and status pills |
| `fk-portrait` | `-image` | `is-peach`, `is-sand`, `is-brand` | Rounded image pills (About hero, avatars) |
| `fk-slider` | `-nav`, `-arrow`, `-dots` | — | Wraps the Webflow Slider (testimonials) |
| `fk-illustration` | — | — | Frame for a Lottie illustration (`interactions.md`) |
| `fk-article` | `-toc`, `-toc-link`, `-body`, `-quick-answer` | — | CMS template. `-body` styles the Rich Text element |

## Example

```html
<section class="fk-section">
  <div class="fk-panel is-tertiary">
    <div class="fk-container is-content-sm">
      <div class="fk-section-header is-center fk-reveal">
        <p class="fk-section-header-eyebrow fk-eyebrow">Mission</p>
        <h2 class="fk-section-header-title">Why we exist</h2>
        <p class="fk-section-header-body fk-text-lg is-brand-muted">…</p>
      </div>
    </div>
  </div>
</section>
```

This replaces the legacy `AboutPage.tsx` markup, which repeated a
`font-serif text-[32px] leading-10 tracking-[-0.64px] … md:text-[48px]` string in every section. The H2 now
gets its style from the tag style.
