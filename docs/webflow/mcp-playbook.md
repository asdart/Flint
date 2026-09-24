# Webflow MCP playbook

How agents push repo changes to Webflow. The MCP server is `plugin-webflow-webflow` (Cursor
Webflow plugin). Every rule in `AGENTS.md` still applies, especially rules 11 and 12.

## Prerequisites

1. **Authenticated.** If calls fail with an auth error, run the server's `mcp_auth`. If
   `data_sites_tool` → `list_sites` returns no sites, the wrong Webflow account is connected. Stop and ask the user.
2. **Site ID known.** Read it from `AGENTS.md` §9. Never guess it or pick one from a list without asking the user.
3. **Designer tools** (`designer_tool`, selection, canvas) need the Webflow Designer open with the
   MCP Bridge app running. **Data tools** (`data_*`) are headless and preferred.
4. Call `webflow_guide_tool` once at the start of each session, then
   `data_agent_instructions_tool` → `search_instructions` for site-specific rules.

## Call conventions

- `session_id`: send `start` on the first call. Reuse the returned `ses_…` value on every later
  call in the same task, and pass it to subagents.
- `agent_id`: `<model>|cursor|<5-char suffix>`, chosen once per task and never changed.
- `context`: 15–25 words, third person, describing why the call is made. No personal data.
- Batch related actions in one call through the tool's `actions[]` array.
- **Where the site ID goes differs by tool** (checked 2026-09-23):
  - `data_sites_tool`: `site_id` inside the action (`get_site: { site_id }`).
  - `data_pages_tool`, `data_cms_tool`: `siteId` inside each action (`get_collection_list: { siteId }`).
  - `data_variable_tool`, `data_style_tool`, `data_component_tool`, `data_interactions_tool`,
    `data_element_builder`, `data_element_tool`, `data_component_builder`: top-level `siteId` **and**
    `pageId`. For site-wide work (variables, styles, components), use the Home page ID from `AGENTS.md` §9.
  - When unsure, read the tool schema first. Validation errors name the missing key.

## Order of operations

Always sync in this order, because later steps depend on earlier ones:

| Step | Registry | Tools (actions) |
| --- | --- | --- |
| 0. Site instruction (first sync only) | `AGENTS.md` | `data_agent_instructions_tool`: `search_instructions`, then `create_instruction` with a short summary of rules 1–12 and a link to this repo, so agents working inside Webflow follow the same contract |
| 1. Fonts | `tokens.md` → Fonts | `data_fonts_tool`: `list_fonts`, `create_font` |
| 2. Variables | `tokens.md` | `data_variable_tool`: `get_variable_collections`, `query_variables`, then `create_variable_collection` (`Flint`), `create_color_variable`, `create_size_variable`, `create_font_family_variable`, `update_*` |
| 3. Tag styles and classes | `classes.md` | `data_style_tool`: `query_styles`, then `create_style`, `update_style` (per breakpoint and state) |
| 4. Assets | images, SVGs, Lotties | `data_assets_tool`: `list_asset_folders`, `list_assets`, `create_asset_folder`, `create_asset` (see the MCP's asset upload guide) |
| 5. Components | `components.md` (UI → Global → Section) | `data_component_tool` (`query_components`, `create_blank_component` with group `Global`/`UI`/`Section`, `set_component_metadata`), `data_component_props_tool` (`create_prop`), `data_component_variants_tool` (`create_variant`, `set_variant_styles`), `data_element_builder` / `data_whtml_builder` to build the tree |
| 6. Pages | `components.md` → Pages | `data_pages_tool` (`list_pages`, `create_page`, `update_page_settings`), `data_component_builder` (`insert_in_element`) |
| 7. CMS | `cms.md` | `data_cms_tool` (`get_collection_list`, `create_collection`, `create_collection_static_field`, `create_collection_reference_field`, `create_collection_items`, `update_collection_items`) or `/cms-collection-setup`, `/bulk-cms-update` |
| 8. Interactions | `interactions.md` | `data_interactions_tool`: `guide`, `list_interactions`, `create_interaction`, `update_interaction` |
| 9. Custom code | `interactions.md` → exceptions only | `data_scripts_tool` (`register_inline_script`, `add_page_script`) |
| 10. Verify | — | `data_style_tool` → `get_styles`, `element_snapshot_tool`, `data_element_tool` → `query_elements`, `/site-audit`, `/accessibility-audit` |
| 11. Publish | — | Only on user request, via `/safe-publish` |

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
