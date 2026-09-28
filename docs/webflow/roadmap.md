# Roadmap — Flint migration to Webflow

The plan for moving the legacy React/Tailwind site into Webflow under the contract in
[`AGENTS.md`](../../AGENTS.md). Registries hold the details; this file holds the order and the status.

**How to use:** tick an item when it is merged in the repo _and_, if it involves Webflow, synced and
logged in [`sync-log.md`](sync-log.md). Record new decisions in the Decisions section before acting
on them. Don't start a phase before the previous phase's exit criteria are met, unless noted.

**Status legend:** ☐ to do · ◐ in progress · ☑ done

## Two Webflow sites

| Site | Role | Account | Status |
| --- | --- | --- | --- |
| **Test** `Flint` (`flint-4167fa`, `6ab46032460da07da9dc6231`) | Sandbox. Proved the contract and the MCP recipes (phases 0–2). Rehearsal target until production exists, then spikes only | Paulo's workspace | Active. Ids in `webflow-ids.json` today |
| **Production** | The real site. Populated **from scratch** by replaying the repo (track P), then the sync target for every later phase | Client's account | Waiting for access (P-09) |

The repo is the source of truth for both. Nothing is copied from the test site to production: every
class, component, page and item is rebuilt from `src/` and the registries with the recipes in the
[`flint-webflow-sync`](../../.agents/skills/flint-webflow-sync/SKILL.md) skill.

## Phases

| Phase | Goal | Webflow target | Status |
| --- | --- | --- | --- |
| 0–2 | **Test stage**: contract, foundations, MVP 1 (vertical slice) and MVP 2 (homepage at 1:1 parity) | Test | ☑ closed 2026-09-25 (D-08) |
| P | **Production site**: access, then populate from scratch with everything built so far | Production | ☐ starts when access arrives (P-09) |
| 3 | Global and UI components | Test until P is done, then Production | ◐ partly done in MVP 2 |
| 4 | Sections | same | ◐ Home sections done in MVP 2 |
| 5 | Static pages | same | ☐ |
| 6 | Blog and CMS | same | ☐ |
| 7 | Motion and illustrations | same | ☐ |
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
| D-03 | The **test** site is `Flint` (short name `flint-4167fa`, ID `6ab46032460da07da9dc6231`), workspace `paulos-workspace-442e65` (see D-09 for production) | 2026-09-23 | `AGENTS.md` §9 |
| D-04 | MVP closed after the user's review. The approach (repo → MCP, contract v1.1) holds | 2026-09-24 | This file, `AGENTS.md` status |
| D-05 | The nav has a single CTA (Secondary Small) in both rest and pill states | 2026-09-24 | `components.md`, `classes.md` |
| D-06 | The primary button hover matches the repo exactly (gradient angle rotation) through custom-CSS exception `x-button-gradient`, installed once the plan allows custom code. Icons are SVG files; buttons have no icon by default | 2026-09-24 | `interactions.md`, `classes.md`, `components.md`, `AGENTS.md` rules 10 and 14 |
| D-07 | Two-line clamps and antialiased font smoothing match the repo through custom-CSS exception `x-text-rendering` (the style API rejects those properties), installed with `x-button-gradient` | 2026-09-25 | `interactions.md`, `classes.md` |
| D-08 | The test stage (phases 0–2) is closed. Its open reviews and staging re-checks are closed as test findings and re-checked on production ([carried checks](#carried-into-production-qa)) | 2026-09-25 | This file |
| D-09 | Production lives in the **client's Webflow account** on a **Business/Enterprise** plan (exact plan to confirm in P-09). It starts empty and is populated from scratch from the repo. Until access, work continues in the repo and is rehearsed on the test site | 2026-09-25 | This file, `AGENTS.md` §9 once the site exists |
| D-10 | The mobile menu's scroll lock keeps `overscroll-behavior: contain` through custom-CSS exception `x-scroll-lock`, installed with the other two exceptions. The body lock stays native (`ix-nav-menu`) | 2026-09-26 | `interactions.md`, `classes.md` |
| D-11 | New CSS system direction: a utilities layer (`tokens → utilities → primitives → blocks`) sits between tokens and classes, so repeated single-property rules (`display: flex`, `gap`, alignment…) stop needing a combo per base class. Gated on spike S7 (stacked standalone classes through the MCP), which passed 2026-09-27. Three sub-decisions: responsive utilities use suffix naming (`-tablet`/`-mobile`/`-phone`, max-width only); panel colors move from `fk-panel is-*` combos to `fk-bg-*` utilities; a new primitive `fk-section-header-action` replaces the repeated `*-action` block elements. Full spec and the S7 evidence in [`css-system.md`](css-system.md) | 2026-09-27 | `css-system.md` (proposed, becomes contract 1.6 once migrated) |
| D-12 | How It Works card art redesigned from Figma (node 5746:992 desktop, 5483:860 mobile), **supersedes H-4** ("one image per card"). Cards now get a solid `color-tertiary` background (`is-brand-light` → `color-brand-light` on card 5 "Start work") with a full-bleed `-bg` raster (photo/gradient/pattern) and, on 5 of 6 cards, a floating `-art` illustration on top (card 4 "Relocate" has none); cards 2 and 6 (inverse copy over a photo) add a `-scrim` gradient. Card 3's copy also changed to match Figma ("Interview Directly with Facilities" / "We present you with facilities. You choose who to interview.") | 2026-09-27 | `classes.md` → `fk-how`, `components.md` → Section / How It Works, `sections/HowItWorks.tsx` |
| D-13 | Twitter card values come from each page's Open Graph settings (Webflow has no separate Twitter fields); no exception needed (was P-11) | 2026-09-27 | `seo.md` S-02 |
| D-14 | `llms.txt` uses Webflow's native upload (Site settings → SEO → LLMs.txt; UTF-8, under 100 KB), served at `/llms.txt` on the custom domain only and never indexed. The source is `public/llms.txt` in the repo, uploaded by hand after each change (not reachable through the MCP); checked after the custom-domain publish (was P-13) | 2026-09-27 | `seo.md` S-21 |

### Open

All must be closed before the phase noted in "Needed by".

| ID | Question | Options | Needed by | Status |
| --- | --- | --- | --- | --- |
| P-01 | How is the physics avatar gallery (`x-gravity-gallery`) built? | (a) Webflow Code Component with Matter.js · (b) replace with a static collage + `ix-reveal-stagger` | Phase 8 (CTA Gallery in phase 4 needs a placeholder) | open |
| P-02 | Does the blog post template get a table of contents (`x-article-toc`)? | (a) Small page script that builds it from the body H2s · (b) no TOC · (c) manual TOC field in the CMS | Phase 6 | open |
| P-03 | What do `WhyFacilities` and `ModernFacility` become? | (a) Variants of `Section / Feature Grid` · (b) their own sections. Review against Figma | Phase 4 | open |
| P-04 | How are the ~9 animated illustrations produced? _(proposed)_ | (a) Lottie made in After Effects or a Figma plugin (who makes them?) · (b) rebuild as Interaction timelines · (c) static SVG at launch, animate later | Phase 7 (phase 4 uses static SVGs meanwhile) | open |
| P-05 | Where do form submissions go (Facility Apply form, newsletter)? _(proposed)_ | Webflow Forms with email notifications · Webflow Forms + webhook to a CRM/ESP · an external embed (would be an exception) | Phase 4 | open |
| P-06 | Which custom domain, and who manages DNS? | Client's domain; DNS access from the client | Phase 10 | open. The plan part is answered by D-09 (Business/Enterprise allows CMS and site custom code) |
| P-07 | Is it acceptable that stat numbers animate as a whole instead of digit by digit? _(proposed)_ | (a) Yes, native `ix-count-in` · (b) no, add a digit script exception | Phase 7 | open |
| P-08 | Who supplies the missing content? _(proposed)_ | FAQ answers 2+, real footer URLs, About Team copy, bodies for non-featured posts | Phase 9 | open |
| P-09 | Production access: which site and workspace, which role, and can the Webflow MCP be authorized on the client's account? | We need Designer access with site settings and custom code rights, and the MCP's OAuth app approved for the client's workspace (may need a workspace admin). Confirm the exact plan and whether the site is new and empty | Track P | open |
| P-10 | What happens to the test site after launch? | (a) Keep as a sandbox for spikes · (b) archive or delete (with confirmation) | Phase 10 | open |
| P-12 | Which page is the "role page" in the PageSpeed check (`seo.md` S-15)? The roadmap has no role pages yet | Name the page, and add it to `components.md` → Pages if it's new | Phase 5 | open, to decide later (user, 2026-09-27) |

---

## Test stage — phases 0–2 (closed)

Everything here was built in the repo and on the **test** site. Details per sync are in
`sync-log.md`; the homepage plan and spike results are in [`mvp2-home.md`](mvp2-home.md).

### What it produced

- **Contract and tooling:** `AGENTS.md` (v1.4), the registries, the `flint-webflow-sync` skill with
  recipes and pitfalls, and the sync scripts (`webflow-css.mjs`, `webflow-style-actions.mjs`,
  `webflow-diff.mjs`, `webflow-markup.mjs`, `webflow-upload*.mjs`).
- **Foundations:** every token in `tokens.md` and every class in `classes.md`, with parity proven by
  `webflow-diff.mjs`. Legacy Tailwind reads the tokens (`@theme reference`). Style guide page `/style-guide`.
- **MVP 1** (`/mvp`, removed 2026-09-27; its pieces live on in the homepage and registries): Nav, Footer, Text Panel, Stats Band, Post Grid (Related) bound to the CMS
  (Categories, Authors, Posts), and the first interactions.
- **MVP 2** (`/mvp-home`): the full homepage at 1:1 parity with legacy `/`: Hero (Home), Logo
  Marquee, Two Ways, Partners Map, How It Works (Home), Feature Grid, Testimonials (Slider), Post
  Grid (Home), CTA (Art), plus `UI / Button`, `UI / Service Card` and `UI / Testimonial Card`.
- **Spikes** (`/lab`): blur reveal, marquee, arc, ticker, carousels and staggered reveals proven
  native in IX3 (S1–S6), verified on the staging subdomain.

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
- [ ] On the staging subdomain: S1 blur reveal with reduced motion (`skip-to-end`), then close H-1 in `mvp2-home.md`
- [ ] On staging: S4 ticker cycle (unique items × step), and loop coverage for the arc, marquee and ticker
- [ ] On staging: How It Works carousel motion (H-11) and the testimonial hover freeze (H-12)
- [ ] Two Ways 2-line card titles against legacy (legacy is +3px per line from its word masks)

---

## Track P — Production site

Starts when P-09 is answered. Follow `mcp-playbook.md` in its fixed order; each step replays what
the repo already holds, so no new design work happens here.

### P.1 Access and setup

- [ ] Access granted per P-09; exact plan confirmed; D-09 updated with the site's name, short name,
      ID, workspace and time zone
- [ ] Webflow MCP authorized on the client's account; `get_site` returns the production ID
- [ ] `AGENTS.md` §9 rewritten for two sites (production as the default target, test for spikes);
      the rule "agents never target another site" names both IDs
- [ ] Ids split per site: today's `webflow-ids.json` archived as `webflow-ids.test.json`, a fresh
      `webflow-ids.json` for production; the sync scripts read the right one
- [ ] Site instruction (`rules/flint-contract.md`) created from `AGENTS.md`
- [ ] Tag styles seeded once in the Designer (Body, All Links) as on the test site
- [ ] **MCP Bridge** app installed and connected in the production Designer
- [ ] SEO site settings (`seo.md`): global canonical URL (with the domain, P-06), auto sitemap,
      robots.txt with the sitemap link and no AI crawlers blocked, `llms.txt` uploaded per D-14, 404 page

### P.2 Populate from scratch

In this order. Record every id in `webflow-ids.json` and add one `sync-log.md` row per step.

- [ ] Fonts: SN Pro 400/500, STIX Two Text 400
- [ ] Variable collection `Flint` with every token in `tokens.md`
- [ ] Assets: every SVG and image the migrated code uses (`webflow-upload-batch.mjs`)
- [ ] Classes: every class and combo in `classes.md`, with breakpoints and states;
      `webflow-diff.mjs` clean against production
- [ ] Components: `Global / Nav`, `Global / Footer`, the `UI / *` and `Section / *` components
      marked `synced` in `components.md`, with props and variants
- [ ] CMS: Categories, Authors, Posts with the fields in `cms.md`, seeded from `src/content/`
- [ ] Pages: Home built from the MVP 2 composition (as the real Home, not a `/mvp-home` draft);
      `/style-guide` as a draft
- [ ] Interactions: every interaction in `interactions.md` marked synced, with reduced-motion settings
- [ ] Custom code: `x-button-gradient`, `x-text-rendering` and `x-scroll-lock` (the plan allows it, D-09, D-10),
      plus `x-schema-site` and `x-deferred-tracking` (`seo.md` S-06, S-13)
- [ ] Assets uploaded as resized WebP (`seo.md` S-10); fonts only as uploaded custom fonts (S-12)
- [ ] Staging publish to the `webflow.io` subdomain (with confirmation), then the
      [carried checks](#carried-into-production-qa)

**Not replayed:** `/lab` and its `fk-lab-*` classes and interactions, `/mvp` (superseded by the
homepage and later pages), and anything listed as pending cleanup in the test ids file.

### Exit criteria

- [ ] Production matches the repo for everything built so far: diff clean, Home reviewed in the Designer
- [ ] From here on, phases 3–10 sync to production; the test site only takes spikes

---

## CSS system — utilities layer (D-11)

Runs alongside Phase 3, ahead of the rest of the homepage refactor. Details in
[`css-system.md`](css-system.md).

- [x] Spike S7: stacked global classes through the MCP (passed 2026-09-27, `css-system.md` → S7 result)
- [ ] `utilities.css` + registry section, generated from `tokens.css` by a small script; contract 1.6
- [ ] Homepage refactored onto utilities (section by section, arc/carousel/testimonials geometry left for their own pass)

## Phase 3 — Global and UI components

Done in MVP 2: `UI / Button` (4 variants), `UI / Service Card`, `UI / Testimonial Card`, Pagination markup.

- [ ] `Global / Nav` Dark variant, and move the Nav out of all 6 legacy heroes
- [ ] Footer props (CTA Title, CTA Body) created in Webflow
- [ ] `UI / Section Header` Left and Inverse variants; `UI / Stat` Default; `UI / Post Card` Featured
      and a component-with-props version
- [ ] Remaining UI components: FAQ Item, Newsletter Form, Portrait, Illustration (see `components.md`)

## Phase 4 — Sections

Needs P-03 and P-05 closed. Illustrations use static SVGs until phase 7.
Done in MVP 2 (Home variants): Hero, Logo Marquee, Two Ways, Partners Map, How It Works, Feature
Grid (Cards), Testimonials (Slider), Post Grid (Home), CTA (Art). Also Text Panel and Stats Band (Large).

- [ ] Hero: Candidates, Facility Partners, About, Blog; and Article Hero
- [ ] How It Works: Candidates and Facilities variants
- [ ] Feature Grid: Benefits variant, plus the result of P-03
- [ ] Stats Band Default; Testimonials Single; FAQ; Facility Grid
- [ ] Media Split, Logo Grid, Team Grid
- [ ] CTA Gallery (placeholder until P-01) and Simple; Apply Form; Newsletter
- [ ] Post Index, Article Body

## Phase 5 — Static pages

- [ ] Home (from MVP 2), Candidates, Facility partners, About: composed as in `components.md` → Pages
- [ ] Page settings per `seo.md`: title, meta description, OG image (also used for the Twitter card, D-13), noindex
      where needed, clean slugs; `FAQPage` schema on pages with an FAQ block (S-01…S-05, S-08)
- [ ] Delete each legacy section/page file once its replacement is migrated (with user confirmation)

## Phase 6 — Blog and CMS

Needs P-02 closed.

- [ ] Import all posts, categories and authors (`/bulk-cms-update`), as drafts
- [ ] Blog index with featured post and native pagination (6 per page)
- [ ] Blog post template, including Related posts (D-02) and the P-02 result
- [ ] Blog category template pages, and category links replacing the legacy `Select` filter
- [ ] Template SEO bound to CMS fields (`cms.md` → Posts); `x-schema-post` (`BlogPosting` +
      `BreadcrumbList`) and the blog index `BreadcrumbList` (`seo.md` S-07, S-09)

## Phase 7 — Motion and illustrations

Needs P-04 and P-07 closed.

- [ ] Remaining interactions in `interactions.md`: parallax, FAQ, and any not yet synced
- [ ] Illustrations produced and placed per P-04, with static fallbacks for reduced motion

## Phase 8 — Custom-code exceptions

- [ ] `x-gravity-gallery` per P-01
- [ ] `x-article-toc` per P-02 (if approved)
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
- [ ] Test site handled per P-10
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
