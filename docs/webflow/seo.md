# SEO, performance and accessibility requirements

Launch requirements for the new website (added 2026-09-27). Every page built in the repo and in
Webflow must meet them; the checks run per page (`AGENTS.md` §7, Definition of done) and site-wide
before launch (roadmap phase 9). A requirement is ticked only when it's verified on a published
staging page, not just configured.

**Status legend:** ☐ to do · ◐ partly met · ☑ met and verified.
**"To verify"** marks a Webflow behavior we believe is native but haven't checked on this project
yet. Check it on staging the first time, then record the finding here and in the
[`flint-webflow-sync`](../../.agents/skills/flint-webflow-sync/SKILL.md) skill (rule 13).

## Page structure

| ID | Requirement | In the repo | In Webflow | Status |
| --- | --- | --- | --- | --- |
| S-01 | One H1 per page. Section titles are H2, sub-items H3. Dates, authors, quotes, eyebrows, stat values and card meta are **not** headings | The hero title is the only `h1`; `fk-section-header` titles are `h2`; card titles are `h3`. Headings are chosen for the outline, never for size (size comes from `fk-heading-*`) | Heading level per element (`set_heading_level`). CMS rich text bodies start at H2 (the template's Article Hero holds the H1) | ◐ Home meets it; other pages to build |
| S-02 | Every page has an editable title, meta description, OG image, and Twitter card fields | Each page's values live in `components.md` → Pages (title, description, OG image) | Page settings → SEO and Open Graph (`data_pages_tool` → `update_page_settings`: `seo`, `openGraph`). CMS templates bind them to fields (see `cms.md` → Posts). Webflow has no separate Twitter fields: the Twitter card comes from the Open Graph values, which is accepted (roadmap D-13; check the `twitter:*` tags on staging) | ☐ |
| S-03 | Every page has a self-referencing canonical tag | — | Site settings → SEO → Global canonical tag URL (the production domain). Webflow then writes a self-referencing canonical on every page (to verify). Needs the custom domain (P-06). Not settable through the MCP | ☐ |
| S-04 | Each page can be set to noindex, and noindex pages are left out of the sitemap | — | Page settings → Sitemap indexing off: adds `noindex` and removes the page from the auto sitemap (to verify). Not in the MCP's page settings: set it in the Designer. Drafts and utility pages (404, style guide) stay out | ☐ |
| S-05 | Clean, readable URLs | Routes in `src/App.tsx` use the final slugs | Lowercase kebab-case slugs, no dates or ids; CMS: `/blog/{slug}`, categories `/blog/category/{slug}` (P-02 area). Rename the auto slugs of CMS template pages (`detail_blog` → `blog`). Set 301s for every legacy URL that changes | ☐ |

## Schema (JSON-LD)

The schema values (organization name, logo, `sameAs` profiles, site URL) are content: the
profile URLs come with P-08. Every block is validated with Google's Rich Results Test on staging.

| ID | Requirement | How | Status |
| --- | --- | --- | --- |
| S-06 | `Organization` and `WebSite` on every page, with `sameAs` links to the social profiles | Site-wide head code, exception `x-schema-site` (`interactions.md`): one static JSON-LD block | ☐ |
| S-07 | `BlogPosting` on blog posts | Post template head code with CMS fields inserted (headline, image, dates, author, publisher), exception `x-schema-post` | ☐ |
| S-08 | `FAQPage` wherever there's an FAQ block | Native per page: `update_page_settings` → `jsonLdSchema`, generated from the same questions and answers the FAQ block shows. When the FAQ copy changes, the schema is updated in the same sync | ☐ |
| S-09 | `BreadcrumbList` on the blog | Blog index: native `jsonLdSchema`. Post template: inside `x-schema-post` (Home › Blog › Category › Post) | ☐ |

## Speed

| ID | Requirement | In the repo | In Webflow | Status |
| --- | --- | --- | --- | --- |
| S-10 | Images are resized, served as WebP, and have width and height set | Source images in `public/assets/` are exported at 2× their largest rendered size, as WebP, before upload. Every `<img>` has `width` and `height` | Upload the WebP files; Webflow adds responsive `srcset` sizes for uploaded assets (to verify). Image settings keep width and height. CMS images: upload WebP in the item | ◐ Home `<img>` sizes set; source files are still PNG/JPG |
| S-11 | Images below the first screen load lazily | `loading="lazy"` on every image below the fold; above-the-fold images (hero) `loading="eager"` | Image settings → Load: Lazy (Webflow's default) / Eager for the hero (to verify the MCP setting) | ◐ Post card only |
| S-12 | Fonts are self-hosted and limited to the weights used, with nothing in the head that holds up loading | `@fontsource` SN Pro 400/500 and STIX Two Text 400 only (`src/main.tsx`) | Fonts uploaded as custom fonts (self-hosted by Webflow; created in the MVP). Never add Google Fonts in the Designer (it loads WebFont.js in the head). Every head exception must be small and non-blocking (`async`/`defer`, inline CSS under 1 KB) | ◐ weights OK; head check pending |
| S-13 | Tracking scripts (GTM, Meta, TikTok, Google Ads) load after the page does | — | Exception `x-deferred-tracking`: one loader that injects GTM after `load`; Meta, TikTok and Google Ads run as tags inside GTM, never as separate head scripts | ☐ |
| S-14 | Video and webinar embeds load on click, behind a thumbnail | A thumbnail image + a labelled play button | Native first: a Lightbox (video) with the thumbnail loads the player only when opened (to verify). Inline click-to-play would be exception `x-video-facade` | ☐ |
| S-15 | PageSpeed Insights mobile score of 90+ on the homepage, a role page and a blog post, before launch | — | Run on the published staging URLs; record the scores in `sync-log.md`. "Role page" is open (P-12) | ☐ |

## Accessibility

These add to `/accessibility-audit` and the focus-visible rule in `AGENTS.md`.

| ID | Requirement | Current gaps | Status |
| --- | --- | --- | --- |
| S-16 | Images carry alt text: logos get the facility name; testimonial photos get the person's name; purely decorative images (arc cards, orbs, masks) have empty alt inside `aria-hidden` art | Logo Marquee logos have `alt=""`: give the first row the facility names (the duplicate rows stay `aria-hidden`). Testimonial photos already bind alt to Name. CMS images: alt required (`cms.md`) | ◐ |
| S-17 | Icon-only buttons (menu, close, slider arrows, pagination dots) have labels | Nav toggle, menu close and pagination dots have `aria-label`s. Any new arrow button needs one | ◐ |
| S-18 | Tap targets are at least 24 × 24 px | Pagination dots are 7 px wide (hit area 7 × 23): give `fk-pagination-dot` a 24 px minimum hit area (padding) without changing the visible bar | ◐ |

## Files

| ID | Requirement | In Webflow | Status |
| --- | --- | --- | --- |
| S-19 | `robots.txt` with a link to the sitemap, and no AI crawlers blocked | Site settings → SEO → robots.txt: `User-agent: *`, `Allow: /`, `Sitemap: https://<domain>/sitemap.xml`; no `Disallow` for GPTBot, ClaudeBot, PerplexityBot, Google-Extended etc. The staging subdomain stays noindexed by Webflow | ☐ |
| S-20 | An auto-generated `sitemap.xml` | Site settings → SEO → Auto-generate sitemap (respects S-04) | ☐ |
| S-21 | `llms.txt` | Decided (D-14): native upload in Site settings → SEO → LLMs.txt (UTF-8, under 100 KB), served at `/llms.txt` on the custom domain only, never indexed. Not in the MCP: the source is `public/llms.txt` in the repo, uploaded by hand after each change. Checked after the custom-domain publish, since staging doesn't serve it | ☐ |
| S-22 | A custom 404 page that returns a real 404 status | Webflow's 404 utility page, designed with the contract sections; check the status code with `curl -I` on staging | ☐ |

## Open questions

Tracked in `roadmap.md`:

- **P-12:** What is a "role page"? The roadmap has no role pages yet (`/mvp-home` lists a Role Grid).

Decided: Twitter card values come from Open Graph (D-13, was P-11); `llms.txt` through Webflow's native upload (D-14, was P-13).
