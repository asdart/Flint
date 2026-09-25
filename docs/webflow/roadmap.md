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
| 1 | **MVP**: one vertical slice built end to end | ☑ closed 2026-09-24 |
| 2 | Foundations complete | ◐ built, waiting for the style guide review |
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
| D-04 | MVP closed after the user's review. The approach (repo → MCP, contract v1.1) holds; phase 2 starts only when the user says so | 2026-09-24 | This file, `AGENTS.md` status |
| D-05 | The nav has a single CTA (Secondary Small) in both rest and pill states | 2026-09-24 | `components.md`, `classes.md` |
| D-06 | The primary button hover matches the repo exactly (gradient angle rotation) through custom-CSS exception `x-button-gradient`, installed once the plan allows custom code. Icons are SVG files; buttons have no icon by default | 2026-09-24 | `interactions.md`, `classes.md`, `components.md`, `AGENTS.md` rules 10 and 14 |
| D-07 | Two-line clamps and antialiased font smoothing match the repo through custom-CSS exception `x-text-rendering` (the style API rejects those properties), installed with `x-button-gradient` | 2026-09-25 | `interactions.md`, `classes.md` |

### To decide before the full migration (phases 2–10)

None of these block the MVP. All must be closed before the phase noted in "Needed by".

| ID | Question | Options | Needed by | Status |
| --- | --- | --- | --- | --- |
| P-01 | How is the physics avatar gallery (`x-gravity-gallery`) built? | (a) Webflow Code Component with Matter.js · (b) replace with a static collage + `ix-reveal-stagger` | Phase 8 (CTA section in phase 4 needs a placeholder) | open |
| P-02 | Does the blog post template get a table of contents (`x-article-toc`)? | (a) Small page script that builds it from the body H2s · (b) no TOC · (c) manual TOC field in the CMS | Phase 6 | open |
| P-03 | What do `WhyFacilities` and `ModernFacility` become? | (a) Variants of `Section / Feature Grid` · (b) their own sections. Review against Figma | Phase 4 | open |
| P-04 | How are the ~9 animated illustrations produced? _(proposed)_ | (a) Lottie made in After Effects or a Figma plugin (who makes them?) · (b) rebuild as Interaction timelines · (c) static SVG at launch, animate later | Phase 7 (phase 4 uses static SVGs meanwhile) | open |
| P-05 | Where do form submissions go (Facility Apply form, newsletter)? _(proposed)_ | Webflow Forms with email notifications · Webflow Forms + webhook to a CRM/ESP · an external embed (would be an exception) | Phase 4 | open |
| P-06 | Which Webflow site plan, and which custom domain? _(proposed)_ | Needs a CMS-capable plan for about 30 posts plus categories and authors, and site custom code for `x-button-gradient` (D-06). Check limits before phase 6 | Phase 6 (plan), phase 10 (domain) | open |
| P-07 | Is it acceptable that stat numbers animate as a whole instead of digit by digit? _(proposed)_ | (a) Yes, native `ix-count-in` · (b) no, add a digit script exception | Phase 7 | open |
| P-08 | Who supplies the missing content? _(proposed)_ | FAQ answers 2+, real footer URLs, About Team copy, bodies for non-featured posts | Phase 9 | open |

---

## Phase 0 — Decisions and setup

- [x] Contract and registries (`AGENTS.md`, `docs/webflow/*`)
- [x] Webflow site created and recorded (D-03)
- [x] MCP authenticated. Site baseline read: 1 default Home page, no CMS collections, default
      `Base collection` variables only (see `sync-log.md`)
- [x] Proposed MVP (phase 1)
- [x] Confirm the MVP scope below
- [x] **Webflow MCP Bridge** app connected in the Designer

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

- [x] `src/styles/tokens.css`: every token in `tokens.md`
- [x] `src/styles/base.css`, `layout.css`, `typography.css`
- [x] `src/styles/components/`: `button.css`, `nav.css`, `footer.css`, `section-header.css`,
      `stat.css` (Stat + Stats Band), `post-card.css` (Post Card + Post Grid). `badge.css` wasn't needed
- [x] `components/global/Nav.tsx`, `components/global/Footer.tsx`
- [x] `components/ui/Button.tsx`, `SectionHeader.tsx`, `Stat.tsx`, `PostCard.tsx`
- [x] `sections/TextPanel.tsx`, `StatsBand.tsx`, `PostGrid.tsx`
- [x] `src/content/categories.json` (5), `authors.json` (3), `posts.json` (3), shaped like `cms.md`
- [x] `src/ix/useInteractions.ts`: preview runtime for `ix-reveal`, `ix-count-in`, `ix-nav-pill`, `ix-nav-menu`
- [x] `pages/MvpPage.tsx` on route `/mvp`. Legacy pages stay untouched
- [x] No Tailwind or Framer Motion in any new file; `npm run build` and `npm run lint` pass
- [x] Checked in the browser at 1310, 800 and 390px: layout, nav pill, mobile menu open/close

**Webflow** (following `mcp-playbook.md` in order):

- [x] Site instruction created from `AGENTS.md` (playbook step 0)
- [x] Fonts SN Pro and STIX Two Text
- [x] Variable collection `Flint` with every token (54)
- [x] Classes used by the slice, including Tablet/Mobile values and states. Tag styles turned out
      not to be writable, so typography moved onto classes (contract v1.1)
- [x] Components: Nav, Footer, Text Panel (props + variant), Stats Band. Post Grid can't be a
      component (bound Collection List); Button, Section Header, Stat and Post Card are plain
      markup inside those for now (see findings)
- [x] CMS: Categories (5), Authors (3), Posts (3) from `src/content/`, staged (not published)
- [x] Draft page `/mvp` with the five pieces in order, Collection List bound to Posts
- [x] Interactions `ix-reveal`, `ix-count-in`, `ix-nav-pill`, `ix-nav-menu` (+ `ix-nav-menu-close`)
- [x] `sync-log.md` row and every id in `webflow-ids.json`
- [x] Sync scripts: `scripts/webflow-css.mjs`, `scripts/webflow-style-actions.mjs`

### Questions the MVP must answer

| # | Question | Answer (fill in after the MVP) |
| --- | --- | --- |
| Q1 | Can variables, tag styles, breakpoint styles and states be created headlessly with `data_style_tool` / `data_variable_tool`? | **Mostly.** Variables, classes, combos, breakpoint and state styles: yes, linked to variables. Tag styles and Body styles: no, so typography and body defaults live on classes. Compound values (gradients, shadows) store literals, not variables |
| Q2 | Can component props and variants be created and bound headlessly, or is the Designer needed? | **Yes.** Components from elements, props, prop bindings, variants and variant styles all worked without the Designer |
| Q3 | Can a Collection List with `UI / Post Card` bindings be built through the MCP? | **Yes, as page markup.** Source, sort, limit and field bindings (including referenced Author fields) all worked. A component can't contain a bound Collection List, so the Post Grid is a page pattern. The canvas needs a reload to show CMS data created during the session, and hides draft items |
| Q4 | Can the interactions be created by class with `data_interactions_tool`, with reduced motion respected? Does `ix-nav-pill` work natively? | **Yes.** Class, attribute and body targets, class toggles and the reduced-motion condition all work. Reversing doesn't undo a class toggle, so states that return are pairs (`ix-nav-pill` / `-rest`, `ix-nav-menu` / `-close`). No blur |
| Q5 | Does the Webflow page match the React `/mvp` preview at Desktop, Tablet, Mobile landscape and Mobile portrait? | **Yes, after small fixes.** The user's review found the logo size and link underlines off (fixed in the Designer and pulled back) and the nav not returning to rest (fixed with `ix-nav-pill-rest`) |
| Q6 | Is a second sync of the same slice idempotent (updates, no duplicates)? | **No for creates, yes for updates.** Re-creating a name adds `-2` (variables, fields) or is dropped (builder classes); `update_style` is idempotent. Query first and keep `webflow-ids.json` current |
| Q7 | Which contract rules or registry entries were wrong or missing? | Tag styles layer, `fk-page` on Body, media query syntax, `min-width` queries, reveal as a class (now `data-ix`), blur, grouped/parent-state selectors, Post Grid as a component, `published-on` slug, transparency tokens, button hover. All fixed in contract v1.1 and the registries |

### Exit criteria

- [x] `/mvp` reviewed in the Designer by the user (logo size, link underline and nav rest state
      fixed on 2026-09-24). Not published
- [x] Q1–Q7 answered above
- [x] `AGENTS.md`, registries and `mcp-playbook.md` updated with the findings (contract v1.1)
- [x] Go / no-go recorded (D-04: closed, phase 2 waits for the user)

Carried into phase 2 (not blocking the close), done 2026-09-24:

- [x] Cleanup (approved by the user): deleted variable `color-ink-2`, the unused style
      `fk-nav-cta-pill` and the 3 empty spans; `published-on-2` replaced by `publish-date`
- [x] Nav/Footer buttons rebuilt as `UI / Button` instances (4 variants, Label and Link props);
      nav toggle and close are native buttons with focus-visible rings

**Out of scope for the MVP:** heroes, illustrations, custom-code exceptions, other pages, SEO settings, forms.

## Phase 2 — Foundations complete

- [x] Remaining classes in `classes.md` (layout, typography, utilities) in the repo and in Webflow.
      All were already in both; `scripts/webflow-diff.mjs` now proves it (no differences on
      2026-09-25) after fixing `fk-sr-only` borders, a leftover `fk-nav-cta` value and the
      post-card clamp (moved to exception `x-text-rendering`, D-07)
- [x] Remove duplicated tokens from `src/index.css` `@theme`, pointing legacy code to `tokens.css`
      (`@theme reference`). Legacy `rounded-lg/xl/2xl` had been rendering with the Flint radii;
      renamed to the tokens with the old pixel values (`rounded-sm/md/lg`)
- [x] Style guide page (draft) in the repo (`/style-guide`) and in Webflow (draft page
      `/style-guide`): type scale, buttons, panel colors, grids, divider
- [ ] Review `/style-guide` in the Designer against the repo at the four breakpoints (user)

## Phase 2b — MVP 2: the homepage at 1:1 parity

Plan, spikes, per-section approach and open decisions: [`mvp2-home.md`](mvp2-home.md).

- [ ] Capability spikes S1–S6 on a draft Lab page
- [ ] Decisions H-1…H-7 in `mvp2-home.md` closed with the user (H-2, H-4…H-7 decided
      2026-09-25; H-1 and H-3 wait for spikes S1 and S3)
- [ ] Repo `/mvp-home` built from contract sections; screenshots match legacy `/` at 4 widths
- [ ] Webflow draft `/mvp-home` built from the repo render; diff clean; reviewed in the Designer

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
- [ ] `x-button-gradient` and `x-text-rendering` installed as site head code once the plan allows it (D-06, D-07, P-06); then
      check the primary hover in Preview against the repo
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
- [ ] Footer: real URLs for the links that are `#` in `Global / Footer` ("LinkeDin" is already
      fixed there)
- [ ] "Apply now" buttons need a destination (they default to `#apply`)
- [ ] FAQ answers after the first are placeholders
- [ ] Featured article: remove the placeholder bullets about Flint, Michigan
- [ ] Non-featured posts have only an excerpt, and need bodies
- [ ] Home, kept verbatim in MVP 2 (H-7): testimonials "Minesota" and "Chrismene jones"; How It
      Works "13:30PM-14:30PM" and the "Jonathan Johnson" name on the `andrew` avatar; the Two Ways
      Facilities card repeats the Nurses body; How It Works Facility call and Processing share a body
