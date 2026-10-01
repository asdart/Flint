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

## Next steps (agreed 2026-09-30)

The order the user agreed on 2026-09-30. Page pre-plans read from the final Figma frames are in [`plans/`](plans/) (D-33).

1. ~~**Close out Home and the Blog:**~~ **done 2026-09-30** (user closed it; the Designer checklist, newsletter submit and staging were confirmed by the user): the [Blog sync carry-over](#blog-sync-carry-over) Designer checklist, the staging checks, then the track P exit criteria
2. ~~**Repo cleanup:**~~ **done 2026-09-30** (PR #1 merged into `webflow`): roadmap slimmed (decisions in `archive/decisions.md`), stray scratch file removed, merged `blog-post-page` branch deleted
3. **Shared carousel (D-37)** ◐ **built in the repo 2026-10-01:** `src/ix/xCarousel.ts` and the generated `docs/webflow/custom-code/x-carousel.html`, Home markup moved onto it, old IX3 preview modules removed, tested in Chromium (desktop and touch emulation). **Left:** put the `data-x-*` attributes and the footer code on Home in Webflow, delete `ix-how-carousel(-phone)`, `ix-testimonials` and `ix-testimonial-hover` (needs the user's confirmation, rule 12), publish, and check swipe and backward navigation on staging
4. **Candidates** ([plan](plans/candidates.md)): Hero (ring of 12 avatars, orbit from the legacy `ProximityOrbit`), Stats Band Default, Role Grid (reuse), How It Works (5 rows, `x-illustrations`), Testimonials as on Home (user decision 2026-10-01), FAQ, arc-carousel CTA (D-34) ◐ **Built in the repo 2026-10-01** (`src/pages/CandidatesPage.tsx`, `/candidates`; legacy at `/legacy/candidates`): all seven sections as static final frames, `ix-faq-toggle` and `x-carousel` (Home's Testimonials, unchanged) working in the preview. `x-illustrations` (hero orbit and the four animated art panels) **built and tested in the repo 2026-10-01**, 7.8 KB (Candidates only since the 2026-10-02 split), `docs/webflow/custom-code/x-illustrations.html`. **Left:** Webflow build and sync, from the post-refactor classes (step 6a) (new tokens `color-ink-80` / `color-black-20`, the hero portraits (Home's, already uploaded) and the How It Works assets to upload, page settings and `FAQPage` JSON-LD, Nav Candidates link to a page link), the user's confirmations listed in `components.md` (Pages → Candidates) and the report of this step
5. **Facility partners** ([plan](plans/facility-partners.md)): Hero, Logo Marquee (reuse), Stats Band Default (reuse), Media Split ×3 with `x-facility-illustrations`, Feature Grid Benefits, Testimonials (text cards), Apply Form (Webflow inbox, P-05) ◐ **Phase A built in the repo 2026-10-01** (`src/pages/FacilityPartnersPage.tsx`, `/facility-partners`; legacy at `/legacy/facility-partners`): Nav Dark, video Hero (page-level, button link TBD), Logo Marquee, Stats Band Spread (was "Default untitled"; explicit variant since 2026-10-01), Facility Value Prop (3 illustrated rows as static frames with `x-illustrations` hooks), Feature Grid Benefits, Footer (default copy, same as Home). **Phase B built 2026-10-02:** the three illustrations animate through the dedicated script `x-facility-illustrations` (`network`, `savings`, `retention`; one script per page for pagespeed, user approval 2026-10-02; tested in the repo, install pending) and the Figma fidelity pass is done (network spokes, hero text wrap). **Left:** Testimonials and Apply Form (not in this phase), the hero button target, decisions on `x-nav-dark` and `x-video-reduced` (proposed), the new success / warning tokens, then the Webflow sync from the post-refactor classes (step 6a)
6. **About** ([plan](plans/about.md)): Hero, Mission, Team, Story and Residency (all page-level markup, D-17 / D-40), Stats Band Large (reuse), Logo Grid, Split CTA ◐ **Built in the repo 2026-10-01** (`src/pages/AboutPage.tsx`, `/about`; legacy at `/legacy/about`): About Hero (one `h1`: photo strip above 991px, inline portrait pills from Tablet down), Mission and Story (page-level markup, `AboutMission.tsx` / `AboutStory.tsx`; the Text Panel component was retired, D-40; Mission is Tertiary and Story Brand Light, as Figma), Team (`AboutTeam.tsx`, page-level; three founder cards; photo and Read more open `UI / Modal` through `x-modal`, **same placeholder bio for all three**), Residency (`AboutResidency.tsx`, page-level, no Media Split component), Stats Band Large (phone: one column, existing text sizes), Logo Grid (4 / 2 × 2 / 1 columns), Split CTA (two cards, stacked below 992, inferred); Footer with Home's default copy; Nav About link current. Images are WebP (`public/assets/about/`). Built and measured at 1440, 991, 768 and 390 in Chromium (one `h1` at every width, no horizontal scroll, reduced motion shows everything, modals open, close and return focus). **Left:** Webflow build and sync (the new classes in `classes.md` as they stand after step 6a, the images below, `x-modal` for the founder modals (About page footer code, `x-modal-head.html` in its head; move to site-wide if another page uses it), page settings, Nav About link to a page link); the real bios of Anson and Neil; the user's confirmations in `components.md` (Pages → About); **Designer image width / height (rule 15), alt in brackets:** strip 1–7 (decorative, empty) 484×605, 568×568, 612×764, 592×740, 540×720, 522×696, 540×720; the three hero pills reuse strip 2, 6 and 4 (empty alt); team-kenton and team-anson 778×778, team-neil 778×972 (empty alt: the link names them); residency 1426×951 (Home's `two-ways-facility.webp`, already uploaded; "A nurse and residents in the bright lounge of a care home"); investors Y Combinator 185×90, Haystack 316×77, Audacious 412×216, Rhino Ventures 137×42 (alt = the name)
6a. **Drift refactor (2026-10-01)** ◐ **Done in the repo, on branch `refactor/page-drift` (pushed, not merged), not synced to Webflow.** Candidates, Facility partners and About were aligned with Home and the contract: one section shell (`fk-section` > `fk-panel` > `fk-container` > `fk-panel-content`; `fk-section is-open` and `fk-container is-flush` retired), Home's header pattern, new shared classes `fk-split`, `fk-ring`, `fk-icon-badge`, `fk-steps-back`, `fk-container is-inset`, new utilities `fk-list-none`, `fk-bg-brand-foreground`, `fk-shadow-float`, `fk-shadow-chip`, the token `width-prose`, an explicit Stats Band `spread` variant, illustration CSS moved to utilities, the CTA Arc spacing like Home's (48px / 32px: an intended visible change), About's content column 1160px, hooks `is-modal-open` and `data-x-video="reduced"`, orbit `alt=""`. **Feedback round (2026-10-01):** `fk-split` stacks media first ≤991 everywhere (`is-media-first` retired; Home Pricing's DOM is now copy, diagram with `is-reverse`), CTA Split cards left-aligned ≤991, 3-stat bands 2 + 1 on tablet (`fk-stat is-default`), `fk-nav-menu` padding `space-4` / `space-2` ≤767. Registries updated 2026-10-01 (`classes.md` → Retired classes lists everything). **Left:** (1) **re-sync Home's Pricing** on production: create `fk-split`, `fk-split-copy`, `fk-icon-badge` (+ `is-sm`) and the utilities `fk-list-none`, `fk-bg-brand-foreground`, `fk-shadow-float` (and `fk-shadow-chip`), update `fk-pricing-bubble` (shadow removed), swap the Pricing markup classes (row, bubble shadow, bubble icons, checklist) and put the copy card before the diagram card with `fk-split is-reverse`, update `fk-nav-menu`'s padding (`space-4`, `space-2` ≤767; `Global / Nav`), read back with `webflow-diff.mjs`; (2) **Webflow deletions, only with the user's confirmation (rule 12), after the re-sync:** `fk-section is-open`, `fk-container is-flush`, `fk-pricing-checklist`, `fk-pricing-checklist-icon`, `fk-pricing-bubble-icon` and its `is-plain` combo, plus anything else `webflow-diff.mjs --unregistered` lists that the refactor retired; (3) the variable `width-prose` (521px); (4) then Candidates, Facility partners and About are built from the new classes (steps 4–6)
7. **QA and launch** (phases 9–10), then merge `webflow` into `main` (D-39)

## Decisions

### Decided

Short index. The full text, date and where each decision is applied are in [`archive/decisions.md`](archive/decisions.md#decided); add new decisions there and a one-line row here.

| ID | Decision (short; full text in the archive) |
| --- | --- |
| D-01 | Class naming is FlowKit v2 (`fk-` prefix, `is-*` combos) |
| D-02 | Related posts show posts from the same category, excluding the current post (superseded for now by D-26) |
| D-03 | The test stage runs on a separate test Webflow site (see D-09 for production) |
| D-04 | MVP closed after the user's review |
| D-05 | The nav has a single CTA (Secondary Small) in both rest and pill states |
| D-06 | The primary button hover matches the repo exactly (gradient angle rotation) through custom-CSS exception `x-button-gradient`, installed once the plan allows … |
| D-07 | Two-line clamps and antialiased font smoothing match the repo through custom-CSS exception `x-text-rendering` (the style API rejects those properties), … |
| D-08 | The test stage (phases 0–2) is closed |
| D-09 | Production lives in the client's Webflow account on a Premium plan (user, 2026-09-29: it covers everything the build needs, including CMS and site custom … |
| D-10 | The mobile menu's scroll lock keeps `overscroll-behavior: contain` |
| D-11 | New CSS system direction: a utilities layer (`tokens → utilities → primitives → blocks`) sits between tokens and classes, so repeated single-property rules … |
| D-12 | How It Works card art redesigned from Figma (node 5746:992 desktop, 5483:860 mobile), supersedes H-4 ("one image per card") |
| D-13 | Twitter card values come from each page's Open Graph settings (Webflow has no separate Twitter fields); no exception needed (was P-11) |
| D-14 | `llms.txt` uses Webflow's native upload (Site settings → SEO → LLMs.txt; UTF-8, under 100 KB), served at `/llms.txt` on the custom domain only and never indexed |
| D-15 | Blog content comes from the client's current site (export of 2026-09-28): posts get categories assigned by topic, Flint Editorial Team is the author of … |
| D-16 | Blog: where the Figma frames disagree, the desktop frame wins |
| D-17 | Mixed section model: a section becomes a `Section /` component only when it is used, or planned (user's call), on more than one page; a section used once … |
| D-18 | Testimonial hover reaches only the current card (P-16 option b): `.fk-testimonials-slide` is `pointer-events: none` and `.is-center` is `pointer-events: …` |
| D-19 | Blur reveal "Hybrid": visible in the Designer |
| D-20 | Rich Text nested styles: the styles for elements inside a Rich Text element (h2–h4, p, lists, links, quotes, images) are Webflow Designer nested styles on … |
| D-21 | The post hero's main image shows at 552px wide at most with `aspect-ratio: 1400 / 659` (amended 2026-09-30 on the user's decision: it reserves the space … |
| D-22 | Related Posts is a local page-markup section of the post page, not Post Grid: a left-aligned "Related Insights" header ("More guides on nursing careers, US … |
| D-23 | Blog sync interim choices (user, 2026-09-30): (1) Pagination on production is Webflow-native only (Previous / Next, 6 per page) until the user checks the … |
| D-24 | Blog sync form components (user, 2026-09-30): (1) `UI / Input Field` is the native Form Text Field in ONE configuration, the Newsletter email field (type … |
| D-25 | Rich Text nested styles go in custom code, not Designer nested styles (user, 2026-09-30) |
| D-26 | Related Posts has no category filter for now (user, 2026-09-30): it lists the newest other posts (the current one excluded) |
| D-27 | The post page's newsletter is a local section, and `Section / Newsletter` has no Stacked variant (user, 2026-09-30) |
| D-28 | The category dropdown mirrors the user's Designer build (user, 2026-09-30) |
| D-29 | User answers, 2026-09-30 (relayed in chat after the staging republish): (1) staging was republished, so the post hero `aspect-ratio` is live (verified); (2) … |
| D-30 | P-21 closed: hover interactions play normally under reduced motion (user approved option a, 2026-09-30) |
| D-31 | P-19 closed: numbered pagination through the exception `x-blog-pagination` (option B), user-approved 2026-09-30 |
| D-32 | P-20 closed: Collection List empty states, built as recommended (user approved 2026-09-30) |
| D-33 | The final Figma frames are the design source for Candidates, Facility partners and About; legacy is reference only; smaller breakpoints are inferred |
| D-34 | P-01 closed as obsolete: no physics gallery; Candidates CTA is an arc carousel like the Home hero, About CTA is a two-card Split CTA |
| D-35 | P-03 closed per the final design: `ModernFacility` → Feature Grid (Benefits), `WhyFacilities` dropped, Media Split ×3, no Facility Grid |
| D-36 | P-04 closed: illustrations animate at launch, ported from legacy to Motion (`x-illustrations` on Candidates, `x-facility-illustrations` on Facility partners: one script per page, 2026-10-02), Candidates and Facility partners only |
| D-37 | Carousels move from IX3 to one shared Motion script (`x-carousel`) with back-and-forth springs, swipe, dots and arrows |
| D-38 | P-08 closed: missing content doesn't block the build; the client updates the copy later |
| D-39 | `webflow` is merged into `main` only when the whole migration is finished |
| D-40 | About's Mission, Story, Team and Residency are page-level markup, not components (user decision 2026-10-02): `Section / Text Panel`, `Team Grid` and `Media Split` are retired as components (Facility partners won't use Media Split); the Footer keeps Home's copy; `x-modal` is About-only for now; no responsive background utility, no bigger stat text sizes |

### Open

All must be closed before the phase noted in "Needed by".

| ID | Question | Options | Needed by | Status |
| --- | --- | --- | --- | --- |
| P-05 | Where do form submissions go (Facility Apply form, newsletter)? _(proposed)_ | Webflow Forms with email notifications · Webflow Forms + webhook to a CRM/ESP · an external embed (would be an exception) | Phase 4 | **decided for now (user, 2026-09-30, D-29): integrations later; submissions stay in Webflow's form inbox.** Reopen when the ESP/CRM is chosen. The live submit is still untested (Turnstile is on, see `interactions.md` → Staging runtime check) |
| P-06 | Which custom domain, and who manages DNS? | Client's domain; DNS access from the client | Phase 10 | open. The plan is Premium per D-09 and covers what the build needs |
| P-07 | Is it acceptable that stat numbers animate as a whole instead of digit by digit? _(proposed)_ | (a) Yes, native `ix-count-in` · (b) no, add a digit script exception | Phase 7 | open |
| P-12 | Which page is the "role page" in the PageSpeed check (`seo.md` S-15)? The roadmap has no role pages yet | Name the page, and add it to `components.md` → Pages if it's new | Phase 5 | open, to decide later (user, 2026-09-27) |
| P-13 | The post main images are text banners (about 2.1:1) and the card crops them to 1.4:1 (3.5:1 on mobile landscape), cutting off the headline | (a) New card-ready images from the client · (b) change the card image ratio to fit the banners · (c) accept the crop | Phase 6 | **accepted for now (user, 2026-09-30, D-29, option c):** the client will probably change the images; reopen then |
| P-14 | Do post FAQs get `FAQPage` schema (`seo.md` S-08)? The FAQs are now rich text | (a) A plain-text field holding each post's FAQ JSON-LD, inserted by `x-schema-post` (pairs ready in `blog-embeds/faq-pairs.json`) · (b) no FAQ schema on posts | Phase 6 | open |
| P-17 | No default social (Open Graph) image exists: `/blog`, the Categories template and Home have `openGraph.imageUrl: null`. `update_page_settings` accepts `openGraph.imageAssetId` (a site asset id), so the MCP can set it once an image exists. The Posts template binds the post's Main image (Designer) | Design a 1200×630 default social image, upload it (`create_asset`), then set it on Home, `/blog` and Categories | Before launch | open (user, 2026-09-30: later) |

Closed questions (P-01 to P-04, P-08, P-09, P-15, P-16, P-18 to P-21) are in [`archive/decisions.md`](archive/decisions.md#closed-questions).

---

## Test stage — phases 0–2 (closed)

Everything here was built in the repo and rehearsed on the separate **test** Webflow site. The
per-sync log, the ids and the homepage plan and spike results are archived in
[`archive/test-site/`](archive/test-site/README.md).

The full summary of what the test stage produced and what it proved about the MCP is in [`archive/test-stage-summary.md`](archive/test-stage-summary.md).

### Carried into production QA

Closed on the test site as findings (D-08). Each is re-checked on production in phase 9, or earlier
when the page is built there.

- [ ] Style guide reviewed in the Designer against the repo at the four breakpoints
- [ ] Homepage wave 3 (Hero, How It Works, Testimonials) reviewed in the Designer
- [x] On the staging subdomain: S1 blur reveal with reduced motion (`skip-to-end`), then close H-1 in `archive/test-site/mvp2-home.md` (verified 2026-09-30: visible and `is-revealed` at once; `interactions.md` → Staging runtime check; H-1 in the archive is read-only, not edited)
- [x] On staging: S4 ticker cycle (unique items × step), and loop coverage for the arc, marquee and ticker (verified 2026-09-30: ticker 14 steps × 2.2s and a clean wrap; arc covers 2560px; marquee covers up to ~2,100px as registered, a short right edge at 2560 near the end of each 32s cycle)
- [x] On staging: How It Works carousel motion (H-11) and the testimonial hover freeze (H-12) (verified 2026-09-30 at 1440 and 390: steps, dot jumps, hover freezes both carousels; the testimonial card opens with normal motion, but both hover interactions are inert under reduced motion: P-21)
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
  - **Blog sync Stage 3 (2026-09-30):** `public/assets/blog/hero-art.webp` (65,674 bytes) and the icons `chevron-down.svg`, `arrow-left.svg`, `arrow-right.svg` uploaded (S3 POST 201), recorded in `webflow-ids.json` → `assets`; `webflow-markup.mjs` resolves `BlogHero.tsx`, `Dropdown.tsx` and `PostIndex.tsx`. Other blog images (featured.png, hero-bg.png, newsletter-bg.png, post PNG/JPG) are not referenced by the migrated markup and were left out
  - **Blog sync Stage 2 (2026-09-30):** variable `width-article` (720px) created (66 variables now) and 19 blog classes pushed (`fk-max-w-article`, `fk-article*` incl. `is-toc-active`, `fk-breadcrumb*`, `fk-avatar is-lg`, `fk-section is-padded-bottom-lg`, `fk-panel is-tight`): 19 creates + 16 breakpoint/state updates, fresh `get_styles` diff "No differences.". `fk-article-body` holds only its base rules; its nested Rich Text styles stay Designer-only (D-20)
- [ ] Components: `Global / Nav`, `Global / Footer`, the `UI / *` and `Section / *` components
      marked `migrated` in `components.md`, with props and variants
  - **Blog sync Stage 5 (2026-09-30):** `Section / Post Grid` added to Home (Collection List Posts, Publish date ↓, limit 3, Post Card bound) and the `/blog` page built and set as the Nav's Blog links' target; details and the Designer checklist in `sync-log.md`
  - **Blog sync Stage 4 (2026-09-30):** `UI / Dropdown` and `UI / Post Card` built and read back (ids in `webflow-ids.json`). `UI / Input Field` (one configuration, D-24) and `Section / Newsletter` (Default, Stacked) built later the same day. **Designer checklist (user):** type the Placeholder ("Email address") on the Input Field's input inside its definition; fill the `UI / Dropdown` Options slot; set the `Section / Newsletter` form's Success/Error visibility check; the hidden redundant wrapper block in `Section / Newsletter` and the hidden `Action` slot in `UI / Input Field` were deleted 2026-09-30 (user-confirmed); reload the Designer; check Stacked on the canvas at Tablet and Mobile (the Bridge was offline, so only read-backs were verified)
  - **Global and UI done 2026-09-29 (Stage 6b):** `UI / Button` (Primary, Secondary, Primary Small, Secondary Small, plus Secondary Full for the mobile menu), `UI / Testimonial Card`, `Global / Nav`, `Global / Footer`, built on the draft `/style-guide` and read back (ids in `webflow-ids.json` → `components`). **Stage 6c (2026-09-29, user decisions):** `UI / Section Header` and `UI / Service Card` are markup patterns, not components (both removed from Webflow); the Testimonial Card's Quote prop no longer holds the curly quotes (they are static text around a bound span); the Secondary Full Button variant stays. **Stage 7a (2026-09-29, D-17 mixed section model):** only Hero, Logo Marquee, Role Grid and Testimonials are `Section /` components; Two Ways, Pricing, Partners Map, How It Works, Webinar, Feature Grid and CTA are page-level markup. `Section / Hero` (`71b39630-…`) and `Section / Logo Marquee` (`2a73f492-…`) are built. **Stage 7b (2026-09-29):** `Section / Role Grid` (`50a1e198-…`, props Title, Body, Button Label, Button Link) and `Section / Testimonials` (`81e772c9-…`, prop Body) are built and placed on Home. Still to do outside this item: `UI / Post Card`, `Stat`, `Dropdown`, `Input Field`, the Newsletter form, and the `w--current` states in the Designer
- [ ] CMS: Categories, Authors, Posts with the fields in `cms.md`, seeded from `src/content/`. Collections and fields created on production 2026-09-29 (Excerpt max length 160 and Read time minimum 1 still to set in the Designer). Items imported 2026-09-29 from `categories-import.csv`, `authors-import.csv` and `blog-posts-import.csv` (5 / 1 / 34, 6 drafts, alt text set); not published
- [ ] Pages: **Blog sync Stage 6 (2026-09-30):** the Categories and Posts template pages are built (structure, bindings, Related list; Designer items in the sync log). Home (`/`, `src/pages/HomePage.tsx`) as composed in `components.md` → Pages;
      `/style-guide` as a draft. **Home in progress (Stage 7a, 2026-09-29):** `fk-page` > Nav, `main`, Footer, with sections 1–5 in `main` (Hero and Logo Marquee components, Two Ways, Pricing, Partners Map as page markup), structure compared with the repo render (0 differences, 350 nodes), snapshots match the repo heights at 1440. **Stage 7b (2026-09-29):** sections 6–11 added (How It Works, Webinar, Feature Grid, CTA as page markup; Role Grid and Testimonials as components), so Home is built minus Post Grid: 11 sections, structure compared with the repo render (0 differences, 739 nodes over all eleven), snapshots match the repo heights at 1440, one `h1`, page settings (title, description, Open Graph text) set. Home leaves out Post Grid until the blog phase (user, 2026-09-29). Still to do on Home: the OG image and schema (`seo.md`), the interactions (Stage 8)
- [ ] Interactions: every interaction in `interactions.md` marked `migrated`, with reduced-motion settings
  - **Stage 8a done 2026-09-29:** 12 of the Home interactions created on production, site scope (`ix-blur-reveal`, `ix-reveal`, `ix-reveal-stagger`, `ix-card-hover`, `ix-nav-pill`, `ix-nav-pill-rest`, `ix-nav-menu`, `ix-nav-menu-close`, `ix-marquee`, `ix-ticker`, `ix-two-ways-card`, `ix-two-ways-card-late`; ids in `webflow-ids.json`, read back against the registry, class diff clean). `ix-count-in` skipped (no stat values on Home). Real playback is unverified until the staging publish (carried checks; see `interactions.md` → Production build). **Stage 8b done 2026-09-29 (partly):** `ix-hero-arc` `i-dda772fb`, `ix-how-carousel` `i-92770673`, `ix-how-carousel-phone` `i-d27f08a0` and `ix-testimonials` `i-1d31deaf` created (16 interactions on the site, ids in `webflow-ids.json`; class diff clean). `ix-testimonials` runs on a different but geometrically identical mechanism (IX3 can't tween margin: slide `width` + `x` + fixed `transformOrigin`), and **`ix-testimonial-hover` was not built in 8b** (built in Stage 8c, below): its "current slide only" scope needs `is-center` to move with the carousel, which IX3 can't do without a snap (decision P-16 open, see `interactions.md` → Production build (Stage 8b)). Not ticked until that is decided and the playback of all Home interactions is verified on staging (hero arc loop, How It Works motion and phone breakpoint, testimonials layout and loop, dot jumps, hover pause, reduced motion)
  - **Bug fixes 2026-09-29 (user-reported from the Designer preview):** the ticker, `ix-how-carousel(-phone)` and `ix-testimonials` were rewritten from FromTo to To tweens plus position-0 Sets (wrong initial state, wrong state after a dot jump); blur reveal moved to the Hybrid mechanism (D-19); `fk-nav-menu` `height: 100dvh` and an html scroll lock in `ix-nav-menu` / `-close`; secondary buttons store a transparent gradient layer and `x-button-gradient` is scoped to primary; the Home and logo links in the Nav are page links. Details and the runtime checks still to make: `interactions.md` → Bug fixes (2026-09-29). **Open for the user:** style the `w--current` state on `fk-nav-link` and `fk-nav-menu-link` in the Designer (none exists yet), and switch the other Nav links to page links as their pages are built (`components.md`)
  - **Stage 8c done 2026-09-29 (P-16 decided, D-18):** `ix-testimonial-hover` `i-14706c57` created, and `ix-testimonials` `i-1d31deaf` updated with 15 `pointerEvents` Sets (80 actions now); the slide `pointer-events` pair is on the repo CSS and on production (class diff clean). **All 17 Home interactions now exist on production**, but the box stays unticked: playback is pending the staging publish (the user deferred it to a later session), including the new checks in `interactions.md` → Production build (Stage 8c)
- [ ] Custom code: CSS part done 2026-09-29 (`x-button-gradient` (primary buttons only), `x-text-rendering` and `x-blur-reveal` (D-19), one `<style>` block in the site head code, source `docs/webflow/custom-code/site-head.html`; `x-scroll-lock` retired, `overscroll-behavior` moved to the nav classes, D-10). **Posts template, 2026-09-30 (Stage 7):** `x-related-empty` (page head `<style>`, `docs/webflow/custom-code/post-template-head-style.html`) and `x-article-toc` (registered script `xarticletoc`, page footer) installed, runtime unverified until staging; `x-schema-post` stays deferred (D-23). **Waiting:** `x-schema-site` (real social profile URLs for `sameAs`) and `x-deferred-tracking` (a GTM container ID), deferred by the user (`seo.md` S-06, S-13)
- [ ] Assets uploaded as resized WebP (`seo.md` S-10); fonts only as uploaded custom fonts (S-12)
- [ ] Blog sync carry-over (2026-09-30): everything the blog sync left open is listed in [Blog sync carry-over](#blog-sync-carry-over) below (`blog-sync-handoff.md` was folded in and deleted). Stays open until that list is done, then the carried checks are ticked
- [ ] Staging publish to the `webflow.io` subdomain (with confirmation), then the
      [carried checks](#carried-into-production-qa)

### Blog sync carry-over

Moved here on 2026-09-30 from `blog-sync-handoff.md` (deleted), after the staging republish and the user's answers (D-29). State
of the blog on production: Home (with Post Grid), `/blog`, Categories template, Posts template, Authors template not published,
components Post Card, Dropdown, Input Field, Section / Newsletter (Default only), Global / Featured post; class diff clean apart from the
noise below; staging republished 2026-09-30 and verified (`interactions.md` → Staging runtime check).

**Closed since the handoff (evidence 2026-09-30):** leftover "Body" Block deleted; quick-answer and author-role conditional
visibility; card and featured links resolve to `/blog/{slug}`; category filter works (per-category counts); Related excludes the
current post, no category filter (D-26); Newsletter Stacked replaced by a local section (D-27); Dropdown Options filled (D-28);
Rich Text styles live as custom code (D-25); SEO title/description on Blog, Posts and Categories; Authors template not published;
alt text present on every `<img>` (Home 145, `/blog` 21, category 21, post 13); Excerpt max 160, Read time min 1 (MCP read-back);
`autocomplete="email"` and the placeholder; Nav `w--current`; ISO `datetime` everywhere (P-18); post hero aspect-ratio live;
Home Post Grid 898px at 1440 on staging (= the repo, the old "950 / 91px" mismatch is closed, no mismatch); the min-read `Span`
(unclassed span around the bound minutes) is an **accepted deviation**, nothing to do.

**Open, to do (Designer unless noted):**

- [x] **Image `width` / `height` by hand.** **Done by the user in the Designer 2026-09-30 (Home, blog, the two wrong values fixed); staging read-back of the attributes pending.** From now on AGENTS.md rule 15 (1.10) requires them, with alt, on every image placed. The MCP can't set them (`set_attributes` and `set_settings` refuse them). Where: Designer,
      select the Image element, open its settings (double-click it, Enter, the cog in the element panel, or `D`), fill **Image width** and
      **Image height** (the HTML attributes; the Style panel's Width/Height is CSS). Keep the CSS (`width: 100%; height: auto`,
      `object-fit`), the browser only uses the numbers for the ratio. Values are the file's intrinsic size = the repo markup
      (`grep -n "width={" src/sections src/components`): nav and footer logos 49 × 24 (**done**), post hero avatar 44 × 44 (**done**),
      other avatars 24 × 24, chevron icon 20 × 20, nav icons 24 × 24, `fk-icon is-sm` 16 × 16, blog hero art 1459 × 800, Webinar
      2400 × 668 / 1254 × 836 / 708 × 306, Partners Map 1774 × 887, testimonial photos 612 × 798, testimonial avatars 32 × 32, logo marquee
      logos (width per logo, height 36, `LogoMarquee.tsx`). Priority: the static images above the fold on Home and the nav logo,
      then the rest (low value where CSS already reserves the space). Record which are done in `seo.md` S-10. CMS-bound images can't
      carry a fixed size (one set of fields for every item). **Two wrong values found 2026-09-30 to fix:** the post hero image has
      `width="1459" height="800"` (file is 1400 × 659; clear or set 1400 × 659, the CSS ratio covers layout shift) and every Post Card
      image has `width="Auto"` (invalid; clear the field). Home: about 140 images still carry none
- [ ] **P-17** default OG image (1200 × 630) for Home, `/blog`, Categories (`update_page_settings` `openGraph.imageAssetId`). Later
- [ ] **P-19** (**Designer part done 2026-09-30: `PaginationCount` with `fk-sr-only` on `/blog` and the Categories template, probe block gone (MCP read-back); only the staging check below is left.** Closed as D-31, built 2026-09-30; **diagnosed 2026-09-30 after the 21:33 UTC publish: the numbers don't show because the native Page count element doesn't exist on either pagination (no `w-page-count` in the MCP tree or in staging's HTML); the script, its `<style>` and the publish are all fine; turn on Page count as below**) **user:** in the Designer turn on **Page count** on the Pagination of `/blog` and the Categories template and style it `fk-sr-only`, delete the hidden "PROBE - delete me (P-19)" block on `/blog`; then **check on staging after the publish** (the numbers appear and link, the current page is bold with the ink border, `aria-label` is "Pagination", a one-page category shows no wrapper, list-to-pagination gap 32); tick then
- [ ] **P-20** empty state for the Collection Lists (closed as D-32, done on Webflow and in the repo 2026-09-30; **check on staging after the next publish**: an empty state is hard to see live because every list has posts. In the Designer, open each page, select the Collection List and use the Empty State view (or temporarily set a filter that matches nothing, e.g. Featured `isOff` on Home Post Grid, and undo it after), then compare with the repo at `?empty=1`: Home, `/blog` (Subscribe scrolls to `#newsletter`), a category (All articles goes to `/blog`), Featured slot collapsed, Related section hidden; tick then)
- [ ] **P-21** hover interactions under reduced motion (closed as D-30, done on Webflow and in the repo 2026-09-30; **check on staging after the next publish**: with `reducedMotion: 'reduce'` (new context) the service card turns brand and the testimonial quote opens on hover, and a `.fk-blur-reveal` has `transition-duration: 0s` with no blur frames after load; tick then)
- [ ] **Schema:** P-14 (`FAQPage` on posts), `x-schema-post` (draft in `docs/webflow/custom-code/post-template-head.html`, waits on P-14 and
      D-23), `x-schema-site` (needs real `sameAs` URLs, P-08), blog index `BreadcrumbList` (`seo.md` S-09). No JSON-LD anywhere yet
- [ ] **P-06** custom domain and the global canonical URL: there is no `<link rel="canonical">` anywhere on staging. Also check on the
      custom domain that the noindex category pages are out of the sitemap and, if a real `noindex` meta is wanted, add it (`seo.md` S-04)
- [ ] **Cleanup (user confirmation, rule 12):** delete the orphan combo `fk-panel is-tight` and the unused `fk-max-w-article` use if
      nothing references them (the utility itself stays registered); the dead `Stacked` id is recorded under `removedVariants` in
      `webflow-ids.json`. The user chose to keep `fk-panel is-tight` for now, so leave it
- [ ] **Class-diff noise, known and harmless (ignore, don't "fix" twice):** `.fk-nav-lock` is stored as the `overflow: hidden` shorthand
      (the repo sends the longhands; same computed CSS; either ignore or resend the longhands and remove `overflow`), the stray empty chain
      `.fk-grid.fk-cols-3.fk-cols-2-tablet.fk-cols-1-mobile.fk-gap-4` (Webflow's auto combo), `.fk-button._w-button` and
      `.fk-input-field-input._w-input` (Webflow's auto combos for its native `w-*` classes). `webflow-diff.mjs --unregistered` lists them
- [x] **Category featured list** (user deleted the filter in the Designer 2026-09-30; the MCP reads `filters: []` either way, so confirm on the published page) had a stray empty filter (`name equals ""`) next to `featured isOn`: harmless today, fragile; ask the
      user to delete it in the Designer (the MCP reads `filters: []` for Designer bindings, verify on the published page)
- [ ] **Unverified rules, need real data:** `x-related-empty` on a real empty Related list (all 28 published posts show 3 related cards, so
      none exists; only the simulated case passed), and the `blockquote`, `figure`, `img`, `figcaption` rules of `x-article-body` (no post
      body has any). Re-check when a post or a filtered list triggers them
- [x] **Newsletter live submit:** done by the user 2026-09-30 on staging, success shown and the submission is in Webflow's form inbox. the form works through a stubbed network (handler, success block), but a real submission is
      pending: Webflow's Turnstile bot protection is on (the submit stays disabled until the challenge passes, so it must be done by a
      person in a real browser); the user or the future integration (P-05) does it once. Check the form appears in Webflow's inbox
- [ ] **Dropdown:** native Webflow behaviour leaves the list open after Tab moves focus out of the last link (click, Escape and outside
      click all close it, verified); low, accept or add a `focusout` close only if the client asks (would be an exception)
- [ ] **Pages still to build for the Nav:** Candidates, Facility partners and About links are URLs (`components.md`)

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
Grid (Cards), Testimonials (Slider), Post Grid (Home), CTA (Art). Also Stats Band (Large).

- [ ] Hero: Candidates, Facility Partners, About; and Article Hero (Blog Hero is built: page-level pattern, `components.md`)
- [ ] How It Works: Candidates and Facilities variants
- [ ] Feature Grid: Benefits variant, plus the result of P-03
- [ ] Stats Band Default; Testimonials Single; FAQ; Facility Grid
- [ ] Logo Grid (Media Split and Team Grid are page-level markup on About, D-40)
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
- [ ] Blog index with featured post and native pagination (6 per page). Built in the repo 2026-09-28 (`BlogPage.tsx`: `Section / Blog Hero`, `Section / Post Index`). **Built on Webflow 2026-09-30 (Blog sync Stage 5, draft page `/blog`, `6abc95f3d5879b11ae14b088`):** featured Collection List (Featured isOn, limit 1), `Section / Newsletter`, Post Index (Dropdown instance with an empty slot, Posts list with native pagination 6 per page, styled with the `fk-pagination*` classes; native chevron icons, no numbered links per D-23); left for the Designer: see the Stage 5 checklist in the sync log. Box stays open until the Designer checklist and the user's review are done
- [ ] Blog post template, including Related posts (D-02) and the P-02 result. Built in the repo 2026-09-29 (`src/pages/BlogPostPage.tsx`). **Built on Webflow 2026-09-30 (Blog sync Stage 6, `Posts Template` `6abc6c9673c0a3345b7a94bd`):** Article Hero, Article Body (Rich Text bound to Body), Article Newsletter (local section, D-27), Related Posts (list without its filters), all fields bound; open: the Designer checklist in the sync log (conditional visibility, Related filters, item links, leftover Block removal, SEO), `x-article-toc` and `x-related-empty` installed 2026-09-30 (Stage 7) and **verified on staging 2026-09-30** (`interactions.md`). **Designer pass 2026-09-30:** the leftover Body Block is gone, the quick-answer block is conditional, card and featured links resolve to `/blog/{slug}`, the category page filter works (per-category counts), Related excludes the current post (no category filter seen). Still open: role-paragraph visibility, Related category filter, Dropdown Options (empty), page SEO on the templates, Rich Text nested styles (D-20: not seeded, body text renders with the tag styles). Box stays open
- [ ] Blog category template pages, and category links replacing the legacy `Select` filter. **Built on Webflow 2026-09-30 (Stage 6, `Categories Template` `6abc6c8adc4bd2e2066e91ea`):** hero + featured list, Newsletter, Post Index (Dropdown Label bound to the category name, list with native pagination); the `Category = current` filter and the Dropdown Options slot are Designer steps. Repo: `/categories/:slug` renders the same page, the select is the native-Dropdown pattern `fk-dropdown`
- [ ] Template SEO bound to CMS fields (`cms.md` → Posts); `x-schema-post` (`BlogPosting` +
      `BreadcrumbList`) and the blog index `BreadcrumbList` (`seo.md` S-07, S-09)

## Phase 7 — Motion and illustrations

Needs P-07 closed. P-04 closed (D-36): illustrations are ported to Motion (`x-illustrations`).

- [ ] Remaining interactions in `interactions.md`: parallax, FAQ, and any still `legacy`
- [ ] Illustrations ported to Motion per D-36 (`x-illustrations`), with static fallbacks for first paint and reduced motion

## Phase 8 — Custom-code exceptions

- [ ] `x-carousel` per D-37 (Home first, then Candidates and Facility partners). Repo side done 2026-10-01 (see Next steps 3); Webflow install, interaction removal and the staging check are open
- [ ] `x-illustrations` (Candidates) and `x-facility-illustrations` (Facility partners) per D-36
- ~~`x-gravity-gallery` per P-01~~ retired (D-34)
- [x] `x-article-toc` per P-02 (approved, closed (a) 2026-09-29). **Installed on the Posts template 2026-09-30 (Blog sync Stage 7):** registered script `xarticletoc` 1.0.0 in the page footer. **Verified on staging 2026-09-30:** TOC builds from the 7 H2s and the scroll-spy moves `is-toc-active` (`interactions.md`)
- [ ] Primary button hover checked in Preview against the repo (`x-button-gradient`, installed in P.2)
- [ ] Exceptions table in `interactions.md` matches what is actually installed (`data_scripts_tool` → `get_site_scripts`). **Checked 2026-09-30 (Blog sync Stage 8, read-only):** site head `<style>` (`x-button-gradient`, `x-text-rendering`, `x-blur-reveal`), Posts template head `<style>` (`x-related-empty`), one registered script `xarticletoc` on the Posts footer; no site scripts, page footers empty (ids in `webflow-ids.json` → `scripts`, `customCode`); the other exceptions are not installed

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
