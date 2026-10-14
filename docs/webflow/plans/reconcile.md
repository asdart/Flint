# Plan — Reconcile Webflow changes back into the repo

**Status:** phase 1 (measure) done 2026-10-10. The user answered the five open questions on 2026-10-11 (see "User decisions (2026-10-11)"); the format ([`../snapshot/README.md`](../snapshot/README.md)) is updated to match. **Phase 2 done** (steps (a) to (d) on 2026-10-11; baseline taken 2026-10-13, see "Phase 2 progress"). **Phase 3 stage 1 (id map and id diff) done 2026-10-13** (see "Phase 3 stage 1 progress"). **Phase 3 stage 2 (`webflow-reconcile.mjs`, three-way rows and the report) done 2026-10-13** (see "Phase 3 stage 2 progress"). **Phase 3 stage 3 part A (offline: moves, restructure, attributes, repo-ahead coverage, pre-existing differences) done 2026-10-13** (see "Phase 3 stage 3 part A progress"). **Phase 3 done** (stage 3 part B, 2026-10-13). **Phase 4 (apply and partial refresh) done 2026-10-13** (see "Phase 4 done"). **Phase 5 (wire in: the gate's partial dump, `/reconcile`, gate and refresh in the sync skill, playbook and contract) and phase 6 (contract 1.14, D-66) done 2026-10-13** (see "Phases 5 and 6 done"). **The plan is complete**; this file stays as the record of findings. Left for the user and the next Webflow stage: the site instruction `rules/flint-contract.md` (to-do below), the drift list of the first report, and the open gaps listed under "Phases 5 and 6 done".

## Why

The marketing team will edit copy on Webflow, and the user may also change things there and forget to
update the repo. Webflow can't be locked down, so the repo stays the source of truth (AGENTS.md §1)
and gets a reliable way to pull anything changed on Webflow back in. Webflow's own history doesn't
help: the activity-log API is Enterprise-only, and Designer backups have no diffs.

## User decisions (2026-10-10)

- The repo stays the source of truth; nothing on Webflow is restricted.
- Reconcile runs **on demand only** (no schedule).
- The user reviews a **changes report** before anything is applied to the repo.
- **Unpublished Designer edits count**: the reconcile reads the Designer state (MCP), not the
  published site.

## User decisions (2026-10-11)

These answer open questions 1 to 5 from phase 1 and change the storage plan.

1. **The snapshot data is not committed.** It lives in `docs/webflow/snapshot/data/`, which is
   gitignored. Same layout as specified (`pages/`, `components/`, `styles.jsonl`, `variables.json`,
   `interactions/`, `assets.json`, `cms.json`, `site.json`, `manifest.json`, `map/`). Only
   [`../snapshot/README.md`](../snapshot/README.md) (the spec) is committed.
2. **`manifest.json` records the repo commit the snapshot matched**, plus the dump timestamp, file
   hashes and change signals. This replaces git history for the "base vs repo" column of the
   three-way compare: repo changes since base = changes since that commit, plus uncommitted
   working-tree changes.
3. **Raw MCP dumps** go to the gitignored `.cache/webflow-dump/<UTC timestamp>/`. The last 3 runs
   are kept.
4. **A rebuild command** (built in phase 2 or 3, for example
   `node scripts/webflow-snapshot.mjs --rebuild`) creates a fresh base when `data/` is missing (new
   clone, cloud session, lost disk). It must warn plainly that rebuilding resets the base: any
   Webflow edit made since the last sync is absorbed silently instead of reported.
5. **Variant style overrides** are compared only for the (variant, style, breakpoint, pseudo)
   triples listed in [`../components.md`](../components.md). Phase 2 or 3 adds a check that fails
   if a sync writes a triple that is not listed there. Accepted gap: an override added only in the
   Designer goes unnoticed.
6. **Image alt:** routine runs do not compare inherit vs decorative. Only changed images get
   `get_settings`.
7. **Model use, to save usage.** The raw dump runner (phase 2 baseline dump, about 58 read calls
   saved to files with counts printed; later the routine gate dump of about 8 calls) runs on
   **Sonnet at low effort** (Haiku dropped by the user, 2026-10-11). A script checks the dump (`webflow-snapshot.mjs --check`: completeness, consistent counts,
   nothing edited during the dump; expected totals at the baseline: 13 pages, **16 components**,
   1,494 styles, **74 variables**, 14 interactions, 197 assets, 3 CMS collections) and the
   run is repeated if the check fails. *Correction 2026-10-11: phase 1 and this item said 15
   components and 68 variables. Global / Featured post is registered, so there are 16 components, and
   the 74 variables match `src/styles/tokens.css`.* Everything that interprets (snapshot script,
   normalisation, id map, diff, report, apply) runs on **Sonnet**.
8. **Phase 2 order** (progress in "Phase 2 progress"): (a) Sonnet (low effort) dump while nobody edits the Designer; (b) Sonnet builds
   `webflow-snapshot.mjs` and the snapshot, records the 10 known repo-vs-Webflow differences and
   runs a key / secret scan over the dump; (c) the user makes one unpublished Designer text edit
   plus reversible edits to a style, a component and a variable; (d) readback to observe which
   reads show them and which timestamps move; then the user reverts.

9. **The reconcile reports are committed** (user, 2026-10-11): `docs/webflow/reconcile/<date>.md`
   is the lasting record of what changed between syncs, since the snapshot data itself is not in
   git. Commit them like any other doc, when asked.
10. **The baseline needs `src/` clean, not the whole tree** (2026-10-11): `src/` (and the CSS and
    tokens it builds from) must have no uncommitted changes when a snapshot is taken, because its
    `repoCommit` stands for the repo state that matched Webflow. Docs, scripts and skills may be
    modified.

## Approach: snapshot + three-way compare

A plain repo-vs-Webflow diff can't tell which side changed. So after every sync the local machine keeps a
normalised **snapshot** of Webflow, the last agreed state (the base; not committed, see the
2026-10-11 decisions). Its `manifest.json` also names the repo commit it matched. A reconcile
compares three states for each item:

| Base vs Webflow | Base vs repo | Meaning | Action |
| --- | --- | --- | --- |
| same | same | in sync | none |
| changed | same | edited on Webflow | **pull** into the repo (proposed in the report) |
| same | changed | repo ahead | push at the next sync (listed, no action) |
| changed | changed | both edited | **conflict**: the user decides |

Around it:

- **Quick check first:** the page and site "last updated" times (MCP) narrow the full compare to
  the pages, components and styles that moved since the snapshot.
- **Gate:** every sync stage and `/safe-publish` start with a reconcile, so a Webflow edit is never
  overwritten by a push (AGENTS.md rule 11 extended).

## What the snapshot covers

Stored under the gitignored `docs/webflow/snapshot/data/` as normalised JSON (stable key order, Webflow-internal ids kept
only where they identify an element; volatile fields such as timestamps dropped):

- Page element trees, every static page, template and utility page: tag, classes, attributes,
  element settings (link, image asset, alt, loading, id), text.
- Component definitions: tree, props, variants; instance prop overrides on pages.
- Styles: every class and combo, all breakpoints and states (the `webflow-diff.mjs` dump format).
- Variables (collection `Flint`).
- Page settings: title, description, Open Graph, `noindex` / sitemap, JSON-LD.
- Custom code: site head and footer, page head and footer, registered scripts and the scripts applied.
- Interactions: the list with triggers and targets.
- Assets: id, name, alt.
- CMS: collections and fields only. **Items are excluded**: posts stay Webflow-first (§1).

## How each kind of change maps back to the repo

| Webflow change | Repo target | Handling |
| --- | --- | --- |
| Text | the string in `src/pages`, `src/sections`, `src/components` or `src/content` | proposed edit, located by element → markup mapping |
| Classes, attributes, element settings | the JSX element | proposed edit |
| Style values | `src/styles/**/*.css` (via the `webflow-diff.mjs` mapping) | proposed edit |
| Variables | `src/styles/tokens.css` + `tokens.md` | proposed edit |
| Page settings, JSON-LD | `components.md` page rows; `src/content/*` for generated schema | proposed edit |
| Added / removed / moved elements, new components or props | JSX + registries | assisted: proposal, user review |
| Custom code | its source in `src/` (most blocks are generated by `scripts/build-x-*.mjs`) | flagged: the change must go into the source, then regenerate |
| Interactions | `interactions.md` + `src/ix` | assisted |
| New assets | `public/assets/` + `webflow-ids.json` | listed, file downloaded on approval |

## The changes report

`docs/webflow/reconcile/<date>.md` (committed, decision 9), one row per change: area, page / component / class, element,
base → Webflow value (and repo value for conflicts), direction, proposed repo edit (file and line).
The user approves all, some or none; the agent applies the approved rows, runs `npm run build` and
`npm run lint`, and refreshes the snapshot for exactly what was applied. Commit only when asked.

## Phase 1 findings (2026-10-10)

Measured read-only on the production site (`6ab9ba4aeffb3329202448ee`: 13 pages, 15 components (16, corrected 2026-10-11),
1,494 styles of which 700 have properties, 14 interactions, 197 assets, 3 CMS collections). Raw
results are in the session scratchpad, not in the repo. Sizes are characters of the MCP result;
tokens are about size / 3.7 and only matter when a result arrives inline (a result over about
25k tokens is written to a file by the client and costs almost no context). Wall-clock was not
timed per call; the largest call (850 KB of styles) returned in well under a minute.

### Measurements

| Area | Tool / action | Calls for a full dump | Size | Readable | Sees unpublished | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Site | `data_sites_tool` `get_site` | 1 | 1 KB | yes | n/a | has `lastUpdated`, `lastPublished` |
| Pages list + settings | `data_pages_tool` `list_pages` | 1 | 8.5 KB | yes | yes (inferred) | title, slug, draft, SEO, Open Graph, `lastUpdated`, template `collectionId` for all 13 pages; limit 100, no paging needed |
| Page element trees | `data_element_tool` `get_all_elements`, one call per page | 13 | about 524 KB (Home 107, Candidates 120, Facility 84, About 62, Posts template 30, legal 22 and 25, others under 25, Authors template empty) | yes, with gaps below | yes (inferred) | Page Hero etc. appear as instances with prop values and `hasOverride`; the section's inner tree is not in the page tree |
| Component definitions | `get_all_elements` with `scope_component_id`, 16 actions in one call | 1 | 168 KB (Role Grid 28, Testimonials 33, Arc Stage 27, Footer 15, Nav 11, rest small) | yes | yes (inferred) | nested component definitions are not expanded; Button, Stat, Quote Card are tiny |
| Component meta, props, variants | `data_component_tool` `get_all_components` with `includeProps`, `includeVariants`, `includeInstanceCount` | 1 | 14.5 KB (3.7 KB without options) | yes | yes (inferred) | prop ids and defaults, variant ids and names |
| Variant style overrides | `data_component_variants_tool` `get_variant_styles` | one per (variant, style, breakpoint, pseudo) | 150 B each; whole set unknown | partial | yes (inferred) | cannot be listed, only asked for a known triple (see "Unreadable or partial") |
| Instance prop overrides | in the page tree (`instanceDetails.props`) | 0 extra | included above | yes | yes (inferred) | 60 Button, 42 Testimonial Card, 15 Quote Card instances in the site |
| Styles (all classes, combos, tags) | `data_style_tool` `get_styles` `query: all`, `include_properties`, breakpoints `main medium small tiny`, base pseudos `noPseudo hover active focus focus-visible focus-within placeholder` | 1 | 695 KB (names only: 262 KB) | yes, including the 9 tag styles | yes (inferred) | one call, no paging; order and values identical in two reads; a wider pseudo list cost 845 KB and added only copies of the base pseudo-states |
| Variables | `data_variable_tool` `get_variable_collections`, `get_variables` | 2 (1 once the collection id is known) | 1 KB + 11 KB (68 variables; 74 on the 2026-10-11 re-read, matching `tokens.css`) | yes | yes (inferred) | ids are `variable-…`, stable |
| Page JSON-LD | `data_pages_tool` `query_pages_schema_markup` (all 13 pages in one action) | 1 | 11 KB | yes | yes (inferred) | `jsonLdSchema` (object form) and `rawJsonLdSchema` (string, with CMS tokens, seen on the Posts template); also returns each page's `lastUpdated` |
| Sitemap inclusion | `data_sitemap_tool` `list_pages_sitemap_status` | 1 | 1 KB | yes | yes (inferred) | Thank You is `false`; templates and utility pages are not listed |
| Site custom code | `data_scripts_tool` `get_site_freeform_code`, `get_site_scripts`, `get_registered_scripts` | 3 actions, 1 call | 3.3 KB head code; 1.9 KB registered scripts; site scripts 404 (none applied) | yes | yes (inferred) | head holds the x-* CSS and the site JSON-LD |
| Page custom code and applied scripts | `get_page_scripts`, `get_page_freeform_code` | 26 actions, 1 call (13 pages x 2) | Home footer 22 KB (bundled x-carousel + motion), Posts head 3.6 KB, others under 1 KB; a page with no scripts returns a 404 error item | yes | yes (inferred) | `get_page_scripts` has `lastUpdated`; template head blocks pasted with CMS tokens are not returned (known) |
| Interactions | `data_interactions_tool` `list_interactions`, `get_interaction` x 14 | 2 | list 8.5 KB, full 36 KB (ix-ticker 14 KB) | yes, complete triggers and timelines | yes (inferred) | each interaction has `version`; `wf:class` targets are style GUIDs |
| Assets | `data_assets_tool` `list_assets` (limit 100) | 2 | 54 KB per 100, 108 KB in all (197 assets) | yes | n/a | `altText`, folder, `size`, URLs; `size` is 0 for fresh SVGs |
| CMS schemas | `data_cms_tool` `get_collection_list`, `get_collection_details` x 3 | 2 | 1 KB + 4 KB | yes, with validations | n/a | list has `lastUpdated` per collection; items excluded |
| Fonts, site instruction | `data_fonts_tool` `list_fonts`, `data_agent_instructions_tool` `search_instructions` | 2 | 1.5 KB + 0.7 KB | yes | n/a | instruction has `version` (7) |
| **Total full dump** | | **about 58 calls** (pages 13, component trees 1, styles 1, meta 1, variants about 15, variables 1, interactions 2, assets 2, code 3, schema 1, list 3, CMS 2, extras 12) | **about 1.6 MB raw** | | | about 0.43M tokens if it all entered context; with files and scripts, a stage agent sees only counts and diffs |

Quick check: `get_site` (1 KB), `list_pages` (8.5 KB), `list_interactions` (8.5 KB),
`get_collection_list` (1 KB), `get_registered_scripts` (2 KB): 5 calls, about 21 KB, about 6k
tokens. It covers page edits, interaction edits, CMS schema edits and new script versions. It does
**not** cover styles, components, variants or variables: none of their MCP results has a timestamp,
and a component or style edit does not move the `lastUpdated` of the pages that use it (the legal
pages still show 2026-10-07 after the Page Hero changes of 2026-10-10). Those three are re-read
every run: 3 calls, about 0.9 MB, written to files by the client, compared by hash. So a routine
run is about 8 calls. Whether `site.lastUpdated` moves on a style, component or variable edit is
unknown (it equalled the publish time, 12 seconds after it); phase 2 tests it.

### Unpublished Designer edits

All data tools read through the same backend that the sync writes to. Every sync step in this
repo reads back what it wrote before publishing, and the draft Style guide page is readable, so
the reads show the working copy. There was no unpublished edit on the site during the measurement
(last publish 23:17Z, last page edit 22:12Z), so this is inferred, not observed. Phase 2 confirms it
once, with the user: one unpublished text edit in the Designer, then a read. The Designer bridge
(`designer_tool`, `element_snapshot_tool`) was not connected and is not needed.

### Unreadable or partial

| Area | State | Workaround or decision |
| --- | --- | --- |
| Image `altText` in the tree | the tree has it only on explicit text (2 of 35 Home images); decorative and inherit are missing | `get_settings` per image returns `decorative` (1 action per image, about 350 B); the snapshot stores the tree value and the asset's `altText`, and asks `get_settings` only for images that changed or when the user wants a full alt audit. **Decided 2026-10-11:** routine runs do not compare inherit vs decorative |
| HTML Embed code, Rich Text, form field validations | tree shows only the type | `get_settings` key `code` per embed (1 on Home); the rest is unreadable. List these elements in the report as "not compared" |
| Variant style overrides | readable only per (variant, style, breakpoint, pseudo) | store the triples that `components.md` lists (Stat Default, Button variants, Page Hero Half Screen, Nav Dark, Dropdown); an override on a triple nobody lists is invisible. **Decided 2026-10-11:** accept the gap; phase 2 or 3 adds a check that fails if a sync writes a triple not listed in `components.md` |
| Text bound to a component prop | the bound element shows no children; the value is on the instance | compare the instance props; this is what `webflow-tree-diff.mjs` already does |
| Page `noindex`, site redirects (the 301 map), `robots.txt`, `llms.txt`, canonical, site SEO | not readable | repo files stay the source; check on staging as today |
| Template head code with CMS tokens (`x-schema-post`) | `get_page_freeform_code` omits it (the JSON-LD token string is visible through `rawJsonLdSchema`) | staging HTML check, as in the skill |
| Style states at `medium`, `small`, `tiny` for a pseudo-state | none exist today; the dump returns any that do if the pseudo is in the list | add `first-child`, `last-child`, `nth-child(odd|even)` to the base list in phase 2 (they return nothing today because `fk-stat is-default:last-child` lives in the component variant, not in a class) |
| Collection items | excluded by design | |
| Breakpoints `large`, `xl`, `xxl` | not used | not requested |
| Element identity after duplicate, `transform_element_to_component`, delete and re-create | new id | see the mapping decision |

### Mapping a Webflow element to its JSX line: decision

**Form fields (D-67, 2026-10-11):** `<InputField>` and `<SelectField>` uses in the repo map to plain-markup form fields on Webflow (unlinked, with their own Name / Placeholder / Type / options), i.e. page-level markup, not component instances; only `UI / Newsletter Form` is an instance. The templates `UI / Input Field` / `UI / Select Field` appear as instances only in the style guide's Templates form.

**Chosen: element ids as the identity in the snapshot, plus a sync-time map from id to repo
location. Order-and-text matching only builds that map, once, on a repo that equals Webflow.**

Evidence:

- Element ids are in every tree result (`id.element`) and are unique (446 of 446 on Home), also for
  `String` text nodes and component instances. Two reads of the Home tree minutes apart were
  byte-identical except the label. 74 element and component ids quoted in `sync-log.md` between
  2026-09-26 and 2026-10-10 are still in the live trees, through many saves, several publishes and
  `move_element` calls. Ids inside a component definition are derived from the component id (`…936334`)
  or random once added later.
- `webflow-tree-diff.mjs` aligns only by position and text, per section (`main:N`) or per whole
  component (`action:N`), and prints a node path, not a line. It uses the id nowhere. I ran it on
  About (8 sections, 238 nodes) against a render of `AboutPage.tsx` from
  `webflow-markup.mjs` in 0.04 s: no text, class or attribute difference. The 14 reported lines are
  Nav, Footer, Stat and link nodes that the script does not collapse into instances yet and two
  page-link vs URL props. So positional alignment is exact when the repo equals Webflow, which is
  the state right after a sync.
- Positional alignment alone fails after a Webflow edit that adds or removes an element, because
  the children count differs and every later sibling is misaligned. Ids do not have this problem:
  a new id is "added", a missing one "removed", a changed order "moved".
- `webflow-markup.mjs src/sections/X.tsx` renders a section with no props (StatsBand throws:
  `stats` undefined). Page-level markup must be rendered from the page (`src/pages/…`), which works
  (0.5 s for AboutPage). It prints no source lines.
- Ids that did change or vanish in the log are the cases to expect: deleted elements and
  re-created ones (the Thank You page was rebuilt; the first page was deleted).

How a text edit reaches a line:

1. The id diff says: element `X`, text `old` → `new`, on page P.
2. `map/P.json` says: `X` is in `src/sections/Hero.tsx`, order path `[0,2,1]`, text `old`,
   occurrence 2.
3. The script finds the 2nd occurrence of the string `old` in that file (JSX text, a prop string
   or an array literal) and proposes the edit with file and line. Strings in `src/content/*.json`
   (CMS seed) are searched too.

Failure modes:

- The same string appears twice in a file and the order path says which one; if the repo moved the
  element since the last sync, the occurrence number may point at the wrong one. The report shows
  both lines and asks.
- Text built from several parts (`{count} roles`) or a data array (`LOGOS`): the string is not a
  literal in one place. The report says "edit by hand in <file>" and shows the old and new text.
- An element that Webflow-side was duplicated, transformed into a component or recreated has a
  new id with no map entry. The report lists it as "added", with the nearest mapped neighbour, and
  a proposal made by position (the same logic as the diff today). Assisted, never automatic.
- The repo changed since the last sync (the map is stale). The report states the map date and
  compares each mapped string with the current repo; a mismatch is a conflict row.
- A component edit (Footer text) maps to the component's own file, not to the pages that use it.
  Instance prop edits map to the call site in the page file (`<Button …>`), found by the prop
  value.
- `String` node ids change when Webflow splits a text run after an edit in the Designer's text
  editor (not verified; unknown until the first real edit). The report matches by parent id and
  position when a text id is new but its parent id is not.

Phase 3 must build: (1) `scripts/webflow-snapshot.mjs` (raw dump to snapshot files); (2)
`scripts/webflow-map.mjs` (render pages and components from the repo, align with the existing
`webflow-tree-diff.mjs` logic extended to collapse Nav, Footer, Stat and link nodes, and write
`map/<slug>.json`); (3) the id-based tree diff; (4) the string locator with line numbers.

Not chosen: annotating the JSX with ids (it would put Webflow bookkeeping into every component,
and a `data-` attribute would reach the live HTML); matching by order and text alone (breaks on
the first add or remove).

### Snapshot format

See [`../snapshot/README.md`](../snapshot/README.md). Summary: one JSON file per page and per
component with one element per line, one line per style in `styles.jsonl`, variables by name,
interactions one file each, a manifest with the repo commit, change signals and file hashes. About
640 KB on disk (80 KB gzipped), 60% smaller than the raw dump after dropping duplicate fields and
794 empty combo chains. **None of it is committed:** the data is in the gitignored
`docs/webflow/snapshot/data/` and only the spec is committed. Raw dumps (1.6 MB) stay in a
gitignored `.cache/webflow-dump/<UTC timestamp>/`, last 3 runs. Volatile fields (timestamps, asset `size` and URLs, script
`hostedLocation`, instance counts, GUIDs of styles) are dropped; a read repeated twice showed none
in trees or styles.

### Other findings

- `webflow-diff.mjs` on the first dump runs in 0.08 s and reports 10 known differences (two
  `pointer-events`, one `.fk-modal` transition, five `fk-stat.is-default` classes that live in a
  variant, two Webflow utility-page classes). The baseline must record such known differences so they
  are not read as repo changes later.
- The Diff recipe's pseudo list never returned a `medium` plus pseudo-state, so nothing is lost
  today. A wider list is cheap, but adds no data now.
- The client saves a large result to a file and small ones arrive inline (phase 1 estimated the limit at
  about 25k tokens; the dump of 2026-10-11 showed it saves only about 90 KB and up, see "Phase 2
  progress"). The largest single result was 845 KB. No MCP call hit a pagination limit except `list_assets`
  (100 per page).
- Reading 7 small pages one call each put about 50k tokens of tree text in this agent's context.
  The dump must run in a stage agent whose context is thrown away, and write each result to
  `.cache/`.

## Phase 2 progress (2026-10-11)

- **(a) Dump: done.** Raw dump `.cache/webflow-dump/20261011T194658Z/` (gitignored, 1.8 MB, 33 files):
  13 page trees, 16 component trees, 1,494 styles, 74 variables, 14 interactions (list and full),
  197 assets (2 pages), schema, sitemap, site and page code, fonts, CMS collection list. No edits
  during the dump: `site-before` equals `site-after` and every page `lastUpdated` is identical in
  `pages-before` and `pages-after` (`webflow-snapshot.mjs --check` verifies this). Repo commit
  `68829d449d8de184568783e27f9e8e10a942d3aa`.
- **Dump lesson.** The dump agent saved only the large results; small ones came back inline. So a dump must repeat
  actions in one call until the result passes about 90 KB and the client saves it to a file, then
  dedupe by script (`data_element_tool` takes one `pageId` per call). The `flint-webflow-sync` skill has
  the row. The next dump must also add `cms-details.json` (CMS field schemas), the
  `get_variant_styles` triples and the site instruction, which the baseline lacks (manifest `gaps`).
- **(b) Snapshot script and baseline: done.** `scripts/webflow-snapshot.mjs` (offline, deterministic,
  `--check`, `--out`, `--commit`, `--rebuild`, `--yes`, see the snapshot README → Script) wrote
  `docs/webflow/snapshot/data/` (49 files, 752 KB, gitignored) with `repoCommit` 68829d4. Two runs on
  the baseline dump (and a third to another folder with `--out`) are byte-identical. The 10 known
  repo-vs-Webflow style differences, plus the tree-diff noise on About, are recorded in
  `docs/webflow/snapshot/accepted.json` (committed). A key and secret scan of the dump and of `data/`
  found nothing: the only match is the public address `support@withflint.com` in the Privacy Policy
  and Terms trees; the other pattern hits are the sha256 values in the manifest.
- **(c) Done.** The user made edits in the Designer (more than the four test edits: see (d)). A second
  dump was taken: `.cache/webflow-dump/20261011T223401Z` (check passes; 13 pages, 17 components, 1,497
  styles, 75 variables, CMS field schemas included).
- **Script robustness (2026-10-11).** The second dump has another raw shape (`{label, action, result}`
  wrappers instead of `{type, text}` blocks, `interactions.json` as `result: [{items}]`, a
  `cms-collection-details.json` map instead of `cms-details.json`), and `--check` crashed on it.
  `webflow-snapshot.mjs` now has one unwrap helper that accepts a wrapper, text blocks, an array of
  wrappers or a one-element array, skips non-result blocks, ignores labels, and reads either CMS
  details file name (`cms.json` `fields` is now filled). Re-normalising the baseline dump into a
  scratch folder and `diff -r` against `data/` gave no difference at all (manifest included).
  `--check` passes on both dumps.
- **(d) Readback: done.** Normalised the second dump (`--out` scratch folder, `--commit 68829d4`) and
  compared with `data/`. The raw compare was mostly noise: of 1,497 vs 1,494 styles, 1,311 differ only
  by list position (insertions shift the order; ids and values are equal), and only 1 existing style
  changed. The normalised compare sorts by selector, so it shows only the real changes. No
  normalisation fix was needed. Real changes (all edits in Webflow, not one of them in the repo):

  | Area | Where | Before -> after |
  | --- | --- | --- |
  | Text, unpublished | Home, String `8a16145e-ee69-d410-8c15-f94add50aa78` (`src/sections/Pricing.tsx:44`) | "Why Flint is free?" -> "Why is Flint free?" |
  | Class on element | Facility partners, `856210ce-e333-114f-bf85-ec97d3823b1b` (`fk-steps-back is-n1`, `src/sections/FacilityValueProp.tsx:135`) | `fk-bg-white` -> `fk-bg-brand` |
  | Variable | `space-4.5` (Size, 18px, id `variable-7f0ad6c0-…`), not in `src/styles/tokens.css` | added |
  | Style | `.fk-input-field` (`src/styles/components/input-field.css:14`) | `padding-top` and `padding-bottom` 0px -> `var(space-2)`; `transition` removed (repo has it, line 23) |
  | Style | `.fk-input-container` (new) | flex column, gap `var(space-1)` |
  | Style | `.fk-input-field-label` (new) | 12px, weight 400, line-height 16px |
  | Component | Input Field (`src/components/ui/InputField.tsx`) | rebuilt: root `fk-input-container`, a visible `fk-input-field-label`, the field inside a new `fk-input-field` div; props `Label` -> `Placeholder`, `Button Label` -> `Label`, new `ID` (type id); the Subscribe button and `is-action` moved out; description shortened |
  | Component | Newsletter Form (new, group UI, id `a2af1369-…`) | the form (wrapper, form, Input Field with Subscribe button, success and error messages) with props Button Label, Success Message, Error Message |
  | Component | Newsletter | its form markup replaced by one Newsletter Form instance |
  | Page | Posts template | the same form replaced by a Newsletter Form instance |
  | Page | Style guide | Input Field instance gets prop `ID` = `email-field` |

  Signals (before -> after): `siteLastUpdated` 2026-10-10T23:17:15 -> 2026-10-11T22:31:57;
  `siteLastPublished` unchanged (2026-10-10T23:17:03); page `lastUpdated` moved on 5 pages: Facility
  partners (22:08), Home (22:12), Style guide (22:24), Posts template (22:31:45), Blog (22:31:57);
  schema `lastUpdated` moved on the same 5 pages (same values, no extra information);
  interaction versions, page-scripts `lastUpdated`, collection `lastUpdated` and registered scripts:
  unchanged.
- **Verdict on the key question: yes, an unpublished text edit is visible in the data reads.** The Home
  tree shows the new text, the Home `lastUpdated` moved, and `lastPublished` did not. So the reads show
  the Designer working copy, as assumed.
- **Which edits move no timestamp.** The variable, the style values, and the new styles moved nothing
  of their own: there is no variable or style timestamp, and `siteLastUpdated` is equal to the latest
  page save (it was 6 ms after the Blog save), so it cannot be used for them. The component edits
  (Input Field, Newsletter, new Newsletter Form) have no timestamp either; they bumped some pages that
  use them (Blog moved with an unchanged tree, Style guide, Posts template) but not all (the Categories
  template also holds the Newsletter and did not move). So the quick check misses a pure style,
  variable or component edit, and only the always-re-read set (styles, component trees, variables,
  about 0.9 MB, 3 calls) catches them. A style-only edit with no page save was not tested separately:
  every edit of this session coincided with a page save.
- **Effect on the quick-check design: none.** Keep the plan as written: the five-call signal check
  decides which pages, interactions and collections to re-read, and styles, components and variables
  are always re-read and compared by hash. Two additions: a moved page `lastUpdated` without a tree
  change (Blog) is harmless noise, so the compare, not the signal, decides; and a component edit
  changes the trees of pages that instance it only through props (Style guide `ID`), so the
  always-re-read component trees must be compared against the instances, which the snapshot already
  stores.
- **Left to do:** the user reverts (or keeps) these edits; if kept, they are pulled into the repo by
  phase 3 / 4. The new dump's `cms-collection-details.json` closes the CMS gap; `get_variant_styles` and
  the site instruction are still open.

- **Phase 2 closed (2026-10-13).** The baseline was retaken after the reconcile push of 2026-10-11 so
  that `data/` matches the repo again: dump `.cache/webflow-dump/20261013T023829Z` (check passes),
  `repoCommit` `831b811`, `src/` clean; `data/` is 51 files, about 777 KB (the map adds 434 KB, 30 files).
  Counts: 13 pages, 18 components, 2,487 elements, 1,502 styles of which 705 with properties, 75 variables,
  14 interactions, 197 assets, 3 CMS collections. Accepted repo-vs-Webflow differences: exactly the same
  10 as before (`webflow-diff.mjs` on the new dump: 2 `pointer-events`, 1 `.fk-modal` transition, 5
  `fk-stat.is-default` classes in the variant, 2 utility-page classes; `accepted.json` `baseline` now names
  this dump and commit). Still open from the dump: `variantStyles` and the site instruction (manifest `gaps`).

## First reconcile (manual, 2026-10-11)

Done by hand before `webflow-reconcile.mjs` exists, from the (d) change table above (repo only, no Webflow
writes, no commit). **Model use change (user, 2026-10-11): Haiku is dropped.** Dump runners use Sonnet at low
effort; the Haiku mentions in this plan and in `../snapshot/README.md` are replaced. `snapshot/data/` was **not**
refreshed: a fresh dump after the Webflow stage below rebuilds the base.

Pulled into the repo:

| # | Change | Where |
| --- | --- | --- |
| 1 | Home text "Why is Flint free?" | `src/sections/Pricing.tsx:44` |
| 2 | Facility partners `fk-steps-back is-n1`: `fk-bg-white` -> `fk-bg-brand` | `src/sections/FacilityValueProp.tsx:135` (comment in `steps.css`) |
| 3 | Variable `space-4.5` = 18px, spelled `--space-4-5` | `src/styles/tokens.css`, `tokens.md`; `gen-utilities.mjs` added `fk-gap-4-5` to `utilities.css` (repo only: Webflow has no such utility and nothing uses it) |
| 4 | `.fk-input-field` padding `space-2` x `space-3-5`, transition removed; new `.fk-input-container`, `.fk-input-field-label` (12px / 400 / 16px, no color) | `src/styles/components/input-field.css`, `classes.md` |
| 5 | `UI / Input Field` rebuilt (container, label, field div; props Placeholder, Label, ID; no button, no `is-action`) | `src/components/ui/InputField.tsx` |
| 6 | New `UI / Newsletter Form`, used by Section / Newsletter and the Posts template band | `src/components/ui/NewsletterForm.tsx`, `src/sections/Newsletter.tsx`, `src/sections/ArticleNewsletter.tsx` |
| 7 | Style guide Input Field ID `email-field` | `src/pages/StyleGuidePage.tsx` |

Scope added by the user the same day (repo ahead of Webflow): `UI / Dropdown` renamed `UI / Filter Dropdown`
(`FilterDropdown.tsx`, `fk-filter-dropdown*`, `filter-dropdown.css`, `src/ix/dropdown.ts`; no custom code or script on
Webflow mentions `fk-dropdown`: the dump's site and page code have none); new `UI / Select Field`
(`SelectField.tsx`, class `fk-input-field-select`); Input Field gets Show Label and `aria-label` when the label is hidden.

Findings on Webflow (read-only, 2026-10-11):

- The Newsletter Form does **not** contain an Input Field instance: the pill (`fk-input-field is-action`, sr-only
  label, `fk-input-field-input is-action`, a hidden icon image, the native Submit Button) is inline in the component. So
  `.fk-input-field.is-action` and `.fk-input-field-input.is-action` are still used: **no orphan styles**.
- Input Field on Webflow: the label's `text` is bound to the prop named **Placeholder**; its visibility is a
  `conditional` (not readable through the MCP); there is no Show Label prop; the input has no placeholder binding
  (`placeholder` is reserved, see the skill) and `get_bindable_sources` says `attributes` is "not applicable" to the
  input (the raw settings list an empty `attributes`). So **whether a prop can bind to `aria-label` on the Form Text
  Field is untested** (only the DropdownList `aria-label` binding is proven). Test it first in the stage below; if
  `set_settings` `attributes` is rejected, stop and ask the user (do not add an exception).
- `rename_style` (`data_style_tool`) and `set_component_metadata` exist: a rename keeps the style id.

Deviations from the contract or Figma (the repo mirrors Webflow; the user decides):

1. Variable named `space-4.5` (a dot) on Webflow; the repo spells half steps with a hyphen (`space-3-5`).
   Rename it `space-4-5` on Webflow? Nothing uses it.
2. `.fk-input-field-label` has no color on Webflow (inherits ink); Figma `5985:3085` draws it `color-subtle` (#61656a).
3. The `.fk-input-field` transition was removed on Webflow (hover and focus now snap). Rule 14 says effects match the
   repo: confirm it is intended.
4. `fk-steps-back is-n1` is now full `color-brand` at 40% opacity (a dark purple card behind the savings art): confirm.
5. Input Field label text bound to Placeholder, no placeholder binding, conditional visibility instead of a Show Label
   prop (see above). A bound `aria-label` (if it works) is always present, not only when the label is hidden: same text
   as the label, so the name is the same, redundant but harmless.
6. Newsletter Form has a fixed `id="field-email"`: two instances on one page (the style guide) give a duplicate id.
7. Select Field placeholder look (grey until chosen) needs a `:invalid` or `:has()` state Webflow can't style: not
   built (Figma shows the chosen date at 70% opacity ink); the first option "Select one..." is shown in ink.

**Done 2026-10-11 (Webflow stage, agent sonnet-5.5):** every step below and the eight user decisions (label color `color-subtle`, `.fk-input-field` transition restored in repo and Webflow, Facility partners `fk-bg-white` restored, Newsletter Form ID prop, Input Field Show Label + Label rebinding + Placeholder prop deleted, `space-4.5` renamed `space-4-5`, Select Field first option in ink) are applied and read back; the aria-label binding works. Details and ids: `sync-log.md` row 2026-10-11 (reconcile push). Left: the Select Field options can't be read back (confirm in the Designer), a scratch Form Select on the Style guide, Designer image sizes. The text below is the original plan.

### Webflow change list (next stage, ordered; read before write, rule 12: no deletes)

0. Gate: `/reconcile` dump (or the signal check) shows no new Designer edits since this note.
1. **Rename Dropdown** (user decision): `data_component_tool` `set_component_metadata` `{component_id:
   "d65ee1fa-7a35-366a-4fc0-5d772a2776ad", name: "Filter Dropdown", description: "UI / Filter Dropdown. Repo:
   src/components/ui/FilterDropdown.tsx. …"}`; then `data_style_tool` `rename_style` x3: `fk-dropdown` ->
   `fk-filter-dropdown`, `fk-dropdown-list` -> `fk-filter-dropdown-list`, `fk-dropdown-link` -> `fk-filter-dropdown-link`
   (read each first; a combo like `fk-dropdown-link w--current` has none registered). Read back the component tree,
   Blog, Categories template and Style guide for the new class names; update `webflow-ids.json`; no other change to
   the component (no label, same props: Label, Menu Label, Variant, Slot).
2. **Input Field fixes** (component `e7a87f07-0d64-7333-a929-de8fbcc186fc`): (a) rebind the label element's `text` (id
   `…186fc`/`4dc1e380-dd5b-66b3-4ac3-26a3d85b682d`) from prop Placeholder to prop **Label** (`af1dd1fa-…`);
   (b) `create_prop` boolean **Show Label** (default true) and bind the label's visibility to it (`set_visibility`
   binding; this replaces the existing conditional: ask the user first, it is theirs); (c) `set_settings` `attributes`
   `[{name_static: "aria-label", value_binding: {source_type: "prop", prop_id: <Label>}}]` on the input
   (`e7a87f07-…ff`): if rejected, STOP and ask; (d) the Placeholder prop has no consumer (no way to bind a placeholder):
   ask the user whether to remove it; type the placeholder in the Designer; (e) Style guide instance: ID stays
   `email-field`; add instances First name (Label "First name") and Last name (Show Label off).
3. **New `UI / Select Field`** (group UI): read first (`get_component`). Build the markup in a scratch Form Block (a
   Form Block Label needs a form parent), then `transform_element_to_component` the container, as with Input Field:
   `div.fk-input-container` > `label.fk-input-field-label` (for = the select's id) + `div.fk-input-field` >
   `select.fk-input-field-input.fk-input-field-select.w-select` (Form Select, name `Date`, options "Select one..."
   (empty value) + the sample dates; options are an element setting, check `get_settings` for the key, they can't
   bind) + `img.fk-input-field-icon` (chevron-down asset `6abc8bc8bb3a67906c34d4bf`, empty alt, Designer Image
   width/height 20 x 20, rule 15). New style `fk-input-field-select` (`appearance: none`, `cursor: pointer`,
   `text-overflow: ellipsis`; push with `scripts/webflow-css.mjs`; if `appearance` isn't a Webflow property, stop and
   ask). Props: Label (text), Show Label (boolean, visibility), ID (id, the select's domId + the same for the label's
   `for` if bindable); same `aria-label` test as step 2c. One Base variant (like Input Field). Insert one instance in the
   Style guide form (Label "Date").
4. **Style guide text**: intro paragraph of the Input field section and the Dropdown section heading and paragraph, as in
   `StyleGuidePage.tsx`.
5. **Variable**: if the user agrees, rename `space-4.5` -> `space-4-5` (update variable name).
6. Verify: `scripts/webflow-diff.mjs` (expect: `fk-input-field` padding/transition now equal; `fk-gap-4-5` repo-only;
   `fk-input-field-select` pushed), tree check of the three components, new dump + `webflow-snapshot.mjs` to rebuild the
   base, `sync-log.md` row, ask the user to set Image width/height (rule 15) on the new chevron.

## Phase 3 stage 1 progress (2026-10-13)

Offline, no Webflow call, no commit. Built by one Sonnet agent. Spec in [`../snapshot/README.md`](../snapshot/README.md)
("Map", "Map and diff scripts").

- **Built.** `scripts/webflow-map.mjs` (CLI), `scripts/webflow-tree-diff-ids.mjs` (CLI), `scripts/test-reconcile.mjs`
  (`node --test`; there is no test setup in the repo, so a plain Node runner outside `src/`, nothing lands in the
  Vite build), and the shared code in `scripts/reconcile/`: `jsx-trace/` (the JSX runtime used only by the map's own
  Vite server), `html.mjs` (markup parser and repo tree), `repo-render.mjs` (Vite SSR renderer), `align.mjs`
  (tree alignment), `mapper.mjs` (map entries and text / prop location), `locate.mjs` (string search by line),
  `snapshot-io.mjs`, `diff.mjs`, `paths.mjs`. `webflow-markup.mjs` and `webflow-tree-diff.mjs` are untouched (the
  3 old lint warnings in the latter stay).
- **How the map found the line (changes the "Mapping" decision above in one respect).** Instead of rendering and
  then searching the file for the n-th occurrence of a string, the render itself says where each element was written:
  the Vite dev JSX transform passes `source` (file, line, column) to `jsxDEV`, and a replacement runtime
  (`jsx-trace`) adds it to host elements as `data-src` and wraps every function component in an `<x-comp>` element with
  its call site and primitive props. So a host element and a component instance map to an exact `file:line:col`, and a
  text maps to the nearest hit of its string at or after that line (prop strings: at the call site that passes them).
  Order-and-text alignment still builds the id correspondence (as planned); it is a sequence alignment over children
  (score by tag, classes, text), not the strict positional walk of `webflow-tree-diff.mjs`, and it opens up an
  unmatched wrapper on either side to match the children (Collection List, `w-form` blocks, section components
  that are plain markup on Webflow). This also removed the need to collapse Nav / Footer / Stat / link nodes by hand:
  a component is an instance only when the Webflow component has that name (`Nav`, `Footer`, `Button`, `Stat`...);
  every other repo component is transparent, and a Webflow component rendered as plain markup (Input Field in the
  style guide, D-67) opens up too.
- **Coverage (baseline, repo 831b811):** 2,390 of 2,486 Webflow elements (96.1%); whitespace-only strings are not
  counted. 100% on About, Candidates, Facility partners, Privacy, Terms, Thank you, 404 and on 15 of 18
  components; Home 440/446; Blog 36/49 and Categories template 36/49 (Collection List empty state with its panel, a
  visually-hidden pagination label, the Pagination Next arrow); Posts template 65/79 (the Collection empty state,
  spans around the read time and date); Style guide 53/98 (five Input / Select Field template instances that are
  plain markup in the repo, a form, three blocks); Featured post 22/25, Newsletter form 11/12, Post card 13/14 (a
  decorative span, an icon image, empty states). Text entries: 467; 322 `literal`, 136 `data` (strings that live in
  `src/content/*.json` or `legal.ts`), 2 `partial`, 7 `manual` (text built from parts: `"{n} min read"`, the
  `about {name}` aria text; the CMS-bound dates), plus 39 `textBound` (element bound to a prop or field). Instance
  props: 229 (51 at the call site, 98 literal elsewhere, 1 data, 23 component defaults, 56 `manual`: CMS-bound Post Card
  props, Quote Card `Image` asset ids, Stat `Suffix`, which is a one-character string).
- **Spot-check.** `test-reconcile.mjs` prints 10 evenly spaced text entries with the line they resolve to (all
  `ok`), and a one-off check of all 467 text entries found 7 not at their line, exactly the 7 `manual`.
  The Pricing "Why is Flint free?" id resolves to `src/sections/Pricing.tsx:44`.
- **Diff test (a).** Dumps `20261011T194658Z` and `20261011T223401Z` normalised to scratch folders: all 10
  changes of step (d) found with the right ids and values (Home text, the Facility partners class, `space-4.5`
  added 18 px, `.fk-input-field` padding-top / padding-bottom and the removed transition, `.fk-input-container` and
  `.fk-input-field-label` added, the Input Field props / tree, the Newsletter Form component, the Newsletter and
  Posts template instances, the Style guide `ID`). 43 change objects belong to them and 8 more are explainable: the 5 page `lastUpdated` signals and `siteLastUpdated`, the CMS field
  schemas that only the second dump has, and the manifest `gaps` text. Nothing unexplained; the Blog page, whose
  `lastUpdated` moved with an unchanged tree, shows only as a signal. Base vs itself: 0 changes. A synthetic edit
  of the About page (text edit, removed and added element, a swap, a re-created text run) is reported as text /
  removed / added / moved / one `text` change with `idChanged`.
- **Failure modes seen (stage 2 has to handle them).**
  1. A text or bound text with no literal (`manual`): show old / new and the element's `file:line` only.
  2. Several hits of one string: the entry carries `occ`, `of` and `alts`; the report must show them.
  3. An `inst` prop with `locate: "default"` means the repo does not pass it: the edit is the default in the
     component file, but it changes every instance that relies on it.
  4. `textBound` elements: a text edit on Webflow cannot happen on them (the value is on the instance); an
     instance prop change maps through `inst.props`.
  5. Unmapped groups and `repoOnly` lists are normal on the Collection List / form / pagination pages; an id
     missing from the map is "added or moved on Webflow", never an error.
  6. Page `slug` in headers vs file slug: `where` uses the file slug (`page:home`, `page:template-posts`).
  7. The map is only valid for the repo commit in its header (`repoHead`, `srcDirty`); a repo that moved since needs
     the report to compare each mapped string with the current file (as planned) or to rebuild the map.
  8. Component maps are built from the best of up to 25 repo renders of that component; an edit on a component
     with text that differs between instances maps to the instance whose render matched best.
  9. A component the repo uses but Webflow does not have an instance of (and the reverse) shows up as `unmapped`
     (`instance without a repo component`: the style guide templates).
- **Not done / left.** `variantStyles` triples and the site instruction (dump gaps); the check that fails a sync
  writing an unlisted variant-style triple; the three-way logic, the report, `accepted.json` subtraction (stage 2);
  the apply and wire-in phases.

## Phase 3 stage 2 progress (2026-10-13)

Offline, no Webflow call, no commit, no report written to `docs/webflow/reconcile/`. Built by one Sonnet agent. Spec:
[`../snapshot/README.md`](../snapshot/README.md) → "Reconcile report".

- **Built.** `scripts/webflow-reconcile.mjs` (CLI: check and normalise the dump, diff, repo side, classify, write the
  markdown and, with `--json`, the rows) and in `scripts/reconcile/`: `rows.mjs` (the three-way compare and the proposed
  edits), `repo-state.mjs` (git at `repoCommit` vs the working tree, repo CSS as Webflow properties, tokens, a CSS
  declaration locator), `report.mjs` (markdown), `build-map.mjs` (the map builder, now shared: `webflow-map.mjs` is a thin CLI over it).
  Small changes to stage 1: `paths.mjs` honours `FLINT_ROOT` (so tests can point the tools at a scratch checkout),
  the map gets `rc` (repo classes, only when they differ from Webflow's) and `props.<name>.repoValue`, and the stored
  baseline map was regenerated to carry them. One run takes 0.5 to 2 s.
- **How the repo side is decided** (the "your call" of the brief). Not by git hunks mapped through line shifts, but
  by value: for each id the base repo value (the stored map: `repoText`, `rc`, `repoValue`, else Webflow's base value,
  which is what the repo equalled at `repoCommit`), the repo value now (the working tree rendered again and aligned
  with the base tree) and the new Webflow value. A second alignment against the new tree is a witness that the repo
  already has Webflow's classes, text or new element (CONFLICT becomes CONVERGED, an added element is CONVERGED).
  Reason: hunks give "something near this line changed" with no value, no convergence test and no conflict value, and
  they break when the edit moves the line; the render gives the value and the current `file:line`, and it costs about a
  second. When `src/` is unchanged since `repoCommit` nothing is rendered and the stored map is used (validity is
  `git diff <repoCommit> -- src`, not commit equality: `HEAD` moves for docs and scripts). CSS: `src/styles` at the commit
  (`git archive`, run through that commit's own style-actions script) vs now, per selector, breakpoint, state and
  property, with `webflow-diff.mjs`'s normalisation; tokens: `tokens.css` both states.
- **Tests** (`node --test scripts/test-reconcile.mjs`, 8 tests, 9 s, scratch only, worktrees removed): (a) historical
  three-way, base = dump `20261011T194658Z` at 68829d4 (a scratch `git worktree` of 68829d4 builds its map), new = dump
  `20261011T223401Z`, repo = working tree now; (b) the current baseline against its own dump: 0 rows of any kind
  (`src/` unchanged since 831b811); (c) synthetic edits on a copy of the baseline plus edits in a scratch worktree of
  HEAD: PULL x4 (class, style value, variable, instance prop; the first, second and fourth are `auto` with
  the right `file:line`), CONFLICT x1 (Pricing text edited differently on both sides, repo value shown), CONVERGED x2 (a
  text and `radius-lg`), REPO AHEAD x1 (`radius-xl` only in the repo); the same inputs give a byte-identical report; an
  incomplete dump is refused with exit code 2.
- **Historical run (a), 40 rows: PULL 10, CONFLICT 2, CONVERGED 17, REPO AHEAD 11.** CONVERGED (17): the Home title,
  `space-4.5`, the `.fk-input-field` padding pair, the new `.fk-input-container` and `.fk-input-field-label`, the Newsletter
  Form component and its instances (Newsletter, Posts template), the Input Field rebuild (label and field div added,
  button label and `is-action` gone, props renamed/added): all pulled by commit b631643. PULL (10), all explainable:
  the Facility partners `fk-bg-white` → `fk-bg-brand` and the removed `.fk-input-field` transition are Webflow edits the
  user decided not to keep (restored on Webflow in the reconcile push), so the repo never took them; `attr.autocomplete`
  and `attr.id` removed from the Input Field text input (the rebuild; the repo still sets `autoComplete` for type email
  and takes `id` from the ID prop: not resolved here, check); the two `moved` rows (input and icon into the new field
  div, repo already so but moves are never compared); `removed` Newsletter form in the Newsletter component and the Posts
  template (replaced by the Newsletter Form instance: the repo has it, but against the old base tree the alignment still
  finds the old form wrapper inside `NewsletterForm.tsx`); `prop.ID` on the Style guide Input Field (plain markup in
  the repo since D-67, so no mapping: edit by hand); the prop rename `Label` → `Placeholder` (the repo has since
  dropped that Webflow-side name: superseded by later work). CONFLICT (2): the Input Field `description` and a prop
  `default` (`Subscribe` → `Email`): the component file changed in the repo and these fields are only compared by file
  change, so they err towards CONFLICT. REPO AHEAD (11): the Dropdown → Filter Dropdown rename (three removed styles,
  four new ones, two Style guide texts, the second of which the alignment pairs with the wrong Webflow element
  because the base map of that page was already off by one section), `.fk-gap-4-5` and `.fk-input-field-select`.
- **Known gaps for stage 3 and phase 4.** (1) Moves are never compared on the repo side; element fields beyond text,
  classes and instance props (`attr.*`, `settings.*`, type, slots) are PULL with a note after a `src/` change.
  (2) An alignment lost after a restructure (Input Field, Newsletter) can show as PULL / CONFLICT for what is converged,
  and as REPO AHEAD with the wrong Webflow pairing; the rows say where, review them. (3) REPO AHEAD enumerates styles,
  tokens and mapped element text / classes / instance props only; repo-only component, page, interaction and custom-code
  changes are not listed. (4) Component meta, page settings, interactions, assets and site rows use presence or
  file-change heuristics and mark `assisted`. (5) Custom code is matched to `docs/webflow/custom-code/*` by hash or
  containment; a block with no match says so. (6) The `--json` file is working data for the apply phase; whether to
  commit it (or gitignore `docs/webflow/reconcile/*.json`) is open. (7) Still open from before: `variantStyles` and
  the site instruction in the dump, and the check that fails a sync writing an unlisted variant-style triple.

## Phase 3 stage 3 part A progress (2026-10-13)

Offline, no Webflow call, no commit. Built by one Sonnet agent. Spec: [`../snapshot/README.md`](../snapshot/README.md) → "Reconcile
report" and "Map" (`ra`).

- **Built.** (1) Moves compared three-way (`rows.mjs` `moveRow`, `structure.mjs`): the repo parent and order of every mapped id
  come from the order paths of the maps; the repo base, the repo now and the repo against the NEW tree are compared with
  the Webflow base to new move. A Webflow-only move is PULL (assisted) with the `file:line` of the element and of its new
  neighbour; the repo already in the new place is CONVERGED; a move caused by an add (into a new wrapper) or a remove is
  folded into that add / remove. (2) Restructure: two or more adds / removes / moves under one parent are one
  `restructure` row (`members` listed, direction aggregated); removed elements are recognised as gone from the repo
  through the repo-only nodes of the new-tree alignment (`repoOnly` now has `cls` and `path`); text, class and prop rows read
  what the repo has now from the new-tree alignment first; instance props the base lacks (the Style guide `ID`) use it too.
  A bound `id` / `for` (component with an ID prop) is not a change. A prop `default` is compared with the repo prop's
  default parameter, and a description equal to the sync pattern (`<Group> / <Name>. Repo: <file>`) is CONVERGED.
  (3) Attributes and settings (`fields.mjs`): `attr.*` and `settings.link|altText|assetId|input` are compared by value;
  the map carries `ra` (where the repo render differs from Webflow). (4) REPO AHEAD for component props / variants and
  component files, page sections (added, removed, reordered), interaction registry rows and `src/ix` runtime files, custom-code
  sources. (5) A "Pre-existing differences" section (`footer.preexisting`, `accepted.json` `element` to silence a line); the
  repo-ahead text rows now use the new-tree alignment and drop a pair that shares no word with the Webflow text to the footer
  (`misaligned`). The alignment prefers a link with the same target (the footer lists many links with the same classes).
- **Historical run (a), before to after** (dumps 2026-10-11 against the repo now): 40 rows, PULL 10 / CONFLICT 2 /
  CONVERGED 17 / REPO AHEAD 11 became 40 rows, **PULL 5 / CONFLICT 0 / CONVERGED 16 / REPO AHEAD 19**. Gone as PULL:
  the `attr.id` row (bound to the ID prop, footer), the two `moved` rows (folded into the restructure), the two
  `removed` Newsletter forms (restructure rows, CONVERGED, one per Newsletter component and Posts template, with the added
  Newsletter Form instance), the Style guide texts (two footer "misaligned" lines instead of two wrong REPO AHEAD pairs). Gone as
  CONFLICT: the Input Field description (equal to the sync pattern) and the prop default `Subscribe` to `Email` (the repo default
  is `Email`). The three restructure rows replace eight add / remove rows (and two move rows). **Left as PULL (5):** the Facility partners
  `fk-bg-white` to `fk-bg-brand` and the removed `.fk-input-field` transition (Webflow edits the user decided not to keep,
  restored on Webflow in the reconcile push, so the repo never took them); `attr.autocomplete` removed from the Input Field input
  (a real Webflow-side removal in that window: the repo keeps `autoComplete` for email; in the current baseline the same
  gap is a **pre-existing difference**, listed once in the footer); the Style guide Input Field `ID` override (an
  instance the repo renders as plain markup since D-67, no mapping: edit by hand); the prop rename `Label` to
  `Placeholder` (the repo has both props; superseded by later Webflow work). **REPO AHEAD (19)** grew by the new
  coverage: one prop removed (`icon`), the new `SelectField` component file, seven Style guide page-section changes and the
  `dropdown.ts` preview runtime, besides the nine style rows of before.
- **Current baseline.** Against its own dump: 0 rows; 77 pre-existing differences, 21 of them the same attribute
  repeated (`data-tm-slide`, `data-how-*`: set by the page scripts, absent in the render), the Input Field `autocomplete`
  once, the footer links (the repo and Webflow point two of them at different pages), the `fk-stat is-default` classes.
- **Tests.** `node --test scripts/test-reconcile.mjs`: 14 tests (8 before): the historical run asserts the breakdown above;
  new: moves (Webflow-only reorder, move to another parent, repo already in the new order), a restructure with an absorbed
  move, attributes (link target, image alt PULL auto, alt CONVERGED in a scratch checkout), repo ahead (component prop and
  variant, page section, interaction row, custom code, in a scratch checkout), pre-existing differences listed once. All pass;
  the baseline against its own dump stays at 0 rows.
- **Known limits left.** (1) The alignment still pairs wrongly on a page rewritten in the repo (the Style guide): the
  footer lists dropped text pairs, and a few pre-existing differences there are artifacts. (2) An instance the repo renders
  as plain markup has no prop entry. (3) Component meta other than description and prop default, page settings, assets and
  site rows keep their presence / file-change heuristics. (4) The `removed` test cannot tell a removed element from one the
  alignment paired with another. (5) The `--json` file is still working data for the apply phase (commit or ignore: open).
  (6) `variantStyles`, the site instruction and the unlisted-variant-style check: still open. (7) Part B left: wire the
  report into the gate (phase 5) and the apply workflow (phase 4).

## Phase 3 stage 3 part B progress and "Phase 3 done" (2026-10-13)

Offline, no Webflow MCP call, no commit, nothing applied to `src/`. Decisions taken while the user slept, all recorded here.

- **Noise triage (77 pre-existing differences to 53).** Each group was checked against the repo, `interactions.md`, the skill and the
  published staging HTML (curl, not the MCP). **By design, accepted in `accepted.json` `element`** (8 regex patterns, 12 elements,
  with the reason): `UI / Button` Secondary, the five `UI / Stat` `is-default` combos and the `UI / Page Hero` Half Screen classes
  (component variants carry their own overrides on Webflow); the Filter Dropdown `aria-expanded` (webflow.js writes it) and the list
  `aria-label` (bound to the Menu Label prop, present on staging); the Facility partners hero `tabindex` and `fk-block fk-object-cover`
  (native Background Video wrapper); the Nav skip link `href="#main"` (a tree-read gap, the published HTML has it). **Unaligned**
  (new `accepted.json` list): `page:style-guide`, 12 differences that are alignment artifacts (the Webflow page is a partial build, the
  repo page has many more sections, so Filter Dropdown attributes pair with Form messages and utility wrappers pair by position).
  Improving the alignment was not cheap (the pages share too little); the footer counts them with a clear "not listed" note.
  **Real drift, kept listed (53 elements, 10 table rows):** footer links `For nurses` / `For facilities` (repo stale), `Webinars`
  anchor and the Home `id="webinars"` (Webflow ahead), 45 stale IX3 carousel attributes (`data-tm-slide` x21, `data-how-*` x12,
  `data-dot-*` x12: **not** runtime-set, the interactions that used them were deleted for `x-carousel`, D-37), Newsletter message
  `role`s (known MCP limit), Quote Card `draggable`, Input Field `autocomplete`. The user's triage list is the report's `## Summary`.
- **Format changes.** `accepted.json` `element` entries take `pattern` (regex over the acceptLine) besides `line`; new `unaligned`
  list (`where`, `reason`); `--summary <file.md>` on the CLI inserts a hand-written summary under the report title. All in
  `scripts/webflow-reconcile.mjs`, `rows.mjs` (`preexisting`), `report.mjs`; documented in the snapshot README.
- **First real run** (`docs/webflow/reconcile/2026-10-13.md` + `.json` + `.summary.md`): base dump 20261013T023829Z (`831b811`), new dump
  20261013T060458Z. **0 rows** (PULL 0, CONFLICT 0, CONVERGED 0, REPO AHEAD 0), which is correct: every dump file other than the two
  site signals files is byte-identical to the base apart from the dump envelope `label` (the user's publish at 03:32Z moved
  `siteLastPublished` / `siteLastUpdated`; the `_w-select` deletion was before the baseline), and `src/` is unchanged since `831b811`.
  The "4-byte smaller blog tree": the raw `tree-blog.json` differs only in the envelope's `label`; the normalised `pages/blog.json` is
  byte-identical (10,122 bytes both). No tool artifact was found in the run, so no tool fix was needed beyond the format additions.
  The `.json` is committed with the report (small when there are no rows); the bigger-run policy stays open.
- **Tests.** `node --test scripts/test-reconcile.mjs`: 15 tests (14 before), all pass; the new one asserts the patterns and the
  unaligned page leave the real drift listed and that `--summary` lands under the title.
- **Phase 3 done.** Tools: `webflow-snapshot.mjs` (normalise, check, rebuild), `webflow-map.mjs` and `reconcile/build-map.mjs`
  (element-id map), `webflow-tree-diff-ids.mjs` (id diff), `webflow-reconcile.mjs` with `reconcile/*` (three-way rows, moves,
  restructure, attributes, repo-ahead coverage, pre-existing differences, report). Left for later: the apply workflow (phase 4), the
  gate and skill wiring (phase 5), the contract (phase 6), the variant-style triple check, the `variantStyles` and site-instruction dump
  gaps, and whether `docs/webflow/reconcile/*.json` stays committed. The user triages the drift list (above) before the next sync
  stage; decisions 1, 2, 5 and 6 of that list are one-line repo edits or `set_attributes` calls, 3 is a deletion of attributes on
  Webflow (rule 12: confirm first), 4 is a Designer to-do.

## Phase 4 done: apply and partial refresh (2026-10-13)

Offline, no Webflow MCP call, no commit, nothing applied to the real `src/` (the report `2026-10-13` has 0 rows). Built by one Sonnet agent
while the user slept; the decisions below are its own and stand until the user says otherwise. Spec:
[`../snapshot/README.md`](../snapshot/README.md) → "Apply and refresh".

- **Built.** `scripts/webflow-reconcile-apply.mjs` (CLI), `scripts/reconcile/apply.mjs` (row handlers and the agent's task text),
  `edit-ops.mjs` (pure text, CSS and token edits with guards, and the in-memory `Workspace` with `diff -u`), `refresh.mjs` (the partial
  refresh, also behind `webflow-snapshot.mjs --refresh`), `applied.mjs` (the `## Applied` record), `rowspec.mjs` (`--rows`). Changes to
  phase 3: `rows.mjs` marks a new class (`add-rule`) and a new Color / Size token (`add-token`) `auto`, counts Webflow's grid defaults as
  equal when a new style is compared, and puts the raw value (not the lower-cased one) into `add-rule`; `webflow-reconcile.mjs` records
  `meta.new.input` and lays `manifest.repoBase` over the repo-at-commit CSS and tokens; `repo-state.mjs` has `applyRepoBase`.
- **Which rows are auto, which go to the agent.** Applied by the script when the row is a PULL marked `auto` and its guard holds: text
  (JSX text, attribute, JS string, JSON value, escaped for the context), one class swapped for one other, a string instance prop or
  attribute or alt, CSS `set-declaration` / `remove-declaration` (one-line) / `add-declaration` (rule with one selector), `add-rule`
  into the class family's file, `set-token` (also the `tokens.md` value cell), `add-token` (also the id in `webflow-ids.json`;
  `gen-utilities.mjs` runs for a `space-*` token). Everything else is printed as a task and the exit code is 3: structure
  (add / remove / move / restructure), components, props, variants, pages, interactions, assets, site and CMS, custom code, shorthands,
  multi-line values, `utilities.css`, "snap to token" rows (rule 2: ask), and every CONFLICT (the script never picks a side). A task has
  `file:line`, old to new, what to do and the contract reminders; generated files are never edited, the task names the source and the
  generator. Rows with a follow-up (class registry row, `tokens.md` row) apply and still exit 3.
- **Guards.** The old value must be on the recorded line exactly once (text and classes also: exactly once in the file when another row
  moved it); a CSS declaration must still be a one-line declaration with the expected value. A failed guard is a task, not an error. The
  guard earned its keep in the first test run: the report marks every `attr` instance prop `auto`, including `label={buttonLabel}` which
  is not a literal.
- **Build and lint.** The apply script does not run them by default (`--build` does, exit 4 on failure): the agent still edits the
  task-list rows after it, so they run once at the end (workflow step 6). Justification: build is about 10 s and lint is quick, but running
  them between the two halves of the same change proves nothing.
- **Validity after a partial refresh (the sound option).** `repoCommit` does not move. Moving it would hide the repo's other changes (the
  commit has to be the one the *whole* base matched), and the applied edits may be uncommitted. Instead the repo side of an absorbed item
  is the value that was applied: `manifest.repoBase` (styles, tokens) laid over the values read from `repoCommit`, and the updated `map/`
  entries (text, classes, props, attributes); other items need nothing because the new base equals Webflow. A later Webflow edit of an
  absorbed item is a plain PULL (tested), committing the applied edits changes nothing, and a full rebuild at the next sync (after the
  commit) sets `repoCommit` to HEAD and clears `refreshedRows` / `repoBase`. Considered and rejected: a per-item repo commit (the repo
  value of an uncommitted edit has no commit) and requiring a commit before the refresh (the user commits when they ask).
- **Refresh verifies first.** `webflow-snapshot.mjs --refresh` re-runs the reconcile against the same dump and refuses (exit 3) a row that is
  still PULL or CONFLICT, so the base can't claim a value the repo doesn't have. `--force` / `--no-verify` exist; the skill says not to use
  them without telling the user. Repo-ahead rows are skipped. Signals follow: a page's or interaction's signal takes the new dump's value
  when its file now equals the new one, all of them when the whole base does.
- **Agent workflow.** A separate skill, [`flint-reconcile`](../../../.agents/skills/flint-reconcile/SKILL.md) (symlinked in `.claude/skills`;
  phase 5 adds the `/reconcile` entry point and the gate to it), plus a pointer row in `flint-webflow-sync`. Flow: dump, report, user
  approves rows, apply (dry run first), agent edits the tasks under the contract, build and lint, refresh, the report's `## Applied`
  section (sidecar `<report>.applied.json`), commit only when asked (`--record-commit` notes the hash).
- **Tests** (`node --test scripts/test-reconcile.mjs`, 20 tests, about 40 s, 5 new; scratch checkouts via `git worktree`, removed at the
  end): pure edit ops and `--rows` parsing; 8 mechanical rows applied (text, class, style value, removed declaration, new class, token
  value, new token, string prop), exactly the expected files changed, the generator ran, the multi-line `transition` stayed a task, a dry
  run writes nothing, a second reconcile shows the applied rows CONVERGED, the refresh changes only the targeted base items (styles
  `.fk-input-container`, `.fk-input-field-hint`, `.fk-input-field-label`; variables `color-brand`, `space-9`; the unapproved About text
  untouched), the same rows gone afterwards, a later Webflow edit of an absorbed item a PULL, applying again a no-op; a failed guard, a
  CONFLICT and an assisted move become tasks with exit 3 and no file touched, a stale report is refused; a structural row is refused by
  the refresh until the repo has it, then refreshed through `webflow-snapshot.mjs --refresh` and the base page equals the new one; the
  data layer (restructure with an absorbed move, a re-created text run, a link, page SEO, an asset alt, a component description, a site
  setting) lands in the base with `--no-verify`, the base then equals the new dump (signals included) and a reconcile has nothing left.
- **Known limits.** (1) The map gets no entry for elements a refresh adds or moves. (2) Agent-resolved structure leaves REPO AHEAD rows for
  component files and page sections until the next rebuild. (3) `add-token` needs a Color or Size and leaves the `tokens.md` row to the
  agent. (4) The refresh trusts the reconcile's CONVERGED for assisted rows. (5) Text in a JSX expression, a template string with `${}`
  and strings that wrap over lines are tasks. (6) Open from phase 3: whether `docs/webflow/reconcile/*.json` is committed (it is
  gitignored now, with the new `*.applied.json`), `variantStyles`, the site instruction.

## Phases 5 and 6 done: wire in and contract (2026-10-13)

Offline, no Webflow call (no write, no read), no commit. Built by one Sonnet agent while the user slept; the decisions are its own and stand until the user says otherwise. Spec: [`../snapshot/README.md`](../snapshot/README.md) → "The gate: a partial dump".

- **Gate dump design.** `scripts/webflow-gate.mjs` (CLI) over `scripts/reconcile/gate.mjs`. The dump agent saves the five quick-check reads (`site-before`, `pages-before`, `interactions`, `cms-collections`, `registered-scripts`) in a new folder; `--plan <dir>` compares them with `manifest.signals` and prints the other reads; `--compose <dir>` verifies them, merges them with the unchanged files of the base's raw dump (`manifest.dump`, hashed against `manifest.rawDump`) into a complete dump, runs `webflow-snapshot.mjs --check`, and the normal reconcile runs on that. Decisions: (1) a new script, not a flag on `webflow-snapshot.mjs`, because the snapshot script is a one-dump normaliser with no knowledge of the base; (2) per-item files (`page-code.json`, `interactions-full.json`, `cms-details.json`) hold only the entries that moved and are merged by page / interaction / collection id; trees are whole files per page; (3) a complete dump is the output, so reconcile, `--refresh` and `--rebuild` need no change and a rebuilt base's `manifest.dump` is a full folder; (4) styles, components, component trees and variables are always re-read (no timestamp), `variable-collections.json` is taken from the base; (5) `siteLastUpdated` / `siteLastPublished` moving (any page save or publish) re-reads site code, fonts and assets, because assets and fonts have no timestamp of their own; (6) a full dump is required (exit 3, with the reason) when there is no base, the raw dump folder is gone or a file in it no longer matches its hash, the base was partially refreshed (its raw dump no longer equals the base state), or `get_site` returns another site.
- **Cost.** 11 calls when nothing moved (5 signals, 4 always, 2 end checks), about 1 MB; +2 per moved page (tree, code), +2 when any page moved (schema, sitemap), +1 per changed interaction batch and collection batch, +4 after a publish or any page save (site code, fonts, 2 asset pages). One page edit with its publish is about 20 calls, against 58. The earlier estimate of about 8 calls left out the two end-of-dump checks and the component-meta call; those are needed to detect an edit during the dump. Accepted gap: an asset or font changed with no site timestamp moving is not seen by a partial dump.
- **Tests.** `node --test scripts/test-reconcile.mjs`: 23 tests (20 before, 3 `gate:`), all pass. They use dump `20261013T023829Z` as the base and synthetic changes to its own files, so they do not depend on today's base: nothing moved (the composed dump normalises byte for byte to the full dump), a moved page plus a changed interaction plus a publish (exact read list, missing reads named with exit 2 and nothing written, merge of page code and interactions, the reconcile on the composed dump shows the edited text), and every full-dump case (no base, raw dump gone, hash changed, partial refresh, empty folder lists the five signals, an edit during the dump exits 1). Also run by hand against the real dump `20261013T060458Z` (a publish moved the site signals): the composed dump normalises to the same files as the full one.
- **Wired in.** `flint-reconcile` skill: description now triggers on "reconcile" / "/reconcile", the gate and the sync-end refresh; new "Run a reconcile" recipe with the dump-agent brief (Sonnet, low effort, force results to files, print counts only), "Gate" and "Refresh at the end of every sync" sections. `flint-webflow-sync` skill: step 6 of "Before the first call" is the gate, new "After the last write" closing section is the refresh, a pitfalls-table row records the gate recipe. `mcp-playbook.md`: "Gate first" paragraph, the order table gets step 11 "Refresh the base" and 12 "Publish" with its gate, and "Pulling Designer edits back" now points to the reconcile. `AGENTS.md` 1.14: header, registry table (`snapshot/`, `reconcile/`), §1, rule 11, §7 steps 4, 7 and 8, definition of done. `/safe-publish` is a plugin skill and is not edited: the gate sits in our docs and runs before it is invoked.
- **Decisions.** (1) The refresh is a full rebuild from a dump taken after the last write and after the commit (`--rebuild --yes --commit HEAD`, then `webflow-map.mjs`), not a partial refresh: it also clears `refreshedRows` / `repoBase` and makes `repoCommit` the commit that matched. The reconcile is run on that dump first so someone else's edit meanwhile is shown to the user before it is absorbed. (2) The gate runs once per sync when stages run back to back and nobody else edits; a long gap or an unsupervised stage runs it again. (3) Read-only stages (diff, audit) skip the gate. (4) During a pending partial refresh the gate asks for a full dump. (5) In AGENTS.md §7 the refresh is part of step 7 and publish stays step 8, so no step number moves. (6) D-66 is recorded in `roadmap.md` (index) and `archive/decisions.md` (full text); the "reserved" wording in D-67 was updated.
- **Things found.** The Style guide text on both sides cites "roadmap D-66" for the form-fields rule, written while D-66 was reserved; it is D-67 (and the sentence says four fields where the page shows three). Not changed (it would make `src/` differ from the base); noted in `components.md` and the handoff. `components.md` Style guide row now describes the Webflow page (Buttons, Filter dropdown, Input field, Templates, Post card, then Section / Newsletter) against the larger repo page.
- **Open.** (1) **Site instruction:** the Webflow site instruction `rules/flint-contract.md` mirrors the contract and still says 1.13: it was not written (Webflow write). To do in the next Webflow stage: `data_agent_instructions_tool` `update_instruction`, add one line on contract 1.14 (Designer edits are allowed and pulled back through the reconcile; the gate before pushes) and bump its version; read it first (`search_instructions`). The site instruction is also still a dump gap (`manifest.gaps`). (2) `variantStyles` in the dump and the check that fails a sync writing a variant-style triple not listed in `components.md`: still open. (3) Whether the `docs/webflow/reconcile/*.json` stays ignored: it is ignored (`.gitignore`), reports `.md` are committed. (4) The reconcile has only seen one real run (0 rows); the first run with real PULL rows will test the apply path on live data.

## Phases (revised)

Agent stages follow the memory rule: one Sonnet agent per stage, the orchestrator confirms
between stages.

| # | Phase | Work | MCP calls | Agent stages | Effort | Risks |
| --- | --- | --- | --- | --- | --- | --- |
| 2 | **Baseline** (done: a to d 2026-10-11, retaken 2026-10-13) | (a) a Sonnet agent at low effort runs the full dump (58 calls) into `.cache/webflow-dump/<UTC timestamp>/` while nobody edits the Designer, prints counts, and a script checks them against the expected totals (repeat if the check fails); (b) Sonnet writes `scripts/webflow-snapshot.mjs` (normaliser, no MCP, with the `--rebuild` command), generates `data/` with the repo commit hash in `manifest.json`, runs `webflow-diff.mjs` and `webflow-tree-diff.mjs` to record the 10 known differences, and scans the dump for keys and secrets; (c) the user makes one unpublished Designer text edit plus reversible edits to a style, a component and a variable; (d) readback: which reads show the edits, which timestamps move; the user reverts. `.gitignore` already has `.cache/` and `data/`; nothing in `data/` is committed | about 58 + 6 for the tests | 3 (Sonnet low-effort dump; Sonnet script and snapshot; Sonnet readback) | 1 to 1.5 days | the repo and Webflow differ in a few known places (10 style lines, Nav / Footer expansions): baseline records them as accepted; an edit by the marketing team during the dump gives a mixed baseline, so run it right after a sync and compare the page `lastUpdated` signals before and after; the dump may hold secrets (scan before keeping it) |
| 3 | **Report** (stage 1, map and id diff, done 2026-10-13; stage 2, three-way rows and report, done 2026-10-13; stage 3 part A, moves, restructure, attributes, repo-ahead coverage, done 2026-10-13; part B, noise triage and the first real run, done 2026-10-13; phase 3 done) | `scripts/webflow-reconcile.mjs` (id diff, three-way compare, string locator, changes report), `scripts/webflow-map.mjs`, extend the tree diff for Nav / Footer / Stat / links; the base-vs-repo column reads the changes since the commit in `manifest.json` plus the working tree; the check that fails if a sync writes a variant-style triple not listed in `components.md`; the routine gate dump (about 8 calls) runs on Sonnet at low effort with a count check, all interpretation on Sonnet; unit tests on saved dumps (edit a copy of a dump to simulate a text edit, an add, a move, a style change) | 8 (quick check) to 58 per run | 3 (map and tree diff; styles, variables, settings; report writer) | 3 to 4 days | text built from parts; stale map; the read gaps above (variant overrides, alt inherit); the first real Designer edit may show id behaviour not seen yet |
| 4 | **Apply** (done 2026-10-13, see "Phase 4 done") | agent workflow: read the approved rows, edit the files, run `npm run build` and `npm run lint`, refresh the snapshot for exactly what was applied, rewrite the map entries; no commit (the manifest commit hash moves to the new repo commit at the next sync, once the applied edits are committed) | 0 to 12 (re-read of what changed) | 2 | 1.5 days | applying a Webflow style value that breaks the token rule: the row says "snap to token" and the agent asks; generated files (utilities, x-* scripts) are resolved in the source |
| 5 | **Wire in** (done 2026-10-13, see "Phases 5 and 6 done") | `/reconcile` skill or a section of `flint-webflow-sync`; gate at the start of every sync stage and `/safe-publish`: run the quick check, full compare only when a signal moved or the styles / components / variables hash moved; refresh the snapshot at the end of each sync, recording the repo commit it matched | 8 per gate | 1 | 1 day | the gate adds about 8 calls and 6k tokens to every stage; a stage agent must not push while the report has open rows |
| 6 | **Contract** (done 2026-10-13: contract 1.14, D-66; the site instruction is a to-do) | amend AGENTS.md (§1 "mirrored back", rule 11, §7 workflow), `mcp-playbook.md` pulling section replaced by the reconcile, `sync-log.md` row, record D-66 | 0 | 1 | 0.5 day | none |

Total: about 7 to 9 working days of agent and review time. A routine run once built: about 8 MCP
calls, 3 files read from disk, one report; the user's review is the slow step.

## Risks of the local-only base

- **The base exists on one machine only.** `data/` is not committed. A new clone, a cloud session or
  a lost disk has no base until `--rebuild` creates one.
- **Rebuilding resets the base.** The rebuild command must warn plainly before it runs: any Webflow
  edit made since the last sync is absorbed silently instead of reported. Run a reconcile first if
  the old base still exists.
- **The changes report is the only record of what changed between syncs.** There is no snapshot
  history in git. The reports in `docs/webflow/reconcile/` are committed (decision 9).
- **The manifest commit must stay reachable.** If it is rebased away or garbage-collected, "repo
  changes since base" cannot be computed; the report says so and asks for a rebuild.
- **Uncommitted working-tree changes** count as repo changes since the base, so the report is only
  as precise as the working tree is clean.

## Open points

All five questions from phase 1 are **resolved** (user decisions 2026-10-11, above):

- Mapping: **resolved** (ids plus a sync-time map).
- Dump cost: **resolved** (58 calls, 1.6 MB, 8-call routine run; the quick check cannot see styles,
  components, variants or variables).
- Unpublished edits: inferred visible; phase 2 steps (c) and (d) confirm it with one real edit.
- Question 1, alt text inherit / decorative gap: **resolved**, accepted in routine runs.
- Question 2, variant overrides only for the listed triples: **resolved**, accepted, with a
  sync-time check.
- Question 3, `.cache/` gitignore entry: **resolved**, approved and added (with
  `docs/webflow/snapshot/data/`).
- Question 4, file layout and size: **resolved**, layout approved; the data is not committed, so
  there is no committed size.
- Question 5, base-vs-repo without a committed snapshot: **resolved**, the repo commit hash in
  `manifest.json` replaces git history.
- Conflicts on generated files (custom code, utilities, schema): always resolved in the source
  (unchanged).

## Refresh 2026-10-14 (the convergence fix)

After the 2026-10-13 sync the reconcile of dump 20261014T023751Z gave 50 PULL rows that were all the sync's own writes where the repo
already had the new value (4 attributes Webflow now matches, 45 `data-*` attributes removed that the repo never rendered, one re-created
Style guide text run). Cause: `direction()` returned PULL whenever the repo had not changed since the base, even when its value already equalled
the new Webflow value (a pre-existing difference resolved on Webflow); unmapped re-created text runs were always PULL. Fixed in
`scripts/reconcile/rows.mjs` (converged wins; unmapped text runs are looked up by text in the page's source file) with two regression tests.
Re-run: 0 rows. Base rebuilt from that dump at 37d440f.

