# Flint — Marketing site

Marketing site for Flint, implemented from the [Figma design](https://www.figma.com/design/bFJIQUAnqKd2ueYqsV8rRd/Flint-Brand--Copy-?node-id=5445-2297).
The site is being **migrated to Webflow**. This repo is the blueprint and local preview for that
build.

> **Before changing anything, read [`AGENTS.md`](AGENTS.md).** It is the contract that keeps this
> code a 1:1 map of the Webflow site: tokens, class naming, components, CMS, interactions, and how
> changes are pushed with the Webflow MCP.

## Stack

- [Vite](https://vite.dev) + React 19 + TypeScript + React Router
- Plain CSS in `src/styles/`, mirroring the Webflow variables, tag styles and classes
  (`docs/webflow/tokens.md`, `classes.md`)
- Interactions: a local preview runtime in `src/ix/` for the Webflow Interactions
  (`docs/webflow/interactions.md`); [Motion](https://motion.dev) only inside the custom-code scripts
  built by `scripts/build-x-*.mjs`
- Fonts: SN Pro (body) and STIX Two Text (headings) via Fontsource

## Getting started

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check + production build to dist/
npm run lint     # oxlint
npm run preview  # preview the production build
```

## Webflow sync scripts

Used by agents following [`docs/webflow/mcp-playbook.md`](docs/webflow/mcp-playbook.md):

```bash
node scripts/webflow-css.mjs src/styles/components/nav.css            # CSS for the WHTML builder (new classes)
node scripts/webflow-style-actions.mjs src/styles/layout.css --only fk-panel  # update_style actions (changes, states)
```

## Pages

| Route | Page |
| --- | --- |
| `/` | Home (`src/pages/HomePage.tsx`, on the contract) |
| `/candidates` | Candidates |
| `/facility-partners` | Facility partners |
| `/about` | About |
| `/blog` | Blog index |
| `/categories/:slug` | Blog category |
| `/blog/:slug` | Blog post |
| `/style-guide` | Style guide (QA page, not in the nav) |

## Structure

`src/styles/`, `components/global|ui/`, `sections/`, `content/` (CMS seed), `ix/`, `lib/` and
`pages/`, as defined in [`AGENTS.md` §6](AGENTS.md#6-target-repository-structure). Images and icons
exported from Figma are in `public/assets/`.

## Webflow migration docs

| Document | Purpose |
| --- | --- |
| [`AGENTS.md`](AGENTS.md) | Rules, definitions, workflow, definition of done |
| [`docs/webflow/roadmap.md`](docs/webflow/roadmap.md) | Migration phases, the production track, decisions |
| [`docs/webflow/tokens.md`](docs/webflow/tokens.md) | Variables (colors, fonts, sizes, motion) |
| [`docs/webflow/classes.md`](docs/webflow/classes.md) | FlowKit class registry and tag styles |
| [`docs/webflow/components.md`](docs/webflow/components.md) | Global/UI/Section components, pages, migration status |
| [`docs/webflow/cms.md`](docs/webflow/cms.md) | Collections and collection lists |
| [`docs/webflow/interactions.md`](docs/webflow/interactions.md) | Interactions and custom-code exceptions |
| [`docs/webflow/mcp-playbook.md`](docs/webflow/mcp-playbook.md) | Syncing to Webflow with the MCP |
| [`docs/webflow/sync-log.md`](docs/webflow/sync-log.md) | History of syncs to the production site |
| [`docs/webflow/archive/test-site/`](docs/webflow/archive/test-site/README.md) | Read-only records of the test stage |

## Notes

- Testimonial cards reveal the written quote on hover, and the carousel arrows cycle the cards.
- The FAQ is a working accordion. Only the first answer came from the design; the rest are
  placeholder copy to review with the client.
- The "How Flint Works" image slots are empty placeholder panels in the design and are implemented as such.
