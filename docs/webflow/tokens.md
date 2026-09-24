# Tokens → Webflow Variables

All tokens live in the Webflow variable collection **`Flint`**. In the repo they are CSS custom
properties in `src/styles/tokens.css`. The name is identical in both places: Webflow variable
`color-ink` ⇄ CSS `--color-ink`.

Values come from Figma via the current `src/index.css` `@theme` block, plus hardcoded values found in
`src/` that are promoted here. Values that are not listed must be snapped to the nearest token.

## Colors

### Core

| Token | Value | Usage |
| --- | --- | --- |
| `color-white` | `#ffffff` | Page background, inverse text |
| `color-ink` | `#0f0e17` | Headings, strong body text (replaces stray `#0a0a0a`) |
| `color-subtle` | `#61656a` | Subtle body, eyebrows |
| `color-brand` | `#44386d` | Brand purple: buttons, dark panels, footer |
| `color-brand-light` | `#f6f5f8` | Light brand panel background |
| `color-brand-foreground` | `#e0dcec` | Foreground/portrait tint on brand-light |
| `color-secondary` | `#fff5f3` | Secondary panel background |
| `color-tertiary` | `#fbf5f2` | Tertiary panel background |
| `color-surface` | `#f3f4f6` | Neutral surface panels |
| `color-stone-50` | `#edeff2` | Borders on white buttons, dividers |
| `color-stone-100` | `#d3d7de` | Footer link text, muted borders |
| `color-stone-400` | `#8c929b` | Form placeholder text |
| `color-neutral-hover` | `#f5f5f5` | Hover background of white buttons |

### Accent

| Token | Value | Usage |
| --- | --- | --- |
| `color-brand-focus` | `#b8adde` | Focus ring on primary buttons |
| `color-accent-rose` | `#bd535d` | Primary button gradient, start stop |
| `color-accent-blue` | `#5c77e0` | Primary button gradient, end stop |
| `color-peach-100` | `#fee0db` | Portrait/avatar backgrounds |
| `color-sand-100` | `#f1e0d8` | Portrait/avatar backgrounds |

**Transparency** is expressed in classes with `color-mix()` or Webflow's alpha on the variable
(for example white at 80% for footer body text, brand at 80% for long-form body). Don't create
separate tokens for opacity steps.

Colors that only appear **inside illustrations** (greens, oranges, flag colors in
`src/components/*Illustration.tsx`) are _not_ tokens. They belong to the illustration asset
(Lottie/SVG), see `interactions.md`.

## Fonts

| Token | Value | Notes |
| --- | --- | --- |
| `font-sans` | `"SN Pro", ui-sans-serif, system-ui, sans-serif` | Body. Upload as a custom font (Fontsource package `@fontsource/sn-pro`) |
| `font-serif` | `"STIX Two Text", ui-serif, Georgia, serif` | Headings. Available on Google Fonts |

The type scale is defined as classes and tag styles in [`classes.md`](classes.md#typography).

## Radii (size variables)

| Token | Value | Snap legacy values |
| --- | --- | --- |
| `radius-sm` | `8px` | — |
| `radius-md` | `12px` | 14, 15 |
| `radius-lg` | `16px` | 20 |
| `radius-xl` | `24px` | 26, 28 (the default panel/button radius) |
| `radius-2xl` | `32px` | 40 |
| `radius-full` | `999px` | `rounded-full`, 99, 200, 50% on square elements |

## Spacing (size variables)

A 4px grid, named like the legacy Tailwind scale so migration is mechanical (`px-5` → `space-5`).

| Token | Value | | Token | Value |
| --- | --- | --- | --- | --- |
| `space-1` | 4px | | `space-10` | 40px |
| `space-2` | 8px | | `space-12` | 48px |
| `space-3` | 12px | | `space-16` | 64px |
| `space-4` | 16px | | `space-20` | 80px |
| `space-5` | 20px | | `space-24` | 96px |
| `space-6` | 24px | | `space-32` | 128px |
| `space-8` | 32px | | | |

## Widths (size variables)

| Token | Value | Usage |
| --- | --- | --- |
| `width-container` | `1200px` | Default content container |
| `width-container-md` | `960px` | Stats and narrow grids |
| `width-content` | `580px` | Wide text blocks |
| `width-content-sm` | `480px` | Section headers, text columns (snap 436, 521) |
| `width-nav-pill` | `664px` | Max width of the scrolled nav pill |

## Shadows (class-level constants)

Webflow variables don't support shadows, so these values are only allowed inside the listed classes.

| Name | Value | Used by |
| --- | --- | --- |
| Button rest | `0 3px 2px -2px rgb(0 0 0 / 0.25)` | `fk-button is-primary` |
| Button hover | `0 2px 8.4px -1px rgb(68 56 109 / 0.3), 0 3px 2px -2px rgb(0 0 0 / 0.25)` | `fk-button is-primary:hover` |
| Button focus | `0 0 0 2px #fff, 0 0 0 4px var(--color-brand-focus)` | `fk-button:focus-visible` |
| Button inset (white) | `inset 0 -1px 2px 0 rgb(0 0 0 / 0.15)` | `fk-button is-secondary` |
| Nav pill | `0 2px 2.5px rgb(0 0 0 / 0.03), 0 9px 4.5px rgb(0 0 0 / 0.03), 0 19px 6px rgb(0 0 0 / 0.01)` | `fk-nav.is-pill` |
| Field active | `0 0 0 2px rgb(68 56 109 / 0.1)` | `fk-field:focus` |

## Motion

Used by interactions (`interactions.md`) and CSS transitions in classes.

| Name | Value |
| --- | --- |
| Ease out (expo) | `cubic-bezier(0.22, 1, 0.36, 1)` |
| Ease in-out | `cubic-bezier(0.42, 0, 0.58, 1)` |
| Ease pop | `cubic-bezier(0.34, 1.45, 0.64, 1)` |
| Duration fast | `150ms` (pressed states) |
| Duration base | `300ms` (hover, color, opacity) |
| Duration slow | `450ms` (nav shrink) |
| Duration reveal | `700ms` (scroll reveals) |
| Stagger | `90ms` between siblings |
