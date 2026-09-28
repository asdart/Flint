# CSS system — utilities layer (approved, S7 passed)

**Status:** direction approved by the user. Gate: spike S7 (below) passed on the test site
2026-09-27, including the staging check, so contract 1.6 (utilities layer, rules in [Rules](#rules)) can proceed. This
document is not yet contract until `AGENTS.md` is bumped to 1.6 by whoever lands the utilities
migration (roadmap item 2).

## Why

The homepage (`/mvp-home`, now the base) was refactored onto one section shell: `fk-section` >
`fk-panel` (color + rhythm combos) > `fk-container` > `fk-panel-content` > `fk-section-header` +
body. Section-specific shells were removed, content moved from absolute positioning to normal
flow, and block text classes were replaced by typography classes + combos. But the contract can
only express reuse as combo classes, and a combo exists per base: `is-brand-muted` already exists
twice (on `fk-text-lg` and `fk-text-md`). Block CSS repeats basics: `display: flex` ×60,
`width: 100%` ×41, `gap` ×41, `align-items: center` ×33, `flex-direction: column` ×32 across 20
files; `fk-hero-action`, `fk-cta-action`, `fk-post-grid-action` were the same rule. Ad hoc helpers
appeared as combos or wrappers (`fk-container is-full-height`, `fk-hide-tablet` wrapper, stacked
`fk-container fk-footer-panel`, `fk-section is-x-flush`).

## Layers

`tokens → utilities → primitives → blocks`.

### Utilities (new `src/styles/utilities.css`)

Single purpose, token-valued, stacked after the element's main class. Closed list: a utility
exists only if the homepage uses it at least twice or it maps 1:1 to a token. Not
Tailwind-granular: no full padding/margin grid.

| Group | Utilities |
| --- | --- |
| Display | `fk-flex`, `fk-block`, `fk-hidden` |
| Flex | `fk-flex-col`, `fk-wrap`, `fk-items-start` / `-center` / `-end` / `-stretch`, `fk-justify-center` / `-between` / `-end`, `fk-self-center`, `fk-grow`, `fk-shrink-0` |
| Gap | `fk-gap-{n}` for the spacing tokens |
| Spacing (small set) | `fk-mx-auto`, `fk-mt-auto`, a few `fk-pt-*` |
| Sizing | `fk-w-full`, `fk-h-full`, `fk-min-h-0`, `fk-max-w-content` / `-content-sm` / `-container` |
| Position / overflow | `fk-relative`, `fk-absolute`, `fk-inset-0`, `fk-overflow-clip`, `fk-object-cover` |
| Radius | `fk-rounded-sm` / `-lg` / `-xl` / `-full` |
| Colors | `fk-bg-{token}` (panel/surface colors), `fk-color-{token}` (text colors) |
| Text | `fk-text-left`, `fk-text-center`, `fk-font-sans` / `-serif` / `-medium` |

### Responsive utilities

**Suffix naming (decision 2026-09-27):** `-tablet` = ≤991, `-mobile` = ≤767, `-phone` = ≤479,
max-width only (Webflow is desktop-first; class names can't contain `:`). Examples:
`fk-hidden-tablet`, `fk-hidden-mobile`, `fk-flex-col-tablet`, `fk-items-start-mobile`,
`fk-gap-8-mobile`, `fk-text-center-tablet`.

"Hidden on desktop only" = `fk-hidden` + a show utility (`fk-flex-tablet` / `fk-block-tablet`),
replacing today's `fk-hide-desktop`, which forces `display: block`. Existing `fk-hide-tablet` /
`fk-hide-mobile` get renamed to `fk-hidden-*`.

### Primitives

`fk-section`, `fk-panel` (rhythm combos `is-compact` / `is-relaxed` / `is-hero`), `fk-container`
(`is-md`, `is-content`, `is-content-sm`; `is-full-height` becomes `fk-h-full`), `fk-panel-content`,
`fk-section-header` (`is-center`, `is-narrow`), `fk-grid is-2` / `is-3` / `is-4`, `fk-button`,
typography sizes `fk-heading-*` / `fk-text-*`.

- **Panel colors move to `fk-bg-*` utilities** (decision), shared with cards; `fk-panel is-secondary`
  etc. retire.
- **New primitive `fk-section-header-action`** (decision): the centered button row under a header,
  replacing `fk-hero-action`, `fk-cta-action`, `fk-post-grid-action`, `fk-two-ways-action` where
  equivalent.
- Typography color combos (`is-brand-muted`, `is-inverse`, `is-subtle`, `is-inverse-muted`) become
  `fk-color-*` utilities; `fk-heading-sm is-sans` becomes `fk-font-sans`.

### Blocks

Only geometry nothing else can express: hero arc, how-it-works carousel, testimonials slots, logo
marquee track/fades, partners-map ticker, two-ways collage, CTA art, nav, card visuals.

## Rules (become contract 1.6 once the migration lands)

1. A utility never sets a property the element's main class sets: combos (0,2,0) beat single
   classes, but between single classes Webflow controls CSS order, so overlaps must not exist.
2. Utility names mirror token names (`fk-gap-4` ↔ `space-4`), so numbers are allowed in utility
   names.
3. Suffix responsive naming as above.
4. Interactions never target utilities, only block classes and `data-ix`.
5. Per element: one primitive/block class + any number of utilities, at most two combos on the
   main class.
6. Never edit a stacked element's style in the Designer (it writes to a combo of the whole stack);
   edit the standalone utility.

## Example

Two Ways card copy, before and after:

```html
<!-- before -->
<div class="fk-two-ways-copy">
  <p class="fk-text-md is-brand-muted">…</p>
</div>

<!-- after -->
<div class="fk-flex fk-flex-col fk-gap-2">
  <p class="fk-text-md fk-color-brand-80">…</p>
</div>
```

## Migration plan

| Step | What |
| --- | --- |
| 0 | Spike S7 (gate) — **done, passed, 2026-09-27** |
| 1 | Fixes in the current diff (being done in parallel by another agent) |
| 2 | `utilities.css` + registry section, generated from `tokens.css` by a small script so they can't drift; contract 1.6 and correct the skill pitfall |
| 3 | Refactor the homepage section by section, leaving the arc / how carousel / testimonials geometry to their own pass (they still need work) |
| 4 | Production is built with the new system |

## Decisions (2026-09-27)

| Decision | Answer |
| --- | --- |
| Responsive suffix naming | `-tablet` / `-mobile` / `-phone`, max-width only |
| Panel colors | Utilities (`fk-bg-*`), shared with cards, not `fk-panel is-*` combos |
| Header action row | New primitive `fk-section-header-action` |

---

## S7 result — can the MCP stack standalone classes?

**Question:** can the Webflow MCP put several existing standalone (global) classes on one element
so each class's own global styles apply (Webflow's stacked-classes model, à la Finsweet
Client-First), without a combo copying values on top? Run on the **test** site
(`6ab46032460da07da9dc6231`), `/lab` page (`6ab6bfe994c305e2a2248716`), lab-only classes prefixed
`fk-lab-u-`. Nothing outside `/lab` was touched. Verdict below.

### Verdict

**Adopt stacked utilities through the MCP.** An element's `class` attribute (`styleNames`) really
does carry every stacked class name, and each standalone class keeps applying its own properties.
Webflow silently creates an **empty** combo style object for every new class combination
(confirming the existing pitfall rows), but "empty" is the key correction: it copies **no**
properties, so it's inert noise in the styles list, not a divergent copy. The two pitfall rows in
the skill are corrected in place (see below) rather than reversed outright.

One real limitation found: **`data_element_tool` → `set_style` cannot create a brand-new combo
chain.** It only succeeds when that exact chain (by class-name sequence) already exists — created
earlier by a WHTML insert of the same combination, or by explicit `create_style` calls for every
intermediate depth. The WHTML builder auto-creates the chain on first use; `set_style` then reuses
it by name on later elements.

### Tests

| # | Test | Result |
| --- | --- | --- |
| 1 | Create 4 standalone styles (`data_style_tool` → `create_style`) | 3/4 as planned. `fk-lab-u-box` (padding 16px + `color-secondary` background), `fk-lab-u-flex` (`display: flex`), `fk-lab-u-col-tablet` (base `flex-direction: row`, `medium` breakpoint `flex-direction: column`) all created clean. `fk-lab-u-gap` **failed** with `variable_as_value` on `gap` (see Pitfall found below); recreated with a literal `"16px"` |
| 2 | Test A — WHTML builder, no `css`, insert `<div class="fk-lab-u-box fk-lab-u-flex fk-lab-u-gap fk-lab-u-col-tablet">` | **Pass.** Read-back `styleNames` = all 4 names, in order. `query_styles` then showed 3 **new, empty** combo styles: `.fk-lab-u-box.fk-lab-u-flex` (id `ffaf0e35-…7b34`), `.fk-lab-u-box.fk-lab-u-flex.fk-lab-u-gap` (id `…7b35`), `.fk-lab-u-box.fk-lab-u-flex.fk-lab-u-gap.fk-lab-u-col-tablet` (id `…7b36`) — each `properties: {"base": {}}` |
| 3 | Test B — `data_element_tool` → `set_style` with `style_names: ["fk-lab-u-box","fk-lab-u-flex","fk-lab-u-gap"]` on a plain div | **Pass, but reuse only.** Resolved to the *same* 3-deep combo id (`…7b35`) Test A had already created — no duplicate. A **fresh** never-before-combined pair (`["fk-lab-u-flex","fk-lab-u-gap"]` on a new plain div) was rejected: `"One or more styles not found: fk-lab-u-flex, fk-lab-u-gap"`. So `set_style` reuses existing chains by name; it does not create new ones |
| 4 | Test C — same id or new style? | **New style, same-name chain.** The combo ids (`ffaf0e35-…7b34/35/36`, `dcd65786-…f6e1`) are distinct from the standalone class ids (`226959ce…`, `80b2bdc0…`, `6c1d8120…`, `5cb08af2…`). They are empty, so the published CSS keeps applying via the standalone classes, since the element's class attribute holds every name — no divergence risk from the empty combo itself |
| 5 | Test D — specificity: combo `fk-lab-u-box is-lab-variant` (`display: block`) + stacked `fk-lab-u-flex` | Inserted `<div class="fk-lab-u-box is-lab-variant fk-lab-u-flex">` via WHTML (`set_style` alone can't build this chain either — confirmed the same "not found" error before falling back to WHTML). Webflow created one more new empty combo `.fk-lab-u-box.is-lab-variant.fk-lab-u-flex` (id `dcd65786-…f6e1`); the 2-class combo `.fk-lab-u-box.is-lab-variant` (id `285656fa…`) kept its own `display: block`. By standard CSS specificity (the stored selectors are literal compound class selectors: 2 classes beat 1), `.fk-lab-u-box.is-lab-variant` outranks `.fk-lab-u-flex` regardless of stylesheet order — this is inferred from the stored selector structure and CSS cascade rules, **not** visually confirmed (no Designer/Bridge session, no publish) |
| 6 | `element_snapshot_tool` | `{"status":false}` — Designer + MCP Bridge not connected. Confirms the existing pitfall row; no visual read was possible this session |

### Staging check (2026-09-27): passed

Published to `flint-4167fa.webflow.io` with the user's confirmation, then read `/lab` and the site
CSS (`…/css/flint-4167fa.webflow.shared.*.css`):

| Check | Result |
| --- | --- |
| Rendered `class` attribute keeps every stacked name | **Pass.** `class="fk-lab-u-box fk-lab-u-flex fk-lab-u-gap fk-lab-u-col-tablet"`, `class="fk-lab-u-box is-lab-variant fk-lab-u-flex"` |
| Each utility is its own global rule | **Pass.** `.fk-lab-u-flex{display:flex}`, `.fk-lab-u-gap{gap:16px}`, `.fk-lab-u-box{…}` as separate rules |
| Empty auto-created combos | **Not emitted at all.** No `.fk-lab-u-box.fk-lab-u-flex` selector in the published CSS: they only exist in the Designer's style list |
| Breakpoint override on a stacked utility | **Pass.** `.fk-lab-u-col-tablet{flex-direction:column}` inside `@media screen and (max-width: 991px)` |
| Combo vs utility | **Pass.** `.fk-lab-u-box.is-lab-variant{display:block}` (two classes) outranks `.fk-lab-u-flex{display:flex}` (one class) by specificity, whatever the order |

The spike classes and elements were deleted afterwards (user-approved), so they're gone from the
Designer; staging keeps showing them until the next publish.

### Pitfall found (new)

`create_style` → `Property gap does not support setting a variable of type length` when
`gap` is set via `variable_as_value` pointing at a size/length variable (`space-4` tried here).
The spike fell back to a literal `"16px"` for the lab class only. For real utilities, send the
longhands `grid-row-gap` / `grid-column-gap` with the variable (what Webflow stores and what
`scripts/webflow-style-actions.mjs` already does), never a literal (rule 2). Recorded in the skill
pitfalls table.

### Fallback (not needed — S7 passed)

If stacking hadn't worked, the fallback was primitives with combos (`fk-stack is-center
is-gap-8`) instead of freely stacked utilities. Not required: proceed with the utilities layer as
scoped above.
