# Tokens → Webflow Variables

All tokens live in the Webflow variable collection **`Flint`**. In the repo they are CSS custom
properties in `src/styles/tokens.css`. The variable name is identical in both places: Webflow
variable `color-ink` ⇄ CSS `--color-ink`. Ids are in `webflow-ids.json`.

How Webflow stores them (checked in the MVP):

- Webflow's own CSS name is `--_flint---color-ink` (collection prefix). Don't use it in the repo.
  The WHTML builder links `var(--color-ink)` to the variable by **name**, and `update_style` links
  by **id** (`variable_as_value`).
- Only whole values link to a variable. Inside compound values (gradients, shadows, `calc()`),
  Webflow stores the literal value, so changing a token doesn't update them. They're listed below
  as class-level constants and pushed with the token already resolved.
- Font-family variables hold the family name only (`SN Pro`); a full stack is rejected.
- Creating a variable whose name already exists doesn't fail: Webflow adds `-2`. Always query first.

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

### Transparent

Webflow classes can't derive an alpha from a variable (no `color-mix()`), so each transparency
step that's in use is its own token. Add a row before using a new one.

| Token | Value | Usage |
| --- | --- | --- |
| `color-white-80` | `rgba(255, 255, 255, 0.8)` | Body text on brand panels |
| `color-white-60` | `rgba(255, 255, 255, 0.6)` | Pressed text on primary buttons |
| `color-white-20` | `rgba(255, 255, 255, 0.2)` | Dividers on brand panels |
| `color-white-10` | `rgba(255, 255, 255, 0.1)` | Primary button icon circle |
| `color-brand-80` | `rgba(68, 56, 109, 0.8)` | Long-form body text |
| `color-subtle-80` | `rgba(97, 101, 106, 0.8)` | Stat labels |

Snapped legacy values: the post card excerpt (`rgba(38,37,30,0.6)`) → `color-subtle`, the post
card meta (`rgba(38,37,30,0.5)`) → `color-stone-400`, the avatar background `#e6e5e0` → `color-stone-50`.

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
| `space-1` | 4px | | `space-7` | 28px |
| `space-1-5` | 6px | | `space-8` | 32px |
| `space-2` | 8px | | `space-10` | 40px |
| `space-2-5` | 10px | | `space-12` | 48px |
| `space-3` | 12px | | `space-16` | 64px |
| `space-4` | 16px | | `space-20` | 80px |
| `space-5` | 20px | | `space-24` | 96px |
| `space-6` | 24px | | `space-32` | 128px |

`space-1-5` and `space-2-5` exist only for button padding (legacy `py-1.5` / `py-2.5`), which
sets the button heights. `space-7` is the paragraph gap in long-form text.

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
| Button rest | `inset 0 0 5.8px 3px rgba(255,255,255,0.25), 0 3px 2px -2px rgba(0,0,0,0.25)` | `fk-button` |
| Button hover | `inset 0 0 5.8px 3px rgba(255,255,255,0.25), 0 2px 8.4px -1px rgba(68,56,109,0.3), 0 3px 2px -2px rgba(0,0,0,0.25)` | `fk-button:hover` |
| Button focus | `0 0 0 2px var(--color-white), 0 0 0 4px var(--color-brand-focus)` | `fk-button:focus-visible` |
| Button inset (white) | `inset 0 -1px 2px 0 rgba(0,0,0,0.15)` | `fk-button is-secondary` |
| Nav pill | `0 2px 2.5px rgba(0,0,0,0.03), 0 9px 4.5px rgba(0,0,0,0.03), 0 19px 6px rgba(0,0,0,0.01)` | `fk-nav is-pill` |
| Field active | `0 0 0 2px rgba(68,56,109,0.1)` | `fk-field:focus` |

The primary gradient is also a class-level constant: `linear-gradient(349.52deg, color-accent-rose
-16.17%, color-brand 19.86%, color-brand 32.63%, color-accent-blue 73.12%)` on a
`100% 200%` background (`fk-button`).

## Motion

Used by interactions (`interactions.md`) and CSS transitions in classes.

| Name | CSS value | IX3 ease preset |
| --- | --- | --- |
| Ease out | `cubic-bezier(0.22, 1, 0.36, 1)` | `11` (power4.out) |
| Ease in-out | `cubic-bezier(0.42, 0, 0.58, 1)` | `3` (power1.inOut) |
| Ease pop | `cubic-bezier(0.34, 1.45, 0.64, 1)` | `14` (back.out) |
| Duration fast | `150ms` (pressed states) | — |
| Duration base | `300ms` (hover, color, opacity) | — |
| Duration slow | `450ms` (nav shrink) | — |
| Duration reveal | `700ms` (scroll reveals) | — |
| Stagger | `90ms` between siblings | — |
