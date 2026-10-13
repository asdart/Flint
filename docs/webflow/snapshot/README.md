# Webflow snapshot: format

**Status:** format from reconcile phase 1 (2026-10-10), updated with the user's decisions of
2026-10-11 and with what `scripts/webflow-snapshot.mjs` actually writes (reconcile phase 2 step b,
2026-10-11, baseline dump `20261011T194658Z`, repo commit `68829d4`). See
[`../plans/reconcile.md`](../plans/reconcile.md) for the plan and the measurements behind every
choice here.

The snapshot is a normalised copy of what the Webflow MCP returns for the production site, taken
right after a sync. It is the "base" of the three-way compare in the plan. It is never edited by
hand and never pushed to Webflow.

**Only this file and `accepted.json` are committed.** The data lives in `docs/webflow/snapshot/data/`,
which is gitignored, so the base exists on one machine only. `accepted.json` is a small curated list
of known repo-vs-Webflow differences (see "Accepted differences"); it is not Webflow state, so it
survives a rebuild and is shared. The changes reports (`docs/webflow/reconcile/<date>.md`) **are
committed** (user decision 2026-10-11): they are the lasting record of what changed between syncs. `data/manifest.json` records the repo commit
the snapshot matched; that commit, not git history of the snapshot, is the "base vs repo" side of
the compare. If `data/` is missing (new clone, cloud session, lost disk), see "Rebuilding the base".

## What it is built from

- Every read goes through the Webflow MCP data tools. They are headless: the Designer bridge is not
  needed (it was not connected during the measurements).
- The reads show the working copy of the site, not the published one (see "Unpublished edits" in
  the plan; verified by inference, to be confirmed by a real unpublished edit in phase 2).
- A raw dump is a set of saved MCP results. Raw dumps are cached in a gitignored folder.
  `scripts/webflow-snapshot.mjs` (built in phase 2) turns a raw dump into the files below. It is
  offline (no MCP), deterministic (no clock, no repo files read: two runs on one dump are
  byte-identical) and refuses an incomplete or inconsistent dump. See "Script".

## Layout

All paths below are inside `docs/webflow/snapshot/data/` (gitignored), except this README.

```text
docs/webflow/snapshot/
  README.md              this file (committed)
  accepted.json          known repo-vs-Webflow differences (committed, curated by hand)
  data/                  gitignored
  manifest.json          taken-at, repo commit matched, dump folder, site id, schema version, change signals,
                         counts, gaps, per-file sha256 and the sha256 of every raw dump file
  site.json              site settings, fonts, registered scripts, site-applied scripts, site head/footer code,
                         variable collections (site instruction meta: not in the dump yet, see "Gaps")
  variables.json         collection Flint: name -> id, type, value
  styles.jsonl           one line per style, sorted by selector
  tags are in styles.jsonl (type "tag": body, h1-h4, p, a, blockquote, img)
  components/<slug>.json one per component: meta, props, variants, definition tree
  pages/<slug>.json      one per page and template: settings, JSON-LD, scripts, head/footer
                         code, element tree (page instances carry their prop overrides)
  interactions/<name>.json  one per interaction, full triggers and timelines
  assets.json            id, displayName, contentType, altText, folderId, sorted by id
  cms.json               collections (id, name, slug) and fields (the field schemas from cms-collection-details.json or cms-details.json; null when the dump has neither); no items
  map/<slug>.json        element id -> repo location (written at sync time, see below)
```

`<slug>` is the Webflow page slug (`home` for the page without one, `about`, `blog`, `404`) or, for a
CMS template page, `template-<singular title word>` (`template-posts`, `template-authors`,
`template-categories`, the names the dump's `tree-<slug>.json` files carry); components use the name
in kebab-case (`page-hero`, `logo-marquee`). Page ids and component ids are inside the file.

## File formats

### Element trees (pages and components)

One element per line, flat, in document order, inside an `elements` array so the file stays valid
JSON and a plain `diff` shows one changed element per changed line. The file is `{`, one header
entry per line (`"key":value`), then `"elements":[` with one element per line, then `]` and `}`:

```json
{"id":"e09eaa98-a732-87f2-a0c3-bef0cdf54a5a","p":null,"t":"Block","c":["fk-page"],"s":{"tag":"div"}}
{"id":"1d040ccb-fe66-3add-5abc-659a94674f89","p":"e09eaa98-…-54a59","t":"Section","c":["fk-section","is-padded-bottom"],"s":{"tag":"section"}}
{"id":"…","p":"…","t":"String","x":"Thanks for applying!"}
{"id":"…","p":"…","t":"ComponentInstance","i":{"comp":"76881060-…","props":{"Title":"Thanks for applying!"},"slots":["Options"]}}
```

Keys: `id` (the Webflow element id, `id.element`), `p` parent id, `t` type, `c` class list in order
(`styleNames`), `s` settings that differ from the default, `a` attributes (`data-*`, `aria-*`,
`href`, `id`, `loading`), `x` text of a `String` node, `i` component instance (`comp` component id,
`name` its name for readability, `props` only the ones with `hasOverride: true` keyed by prop name,
`slots` names, both omitted when empty). `c`, `s`, `a` and `i.props` are omitted when empty. The
root is the `Body` element of a page (`p: null`) or the component's root element.

Rules:

- Key order is fixed: `id, p, t, c, s, a, x, i`. Inside `s`, `a` and `i.props`, keys are sorted.
- `id.component` is dropped (it is the page id or component id, already in the file header).
- Dropped as noise: `settings.visibility` when `true`, `settings.block` and `settings.dom` (they
  repeat `settings.tag`), `instanceDetails.props[].propId` (the component file has the ids),
  `hasOverride: false` props (defaults, owned by the component file).
- Kept even when empty-looking: `String` nodes of whitespace-only text (they are real nodes).
- Per-page header (first lines of the file, in this order): `pageId`, `file`, `title`, `slug` (the
  published slug, `""` for Home; a template's is `detail_<collection>`), `publishedPath`, `draft`,
  `archived`, `seo`, `openGraph`, `collectionId` (templates only), `includeInSitemap` (`null` for
  templates and utility pages: the sitemap tool does not list them), `jsonLd` (object form, `null`
  when none), `jsonLdRaw` (the string with CMS tokens, only when present), `scripts` (id, location,
  version, attributes when set; `[]` when the page has none, which the MCP reports as a 404),
  `head` / `footer` custom code (see "Custom code") and `headUnreadable: true` on a template
  whose JSON-LD holds CMS tokens.
- Component header: `id`, `name`, `group`, `description`, `props` (`id`, `name`, `type`, `default`),
  `variants` (`id`, `name`, `order` = list position; `isSelected` is dropped as Designer UI state).

### Styles

`styles.jsonl`, one line per style, sorted by `selector` (the full dotted chain, `.fk-button.is-secondary`; tag
styles use the bare tag):

```json
{"sel":".fk-button","type":"global","base":{"hover":{"color":"var(color-ink)"},"noPseudo":{"display":"inline-flex","padding-top":"var(space-2-5)"}},"bp":{"medium":{"noPseudo":{"padding-top":"var(space-2)"}}}}
```

- `base` holds the desktop (Webflow `main`) styles by pseudo-state, `bp` the `medium`, `small`,
  `tiny` overrides by pseudo-state. The `main` breakpoint is a copy of `base.noPseudo` in the MCP
  result and is dropped.
- Line key order: `sel`, `type` (`global`, `combo` or `tag`), `base`, `bp` (omitted when empty).
  Property keys and pseudo-state keys are sorted. A variable value is written `var(<variable name>)`
  (the MCP returns an id; the name comes from the same dump's `variables.json`, so an unknown id
  fails the check). A literal stays a string, exactly as returned.
- Styles with no properties anywhere (794 of 1,494 in the first measurement: empty combo chains
  that Webflow creates by itself, see the skill) are not stored. The count goes in the manifest.
- The style GUID is not stored: a style that is removed and created again gets a new GUID, and the
  selector is the identity the repo uses.
- Pseudo-states read: the list in `recipes.md` → Diff. The MCP returned pseudo-states only at the
  base level in the production data (no `medium` + pseudo exists today); the snapshot keeps any
  that appear.

### Variables

`variables.json`: `{"color-ink":{"id":"variable-…","type":"Color","value":"#0f0e17"}, …}`, one
variable per line, sorted by name. A `Size` value is `{"value":16,"unit":"px"}`. `modeValues` and
`cssName` are dropped (a second mode makes the script warn). The collections are in `site.json`.

### Components

`components/<slug>.json`: the header above, then `elements` (definition tree, same format as above),
and, once a dump includes them, `variantStyles` (the overrides read with `get_variant_styles`, only
for the (variant, style, breakpoint, pseudo) triples listed in `components.md`; partial, see the
plan). **The baseline dump has none**: no component file has a `variantStyles` key yet (listed in the
manifest `gaps`; the next dump must read the listed triples). A sync that writes a triple not listed
there fails a check (phase 3). Accepted gap: an override added only in the Designer goes unnoticed.
Instance count is not stored (it moves whenever a page changes).

### Interactions

`interactions/<name>.json` (2-space JSON, keys sorted): the `get_interaction` result with `version`
kept (it counts edits and is the change signal), `pageId` dropped on the interaction and on every
timeline (it is the page the interaction was created on, which changes meaning if that page is
deleted), and every style id (the `wf:class` targets and the `addClass` selectors) replaced by
`{"class":"<selector>","id":"<raw id>"}` (all 31 ids of the baseline resolve; an unresolved id stays
a string). `ix-ticker` is 47 KB pretty-printed; it is stored in full.

### Custom code

Site and page head/footer code, registered scripts and their applied versions:

- Text up to 8 KB (8,192 bytes) is stored inline.
- Larger blocks (the footers of Home, Facility partners and Candidates carry bundled `x-*` scripts,
  28 to 38 KB) are stored as `{"length":N,"sha256":"…"}`, the hash of the exact text the MCP
  returned. There is no stored `source` path: it would make the output depend on repo files. The
  compare step finds the repo target (`docs/webflow/custom-code/*`, generated by `scripts/build-x-*.mjs`)
  by hash or containment. The hash is the change detector.
- Registered scripts (in `site.json`): `id`, `displayName`, `version`. The script's own `sha256` and
  `hostedLocation` are not stored: the first would need a download (the script is offline), the second
  has a random folder id per upload. Several versions of one script id are listed (`xmodal` has
  1.0.0, 1.1.0, 1.2.0); the applied version is in the page's `scripts`. Site-applied scripts are
  `siteScripts` (`[]` when the MCP answers 404, as for the baseline).
- Template head code that uses CMS tokens (`x-schema-post`) is not returned by the MCP. The page file
  records `"headUnreadable": true`, and the check stays on staging HTML.

### Manifest and change signals

`manifest.json` (2-space JSON, keys sorted; no clock, so it is reproducible):

```json
{
  "counts": { "assets": 197, "collections": 3, "components": 16, "elements": 2455, "emptyStyles": 794,
              "fonts": 4, "instances": 121, "interactions": 14, "pages": 13, "styles": 700,
              "stylesInDump": 1494, "variables": 74 },
  "dump": ".cache/webflow-dump/20261011T194658Z",
  "files": { "styles.jsonl": "<sha256>", "pages/home.json": "<sha256>" },
  "gaps": ["cms-details.json missing: …", "variantStyles: …"],
  "rawDump": { "styles.json": "<sha256 of the raw file>" },
  "repoCommit": "<hash of the repo commit the snapshot matched>",
  "schema": 1,
  "signals": {
    "collectionLastUpdated": { "<collectionId>": "…" },
    "interactionVersion": { "i-74d70492": 2 },
    "pageLastUpdated": { "<pageId>": "…" },
    "pageScriptsLastUpdated": { "<pageId>": "…" },
    "registeredScripts": [["xmodal", "1.2.0"]],
    "siteLastPublished": "…",
    "siteLastUpdated": "…"
  },
  "siteId": "6ab9ba4aeffb3329202448ee",
  "takenAt": "2026-10-11T19:46:58Z"
}
```

`takenAt` is read from the dump folder name; `files` and `rawDump` are sha256 of each normalised
file and each raw dump file (so a snapshot names the exact bytes it came from). `gaps` lists what
the dump did not contain. `pageScriptsLastUpdated` has an entry only for pages with scripts.

The signals are the values of the quick check. Everything else is compared by file hash.

`repoCommit` replaces git history for the "base vs repo" column of the three-way compare. Repo
changes since base = changes since that commit (`git diff <repoCommit>`), plus uncommitted
working-tree changes. It is written when the snapshot is taken or refreshed after a sync, so the
repo should be committed at that moment. The baseline only needs `src/` (plus the CSS and tokens
it builds from) to have no uncommitted changes, not a fully clean tree (decided 2026-10-11): the
docs and scripts may differ. The script takes `--commit <hash>` (default `git rev-parse HEAD`) and
stores the full hash. If the commit is no longer reachable, the report says so and asks for a
rebuild.

## Volatile fields: what is dropped

Verified by reading the homepage tree twice (identical, 446 elements, same ids), the full style
dump twice (same order, same ids, same values) and by looking at the field names:

| Field | Where | Why dropped |
| --- | --- | --- |
| `lastUpdated`, `createdOn`, `lastPublished`, `fullSiteCompiledAt`, `previewUrl` | site, page, asset, collection records | change on publish or on unrelated saves; kept only as signals in the manifest |
| `size`, `hostedUrl`, `variants`, `originalFileName`, `siteId` | assets | `size` is `0` for fresh SVGs and filled later; the URL switches between the `s3.amazonaws.com` and CDN form |
| `hostedLocation` | registered scripts | random folder id per upload |
| `instanceCount`, `variants[].isSelected` | components | moves with every page edit; Designer UI state |
| `propId` of instance props, `id.component` | trees | already in the component / page header |
| Style GUIDs, empty combo chains | styles | recreated by Webflow, identity is the selector |
| `publishedOn`, `updatedAt` | site instruction | keep only `path`, `version` (the instruction is not in the baseline dump) |
| `cssName` | variables | derived from the name (`--_flint---<name>`) |
| `lastUpdated`, `createdOn`, `hostedUrl`, `uploadedOn` | fonts | keep family, weight, style, format, file name and `fileHash` |

Not volatile, kept: element ids (stable, see the plan), `interactions[].version`, component and
variable ids, page ids.

## Ordering

- Files in a folder: by slug. Lines in `styles.jsonl`: by selector, plain string order.
- Element lines: document order (it is the page order, and a move changes the order).
- Object keys: sorted, except the fixed order for element lines above.
- JSON is written with `JSON.stringify` (no trailing spaces), `\n` line ends, one final newline. Small
  documents (`manifest.json`, `site.json`, `cms.json`, interactions) are 2-space pretty-printed with
  keys sorted at every depth; `variables.json`, `assets.json`, `styles.jsonl` and the element lists
  have one entry per line.

## Identity

- Elements: the Webflow element id. Stable across reads, publishes, many Designer saves and
  `move_element` (74 element and component ids quoted in `sync-log.md` between 2026-09-26 and
  2026-10-10 are still in the live trees unchanged; see the plan). A deleted and re-created element, a duplicate and an element made
  by `transform_element_to_component` get a new id.
- Component definition elements: ids under the component, same rules.
- Styles: selector. Variables: name. Interactions: id (`i-…`), also keep the name. Pages: page id.
- Repo location: `map/<slug>.json`, `{ "<elementId>": { "file": "src/sections/Hero.tsx", "path": [0,2,1], "text": "Apply now", "occ": 1 } }`.
  `path` is the order path inside the file's rendered markup, `text` the string at the snapshot,
  `occ` which occurrence of that string in the file (1-based). It is written when the snapshot is
  refreshed, from the order-and-text alignment that `webflow-tree-diff.mjs` already does on a
  repo that equals Webflow. It is not part of the compare; it only tells the report where an edit
  goes.

## Size on disk

Measured on the baseline (2026-10-11), 49 files, 752 KB, none of it committed (the `map/` files of
the plan are not written yet and would add about 60 KB):

| File | Size |
| --- | --- |
| `pages/*.json` (13 pages) | 359 KB (Candidates 91, Home 77, Facility 59, About 46, legal pages 17 to 22) |
| `components/*.json` (16) | 101 KB (Role Grid 20, Arc Stage 19, Testimonials 16, Footer 11) |
| `styles.jsonl` (700 lines) | 145 KB |
| `interactions/*.json` (14) | 100 KB (ix-ticker 47) |
| `assets.json` (197), `variables.json`, `cms.json`, `site.json`, `manifest.json` | 61 KB (assets 36) |

One reconcile run reads only the files that changed, never all of it.

## Raw dump cache (outside git)

- Location: `.cache/webflow-dump/<UTC timestamp>/` at the repo root, one file per MCP call
  (`pages-home.json`, `styles.json`, `components-trees.json`, …). `.cache/` is in `.gitignore`.
- The MCP client writes a result to a file only when it is large (about 90 KB); smaller results come
  back inline and a dump agent does not save them. So a dump repeats the action in one call until
  the result passes that size and the client saves it to a file, and a script then dedupes (the skill
  has the row; `data_element_tool` takes one `pageId` per call). The baseline dump has one
  `tree-<slug>.json` per page (13), `component-trees.json` (one result per component), `page-code.json`
  (26 results: `get_page_scripts` then `get_page_freeform_code` for each page), `interactions-full.json`
  (14 results) and `assets-1.json` / `assets-2.json`. **The raw shape varies between dumps** (the
  MCP client and the dumping agent save results differently): the script reads a plain
  `{label, action, result|error}` wrapper, an array of `{type:"text", text:"<json>"}` blocks, an array
  of wrappers, or a one-element array around either (and `interactions.json` with `result: [{items}]`),
  and skips blocks that are not a result (a leading `{session_id}`). Labels are ignored. The CMS
  details file may be named `cms-collection-details.json` (a map of label to wrapper) or `cms-details.json`.
- Raw dumps are kept for the last 3 runs and are never committed. They are the proof behind a
  changes report, so the report names the dump folder it used.
- A raw dump is about 1.8 MB (styles 0.69, pages 0.55, page code 0.12, components 0.18, assets 0.17,
  interactions 0.05, the rest 0.05).
- The dump runs on Sonnet at low effort (it only calls read tools and saves results; the user dropped Haiku on
  2026-10-11). `webflow-snapshot.mjs --check` then verifies it (see "Script"); if the check fails, the run repeats. The expected totals
  at the baseline are 13 pages, **16 components** (Global / Featured post is registered, so not 15),
  **74 variables** (they match `src/styles/tokens.css`, not 68), 1,494 styles, 14 interactions, 197
  assets, 3 CMS collections. Everything that interprets the dump runs on Sonnet.
- The baseline dump was scanned for keys and secrets on 2026-10-11: clean (see the plan).

## Script

```text
node scripts/webflow-snapshot.mjs <dump-dir> [--out <dir>] [--commit <hash>] [--rebuild] [--yes] [--check]
```

- Default output: `docs/webflow/snapshot/data/`. It refuses to write into an existing, non-empty
  folder without `--rebuild`, and writes nothing from an incomplete or inconsistent dump.
- `--out <dir>` writes elsewhere, to compare a second dump without touching the base (`diff -r`).
- `--commit <hash>` sets `repoCommit` (default `git rev-parse HEAD`).
- `--check` only verifies the dump and prints the counts. It fails when an expected file is
  missing or holds an error; when `pages.json`, the trees, the schema, the page code, the sitemap,
  the interactions (list vs full, `hasMore`, versions), the assets (sum vs `pagination.total`, no
  duplicate id), the components (list vs trees) and the styles (no duplicate selector, every
  variable id resolves) disagree; when an element id repeats or an instance points at an unknown
  component; and when `site.lastUpdated`, `lastPublished` or a page `lastUpdated` moved between the
  `*-before` and `*-after` reads (someone edited during the dump). Missing optional data is listed
  as `GAP` (and stored in the manifest), not as an error. A stale `*-after` is the only guard
  against an edit during the dump, so the dump must keep both reads.
- Deterministic: it reads nothing but the dump (and `git rev-parse` for the commit), so two runs on
  one dump are byte-identical.

## Rebuilding the base

`node scripts/webflow-snapshot.mjs <dump-dir> --rebuild` takes a fresh dump and replaces the
default `data/` (it removes only the files it writes: `manifest.json`, `site.json`, `variables.json`,
`styles.jsonl`, `assets.json`, `cms.json`, `pages/`, `components/`, `interactions/`; `map/` is left
for the map step to rewrite). It prints this warning and waits for a typed `yes` before it writes
anything (`--yes` answers it for a non-interactive run; without a terminal and without `--yes` it
stops):

> Rebuilding resets the base. Any Webflow edit made since the last sync is absorbed silently
> instead of reported. If the old `data/` still exists, run a reconcile first.

The warning applies to the default `data/` only; an `--out` folder is a scratch copy. Consequences:
the base exists on one machine only, and the changes reports are the only record of what changed
between syncs.

## Accepted differences

`accepted.json` (committed) lists the repo-vs-Webflow differences that already existed at the
baseline: 10 style lines from `scripts/webflow-diff.mjs` and the tree-diff noise on About. Each
entry has the exact diff `line` (it contains both the repo and the Webflow value), the parsed
selector, breakpoint, pseudo, property and values, and a reason. Reconcile subtracts these lines
from a repo-vs-Webflow compare by exact text, so a value that moves on either side is reported
again. Remove an entry when the difference is fixed.

## Gaps in the baseline dump

Recorded in the manifest, to close in the next dump (the 2026-10-11 second dump already has the CMS field schemas, `cms-collection-details.json`): `get_variant_styles` for the triples in `components.md`, and the
site instruction (`search_instructions` path and version).

## How the quick check decides what to re-read

Five calls, about 21 KB: `get_site`, `list_pages`, `list_interactions`, `get_collection_list`,
`get_registered_scripts`. Compare with `manifest.json → signals`:

| Signal moved | Re-read |
| --- | --- |
| a page `lastUpdated` | that page's tree, settings, JSON-LD, scripts and head/footer code |
| an interaction `version`, a new or missing interaction id | that interaction |
| a collection `lastUpdated` | that collection's fields |
| a registered script id or version | the registered scripts and the page scripts |
| `siteLastUpdated` only | site head/footer code, fonts, site instruction, assets |
| nothing | still re-read styles, components and variables (see below) |

Styles, components and variables have **no timestamp** in any MCP result, and a component or
style edit does not bump the `lastUpdated` of the pages that use it (the legal pages did not move
after the 2026-10-10 Page Hero changes). So these three are always re-read: 3 calls, about 0.9 MB,
saved to files by the client, compared by hash against `manifest.json → files`. Page trees of
pages whose signal did not move are not re-read.

Measured in phase 2 step (d) (2026-10-11): a page text edit that was never published moved that
page's `lastUpdated` (and the schema's, which carries the same value, and `siteLastUpdated`;
`siteLastPublished` stayed put), so the page signal catches text. The style, variable and
component edits of the same session moved no timestamp of their own, and `siteLastUpdated` equals
the latest page save, so it cannot stand in for them. The three always-re-read reads stay.

## Not in the snapshot

CMS items (posts stay Webflow-first), form submissions, assets' bytes, the published HTML, the
301 redirect map, `robots.txt`, `llms.txt`, per-page noindex, site SEO settings and the canonical
URL (none of them is readable through the MCP; the repo files stay the source and staging is the
check), element settings the tree does not return (image `altText` inherit vs decorative, which
routine runs do not compare; only changed images get `get_settings`;
HTML Embed `code`, text-field validations): the plan lists the partial reads and the workaround
for each.
