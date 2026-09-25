---
name: flint-webflow-sync
description: Pushes Flint repo changes to the Flint Webflow site and pulls Designer edits back through the Webflow MCP, using tested payload recipes and a list of known pitfalls. Use before calling any plugin-webflow-webflow tool, when syncing tokens, classes, components, CMS or pages to Webflow, and whenever a Webflow MCP call fails or behaves unexpectedly.
---

# Flint ⇄ Webflow sync

The contract is `AGENTS.md`; the order of operations and the capability table are in
`docs/webflow/mcp-playbook.md`. This skill holds the **how**: payloads that are known to work
([recipes.md](recipes.md)) and the pitfalls that already cost a detour.

## Before the first call

1. Read `mcp-playbook.md` (order, call conventions) and `docs/webflow/webflow-ids.json` (every
   id created so far). Never guess an id; never re-create a name that is listed there.
2. Send `session_id: "start"` once, then reuse the returned `ses_…` on every call.
3. Query by name before any create. Destructive actions and publishing need the user's explicit
   confirmation (rule 12). Batch all pending deletions into one `AskQuestion`.
4. Interactions: also read `.agents/skills/webflow-mcp-interactions/SKILL.md` (vendored, don't edit).

## Pitfalls: symptom → what to do

| Symptom | Do this |
| --- | --- |
| `create_blank_component` result has a `div` root around your markup | Don't use blank components. Build on the draft page and transform it ([recipes → Component](recipes.md#component-from-markup)) |
| `transform_element_to_component` → "Element … not found" | It can't reach elements inside a component definition. Build at page level |
| `<button>` in WHTML comes back as `type: "Link"` | Create a DOM element with `dom_tag: "button"` ([recipes → Native elements](recipes.md#native-elements-button-span)) |
| Binding a prop to a WHTML `<span>` → "Setting text is not applicable" | Use a DOM `span` (or a Text Block); rich-text Spans can't bind |
| Need a variant to add a combo class | Not possible; variants are style overrides. Copy the combo's values into `set_variant_styles` |
| Field got slug `…-2`, or needs a new slug | Slugs are immutable. Create → copy values → repoint sorts/bindings → delete ([recipes → CMS field](recipes.md#replace-a-cms-field)) |
| Creating something that exists returns `-2` or is silently dropped | Creates aren't idempotent. Query first; use update actions |
| WHTML `<img>` → "inserted without a managed asset", even for an uploaded asset | Set the asset after insert: `set_settings` → `assetId` ([recipes → Icons](recipes.md#svg-icons-and-optional-icons)) |
| `remove_style` → "Ensure there are no usages of this style" | Remove the elements first, in an earlier call (not in parallel). Removing a base style also removes its combos |
| A class still carries a raw shorthand (`border-top: 1px solid var(--_flint---…)`) or an element keeps a `class` attribute next to its styles | Both came from MVP WHTML inserts. `remove_properties: ["border-top", …]` on the class; `remove_attribute` `["class"]` on the element |
| A declaration deleted from the repo CSS is still on the Webflow class | `webflow-style-actions.mjs` only sets. Send `update_style` with `remove_properties` ([recipes → Push classes](recipes.md#push-classes)) |
| An effect Webflow can't do natively (gradient angle, custom property animation) | Don't approximate (rule 14). Ask the user; register an exception in `src/styles/exceptions/` |
| Uploading an asset or font file | `create_asset` / `create_font`, then pipe the result into `scripts/webflow-upload.mjs` ([recipes → Upload](recipes.md#upload-an-asset)) |
| A class you pushed is back to older values (seen: `fk-button` gradient and `transition`), with a newer page `lastUpdated` | A Designer tab opened before the push saved its stale copy. Re-read styles at the start of each task, re-push from the repo, and ask the user to reload the Designer after every push |
| `query_elements` `component_filter` finds no instances that do exist | It only searches the page tree. Instances inside Nav/Footer need `scope_component_id` |
| `element_snapshot_tool` → `{"status":false}` | Snapshots need the Designer with the MCP Bridge app open. Verify with element queries instead and ask the user to review visually |
| Validation error about a missing `siteId` / `site_id` / `pageId` | Placement differs per tool; see playbook → Call conventions |
| Media query rejected, tag selectors dropped | Write queries exactly as in `AGENTS.md` §5; typography lives on classes, not tag selectors |
| `0 -1px` minified to `0-1px`, or a shadow/gradient replaced by one color variable | Write `0px -1px`; push with `scripts/webflow-style-actions.mjs`, which resolves compound `var()` values to literals |

## Record what you learn (mandatory)

Whenever something surprised you (an error, a workaround, a payload shape you had to discover,
a detour that a future agent would repeat), write it down **in the same change, before your
summary**. Put each learning in exactly one place:

| Kind of learning | Where |
| --- | --- |
| A working payload or multi-step procedure | [recipes.md](recipes.md), as a new or corrected recipe |
| A failure symptom and its fix | The pitfalls table above (link to the recipe) |
| What the MCP can or can't do | `mcp-playbook.md` → capability table |
| A rule that changes how the repo is written | `AGENTS.md` (bump the contract version) and the affected registry |
| A registry fact (class, token, component, field, interaction behavior) | The registry in `docs/webflow/` |
| An id created in Webflow | `webflow-ids.json` |

Write the fix, not the story: symptom, cause if known, and the exact working call. Only record
what you actually ran and saw work. If an existing entry turned out wrong, correct it in place
instead of adding a second one.
