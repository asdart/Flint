# Flint — Marketing site

Marketing site for Flint, implemented from the [Figma design](https://www.figma.com/design/bFJIQUAnqKd2ueYqsV8rRd/Flint-Brand--Copy-?node-id=5552-19770).
The site is being **migrated to Webflow**. This repo is the blueprint and local preview for that
build.

> **Before changing anything, read [`AGENTS.md`](AGENTS.md).** It is the contract that keeps this
> code a 1:1 map of the Webflow site: tokens, class naming, components, CMS, interactions, and how
> changes are pushed with the Webflow MCP.

## Stack (current, legacy)

- [Vite](https://vite.dev) + React 19 + TypeScript + React Router
- [Tailwind CSS v4](https://tailwindcss.com) (tokens in `src/index.css`) — being replaced by the
  class system in `docs/webflow/classes.md`
- [Framer Motion](https://motion.dev) — being replaced by Webflow Interactions (`docs/webflow/interactions.md`)
- [Matter.js](https://brm.io/matter-js/) — physics avatar gallery in the CTA (a listed custom-code exception)
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
| `/` | Home |
| `/candidates` | Candidates |
| `/facility-partners` | Facility partners |
| `/about` | About |
| `/blog` | Blog index |
| `/blog/:slug` | Blog post |
| `/mvp` | Migration MVP (contract-based code; draft page `/mvp` in Webflow) |

## Structure

Current:

- `src/pages/` — page composition
- `src/sections/` — page sections (`blog/`, `facilities/`, `facility-partners/` subfolders)
- `src/components/` — shared pieces, illustrations, nav
- `src/sections/blog/posts.ts`, `featuredArticle.ts` — hardcoded blog content (future CMS seed)
- `public/assets/` — images and icons exported from Figma

The target structure (`styles/`, `components/global|ui/`, `sections/`, `content/`, `ix/`) is
defined in [`AGENTS.md` §6](AGENTS.md#6-target-repository-structure).

## Webflow migration docs

| Document | Purpose |
| --- | --- |
| [`AGENTS.md`](AGENTS.md) | Rules, definitions, workflow, definition of done |
| [`docs/webflow/roadmap.md`](docs/webflow/roadmap.md) | Migration phases, the MVP, decisions |
| [`docs/webflow/tokens.md`](docs/webflow/tokens.md) | Variables (colors, fonts, sizes, motion) |
| [`docs/webflow/classes.md`](docs/webflow/classes.md) | FlowKit class registry and tag styles |
| [`docs/webflow/components.md`](docs/webflow/components.md) | Global/UI/Section components, pages, migration status |
| [`docs/webflow/cms.md`](docs/webflow/cms.md) | Collections and collection lists |
| [`docs/webflow/interactions.md`](docs/webflow/interactions.md) | Interactions and custom-code exceptions |
| [`docs/webflow/mcp-playbook.md`](docs/webflow/mcp-playbook.md) | Syncing to Webflow with the MCP |
| [`docs/webflow/sync-log.md`](docs/webflow/sync-log.md) | History of Webflow syncs |

## Notes

- Testimonial cards reveal the written quote on hover, and the carousel arrows cycle the cards.
- The FAQ is a working accordion. Only the first answer came from the design; the rest are
  placeholder copy to review with the client.
- The "How Flint Works" image slots are empty placeholder panels in the design and are implemented as such.
