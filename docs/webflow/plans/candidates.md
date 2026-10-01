# Candidates page (`/candidates`) - Figma pre-plan

Source: Figma `bFJIQUAnqKd2ueYqsV8rRd`, frame `5543:915` "Candidates" (1440 x 10613, desktop only).
Repo read: `docs/webflow/components.md`, `interactions.md`, `src/pages/legacy/FacilitiesPage.tsx` (route `/candidates`; there is no `src/pages/CandidatesPage.tsx` yet).
Marked *(inferred)* where not read from the design. Copy taken from screenshots.

## 0. Breakpoints found

- Only the 1440 desktop frame exists. **No tablet/mobile sibling frames found** (the visible canvas metadata of page "Flint Blog + Social" `3123:329` lists only blog/social frames; the Candidates frame is not even in that page's listing, so neighbours could not be checked by position). Mobile/tablet must be inferred from Home's existing responsive patterns.
- `get_motion_context` (recursive) on `5543:915` returned no keyframes/prototype animation: **no motion is defined in Figma**. No annotations seen in the metadata.
- Every section is a `fk-section` > panel with 16px outer gutter (container 1408 at x=16), radius about 24, as on Home.

## 1. Sections in order

| # | Figma node (wrapper / panel) | Name in Figma | Height | Description and key copy |
| - | - | - | - | - |
| 1 | `5543:916` / `5543:917` | Hero | 1024 | Light grey panel (secondary). Nav on top (instance `5746:755`). Ring of **12** round avatar portraits (80px circles, pastel bgs) around a centred block. H1 "Find the right sponsored healthcare role for you". Sub "Flint helps healthcare professionals on temporary status find sponsored healthcare jobs." Primary button "Apply now". One avatar (right, upper) carries a chip: Kenya flag, "Clara", divider, "CNA, North Dakota" (`5647:1797`). A hidden `Background` (`5543:918`, ellipse + photo) is turned off. |
| 2 | `5543:1006` / `5543:1007` | stats | 380 | Cream (tertiary) panel, two purple ring arcs bottom-left and top-right. Title (`5900:3811`, subtitle layer; the Title text layer is hidden): "Thousands of candidates placed. Millions of lives changed." Three stats: **1000+** People relocated (the "+" is a small suffix), **28** States with Facility Partners, **500,000+** Patients Served. |
| 3 | `5543:977` / `5543:978` | Frame 2147242281 / faq-section *(misnamed: this is How it works)* | 4132 | White. Header: "How Flint works" / "See how Flint matches you with facilities, covers cost, and gets you to permanent residency." Then **5 stacked rows**, alternating text and art (art 50/50, rounded card about 420 x 500): 1 "1. Apply in under one minute." (body "We'll reach out directly by calling or texting ... your unique immigration situation." + 2 check bullets that still read "Bullet" / "Bullet"; art = stacked "Applications sent" cards, Kwame Asante, on grey); 2 "2. Interview directly with Facilities" (art = video call mock on cream with purple/pink arc, small second participant); 3 "3. Save thousands on immigration fees" (art = white checklist card: Immigration lawyer fees, USCIS filing fees, Green card case preparation, Licensing expenses, Immigration administration, Relocation assistance, on grey with purple arc); 4 "Work while your green card processes" (art = orbit diagram "Case preparation" with 6 icon nodes around a centre avatar, on cream); 5 "Find permanent stability in the US" (art = full-bleed photo of a nurse with name chip "Fabiana / RN, Maplewood" and Mexico flag). Note: steps 1-3 are numbered in the titles, 4-5 are not (likely a design inconsistency). Panel ids: row 1 `5543:982`, 2 `5543:988`, 3 `5543:994`, 4 `5594:26918` (sic, the 4th row is `5543:994` orbit; row 5 `5594:26918`). Art sub-frames: `5918:1151` (apply cards, with `Notifications` `5918:1351`), `5543:993` (call), `5543:995` (checklist + ellipses `5565:26708`, `5612:511`; orbit `5596:27046`...`5599:403`, label `5612:515`). *(row to node mapping partly inferred from names)* |
| 4 | `5549:1195` / `5549:1196` | Frame 2147242284 / Benefits | 1048 | Grey (secondary) panel. Title "Healthcare roles with sponsorship", sub "Don't see your role listed? Apply and we will work with you to find a solution.", Primary button "Apply now". Grid of **11** white cards, 3 columns (last row 2): Registered Nurse, Certified Nursing Assistant, Licensed Practical Nurse, Housekeeper, Medical Assistant, Phlebotomist, Allied Health, Certified Medication Aide, Dietary Aides, HHA, Caregiver. Each: title + 2-line description, no icons. Copy bugs: Housekeeper text is an ICU/ER/surgery nursing line; HHA and Caregiver repeat the Dietary Aides text. |
| 5 | `5938:2742` / `5938:2743` | Testimonials | 1118 | Cream panel. Title "What candidates are saying about Flint." Sub "Flint has helped hundreds of healthcare professionals find green card sponsored roles across the US." Row of photo cards (396 x 488, 3 full + partial edges cropped by the panel) with dark gradient, quote "Flint made everything feel easy. After years of uncertainty, they gave me a path and the support I needed to finally see a permanent future here.", name "Brandon Terry", place "Minesota" (typo), Nigeria flag round badge bottom-right. Below: two round white **prev / next arrow buttons** (no dots). 7 card instances (`5938:2749`-`2755`). Pagination frames `5938:2757`, `5938:2761`. |
| 6 | `5543:1071` / `5543:1072` | Frame 2147242280 / faq-section | 1292 | Grey panel. Title "Frequently asked questions", sub "Get answers to common questions about our Green Card pathway, candidate vetting, and healthcare placement process." Accordion of **8** `FAQ Item` instances (800px wide, white rounded rows, plus/minus circle): What costs does Flint cover? (shown **open**, answer "Flint covers immigration filing fees, lawyer fees, licensing support, and relocation assistance. You're responsible only for normal living expenses once working.", minus icon in a dark-purple filled circle), Where are the job locations?, How long is the commitment?, What if I am on a temporary or pending status?, What if I do not have work authorization?, Do you help with relocation and housing?, What about my family?, Is this real? Is Flint a scam? |
| - | `5543:1085` / `5543:1086` | CTA (**hidden**) | 560 | Old ring-of-circles CTA (mask group, ellipses), `hidden="true"` and overlapping section 7 in y. **Ignore; superseded by section 7.** |
| 7 | `5985:2429` / `5985:2430` | Hero-continuation | 811 | Cream panel, acts as the closing CTA. Title "It's Time to Find Your Green Card Sponsor", sub "Join hundreds of healthcare professionals who have started working towards permanent stability in the US.", Primary "Apply now". Bottom: a row of **tilted (rotated about -15 to +15 deg, fanned on an arc) portrait tiles** with pastel backgrounds (`#fee0db` pink), name pills with flag ("Andrew" x3 Nigeria, "Chrismene" Haiti/other), cropped at both panel edges. 6 tiles in the frame (`5985:2438`, `2444`, `2450`, `2456`, `2462`, `2468`) plus cropped edge tiles. |
| 8 | `5543:1122` / `5543:1123` | Footer | 808 | footer-desktop with its own cta-section (heading/subheading + "Apply now"), link grid (Institutional, Resources, Social, Legal), bottom bar "(c) 2026 Flint. All rights reserved." = `Global / Footer` (already migrated; not page work). |

## 2. Mapping to the registry (`components.md`)

| Figma section | Registry target | Status | Variant / work needed |
| - | - | - | - |
| Nav (in Hero) | `Global / Nav` | migrated (Light) | None. Switch the Candidates link to a page link when the page exists (`components.md` Nav note). Active link: Candidates via `w--current`. |
| 1 Hero | `Section / Hero` | migrated for **Home only** (arc wheel); Candidates variant `to do` | **New "Candidates" variant or its own markup.** Structure differs: a static-looking **circle** of 12 avatars instead of Home's rotating arc of 20 cards. Reuse `fk-hero-card-chip` style for the one "Clara" chip. The registry says a variant can't change structure (see Blog Hero precedent); recommend deciding: page-level pattern `Section / Candidates Hero` (*recommendation, inferred*) vs variant. Button: `UI / Button` Primary (migrated). |
| 2 Stats | `Section / Stats Band` | migrated (Large, brand-light panel, 4 stats) | **Differs**: cream/tertiary panel with two ring arcs, 3 stats not 4, title is a 2-line subtitle-style line (not a heading-md). Needs a **Default/Tertiary variant** (registry lists "Default to do") and `UI / Stat` Default (to do; Large is migrated). Stat "1000+" has a small suffix style, "500,000+" a large one (prop Suffix exists). Arc art: legacy has `stats-mask-1.svg`, `stats-mask-2.svg`, `stats-bg.png` in `public/assets`. |
| 3 How Flint works | `Section / How It Works` | migrated (Home carousel); Candidates `to do` | **NEW layout**: vertical stack of 5 alternating text/art rows, **not a carousel** (Home's is a horizontal carousel, `ix-how-carousel`). Treat as a new page-level pattern, e.g. `Section / How It Works` "Steps" variant or `fk-steps` markup. Needs 5 bespoke art cards (see section 4). Bullets use a check icon (exists as `ic-check.svg`). |
| 4 Benefits | `Section / Role Grid` (migrated component, 11 role cards, Subtle `ServiceCard`, props Title/Body/Button Label/Link, no icons) | migrated | **Matches exactly** (11 cards, no icons, title, body, Apply now button; Figma node name is still "Benefits" but the content is the Role Grid content, same as Home's `6011:3021`). The Pages table row says "Feature Grid <- `Benefits`" and is **wrong** for this design (legacy Benefits had 3 icon cards). Only the copy differs/needs fixing (see section 5). |
| 5 Testimonials | `Section / Testimonials` (migrated component, Slider, prop Body, 21 `UI / Testimonial Card` instances) | migrated | Cards match the Home design (photo + blur + quote + name + flag); but Figma shows **prev/next arrow buttons instead of the dots** and a **cream** panel with a sub in brand-purple. Decide: new variant "Arrows" (adds `Carousel Arrows` UI, reuses Nav arrows `arrow-left/right.svg`) or keep dots. Text strings need per-page override: the component prop is only Body, cards use fixed content (see section 6). Place names say "Minesota". |
| 6 FAQ | `Section / FAQ` | **legacy** (`Faq.tsx`) | **To build** as page-level markup: `fk-faq-*` with `ix-faq-toggle` (legacy status). 8 items, 800px list, plus/minus circle toggle; the first item open by default with a filled dark-purple minus circle. Needs `FAQPage` JSON-LD (`seo.md` S-08). Wrapper FAQ copy unchanged from legacy. |
| 7 Closing CTA ("Hero-continuation") | `Section / CTA` | migrated (Art, Home); variants Gallery (About) and Simple are listed | The Pages table says "CTA (Simple)" but the design is a **new variant: photo-tiles fan** (Candidates). Not Simple, not Art. Legacy `FacilityCta.tsx` is a 12-photo marquee of framed tiles, `fk-marquee` in `classes.md`. |
| 8 Footer | `Global / Footer` | migrated | None. Hidden `CTA` node `5543:1085` is dead. |

## 3. Motion and illustrations

Figma carries no prototype/animation data (`get_motion_context` recursive: empty). What the static design implies *(inferred)*:

| Element | What the design shows | Existing `ix-*` that could cover it | Needs |
| - | - | - | - |
| Hero avatar ring | 12 avatars on a circle (radius 328 around the centre of a 736 circle), chip pinned to one avatar. Legacy `ProximityOrbit` orbited continuously, slowed on hover (speedDown x6), staggered enter, tooltips per person | `ix-hero-arc` (rotation 0 -> 110 on `.fk-hero-wheel`, 30s, infinite, hover pause) rotates a wheel; a circle needs **360 degrees plus counter-rotation of each avatar** (so faces stay upright) | New interaction `ix-hero-orbit` (or reuse with 360deg + per-avatar counter-rotate), no always-visible chip: the Figma "Clara" pill is slot 3's hover tooltip only (decided 2026-10-01). Hover tooltip would be CSS hover on the avatar (no IX). |
| Hero enter | Legacy staggered enter | `ix-reveal-stagger` / `ix-blur-reveal` | None new. |
| Stats | Numbers | `ix-count-in` (legacy, not built on any page yet) | Build `ix-count-in` or skip. Ring arcs: `ix-parallax` (legacy) in the repo; optional. |
| How it works art | Static compositions; legacy had animated `InterviewIllustration`/`SendIllustration`/ orbit diagrams (`*Illustration.tsx` with `useInView`) | `ix-illustration-play` (legacy): Lottie / scroll-into-view once | Decide: static images (recommended, like Home's cards art `-bg`/`-art` layers) or Lottie; `interactions.md` Illustrations section covers the workflow. The "Applications sent" stack, the orbit diagram and the checklist are the animation candidates *(inferred)*. |
| Row reveal | (5 rows) | `ix-reveal` per row | None new. |
| Role cards | hover | `ix-card-hover` (production built) and `ix-reveal-stagger` | None new (same as Home Role Grid). |
| Testimonials slider | Looping row with cropped edge cards, arrows | `ix-testimonials` (infinite loop, dots click jump, hover pause) and `ix-testimonial-hover` | **Arrows** prev/next = new click triggers (`x-carousel-goto` caveat: IX3 has no "current slide" state; a backward jump plays the forward transition from its fixed start). Drag: `x-testimonial-drag` candidate deferred. |
| FAQ accordion | Open item, plus <-> minus icon swap, filled circle when open | `ix-faq-toggle` (legacy: toggle `is-faq-open`, height 0 -> auto, rotate icon 45deg). Webflow has native **Dropdown/Accordion via interactions only**; `data_interactions` fine. | `ix-faq-toggle` must be built + the icon is plus/minus shapes (two assets `plus.svg`, `minus.svg` exist) so rotation is not enough: swap via class. First item open by default needs a Set. |
| Closing CTA tiles | 6+ tilted tiles fanned on an arc, cropped at edges; legacy was a **marquee** of framed photos | `ix-marquee` (linear infinite X, `.fk-logo-marquee-track`; classes note `fk-marquee` for this exact CTA) | If a marquee: reuse `ix-marquee`, but the per-tile rotation (arc) has to be static CSS `rotate` per tile (combo classes). If not a marquee: static, plus `ix-reveal-stagger`. Not a physics gallery (`x-gravity-gallery` is for About's CTA Gallery, not this page). |

No Lottie, physics gallery or video appears on this page.

## 4. Assets

Existing under `public/assets/` (checked by `ls`):

| Needed | Seems to exist? |
| - | - |
| 12 hero avatars | **Decided 2026-10-01: the Home hero's ten portraits (`home/candidate-01..10.webp`) in 12 slots with two repeats.** Earlier note: `candidates/orbit-01..12.png` yes (matches 12 nodes; **verify they are the same faces** as the Figma crop, *(inferred: legacy list names Maria, Diego... Figma chip says "Clara, CNA, North Dakota" so identities differ; crops may need re-export)*. |
| Flags (Kenya, Nigeria, Mexico, Haiti, Philippines...) | `flags/` has ke, ng, mx, ht, ph, in, us and others. Haiti `ht.svg` yes. Note Figma "Chrismene" flag is red/blue (Haiti or Philippines; unclear). |
| Stat ring arcs | `stats-mask-1.svg`, `stats-mask-2.svg`, `stats-bg.png` (legacy Stats), possibly also in `home/` (`cta-ring.svg`). Figma uses `Ellipse 3` + `image 10` (Stats Band Large uses the same; reuse). |
| How it works row 1 (Applications sent stack, Kwame Asante) | `how-flint-works/send-kwame.png`, `send-amara.png`, `send-raj.png`, `send-flag-*.svg`, `ic-send.svg` yes (legacy SendIllustration); Home also has `how-card-*.webp`. |
| Row 2 (video call) | `how-flint-works/cp-*` (call panel), `ic-video.svg`, `ic-mic.svg`, `ic-endcall.svg`, `ic-participants.svg`, `cp-avatar-1/2.png`; Home `how-call-dieunold.png`, `how-call-ic-video.svg`. The main call photo and arc may need a re-export. |
| Row 3 (checklist) | `ic-check.svg` yes; arc art probably from `how-bg-purple.png` *(inferred)*. |
| Row 4 (orbit diagram icons) | `how-it-works/*` (chart, facilities, handshake, hub-people...) are from a different legacy graphic; the 6 icon nodes (doc, id card, gavel/legal, globe, send, check-circle) **probably need export**; `how-flint-works/cp-*.svg` has doc/people variants. Centre avatar: needs export. |
| Row 5 (nurse photo) | Not found by name (Home has `candidate-01..10.webp`, `banner-nurse.jpg`); **export from Figma** `5918:1107/1140` *(inferred)*. |
| Testimonial photos | `testimonial-photo-1..3.webp` (3 images reused for 7 cards, and in Figma each card is a different photo or the same 3; blur treatment done in component). Nigerian flag badge: `flags/ng.svg`. |
| Role cards | No assets. |
| FAQ | `plus.svg`, `minus.svg` exist. |
| Closing CTA tiles | `candidates/cta/01..12.png` (legacy, used with `mix-blend-luminosity`; the Figma tiles are portrait cutouts on `#fee0db` pink); different crop vs legacy *(inferred: verify)*. Chip flags as above. |
| Arrow buttons | `arrow-left.svg`, `arrow-right.svg`. |
| Logos | `flint-logo-brand.svg`. |
Note: Webflow uploads of these still follow the project's asset step (`webflow-ids.json` -> `assets`) - not checked here.

## 5. Differences

**Design vs legacy `FacilitiesPage.tsx`** (Hero > Stats > HowFlintWorks > Benefits > Testimonials > Faq > FacilityCta > Footer):
- Same section order, **but** Benefits is now the **Role Grid** (11 role cards) instead of 3 icon cards ("Ready to relocate", "Commitment", "Permanent residency").
- Hero: ring of 12 portraits, tooltip on hover only (no static chip, 2026-10-01), vs legacy continuous orbit with per-person tooltips and h-svh height; Nav overlaid (legacy `SiteNav layout="overlay"`) is now `Global / Nav` inside the panel. The hero panel is grey (secondary) rather than `bg-brand-light`.
- Stats: 3 stats (1000+ People relocated, 28 States with Facility Partners, 500,000+ Patients Served) and a title "Thousands of candidates placed. Millions of lives changed." vs legacy 3 stats "200+ Roles placed, 23 States, 100,000 Patients Served". Numbers changed.
- How it works: "How Flint works" 5-row vertical stack with two numbered headings "Apply in under one minute." replacing "Send application" (legacy first title) and the legacy `InterviewIllustration`. Legacy steps: Send application, Interview directly with Facilities, Save thousands on immigration fees, Work while your green card processes, Find permanent stability in the US (same 5; first one renamed).
- Testimonials: arrows instead of pagination bars, "Brandon Terry / Minesota" only (no role), cream panel; legacy had the old framer-motion slider with a `CarouselPagination` bar.
- FAQ: 8 questions, same as legacy; answers not re-checked beyond the first. Sub now "Get answers to common questions about our Green Card pathway, candidate vetting, and healthcare placement process." (same as legacy).
- CTA: new "It's Time to Find Your Green Card Sponsor" + tilted portrait fan; legacy `FacilityCta` had the hero's repeated sub ("Flint helps healthcare professionals on temporary status...") and a 12-tile photo marquee. Dead hidden CTA remains in the file.
- Footer: has own cta-section inside the footer (the `Global / Footer` already covers it).

**Design vs the Pages-table row** (`components.md` line 114: "Hero (Candidates), Stats Band, How It Works (Candidates), Feature Grid <- Benefits, Testimonials (Slider), FAQ, CTA (Simple)"):
1. `Feature Grid <- Benefits` should be **`Role Grid`** (component, migrated).
2. `CTA (Simple)` should be a **new CTA variant** (tilted portrait fan, marquee or static) - "Simple" is a text-only CTA.
3. `Testimonials (Slider)` needs an **arrows** option (Home uses dots) and the cream panel.
4. `Stats Band` needs a non-Large variant (3 stats, tertiary panel) - registry says only Large is migrated.
5. `How It Works (Candidates)` is a vertical stack, not the Home carousel - variant label misleading, likely a separate layout.
6. FAQ is `legacy` in the registry, it is a required new build; Nav "Candidates" link to convert to page link.
7. Missing from the row: nothing else; but the Footer is unlisted (it is global).

## 6. Proposed build order (checklist)

- [ ] Confirm open questions below (at least Q1, Q2, Q3, Q7) before building art.
- [ ] Fix the Pages-table row for Candidates in `components.md` (Role Grid, CTA variant, Stats variant, arrows) - repo doc only after owner agreement.
- [ ] `Section / Hero` Candidates: circle of 12 avatars (static markup; then orbit interaction).
- [ ] `Section / Stats Band` tertiary/3-stat variant + `UI / Stat` Default; optionally `ix-count-in`.
- [ ] `Section / Role Grid` instance with Candidates copy (reuse migrated component; fix the 3 wrong descriptions). No new work besides copy.
- [ ] How It Works stack: 5 rows (page markup), art per row: export missing assets (row 4 icons, row 5 photo), bullets with `ic-check.svg`.
- [ ] `Section / Testimonials` Arrows variant (or accept dots), update card copy and 7 Brandon-Terry-style cards.
- [ ] `Section / FAQ`: page-level markup + `ix-faq-toggle` + `FAQPage` JSON-LD.
- [ ] Closing CTA variant: tilted tiles (marquee or static), pink tile backgrounds, name pills.
- [ ] Compose `src/pages/CandidatesPage.tsx` (new), route `/candidates`; switch Nav link to a page link; SEO title/description (`seo.md`).
- [ ] Interactions: `ix-reveal`, `ix-blur-reveal`, `ix-card-hover` on Role Grid (existing); build `ix-faq-toggle`, `ix-count-in` (optional), orbit, testimonials arrows.
- [ ] Tablet/mobile pass after designer supplies frames.

## 7. Open questions for the designer/owner

1. **Mobile and tablet frames**: none found. Are they coming? Until then responsive behaviour (ring of 12 avatars on phone, stacked rows, fanned tiles) is a guess.
2. Hero: does the ring rotate? Resolved 2026-10-01: no static chip, a tooltip per avatar on hover only (slot 3 is Clara). Legacy orbited and showed a tooltip per person.
3. Is the Hero a variant of the Home `Section / Hero` (registry says variants can't change structure) or its own page-level pattern (as Blog Hero)?
4. Stats: confirm the numbers (1000+ / 28 / 500,000+ vs legacy 200+ / 23 / 100,000) and that the title is a single centred line styled as a subtitle (the Title layer is hidden in Figma).
5. How It Works: steps 4 and 5 are unnumbered, 1-3 numbered; is that intended? Bullets still say "Bullet" / "Bullet": provide the copy. Are the five art cards static or animated (legacy had animated illustrations; `ix-illustration-play` is legacy)?
6. Role cards: confirm descriptions for Housekeeper, HHA, Caregiver (copy-paste placeholders); is the section title in Figma ("Benefits") just a layer name?
7. Testimonials: arrows (not dots) on this page, and is the loop automatic or arrow-driven only? Names/places (Brandon Terry / "Minesota" typo) are placeholders? The same card in Home uses role; here location.
8. Closing CTA: marquee or static fan? Six visible tiles + edges cropped suggests a wide row; provide the final tile list (names, flags; "Chrismene" flag is unclear).
9. The hidden old CTA (`5543:1085`) and hidden hero background (`5543:918`): delete confirmed?
10. FAQ: first item open by default on load or only a design state?
11. Is the "Apply now" target the shared `#apply` anchor as on Home, or a form on another page (`Section / Apply Form` is legacy on Facility partners)?
