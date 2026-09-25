# Recipes

Tested payloads for `plugin-webflow-webflow`. Ids in `<angle brackets>` come from
`docs/webflow/webflow-ids.json` or from the previous call's result. Every call also carries
`session_id`, `agent_id` and `context` (see the playbook).

## Contents

- [Push classes](#push-classes)
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

## Push classes

- **New classes:** `node scripts/webflow-css.mjs <css files>` → pass the output as `css` to
  `data_whtml_builder` together with the markup that uses them.
- **Existing classes, states, fixes:** `node scripts/webflow-style-actions.mjs <css file> --only fk-a,fk-b`
  → send the printed array as `actions` of `data_style_tool`. `update_style` is idempotent.
- WHTML without `css` reuses classes that already exist, by name.
- **Removed declarations:** the script can't know what Webflow still has. Read the class
  (`query_styles`, `include_properties`, all pseudos you touched) and send
  `{ "update_style": { "style_name": "fk-x", "breakpoint_id": "main", "remove_properties": ["background-size"] } }`
  (add `pseudo` / `parent_style_names` as needed). Variant styles take `remove_properties` too.
- Exception CSS (`src/styles/exceptions/`) is never passed to either script.

## Upload an asset

1. `md5 -q <file>` → `data_assets_tool` → `create_asset` with `site_id`, `file_name`, `file_hash`.
2. Save the action's `result` object and pipe it in (needs `full_network` for S3):
   `node scripts/webflow-upload.mjs src/assets/icons/menu.svg <<'EOF' … EOF` → `201` means done.
3. Record `id` and `hostedUrl` in `webflow-ids.json` → `assets`, keyed by the repo path.

The same script works for `create_font` results.

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
