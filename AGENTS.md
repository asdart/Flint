# AGENTS.md — Flint ⇄ Webflow contract

This file is the contract every contributor (human or AI agent) follows when changing this repo.
Its purpose: keep the codebase a **1:1 blueprint of the Webflow site**, so any change made here can be
pushed to Webflow through the Webflow MCP without reinterpretation.

- **Contract version:** 1.9 (2026-09-30). 1.9: the Rich Text descendant rules (`.fk-article-body <tag>`) are the custom-code
  exception `x-article-body` (roadmap D-25, `src/styles/exceptions/x-article-body.css`, installed in the Posts template head),
  replacing 1.8's Designer nested styles (D-20 amended). 1.8 added Rich Text descendant rules (roadmap D-20,
  [`classes.md`](docs/webflow/classes.md)), the one exception to one selector per rule. 1.7 adds the mixed section model (rule 6, §3, §4, roadmap
  D-17): only sections used, or planned, on more than one page become `Section /` components; the
  others are plain page markup until a second page needs them. 1.6 adds the utilities layer (rules 3 and 4,
  [`css-system.md`](docs/webflow/css-system.md)): generated, token-valued utility classes stacked
  after an element's main class. 1.5 adds the SEO, performance and accessibility
  requirements (rule 15, [`seo.md`](docs/webflow/seo.md)) and one H1 per page (rule 10). 1.4 narrows tokens to system values and allows raw
  local sizes only after checking they don't repeat (rule 2). 1.3 added SVG-only icons (rule 10), 1:1 behavior (rule 14) and
  `src/styles/exceptions/`. 1.1 added what the test stage proved about the Webflow MCP:
  typography on classes instead of tag styles, `fk-page` as a wrapper div, exact breakpoint query
  syntax, `data-ix` interaction triggers, and the sync scripts in `scripts/`. 1.2 adds rule 13
  (save every learning) and the `flint-webflow-sync` skill.
- **Status:** The test stage (roadmap phases 0–2: foundations, a vertical slice and the homepage)
  closed on 2026-09-25 and its records are archived in
  [`docs/webflow/archive/test-site/`](docs/webflow/archive/test-site/README.md). The production
  site lives in the client's Webflow account (created 2026-09-28, see [§9](#9-webflow-project)),
  is empty and never published, and is built from scratch from this repo (roadmap track P, in
  progress); nothing is copied from the test stage. Everything in `src/` outside the
  migrated pieces is still _legacy_ (Tailwind utilities + Framer Motion). See
  [Legacy code policy](#8-legacy-code-policy).

Detailed registries live in [`docs/webflow/`](docs/webflow/). This file defines the rules; the
registries define the inventory. If they disagree, fix the registry, not the rule.

| Document | Defines |
| --- | --- |
| [`roadmap.md`](docs/webflow/roadmap.md) | Phases, the production track, decisions still open and a one-line index of decisions taken (full text in [`archive/decisions.md`](docs/webflow/archive/decisions.md)) |
| [`tokens.md`](docs/webflow/tokens.md) | Variables: colors, fonts, sizes, radii, spacing, shadows, motion |
| [`classes.md`](docs/webflow/classes.md) | Naming system, tag styles, class registry |
| [`components.md`](docs/webflow/components.md) | Components, sections, pages and their composition |
| [`cms.md`](docs/webflow/cms.md) | CMS collections, fields, collection lists |
| [`blog-custom-code.md`](docs/webflow/blog-custom-code.md) | Custom code blocks in the current site's blog posts, removed in the import, and which posts used them |
| [`interactions.md`](docs/webflow/interactions.md) | Interactions registry and the custom-code exceptions list |
| [`mcp-playbook.md`](docs/webflow/mcp-playbook.md) | How to push changes with the Webflow MCP, safely |
| [`seo.md`](docs/webflow/seo.md) | SEO, performance and accessibility requirements every page must meet |
| [`sync-log.md`](docs/webflow/sync-log.md) | What has been pushed to the production site, and when |
| [`webflow-ids.json`](docs/webflow/webflow-ids.json) | Ids of everything created on the production site (variables, assets, collections, components…) |
| [`archive/test-site/`](docs/webflow/archive/test-site/README.md) | Read-only records of the test stage (ids, sync log, homepage plan). Not a sync target |

---

## 1. Sources of truth

| Concern | Source of truth | Direction |
| --- | --- | --- |
| Design tokens, classes, components, sections, page structure, interactions | This repo (registries + `src/`) | Repo → Webflow |
| Blog content (posts, authors, categories) after first import | Webflow CMS | Webflow only. `src/content/` is seed/preview data |
| Visual design intent | Figma (linked in `README.md`) | Figma → Repo |
| Webflow site ID, workspace, publish state | [§9 Webflow project](#9-webflow-project) | — |

Structural or style edits made directly in the Webflow Designer **must be mirrored back** into the
registries and `src/` in the same iteration. Otherwise the next MCP sync will overwrite them.

## 2. Rules

1. **Only registered building blocks.** Every color, size, class, component, section, collection,
   interaction and script must be listed in its registry before it is used, in code or in Webflow.
2. **Tokens for system values, local values for local sizes.** Colors, fonts, the spacing scale,
   radii and container widths always use a variable from `tokens.md`; a missing
   system value becomes a token. A raw px size is allowed only when analysis shows it's local to
   one element of one block (an illustration offset, one panel's height). Repeated elements (icons,
   avatars, flags, buttons, shared card sizes) and values repeated across sections get one shared
   class or token. See `classes.md` → What a class can express.
3. **Webflow CSS model, not Tailwind.** Styling is layered: variables → tag styles → primitives and
   block classes → combo classes, plus **utilities**: single-purpose `fk-*` classes with token values
   (`fk-flex`, `fk-gap-4`, `fk-bg-secondary`, `fk-hidden-tablet`), generated from the tokens by
   `scripts/gen-utilities.mjs` and stacked after the main class. Generic layout, spacing and color go
   in utilities; block classes keep only what utilities can't express (geometry, states, masks).
   Shared components that must look identical everywhere (Nav, Footer, Button, Icon, Pagination,
   Post Card) keep their own classes on every non-trivial element instead of utilities.
   A utility never sets a property its element's main class sets. No Tailwind, arbitrary values or
   inline `style` in new code. See `css-system.md`.
4. **FlowKit naming.** Classes are `fk-[block]`, `fk-[block]-[element]`, plus `is-[variant]` combo
   classes that only ever sit on top of a base class, plus the closed list of utilities
   (`fk-[utility]`, responsive `fk-[utility]-tablet|mobile|phone`). Lowercase, kebab-case. No page-specific
   classes (`fk-about-hero` ❌ → `fk-hero is-about` ✅).
5. **Global sections are single components.** `Global / Nav` and `Global / Footer` exist once and
   are placed on every page. They never live inside another section.
6. **Reuse before create.** A new section is only added when no existing section plus a variant
   or prop can express it. Content differences are props, not new components. **A section becomes
   a `Section /` component only when more than one page uses it or is planned to** (roadmap D-17); a section used
   once stays plain page markup, listed as such in `components.md`, and is turned into a component
   the moment a second page needs it.
7. **Webflow Interactions, not JS animation.** Motion uses the interactions in `interactions.md`.
   No Framer Motion in new code. Every interaction respects `prefers-reduced-motion`.
8. **Custom code is an exception.** Scripts, embeds and custom CSS are only allowed if listed in
   the exceptions table in `interactions.md`, with a reason and a load scope (page or site).
9. **Editor content goes in the CMS.** Anything an editor will change repeatedly (posts, authors,
   categories) is a CMS collection, never hardcoded in a component.
10. **Structure mirrors Webflow elements.** Use semantic tags (`section`, `nav`, `footer`, `h1`–`h4`,
    `p`, `a`, `button`, `form`). No wrapper `div` that would not exist in the Webflow build.
    Icons are SVG files from `src/assets/icons/` placed as images, never drawn with styled
    elements (no stacked spans for a menu icon). Headings follow the page outline, not the look:
    one `h1` per page, section titles `h2`, items `h3`; dates, authors, quotes, eyebrows and stat
    values are never headings (size comes from the `fk-heading-*` class).
11. **Read before write in Webflow.** Query existing styles, variables and components by name before
    creating anything. Never create duplicates, and never rename or delete without updating the registry.
12. **No destructive or publishing action without explicit user confirmation.** That covers deleting
    styles, components, fields or items, unregistering components, and publishing. Publishing goes
    through the `/safe-publish` skill only.
13. **Save every learning.** When something fails, needs a workaround or takes discovery (a payload
    shape, a tool limit, a detour), record the fix in the same change so no one has to rediscover
    it: recipes and pitfalls in the [`flint-webflow-sync`](.agents/skills/flint-webflow-sync/SKILL.md)
    skill, tool capabilities in `mcp-playbook.md`, rules here, facts in the registries. The skill's
    "Record what you learn" table says which learning goes where. Correct wrong entries in place.
14. **1:1 behavior, no silent approximations.** Hover, pressed, focus and motion effects in Webflow
    match the repo exactly. If Webflow can't reproduce one natively, stop and ask: the answer is a
    registered exception (rule 8) or a decision in `roadmap.md`, never a quiet substitute.
15. **SEO, speed and accessibility are part of done.** Every page meets the requirements in
    [`seo.md`](docs/webflow/seo.md): page settings (title, description, OG), schema, image sizes,
    formats and lazy loading, alt text, labelled icon buttons, 24px tap targets. Tracking and
    schema code only through their registered exceptions.

## 3. Definitions

| Term | Meaning here | Webflow equivalent |
| --- | --- | --- |
| **Token** | A named design value (color, size, font, radius, spacing) | Variable (collection `Flint`) |
| **Tag style** | Default style of an HTML tag, applied site-wide without a class | Tag selector (Body, H1–H4, P, Link…) |
| **Class** | A registered, reusable style (`fk-*`) | Class |
| **Combo class** | A variant/state modifier on a base class (`is-*`) | Combo class |
| **Component** | A reusable UI piece with props (Button, Post Card) | Component (group `UI`) |
| **Global** | A component present once on every page (Nav, Footer) | Component (group `Global`) |
| **Section** | A full-width page band composed of components. Used or planned on more than one page: a component. Used once: plain page markup (D-17) | Component (group `Section`), or plain elements on the page |
| **Page** | An ordered list of sections | Static page or CMS template page |
| **Collection** | Structured editor content | CMS Collection |
| **Interaction** | A named, reusable animation with a trigger | Interaction (IX3) |
| **Exception** | Any custom script, embed or custom CSS | Site/page custom code, Code Component |

## 4. React → Webflow mapping

| In this repo | Becomes in Webflow |
| --- | --- |
| `src/styles/tokens.css` custom properties (`--color-ink`) | Variables with the same name (`color-ink`) |
| `src/styles/base.css` tag selectors | Tag styles, after a one-time seed in the Designer (the MCP can update but not create them). Markup pushed to Webflow never relies on them |
| `.fk-page` on the page root div | The same wrapper div, first child of Body |
| `src/styles/**/*.css` `.fk-*` / `.fk-*.is-*` rules, including the generated `utilities.css` | Classes / combo classes, pushed with `scripts/webflow-css.mjs` (new) and `scripts/webflow-style-actions.mjs` (changes, states) |
| Media queries at 991 / 767 / 479px (see §5) | Tablet (`medium`) / Mobile landscape (`small`) / Mobile portrait (`tiny`) styles |
| `:hover`, `:active`, `:focus-visible` in CSS | Hover / Pressed / Focused (keyboard) states |
| `/assets/…` paths | Uploaded assets; hosted URLs and ids in `docs/webflow/webflow-ids.json` |
| `src/assets/icons/*.svg` imported into a component | Uploaded asset in an Image element (`fk-icon`, or a block's own `-icon` class), empty alt inside a labelled control. Upload with `scripts/webflow-upload.mjs` |
| `src/styles/exceptions/x-article-body.css` `.fk-article-body <tag>` rules | Site-exception custom code (`x-article-body`, D-25): a minified `<style>` in the Posts template head with `var(--token)` renamed `var(--_flint---token)`; never pushed as classes |
| `src/styles/exceptions/*.css` | Site custom code for a registered exception (`interactions.md`), never pushed as classes |
| `src/components/global/*.tsx` | Components in group `Global` |
| `src/components/ui/*.tsx` | Components in group `UI` |
| `src/sections/*.tsx` | Components in group `Section` when the section is used or planned on more than one page; otherwise page-level markup (the same elements written straight into the page), listed as such in `components.md` (D-17) |
| React props (`eyebrowText`) | Component props in Title Case ("Eyebrow Text") |
| React `variant` prop union | Component variants, same names |
| `src/content/*.json` | CMS collection items (seed import) |
| `src/pages/*.tsx` (not `legacy/`) | Pages: section component instances and page-level section markup, in the same order |
| Class `fk-reveal` etc. + `src/ix/` preview runtime | Interactions from `interactions.md` |

## 5. Breakpoints

Webflow is desktop-first, so CSS in this repo is written **desktop-first with `max-width` queries**
at Webflow's breakpoints only:

| Webflow breakpoint | Query (write it exactly like this) | Legacy Tailwind equivalent |
| --- | --- | --- |
| Desktop (base) | none | `lg:` (≥1024) and up |
| Tablet | `@media screen and (max-width: 991px)` | `md:` (768–1023) |
| Mobile landscape | `@media screen and (max-width: 767px)` | `sm:` (640–767) and base |
| Mobile portrait | `@media screen and (max-width: 479px)` | base (<640) |

No `min-width` queries below 1280px: a desktop-only style is the base value plus a Tablet override.

Larger breakpoints (1280/1440/1920) are not used unless a registry entry says so.

## 6. Target repository structure

```text
src/
  styles/
    tokens.css            # variables only — mirrors docs/webflow/tokens.md
    base.css              # tag styles only
    layout.css            # fk-page, fk-section, fk-panel, fk-container, fk-panel-content
    typography.css        # fk-heading-*, fk-text-*, fk-eyebrow
    utilities.css         # GENERATED by scripts/gen-utilities.mjs — never edit by hand
    webflow-base.css      # PREVIEW ONLY: Webflow's own w-dropdown / w-form base rules, never pushed
    components/           # one file per class family: button.css, nav.css, post-card.css…
    exceptions/           # custom CSS for registered exceptions only (x-*.css)
  assets/
    icons/                # SVG icons, one file per icon, sized and colored in the file
  components/
    global/               # Webflow group "Global": Nav, Footer
    ui/                   # Webflow group "UI": Button, PostCard…
  sections/               # one file per section; a reused section is Webflow group "Section" (named like the component), a single-page one is page-level markup (D-17)
  content/                # CMS seed data as JSON, shaped exactly like cms.md
  ix/                     # local preview runtime for registered interactions (not shipped to Webflow)
  lib/                    # repo-only helpers with no Webflow equivalent (cx, SmartLink)
  pages/                  # composition only — no styling, no data
    legacy/               # pre-contract pages (Tailwind + Framer Motion), removed as each is migrated
```

A file's name equals its Webflow component name without spaces (`Section / Stats Band` →
`src/sections/StatsBand.tsx`). A section that is page-level markup keeps the same file name, so it
can become a component later without a rename.

## 7. Workflow for every change

1. **Locate.** Find the affected roadmap item and registry entries. If no registry entry exists,
   add it first (rule 1). If the work depends on an open decision in `roadmap.md`, stop and ask.
2. **Implement in the repo.** Change tokens/classes/components following §2–§6. Run
   `npm run build` and `npm run lint`, and preview with `npm run dev`.
3. **Update registries.** Keep `docs/webflow/*.md` in sync with the code, including the status column.
4. **Sync to Webflow.** Follow [`mcp-playbook.md`](docs/webflow/mcp-playbook.md) in its fixed
   order: variables → classes → components → pages → CMS → interactions → custom code.
5. **Verify.** Read back what was written (styles, element snapshots). For class changes, run
   `scripts/webflow-diff.mjs` until it reports no differences. Run `/site-audit` for page
   or CMS changes, and `/accessibility-audit` for new UI. For new or changed pages, check the
   `seo.md` requirements on staging (headings, page settings, schema, images).
6. **Record learnings** (rule 13). Anything that failed or had to be discovered goes into the
   skill, the playbook or the registries before you report back.
7. **Log.** Add a row to [`sync-log.md`](docs/webflow/sync-log.md) and tick the item in
   [`roadmap.md`](docs/webflow/roadmap.md).
8. **Publish** only when the user asks, via `/safe-publish`.

### Definition of done

- [ ] No raw hex/px/font values, Tailwind classes, inline styles or Framer Motion in touched code
- [ ] Every class, token, component, interaction and script used is in a registry
- [ ] Responsive styles only at the breakpoints in §5
- [ ] Interactions respect reduced motion; focus-visible states exist on interactive elements
- [ ] Registries and status columns updated
- [ ] Webflow updated through the MCP (if requested) and logged in `sync-log.md`
- [ ] Every failure, workaround or discovered payload recorded per rule 13
- [ ] One `h1`; headings follow the outline; images have alt, `width`/`height`, WebP and lazy loading below the fold
- [ ] Icon-only buttons labelled; tap targets at least 24px; page settings and schema per `seo.md`

## 8. Legacy code policy

The current `src/` predates this contract. Until each piece is migrated:

- Do **not** add new Tailwind utilities, arbitrary values or Framer Motion usage anywhere.
- When a legacy file is edited substantially, migrate it to the contract in the same change and flip
  its status in `components.md` from `legacy` to `migrated`.
- Small fixes to legacy files are allowed without migrating, but must not add new legacy patterns.
- Once no registry entry is `legacy`, remove `tailwindcss`, `@tailwindcss/vite` and `framer-motion`
  from `package.json`.
- During the transition, `src/styles/index.css` is imported after the legacy `src/index.css`, so
  contract classes win over Tailwind's preflight. Tag styles in `base.css` are scoped to
  `:where(.fk-page)`, so they don't restyle legacy pages. In Webflow they are global tag styles;
  drop the wrapper once no page is legacy.
- Migrated pages (`src/pages/`, e.g. `HomePage.tsx` at `/`) render inside `.fk-page` and call
  `useInteractions()` from `src/ix/`. Legacy pages live in `src/pages/legacy/` (the old home is at
  `/legacy`) and move out of it as they are migrated.
- Legacy Tailwind utilities read token values from `tokens.css` (`@theme reference` in
  `src/index.css`); never redefine a token there. Tailwind utilities whose variables share a
  token name (`rounded-sm`…`rounded-2xl` → `--radius-*`) resolve to the Flint values.

## 9. Webflow project

The production site lives in the client's Webflow account (roadmap D-09) and is built from scratch
from this repo (track P). Its values were recorded in roadmap step P.1 (2026-09-29).

| Field | Value |
| --- | --- |
| Site name | Flint |
| Site short name | `fint-fc2589` (sic, "fint", kept on purpose; its staging subdomain is `fint-fc2589.webflow.io`) |
| Site ID | `6ab9ba4aeffb3329202448ee`. This is the value MCP tools expect as `site_id` / `siteId` |
| Workspace | `6903cd68560df35a819fcc12` (the client's workspace) |
| Home page ID | `6ab9ba4ceffb3329202448f2`. Default `pageId` for site-level data tools |
| Time zone | America/Vancouver |
| Custom domain | None yet (roadmap P-06) |
| Primary locale | English (`en`) |
| Variable collection | `Flint` (to create in roadmap P.2. Webflow's default `Base collection` stays unused) |
| MCP server | Webflow's official MCP, OAuth. Named `plugin-webflow-webflow` in Cursor (Webflow plugin); a claude.ai connector in Claude Code. Same tools in both |

Agents never target another site: if `list_sites` doesn't return this ID, stop and ask the user.
The test site (archived, see `docs/webflow/archive/test-site/`) is never a sync target.
