# Image width / height handoff (Designer)

Working document, rewritten 2026-10-06 (follow-up to the image re-export, decision D-51, contract 1.12). Never published, nothing deleted on Webflow.
Element ids are the first 8 characters of the element id (components: the last 4 characters of the id inside the definition). "Now on staging" is read from the published staging pages on 2026-10-06 (`none` = the `<img>` has no `width` / `height`).

**The rule (AGENTS.md rule 15):** Designer **Image width / Image height** (double-click the image, Enter, the cog, or `D`) = the image's **largest displayed CSS size** over viewports 360 to 1920, rounded up, with the height from the file's aspect ratio. Webflow writes `sizes="(max-width: Wpx) 100vw, Wpx"` from that width; the file's intrinsic size made desktop browsers fetch the full file. The repo's `width` / `height` already hold these same numbers. Values come from `scratchpad/display-sizes.json` (measured with the m0b method on the current build: transforms and `object-fit: cover` included); a value is never above the file's own width.

**Status 2026-10-07 (designer fix batch, not published):** SVG icon sizes set (Candidates 47, Facility partners 5, About 3). CMS-bound images now carry their largest displayed box size (see the CMS-bound line below; set 2026-10-07). Open: `UI / Button` and `UI / Input Field` icons have no size. See `sync-log.md` (2026-10-07 first row) and the `flint-webflow-sync` pitfalls.

## A. File replacements

None remain: all 15 re-exported assets were replaced in the Designer and verified on staging on 2026-10-06 (ids kept, new hosted names with a content hash, bytes equal the repo files).

## B. Image width / height to set, per page and component

### Home (page `6ab9ba4ceffb3329202448f2`)

**Done 2026-10-06 (✓ in the last column):** Home (22 elements; 2 "unchanged" rows verified), `Section / Hero` (20), `Section / Logo Marquee` (18), `UI / Testimonial Card` (1), set in the Designer through the browser pane and published to staging (`webflow.io`) at 2026-10-07T01:57:59Z. **Second batch, done 2026-10-07 (✓ on every remaining row):** Candidates (41 elements), Facility partners (12), About (14 + 2 unchanged verified), Blog (1459 × 800 already set), Categories template (`d3906d35`: the canvas showed Auto / Auto, so 1459 × 800 was typed), `UI / Quote Card` photo (52 × 52, one element for 15 instances), set in the Designer through the browser pane and published to staging at the time in `sync-log.md`. Also fixed: the logo alt text in `Section / Logo Marquee` (see `seo.md` S-16). Nothing in section B is left.

| Element (class) | File | Element ids | Now on staging | Set to W × H |
| --- | --- | --- | --- | --- |
| `fk-two-ways-nurse-right` | `home/two-ways-nurse-right.webp` | 7eb7c420 (1) | 318x426 | **159 × 213** ✓ |
| `fk-two-ways-nurse-left` | `home/two-ways-nurse-left.webp` | ed21dcbe (1) | 622x622 | **311 × 311** ✓ |
| `fk-two-ways-nurse-center` | `home/two-ways-nurse-center.webp` | dc8b4eaa (1) | 346x369 | **173 × 185** ✓ |
| `fk-two-ways-facility-image` | `home/two-ways-facility.webp` | 9e2be29a (1) | 1426x951 | **975 × 650** ✓ |
| `fk-pricing-avatar` | `home/pricing-avatar.webp` | 1a73d016 (1) | 172x215 | **86 × 108** ✓ |
| `fk-partners-map-image` | `home/partners-map-bg.webp` | d19af6a4 (1) | 1774x887 | **1774 × 887** (unchanged) ✓ |
| `fk-how-bg` card 1 | `home/how-card-bg-1.webp` | 78931884 (1) | 360x464 | **360 × 464** (unchanged) ✓ |
| `fk-how-art is-card-1` | `home/how-card-art-1.webp` | c220de11 (1) | 720x666 | **334 × 309** ✓ |
| `fk-how-bg` card 2 | `home/how-card-bg-2.webp` | 967beb2c (1) | 398x512 | **398 × 512** (unchanged) ✓ |
| `fk-how-art is-card-2` | `home/how-card-art-2.webp` | 311333c0 (1) | 668x824 | **334 × 412** ✓ |
| `fk-how-bg is-card-3` | `home/how-card-bg-3.webp` | 02a912b7 (1) | 588x482 | **294 × 241** ✓ |
| `fk-how-art is-card-3` | `home/how-card-art-3.webp` | 0bd30bde (1) | 720x862 | **382 × 457** ✓ |
| `fk-how-bg` card 4 | `home/how-card-bg-4.webp` | 0f35bdde (1) | 724x930 | **399 × 513** ✓ |
| `fk-how-bg is-card-5` | `home/how-card-bg-5.webp` | 8a9a3a37 (1) | 588x482 | **294 × 241** ✓ |
| `fk-how-art` card 5 | `home/how-card-art-5.webp` | b839e145 (1) | 668x762 | **334 × 381** ✓ |
| `fk-how-bg` card 6 | `home/how-card-bg-6.webp` | 91044c89 (1) | 722x928 | **399 × 513** ✓ |
| `fk-how-art is-card-6` | `home/how-card-art-6.webp` | 02053530 (1) | 720x862 | **382 × 457** ✓ |
| `fk-webinar-bg` | `home/webinar-bg-arc.webp` | 41e567ba (1) | 2400x668 | **1200 × 334** ✓ |
| `fk-webinar-call` | `home/webinar-call.webp` | 8695f97b (1) | 1254x836 | **627 × 418** ✓ |
| `fk-webinar-participants` | `home/webinar-participants.webp` | 2e1ab753 (1) | 708x306 | **470 × 203** ✓ |
| `fk-cta-ring-image` | `home/cta-flower.webp` | 4d1f3a85 (1) | 1672x941 | **1445 × 813** ✓ |
| `fk-cta-window-image` | `home/cta-room.webp` | 38e6a1fb (1) | none | **577 × 485** ✓ |
| `fk-cta-photo` | `home/cta-photo.webp` | 91ba1de8 (1) | 1156x971 | **578 × 486** ✓ |

> **Superseded by D-56 (2026-10-07) for the portraits below:** every `fk-hero-card-image is-cN` and `fk-orbit-image is-cN` row (Home Hero, Candidates ring and CTA arc) no longer exists. The elements use `candidates/arc/` and `candidates/ring/` files without `is-cN` combos; Designer Image width / height to set: **200 × 240** on the 20 Home Hero cards and the 20 Candidates CTA-arc cards, **80 × 80** on the 12 ring images. The old `home/candidate-NN` rows and sizes in this file are historical.

### Component `Section / Hero` (edit the definition once; Home gets it from the single instance)

| Element (class) | File | Element ids | Now on staging | Set to W × H |
| --- | --- | --- | --- | --- |
| `fk-hero-card-image is-c1` | `home/candidate-01.webp` | …d322, …d35e (2) | 200x240 | **539 × 539** ✓ |
| `fk-hero-card-image is-c2` | `home/candidate-02.webp` | …d328, …d364 (2) | 200x240 | **309 × 386** ✓ |
| `fk-hero-card-image is-c3` | `home/candidate-03.webp` | …d32e, …d36a (2) | 200x200 / 200x240 | **309 × 402** ✓ |
| `fk-hero-card-image is-c4` | `home/candidate-04.webp` | …d334, …d370 (2) | 200x240 | **372 × 372** ✓ |
| `fk-hero-card-image is-c5` | `home/candidate-05.webp` | …d33a, …d376 (2) | 200x240 | **376 × 470** ✓ |
| `fk-hero-card-image is-c6` | `home/candidate-06.webp` | …d340, …d37c (2) | 200x240 | **376 × 470** ✓ |
| `fk-hero-card-image is-c7` | `home/candidate-07.webp` | …d346, …d382 (2) | 200x240 | **309 × 412** ✓ |
| `fk-hero-card-image is-c8` | `home/candidate-08.webp` | …d34c, …d388 (2) | 200x240 | **540 × 540** ✓ |
| `fk-hero-card-image is-c9` | `home/candidate-09.webp` | …d352, …d38e (2) | 200x240 | **427 × 569** ✓ |
| `fk-hero-card-image is-c10` | `home/candidate-10.webp` | …d358, …d394 (2) | 200x240 | **606 × 606** ✓ |

### Component `Section / Logo Marquee` (3 copies × 6 logos, used on Home and Facility partners)

| Element (class) | File | Element ids | Now on staging | Set to W × H |
| --- | --- | --- | --- | --- |
| `fk-logo-marquee-logo` Lincoln Health | `home/logo-01.webp` | …18a6, …de34, …4a39 (3) | 264x72 | **132 × 36** ✓ |
| `fk-logo-marquee-logo` Pleasant View Home | `home/logo-02.webp` | …18a7, …de35, …4a3a (3) | 192x72 | **96 × 36** ✓ |
| `fk-logo-marquee-logo` Miramont | `home/logo-03.webp` | …18a8, …de36, …4a3b (3) | 202x72 | **101 × 36** ✓ |
| `fk-logo-marquee-logo` Gunnison Valley | `home/logo-04.webp` | …18a9, …de37, …4a3c (3) | 374x72 | **187 × 36** ✓ |
| `fk-logo-marquee-logo` CHRISTUS | `home/logo-05.webp` | …18aa, …de38, …4a3d (3) | 292x72 | **146 × 36** ✓ |
| `fk-logo-marquee-logo` Sandhills | `home/logo-06.webp` | …18ab, …de39, …4a3e (3) | 242x72 | **121 × 36** ✓ |

### Candidates (page `6abee855a6b6c496e11ca61d`)

| Element (class) | File | Element ids | Now on staging | Set to W × H |
| --- | --- | --- | --- | --- |
| `fk-orbit-image is-c1` (hero ring) | `home/candidate-01.webp` | 896cb882 (1) | 1024x1024 | **200 × 200** ✓ |
| `fk-orbit-image is-c2` (hero ring) | `home/candidate-02.webp` | 3cb9857c (1) | 682x852 | **161 × 201** ✓ |
| `fk-orbit-image is-c3` (hero ring) | `home/candidate-03.webp` | e7563859 (1) | 680x885 | **154 × 200** ✓ |
| `fk-orbit-image is-c4` (hero ring) | `home/candidate-04.webp` | 3ea3b71b, 9c8409aa (2) | 818x818 | **200 × 200** ✓ |
| `fk-orbit-image is-c5` (hero ring) | `home/candidate-05.webp` | cc2b50d7, 6b07b16c (2) | 820x1024 | **161 × 201** ✓ |
| `fk-orbit-image is-c6` (hero ring) | `home/candidate-06.webp` | 783621f9 (1) | 826x1032 | **161 × 201** ✓ |
| `fk-orbit-image is-c7` (hero ring) | `home/candidate-07.webp` | d3b86c5d (1) | 680x907 | **150 × 200** ✓ |
| `fk-orbit-image is-c8` (hero ring) | `home/candidate-08.webp` | 9dcc9709 (1) | 1024x1024 | **200 × 200** ✓ |
| `fk-orbit-image is-c9` (hero ring) | `home/candidate-09.webp` | 09a4f3d8 (1) | 938x1251 | **150 × 200** ✓ |
| `fk-orbit-image is-c10` (hero ring) | `home/candidate-10.webp` | 377fdeac (1) | 1024x1024 | **200 × 200** ✓ |
| `fk-hero-card-image is-c1` (CTA arc) | `home/candidate-01.webp` | 35591104, 33af5d22 (2) | none | **539 × 539** ✓ |
| `fk-hero-card-image is-c2` (CTA arc) | `home/candidate-02.webp` | e829026c, 8a367b7b (2) | none | **309 × 386** ✓ |
| `fk-hero-card-image is-c3` (CTA arc) | `home/candidate-03.webp` | ace0821d, 65d15a6b (2) | none | **309 × 402** ✓ |
| `fk-hero-card-image is-c4` (CTA arc) | `home/candidate-04.webp` | 313ddd6f, 9f443fed (2) | none | **372 × 372** ✓ |
| `fk-hero-card-image is-c5` (CTA arc) | `home/candidate-05.webp` | 269c5c8a, 1c3e702b (2) | none | **376 × 470** ✓ |
| `fk-hero-card-image is-c6` (CTA arc) | `home/candidate-06.webp` | e6507037, d8917f1c (2) | none | **376 × 470** ✓ |
| `fk-hero-card-image is-c7` (CTA arc) | `home/candidate-07.webp` | 131cd6e0, 7b5dc7b7 (2) | none | **309 × 412** ✓ |
| `fk-hero-card-image is-c8` (CTA arc) | `home/candidate-08.webp` | 6b925b53, f963f892 (2) | none | **540 × 540** ✓ |
| `fk-hero-card-image is-c9` (CTA arc) | `home/candidate-09.webp` | 230ec400, 2463b2a7 (2) | none | **427 × 569** ✓ |
| `fk-hero-card-image is-c10` (CTA arc) | `home/candidate-10.webp` | 89a328de, bbdeb586 (2) | none | **606 × 606** ✓ |
| `fk-steps-notice-image is-top` | `candidates/steps/send-yuki.webp` | 8a561aec (1) | 240x320 | **30 × 40** ✓ |
| `fk-steps-notice-image` | `candidates/steps/send-amara.webp` | a26c4fad (1) | 200x200 | **34 × 34** ✓ |
| `fk-steps-notice-image` | `candidates/steps/send-raj.webp` | c686f1a4 (1) | 200x200 | **37 × 37** ✓ |
| `fk-steps-notice-image is-face` | `candidates/steps/send-kwame.webp` | b261061f (1) | 240x300 | **74 × 93** ✓ |
| `fk-steps-call-photo` | `candidates/steps/call-main.webp` | 5b412553 (1) | 924x520 | **498 × 280** ✓ |
| `fk-steps-call-pip` | `candidates/steps/call-pip.webp` | 71f2bb6c (1) | 420x236 | **189 × 106** ✓ |
| `fk-steps-orbit-avatar-image` | `candidates/steps/orbit-avatar.webp` | c85a4845 (1) | none | **231 × 308** ✓ |
| `fk-steps-photo` | `candidates/steps/portrait.webp` | 6006654d (1) | 1400x1900 | **758 × 1029** ✓ |
| `fk-ring-image` (Stats Band, not rotated) | `home/cta-flower.webp` | d072fd94 (1) | 1672x941 | **814 × 458** ✓ |

### Facility partners (page `6abfecbb675c8491534c950c`)

| Element (class) | File | Element ids | Now on staging | Set to W × H |
| --- | --- | --- | --- | --- |
| `fk-network-portrait is-a1` | `network/portrait-01.webp` | 39b1f4c8 (1) | 300x375 | **158 × 198** ✓ |
| `fk-network-portrait is-a2` | `network/portrait-05.webp` | e2ed6ccf (1) | 300x375 | **157 × 196** ✓ |
| `fk-network-portrait is-a3` | `network/portrait-03.webp` | 97365668 (1) | 314x419 | **165 × 220** ✓ |
| `fk-network-portrait is-a4` | `network/portrait-07.webp` | 7f72da0f (1) | 412x230 | **216 × 121** ✓ |
| `fk-network-portrait is-a5` | `network/portrait-02.webp` | 6c372e24 (1) | 300x400 | **158 × 211** ✓ |
| `fk-network-portrait is-a6` | `network/portrait-06.webp` | 29e10b60 (1) | 268x349 | **141 × 184** ✓ |
| `fk-network-portrait is-a7` | `network/portrait-04.webp` | a141899a (1) | 300x400 | **158 × 211** ✓ |
| `fk-network-portrait is-a8` | `network/portrait-08.webp` | 641a621b (1) | 370x493 | **194 × 258** ✓ |
| `fk-retention-avatar-image is-charlette` | `how-it-works/retention-avatar-charlette.webp` | 50297f8e (1) | 110x138 | **55 × 69** ✓ |
| `fk-retention-avatar-image is-eizle` | `how-it-works/retention-avatar-eizle.webp` | b7e616df (1) | 102x136 | **51 × 68** ✓ |
| `fk-retention-map-image` | `how-it-works/retention-map.webp` | add15e83 (1) | 600x394 | **381 × 221** ✓ |
| `fk-retention-thumb-image` | `how-it-works/retention-facility.webp` | dfb29584 (1) | 146x97 | **73 × 49** ✓ |

### About (page `6abed61fbb91160db13da902`)

| Element (class) | File | Element ids | Now on staging | Set to W × H |
| --- | --- | --- | --- | --- |
| `fk-portrait-image is-crop` (title pill) | `about/strip-2.webp` | 85e2bc0d (1) | 568x568 | **92 × 92** ✓ |
| `fk-portrait-image` (title pill, strip 6) | `about/strip-6.webp` | 6786a4ef (1) | 522x696 | **73 × 97** ✓ |
| `fk-portrait-image` (title pill, strip 4) | `about/strip-4.webp` | 41ac59b9 (1) | 592x740 | **74 × 93** ✓ |
| `fk-photo-strip-image is-p1` | `about/strip-1.webp` | bad79c70 (1) | 484x605 | **234 × 293** ✓ |
| `fk-photo-strip-image is-p2` | `about/strip-2.webp` | 8c142f0a (1) | 568x568 | **275 × 275** ✓ |
| `fk-photo-strip-image is-p3` | `about/strip-3.webp` | ac32a408 (1) | 612x764 | **296 × 370** ✓ |
| `fk-photo-strip-image is-p4` | `about/strip-4.webp` | 72d3dba6 (1) | 592x740 | **287 × 359** ✓ |
| `fk-photo-strip-image is-p5` | `about/strip-5.webp` | 7f85ec12 (1) | 540x720 | **267 × 356** ✓ |
| `fk-photo-strip-image is-p6` | `about/strip-6.webp` | 39d3a9b1 (1) | 522x696 | **252 × 336** ✓ |
| `fk-photo-strip-image is-p7` | `about/strip-7.webp` | 1c7e1b45 (1) | 540x720 | **277 × 369** ✓ |
| `fk-team-image` Kenton | `about/team-kenton.webp` | d360b7e6 (1) | 778x778 | **711 × 711** ✓ |
| `fk-team-image` Anson | `about/team-anson.webp` | 5036956f (1) | 778x778 | **711 × 711** ✓ |
| `fk-team-image` Neil | `about/team-neil.webp` | 2e1738ec (1) | 778x778 | **711 × 888** ✓ |
| `fk-split-image` (Residency photo) | `home/two-ways-facility.webp` | b1909dde (1) | 1426x951 | **919 × 613** ✓ |
| `fk-logo-grid-image is-l2` Haystack | `about/investor-haystack.webp` | 31183544 (1) | 316x77 | **316 × 77** (unchanged) ✓ |
| `fk-logo-grid-image is-l3` Audacious | `about/investor-audacious.webp` | 540f74e3 (1) | 412x216 | **412 × 216** (unchanged) ✓ |

### Blog and Categories template (static hero art only)

| Element (class) | File | Element ids | Now on staging | Set to W × H |
| --- | --- | --- | --- | --- |
| `fk-blog-hero-art` (Blog) | `blog/hero-art.webp` | 38a01203 (1) | 1459x800 | **1459 × 800** (unchanged) ✓ |
| `fk-blog-hero-art` (Categories template `…91ea`) | `blog/hero-art.webp` | d3906d35 (1) | 1459x800 | **1459 × 800** (unchanged) ✓ |

### Components with one Image element for several files

| Element (class) | File | Element ids | Now on staging | Set to W × H |
| --- | --- | --- | --- | --- |
| `UI / Testimonial Card` `fk-testimonial-card-image` (one element for photos 1 to 3: W is the widest need, 625 from photo 3; H follows photos 1 and 2, the image fills an absolute box with object-fit cover, so the ratio only has to be close) | `testimonial-photo-1.webp` | …20b6 (1) | 1024x1333 | **625 × 814** ✓ |
| `UI / Quote Card` `fk-quote-card-photo` (104 × 104 files) | `quote-photo-1.webp` | …d199 (1) | 104x104 | **52 × 52** ✓ |

### Not in the tables (keep as they are)

- **Rotated rings** (`fk-ring-image is-rotated`, `cta-flower.webp`): Candidates `0715405b`, `2299bad2`, `b0370268`, Facility partners `51504405`, Stats Band's second ring: the displayed box (up to 2062 px wide) is larger than the 1672 px file, so the value is the file's own **1672 × 941** (already set).
- **SVG images** (icons, flags, rings, call controls, Nav and Footer logos): Webflow makes no `srcset` for SVG, so they keep the file's own size, as before. Candidates, Facility partners and About still have some icons without values (roadmap, Designer pass); fill them from the repo's `width` / `height`.
- **CMS-bound images** (Post Card, Featured post, Posts template hero and avatar): take the largest displayed size of their box (D-51 amendment, 2026-10-07): Post Card image 695 × 200 and avatar 24 × 24, Featured post image 711 × 432 and avatar 24 × 24, Posts hero image 552 × 260 and avatar 44 × 44. Set in the Designer 2026-10-07 (not published).

Totals: 134 Image elements in the tables (Hero 20, Logo Marquee 18, the others on pages), 127 need a different value than today; the rest are marked "unchanged".

## C. Order

1. Set the values above in the Designer (components first: Hero, Logo Marquee, Testimonial Card, Quote Card; then Home, Candidates, Facility partners, About, Blog and the Categories template).
2. Publish (through `/safe-publish`).
3. The orchestrator re-measures on staging: `sizes` and the chosen `srcset` file per image, the image KB per page against the 2026-10-06 numbers in `seo.md` S-10.
