# About page (`/about`) — Figma pre-plan

Source: Figma file `bFJIQUAnqKd2ueYqsV8rRd`, frame **About us** `5805:3949` (1440 x 6522, canvas page "Flint Blog + Social" `3123:329`). Read-only pre-plan; nothing in the repo was changed. "(inferred)" marks anything not stated in Figma.

Legend for status: migrated = built in repo per components.md; legacy = only pre-contract code; NEW = no registry entry.

## 1. Sections in order (desktop 1440)

| # | Figma node | y / h | What it is | Key copy |
|---|---|---|---|---|
| 0 | (Nav, inside 5993:3802) | 0 / 32 | Nav bar with Wordmark, links Services, Candidates, Facility partners, About, Blog; "Apply now" (outlined pill) | |
| 1 | `5993:3802` "stats" (misnamed; it is the hero) | 0 / 632 | Light-grey (#f6f6f8-ish, inferred) rounded panel holding the Nav, eyebrow, centered H1 and a 1200px-wide photo strip of 7 overlapping cut-out nurse portraits on a grey rounded band (nodes `5993:3822` and images 48, 51, 52, 53, 55, 56, 57) | Eyebrow "About us"; H1 "Building the path to permanence for the nurses America needs" |
| 2 | `5805:3993` "Frame 336" | 632 / 892 | Text panel, warm peach background (Brand-Light look, inferred), centered 521px column: eyebrow, serif H2, 4 paragraphs | "Mission" / "Why we exist"; body starts "U.S. hospitals are in crisis. Rural and community facilities..." ends "...a family able to build a permanent life in the U.S." (one text node in Figma, rendered as 3 paragraphs: problem, "Flint connects them directly...", "Most staffing models optimize for the next 13 weeks...") |
| 3 | `5805:4114` "Frame 2147242255" | 1524 / 1029 | **Team**: centered header (eyebrow, H2, 480px intro), 3 cards 389px wide: greyscale square portrait, name, role, "Read more" link | Eyebrow "What makes Flint different" (copy bug, see 5), H2 "Backed by the best" (copy bug), intro "Investors who saw the same gap we did..." (copy bug). Cards: Kenton Jarvie, CEO, Co-Founder / Anson Kung, COO, Co-Founder / Neil Prigge, VP Operations, Co-Founder; link "Read more" on each |
| 4 | `5805:4067` "Frame 2147242256" | 2553 / 656 | Text panel, light-grey (Tertiary look, inferred) | "Our Story" / "Why this is personal"; body "Flint was founded in 2024 by Kenton Jarvie, Anson Kung, and Neil Prigge — but the idea didn't start as a business plan..." ends "Flint exists to fix that pipeline." |
| 5 | `5805:4021` "Frame 337" | 3209 / 816 | Media split, text left (480) / image right (632x421, rounded, care-home lounge photo) | Eyebrow "What makes Flint different"; H2 "Permanent residency, not another visa"; 2 paragraphs ("Most pathways into U.S. healthcare work run through temporary visas..." / "For facilities, that same commitment solves the problem agency staffing never could: retention...") |
| 6 | `5805:4000` "stats" | 4025 / 416 | Grey rounded band, centered H2 + 4 big serif stats in a row | H2 "Small team big impact"; 2024 Founded / 200+ Roles placed / 23 States / 100,000+ Vetted candidates |
| 7 | `5805:4030` "Frame 2147242254" | 4441 / 697 | **Investors** logo grid: same centered header + 4 tiles (294x191) on peach | Eyebrow "What makes Flint different"; H2 "Backed by the best"; intro "Investors who saw the same gap we did: a healthcare system in crisis, and a global workforce ready to fill it, if only someone built the bridge." Logos: Y Combinator (node `5805:4039`), Haystack (`5805:4044`), Audacious (`5805:4046`), Rhino Ventures (`5805:4048`, vector) |
| 8 | `5805:4141` "Frame 2147242253" | 5138 / 576 | **Two side-by-side CTA cards** (696x560 each, 16px outer gap, 24px-ish radius, inferred), each: serif H2, body, one button. Left tile `5805:4143` grey, right tile `5985:2564` peach | Left: "Not just a job. A permanent future." / "Find a healthcare role with a facility ready to sponsor your green card from day one." / button "See if you qualify". Right: "Create a lasting team for success." / "Stop paying costly agency fees. Flint links you to licensed, motivated US professionals." / button "Apply as facility" |
| 9 | `5805:4161` Footer | 5714 / 808 | Dark brand-purple footer with its own CTA band | heading "It's time to find your green card sponsor." subheading "Apply now, it is free." button "Apply now"; columns Institutional (For nurses, For facilities), Resources (Blog, Webinars, About us, Brand, Careers), Social (Instagram, LinkedIn [Figma typo "LinkeDin"], TikTok, Facebook, X), Legal (Privacy, Terms, Cookie settings); "© 2026 Flint. All rights reserved." |

Hidden layers in the frame (`hidden="true"`, ignore, do not build): "Group 195" concentric arcs `5805:3978`, Rectangle 6633/6634, Logo/Vector 12/13 (old hero art), "Screenshot 2023-12-14" `5805:3992`, **"Believes" values section `5805:4074`** (Our values: Create net good / Obsess over quality / Play offence, not defence; template copy from another product, "starting a solo business"), "image 71" `5805:4066`, Pagination dots `5805:4203`, photo icon `5805:4212`.

## 2. Mapping to the registry (components.md)

| # | Section | Maps to | Status | Variant / notes |
|---|---|---|---|---|
| 0 | Nav | `Global / Nav` | migrated (Light) | Design shows the light nav on a light panel (same as legacy). "About" is the current link: switch the About links in Nav to a page link so `w--current` applies (Nav row requires this when the page is built). Figma nav has "Apply now" as an outlined/secondary pill (matches Secondary Small) |
| 1 | Hero | `Section / Hero` variant **About** | Hero migrated for Home only; About = to do | Structure differs (no arc wheel, no blur pills): eyebrow + H1 + photo strip. components.md says a variant can't change structure, and Hero is a component with no props. **Recommend page-level markup (like Blog Hero, D-17) on the shared panel shell**, or a new variant if the owner wants a component (open question Q1). H1 is the page's single H1 (seo.md). Photo strip = 7 overlapping cut-outs (inferred: absolute positioned, z-order alternates). |
| 2 | Mission | `Section / Text Panel` | migrated | **Brand Light** variant (peach in Figma). Props Eyebrow + Title exist; body paragraphs "static for now" — About has 3 paragraphs here and 1 in Story, so Body needs to be a Rich Text prop or fixed markup (open question Q2) |
| 3 | Team | `Section / Team Grid` | legacy | Needs building. New vs legacy: card now has a "Read more" link per member (legacy had none). Needs a `UI / Team Card` (Image, Name, Role, Link) or plain markup (inferred). Whether the 3 founders are CMS items: components.md says CMS content is never a prop; 3 fixed cards probably static (Q3) |
| 4 | Story | `Section / Text Panel` | migrated | **Tertiary** (default) |
| 5 | Residency | `Section / Media Split` | legacy | Variant **Image Right** (text left, image right). Image Left is not used on this page |
| 6 | Impact stats | `Section / Stats Band` + `UI / Stat` | migrated (Large) | Large variant: title + 4 stats, suffix "+" on two of them. Figma panel is grey (#f6f6f8-ish) not the brand-light panel the registry describes ("brand-light panel") — verify colour (Q4). "stat props to do": values, suffix, label need to be editable here |
| 7 | Investors | `Section / Logo Grid` | legacy | Needs building. Four tiles, tile background peach; the Rhino tile has no visible card in legacy but does in Figma (inferred uniform tiles) |
| 8 | CTA | **NOT `Section / CTA` (Gallery)**. NEW: "Dual CTA" | NEW | See section below |
| 9 | Footer | `Global / Footer` | migrated | Its CTA defaults title "Find the right green card / sponsored role for you." and body "It's free to apply and takes under a minute." are kept (user decision 2026-10-02). Figma footer link list (Institutional / Resources / Social / Legal, Brand, Careers) should be compared with the built Footer (not diffed here) |

### The CTA, exactly
Figma shows **no gallery, no physics, no avatar pile** on `/about`. The bottom CTA is two equal static cards (`5805:4143` left, `5985:2564` right), each with H2 + body + one button, sitting in one 1440x576 row with 16px margins. Both cards contain leftover layers named "Mask group / image 14 / Background / Ellipse 3 / image 10" (ring texture + room photo, same as the Home Art CTA) but in the rendered screenshot they are NOT visible (flat grey and peach fills only; likely clipped off-card or fully transparent — inferred, confirm with the designer). No avatars appear anywhere on the frame. So:
- The registry's "CTA (Gallery)" for About and P-01 (Matter.js `x-gravity-gallery`) are **obsolete for this page**. P-01 is not needed for `/about`; it should only stay open if another page uses a gallery (none found in this frame).
- What is needed instead is a two-up "Split CTA": two `fk-panel`s (one Tertiary grey, one Brand-Light peach) in a 2-column grid, each a left-aligned `fk-section-header` + one `UI / Button` Primary (labels "See if you qualify" and "Apply as facility"), content column 436px wide and inset 130px from the card edge (inferred: centered vertically). Could reuse the existing CTA page-markup pattern (`fk-panel is-relaxed`, `fk-cta-*`) doubled, or become a new `Section / Split CTA`. Stacks to 1 column on tablet/phone (inferred).
- Then the Footer adds its own CTA band (section 9), so the page ends with two CTAs back to back (see questions).

## 3. Motion / illustrations

- Figma prototype/motion data: `get_motion_context` (recursive) returned **no animated nodes**. No annotations found in metadata. So nothing is specified as animated.
- Inferred from repo patterns (legacy used BlurReveal on every header, stagger reveal on cards/tiles, DigitPopIn on stats):
  - Section headers: `ix-blur-reveal` (migrated, `data-ix="blur-reveal"` + `.fk-blur-reveal`).
  - Team cards, logo tiles, the two CTA cards, hero photo strip: `ix-reveal-stagger` or `ix-reveal` (both built).
  - Stat values: `ix-count-in` (exists in registry, marked "not on any production page", built in Stage 8 as skipped because Home had no `.fk-stat-value`; would need its first real build/verification here).
  - Legacy hero used inline "pill" portraits inside the H1 with blur reveal; the final design drops that for the photo strip.
  - No Lottie illustration on this page; `ix-illustration-play` and `UI / Illustration` not needed.
  - No new interaction required. `x-gravity-gallery` not needed (see CTA).
- Hover: "Read more" links and buttons only (standard button hover, inferred). `ix-card-hover` is for `.fk-card`, not needed unless Team cards become cards.

## 4. Assets

Existing in `/home/claude/Flint/public/assets/about/`: `hero-01..07.png`, `hero-collage.png`, `hero-pill-01..03.png`, `hospital.png`, `investor-02.png`, `investor-03.png`, `investor-04.svg`, `investor-yc.svg`, `team-anson.png`, `team-kenton.png`, `team-neil.png`, `team-background.png`.

| Need | Figma | Exists? |
|---|---|---|
| 7 hero portraits (cut-outs) | images 48, 51, 52, 53, 55, 56, 57 | Probably `hero-01..07.png` (7 files, inferred match; not visually compared) or `hero-collage.png` (single pre-composed strip?). Verify which, and whether the Figma overlap/ordering can be reproduced with 7 separate layers |
| Team portraits (greyscale) | 3 x "Image (Karri Saarinen)" (template name) | `team-kenton/anson/neil.png` exist; Figma shows them fully greyscale, legacy applied grey bg at 80% opacity — confirm whether the files are already B&W |
| Residency photo | rounded-rectangle `5805:4029` | `hospital.png` (likely same, inferred) |
| Investor logos | Y Combinator, Haystack, Audacious, Rhino | `investor-yc.svg`, `investor-02.png`, `investor-03.png`, `investor-04.svg` |
| CTA background art | hidden layers image 14 / image 10 / ellipse | Not visible in design, none needed unless designer confirms |
| Wordmark, footer line | | `flint-logo-brand.svg`, `flint-logo-white.svg`, `footer-line.svg` exist |
| Hero `hero-pill-01..03.png`, `team-background.png`, `hero-collage.png` | not in final design (inferred) | unused candidates |

Upload to Webflow with alt text: hero strip (decorative or "Flint nurses"), team names, hospital photo, investor names.

## 5. Differences

**Vs legacy `AboutPage.tsx`** (order: Hero, Mission, ImpactStats, Residency, Investors, Story, Team, Cta):
- Order changed to: Hero, Mission, **Team**, Story, Residency, Stats, Investors, CTA(s).
- Hero: legacy H1 had inline pill portraits and a brand-light panel; final is a plain H1 + separate photo strip, nav inside a light panel.
- Team: "Read more" link added to each member; header copy still duplicated from Investors (known issue).
- CTA: legacy used the generic home `Cta` ("Your green card pathway starts here."); final is two audience CTAs.
- Story uses Tertiary panel, Mission uses Brand-Light (legacy similar; confirm).
- No "values"/Believes section (hidden in Figma; do not build).

**Vs the components.md Pages-table row** `Hero (About), Text Panel (Tertiary), Stats Band (Large), Media Split, Logo Grid, Text Panel (Brand Light), Team Grid, CTA (Gallery)`:
- Order is wrong: final order is Hero, Text Panel (Brand Light = Mission), Team Grid, Text Panel (Tertiary = Story), Media Split (Image Right), Stats Band (Large), Logo Grid, Split CTA.
- Panel variants are swapped vs the row (Mission = Brand Light, Story = Tertiary; row lists Tertiary first, Brand Light second).
- "CTA (Gallery)" must become a two-card Split CTA (NEW). Suggest also updating the `Section / CTA` row (Gallery variant) and P-01 in roadmap.md.
- "Known content issues" still true: Team header repeats Investors copy. Needs real copy (Q5).

## 6. Build order and open questions

Proposed checklist (repo first per AGENTS.md, then mirror to Webflow):
- [ ] 1. Decide Q1, Q2, Q3 (answers change component shapes).
- [ ] 2. Hero (About): markup/variant, photo strip (asset check first).
- [ ] 3. Text Panel Brand Light (Mission) with multi-paragraph body (already migrated; add Rich Text/Body handling).
- [ ] 4. Media Split (Image Right) — build, used once.
- [ ] 5. Stats Band (Large): stat props, verify panel colour; wire `ix-count-in` if wanted.
- [ ] 6. Text Panel Tertiary (Story) — reuse.
- [ ] 7. Logo Grid (4 tiles).
- [ ] 8. Team Grid + team card (with Read more link; destination unknown).
- [ ] 9. Split CTA (2 panels, 2 Primary Buttons).
- [ ] 10. Nav About link -> page link; page settings, SEO, OG per seo.md.
- [ ] 11. Reveal interactions (blur-reveal, stagger) in data attributes; verify at tablet/phone.
- [ ] 12. Update components.md Pages row, CTA row, roadmap P-01.

Open questions for designer/owner:
- Q1. Hero About: component variant, or page-level markup? Are the 7 portraits one image (`hero-collage.png`) or 7 layers? Desired tablet/phone behaviour of the strip.
- Q2. Mission/Story body: Text Panel currently has static paragraphs; make Body a Rich Text prop or leave fixed?
- Q3. Team: "Read more" destination (bio page? modal? CMS Team collection?). Is Team content CMS or fixed 3 cards? Team header copy is a duplicate of Investors: need real eyebrow/H2/intro.
- Q4. Stats panel background: grey in Figma vs brand-light registry description for Stats Band Large; confirm token.
- Q5. Confirm the Figma "Mask group / image 14 / ring" layers inside both CTA cards are intentionally not shown.
- Q6. Two CTAs plus the footer CTA in a row is repetitive; intended? Also both CTA button link targets (`/candidates` and `/facility-partners` inferred; no links are in Figma).
- Q7. Is P-01 (physics gallery) still wanted anywhere? If not, close it.
- Q8. Tablet/mobile frames: none found. The canvas page "Flint Blog + Social" (`3123:329`) has no sibling frames of 390/768 width near x≈9865 (scanned top-level frames by name and size only; only 1440 x 960 frames `4902:55/62/76` exist, unrelated). Breakpoints below 1440 must be inferred from legacy and the Home page; ask for a mobile frame.
- Q9. H1 eyebrow "About us" is 16px subtle text; Figma's nav shows "About" link with no visible active style (nav from Home).

## Breakpoint notes (all inferred, no non-desktop frames)
- Desktop: content max 1200, 120px side padding on sections, panels have 16px page margin; text panels 521px column, headers 480px.
- Tablet/phone: stack Team (3 -> 2 -> 1 col), Logo Grid (4 -> 2 cols like legacy), Stats (4 -> 2x2), Media Split (image below text), Split CTA (2 -> 1). Hero photo strip likely crops or scales.

## Update 2026-10-01 (built in the repo)

The page is built (`roadmap.md` step 6, `components.md` → Pages → About). Where this pre-plan changed: Mission is **Tertiary** and Story **Brand Light** (Figma `5805:3993` / `5805:4067`; section 2 above guessed right, the later brief had them swapped); the stats panel is `color-brand-light`, as the registry said (Q4 answered); the hero is page-level markup and one `h1` serves the strip (above 991px) and the pill title (Tablet and down, the phone frame `5974:7519` that now exists, Q8); Team "Read more" and the photo open a modal (Q3); Q1, Q2, Q6 and Q7 are answered in the brief; the CTA is built as page markup, `Section / CTA` (Split). The portraits 1, 5 and 7 of the strip are the unused `public/assets/candidates/cta/05, 09, 01.png` exports (the earlier guess that `hero-01…07` match was wrong: only four of them do), and the Residency photo of Figma's desktop frame is still missing.

## Update 2026-10-02 (user review)

Mission, Story, Team and Residency are page-level markup (`AboutMission`, `AboutStory`, `AboutTeam`, `AboutResidency`), not `Section / Text Panel`, `Team Grid` or `Media Split` components (D-17, D-40); Facility partners won't use Media Split, so there is no Image Left variant. The Footer keeps Home's default CTA copy (the About-specific copy in section 9 and the open question about it are dropped). `x-modal` is About-only for now. The hero panel is white at every width (no grey fill on Tablet and down), and the shared stat and display text sizes are unchanged.
