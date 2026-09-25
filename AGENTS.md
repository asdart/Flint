# AGENTS.md — Flint ⇄ Webflow contract

This file is the contract every contributor (human or AI agent) follows when changing this repo.
Its purpose: keep the codebase a **1:1 blueprint of the Webflow site**, so any change made here can be
pushed to Webflow through the Webflow MCP without reinterpretation.

- **Contract version:** 1.1 (2026-09-23). 1.1 adds what the MVP proved about the Webflow MCP:
  typography on classes instead of tag styles, `fk-page` as a wrapper div, exact breakpoint query
  syntax, `data-ix` interaction triggers, and the sync scripts in `scripts/`.
- **Status:** MVP (roadmap phase 1) closed on 2026-09-24: built in the repo (`/mvp`) and in Webflow
  (draft page `/mvp`), reviewed. Phase 2 has not started; wait for the user's go. Everything outside
  the MVP in `src/` is still _legacy_ (Tailwind utilities + Framer Motion). See
  [Legacy code policy](#8-legacy-code-policy).

Detailed registries live in [`docs/webflow/`](docs/webflow/). This file defines the rules; the
registries define the inventory. If they disagree, fix the registry, not the rule.

| Document | Defines |
| --- | --- |
| [`roadmap.md`](docs/webflow/roadmap.md) | Phases, the MVP, decisions taken and decisions still open |
| [`tokens.md`](docs/webflow/tokens.md) | Variables: colors, fonts, sizes, radii, spacing, shadows, motion |
| [`classes.md`](docs/webflow/classes.md) | Naming system, tag styles, class registry |
| [`components.md`](docs/webflow/components.md) | Components, sections, pages and their composition |
| [`cms.md`](docs/webflow/cms.md) | CMS collections, fields, collection lists |
| [`interactions.md`](docs/webflow/interactions.md) | Interactions registry and the custom-code exceptions list |
| [`mcp-playbook.md`](docs/webflow/mcp-playbook.md) | How to push changes with the Webflow MCP, safely |
| [`sync-log.md`](docs/webflow/sync-log.md) | What has been pushed to Webflow, and when |
| [`webflow-ids.json`](docs/webflow/webflow-ids.json) | Ids of everything created in Webflow (variables, assets, collections, components…) |

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
2. **Tokens, not values.** No raw hex, px or font values in components. Use a variable from
   `tokens.md`. If a value is missing, add a token (or snap to the nearest existing one).
3. **Webflow CSS model, not Tailwind.** Styling is layered: variables → tag styles → classes →
   combo classes. No Tailwind utilities, arbitrary values or inline `style` in new code.
4. **FlowKit naming.** Classes are `fk-[block]`, `fk-[block]-[element]`, plus `is-[variant]` combo
   classes that only ever sit on top of a base class. Lowercase, kebab-case. No page-specific
   classes (`fk-about-hero` ❌ → `fk-hero is-about` ✅).
5. **Global sections are single components.** `Global / Nav` and `Global / Footer` exist once and
   are placed on every page. They never live inside another section.
6. **Reuse before create.** A new section is only added when no existing section plus a variant
   or prop can express it. Content differences are props, not new components.
7. **Webflow Interactions, not JS animation.** Motion uses the interactions in `interactions.md`.
   No Framer Motion in new code. Every interaction respects `prefers-reduced-motion`.
8. **Custom code is an exception.** Scripts, embeds and custom CSS are only allowed if listed in
   the exceptions table in `interactions.md`, with a reason and a load scope (page or site).
9. **Editor content goes in the CMS.** Anything an editor will change repeatedly (posts, authors,
   categories) is a CMS collection, never hardcoded in a component.
10. **Structure mirrors Webflow elements.** Use semantic tags (`section`, `nav`, `footer`, `h1`–`h4`,
    `p`, `a`, `button`, `form`). No wrapper `div` that would not exist in the Webflow build.
11. **Read before write in Webflow.** Query existing styles, variables and components by name before
    creating anything. Never create duplicates, and never rename or delete without updating the registry.
12. **No destructive or publishing action without explicit user confirmation.** That covers deleting
    styles, components, fields or items, unregistering components, and publishing. Publishing goes
    through the `/safe-publish` skill only.

## 3. Definitions

| Term | Meaning here | Webflow equivalent |
| --- | --- | --- |
| **Token** | A named design value (color, size, font, radius, spacing) | Variable (collection `Flint`) |
| **Tag style** | Default style of an HTML tag, applied site-wide without a class | Tag selector (Body, H1–H4, P, Link…) |
| **Class** | A registered, reusable style (`fk-*`) | Class |
| **Combo class** | A variant/state modifier on a base class (`is-*`) | Combo class |
| **Component** | A reusable UI piece with props (Button, Post Card) | Component (group `UI`) |
| **Global** | A component present once on every page (Nav, Footer) | Component (group `Global`) |
| **Section** | A full-width page band composed of components | Component (group `Section`) |
| **Page** | An ordered list of sections | Static page or CMS template page |
| **Collection** | Structured editor content | CMS Collection |
| **Interaction** | A named, reusable animation with a trigger | Interaction (IX3) |
| **Exception** | Any custom script, embed or custom CSS | Site/page custom code, Code Component |

## 4. React → Webflow mapping

| In this repo | Becomes in Webflow |
| --- | --- |
| `src/styles/tokens.css` custom properties (`--color-ink`) | Variables with the same name (`color-ink`) |
| `src/styles/base.css` tag selectors | Tag styles, after a one-time seed in the Designer (the MCP can update but not create them). Synced markup never relies on them |
| `.fk-page` on the page root div | The same wrapper div, first child of Body |
| `src/styles/**/*.css` `.fk-*` / `.fk-*.is-*` rules | Classes / combo classes, pushed with `scripts/webflow-css.mjs` (new) and `scripts/webflow-style-actions.mjs` (changes, states) |
| Media queries at 991 / 767 / 479px (see §5) | Tablet (`medium`) / Mobile landscape (`small`) / Mobile portrait (`tiny`) styles |
| `:hover`, `:active`, `:focus-visible` in CSS | Hover / Pressed / Focused (keyboard) states |
| `/assets/…` paths | Uploaded assets; hosted URLs and ids in `docs/webflow/webflow-ids.json` |
| `src/components/global/*.tsx` | Components in group `Global` |
| `src/components/ui/*.tsx` | Components in group `UI` |
| `src/sections/*.tsx` | Components in group `Section` |
| React props (`eyebrowText`) | Component props in Title Case ("Eyebrow Text") |
| React `variant` prop union | Component variants, same names |
| `src/content/*.json` | CMS collection items (seed import) |
| `src/pages/*.tsx` | Pages: section instances in the same order |
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
    layout.css            # fk-page, fk-section, fk-panel, fk-container, fk-grid, fk-stack
    typography.css        # fk-heading-*, fk-text-*, fk-eyebrow
    components/           # one file per class family: button.css, nav.css, post-card.css…
  components/
    global/               # Webflow group "Global": Nav, Footer
    ui/                   # Webflow group "UI": Button, SectionHeader, PostCard…
  sections/               # Webflow group "Section": one file per section, named like the component
  content/                # CMS seed data as JSON, shaped exactly like cms.md
  ix/                     # local preview runtime for registered interactions (not shipped to Webflow)
  lib/                    # repo-only helpers with no Webflow equivalent (cx, SmartLink)
  pages/                  # composition only — no styling, no data
```

A file's name equals its Webflow component name without spaces (`Section / Stats Band` →
`src/sections/StatsBand.tsx`).

## 7. Workflow for every change

1. **Locate.** Find the affected roadmap item and registry entries. If no registry entry exists,
   add it first (rule 1). If the work depends on an open decision in `roadmap.md`, stop and ask.
2. **Implement in the repo.** Change tokens/classes/components following §2–§6. Run
   `npm run build` and `npm run lint`, and preview with `npm run dev`.
3. **Update registries.** Keep `docs/webflow/*.md` in sync with the code, including the status column.
4. **Sync to Webflow.** Follow [`mcp-playbook.md`](docs/webflow/mcp-playbook.md) in its fixed
   order: variables → classes → components → pages → CMS → interactions → custom code.
5. **Verify.** Read back what was written (styles, element snapshots). Run `/site-audit` for page
   or CMS changes, and `/accessibility-audit` for new UI.
6. **Log.** Add a row to [`sync-log.md`](docs/webflow/sync-log.md) and tick the item in
   [`roadmap.md`](docs/webflow/roadmap.md).
7. **Publish** only when the user asks, via `/safe-publish`.

### Definition of done

- [ ] No raw hex/px/font values, Tailwind classes, inline styles or Framer Motion in touched code
- [ ] Every class, token, component, interaction and script used is in a registry
- [ ] Responsive styles only at the breakpoints in §5
- [ ] Interactions respect reduced motion; focus-visible states exist on interactive elements
- [ ] Registries and status columns updated
- [ ] Webflow updated through the MCP (if requested) and logged in `sync-log.md`

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
- Migrated pages render inside `.fk-page` and call `useInteractions()` from `src/ix/`.

## 9. Webflow project

| Field | Value |
| --- | --- |
| Site name | `Flint` |
| Site short name | `flint-4167fa` (staging: `flint-4167fa.webflow.io`) |
| Site ID | `6ab46032460da07da9dc6231`. This is the value MCP tools expect as `site_id` / `siteId` |
| Workspace | `paulos-workspace-442e65` (ID `63710ac27d23ec60732eb6bc`) |
| Home page ID | `6ab46033460da07da9dc623a`. Default `pageId` for site-level data tools |
| Time zone | America/Vancouver |
| Custom domain | None yet (roadmap P-06) |
| Primary locale | English (`en`) |
| Variable collection | `Flint` (to create. Webflow's default `Base collection` stays unused) |
| MCP server | `plugin-webflow-webflow` (Cursor Webflow plugin, OAuth) |

Agents never target another site. If `list_sites` doesn't return this ID, stop and ask the user.
