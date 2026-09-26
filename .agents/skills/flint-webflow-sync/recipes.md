# Recipes

Tested payloads for the Webflow MCP. Ids in `<angle brackets>` come from
`docs/webflow/webflow-ids.json` or from the previous call's result. Every call also carries
`session_id`, `agent_id` and `context` (see the playbook).

## Contents

- [Diff the repo against Webflow](#diff-the-repo-against-webflow)
- [Push classes](#push-classes)
- [Build a page from the repo markup](#build-a-page-from-the-repo-markup)
- [Upload an asset](#upload-an-asset)
- [SVG icons and optional icons](#svg-icons-and-optional-icons)
- [Component from markup](#component-from-markup)
- [Props and bindings](#props-and-bindings)
- [Variants](#variants)
- [Instances inside a component](#instances-inside-a-component)
- [Native elements (button, span)](#native-elements-button-span)
- [Remove elements](#remove-elements)
- [Replace a CMS field](#replace-a-cms-field)
- [Collection List settings](#collection-list-settings)
- [Verify](#verify)

## Diff the repo against Webflow

1. `data_style_tool` → `get_styles` with `query: "all"`, `include_properties: true`,
   `include_breakpoints: ["main","medium","small","tiny"]`,
   `include_base_pseudos: ["noPseudo","hover","active","focus","focus-visible","placeholder"]`.
   The client writes the large result to a file and prints its path.
2. `node scripts/webflow-diff.mjs <that file> src/styles/layout.css src/styles/typography.css src/styles/components/*.css --unregistered`
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
  chain when a file also holds existing classes). The builder's quirks (same-name combos dropped)
  don't apply, and a later WHTML insert without `css` reuses the classes by name.
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

Tested on `/mvp-home` (2026-09-25): in the extraction script, also remove preview-runtime state
(`is-revealed`, `is-inverse`, inline `style`), empty the Button slots, keep one copy of a repeated
UI component (transform it, then `data_component_builder` → `insert_in_element` by component name
into the empty slots and set props), and drop the repo's list markup where a Collection List goes.
Link every image afterwards with `set_settings` → `assetId` + `altText`. Then transform each section
root (`replace: true`) into its `Section /` component and bind its texts to props.

**CMS-bound grid (Post Grid):** `data_element_builder` → `element_schema: { type: "CMSCollection" }`
inside the block; `set_style` on the DynamoList (`fk-grid is-3`); `set_settings` on the wrapper:
`source`, `limit`, `sort` (**before** inserting anything into the item); WHTML of the card markup
into the DynamoItem; bind each element to its field (`binding: { source_type: "cms", collection_id,
field_id }`, referenced fields as `<ref-field>:::<field>`).

## Loops and multi-step timelines (IX3)

Payloads accepted by `create_interaction` (runtime verification in `mvp2-home.md` → spikes):

- **Infinite loop:** `timing: { duration: 20, ease: 0, repeat: -1 }`. `repeat` lives on each
  action, not on the timeline.
- **Multi-step loop (ticker, carousel):** give every action the same cycle length C with
  `repeatDelay = C − duration` and its own `position` inside the cycle, so all actions repeat in
  step. An action may sit at `position = C` (a "return to start" step).
- **Spring-like ease:** `ease: { type: "back", curve: "out", power: 1.2 }` (or `elastic`).
- **Hover pause/resume of a load-played loop:** extra triggers on the same interaction:
  `wf:hover` with `control: "pause"` + `pluginConfig: { multiTimeline: false, eventMode: "enter" }`,
  and `control: "resume"` with `eventMode: "leave"`. No `groupId` needed on a single timeline.
- **Jump to a step:** `wf:click` with `config: { control: "play", jump: 5 }` (seconds).
- **Width/height** are `wf:transform` properties: `width: ["7px", "57px"]` tweens natively.
- **Scope an action to one block:** target `wf:class` with
  `filterContext: { relationship: "within", filterBy: ["wf:class", [<block id>]], firstMatchOnly: false }`.
- The host expands a combo leaf id into its chain (`[base, combo]`) on save; pass the leaf.
- **Click and hover triggers on a data attribute** work: `target: { extensionKey: "wf:attribute",
  value: "[data-dot=\"how-1\"]" }` (created 2026-09-25, `ix-how-carousel`).
- **Generate big timelines with a throwaway Node script** (how the wave 3 carousels were built):
  one `act(id, name, target, position, duration, cycle, ease, props)` helper that sets
  `repeatDelay = cycle − duration`, steps emitted from last to first, output printed as JSON.

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

## Upload an asset

1. `md5 -q <file>` → `data_assets_tool` → `create_asset` with `site_id`, `file_name`, `file_hash`.
2. Save the action's `result` object and pipe it in (needs `full_network` for S3):
   `node scripts/webflow-upload.mjs src/assets/icons/menu.svg <<'EOF' … EOF` → `201` means done.
3. Record `id` and `hostedUrl` in `webflow-ids.json` → `assets`, keyed by the repo path.

The same script works for `create_font` results. For several files from one batched `create_asset`
call, use `scripts/webflow-upload-batch.mjs` (see its header; `--check` verifies the rebuilt policy).

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

1. `data_whtml_builder` on the draft `/mvp` page (append to `main`), no `css` if the classes exist.
2. `data_component_tool`:

```json
{ "label": "t", "transform_element_to_component": {
  "id": { "component": "<page-id>", "element": "<new-element-id>" },
  "name": "Button", "group": "UI", "description": "UI / Button … Repo: src/components/ui/Button.tsx",
  "replace": true } }
```

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
