# Roadmap — Flint migration to Webflow

The plan for moving the legacy React/Tailwind site into Webflow under the contract in
[`AGENTS.md`](../../AGENTS.md). Registries hold the details; this file holds the order and the status.

**How to use:** tick an item when it is merged in the repo _and_, if it involves Webflow, synced and
logged in [`sync-log.md`](sync-log.md). Record new decisions in the Decisions section before acting
on them. Don't start a phase before the previous phase's exit criteria are met, unless noted.

**Status legend:** ☐ to do · ◐ in progress · ☑ done

## Webflow target

**Production** is the only Webflow target: the client's account, populated **from scratch** by
replaying the repo (track P), then the sync target for every later phase. Access arrived
2026-09-29 (P-09): the site is `Flint` (`6ab9ba4aeffb3329202448ee`), empty and never published. The test stage's records (ids, sync log, homepage plan) are archived in
[`archive/test-site/`](archive/test-site/README.md).

The repo is the source of truth. Nothing is copied from the test site to production: every class,
component, page and item is rebuilt from `src/` and the registries with the recipes in the
[`flint-webflow-sync`](../../.agents/skills/flint-webflow-sync/SKILL.md) skill.

## Phases

| Phase | Goal | Webflow target | Status |
| --- | --- | --- | --- |
| 0–2 | **Test stage**: contract, foundations, MVP 1 (vertical slice) and MVP 2 (homepage at 1:1 parity) | Test site (archived) | ☑ closed 2026-09-25 (D-08) |
| P | **Production site**: access, then populate from scratch with everything built so far | Production | ◐ in progress (P.1 setup started 2026-09-29) |
| 3 | Global and UI components | Production | ◐ Home components built in the repo |
| 4 | Sections | Production | ◐ Home sections built in the repo |
| 5 | Static pages | Production | ☐ |
| 6 | Blog and CMS | Production | ☐ |
| 7 | Motion and illustrations | Production | ☐ |
| 8 | Custom-code exceptions | Production | ☐ |
| 9 | QA and launch prep | Production | ☐ |
| 10 | Launch and cleanup | Production | ☐ |

Track P can start between any two phases: finish the item in progress, replay, then continue the
next phase on production.

---

## Decisions

### Decided

| ID | Decision | Date | Applied in |
| --- | --- | --- | --- |
| D-01 | Class naming is FlowKit v2 (`fk-` prefix, `is-*` combos) | 2026-09-23 | `classes.md` |
| D-02 | Related posts show posts from the same category, excluding the current post. Legacy showed the first 3 posts | 2026-09-23 | `cms.md` → Collection lists |
| D-03 | The test stage runs on a separate **test** Webflow site (see D-09 for production). Its records are archived | 2026-09-23 | `archive/test-site/README.md` |
| D-04 | MVP closed after the user's review. The approach (repo → MCP, contract v1.1) holds | 2026-09-24 | This file, `AGENTS.md` status |
| D-05 | The nav has a single CTA (Secondary Small) in both rest and pill states | 2026-09-24 | `components.md`, `classes.md` |
| D-06 | The primary button hover matches the repo exactly (gradient angle rotation) through custom-CSS exception `x-button-gradient`, installed once the plan allows custom code. Icons are SVG files; buttons have no icon by default | 2026-09-24 | `interactions.md`, `classes.md`, `components.md`, `AGENTS.md` rules 10 and 14 |
| D-07 | Two-line clamps and antialiased font smoothing match the repo through custom-CSS exception `x-text-rendering` (the style API rejects those properties), installed with `x-button-gradient` | 2026-09-25 | `interactions.md`, `classes.md` |
| D-08 | The test stage (phases 0–2) is closed. Its open reviews and staging re-checks are closed as test findings and re-checked on production ([carried checks](#carried-into-production-qa)) | 2026-09-25 | This file |
| D-09 | Production lives in the **client's Webflow account** on a **Premium** plan (user, 2026-09-29: it covers everything the build needs, including CMS and site custom code; the contract had assumed Business/Enterprise). It starts empty and is populated from scratch from the repo. The site exists since 2026-09-28: name `Flint`, short name `fint-fc2589` ("fint" kept on purpose, staging `fint-fc2589.webflow.io`), site ID `6ab9ba4aeffb3329202448ee`, workspace `6903cd68560df35a819fcc12`, time zone America/Vancouver, no custom domain | 2026-09-25 | This file, `AGENTS.md` §9 once the site exists |
| D-10 | The mobile menu's scroll lock keeps `overscroll-behavior: contain`. It was planned as custom-CSS exception `x-scroll-lock`, but the style API accepts the property, so since 2026-09-29 it sits on `fk-nav-menu` and `fk-nav-menu-links` and the exception is retired. The body lock stays native (`ix-nav-menu`) | 2026-09-26, updated 2026-09-29 | `interactions.md`, `classes.md` |
| D-11 | New CSS system direction: a utilities layer (`tokens → utilities → primitives → blocks`) sits between tokens and classes, so repeated single-property rules (`display: flex`, `gap`, alignment…) stop needing a combo per base class. Gated on spike S7 (stacked standalone classes through the MCP), which passed 2026-09-27. Three sub-decisions: responsive utilities use suffix naming (`-tablet`/`-mobile`/`-phone`, max-width only); panel colors move from `fk-panel is-*` combos to `fk-bg-*` utilities; a new primitive `fk-section-header-action` replaces the repeated `*-action` block elements. Full spec and the S7 evidence in [`css-system.md`](css-system.md) | 2026-09-27 | `css-system.md` (proposed, becomes contract 1.6 once migrated) |
| D-12 | How It Works card art redesigned from Figma (node 5746:992 desktop, 5483:860 mobile), **supersedes H-4** ("one image per card"). Cards now get a solid `color-tertiary` background (`is-brand-light` → `color-brand-light` on card 5 "Start work") with a full-bleed `-bg` raster (photo/gradient/pattern) and, on 5 of 6 cards, a floating `-art` illustration on top (card 4 "Relocate" has none); cards 2 and 6 (inverse copy over a photo) add a `-scrim` gradient. Card 3's copy also changed to match Figma ("Interview Directly with Facilities" / "We present you with facilities. You choose who to interview.") | 2026-09-27 | `classes.md` → `fk-how`, `components.md` → Section / How It Works, `sections/HowItWorks.tsx` |
| D-13 | Twitter card values come from each page's Open Graph settings (Webflow has no separate Twitter fields); no exception needed (was P-11) | 2026-09-27 | `seo.md` S-02 |
| D-14 | `llms.txt` uses Webflow's native upload (Site settings → SEO → LLMs.txt; UTF-8, under 100 KB), served at `/llms.txt` on the custom domain only and never indexed. The source is `public/llms.txt` in the repo, uploaded by hand after each change (not reachable through the MCP); checked after the custom-domain publish (was P-13) | 2026-09-27 | `seo.md` S-21 |
| D-15 | Blog content comes from the client's current site (export of 2026-09-28): posts get categories assigned by topic, Flint Editorial Team is the author of every post for now, bodies are cleaned to plain rich text with the removed custom code tracked, excerpts are rewritten for SEO, read time is a Number field, and the quick answer moves to its field | 2026-09-28 | `cms.md`, `blog-custom-code.md` |
| D-16 | Blog: where the Figma frames disagree, the desktop frame wins. The phone keeps the category select and numbered pagination (no "Load more"), the hero copy is "The Flint blog" / "Immigration, licensing, and hiring tips…", and the phone featured card keeps the built look (gradient scrim, no full-image blur) | 2026-09-29 | `components.md`, `classes.md` → `fk-featured-post`, `fk-pager` |
| D-17 | **Mixed section model:** a section becomes a `Section /` component only when it is used, or planned (user's call), on more than one page; a section used once stays plain page markup (like the Post Grid pattern) and becomes a component the moment a second page needs it. Components today: **Hero, Logo Marquee, Role Grid, Testimonials**. Page-level markup on Home: **Two Ways, Pricing, Partners Map, How It Works, Webinar, Feature Grid, CTA**. Section components get props only where content differs per page (`components.md` lists them); Hero stays at its Home variant until other pages need theirs. Home also omits Post Grid for now (user, 2026-09-29: the blog comes later; "Post Grid (Home)" is added in the blog phase, `src/pages/HomePage.tsx` unchanged) | 2026-09-29 | `AGENTS.md` 1.7 (rule 6, §3, §4, §6), `components.md` → Sections and Pages, site instruction `rules/flint-contract.md` |
| D-18 | **Rich Text nested styles:** the styles for elements inside a Rich Text element (h2–h4, p, lists, links, quotes, images) are Webflow Designer nested styles on the Rich Text class (`fk-article-body`). The MCP style API can't create descendant selectors, so they are seeded by hand once in the Designer, like tag styles, and never pushed by scripts. The repo mirrors them in one documented file, `src/styles/components/article-body.css`, the one exception to one selector per rule. Contract 1.8 | 2026-09-29 | `AGENTS.md` 1.8 (§4), `classes.md` → Rich Text nested styles, `css-system.md`, `mcp-playbook.md`, `flint-webflow-sync` skill |
| D-19 | The post hero's main image shows at its natural ratio (the 2.1:1 banners are not cropped), 552px wide at most, and is hidden at 479px and below, as in the phone frame. P-13 stays open for the cards | 2026-09-29 | `classes.md` → `fk-article-image`, `cms.md` → Posts template |
| D-20 | **Related Posts is a local page-markup section of the post page**, not Post Grid: a left-aligned "Related Insights" header ("More guides on nursing careers, US immigration, and healthcare staffing."), no button, up to 3 posts of the same category excluding the current one, Publish date ↓. The whole section is hidden when there are none (exception `x-related-empty`; Relocation and Licensing have 1 post each). Supersedes the Related use of Post Grid and the 2026-09-27 note about dropping the "Related Insights" copy; refines D-02. `Section / Newsletter` also got a **Stacked** variant for the post page | 2026-09-29 | `components.md` → Sections and Pages, `cms.md` → Collection lists, `interactions.md` → `x-related-empty` |

### Open

All must be closed before the phase noted in "Needed by".

| ID | Question | Options | Needed by | Status |
| --- | --- | --- | --- | --- |
| P-01 | How is the physics avatar gallery (`x-gravity-gallery`) built? | (a) Webflow Code Component with Matter.js · (b) replace with a static collage + `ix-reveal-stagger` | Phase 8 (CTA Gallery in phase 4 needs a placeholder) | open |
| P-02 | Does the blog post template get a table of contents (`x-article-toc`)? | (a) Small page script that builds it from the body H2s · (b) no TOC · (c) manual TOC field in the CMS | Phase 6 | **closed (a), 2026-09-29** (user): the TOC is built from the body H2s by `x-article-toc`, desktop only, sticky, with scroll-spy. Approved in `interactions.md`; `cms.md` → Body decisions |
| P-03 | What do `WhyFacilities` and `ModernFacility` become? | (a) Variants of `Section / Feature Grid` · (b) their own sections. Review against Figma | Phase 4 | open |
| P-04 | How are the ~9 animated illustrations produced? _(proposed)_ | (a) Lottie made in After Effects or a Figma plugin (who makes them?) · (b) rebuild as Interaction timelines · (c) static SVG at launch, animate later | Phase 7 (phase 4 uses static SVGs meanwhile) | open |
| P-05 | Where do form submissions go (Facility Apply form, newsletter)? _(proposed)_ | Webflow Forms with email notifications · Webflow Forms + webhook to a CRM/ESP · an external embed (would be an exception) | Phase 4 | open |
| P-06 | Which custom domain, and who manages DNS? | Client's domain; DNS access from the client | Phase 10 | open. The plan is Premium per D-09 and covers what the build needs |
| P-07 | Is it acceptable that stat numbers animate as a whole instead of digit by digit? _(proposed)_ | (a) Yes, native `ix-count-in` · (b) no, add a digit script exception | Phase 7 | open |
| P-08 | Who supplies the missing content? _(proposed)_ | FAQ answers 2+, real footer URLs, About Team copy, bodies for non-featured posts | Phase 9 | open |
| P-09 | Production access: which site and workspace, which role, and can the Webflow MCP be authorized on the client's account? | We need Designer access with site settings and custom code rights, and the MCP's OAuth app approved for the client's workspace (may need a workspace admin). Confirm the exact plan and whether the site is new and empty | Track P | access answered 2026-09-29: the Webflow MCP is authorized on the client's workspace and `get_site` returns the production site (new, empty, never published). Plan: **Premium**, as stated by the user on 2026-09-29 (the MCP doesn't expose it). The user confirmed on 2026-09-29 that Premium covers everything the build needs (CMS, custom code, pages) |
| P-12 | Which page is the "role page" in the PageSpeed check (`seo.md` S-15)? The roadmap has no role pages yet | Name the page, and add it to `components.md` → Pages if it's new | Phase 5 | open, to decide later (user, 2026-09-27) |
| P-13 | The post main images are text banners (about 2.1:1) and the card crops them to 1.4:1 (3.5:1 on mobile landscape), cutting off the headline | (a) New card-ready images from the client · (b) change the card image ratio to fit the banners · (c) accept the crop | Phase 6 | open |
| P-14 | Do post FAQs get `FAQPage` schema (`seo.md` S-08)? The FAQs are now rich text | (a) A plain-text field holding each post's FAQ JSON-LD, inserted by `x-schema-post` (pairs ready in `blog-embeds/faq-pairs.json`) · (b) no FAQ schema on posts | Phase 6 | open |
| P-15 | Does Webflow's native Collection List pagination offer numbered page links? The design (desktop, decided D-16) has numbered pages plus prev / next on every breakpoint. Webflow's native pagination is Previous / Next plus a page count; numbered links aren't confirmed native (asking Webflow AI, 2026-09-28, gave no answer). The repo builds numbered links | (a) Native numbered pagination if the Designer offers it (check before P.6) · (b) Previous / Next styled as the two arrows, with the page count · (c) numbered links from a script (exception `x-blog-pagination`) | Phase 6 | open |

---

## Test stage — phases 0–2 (closed)

Everything here was built in the repo and rehearsed on the separate **test** Webflow site. The
per-sync log, the ids and the homepage plan and spike results are archived in
[`archive/test-site/`](archive/test-site/README.md).

### What it produced

- **Contract and tooling:** `AGENTS.md` (v1.4), the registries, the `flint-webflow-sync` skill with
  recipes and pitfalls, and the sync scripts (`webflow-css.mjs`, `webflow-style-actions.mjs`,
  `webflow-diff.mjs`, `webflow-markup.mjs`, `webflow-upload*.mjs`).
- **Foundations:** every token in `tokens.md` and every class in `classes.md`, with parity proven by
  `webflow-diff.mjs`. Legacy Tailwind reads the tokens (`@theme reference`). Style guide page `/style-guide`.
- **MVP 1** (a vertical slice, since superseded by the homepage and the registries): Nav, Footer, Text Panel, Stats Band, Post Grid (Related) bound to the CMS
  (Categories, Authors, Posts), and the first interactions.
- **MVP 2**: the full homepage at 1:1 parity with the legacy home (`/legacy`): Hero (Home), Logo
  Marquee, Two Ways, Partners Map, How It Works (Home), Feature Grid, Testimonials (Slider), Post
  Grid (Home), CTA (Art), plus `UI / Button`, `UI / Service Card` and `UI / Testimonial Card`.
- **Spikes**: blur reveal, marquee, arc, ticker, carousels and staggered reveals proven
  native in IX3 (S1–S6), verified on a published test-site page.

### What the MVP proved about the MCP

| # | Question | Answer |
| --- | --- | --- |
| Q1 | Can variables, tag styles, breakpoint styles and states be created headlessly? | **Mostly.** Variables, classes, combos, breakpoint and state styles: yes, linked to variables. Tag styles and Body styles: no, so typography and body defaults live on classes. Compound values (gradients, shadows) store literals, not variables |
| Q2 | Can component props and variants be created and bound headlessly? | **Yes.** Components from elements, props, prop bindings, variants and variant styles all work without the Designer |
| Q3 | Can a Collection List with `UI / Post Card` bindings be built through the MCP? | **Yes, as page markup.** A component can't contain a bound Collection List, so the Post Grid is a page pattern. The canvas needs a reload to show CMS data created during the session, and hides draft items |
| Q4 | Can the interactions be created by class, with reduced motion respected? | **Yes.** Reversing doesn't undo a class toggle, so states that return are pairs (`ix-nav-pill` / `-rest`, `ix-nav-menu` / `-close`). Class-toggle reveals need `skip-to-end` for reduced motion |
| Q5 | Does the Webflow page match the React preview at the four breakpoints? | **Yes, after small fixes** found in the user's reviews and pulled back into the repo |
| Q6 | Is a second sync idempotent? | **No for creates, yes for updates.** Re-creating a name adds `-2` or is dropped. Query first and keep the ids file current |
| Q7 | Which contract rules were wrong or missing? | Fixed in contract v1.1–v1.4 and the registries |

### Carried into production QA

Closed on the test site as findings (D-08). Each is re-checked on production in phase 9, or earlier
when the page is built there.

- [ ] Style guide reviewed in the Designer against the repo at the four breakpoints
- [ ] Homepage wave 3 (Hero, How It Works, Testimonials) reviewed in the Designer
- [ ] On the staging subdomain: S1 blur reveal with reduced motion (`skip-to-end`), then close H-1 in `archive/test-site/mvp2-home.md`
- [ ] On staging: S4 ticker cycle (unique items × step), and loop coverage for the arc, marquee and ticker
- [ ] On staging: How It Works carousel motion (H-11) and the testimonial hover freeze (H-12)
- [ ] Two Ways 2-line card titles against legacy (legacy is +3px per line from its word masks)

---

## Track P — Production site

Started 2026-09-29 (P-09 access answered). Follow `mcp-playbook.md` in its fixed order; each step replays what
the repo already holds, so no new design work happens here.

### P.1 Access and setup

- [x] Access granted per P-09; plan named (**Premium**, as stated by the user 2026-09-29); D-09 updated
      with the site's name, short name, ID, workspace and time zone. Premium covers everything the
      build needs (user, 2026-09-29)
- [x] Webflow MCP authorized on the client's account; `get_site` returns the production ID (2026-09-29)
- [x] `AGENTS.md` §9 filled in with the production site's name, short name, ID, workspace and home
      page ID (the rule "agents never target another site" then names that ID)
- [x] Ids per site: `webflow-ids.json` is the empty production template (the sync scripts read it)
      and the test stage's ids are archived in `archive/test-site/webflow-ids.json`
- [x] Site instruction (`rules/flint-contract.md`) created from `AGENTS.md` (id `6abbd3d2ad685df9550206d7`, 2026-09-29; update it whenever the contract version changes)
- [x] Tag styles seeded once in the Designer (Body, H1–H4, P, Link, Blockquote, Image) and synced from `base.css` (2026-09-29; `webflow-diff.mjs` covers them). Figure has no tag style: seed it in the Designer before pushing `margin: 0` there
- [x] **MCP Bridge** app installed and connected in the production Designer (2026-09-29: `designer_tool` reads and `element_snapshot_tool` answer on the Home page)
- [ ] SEO site settings (`seo.md`): global canonical URL (with the domain, P-06), auto sitemap,
      robots.txt with the sitemap link and no AI crawlers blocked, `llms.txt` uploaded per D-14, 404 page

### P.2 Populate from scratch

In this order. Record every id in `webflow-ids.json` and add one `sync-log.md` row per step.

- [x] Fonts: SN Pro 400/500/600 (600 = current page in `fk-pagination`), STIX Two Text 400, latin `.woff2`, `swap` (2026-09-29)
- [x] Variable collection `Flint` with every token in `tokens.md`: 65 variables (30 color, 2 font family, 33 size), read back equal to `tokens.css` (2026-09-29)
- [x] Assets (class CSS scope, 2026-09-29): the 2 SVG masks the class CSS references (`cta-ring.svg`, `cta-circle.svg`), uploaded with `webflow-upload-batch.mjs`. Component and page images (WebP, `webflow-markup.mjs` lookups) come later, with the components and pages that use them
  - Home component and page images uploaded 2026-09-29 (Stage 5, Post Grid/blog excluded): 63 keys, 62 assets (42 WebP, 21 SVG: logos, flags, feature icons, and the 4 `src/assets/icons/` icons Nav and Pricing import; `how-card-bg-5` is byte-identical to `-3`, so Webflow deduplicated both to one asset), recorded in `webflow-ids.json` → `assets`; `webflow-markup.mjs` resolves every Home file. The blog and other pages' images still to come. Stage 6a (2026-09-29): the Partners Map background now comes from `partners-map-bg.png` (`/assets/home/partners-map-bg.webp`, `6abbeee69a17c9a61e269b5c`); the earlier `map-bg.webp` (`6abbec0e30aee66eee756c6f`) is unused but still on the site (no deletes without confirmation) and is out of `webflow-ids.json`
- [x] Classes (2026-09-29): every non-legacy class in `layout.css`, `typography.css`, `utilities.css` and `components/*.css`, with breakpoints and states: 441 style chains (347 base incl. 178 utilities, 94 combos), 189 breakpoint/state updates; `webflow-diff.mjs` reports "No differences.". **Still Designer-only:** the five `w--current` / `w--open` state rules (`fk-nav-link`, `fk-nav-menu-link`, `fk-dropdown-link`, `fk-pagination-page`, `fk-input-field.is-select`), which the API can't create (`classes.md`)
- [ ] Components: `Global / Nav`, `Global / Footer`, the `UI / *` and `Section / *` components
      marked `migrated` in `components.md`, with props and variants
  - **Global and UI done 2026-09-29 (Stage 6b):** `UI / Button` (Primary, Secondary, Primary Small, Secondary Small, plus Secondary Full for the mobile menu), `UI / Testimonial Card`, `Global / Nav`, `Global / Footer`, built on the draft `/style-guide` and read back (ids in `webflow-ids.json` → `components`). **Stage 6c (2026-09-29, user decisions):** `UI / Section Header` and `UI / Service Card` are markup patterns, not components (both removed from Webflow); the Testimonial Card's Quote prop no longer holds the curly quotes (they are static text around a bound span); the Secondary Full Button variant stays. **Stage 7a (2026-09-29, D-17 mixed section model):** only Hero, Logo Marquee, Role Grid and Testimonials are `Section /` components; Two Ways, Pricing, Partners Map, How It Works, Webinar, Feature Grid and CTA are page-level markup. `Section / Hero` (`71b39630-…`) and `Section / Logo Marquee` (`2a73f492-…`) are built. **Stage 7b (2026-09-29):** `Section / Role Grid` (`50a1e198-…`, props Title, Body, Button Label, Button Link) and `Section / Testimonials` (`81e772c9-…`, prop Body) are built and placed on Home. Still to do outside this item: `UI / Post Card`, `Stat`, `Dropdown`, `Input Field`, the Newsletter form, and the `w--current` states in the Designer
- [ ] CMS: Categories, Authors, Posts with the fields in `cms.md`, seeded from `src/content/`
- [ ] Pages: Home (`/`, `src/pages/HomePage.tsx`) as composed in `components.md` → Pages;
      `/style-guide` as a draft. **Home in progress (Stage 7a, 2026-09-29):** `fk-page` > Nav, `main`, Footer, with sections 1–5 in `main` (Hero and Logo Marquee components, Two Ways, Pricing, Partners Map as page markup), structure compared with the repo render (0 differences, 350 nodes), snapshots match the repo heights at 1440. **Stage 7b (2026-09-29):** sections 6–11 added (How It Works, Webinar, Feature Grid, CTA as page markup; Role Grid and Testimonials as components), so Home is built minus Post Grid: 11 sections, structure compared with the repo render (0 differences, 739 nodes over all eleven), snapshots match the repo heights at 1440, one `h1`, page settings (title, description, Open Graph text) set. Home leaves out Post Grid until the blog phase (user, 2026-09-29). Still to do on Home: the OG image and schema (`seo.md`), the interactions (Stage 8)
- [ ] Interactions: every interaction in `interactions.md` marked `migrated`, with reduced-motion settings
- [ ] Custom code: CSS part done 2026-09-29 (`x-button-gradient` and `x-text-rendering`, one `<style>` block in the site head code, source `docs/webflow/custom-code/site-head.html`; `x-scroll-lock` retired, `overscroll-behavior` moved to the nav classes, D-10). **Waiting:** `x-schema-site` (real social profile URLs for `sameAs`) and `x-deferred-tracking` (a GTM container ID), deferred by the user (`seo.md` S-06, S-13)
- [ ] Assets uploaded as resized WebP (`seo.md` S-10); fonts only as uploaded custom fonts (S-12)
- [ ] Staging publish to the `webflow.io` subdomain (with confirmation), then the
      [carried checks](#carried-into-production-qa)

**Not replayed:** anything that isn't in the registries (the test stage's spike pages, `fk-lab-*`
classes and throwaway interactions stay in the archive).

### Exit criteria

- [ ] Production matches the repo for everything built so far: diff clean, Home reviewed in the Designer
- [ ] From here on, phases 3–10 sync to production

---

## CSS system — utilities layer (D-11)

Runs alongside Phase 3, ahead of the rest of the homepage refactor. Details in
[`css-system.md`](css-system.md).

- [x] Spike S7: stacked global classes through the MCP (passed 2026-09-27, `css-system.md` → S7 result)
- [x] `utilities.css` + registry section, generated from `tokens.css` by `scripts/gen-utilities.mjs`; contract 1.6 (2026-09-27)
- [x] Homepage refactored onto utilities (section by section, arc/carousel/testimonials geometry left for their own pass; 2026-09-27)
- [x] Grids become utilities; shared components (Nav, Footer, Button, Icon, Carousel Dots, Post Card) keep component classes (2026-09-28)

## Phase 3 — Global and UI components

Built in the repo: `UI / Button` (4 variants), `UI / Testimonial Card`, Service Card and Carousel Dots markup (Section Header is inline markup, no helper).

- [ ] `Global / Nav` Dark variant, and move the Nav out of all 6 legacy heroes
- [ ] Footer props (CTA Title, CTA Body) defined on the Webflow component
- [ ] `UI / Stat` Default; `UI / Post Card` Featured
      and a component-with-props version
- [ ] Remaining UI components: FAQ Item, Portrait, Illustration (Input Field and the newsletter form are built) (see `components.md`)

## Phase 4 — Sections

Needs P-03 and P-05 closed. Illustrations use static SVGs until phase 7.
Built in the repo (Home variants): Hero, Logo Marquee, Two Ways, Partners Map, How It Works, Feature
Grid (Cards), Testimonials (Slider), Post Grid (Home), CTA (Art). Also Text Panel and Stats Band (Large).

- [ ] Hero: Candidates, Facility Partners, About; and Article Hero (Blog Hero is built: page-level pattern, `components.md`)
- [ ] How It Works: Candidates and Facilities variants
- [ ] Feature Grid: Benefits variant, plus the result of P-03
- [ ] Stats Band Default; Testimonials Single; FAQ; Facility Grid
- [ ] Media Split, Logo Grid, Team Grid
- [ ] CTA Gallery (placeholder until P-01) and Simple; Apply Form (Newsletter is built in the repo)
- [ ] Post Index, Article Body

## Phase 5 — Static pages

- [ ] Home, Candidates, Facility partners, About: composed as in `components.md` → Pages
- [ ] Page settings per `seo.md`: title, meta description, OG image (also used for the Twitter card, D-13), noindex
      where needed, clean slugs; `FAQPage` schema on pages with an FAQ block (S-01…S-05, S-08)
- [ ] Delete each legacy section/page file once its replacement is migrated (with user confirmation)

## Phase 6 — Blog and CMS

Needs P-02 (closed 2026-09-29); P-13 and P-14 before the template.

- [x] Real posts prepared in the repo from the current site's export: categories, author, cleaned bodies, excerpts, WebP images with alt text (D-15, `cms.md` → Import from the current site)
- [ ] Import all posts, categories and authors through the MCP, as drafts
- [ ] Blog index with featured post and native pagination (6 per page). Built in the repo 2026-09-28 (`BlogPage.tsx`: `Section / Blog Hero`, `Section / Post Index`); Webflow build waits on P-15
- [ ] Blog post template, including Related posts (D-02) and the P-02 result. Built in the repo 2026-09-29 (`src/pages/BlogPostPage.tsx`); Webflow build waits on the CMS import
- [ ] Blog category template pages, and category links replacing the legacy `Select` filter. Repo: `/blog-categories/:slug` renders the same page, the select is the native-Dropdown pattern `fk-dropdown`
- [ ] Template SEO bound to CMS fields (`cms.md` → Posts); `x-schema-post` (`BlogPosting` +
      `BreadcrumbList`) and the blog index `BreadcrumbList` (`seo.md` S-07, S-09)

## Phase 7 — Motion and illustrations

Needs P-04 and P-07 closed.

- [ ] Remaining interactions in `interactions.md`: parallax, FAQ, and any still `legacy`
- [ ] Illustrations produced and placed per P-04, with static fallbacks for reduced motion

## Phase 8 — Custom-code exceptions

- [ ] `x-gravity-gallery` per P-01
- [ ] `x-article-toc` per P-02 (approved, closed (a) 2026-09-29)
- [ ] Primary button hover checked in Preview against the repo (`x-button-gradient`, installed in P.2)
- [ ] Exceptions table in `interactions.md` matches what is actually installed (`data_scripts_tool` → `get_site_scripts`)

## Phase 9 — QA and launch prep

- [ ] [Carried checks](#carried-into-production-qa) all ticked
- [ ] `/site-audit`, `/accessibility-audit`, `/link-checker`, `/asset-audit` pass, with fixes applied
- [ ] Visual comparison against Figma at all four breakpoints
- [ ] 404 page (real 404 status), favicon, sitemap, robots, `llms.txt`, social images (`seo.md` Files)
- [ ] Every requirement in `seo.md` ticked on staging, including the schema in Google's Rich
      Results Test and PageSpeed Insights mobile 90+ on Home, a role page (P-12) and a blog post
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
- [ ] Home, kept verbatim from the legacy home (H-7): testimonials "Minesota" and "Chrismene jones"; How It
      Works "13:30PM-14:30PM" and the "Jonathan Johnson" name on the `andrew` avatar; the Two Ways
      Facilities card repeats the Nurses body; How It Works Facility call and Processing share a body
