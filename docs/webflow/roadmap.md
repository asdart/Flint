# Roadmap — Flint migration to Webflow

The plan for moving the legacy React/Tailwind site into Webflow under the contract in
[`AGENTS.md`](../../AGENTS.md). Registries hold the details; this file holds the order and the status.

**How to use:** tick an item when it is merged in the repo _and_, if it involves Webflow, synced and
logged in [`sync-log.md`](sync-log.md). Record new decisions in the Decisions section before acting
on them. Don't start a phase before the previous phase's exit criteria are met, unless noted.

**Status legend:** ☐ to do · ◐ in progress · ☑ done

| Phase | Goal | Status |
| --- | --- | --- |
| 0 | Decisions and setup | ◐ |
| 1 | **MVP**: one vertical slice built end to end | ☐ |
| 2 | Foundations complete | ☐ |
| 3 | Global and UI components | ☐ |
| 4 | Sections | ☐ |
| 5 | Static pages | ☐ |
| 6 | Blog and CMS | ☐ |
| 7 | Motion and illustrations | ☐ |
| 8 | Custom-code exceptions | ☐ |
| 9 | QA and launch prep | ☐ |
| 10 | Launch and cleanup | ☐ |

---

## Decisions

### Decided

| ID | Decision | Date | Applied in |
| --- | --- | --- | --- |
| D-01 | Class naming is FlowKit v2 (`fk-` prefix, `is-*` combos) | 2026-09-23 | `classes.md` |
| D-02 | Related posts show posts from the same category, excluding the current post. Legacy showed the first 3 posts | 2026-09-23 | `cms.md` → Collection lists |
| D-03 | Webflow site is `Flint` (short name `flint-4167fa`, ID `6ab46032460da07da9dc6231`), workspace `paulos-workspace-442e65` | 2026-09-23 | `AGENTS.md` §9 |

### To decide before the full migration (phases 2–10)

None of these block the MVP. All must be closed before the phase noted in "Needed by".

| ID | Question | Options | Needed by | Status |
| --- | --- | --- | --- | --- |
| P-01 | How is the physics avatar gallery (`x-gravity-gallery`) built? | (a) Webflow Code Component with Matter.js · (b) replace with a static collage + `ix-reveal-stagger` | Phase 8 (CTA section in phase 4 needs a placeholder) | open |
| P-02 | Does the blog post template get a table of contents (`x-article-toc`)? | (a) Small page script that builds it from the body H2s · (b) no TOC · (c) manual TOC field in the CMS | Phase 6 | open |
| P-03 | What do `WhyFacilities` and `ModernFacility` become? | (a) Variants of `Section / Feature Grid` · (b) their own sections. Review against Figma | Phase 4 | open |
| P-04 | How are the ~9 animated illustrations produced? _(proposed)_ | (a) Lottie made in After Effects or a Figma plugin (who makes them?) · (b) rebuild as Interaction timelines · (c) static SVG at launch, animate later | Phase 7 (phase 4 uses static SVGs meanwhile) | open |
| P-05 | Where do form submissions go (Facility Apply form, newsletter)? _(proposed)_ | Webflow Forms with email notifications · Webflow Forms + webhook to a CRM/ESP · an external embed (would be an exception) | Phase 4 | open |
| P-06 | Which Webflow site plan, and which custom domain? _(proposed)_ | Needs a CMS-capable plan for about 30 posts plus categories and authors. Check limits before phase 6 | Phase 6 (plan), phase 10 (domain) | open |
| P-07 | Is it acceptable that stat numbers animate as a whole instead of digit by digit? _(proposed)_ | (a) Yes, native `ix-count-in` · (b) no, add a digit script exception | Phase 7 | open |
| P-08 | Who supplies the missing content? _(proposed)_ | FAQ answers 2+, real footer URLs, About Team copy, bodies for non-featured posts | Phase 9 | open |

---

## Phase 0 — Decisions and setup

- [x] Contract and registries (`AGENTS.md`, `docs/webflow/*`)
- [x] Webflow site created and recorded (D-03)
- [x] MCP authenticated. Site baseline read: 1 default Home page, no CMS collections, default
      `Base collection` variables only (see `sync-log.md`)
- [x] Proposed MVP (phase 1)
- [ ] Confirm the MVP scope below
- [ ] Install the **Webflow MCP Bridge** app in the Designer, for steps that need the canvas

## Phase 1 — MVP

### Goal

Build **one thin vertical slice that touches every layer of the contract**, both in the repo and in
Webflow, on a page that isn't public. It should show how the MCP creates each kind of thing, what
works headlessly and what needs the Designer, and whether the result matches the React preview.
Nothing from the MVP is thrown away: every piece is a real registry entry that later phases reuse.

### Slice

A draft page **`MVP` at `/mvp`**: not in the nav, excluded from search, never published to the
custom domain.

| Order | Piece | Why it's in the MVP | Content source |
| --- | --- | --- | --- |
| 1 | `Global / Nav` (Light variant) | Global component, variant, active link state, mobile menu, and the hardest native interaction (`ix-nav-pill`) | `components/SiteNav.tsx`, `nav.ts` |
| 2 | `Section / Text Panel` | Tag styles, panel background combos, `UI / Section Header`, `ix-reveal` | About → Mission |
| 3 | `Section / Stats Band` | Grid breakpoints, component props (`UI / Stat`), `ix-count-in` | About → ImpactStats (4 stats) |
| 4 | `Section / Post Grid` (Related-style, 3 posts) | CMS collections, references, a Collection List bound to `UI / Post Card` | `posts.ts` (3 posts) |
| 5 | `Global / Footer` | Reuse of `UI / Button`, static link groups, inverse typography | `sections/Footer.tsx` |

### Deliverables

**Repo** (source of truth, built first):

- [ ] `src/styles/tokens.css`: every token in `tokens.md`
- [ ] `src/styles/base.css`, `layout.css`, `typography.css`
- [ ] `src/styles/components/`: `button.css`, `nav.css`, `footer.css`, `section-header.css`, `stat.css`,
      `post-card.css`, `badge.css`
- [ ] `components/global/Nav.tsx`, `components/global/Footer.tsx`
- [ ] `components/ui/Button.tsx`, `SectionHeader.tsx`, `Stat.tsx`, `PostCard.tsx`
- [ ] `sections/TextPanel.tsx`, `StatsBand.tsx`, `PostGrid.tsx`
- [ ] `src/content/categories.json`, `authors.json`, `posts.json` (3 posts, shaped like `cms.md`)
- [ ] `src/ix/`: preview runtime for `ix-reveal`, `ix-count-in`, `ix-nav-pill`, `ix-nav-menu`
- [ ] `pages/MvpPage.tsx` on route `/mvp`. Legacy pages stay untouched
- [ ] No Tailwind or Framer Motion in any new file; `npm run build` and `npm run lint` pass

**Webflow** (following `mcp-playbook.md` in order):

- [ ] Site instruction created from `AGENTS.md` (playbook step 0)
- [ ] Fonts SN Pro and STIX Two Text
- [ ] Variable collection `Flint` with every token
- [ ] Tag styles and the classes used by the slice, including Tablet/Mobile values and states
- [ ] Components: Button, Section Header, Stat, Post Card, Nav, Footer, Text Panel, Stats Band, Post Grid
- [ ] CMS: Categories (5), Authors (1), Posts (3, drafts). Leave out the featured article's placeholder bullets
- [ ] Draft page `/mvp` with the five pieces in order
- [ ] Interactions `ix-reveal`, `ix-count-in`, `ix-nav-pill`, `ix-nav-menu`
- [ ] `sync-log.md` rows with every Webflow id created

### Questions the MVP must answer

| # | Question | Answer (fill in after the MVP) |
| --- | --- | --- |
| Q1 | Can variables, tag styles, breakpoint styles and states be created headlessly with `data_style_tool` / `data_variable_tool`? | |
| Q2 | Can component props and variants be created and bound headlessly, or is the Designer needed? | |
| Q3 | Can a Collection List with `UI / Post Card` bindings be built through the MCP? | |
| Q4 | Can the interactions be created by class with `data_interactions_tool`, with reduced motion respected? Does `ix-nav-pill` work natively? | |
| Q5 | Does the Webflow page match the React `/mvp` preview at Desktop, Tablet, Mobile landscape and Mobile portrait? | |
| Q6 | Is a second sync of the same slice idempotent (updates, no duplicates)? | |
| Q7 | Which contract rules or registry entries were wrong or missing? | |

### Exit criteria

- [ ] `/mvp` reviewed in the Designer by the user. The staging `webflow.io` publish happens only if
      the user asks, via `/safe-publish`
- [ ] Q1–Q7 answered above
- [ ] `AGENTS.md`, registries and `mcp-playbook.md` updated with the findings (bump to contract v1.1
      if rules changed)
- [ ] Go / no-go for phases 2–10 recorded as a new decision

**Out of scope for the MVP:** heroes, illustrations, custom-code exceptions, other pages, SEO settings, forms.

## Phase 2 — Foundations complete

- [ ] Remaining classes in `classes.md` (layout, typography, utilities) in the repo and in Webflow
- [ ] Remove duplicated tokens from `src/index.css` `@theme`, pointing legacy code to `tokens.css`
- [ ] Style guide page (draft) in Webflow showing tokens, type scale and buttons, for visual QA

## Phase 3 — Global and UI components

- [ ] `Global / Nav` Dark variant, and move the Nav out of all 6 legacy heroes
- [ ] Remaining UI components: Service Card, Testimonial Card, FAQ Item, Newsletter Form, Portrait,
      Illustration (see `components.md`)

## Phase 4 — Sections

Needs P-03 and P-05 closed. Illustrations use static SVGs until phase 7.

- [ ] Hero (Home, Candidates, Facility Partners, About, Blog) and Article Hero
- [ ] Logo Marquee, Two Ways, Partners Map, How It Works (3 variants)
- [ ] Feature Grid, plus the result of P-03
- [ ] Testimonials (Slider, Single), FAQ, Facility Grid
- [ ] Media Split, Logo Grid, Team Grid
- [ ] CTA (Gallery with a placeholder until P-01, Simple), Apply Form, Newsletter
- [ ] Post Index, Article Body

## Phase 5 — Static pages

- [ ] Home, Candidates, Facility partners, About: composed as in `components.md` → Pages
- [ ] Page settings: titles, meta descriptions, OG images
- [ ] Delete each legacy section/page file once its replacement is migrated (with user confirmation)

## Phase 6 — Blog and CMS

Needs P-02 and P-06 closed.

- [ ] Import all posts, categories and authors (`/bulk-cms-update`), as drafts
- [ ] Blog index with featured post and native pagination (6 per page)
- [ ] Blog post template, including Related posts (D-02) and the P-02 result
- [ ] Blog category template pages, and category links replacing the legacy `Select` filter

## Phase 7 — Motion and illustrations

Needs P-04 and P-07 closed.

- [ ] Remaining interactions in `interactions.md`: reveal-stagger, parallax, marquee, ticker, FAQ, testimonial hover
- [ ] Illustrations produced and placed per P-04, with static fallbacks for reduced motion

## Phase 8 — Custom-code exceptions

- [ ] `x-gravity-gallery` per P-01
- [ ] `x-article-toc` per P-02 (if approved)
- [ ] Exceptions table in `interactions.md` matches what is actually installed (`data_scripts_tool` → `get_site_scripts`)

## Phase 9 — QA and launch prep

- [ ] `/site-audit`, `/accessibility-audit`, `/link-checker`, `/asset-audit` pass, with fixes applied
- [ ] Visual comparison against Figma at all four breakpoints
- [ ] 404 page, favicon, sitemap, robots, social images
- [ ] Forms tested end to end (P-05)
- [ ] Content gaps closed (P-08, backlog below)

## Phase 10 — Launch and cleanup

- [ ] Custom domain connected (P-06)
- [ ] Publish via `/safe-publish`, with explicit confirmation
- [ ] Remove `tailwindcss`, `@tailwindcss/vite`, `framer-motion` and legacy files from the repo
- [ ] `AGENTS.md` status set to "migrated". From then on the repo is maintained per the contract only

---

## Backlog — content fixes

- [ ] About → Team section repeats the Investors copy ("What makes Flint different / Backed by the best")
- [ ] Footer: "LinkeDin" → "LinkedIn", and real URLs for all links that point to `/`
- [ ] FAQ answers after the first are placeholders
- [ ] Featured article: remove the placeholder bullets about Flint, Michigan
- [ ] Non-featured posts have only an excerpt, and need bodies
