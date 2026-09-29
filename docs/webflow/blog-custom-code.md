# Blog custom code inventory

The posts on the client's current site (export of 2026-09-28,
[`archive/blog-export/`](archive/blog-export/README.md)) carry custom code blocks: HTML embeds in
the rich text with inline styles and their own `<style>` rules. For the import, bodies were
cleaned to plain rich text (decision 2026-09-28, `cms.md` → Import from the current site). This
file records every block type, what was done with it, and which posts used it, so each one can be
rebuilt as a registered component or exception (`AGENTS.md` rule 8) if it's wanted back.

One full original of each type, with its `<style>`, is in [`blog-embeds/`](blog-embeds/). The
original bodies are in the archived CSV.

## Block types

| Type | What it is | Done in the import | Posts | Rebuild as |
| --- | --- | --- | --- | --- |
| `quick-answer` | "💡 Quick Answer" callout at the top of the post | Text moved to the Posts `quick-answer` field | 27 | Post template: styled block bound to `quick-answer`, hidden when empty |
| `faq` | "Frequently Asked Questions" block: eyebrow, subtitle, question/answer list | Converted in place to rich text: H2 "Frequently Asked Questions", H3 per question, answers as paragraphs. The subtitle was dropped | 29 | `FAQPage` schema per post (`seo.md` S-08) needs the pairs outside the rich text: see [`blog-embeds/faq-pairs.json`](blog-embeds/faq-pairs.json) (232 pairs, 28 posts). Open decision |
| `apply-button` | Lone "Apply Now" button (`.flint-apply-btn`) | Removed | 7 | Post template CTA after the body |
| `apply-link` | Heading or paragraph holding only an "👉 Apply Now" link | Removed | 2 | Same |
| `cta-promo-card` | Gradient card: badge pill, heading, copy, button, note | Removed | 9 | Same |
| `cta-pill-panel` | Light panel: eyebrow, heading, copy, info pills, button, eligibility disclaimer | Removed | 13 | Same |
| `cta-banner` | Text-only CTA banner: heading, copy, button | Removed | 2 | Same |
| `cta-image-card` | CTA card with photo, eyebrow, heading, copy, optional checklist, button (5 style variants) | Removed | 8 | Same |
| `job-listing` | Grid of role cards (RN, CNA, LPN, MLS…) with apply buttons | Removed | 5 | A roles section, if wanted (compare `Section / Role Grid`) |
| `timeline-section` | "EB-3 nurse timeline": 6 step cards, best-fit list, note, CTA | Content converted (H3 per step); eyebrow, proof pills, photo card and CTA dropped | 1 | — |
| `role-timeline-fit` | Per-role timeline cards with a CTA strip | Content converted; CTA dropped | 1 | — |
| `sponsorship-card` | `.flint-sponsorship-card`: 3 feature cards, button, disclaimer | Content converted; eyebrow and button dropped | 1 | — |

Every embed was classified; none were left unknown. No kept body contains an image: all 11
source images (Pexels hotlinks) were inside removed CTA or job cards or the timeline's dropped photo card.

## Posts using each type

Counts are occurrences per post.

| Post | `quick-answer` | `faq` | `apply-button` | `apply-link` | `cta-promo-card` | `cta-pill-panel` | `cta-banner` | `cta-image-card` | `job-listing` | `timeline-section` | `role-timeline-fit` | `sponsorship-card` |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `can-healthcare-workers-on-tps-daca-or-asylum-get-eb-3-green-card-sponsorship` | 1 | 1 |  |  | 1 |  |  | 1 |  |  |  |  |
| `complete-guide-to-nurse-green-card-sponsorship-via-eb-3-visa-in-2026` | 1 | 1 |  |  |  |  | 1 | 1 |  |  |  |  |
| `direct-hire-nursing-jobs-in-the-usa-for-foreign-nurses-already-in-the-u-s` | 1 | 1 |  |  |  |  |  |  | 1 |  |  |  |
| `do-you-qualify-for-nurse-green-card-sponsorship-in-2026-quick-eligibility-guide` | 1 | 1 | 1 |  | 1 |  |  |  |  |  |  |  |
| `eb-3-visa-for-nurses-timeline-2026-from-application-to-green-card` | 1 | 1 |  |  |  |  |  |  |  | 1 | 1 |  |
| `why-eb-3-is-one-of-the-best-green-card-pathways-for-nurses` | 1 | 1 | 2 |  | 1 |  |  |  |  |  |  |  |
| `nurse-green-card-sponsorship-explained-flints-free-program-3k-relocation-help` | 1 | 1 |  |  | 1 |  |  |  |  |  |  |  |
| `green-card-sponsorship-for-healthcare-workers` |  |  |  | 1 |  |  |  |  |  |  |  |  |
| `green-card-for-nurses-step-by-step-process-in-2026-what-it-actually-looks-like` | 1 | 1 | 1 |  | 1 |  |  |  |  |  |  |  |
| `hospitals-that-sponsor-green-card-for-nurses-in-2026` |  | 1 |  |  |  |  |  | 1 | 1 |  |  |  |
| `how-flint-works` |  |  |  |  |  |  | 1 | 1 |  |  |  |  |
| `how-green-card-sponsorship-for-nurses-actually-works` | 1 | 1 | 1 |  | 1 |  |  |  |  |  |  |  |
| `how-to-apply-for-nurse-green-card-sponsorship-today-step-by-step-eligibility-check` | 1 | 1 |  |  |  |  |  | 1 | 1 |  |  |  |
| `nurse-agencies-vs-staffing-companies` | 1 |  | 1 |  |  |  |  |  |  |  |  | 1 |
| `nurse-green-card-sponsorship-vs-h-1b-eb-2-and-staffing-agencies-whats-the-best-option-for-you` |  |  | 1 |  | 1 |  |  |  |  |  |  |  |
| `nurse-green-card-do-you-qualify-if-youre-already-working-in-the-us` | 1 | 1 | 2 |  | 1 |  |  |  |  |  |  |  |
| `nursing-agencies-that-offer-sponsorship-in-the-usa-how-they-work` | 1 | 1 |  |  |  | 1 |  |  |  |  |  |  |
| `relocation-for-nurse-green-card-sponsorship-3-000-support-what-to-expect` | 1 | 1 |  |  | 1 |  |  |  |  |  |  |  |
| `us-nursing-jobs-for-foreign-nurses-direct-hire-opportunities-with-flint` | 1 | 1 |  |  |  |  |  |  | 1 |  |  |  |
| `eb3-processing-times-for-healthcare-workers` |  |  |  | 1 |  |  |  |  |  |  |  |  |
| `what-is-the-eb-3-visa-for-nurses-simple-breakdown-success-rate` | 1 | 1 |  |  |  |  |  |  |  |  |  |  |
| `rn-and-cna-job-placement-agencies-in-the-usa` | 1 | 1 |  |  |  | 1 |  |  |  |  |  |  |
| `nursing-agency-for-eb-3-visa-what-nurses-should-know-before-applying` | 1 | 1 |  |  |  | 1 |  |  |  |  |  |  |
| `eb-3-visa-for-nurses-from-the-philippines` | 1 | 1 |  |  |  | 1 |  |  |  |  |  |  |
| `eb-3-visa-for-nurses-from-india` | 1 | 1 |  |  |  | 1 |  |  |  |  |  |  |
| `can-i-change-job-during-the-eb-3-green-card-process` | 1 | 1 |  |  |  | 1 |  |  |  |  |  |  |
| `what-happens-to-your-eb-3-green-card-if-you-get-laid-off` | 1 | 1 |  |  |  | 1 |  |  |  |  |  |  |
| `nclex-for-foreign-educated-nurses-what-you-need-to-know` |  | 2 |  |  |  | 1 |  |  |  |  |  |  |
| `eb-3-visa-bulletin-september-2026-update` | 1 | 1 |  |  |  | 1 |  |  |  |  |  |  |
| `how-hospitals-sponsor-nurses-for-green-cards` | 1 | 1 |  |  |  | 2 |  |  |  |  |  |  |
| `is-flint-legit-what-nurses-should-know` | 1 | 1 |  |  |  | 1 |  |  |  |  |  |  |
| `is-eb-3-the-best-green-card-path-for-healthcare-workers-in-2026-a-guide-for-cnas-lpns-and-rns` | 1 | 1 |  |  |  | 3 |  | 2 |  |  |  |  |
| `how-to-get-green-card-sponsorship-in-2026` | 1 | 1 |  |  |  | 1 |  | 1 |  |  |  |  |
| `green-card-sponsorship-for-nurses` |  | 1 |  |  |  |  |  | 1 | 1 |  |  |  |
| **Posts** | 27 | 29 | 7 | 2 | 9 | 13 | 2 | 8 | 5 | 1 | 1 | 1 |

## Content issues found in the source

Fix these on the new site or with the client; they were not changed in the import:

- `nclex-for-foreign-educated-nurses-what-you-need-to-know` carries the "Layoffs during EB-3" FAQ
  (pasted twice, one copy dropped) instead of an NCLEX FAQ, and has no quick answer. Its FAQ is
  left out of `faq-pairs.json`.
- `eb-3-visa-bulletin-september-2026-update`: the FAQ subtitle said "June 2026"; check its answers
  for stale dates.
- `how-to-apply-for-nurse-green-card-sponsorship-today-step-by-step-eligibility-check` has a
  "Quick Answer: …" heading in the body as well as the moved quick answer.
- Sentence-like headings that were probably meant as bold text: `how-flint-works` ("Flint was
  built to change that reality.", its first H2), `is-flint-legit-what-nurses-should-know`, and the
  timeline post.
- `nurse-agencies-vs-staffing-companies`: missing space in "company.The".
- 4 posts keep an inline apply link in body text; in `how-flint-works` its text is the bare URL.

## Link changes made in the import

- 43 links to `withflint.com/blog/{slug}` became relative `/blog/{slug}` (same URL scheme on the
  new site). Their internal `utm_*` tags were kept.
- Two links pointed to slugs that no longer exist and were repointed:
  `…-flints-free-program-2k-relocation-help` → `…-3k-relocation-help` (the renamed post), and
  `eb-3-visa-for-nurses-high-success-rate-why-it-beats-other-options` →
  `why-eb-3-is-one-of-the-best-green-card-pathways-for-nurses` (judgment call; the alternative is
  `what-is-the-eb-3-visa-for-nurses-simple-breakdown-success-rate`).
- Removed: a session-specific `_gl` Google Analytics parameter (1 link) and
  `utm_source=chatgpt.com` (5 links, copied from ChatGPT answers).
