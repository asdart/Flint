# CMS collections

Blog content is managed in Webflow CMS. `src/content/*.json` holds seed data with exactly these
fields (JSON keys are the field slugs), used for the local preview and the first import. After the
import, **Webflow is the source of truth for content**. Don't edit the JSON to change live content.

Legacy source: `src/sections/blog/posts.ts` and `src/sections/blog/featuredArticle.ts`.

Seed files: `src/content/categories.json` (5), `authors.json` (3) and `posts.json` (3, the MVP
subset). Image fields are `{ "url", "alt" }`, and reference fields hold the referenced item's slug
(the import maps slugs to Webflow item ids, recorded in `webflow-ids.json`). The seed keeps the
key `published-on` until the field slug question above is settled.
`src/content/index.ts` loads them for the preview.

## Categories

| Field | Slug | Webflow type | Required | Notes |
| --- | --- | --- | --- | --- |
| Name | `name` | Plain text | ✓ | Careers, Immigration, Institutional, Licensing, Relocation |
| Slug | `slug` | Slug | ✓ | Kebab-case of the name |

## Authors

| Field | Slug | Webflow type | Required | Notes |
| --- | --- | --- | --- | --- |
| Name | `name` | Plain text | ✓ | Full name ("Jonathan Johnson") |
| Slug | `slug` | Slug | ✓ | |
| Short name | `short-name` | Plain text | ✓ | Shown on cards ("Jonathan") |
| Role | `role` | Plain text | | "Brand Manager" |
| Avatar | `avatar` | Image | | |

## Posts

| Field | Slug | Webflow type | Required | Legacy field |
| --- | --- | --- | --- | --- |
| Title | `name` | Plain text | ✓ | `title` |
| Slug | `slug` | Slug | ✓ | `slug` |
| Published on | `published-on-2` ⚠ | Date/Time | ✓ | `date` (convert "July 17, 2026" → ISO date) |
| Category | `category` | Reference → Categories | ✓ | `category` |
| Author | `author` | Reference → Authors | ✓ | `author`, `authorFullName`, `authorRole` |
| Excerpt | `excerpt` | Plain text (max 200) | ✓ | `excerpt` |
| Main image | `main-image` | Image | ✓ | `image` (alt text required) |
| Read time | `read-time` | Plain text | ✓ | `readTime` ("6 min read") |
| Quick answer | `quick-answer` | Plain text | | `quick-answer` block |
| Body | `body` | Rich text | ✓ | `section`, `paragraphs`, `figure`, `quote` blocks |
| Featured | `featured` | Switch | | `FEATURED_POST` (only one post at a time) |

⚠ `published-on` is reserved by Webflow (the system publish date), so the field got the slug
`published-on-2`. Proposed fix (needs approval, it deletes a field): recreate it as "Publish date"
(`publish-date`) and update the seed JSON and the Post Grid sort.

Other MVP findings:

- Image fields accept `{ fileId, url, alt }`. Webflow copies the file into the CMS's own asset
  store, so the item's image URL differs from the uploaded asset's.
- The Designer canvas doesn't list draft items; a Collection List with only drafts shows "No items
  found". MVP items were set to `isDraft: false` (staged, not published).
- Collection Lists can be bound headlessly: `source` = `{ "collectionId": … }`, `sort` =
  `[{ "fieldSlug": …, "direction": "descending" }]`, `limit`. Fields bind with
  `{ source_type: "cms", collection_id, field_id }`; referenced fields use `refFieldId:::fieldId`.

Legacy-to-CMS decisions:

- `titleLines` (forced line breaks in the featured title) is dropped. Control wrapping with the
  heading's max width instead.
- Article `section` blocks become H2s in the rich text, with their ids as anchor targets. Lists
  become bulleted lists, `figure` becomes a rich text image with caption, and `quote` becomes a blockquote.
- The inline `newsletter` block is not content. The template places `UI / Newsletter Form` after the body.
- The table of contents is generated from the body's H2s. That needs a script, so it is exception
  `x-article-toc` in `interactions.md`. It's an open decision (roadmap P-02); until then the
  template has no TOC.
- **Do not import** the bullet list in the featured article's "Why nurses ask if Flint is legit"
  section. It is placeholder text about Flint, Michigan (population, attractions, water crisis).
- Posts other than the featured one only have an excerpt today (`fallbackArticle` in
  `BlogPostPage.tsx`). Import them as drafts until real bodies exist.

## Collection lists

| Where | Collection | Filter | Sort | Limit | Pagination |
| --- | --- | --- | --- | --- | --- |
| Home — `Section / Post Grid` (Home) | Posts | — | Published on ↓ | 3 | — |
| Blog post — `Section / Post Grid` (Related) | Posts | Category = current post's category, exclude current (roadmap D-02) | Published on ↓ | 3 | — |
| Blog — `Section / Post Index` | Posts | — | Published on ↓ | 6 | Native, 6 per page |
| Blog — featured post | Posts | Featured = on | — | 1 | — |
| Blog category template — `Section / Post Index` | Posts | Category = current category | Published on ↓ | 6 | Native |
| Category links above the Post Index | Categories | — | Name ↑ | all | — |

Category filtering uses Category template pages and plain links, which replaces the legacy
client-side `Select` + filter in `AllPosts.tsx`. No script needed.

## Import procedure

1. Create the collections in this order: Categories → Authors → Posts. Posts references the other two.
   Use `/cms-collection-setup` or `data_cms_tool` (see `mcp-playbook.md`).
2. Upload images to Assets and keep the asset ids.
3. Import items with `/bulk-cms-update`, starting as drafts. Review, then publish items explicitly.
4. Record the collection ids in `sync-log.md`.
