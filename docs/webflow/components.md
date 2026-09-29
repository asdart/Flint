# Components, sections and pages

Every reusable piece is a Webflow Component in one of three groups: `Global`, `UI` or `Section`.
The React file name equals the component name without spaces.

**Status values:** `legacy` = exists only in pre-contract code · `migrated` = React follows the
contract · `synced` = also built in Webflow (logged in `sync-log.md`).

## Props convention

- Webflow prop names are Title Case ("Eyebrow Text"); React props are camelCase (`eyebrowText`).
- Prop types: Text, Rich Text, Image, Link, Visibility (boolean), Variant.
- Variants use the same names in React (`variant="dark"`) and Webflow (variant "Dark").
- Content that belongs to the CMS is never a component prop. Bind it inside a Collection List instead.
- A variant is the root combo class in React (`fk-button is-secondary`). In Webflow it's a
  component variant whose styles equal that combo. When a variant also changes a child (for example
  hiding the Button icon), note it in the table below.
- `migrated` with a partial variant list means only those variants exist so far.

## Global

| Component | React target | Legacy source | Props | Variants | Status |
| --- | --- | --- | --- | --- | --- |
| `Global / Nav` | `components/global/Nav.tsx` | `components/SiteNav.tsx`, `nav.ts` (rendered inside 6 heroes) | — | Light (default); Dark to do | synced (Light). **Repo ahead of Webflow (2026-09-26):** mobile menu is now a full-width white frame around an inner panel, with a full-width Secondary Button; bar spacing changed (`classes.md` → `fk-nav`). Keeps its own component classes on every element (`css-system.md` → Component classes, 2026-09-28) |
| `Global / Footer` | `components/global/Footer.tsx` | `sections/Footer.tsx` | CTA Title (multiline), CTA Body — props not yet created in Webflow. Repo defaults (2026-09-26): title "Find the right green card / sponsored role for you.", body "It’s free to apply and takes under a minute." (Webflow still has the old copy "It’s time to find your green card sponsor." / "Apply now, it is free.") | — | synced; blur reveal on the CTA and per-link staggered reveal synced 2026-09-25. **Repo ahead of Webflow:** new default copy and mobile styles (`classes.md` → `fk-footer`); panel color, copy colors, the container's column layout and the CTA text wrapper are utilities (`fk-footer-panel` and `-cta-text` retired, 2026-09-28). Keeps its own component classes on every other element |

Nav links (static, in this order): Home `/`, Candidates `/candidates`, Facility partners
`/facility-partners`, About `/about`, Blog `/blog`. The active link uses Webflow's automatic
`w--current` state, styled on `fk-nav-link`. There is no per-page prop.

The Nav holds one `UI / Button` (Secondary Small) that stays the same when the nav
turns into a pill, plus a Primary in the mobile menu. The menu toggle and close controls are native
`<button type="button">` elements (Webflow DOM elements) holding the `menu.svg` / `x-mark.svg`
icons, not links or drawn lines.

Buttons have no icon unless an instance asks for one (Show Icon + Icon). Icons are always SVG
files from `src/assets/icons/`.

In Webflow a variant can't swap classes, so each `UI / Button` variant carries the values of its
combo (`is-secondary`, `is-small`) as variant styles on `fk-button`. When a
button combo changes in `button.css`, update the matching variant styles too
(`data_component_variants_tool` → `set_variant_styles`). The label is a DOM `span`: Webflow's
rich-text Span can't bind to a prop.

**Placement:** Body → `div.fk-page` → Nav → `main` (the sections, in order) → Footer, on every
page. The MCP can't put a class on Body, so `fk-page` is a wrapper div, exactly as in the repo.
Heroes reserve the Nav's height through padding. A page without a hero leaves the
fixed Nav over the first section's top padding; on mobile it sits right above the first line.

## UI

| Component | React target | Legacy source | Props | Variants | Status |
| --- | --- | --- | --- | --- | --- |
| `UI / Button` | `components/ui/Button.tsx` | `components/ApplyButton.tsx`, inline button in `Footer.tsx` | Label, Link, Show Icon (off by default), Icon (image). React: `icon` (an imported SVG), none by default; and a repo `fullWidth` prop (adds the `is-full` combo). In Webflow there is no prop yet: a variant or the combo on the instance, when the Nav is synced | Primary (base), Secondary, Primary Small, Secondary Small | synced (instances in Nav and Footer) |
| `UI / Section Header` | `components/ui/SectionHeader.tsx` | repeated inline in most sections | Eyebrow, Title, Body (rich text) | Center; Left and Inverse to do | migrated (Center) |
| `UI / Post Card` | `components/ui/PostCard.tsx` | `sections/blog/BlogPostCard.tsx` | Image, Title, Excerpt, Avatar, Author, Read time — bound to CMS fields per instance | Default; Featured to do | migrated; keeps its own component classes (`css-system.md` → Component classes). **Reusable Webflow component (decided 2026-09-28, not synced yet):** `UI / Post Card` becomes a registered component with props Image, Title, Excerpt, Avatar, Author, Read time and Link; each Collection Item holds one instance with its props bound to the Posts / Authors fields. Today the test site has a bound element tree inside the Collection Item instead |
| Pagination (markup pattern, not a Webflow component) | `components/ui/Pagination.tsx` | `components/CarouselPagination.tsx` | id prefix, count, active | — | synced as markup inside Section / How It Works and Section / Testimonials: native DOM buttons and spans built with `data_element_builder` (a WHTML `<button>` becomes a Link). Each dot, bar and fill carries its own data attribute for IX3, which component props can't set, so each carousel places the markup **Tap target (`seo.md` S-18):** each dot's hit area must be at least 24 × 24 px (today 7 × 23); widen it with padding, not the visible bar. |
| `UI / Stat` | `components/ui/Stat.tsx` | inline in `Stats.tsx`, `FacilityStats.tsx`, `AboutPage.tsx` | Value, Suffix, Label | Large; Default to do | migrated (Large) |
| `UI / Service Card` | `components/ui/ServiceCard.tsx` | `components/ServiceCard.tsx` | Icon (image, optional — omitted for icon-less cards), Title, Text | Default; Subtle (`is-subtle`, text in `color-subtle` instead of `color-brand`) | synced (6 instances in Feature Grid); Subtle variant used by Role Grid, local only, not yet synced |
| `UI / Testimonial Card` | `components/ui/TestimonialCard.tsx` | inline in `legacy/Testimonials.tsx`, `FacilityTestimonial.tsx` | Image, Quote, Name, Role (the photo's alt text is bound to Name) | — | synced (7 instances in Section / Testimonials) |
| `UI / FAQ Item` | `components/ui/FaqItem.tsx` | inline in `Faq.tsx` | Question, Answer | — | legacy |
| `UI / Newsletter Form` | `components/ui/NewsletterForm.tsx` | `sections/blog/BlogNewsletter.tsx` | Title | Row, Stacked | legacy |
| `UI / Portrait` | `components/ui/Portrait.tsx` | `HeroPortrait` in `AboutPage.tsx` | Image | Peach, Sand, Brand | legacy |
| `UI / Illustration` | `components/ui/Illustration.tsx` | `components/IllustrationPanel.tsx` + `*Illustration.tsx` | Lottie file | — | legacy |

## Sections

Several legacy sections are the same pattern with different content. The target column
consolidates them. Confirm layout parity against Figma when migrating each one.

| Section | React target | Legacy sources | Variants | Status |
| --- | --- | --- | --- | --- |
| `Section / Hero` | `sections/Hero.tsx` | `legacy/Hero.tsx`, `facilities/FacilityHero.tsx`, `facility-partners/FacilityPartnersHero.tsx`, `AboutHero` (in `AboutPage.tsx`), `blog/BlogHero.tsx` | Home (arc wheel); Candidates, Facility Partners, About, Blog to do | synced (Home; UI / Button instance inside). **Repo ahead of Webflow (2026-09-27):** panel moved onto the shared shell (`fk-panel fk-bg-secondary is-hero`, no more `fk-hero`/`fk-hero is-home`; `classes.md` → `fk-hero-*`) |
| `Section / Article Hero` | `sections/ArticleHero.tsx` | `blog/ArticleHero.tsx` | — (CMS template) | legacy |
| `Section / Logo Marquee` | `sections/LogoMarquee.tsx` | `Clients.tsx` | — | synced. **Repo ahead of Webflow (2026-09-27):** row gap now the `space-14` token (`classes.md` → `fk-logo-marquee`) **SEO (`seo.md` S-16):** first-row logos need the facility name as alt (today `alt=""`); duplicate rows stay `aria-hidden`. |
| `Section / Two Ways` | `sections/TwoWays.tsx` | `legacy/TwoWays.tsx` | — | synced (2 Button instances inside). **Repo ahead of Webflow (2026-09-27):** moved onto the shared `fk-panel` > `fk-container` > `fk-panel-content` shell; `fk-two-ways` base class and its `-eyebrow`/`-title`/`-body` elements removed as dead CSS in favor of shared typography classes, and (2026-09-27) `-cards`/`-copy`/`-action` further retired onto utilities (`classes.md` → `fk-two-ways-*`). The card's word-split reveal now targets `data-two-ways="eyebrow"/"title"/"body"` instead of the removed classes (`interactions.md` → `ix-two-ways-card`, previously broken) |
| `Section / Pricing` | `sections/Pricing.tsx` | — (new, Figma nodes 6011:2380 and 6011:2529, no legacy page carries this section yet) | — | — | migrated (not yet synced). Placed on `/mvp-home` between Two Ways and Partners Map |
| `Section / Partners Map` | `sections/PartnersMap.tsx` | `legacy/PartnersMap.tsx` | — | synced. **Repo ahead of Webflow (2026-09-27):** heading/viewport gap now the `space-19` token (`classes.md` → `fk-partners-map`) |
| `Section / How It Works` | `sections/HowItWorks.tsx` | `legacy/HowItWorks.tsx`, `facilities/HowFlintWorks.tsx`, `facilities/FacilityHowItWorks.tsx` | Home (card art split into `-bg`/`-art`, D-12, supersedes H-4); Candidates, Facilities to do | synced (Home, pre-D-12; not yet re-synced). **Repo ahead of Webflow (2026-09-27):** the `fk-how-header-wrapper` div was unwrapped (the header sits directly in `fk-container`); `-inner` and `-header` removed as dead CSS; `fk-how-slide`'s radius fixed from a raw `space-6` value to `radius-xl`; card art rebuilt from Figma (nodes 5746:992 desktop, 5483:860 mobile) as a `color-tertiary`/`is-brand-light` card background plus separate `-bg` and `-art` layers, replacing the single flattened image per card (`classes.md` → `fk-how`) |
| `Section / Webinar` | `sections/Webinar.tsx` | — (new, Figma node 5987:3227, no legacy page carries this section yet) | — | migrated (props Title, Body, Button Label, Button Link; UI / Button instance inside), local only — not yet synced to Webflow. Placed on `/mvp-home` right after How It Works (`classes.md` → `fk-webinar-*`) |
| `Section / Feature Grid` | `sections/FeatureGrid.tsx` | `WhatWeOffer.tsx`, `Benefits.tsx` (both built on `ServiceCard`) | Cards (Home, secondary panel); `Benefits` to do | synced (props Title, Body). **Repo ahead of Webflow (2026-09-27/28):** wrapper layout and the card grid moved onto utilities; the `fk-feature-grid` base class retired, `-cards` keeps only its row height (`classes.md` → `fk-feature-grid`) |
| `Section / Role Grid` | `sections/RoleGrid.tsx` | — (new, Figma node 6011:3021 "Benefits") | Home, between How It Works and Feature Grid | migrated (props Title, Body, Button Label/Link, Cards; 11 role cards, `ServiceCard` Subtle variant, no icons), local only — not yet synced to Webflow. **Repo ahead of Webflow (2026-09-27):** no classes left — wrapper and card grid are utilities, `role-grid.css` deleted (`classes.md` → `fk-role-grid`) |
| _To classify_ (roadmap P-03) | — | `facility-partners/WhyFacilities.tsx`, `facility-partners/ModernFacility.tsx` | Review against Figma: become a Feature Grid variant or their own section | legacy |
| `Section / Stats Band` | `sections/StatsBand.tsx` | `Stats.tsx`, `facility-partners/FacilityStats.tsx`, `ImpactStats` (in `AboutPage.tsx`) | Large (brand-light panel, title + 4 stats); Default to do | synced (Large; stat props to do). **Repo ahead of Webflow (2026-09-27):** `fk-stats-band` and `fk-stat` base classes retired as dead CSS — both are now plain utility wrappers, only `-grid` and `-value`/`-suffix`/`-label` remain (`classes.md`) |
| `Section / Testimonials` | `sections/Testimonials.tsx` | `legacy/Testimonials.tsx`, `facility-partners/FacilityTestimonial.tsx` | Slider; Single to do | synced (Slider; prop Body; the Title keeps its line break as fixed markup). **Repo ahead of Webflow (2026-09-27):** panel moved onto the shared shell (`fk-panel fk-bg-brand-light` + `fk-panel-content`, `data-ix="testimonials"` now lives on the panel); `fk-testimonials` panel class and `-header` removed as dead CSS, and the ≤767 row-position bug (`top: 280px` inherited from the old absolute layout) was fixed; the pagination row's own `-pagination` class was retired too, now plain utility markup (`classes.md` → `fk-testimonials-*`) |
| `Section / FAQ` | `sections/Faq.tsx` | `Faq.tsx` | — | legacy Every page with this section also gets `FAQPage` JSON-LD from the same questions and answers (`seo.md` S-08). |
| `Section / Facility Grid` | `sections/FacilityGrid.tsx` | `facility-partners/FeaturedFacilities.tsx`, `facility-partners/FacilityCardGrid.tsx` | — | legacy |
| `Section / Text Panel` | `sections/TextPanel.tsx` | `Mission`, `Story` (in `AboutPage.tsx`) | Tertiary (default), Brand Light | synced (props Eyebrow, Title; body paragraphs are static for now) |
| `Section / Media Split` | `sections/MediaSplit.tsx` | `Residency` (in `AboutPage.tsx`) | Image Right, Image Left | legacy |
| `Section / Logo Grid` | `sections/LogoGrid.tsx` | `Investors` (in `AboutPage.tsx`) | — | legacy |
| `Section / Team Grid` | `sections/TeamGrid.tsx` | `Team` (in `AboutPage.tsx`) | — | legacy |
| `Section / Post Grid` → **page-level pattern, not a component** | `sections/PostGrid.tsx` | `Blog.tsx`, `blog/RelatedInsights.tsx` | Related (latest 3 in the MVP; category filter comes with the post template); Home (centered header, "See all posts" Secondary button). Header uses the blur reveal in both (legacy does). **Decision (2026-09-27):** `PostGrid.tsx` is now a reusable section with fixed content — title "The Flint blog", body copy and the "See all posts" button are hardcoded, no props — used as-is on every page that needs it, rather than taking Title/Body props like other sections. This drops the separate "Related Insights" copy | Related (on `/mvp`) and Home (on `/mvp-home`) synced as page markup; `/mvp` still has the old `ix-reveal` header (to rebuild). Webflow components can't contain a bound Collection List, so each page places the section markup + Collection List, with `UI / Post Card` instances inside the items. **Repo ahead of Webflow (2026-09-28):** the card grid is `fk-grid fk-cols-3 fk-cols-2-tablet fk-cols-1-mobile fk-gap-4` (utilities; the `fk-grid is-3` primitive retired). **Repo ahead of Webflow (2026-09-27):** the Home variant's wrapper moved onto the shared `fk-section` > `fk-panel fk-bg-brand-light` > `fk-container` > `fk-panel-content` shell (`classes.md` → `fk-post-card`); `fk-post-grid`, `fk-post-grid-header`, `fk-post-grid-action` and (2026-09-27) the card's own `-meta` wrapper were removed as dead CSS |
| `Section / Post Index` | `sections/PostIndex.tsx` | `blog/AllPosts.tsx` | — | legacy |
| `Section / Article Body` | `sections/ArticleBody.tsx` | `blog/ArticleContent.tsx` | — (CMS template) | legacy |
| `Section / Newsletter` | `sections/Newsletter.tsx` | `blog/BlogNewsletter.tsx` (standalone use) | — | legacy |
| `Section / CTA` | `sections/Cta.tsx` | `legacy/Cta.tsx`, `facilities/FacilityCta.tsx` | Art (Home: ring texture + masked room photo, no `GravityGallery`), Gallery (About), Simple | synced (Art; props Title, Body). **Repo ahead of Webflow (2026-09-27):** panel moved onto the shared shell (`fk-panel fk-bg-tertiary is-relaxed`, no more `fk-cta` panel class); the header dropped the `is-left` combo (`fk-section-header` is left-aligned by default, `is-left` doesn't exist); the button row's `-action` class was retired too, now the shared `fk-section-header-action` primitive (`classes.md` → `fk-cta-*`) |
| `Section / Apply Form` | `sections/ApplyForm.tsx` | `facility-partners/FacilityApply.tsx` | — | legacy |

## Pages

Nav and Footer wrap every page and are omitted from the section lists. Every page also needs its page settings and schema per [`seo.md`](seo.md): one H1 (the
hero title), title, meta description, OG image, clean slug, noindex where set.

| Page | Slug | Type | Sections in order |
| --- | --- | --- | --- |
| Home | `/` | Static | Hero (Home), Logo Marquee, Two Ways, Partners Map, How It Works (Home), Feature Grid ← `WhatWeOffer`, Testimonials (Slider), Post Grid (Home), CTA (Art) |
| Candidates | `/candidates` | Static | Hero (Candidates), Stats Band, How It Works (Candidates), Feature Grid ← `Benefits`, Testimonials (Slider), FAQ, CTA (Simple) |
| Facility partners | `/facility-partners` | Static | Hero (Facility Partners), Logo Marquee, Stats Band, How It Works (Facilities), `ModernFacility` (to classify), Facility Grid, `WhyFacilities` (to classify), Testimonials (Single), Apply Form |
| About | `/about` | Static | Hero (About), Text Panel (Tertiary), Stats Band (Large), Media Split, Logo Grid, Text Panel (Brand Light), Team Grid, CTA (Gallery) |
| Blog | `/blog` | Static | Hero (Blog), Newsletter, Post Index |
| Blog category | `/blog-categories/{slug}` | CMS template (Categories) | Hero (Blog), Post Index (filtered to the current category) |
| Blog post | `/blog/{slug}` | CMS template (Posts) | Article Hero, Article Body, Post Grid (Related) |
| MVP Home (draft, MVP 2) | `/mvp-home` | Static | Hero (Home), Logo Marquee, Two Ways, Pricing, Partners Map, How It Works (Home), Webinar, Role Grid, Feature Grid, Testimonials (Slider), Post Grid (Home), CTA (Art) |
| Lab (draft, temporary, Webflow only) | `/lab` | Static | MVP 2 capability spikes S1–S6 (`mvp2-home.md`). Deleted with confirmation after the spikes |
| Style guide (draft, not in nav, no-index) | `/style-guide` | Static | Page-level QA markup (`pages/StyleGuidePage.tsx`): Section Header, type scale, `UI / Button` ×5, panel colors, grids, divider. Update it when a class or UI component is added |

Legacy routing sends unknown paths to `/`. In Webflow, use the 404 page instead.

## Known content issues (fix during migration)

- The About `Team` section repeats the Investors copy ("What makes Flint different / Backed by the best").
- Most footer links point nowhere (`#` in `Global / Footer`). "LinkeDin" is fixed in the new footer.
- Every "Apply now" button lacks a destination (legacy buttons had no action). The new Button
  defaults to `#apply` until one is chosen.
- FAQ answers after the first are placeholder copy (see `README.md`).
