# Webflow MCP playbook

How agents push repo changes to Webflow. The MCP server is Webflow's official MCP: `plugin-webflow-webflow`
in Cursor (Webflow plugin), the Webflow connector in Claude Code. Both expose the same tools.
Every rule in `AGENTS.md` still applies, especially rules 11, 12 and 13.

## Prerequisites

1. **Authenticated.** If calls fail with an auth error, re-authenticate the server (Cursor: its `mcp_auth`; Claude Code:
   reconnect the Webflow connector). If
   `data_sites_tool` → `list_sites` returns no sites, the wrong Webflow account is connected. Stop and ask the user.
2. **Site ID known.** Read it from `AGENTS.md` §9. Never guess it or pick one from a list without asking the user. If `list_sites` doesn't return this ID, stop and ask.
3. **Designer tools** (`designer_tool`, selection, canvas) need the Webflow Designer open with the
   MCP Bridge app running. **Data tools** (`data_*`) are headless and preferred.
4. Call `webflow_guide_tool` once at the start of each session, then
   `data_agent_instructions_tool` → `search_instructions` for site-specific rules.
5. Load the project skill [`flint-webflow-sync`](../../.agents/skills/flint-webflow-sync/SKILL.md)
   for tested payloads and known pitfalls. After the task, record anything new there or in this
   playbook (`AGENTS.md` rule 13).
6. Before any interaction work, read the project skill
   `.agents/skills/webflow-mcp-interactions/SKILL.md` (installed with `npx skills add`, pinned in
   `skills-lock.json`) and its `references/`. The other Webflow skills come from the Cursor plugin in Cursor.
   In Claude Code, `safe-publish`, `site-audit` and `accessibility-audit` are installed in
   `.claude/skills/` (`npx skills add webflow/webflow-skills -s <skill> -a claude-code`, pinned in
   `skills-lock.json`), and the two project skills are symlinked there from `.agents/skills/`.
   Claude Code lists them as `webflow-mcp:safe-publish` etc.; the contract's `/safe-publish` means that skill.

## Call conventions

- `session_id`: send `start` on the first call. Reuse the returned `ses_…` value on every later
  call in the same task, and pass it to subagents.
- `agent_id`: `<model>|<harness>|<5-char suffix>` (harness `cursor` or `claude-code`), chosen once
  per task and never changed.
- `context`: 15–25 words, third person, describing why the call is made. No personal data.
- Batch related actions in one call through the tool's `actions[]` array.
- **Where the site ID goes differs by tool** (checked 2026-09-23):
  - `data_sites_tool`: `site_id` inside the action (`get_site: { site_id }`).
  - `data_cms_tool`: `siteId` inside each action (`get_collection_list: { siteId }`).
  - `data_pages_tool`: `site_id` inside the action for `list_pages` (checked 2026-09-24).
  - `data_variable_tool`, `data_style_tool`, `data_component_tool`, `data_interactions_tool`,
    `data_element_builder`, `data_element_tool`, `data_component_builder`: top-level `siteId` **and**
    `pageId`. For site-wide work (variables, styles, components), use the Home page ID from `AGENTS.md` §9.
  - When unsure, read the tool schema first. Validation errors name the missing key.

## Order of operations

Always sync in this order, because later steps depend on earlier ones:

| Step | Registry | Tools (actions) |
| --- | --- | --- |
| 0. Site instruction (first sync only) | `AGENTS.md` | `data_agent_instructions_tool`: `search_instructions`, then `create_instruction` with a short summary of the rules (1–15 in contract 1.7) that says AGENTS.md wins, so agents working inside Webflow follow the same contract |
| 1. Fonts | `tokens.md` → Fonts | `data_fonts_tool`: `list_fonts`, `create_font` (MD5 of the file), then POST the bytes to the returned S3 URL within 15 minutes |
| 2. Variables | `tokens.md` | `data_variable_tool`: `get_variable_collections`, `query_variables`, then `create_variable_collection` (`Flint`), `create_color_variable`, `create_size_variable`, `create_font_family_variable`, `update_*` |
| 3. Assets | images, SVGs (`src/assets/icons/`), Lotties | `data_assets_tool`: `list_assets`, `create_asset` → pipe the result into `node scripts/webflow-upload.mjs <file>` (S3 POST) → record id + hosted URL in `webflow-ids.json`. Folders can't be deleted, so don't create them without approval |
| 4. Components (with their classes) | `components.md` (UI → Global → Section) | `data_component_tool` `create_blank_component` (group `Global`/`UI`/`Section`), then `data_whtml_builder` with `scope_component_id`: repo markup as `html` + `node scripts/webflow-css.mjs <files>` as `css` (creates the classes, links variables). Then `data_component_props_tool` `create_prop` + `data_element_settings_tool` prop bindings, `data_component_variants_tool` `create_variant` + `set_variant_styles` |
| 5. Class states and fixes | `classes.md` | `node scripts/webflow-style-actions.mjs <files> [--only fk-x]` → `data_style_tool` `update_style` actions: states the builder can't create (`focus-visible`…), changes to existing classes, re-linking variables (`--vars-only`). `create_style` with `parent_style_names` for a combo name already used on another base |
| 6. Pages | `components.md` → Pages | `data_pages_tool` `create_page`, then `data_component_builder` `insert_in_element` for component instances. Page-level markup (e.g. Collection Lists) with `data_whtml_builder` / `data_element_builder`. A Collection List needs its collection (step 7) first. Then the page settings from `seo.md`: `update_page_settings` with `seo`, `openGraph` and, for FAQ pages, `jsonLdSchema`; heading levels with `set_heading_level`; noindex (Sitemap indexing) is Designer-only |
| 7. CMS | `cms.md` | `data_cms_tool` (`get_collection_list`, `create_collection`, `create_collection_static_field`, `create_collection_reference_field`, `create_collection_items`, `update_collection_items`) or `/cms-collection-setup`, `/bulk-cms-update` |
| 8. Interactions | `interactions.md` | `data_interactions_tool`: `guide`, `list_interactions`, `create_interaction`, `update_interaction` |
| 9. Custom code | `interactions.md` → exceptions only | `data_scripts_tool`: raw CSS or JSON-LD goes in the freeform head/footer blocks (`set_site_freeform_code`, `set_page_freeform_code`; CSS exceptions come from `docs/webflow/custom-code/site-head.html`), scripts through `register_inline_script` (max 2,000 characters) + `add_site_script` / `add_page_script`. Read before write (`get_site_freeform_code`), because the write replaces the whole block. SEO exceptions: `x-schema-site`, `x-schema-post`, `x-deferred-tracking` (`seo.md`) |
| 10. Verify | — | `node scripts/webflow-diff.mjs` on a fresh `get_styles` dump (skill recipe "Diff"), `element_snapshot_tool`, `data_element_tool` → `query_elements`, `/site-audit`, `/accessibility-audit`, and the `seo.md` checks on staging (one H1, page settings, schema in the Rich Results Test, image sizes and lazy loading, `curl -I` for the 404) |
| 11. Publish | — | Only on user request, via `/safe-publish` |

## What the MCP can and can't do (found in the test stage, 2026-09-23 to 2026-09-27)

| Works headlessly | Doesn't (or needs care) |
| --- | --- |
| Variables (color, size, font family), linked into styles by id | Tag styles can't be created; once seeded in the Designer, `update_style` with the bare tag as `style_name` (`body`, `h1`–`h4`, `p`, `a`, `blockquote`, `img`) works at every breakpoint (checked 2026-09-29, [recipe](../../.agents/skills/flint-webflow-sync/recipes.md#tag-styles)); `figure` has none until seeded |
| Classes, combos, breakpoint and state styles | Styling Body → `fk-page` wrapper div |
| WHTML insert of repo markup + CSS (classes created, `var(--token)` linked by name) | Builder: only `:hover/:focus/:active`, exact `screen and (max-width: …)` queries, class selectors only, same-name combos in one call dropped, `0 -1px` minified wrong |
| Components from elements, props + prop bindings, variants + variant styles | Components containing a CMS-bound Collection List |
| Components from page markup (`transform_element_to_component`, the element becomes the root) | `create_blank_component` adds a wrapper `div` root, and `transform` can't reach elements inside a component definition. Build the markup on a draft page, transform it, then remove the page instance |
| Component instances inside other components (`insert_component_instance` + `scope_component_id`); variant chosen with the `Variant` prop (`type: "string"`, value = variant id) | Variants are style overrides only: they can't add a combo class |
| Component instances placed in a page or a component, variant chosen with the `Variant` prop (checked 2026-09-29, 6 components on production) | An instance takes no classes (`set_style` → "This element doesn't support styles"): a combo the repo puts on an instance (`is-full`) becomes an extra variant. `transform_element_to_component` can leave a second instance at Body level (seen with Nav): read the tree afterwards |
| Native `<button>`, `<span>` etc. as DOM elements (`data_element_builder`, `type: "DOM"`, `set_dom_config.dom_tag`) | The WHTML builder turns `<button>` into a Link, and its `<span>` can't bind a prop. Use DOM elements for both |
| CMS collections, fields, references, items | Reserved field slugs get `-2` (`published-on`). Slugs can't be renamed: create the new field, copy values, repoint sorts/bindings, then delete the old one |
| Collection List source/sort/limit, CMS field bindings (incl. referenced fields) | Draft items aren't shown on the canvas |
| Site instructions (`data_agent_instructions_tool`: search, create, update, read) ([recipe](../../.agents/skills/flint-webflow-sync/recipes.md#site-instruction)) | `get_site` doesn't return the Webflow plan: confirm it with the client or in the Designer |
| Assets and fonts (with an S3 upload step, `scripts/webflow-upload.mjs`; `create_font` returns `upload.{url,fields}`, `create_asset` returns `uploadUrl`/`uploadDetails`, the script reads both) | Images inserted by URL aren't linked to the asset → `set_settings` `assetId` (or `set_image_asset`) |
| Removing properties from a class or variant (`remove_properties`) | `remove_style` fails while any element still uses the style; removing a base removes its combos |
| Classes with no markup: `create_style` (with `parent_style_names` for combos, empty `properties` accepted) then `update_style` per breakpoint and state (`hover`, `active`, `focus-visible`, `focus-within`, `placeholder`) (checked 2026-09-29, 441 chains) | Webflow's own `w--current` / `w--open` states (`create_style` makes a combo *named* that, `.a._w--current`). Style writes are rate-limited (~170 actions in a few minutes → `Too Many Requests`; failed actions create nothing): batches of at most 45 |
| Standard CSS properties | Vendor-prefixed ones (`-webkit-line-clamp`, `-webkit-box-orient`, `-webkit-font-smoothing`) are rejected, also unprefixed → exception `x-text-rendering` |
| CSS transitions of colors, shadows, transforms, opacity | No transition of a gradient angle or custom property, and IX3 can't animate them either → exception (`x-button-gradient`) |
| IX3 interactions by class, attribute, body; class toggles; reduced-motion and breakpoint conditions; `customEase` path eases; click `jump`, hover `pause`/`resume` on one timeline | Multi-group click interactions only accept `play`; no `filter` (blur); a scroll trigger must be the interaction's only trigger (no in-view pause for a carousel that also has hover or clicks) |
| Snapshots and page switching with the Bridge app (production Bridge confirmed 2026-09-29: `designer_tool` reads and `element_snapshot_tool` answer) | Newly uploaded fonts/CMS data may need a Designer reload to show |
| Stacking several standalone classes on one element (spike S7, 2026-09-27): each keeps its own properties, element `class` carries every name | Webflow auto-creates an empty combo style per new chain depth (harmless: no properties, and not emitted in the published CSS, checked in the test stage). `set_style` only reuses an existing chain by name; it can't create a new one (use the WHTML builder for the first use of a combination). See `css-system.md` → S7 result and the skill's [Stack utility classes](../../.agents/skills/flint-webflow-sync/recipes.md#stack-utility-classes) recipe |
| Site and page custom code: raw `<style>` / `<script>` / JSON-LD blocks in the head or footer (`data_scripts_tool` → `set_site_freeform_code`, `set_page_freeform_code`, checked 2026-09-29 on production: the write returns and `get_site_freeform_code` reads back the same content) | The write **replaces** the whole block (read it first and send the merged content). Registered inline scripts are limited to 2,000 characters (`register_inline_script`), and `get_site_scripts` returns 404 "Custom code block not found" until the first script is applied (harmless). Nothing is live until the site is published |
| `overscroll-behavior` (checked 2026-09-29) | None: the style API accepts it, so it is a class property, not an exception |
| Deleting a component (`data_component_tool` → `unregister_component`, after confirmation and with no instances left; checked 2026-09-29) | Instances are affected by it, so check `instanceCount` first. Mixed static text and a bound value inside one element needs the recipe [Text around a bound span](../../.agents/skills/flint-webflow-sync/recipes.md#text-around-a-bound-span) |
| Prop bindings between components: an inner `UI / Button` instance's Label and Link bound to the host component's props (`set_component_instance_prop_values`, `type: "bindable"`, checked 2026-09-29 on Section / Role Grid); 21 component instances placed and given image props (Testimonials) | Setting image props on many instances in one call hits `GET /v2/assets` 429 (about 13 per call); failed items change nothing, resend after ~45 s. `element_snapshot_tool` answers one call at a time (parallel snapshots fail with `{"status":false}`) |
| Deleting a page | No MCP action deletes a page (`data_pages_tool` and `designer_tool` have none; checked 2026-09-27). Delete it in the Designer; set `draft: true` meanwhile so it isn't published |
| Classes, combo classes and states on a class | Nested (descendant) selectors can't be created: `data_style_tool` `create_style` has no parent-selector or nested option beyond combos (2026-09-29). Styling the elements inside a Rich Text element needs them, so those Designer nested styles are seeded by hand once (roadmap D-18, `classes.md` → Rich Text nested styles) |

Creates are **not idempotent**: a variable, field or class name that already exists is created
again with a `-2` suffix (or dropped, in the builder). Query first, every time, and record ids in
`webflow-ids.json`.

## Pulling Designer edits back into the repo

Anyone may fix things directly in the Designer. Before the next push, pull them back
(`AGENTS.md` §1), or the push overwrites them.

Not every difference is an edit. A Designer tab that was open before an MCP push can save its
older copy of a style over the push (seen 2026-09-24: `fk-button` lost its new gradient and
`transition` while padding stayed). If Webflow's value equals an earlier pushed value and
contradicts a recorded decision, treat it as stale: re-push and tell the user. If unsure, ask.
After every push, ask the user to reload the Designer.

1. **Detect.** `data_style_tool` → `get_styles` (`query: "all"`) and compare names with
   `classes.md`; unknown classes or new tag styles (`type: "tag"`) are Designer edits.
   `data_interactions_tool` → `list_interactions` and compare with `webflow-ids.json` (a missing id
   means it was deleted or recreated). `data_element_tool` → `get_all_elements` on the edited page.
2. **Read the values.** `query_styles` (or `get_styles` with `filter_ids`) with
   `include_properties`, every breakpoint and the `hover`/`focus-visible` pseudos. Variable values
   come back as `{ id }`; map them to token names through `webflow-ids.json`.
3. **Compare with the repo.** For the same classes, run `node scripts/webflow-style-actions.mjs
   <file> --only <class>` to see what the repo would push, and diff it against what Webflow returned.
4. **Back-port.** Edit `src/styles/` (and the markup, if structure changed), and the registries if a
   name or rule changed. A Designer value that breaks a rule (a raw hex, a new class name) is snapped to
   a token or renamed, then pushed back.
5. **Log it** in `sync-log.md` as a pull, listing what came from the Designer.

Prompt: *"Pull Designer changes for `<page or classes>` into the repo following the playbook's
pulling section. No pushes until I review the diff."*

## Safety rules

- **Idempotent by name.** Before creating a variable, style, component, page or collection, query
  it by its registry name. If it exists, update it; never create a second one.
- **Registry first.** If Webflow has something the registry doesn't, report it. Don't delete it.
  It may be a Designer edit that needs back-porting.
- **Destructive actions need explicit confirmation:** `remove_style`, `delete_variable`,
  `unregister_component`, `delete_variant`, `remove_prop`, `delete_collection_field`,
  `delete_collection_items`, `remove_element`, `delete_interaction`, `delete_asset`, `delete_font`,
  `clear_*_scripts`, `delete_branch`. The same goes for any publish action (`publish_site`,
  `publish_collection_items`, `publish_branch`, `merge_branch`).
- **Large changes on a branch.** For multi-page restructures, use `data_pages_tool` →
  `create_branch`, work there, and merge only after user review.
- **CMS items start as drafts.**
- **Stacked classes:** create and edit styles on the standalone class only (see `classes.md`).

## Prompt template for future iterations

> Sync `<registry entries or files>` to Webflow following `docs/webflow/mcp-playbook.md`. Site ID
> from `AGENTS.md`. Read before write, no destructive actions, no publish. Log the result in
> `docs/webflow/sync-log.md`.
