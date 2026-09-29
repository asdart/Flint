# CMS collections

Blog content is managed in Webflow CMS. `src/content/*.json` holds seed data with exactly these
fields (JSON keys are the field slugs), used for the local preview and the first import. After the
import, **Webflow is the source of truth for content**. Don't edit the JSON to change live content.

Source: the client's current site, exported on 2026-09-28
([`archive/blog-export/`](archive/blog-export/README.md)); see
[Import from the current site](#import-from-the-current-site). The legacy mock content
(`src/sections/blog/posts.ts`, `featuredArticle.ts`) is superseded and isn't imported.

Seed files: `src/content/categories.json` (5), `authors.json` (1) and `posts.json` (34 posts,
every field except `body`). Bodies are in `post-bodies.json` (slug → rich text HTML), kept apart
so the cards don't bundle 470 KB of HTML; the import merges them. Image fields are
`{ "url", "alt", "width", "height" }` (width and height are the file's size, for the preview's
`<img>` attributes; Webflow reads them from the file). Reference fields hold the referenced item's
slug (the import maps slugs to Webflow item ids, recorded in `webflow-ids.json`). Each post also
carries `isDraft`, Webflow's item flag (not a field). `src/content/index.ts` loads the seed for the
preview and skips drafts.

## Categories

| Field | Slug | Webflow type | Required | Notes |
| --- | --- | --- | --- | --- |
| Name | `name` | Plain text | ✓ | Careers, Immigration, Institutional, Licensing, Relocation |
| Slug | `slug` | Slug | ✓ | Kebab-case of the name |

The current site has no categories; each post was assigned one by its primary topic
(2026-09-28): Immigration (green cards, EB-3, visa bulletin, USCIS, status) 20, Careers (jobs,
direct hire, agencies vs staffing) 8, Institutional (Flint itself, the employer side) 4,
Licensing (NCLEX, boards) 1, Relocation 1.

## Authors

| Field | Slug | Webflow type | Required | Notes |
| --- | --- | --- | --- | --- |
| Name | `name` | Plain text | ✓ | Full name ("Jonathan Johnson") |
| Slug | `slug` | Slug | ✓ | |
| Short name | `short-name` | Plain text | ✓ | Shown on cards ("Jonathan") |
| Role | `role` | Plain text | | "Brand Manager" |
| Avatar | `avatar` | Image | | |

Every post is by **Flint Editorial Team** (`flint-editorial-team`, avatar: the Flint logo mark)
for now (decision 2026-09-28). The current site's Author is plain text, and all 34 real posts use
that name. The collection stays so real authors can be added later.

## Posts

| Field | Slug | Webflow type | Required | Current site column |
| --- | --- | --- | --- | --- |
| Title | `name` | Plain text | ✓ | Name |
| Slug | `slug` | Slug | ✓ | Slug (unchanged, so URLs stay `/blog/{slug}`) |
| Publish date | `publish-date` | Date/Time | ✓ | Created On (date only). Webflow's own created and published dates are system fields an import can't set, and the export's Published On is a bulk republish (28 posts on 2026-07-17) |
| Category | `category` | Reference → Categories | ✓ | — (assigned, see Categories) |
| Author | `author` | Reference → Authors | ✓ | Author (plain text) → `flint-editorial-team` |
| Excerpt | `excerpt` | Plain text (max 160) | ✓ | Blog Summary, rewritten to 120–155 characters. Doubles as the meta description (`seo.md` S-02), so it leads with the post's topic and only states what the post says |
| Main image | `main-image` | Image | ✓ | Main Image (= Thumbnail image on every post; the thumbnail isn't imported). WebP, 1400px wide (2× the widest card, and the 1200px OG image), alt text required |
| Read time | `read-time` | Number (integer, minutes) | ✓ | Reading Time where filled (16 posts); the rest computed at 225 words a minute. Cards and the hero show "{n} min read" (static text after the bound number) |
| Quick answer | `quick-answer` | Plain text | | The body's "💡 Quick Answer" block (27 posts) |
| Body | `body` | Rich text | ✓ | Blog Body, cleaned (see below) |
| Featured | `featured` | Switch | | Featured? (one post: `how-flint-works`; the others ticked were placeholders) |

Not carried over: Accent Color (8 posts, no place in the design), Thumbnail image (identical to
Main Image).

`published-on` is reserved by Webflow (the system publish date), so don't name a field
"Published on": it gets the slug `published-on-2`. Field slugs can't be changed after creation, so
a field with the wrong slug is replaced: create the new one, copy the values, repoint sorts and
bindings, delete the old one (skill recipe "Replace a CMS field"). Posts uses `publish-date`.

Other findings from the test stage:

- Image fields accept `{ fileId, url, alt }`. Webflow copies the file into the CMS's own asset
  store, so the item's image URL differs from the uploaded asset's.
- The Designer canvas doesn't list draft items; a Collection List with only drafts shows "No items
  found". Set an item to `isDraft: false` (staged, not published) to see it there.
- Collection Lists can be bound headlessly: `source` = `{ "collectionId": … }`, `sort` =
  `[{ "fieldSlug": …, "direction": "descending" }]`, `limit`. Fields bind with
  `{ source_type: "cms", collection_id, field_id }`; referenced fields use `refFieldId:::fieldId`.

Body decisions:

- Bodies start at H2 (the template's Article Hero holds the H1). Lists stay lists; images become
  rich text images with a caption.
- `titleLines` (forced line breaks in the legacy featured title) is dropped. Control wrapping
  with the heading's max width instead.
- The inline newsletter and CTA blocks are not content. The template places `UI / Newsletter Form`
  and a CTA after the body.
- The table of contents is generated from the body's H2s. That needs a script, so it is exception
  `x-article-toc` in `interactions.md`. It's an open decision (roadmap P-02); until then the
  template has no TOC. FAQ questions are H3s, so they stay out of an H2-based TOC.

## Template SEO and alt text

Template page settings bind to fields (`seo.md` S-02): Posts → SEO title `name`, meta description
`excerpt`, OG image `main-image`; Authors and Categories templates are noindex (S-04) unless they
get their own copy. Image alt text is required on every CMS image: `main-image` describes the
image, `avatar` is the author's name (S-16). The post template also carries `x-schema-post`
(`BlogPosting` + `BreadcrumbList`, `interactions.md`).

## Collection lists

| Where | Collection | Filter | Sort | Limit | Pagination |
| --- | --- | --- | --- | --- | --- |
| Home — `Section / Post Grid` (Home) | Posts | — | Publish date ↓ | 3 | — |
| Blog post — `Section / Post Grid` (Related) | Posts | Category = current post's category, exclude current (roadmap D-02) | Publish date ↓ | 3 | — |
| Blog — `Section / Post Index` | Posts | — | Publish date ↓ | 6 | Native, 6 per page |
| Blog — featured post | Posts | Featured = on | — | 1 | — |
| Blog category template — `Section / Post Index` | Posts | Category = current category | Publish date ↓ | 6 | Native |
| Category links above the Post Index | Categories | — | Name ↑ | all | — |

Category filtering uses Category template pages and plain links, which replaces the legacy
client-side `Select` + filter in `AllPosts.tsx`. No script needed.

## Import from the current site

Done in the repo on 2026-09-28; nothing is in Webflow yet.

- **Posts:** 40 in the export. 6 placeholders ("This is a test blog" and 5 template posts with
  invented authors) were dropped; 34 real posts are in the seed. 6 are drafts: the 4 drafts on the
  current site, plus 2 published posts with no image
  (`can-i-change-job-during-the-eb-3-green-card-process`,
  `what-happens-to-your-eb-3-green-card-if-you-get-laid-off`), because Main image is required.
  They stay drafts until they get one.
- **Bodies:** cleaned to Webflow rich text: only h2–h4, p, lists, blockquote, links, bold,
  italic and figures; no classes or inline styles; H1s demoted; empty spacer paragraphs, stray
  code fences and zero-width characters removed. Custom code blocks were moved to a field,
  converted, or removed; [`blog-custom-code.md`](blog-custom-code.md) lists every type and which
  posts used it.
- **Images:** 32 main images downloaded, converted to WebP (`public/assets/blog/posts/`,
  1.35 MB total, from 4.1 MB of PNG) and given alt text. They are text banners at about 2.1:1, and
  the card crops them (1.4:1 on desktop), which cuts off the headline: see roadmap P-13.
- **Format:** seed JSON imported through the MCP (`create_collection_items`), not Webflow's CSV
  import. The CSV import needs publicly hosted image URLs and can't set image alt text, and the
  JSON is also the preview's data. Upload the WebP files first (`scripts/webflow-upload.mjs`),
  then create items with `main-image: { fileId, url, alt }`.

## Import procedure

1. Create the collections in this order: Categories → Authors → Posts. Posts references the other two.
   Use `/cms-collection-setup` or `data_cms_tool` (see `mcp-playbook.md`).
2. Upload images to Assets and keep the asset ids.
3. Import items with `/bulk-cms-update`, starting as drafts. Review, then publish items explicitly.
4. Record the collection ids in `webflow-ids.json` and log the step in `sync-log.md`.
