# Alt text review (proposal, 2026-10-07)

Decision (user): define decorative or not by the actual asset, not by what the repo happens to say. Method: every image file was opened and judged with the text around it. **Informative** = a sighted user gets something from the image that the adjacent text does not say (a logo, a named photo that is the section's only content, embedded text). **Decorative** (alt empty, Webflow "Decorative") = purely visual, or the same information is already in adjacent text (name chips, titles), or a duplicate in a looping carousel/marquee/arc, or an icon in a labelled control, or art inside an `aria-hidden` mock-up. The asset library's AI descriptions were not trusted (several are wrong: "against a black background", "on a transparent background", "MAXIMONTI creative studio" earlier). CMS-bound images (Post Card, Featured post, Posts hero and avatars) are out of scope: their alt is bound to a field.

**Status: applied and published 2026-10-07** (Webflow: 39 elements set to Decorative and read back; repo: `TestimonialCard.tsx`, `QuoteCard.tsx`; staging `fint-fc2589.webflow.io` verified). The text below is the proposal as approved. "Current Webflow" is read through the MCP on 2026-10-07 (`query_elements` Image, `altText`). The query shows the text an image resolves to, so a from-asset image shows the AI description and a Decorative one shows nothing.

Totals: about 300 static Image elements reviewed (Home 35, Candidates 134, About 21, Facility partners 42, Hero 40, Logo Marquee 18, cards, Nav, Footer, icons). **18 informative, about 280 decorative.** Changes: **Webflow 39 elements** (all to Decorative), **repo 2 files**, both 2 of those. Everything else already matches.

## Proposed changes (first)

| # | Page / component | Class | File | What it shows | Proposal | Current Webflow | Current repo | Change | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Component Section / Hero (Home) | `fk-hero-card-image` is-c1..c10, both copies (20 elements) | `home/candidate-01..10.webp` | Cut-out stock portraits of ten nurses in scrubs | **Decorative** | From asset: AI text, 10 different strings, some wrong ("black background", "transparent background") | `alt=""` inside `aria-hidden` arc | **Webflow** | The ring is `aria-hidden` art; each card has the person's name chip next to it, and the second copy is a loop duplicate |
| 2 | Home Two Ways | `fk-two-ways-nurse-right`, `-left`, `-center` | `home/two-ways-nurse-right/left/center.webp` | Three anonymous nurse portraits on a mock-up | **Decorative** | From asset: AI text (3 descriptions) | `""` in `aria-hidden` art | **Webflow** | Illustration of the card whose title and body already say it |
| 3 | Home Two Ways | `fk-two-ways-facility-image` | `home/two-ways-facility.webp` | Bright care-home lounge with residents and a caregiver | **Decorative** | From asset: 90-word AI paragraph | `""` in `aria-hidden` art | **Webflow** | Illustration of the Facilities card (same file is informative on About, see below) |
| 4 | Home Pricing | `fk-pricing-avatar` | `home/pricing-avatar.webp` | Anonymous smiling nurse with glasses | **Decorative** | From asset: AI text | `""` | **Webflow** | The caption "This is you." carries the meaning |
| 5 | Home Pricing | `fk-icon is-lg` (Flint circle logo in the Flint bubble) | `home/Flint-logo-brand-circle.svg` | Flint logo mark | **Decorative** | From asset: "Flint logo brand circle" | `""` | **Webflow** | The bubble's text says "Flint" |
| 6 | Home Partners Map | `fk-partners-map-image` | `home/partners-map-bg.webp` | Faded care-home reception background under the headline | **Decorative** | From asset: 60-word AI paragraph | `""` | **Webflow** | Background behind an overlay, no information |
| 7 | Home How It Works | `fk-how-bg` cards 2, 4, 6 | `home/how-card-bg-2/4/6.webp` | Hospital hall, US map with route, blurred corridor | **Decorative** | From asset: AI text | `""` | **Webflow** | Card backgrounds under title and body |
| 8 | Home How It Works | `fk-how-art` cards 1, 2, 3, 5, 6 | `home/how-card-art-1/2/3/5/6.webp` | UI mock-ups: "Applications Submitted!", video call, interview card, nurse portrait, progress card | **Decorative** | From asset: AI text (5 descriptions) | `""` | **Webflow** | Each card's title and body already say what the mock-up illustrates |
| 9 | Home CTA | `fk-cta-photo` | `home/cta-photo.webp` | Nurse with an elderly man holding a cane | **Decorative** | From asset: AI text | `""` | **Webflow** | Mood image next to the CTA headline |
| 10 | Component Global / Nav | `fk-nav-logo-white` | `flint-logo-white.svg` | White Flint logo laid over the brand logo for the Dark nav | **Decorative** | From asset: "Flint logo white" (read together with "Flint" on the brand logo) | `""` | **Webflow** | Overlay duplicate of the logo inside the same link: screen readers would hear the link twice |
| 11 | Component UI / Testimonial Card | `fk-testimonial-card-image` | testimonial photos (prop Image) | Portrait of the person quoted | **Decorative** (unbind the alt from Name) | Bound to Name | `alt={name}` | **Both** | The name and role are printed in the card; the photo adds nothing a screen reader needs, and the alt duplicates the text |
| 12 | Component UI / Quote Card | `fk-quote-card-photo` | `quote-photo-1..3.webp` | 52 px avatar of the person quoted | **Decorative** (unbind the alt from Name) | Bound to Name | `alt={name}` | **Both** | Same as above: the name sits right beside it |

Webflow elements touched: 20 + 3 + 1 + 1 + 1 + 1 + 3 + 5 + 1 + 1 = 37 on pages and in `Section / Hero` and `Global / Nav`, plus the two prop-bound card images (12 affects every instance).

## Informative, no change (second)

| Page / component | Class | File | What it shows | Proposal | Current Webflow | Current repo | Change | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Component Logo Marquee (6 first-row logos) | `fk-logo-marquee-logo` | `home/logo-01..06.webp` | Facility logos | alt = facility name (Lincoln Health, Pleasant View Home, Miramont Behavioral Health, Gunnison Valley Health, CHRISTUS Health, Sandhills Care Center) | Same names | Same names | none | The name exists only in the logo art |
| Component Logo Marquee copies 2 and 3 (12) | same | same | Duplicate rows of a looping marquee | Decorative | Empty (Decorative) | `""` in `aria-hidden` rows | none | Loop duplicates |
| About Backed by the best (4) | `fk-logo-grid-image` | `about/investor-yc.svg`, `-haystack`, `-audacious`, `-rhino` | Investor logos | alt = Y Combinator, Haystack, Audacious, Rhino Ventures | Same | Same | none | Name only in the art |
| Component Global / Nav | `fk-nav-logo-brand` and the mobile menu logo | `flint-logo-brand.svg` | Flint logo, the link to Home | alt "Flint" | "Flint" | "Flint" | none | Only text of the home link |
| Component Global / Footer | footer logo | `flint-logo-white.svg` | Flint logo | alt "Flint" | "Flint" | "Flint" | none | Only the brand in the footer |
| Home Webinar | `fk-webinar-call` | `home/webinar-call.webp` | Neil Prigge smiling on a video call with a LIVE badge | alt "Neil Prigge hosting a live Q&A webinar on a video call" (55 chars) | Same | Same | none | Names the host; no host name in the text |
| Home Webinar | `fk-webinar-participants` | `home/webinar-participants.webp` | Pill with avatars and the words "234 participants" | alt "234 participants" | Same | Same | none | The words are only in the image |
| Candidates How It Works step 5 | `fk-steps-photo` | `candidates/steps/portrait.webp` | Fabiana, a nurse in scrubs, arms crossed in a hospital corridor | alt "Fabiana, a registered nurse, smiling with her arms crossed in a hospital corridor" (84 chars) | Same | Same | none | The one content photo of the step; the chip beside it names her |
| About Residency | `fk-split-image` | `home/two-ways-facility.webp` | Nurse and residents in a bright care-home lounge | alt "A nurse and residents in the bright lounge of a care home" (58 chars) | Same | Same | none | Only image of the section, outside `aria-hidden` (the same file is decorative on Home, where it sits in a hidden mock-up) |

## Decorative, no change (second)

| Page / component | Class | Files | What it shows | Proposal | Current Webflow | Current repo | Change | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Candidates hero ring (20 cards = 10 × 2) and CTA arc | `fk-orbit-image`, `fk-hero-card-image`, `fk-flag` | `home/candidate-*.webp`, `flags/*.svg` | Portraits and flags | Decorative | Decorative | `""` | none | `aria-hidden` ring, name chip beside each, loop copy |
| Candidates step 1 notices (4) and flags | `fk-steps-notice-image`, `fk-flag` | `candidates/steps/send-*.webp` | Faces on "Applications sent" notices | Decorative | Decorative | `""` | none | Notice text carries the name |
| Candidates steps 2, 3, 4 (call, controls, fees, orbit, rings) | `fk-steps-call-*`, `fk-steps-fees-icon`, `fk-steps-orbit-*`, `fk-ring-image` | `candidates/steps/*`, `how-flint-works/ic-*.svg`, `home/cta-flower.webp` | Mock-ups of a video call, a checklist and a progress orbit | Decorative | Decorative | `""` | none | `aria-hidden` art or icons next to text |
| Candidates FAQ | `fk-faq-icon-plus/minus` | `plus.svg`, `minus.svg` | Open/close glyphs | Decorative | Decorative | `""` | none | Inside the labelled question button |
| About hero | `fk-portrait-image`, `fk-photo-strip-image` | `about/strip-1..7.webp` | Seven nurse portraits, three inline in the title | Decorative | Decorative | `""` | none | Inline pills inside the h1 and an `aria-hidden` strip |
| About team | `fk-team-image` | `about/team-anson/kenton/neil.webp` | Black and white portraits of the founders | Decorative | Decorative | `""` | none | Name and role are the next lines; the link is `aria-hidden` |
| About modals | `fk-modal-close-icon` | `x-mark` | Close glyph | Decorative | Decorative | `""` | none | Labelled button |
| Facility partners | `fk-network-*`, `fk-savings-*`, `fk-retention-*`, `fk-ring-image`, `fk-icon is-md` | `facility/*`, `how-it-works/*`, `network/portrait-*.webp` | Illustrated panels (network of portraits, savings chart, retention cards) and check icons | Decorative | Decorative | `""` | none | Panels are `aria-hidden` mock-ups of the row's title and body |
| Home hero flags, Home Webinar background, Home CTA ring and room, Pricing and check icons, How It Works bg cards 1, 3, 5, Home modal close | `fk-flag`, `fk-webinar-bg`, `fk-cta-*`, `fk-icon`, `fk-modal-close-icon` | various | Flags, arcs, plain backgrounds, checkmarks | Decorative | Decorative | `""` | none | Visual only |
| Blog and Categories hero art | `fk-blog-hero-art` | `blog/hero-art.webp` | Abstract header art | Decorative | Decorative | `""` | none | Visual only |
| Component Testimonials arrows, Button icon, Input Field icon, Dropdown chevron, Pagination chevrons | `fk-carousel-arrow-icon`, `fk-button-icon`, `fk-input-field-icon`, `w-pagination-*-icon` | chevrons, icons | Arrow and field glyphs | Decorative | Decorative / no asset yet | `""` | none | Icons inside labelled controls. The Button and Input Field icon images have no asset in their definition (prop-bound, hidden), so their alt can only be set when an icon is bound |
| Nav menu and close icons | `fk-icon` | `menu`, `close` | Hamburger and X | Decorative | Decorative | `""` | none | Inside a labelled button |

## Decision 2026-10-07: card images are Decorative

The post title is printed beside every card image, so the banner's CMS alt duplicated it. `UI / Post Card` (`fk-post-card-image`) and `Global / Featured post` (`fk-featured-post-image`) main images are set to Decorative at element level (repo `alt=""`); CMS data is unchanged and the Posts template hero (`fk-article-image`) keeps its alt bound to the CMS field. Avatars keep their alt. Published and verified on staging the same day.

## Notes for the Designer pass

- Set the 37 elements with `set_settings` `altText` `static_text` `{ "value": "decorative" }` (stores what the Decorative choice stores). The Hero component's 20 are scoped to `71b39630-a971-6cb4-afd2-0ef5e3edd312`; the card photos (11, 12) first need the alt binding to Name cleared in the component definition.
- Decorative images with the asset's own alt left in the library are fine: an element set to Decorative ignores it.
