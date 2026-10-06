# Recipes

Tested payloads for the Webflow MCP. Ids in `<angle brackets>` come from
`docs/webflow/webflow-ids.json` or from the previous call's result. Every call also carries
`session_id`, `agent_id` and `context` (see the playbook).

## Contents

- [Site instruction](#site-instruction)
- [Diff the repo against Webflow](#diff-the-repo-against-webflow)
- [Push classes](#push-classes)
- [Tag styles](#tag-styles)
- [Site head code (custom CSS exceptions)](#site-head-code-custom-css-exceptions)
- [Build a page from the repo markup](#build-a-page-from-the-repo-markup)
- [Home sections: component or page markup](#home-sections-component-or-page-markup)
- [Compare a page with the repo](#compare-a-page-with-the-repo)
- [Carousel dots and repeated instances](#carousel-dots-and-repeated-instances)
- [CMS-bound grid (Post Grid)](#cms-bound-grid-post-grid)
- [Upload an asset](#upload-an-asset)
- [Fonts](#fonts)
- [Variables from tokens.css](#variables-from-tokenscss)
- [SVG icons and optional icons](#svg-icons-and-optional-icons)
- [Component from markup](#component-from-markup)
- [Props and bindings](#props-and-bindings)
- [Variants](#variants)
- [Instances inside a component](#instances-inside-a-component)
- [Native elements (button, span)](#native-elements-button-span)
- [Text around a bound span](#text-around-a-bound-span)
- [Delete a component](#delete-a-component)
- [Stack utility classes](#stack-utility-classes)
- [Remove elements](#remove-elements)
- [Replace a CMS field](#replace-a-cms-field)
- [Collection List settings](#collection-list-settings)
- [Verify](#verify)

## Site instruction

First sync of a site (playbook step 0). `data_agent_instructions_tool`, `site_id` inside each action
(checked 2026-09-29, production):

```json
{ "actions": [
  { "label": "search", "search_instructions": { "site_id": "<site id>" } }
] }
```

An empty site returns `instructions: []`. Then create the rule (one call; the markdown is a summary
of `AGENTS.md` rules, breakpoints and sync order, with a note that `AGENTS.md` wins):

```json
{ "actions": [
  { "label": "create", "create_instruction": {
      "site_id": "<site id>", "kind": "rule", "path": "rules/flint-contract.md",
      "description": "Flint repo to Webflow contract: rules every agent follows when changing this site.",
      "markdown": "# Flint contract (AGENTS.md, version 1.7)\n…" } }
] }
```

The result has the instruction `id` (record it in `webflow-ids.json` → `siteInstructions`) and
`version: 1`. To change it later use `update_instruction` (`kind`, `path`, `markdown`), which bumps
the version; do this whenever the contract version changes (`read_instruction` with `resolve_references: false` first, then send the whole markdown again; done for 1.7 on 2026-09-29, version 2; version 3 the same day reworded rule 6 to "used or planned on more than one page" and dropped the retired `x-scroll-lock` from rule 8; version 4 on 2026-10-06 for contract 1.11: rule 3 Rich Text exception, rule 7 CSS hovers, rule 8 and rule 6 point to the registries instead of listing names, rule 15 image width / height, a "Markup and defaults" section). `get_site` doesn't return the Webflow
plan, and the repo has no public URL to link, so the rule refers to "the Flint repo".

## Diff the repo against Webflow

1. `data_style_tool` → `get_styles` with `query: "all"`, `include_properties: true`,
   `include_breakpoints: ["main","medium","small","tiny"]`,
   `include_base_pseudos: ["noPseudo","hover","active","focus","focus-visible","focus-within","placeholder"]`.
   The client writes the large result to a file and prints its path.
2. `node scripts/webflow-diff.mjs <that file> src/styles/base.css src/styles/layout.css src/styles/typography.css src/styles/utilities.css src/styles/components/*.css --unregistered`
   (include `utilities.css`: the generated utilities are classes too; `base.css` covers the tag styles)
3. Each line is `selector @breakpoint:state property: repo → webflow`. "No differences." (exit 0) is
   the goal. It already ignores Webflow's own grid defaults, empty two-combo stacks and `w--current`.

## Push classes

- **New classes:** `node scripts/webflow-css.mjs <css files>` → pass the output as `css` to
  `data_whtml_builder` together with the markup that uses them.
- **Existing classes, states, fixes:** `node scripts/webflow-style-actions.mjs <css file> --only fk-a,fk-b`
  → send the printed array as `actions` of `data_style_tool`. `update_style` is idempotent.
- **New classes without markup (preferred since 2026-09-25):** `--create` prints a `create_style` per
  class chain (desktop values, combos with `parent_style_names`), then `update_style` for the other
  breakpoints. Only pass chains that don't exist yet (`query_styles` first; filter the output by
  chain when a file also holds existing classes). The script skips rules on `w--current`/`w--open`. The builder's quirks (same-name combos dropped)
  don't apply, and a later WHTML insert without `css` reuses the classes by name.
- **Whole-site first push (630 actions, 441 chains, checked 2026-09-29):** run `--create` on every non-legacy
  file, merge the outputs into one list (creates first, ordered by chain depth so a base exists before its
  combo; then every `update_style`), and send it in batches of at most 45 actions with short labels
  (`c1`…, `u1`…). The payload is re-typed into the tool call, so expect ~250 KB in total. A combo whose only
  rules are at other breakpoints still needs its `create_style` (empty `properties` is accepted). The API
  rate-limits after ~170 actions in a few minutes: see the pitfalls table. Then run the diff.
- Both scripts turn `url("/assets/…")` into the hosted asset URL from `webflow-ids.json`, so upload
  mask and background images first.
- WHTML without `css` reuses classes that already exist, by name.
- **Removed declarations:** the script can't know what Webflow still has. Read the class
  (`query_styles`, `include_properties`, all pseudos you touched) and send
  `{ "update_style": { "style_name": "fk-x", "breakpoint_id": "main", "remove_properties": ["background-size"] } }`
  (add `pseudo` / `parent_style_names` as needed). Variant styles take `remove_properties` too.
- Exception CSS (`src/styles/exceptions/`) is never passed to either script.
- The script expands `padding-inline` to `padding-left`/`-right` (what Webflow stores) and
  `margin-inline` to `margin-inline-start`/`-end` (stored as such).
- **Alias token** (`--a: var(--b)`): `create_size_variable` with
  `value: { existing_variable_id: "<b's id>" }`; it reads back as `{ id }`. Prefer using the
  existing token directly: an alias only earns its place when it can diverge later.

## Tag styles

Checked 2026-09-29 (production). Precondition: each tag style was seeded once in the Designer (a
seeded style shows up in `get_styles` with `type: "tag"`, `id: "default-h1"`, `selector: "h1"`; Webflow
also gives `body`, `p`, `a`, `img`, `blockquote`, `h1`–`h4` these names). `update_style` is idempotent:

```json
{ "label": "h1", "update_style": { "style_name": "h1", "breakpoint_id": "main",
  "properties": [
    { "property_name": "font-family", "variable_as_value": "<font-serif id>" },
    { "property_name": "font-size", "property_value": "48px" },
    { "property_name": "margin-top", "property_value": "0px" } ] } }
{ "label": "h1-s", "update_style": { "style_name": "h1", "breakpoint_id": "small", "properties": [ … ] } }
```

- Generate the actions: `node scripts/webflow-style-actions.mjs --tags src/styles/base.css` (`:where(.fk-page)`
  → `body`, `:where(.fk-page) :where(h1, h2)` → `h1` and `h2`; shorthands expand to the longhands
  Webflow stores: `margin: 0` → four `margin-*`, `border: 0` → `border-*-width: 0px` + `-style: none`).
  `--tags` never creates styles, and `figure` is skipped (no tag style).
- Color, font family and `font-family` on `body` take `variable_as_value`; `color: inherit` and
  `transition: color 300ms ease-out` are plain values.
- Webflow's defaults that `base.css` doesn't hold must be removed (`remove_properties`): only
  `blockquote`'s `border-left-color` needed it, everything else was overwritten by longhands.
- Verify: fresh `get_styles` dump → `node scripts/webflow-diff.mjs <dump> src/styles/base.css <class css files> --unregistered`.
  Run it before the push too: it lists exactly what the Designer seed left behind.

## Site head code (custom CSS exceptions)

For the registered CSS exceptions (`x-button-gradient`, `x-text-rendering`, `x-blur-reveal`; checked
2026-09-29, production; the block was re-written the same day for the primary-only scope and the blur rule). The repo source of the pasted block is `docs/webflow/custom-code/site-head.html`:
one `<style>` with a comment per exception id, each `var(--token)` renamed to
`var(--_flint---token)`, `@property` and the `prefers-reduced-motion` media query exactly as in
`src/styles/exceptions/*.css`, minified. Keep it in step with the exception files.

1. Read: `data_scripts_tool` → `{ "get_site_freeform_code": { "site_id": "…", "location": "head" } }`
   (`get_site_scripts` may 404 "Custom code block not found" on a site with no scripts: normal).
2. Write: `{ "set_site_freeform_code": { "site_id": "…", "location": "head", "content": "<style>…</style>" } }`.
   It **replaces** the block, so merge with what step 1 returned. The result echoes the stored content.
3. Read it back and compare with the file (trim the trailing newline).
4. Nothing is live until the site is published (`/safe-publish`).
`register_inline_script` is for real scripts only (max 2,000 characters), never for CSS.

## Build a page from the repo markup

The Webflow page uses the markup the repo page renders, so nothing is retyped:

1. `data_pages_tool` → `create_page` (`site_id`, `title`, `slug`, `draft: true`, `seo`).
2. `node scripts/webflow-markup.mjs src/sections/Hero.tsx …` prints `{ path: html }`: static
   markup with hosted asset URLs and no preview-runtime state. Then empty every spot where a
   component instance goes (buttons, repeated cards) and every native button (pagination dots),
   with a small regex over the string. (Older route: read `outerHTML` from the preview with CDP and
   strip `data-cursor-ref`, `is-revealed` and inline styles.)
3. `data_whtml_builder` into the page Body: `<div class="fk-page">` + that `main`, no `css`.
4. Remove the `class` attribute from DOM elements (`hr`), then place `Global / Nav` before `main`,
   `Global / Footer` after it, and UI instances with `insert_component_instance` + prop values.

Found in the test stage (a full homepage build): in the extraction script, also remove preview-runtime state
(`is-revealed`, `is-inverse`, inline `style`), empty the Button slots, keep one copy of a repeated
UI component (transform it, then `data_component_builder` → `insert_in_element` by component name
into the empty slots and set props), and drop the repo's list markup where a Collection List goes.
Link every image afterwards with `set_settings` → `assetId` + `altText`. Then transform each section
root (`replace: true`) into its `Section /` component and bind its texts to props.

## Home sections: component or page markup

Checked 2026-09-29 (production, Stage 7a; roadmap D-17). The page shell first:

1. `data_whtml_builder` into Body: `<div class="fk-page"><main></main></div>` (an empty `main` is accepted,
   the result gives the wrapper's id). `get_all_elements` gives `main`'s id.
2. `insert_component_instance` with `parent_element_id` = `main` and `creation_position` `"before"` for `Global / Nav`,
   `"after"` for `Global / Footer`.
3. Each section: `node scripts/webflow-markup.mjs src/sections/X.tsx`, blank every `<a class="fk-button…">…</a>`
   (regex, keep its wrapper div), replace ` />` by `/>`, keep `data-ix`, `data-*` and `aria-*` in the markup,
   and insert it with WHTML (`append` to `main`, one root, no `css`). The result is `partial_success` with one
   warning per image ("inserted without a managed asset"): expected. Then:
   - `query_elements` with `scope_element_id` = the section and `element_filter: { "type": "Image" }` lists the image ids in DOM order;
   - one `set_settings` call with an operation per image (up to 40 in one call): `assetId` (from `webflow-ids.json` → `assets`)
     and `altText` (`""` for decorative, the facility name for the first Logo Marquee row). Generate the operations with a
     throwaway script from the id list and the repo's image order;
   - `insert_component_instance` (`UI / Button`) `append` into each emptied slot, then `set_component_instance_prop_values`
     for `Variant`, `Label` and `Link` when they differ from the defaults (Primary, "Apply now", `#apply`).
4. **Component sections** (Hero, Logo Marquee): finish the section on the page (assets, Button instances), then
   `transform_element_to_component` (`group: "Section"`, `replace: true`), read the page tree again
   (`get_all_elements`, `depth: 3`) for a stray instance (none appeared when the section wasn't the first child of
   `fk-page`) and spot-check an image inside the component with `get_settings` + `scope_component_id`
   (assets and alt survive the transform). Create props only where the content differs per page.
5. **Page-level sections** (Two Ways, Pricing, Partners Map…) stay as the inserted elements.
6. Verify with [Compare a page with the repo](#compare-a-page-with-the-repo), a class diff and snapshots.

## Compare a page with the repo

`data_element_tool` with `get_all_elements` (`depth: -1`) for the page and, per section component, one more with
`scope_component_id` in the same call; the client saves the ~90k characters to a file. Then write a jobs file
(`[{ "name": "Hero", "file": "src/sections/Hero.tsx", "source": "action:1" }, { "name": "Two Ways", "file": "src/sections/TwoWays.tsx", "source": "main:2" }]`)
and run `node scripts/webflow-markup.mjs <files> > markup.json` and
`node scripts/webflow-tree-diff.mjs <saved file> markup.json jobs.json`. It compares tag, classes, `data-*`/`aria-*`,
image alt, text and order node by node (a `UI / Button` link in the repo must be a Button instance in Webflow) and exits 1
on any difference. It doesn't check asset ids or `width`/`height` (spot-check with `get_settings`; a Testimonial Card's Image prop id is
compared with a throwaway script over the dump). A `UI / Button` instance is compared by Label and Link (skipped when bound to a host prop) and a
`UI / Testimonial Card` by Name, Role and Quote; a text element bound to a prop counts as "bound text skipped".

## Carousel dots and repeated instances

Checked 2026-09-29 (production, Stage 7b: How It Works with 6 dots, Testimonials with 7 dots and 21 cards).

1. Insert the section with WHTML and **empty** containers: `<div class="fk-carousel-dots"></div>` and one empty
   `<div class="fk-testimonials-slide" data-tm-slide="n" aria-hidden="true"></div>` per slide (`is-center` on the resting one).
   `query_elements` with `element_filter: { "style": "fk-carousel-dots" }` and `{ "style": "fk-testimonials-slide" }`
   (scoped to the section) lists the container ids; slide ids are consecutive hex values.
2. Dots: one `data_element_builder` action per dot, `append` into the container, children nested in the same action
   (button > bar span > fill span), 7 dots in one call worked:
   ```json
   { "build_label": "how-dot-1", "parent_element_id": {...}, "creation_position": "append",
     "element_schema": { "type": "DOM", "set_dom_config": { "dom_tag": "button" },
       "set_style": { "style_names": ["fk-carousel-dots-button"] },
       "set_attributes": { "attributes": [{ "name": "type", "value": "button" }, { "name": "data-dot", "value": "how-1" }, { "name": "aria-label", "value": "Go to step 1" }] },
       "children": [{ "type": "DOM", "set_dom_config": { "dom_tag": "span" },
         "set_style": { "style_names": ["fk-carousel-dots-bar", "is-active"] },
         "set_attributes": { "attributes": [{ "name": "data-dot-bar", "value": "how-1" }] },
         "children": [{ "type": "DOM", "set_dom_config": { "dom_tag": "span" },
           "set_style": { "style_names": ["fk-carousel-dots-fill"] },
           "set_attributes": { "attributes": [{ "name": "data-dot-fill", "value": "how-1" }] } }] }] } }
   ```
3. Cards: `insert_component_instance` (`Testimonial Card`) `append` into each slide (21 in one call), then
   `set_component_instance_prop_values` per instance for the props that differ from the defaults; an image prop value is the
   asset id as `string_value`. Rate limit: see the pitfalls table (`GET /v2/assets` 429).
4. Transform the section root (`transform_element_to_component`, `replace: true`), read the page tree for a stray instance,
   then create the host props (`create_prop`) and bind them (`set_settings` key `text`, plus the inner Button instance
   with `type: "bindable"`, see the pitfalls table).

## CMS-bound grid (Post Grid)

`data_element_builder` → `element_schema: { type: "CMSCollection" }`
inside the block; `set_style` on the DynamoList (the stacked utilities
`fk-grid fk-cols-3 fk-cols-2-tablet fk-cols-1-mobile fk-gap-4`, which `set_style` can only apply
once that chain exists, so create it through WHTML first); `set_settings` on the wrapper:
`source`, `limit`, `sort` (**before** inserting anything into the item); WHTML of the card markup
into the DynamoItem; bind each element to its field (`binding: { source_type: "cms", collection_id,
field_id }`, referenced fields as `<ref-field>:::<field>`).

## Loops and multi-step timelines (IX3)

Payloads accepted by `create_interaction` (runtime verification in the archived plan, `docs/webflow/archive/test-site/mvp2-home.md` → spikes):

- **Infinite loop:** `timing: { duration: 20, ease: 0, repeat: -1 }`. `repeat` lives on each
  action, not on the timeline.
- **Loops and carousels use To tweens plus Sets, not FromTo (2026-09-29).** A tween is `tt: 0` with
  `properties: { "wf:transform": { "width": [null, "360px"] } }`; the resting state is one Set per animated
  element, first in the action list: `{ "id": "s-sl2", "name": "Set slide 2", "targets": [{ "extensionKey": "wf:attribute", "value": "[data-how-slide=\"2\"]" }], "timing": { "duration": 0, "position": 0 }, "tt": 3, "properties": { "wf:transform": { "width": "360px", "height": "464px" } } }`
  (bare values; no `repeat`; nothing else on that element at position 0). To rewrite an existing
  timeline: read it with `get_interaction` (the client saves a large result to a file; slice it with
  `python3`/`jq`), transform the JSON with a throwaway script (FromTo → To by keeping the `to` value, drop the
  host-added `filterContext` except on `within` targets, prepend the Sets) and send the whole `timelines`
  array (`{ id, actions }`) to `update_interaction`; a 34 KB / 103-action payload went through in one call.
- **Multi-step loop (ticker, carousel):** give every action the same cycle length C with
  `repeatDelay = C − duration` and its own `position` inside the cycle, so all actions repeat in
  step. An action may sit at `position = C` (a "return to start" step).
- **Spring-like ease:** `ease: { type: "back", curve: "out", power: 1.2 }` (or `elastic`).
- **Hover pause/resume of a load-played loop:** extra triggers on the same interaction:
  `wf:hover` with `control: "pause"` + `pluginConfig: { multiTimeline: false, eventMode: "enter" }`,
  and `control: "resume"` with `eventMode: "leave"`. No `groupId` needed on a single timeline.
- **Jump to a step:** `wf:click` with `config: { control: "play", jump: 5 }` (seconds).
- **Width/height** are `wf:transform` properties: `width: ["7px", "57px"]` tweens natively.
- **Class toggle scoped to the clicked item (`ix-faq-toggle`, 2026-10-01):** trigger `wf:click` on the question class; one timeline of Sets (`tt: 3`, `timing: { duration: 0, position: 0 }`), `properties: { "wf:class": { "class": { "operation": "toggleClass", "selectors": [<combo leaf id>] } } }`. The action target is the **base** class id (a combo target matches only elements that already carry it, so it could never open a closed one). Descendants of the trigger: `filterContext: { relationship: "within", filterBy: ["wf:trigger-only", ""], firstMatchOnly: false }`. A sibling of the trigger's parent (answer next to the `h3` that wraps the button): `{ relationship: "next-sibling-of", filterBy: ["wf:trigger-only-parent", ""] }`. Accepted and read back identical; runtime scoping is a staging check.
- **Scope an action to one block:** target `wf:class` with
  `filterContext: { relationship: "within", filterBy: ["wf:class", [<block id>]], firstMatchOnly: false }`.
- The host expands a combo leaf id into its chain (`[base, combo]`) on save; pass the leaf.
- **Click and hover triggers on a data attribute** work: `target: { extensionKey: "wf:attribute",
  value: "[data-dot=\"how-1\"]" }` (used by `ix-how-carousel`).
- **A Set that repeats with the loop** (non-animatable `wf:style` values such as `pointerEvents`): `tt: 3`, `timing: { duration: 0, repeat: -1, repeatDelay: <cycle>, position }`, `properties: { "wf:style": { pointerEvents: "auto" } }`, attribute target per slide. Accepted and read back (`ix-testimonials`, 15 of them, 2026-09-29); whether it fires again each cycle is a staging check.
- **Generate big timelines with a throwaway Node script** (how the wave 3 carousels were built):
  one `act(id, name, target, position, duration, cycle, ease, props)` helper that sets
  `repeatDelay = cycle − duration`, output printed as JSON (order among To tweens doesn't matter).

### Spring as a CustomEase

Sample the spring `p(t) = 1 − e^(−ζωt)(C·sin(ω_d t) + cos(ω_d t))` over its duration (the repo's
`src/ix/testimonials.ts` has ω, ζ), split x into ~8 segments (denser at the start), and write one
cubic Bézier per segment from the values and slopes at its ends (Hermite → Bézier:
`P1 = (x0 + h/3, y0 + m0·h/3)`, `P2 = (x1 − h/3, y1 − m1·h/3)`, last slope 0, end at `1,1`).
Values above 1 (the overshoot) are fine. Accepted and stored as:

```json
"ease": { "type": "customEase", "bezierCurve": "M0,0 C0.0167,0 0.0333,0.034 0.05,0.0821 C… 1,1" }
```

Check the fit numerically before sending (max |bezier − spring| × travel in px).

For the legacy testimonial spring (ω 6.5275, ζ 0.78, 1.4s) these segment bounds gave a max error of 0.0003 (0.11px on 340.8px), found by random search over the inner bounds: `[0, 0.0615, 0.13, 0.2094, 0.3106, 0.47, 0.62, 0.8, 1]`; the string it produced is in `ix-testimonials` (`i-1d31deaf`) and is accepted in `timing.ease` of every action (22 copies, ~27 KB payload, no budget problem).

## Upload an asset

1. `md5 -q <file>` → `data_assets_tool` → `create_asset` with `site_id`, `file_name`, `file_hash`.
2. Save the action's `result` object and pipe it in (needs `full_network` for S3):
   `node scripts/webflow-upload.mjs src/assets/icons/menu.svg <<'EOF' … EOF` → `201` means done.
3. Record `id` and `hostedUrl` in `webflow-ids.json` → `assets`, keyed by the repo path.

The same script works for `create_font` results ([Fonts](#fonts)). For several files from one batched `create_asset`
call, use `scripts/webflow-upload-batch.mjs` (see its header; `--check` verifies the rebuilt policy).
Keys: files under `public/` use their served path (`/assets/home/x.webp`); imported icons use the repo
path without a leading slash (`src/assets/icons/menu.svg`). Both are what `webflow-markup.mjs` and
`webflow-css.mjs` look up. Collect a Home-style list with a throwaway script that renders each file
with Vite SSR and lists every `src`/`href` (missing assets throw one at a time in `webflow-markup.mjs`).

## Fonts

Checked 2026-09-29 (production). Files: latin `.woff2` from `node_modules/@fontsource/<family>/files/`
(`sn-pro-latin-400-normal.woff2`, `stix-two-text-latin-400-normal.woff2`); weights = what migrated CSS uses.

1. `data_fonts_tool` → `list_fonts` (`site_id`), then one `create_font` per file, all in one call:
   `{ "site_id", "file_name", "file_hash": "<md5 -q file>", "font_family": "SN Pro", "weight": 600, "italic": false, "font_display": "swap" }`.
   Copy the hash from the `md5` output, don't retype it (a 31-char hash fails validation).
2. Each result has `customFont.id` and `upload: { url, fields }` (not `uploadUrl`/`uploadDetails` like
   `create_asset`). Save each result as JSON and run `node scripts/webflow-upload.mjs <file> < result.json`
   within 15 minutes (the script reads both shapes; the shell needs network access to S3). `201` = done.
3. `list_fonts` again: every font is listed with its `hostedUrl`. Record `customFont.id` in `webflow-ids.json` → `fonts`
   (`"SN Pro 600": "<id>"`).

## Variables from tokens.css

Checked 2026-09-29 (production, 65 tokens). `create_variable_collection` `{ "name": "Flint" }` returns the
collection id (`collection-…`, mode `base`). Then, in `data_variable_tool` (top-level `siteId` + `pageId`),
one create per token with `variable_collection_id`, `variable_name` (`--color-ink` → `color-ink`) and:

| Token | Action | `value` |
| --- | --- | --- |
| `color-*` (hex or `rgba(…)` string as in the CSS) | `create_color_variable` | `{ "static_value": "rgba(255, 255, 255, 0.8)" }` |
| `font-*` (family name only) | `create_font_family_variable` | `{ "static_value": "SN Pro" }` |
| `radius-*`, `space-*`, `width-*` | `create_size_variable` | `{ "static_value": { "value": 12, "unit": "px" } }` |
| `--a: var(--b)` alias | same action | `{ "existing_variable_id": "<b's id>" }` |

Generate the `actions` array from `src/styles/tokens.css` with a throwaway Node script (regex over
`--name: value;`), probe one token per type first, then send the rest in batches of about 30 (a 61-action
call worked). Read back with `get_variables` (`variable_collection_id`; returns every variable with `id`,
`type`, `value`) and diff against the CSS by script; record the ids in `webflow-ids.json` → `variables`
and check them with `get_variables` + `filter_variables_by_ids` (all ids must come back).

## SVG icons and optional icons

Icons are images of files in `src/assets/icons/`, never styled spans (rule 10).

- Place: WHTML `<img class="fk-icon" src="<hostedUrl>" alt="" width="24" height="24">` inside the
  control. WHTML doesn't link the asset, so then:
  `set_settings` → `[{ "key": "assetId", "static_text": { "value": "<asset-id>" } }, { "key": "altText", "static_text": { "value": "" } }]`.
  Image alt defaults to `inherit`; `""` makes it decorative (the control carries `aria-label`).
- Optional icon in a component: create props `{ "type": "boolean", "name": "Show Icon", "default_boolean": { "value": false } }`
  and `{ "type": "image", "name": "Icon", "default_text": { "value": "<asset-id>" } }`, then bind
  the image: `assetId` → Icon prop, `visibility` → Show Icon prop (both `binding: { source_type: "prop" }`).

## Component from markup

The element you transform becomes the component root. Blank components get a `div` root, so
don't use them.

1. `data_whtml_builder` on a draft page (append to `main`), no `css` if the classes exist.
2. `data_component_tool`:

```json
{ "label": "t", "transform_element_to_component": {
  "id": { "component": "<page-id>", "element": "<new-element-id>" },
  "name": "Button", "group": "UI", "description": "UI / Button … Repo: src/components/ui/Button.tsx",
  "replace": true } }
```

**Components that contain other components or native buttons (Nav, Footer), checked 2026-09-29:** build
everything at page level first, then transform once. Insert the WHTML with empty containers where the
instances and native buttons go, add the DOM `button` elements with `data_element_builder`
(`children` nests the icon image), put the UI instances in the containers with
`insert_component_instance` (no `scope_component_id` needed at page level) and pick their variants
with the `Variant` prop, then transform the root. The instances and buttons come along, and no
in-definition insert is needed. For a component whose root is a link (Button), the WHTML `<a>` becomes
the root, with its label as a prepended DOM `span` and the icon `img` after it.

3. The page now holds an instance of the new component. Remove it once the real instances are
   placed (needs confirmation, see [Remove elements](#remove-elements)).

## Props and bindings

```json
{ "label": "p", "create_prop": { "component_id": "<id>", "props": [
  { "type": "textContent", "name": "Label", "default_text": { "value": "Apply now" } },
  { "type": "link", "name": "Link", "default_link": { "mode": "url", "to": "#apply" } } ] } }
```

Bind with `data_element_settings_tool` → `set_settings`; `scope_component_id` is required for
elements inside a definition. Text key is `text`, link key is `link`:

```json
{ "label": "b", "set_settings": { "operations": [
  { "label": "label", "element_id": { "component": "<id>", "element": "<span-id>" },
    "scope_component_id": "<id>",
    "settings": [{ "key": "text", "binding": { "source_type": "prop", "prop_id": "<label-prop>" } }] } ] } }
```

An image's `altText` can bind to a `textContent` prop (Testimonial Card: alt ← Name), and a
Blockquote's `text` binds like a paragraph. On an instance, an image prop value is the asset id as
`{ "prop_id": "<image-prop>", "type": "string", "string_value": "<asset-id>" }`.

`get_bindable_sources` lists what an element accepts. The text target must be a DOM element or
a text element, not a WHTML `<span>` (see [Native elements](#native-elements-button-span)).

## Variants

`data_component_variants_tool`. The base variant id is `base` (rename it with `set_variant_name`).

```json
{ "label": "v", "create_variant": { "component_id": "<id>", "name": "Secondary" } }
{ "label": "s", "set_variant_styles": { "variant_id": "<variant>", "style_name": "fk-button",
  "breakpoint_id": "main", "pseudo": "hover",
  "properties": [{ "property_name": "background-color", "variable_as_value": "<variable-id>" }] } }
```

- Copy the combo's values: read them first with `data_style_tool` → `query_styles`
  (`name_path: ["fk-button", "is-secondary"]`, `include_properties`, `include_base_pseudos`).
- Style child elements through their own class (`style_name: "fk-button-icon"`, `display: none`).
- `duplicate_variant` copies all variant styles; then override only the difference.
- Pick an instance's variant through the auto-created `Variant` prop:
  `set_component_instance_prop_values` with `{ "prop_id": "<variant-prop>", "type": "string", "string_value": "<variant-id>" }`.

## Instances inside a component

```json
{ "label": "i", "insert_component_instance": {
  "parent_element_id": { "component": "<host-component-id>", "element": "<sibling-or-parent>" },
  "component_id": "<component-to-insert>", "creation_position": "after",
  "scope_component_id": "<host-component-id>" } }
```

Insert **next to** the element being replaced, so removing the old one later keeps the order.

## Native elements (button, span)

`data_element_builder` with DOM elements; children nest in one call:

```json
{ "build_label": "toggle", "creation_position": "after",
  "parent_element_id": { "component": "<nav-id>", "element": "<sibling>" },
  "scope_component_id": "<nav-id>",
  "element_schema": { "type": "DOM", "set_dom_config": { "dom_tag": "button" },
    "set_style": { "style_names": ["fk-nav-toggle"] },
    "set_attributes": { "attributes": [
      { "name": "type", "value": "button" }, { "name": "aria-label", "value": "Open menu" } ] } } }
```

Then put the icon inside it ([SVG icons](#svg-icons-and-optional-icons)). `children` nests more
elements in the same call, and combo classes work in `style_names` (`["fk-a", "is-b"]`). A text span is
`{ "type": "BY_CUSTOM_TAG", "custom_tag": "span", "set_text": { "text": "…" } }`. Native buttons need
a border reset in the class (`border-*-width: 0px`, `border-*-style: none`).

## Text around a bound span

For static text on both sides of a bound value (Testimonial Card: `“` + Quote + `”`). Checked 2026-09-29.

1. Unbind the element and set its first text: `set_settings` `{ "key": "text", "static_text": { "value": "“" } }`
   (the element then holds one `String` child).
2. Add the value holder: `data_element_builder` `append`, `{ "type": "DOM", "set_dom_config": { "dom_tag": "span" } }`,
   with `scope_component_id`; bind it (`set_settings` key `text`, `binding` prop) like a paragraph. Update the prop's default
   with `data_component_props_tool` → `update_prop` (`default_text`).
3. The trailing text node can't be created on its own (WHTML with a bare `”` → "No elements found"; a WHTML `<span>` there
   is a rich-text Span, which can't bind). Insert a **scratch** element with WHTML inside the same component,
   `<blockquote>“<span>x</span>”</blockquote>` (it stores `String`, `Span`, `String`), then
   `move_element` its last `String` `after` the DOM span (`scope_component_id` goes **inside** `move_element`, not beside it),
   and remove the scratch element. Text nodes move; the element ends as `String`, DOM span, `String`.
4. Read it back with `query_elements` `children_depth: -1`, and check an instance's resolved Quote and a snapshot.

## Delete a component

`data_component_tool` → `unregister_component` `{ "component_id": "<id>" }`, only after the user confirmed. It "affects all
existing instances", so read `get_component` with `options.includeInstanceCount` first and remove the instances (or stop) before it.
It works headlessly: `get_all_components` no longer lists it (checked 2026-09-29, Section Header and Service Card). Remove its
entry from `webflow-ids.json`.

## Stack utility classes

Tested in spike S7 (2026-09-27, `docs/webflow/css-system.md` → S7 result). Stacking several
**standalone (global)** utility classes on one element works: the element's `class` attribute
carries every name, and each class keeps applying its own properties. Only stack classes that are
each meant to contribute one independent rule (utilities); don't stack two block classes that both
own the element's full identity (`classes.md` → stacking gotcha still applies to those).

1. Create each utility once as its own standalone style (`data_style_tool` → `create_style`, no
   `parent_style_names`). A property that rejects a linked variable (seen: `gap` +
   `variable_as_value`) takes a literal value instead.
2. **First use of a new combination:** insert with the WHTML builder, classes already stacked in
   the markup, no `css`:
   ```json
   { "build_label": "x", "parent_element_id": {...}, "creation_position": "append",
     "html": "<div class=\"fk-flex fk-flex-col fk-gap-2\">…</div>" }
   ```
   Webflow auto-creates an empty combo style per new chain depth (e.g.
   `.fk-flex.fk-flex-col`, `.fk-flex.fk-flex-col.fk-gap-2`) — expected, harmless, no properties.
   Never edit these in the Designer; edit the standalone class.
3. **Reusing an existing combination** on another element: `data_element_tool` → `set_style` with
   `style_names` in the same order works, because it resolves the chain Webflow already created by
   name. It does **not** create a new chain — a combination that has never been built via WHTML (or
   explicit `create_style` at every depth) fails: `"One or more styles not found: …"`. When in
   doubt, insert the first instance of any new combination through WHTML.
4. A registered `is-*` combo still wins by specificity when stacked with plain utilities
   (`.fk-button.is-secondary` = 2 classes beats a 1-class utility), regardless of source order —
   confirmed structurally (stored selectors), not yet visually on a publish.
5. Verify with `data_style_tool` → `query_styles` (`name_path: ["<prefix>"]`, `include_properties`):
   real classes carry their properties; auto-created combos show `properties: {"base": {}}`.

## Remove elements

Confirmation first. Inside a component definition, pass `scope_component_id`:

```json
{ "label": "r", "remove_element": { "id": { "component": "<nav-id>", "element": "<el>" },
  "scope_component_id": "<nav-id>" } }
```

## Replace a CMS field

Slugs can't be changed (`update_collection_field` only takes `displayName`, `isRequired`, `helpText`).

1. `create_collection_static_field` with `isRequired: false` (slug comes from the display name).
2. `update_collection_items`: copy each item's value into the new slug.
3. `update_collection_field` → `isRequired: true` if the old one was required.
4. Repoint every sort, filter and binding (see below), and rename the key in `src/content/*.json`.
5. With confirmation: `delete_collection_field`.

Never name a field "Published on": `published-on` is reserved and becomes `published-on-2`.

## Collection List settings

`data_element_settings_tool` → `set_settings` on the Collection List element; values are JSON strings:

```json
{ "key": "source", "static_json": { "value": "{\"collectionId\":\"<collection>\"}" } }
{ "key": "sort", "static_json": { "value": "[{\"fieldSlug\":\"publish-date\",\"direction\":\"descending\"}]" } }
{ "key": "limit", "static_number": { "value": 3 } }
```

Read them back with `get_settings` → `type: "query_settings"`, `queries: [{ "label": "sort", "key": "sort" }]`.

## Verify

- Structure: `data_element_tool` → `get_all_elements` with `scope_component_id`, or
  `query_elements` with `element_id` + `children_depth`.
- Styles: `query_styles` with `include_properties`; variant styles: `get_variant_styles`.
- Visual: `element_snapshot_tool` only works with the Designer and Bridge app open on that page.
