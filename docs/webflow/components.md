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
| `Global / Nav` | `components/global/Nav.tsx` | `components/SiteNav.tsx`, `nav.ts` (rendered inside 6 heroes) | — | Light (default); Dark to do | synced (Light) |
| `Global / Footer` | `components/global/Footer.tsx` | `sections/Footer.tsx` | CTA Title (multiline), CTA Body — props not yet created in Webflow | — | synced |

Nav links (static, in this order): Home `/`, Candidates `/candidates`, Facility partners
`/facility-partners`, About `/about`, Blog `/blog`. The active link uses Webflow's automatic
`w--current` state, styled on `fk-nav-link`. There is no per-page prop.

The Nav holds one `UI / Button` (Secondary Small, in `-cta-rest`) that stays the same when the nav
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
Heroes reserve the Nav's height through padding. A page without a hero, like `/mvp`, leaves the
fixed Nav over the first section's top padding; on mobile it sits right above the first line.

## UI

| Component | React target | Legacy source | Props | Variants | Status |
| --- | --- | --- | --- | --- | --- |
| `UI / Button` | `components/ui/Button.tsx` | `components/ApplyButton.tsx`, inline button in `Footer.tsx` | Label, Link, Show Icon (off by default), Icon (image). React: `icon` (an imported SVG), none by default | Primary (base), Secondary, Primary Small, Secondary Small | synced (instances in Nav and Footer) |
| `UI / Section Header` | `components/ui/SectionHeader.tsx` | repeated inline in most sections | Eyebrow, Title, Body (rich text) | Center; Left and Inverse to do | migrated (Center) |
| `UI / Post Card` | `components/ui/PostCard.tsx` | `sections/blog/BlogPostCard.tsx` | Image, Title, Excerpt, Avatar, Author, Read time — bound to CMS fields per instance | Default; Featured to do | migrated; in Webflow a bound element tree inside the Collection Item (component-with-props version to do) |
| `UI / Stat` | `components/ui/Stat.tsx` | inline in `Stats.tsx`, `FacilityStats.tsx`, `AboutPage.tsx` | Value, Suffix, Label | Large; Default to do | migrated (Large) |
| `UI / Service Card` | `components/ui/ServiceCard.tsx` | `components/ServiceCard.tsx` | Icon, Title, Text | — | legacy |
| `UI / Testimonial Card` | `components/ui/TestimonialCard.tsx` | inline in `Testimonials.tsx`, `FacilityTestimonial.tsx` | Image, Quote, Name, Role | — | legacy |
| `UI / FAQ Item` | `components/ui/FaqItem.tsx` | inline in `Faq.tsx` | Question, Answer | — | legacy |
| `UI / Newsletter Form` | `components/ui/NewsletterForm.tsx` | `sections/blog/BlogNewsletter.tsx` | Title | Row, Stacked | legacy |
| `UI / Portrait` | `components/ui/Portrait.tsx` | `HeroPortrait` in `AboutPage.tsx` | Image | Peach, Sand, Brand | legacy |
| `UI / Illustration` | `components/ui/Illustration.tsx` | `components/IllustrationPanel.tsx` + `*Illustration.tsx` | Lottie file | — | legacy |

## Sections

Several legacy sections are the same pattern with different content. The target column
consolidates them. Confirm layout parity against Figma when migrating each one.

| Section | React target | Legacy sources | Variants | Status |
| --- | --- | --- | --- | --- |
| `Section / Hero` | `sections/Hero.tsx` | `Hero.tsx`, `facilities/FacilityHero.tsx`, `facility-partners/FacilityPartnersHero.tsx`, `AboutHero` (in `AboutPage.tsx`), `blog/BlogHero.tsx` | Home, Candidates, Facility Partners, About, Blog | legacy |
| `Section / Article Hero` | `sections/ArticleHero.tsx` | `blog/ArticleHero.tsx` | — (CMS template) | legacy |
| `Section / Logo Marquee` | `sections/LogoMarquee.tsx` | `Clients.tsx` | — | legacy |
| `Section / Two Ways` | `sections/TwoWays.tsx` | `TwoWays.tsx` | — | legacy |
| `Section / Partners Map` | `sections/PartnersMap.tsx` | `PartnersMap.tsx` | — | legacy |
| `Section / How It Works` | `sections/HowItWorks.tsx` | `HowItWorks.tsx`, `facilities/HowFlintWorks.tsx`, `facilities/FacilityHowItWorks.tsx` | Home, Candidates, Facilities | legacy |
| `Section / Feature Grid` | `sections/FeatureGrid.tsx` | `WhatWeOffer.tsx`, `Benefits.tsx` (both built on `ServiceCard`) | Cards | legacy |
| _To classify_ (roadmap P-03) | — | `facility-partners/WhyFacilities.tsx`, `facility-partners/ModernFacility.tsx` | Review against Figma: become a Feature Grid variant or their own section | legacy |
| `Section / Stats Band` | `sections/StatsBand.tsx` | `Stats.tsx`, `facility-partners/FacilityStats.tsx`, `ImpactStats` (in `AboutPage.tsx`) | Large (brand-light panel, title + 4 stats); Default to do | synced (Large; stat props to do) |
| `Section / Testimonials` | `sections/Testimonials.tsx` | `Testimonials.tsx`, `facility-partners/FacilityTestimonial.tsx` | Slider, Single | legacy |
| `Section / FAQ` | `sections/Faq.tsx` | `Faq.tsx` | — | legacy |
| `Section / Facility Grid` | `sections/FacilityGrid.tsx` | `facility-partners/FeaturedFacilities.tsx`, `facility-partners/FacilityCardGrid.tsx` | — | legacy |
| `Section / Text Panel` | `sections/TextPanel.tsx` | `Mission`, `Story` (in `AboutPage.tsx`) | Tertiary (default), Brand Light | synced (props Eyebrow, Title; body paragraphs are static for now) |
| `Section / Media Split` | `sections/MediaSplit.tsx` | `Residency` (in `AboutPage.tsx`) | Image Right, Image Left | legacy |
| `Section / Logo Grid` | `sections/LogoGrid.tsx` | `Investors` (in `AboutPage.tsx`) | — | legacy |
| `Section / Team Grid` | `sections/TeamGrid.tsx` | `Team` (in `AboutPage.tsx`) | — | legacy |
| `Section / Post Grid` → **page-level pattern, not a component** | `sections/PostGrid.tsx` | `Blog.tsx`, `blog/RelatedInsights.tsx` | Related (latest 3 in the MVP; category filter comes with the post template); Home to do | synced as page markup. Webflow components can't contain a bound Collection List, so each page places the section markup + Collection List, with `UI / Post Card` instances inside the items |
| `Section / Post Index` | `sections/PostIndex.tsx` | `blog/AllPosts.tsx` | — | legacy |
| `Section / Article Body` | `sections/ArticleBody.tsx` | `blog/ArticleContent.tsx` | — (CMS template) | legacy |
| `Section / Newsletter` | `sections/Newsletter.tsx` | `blog/BlogNewsletter.tsx` (standalone use) | — | legacy |
| `Section / CTA` | `sections/Cta.tsx` | `Cta.tsx`, `facilities/FacilityCta.tsx` | Gallery, Simple | legacy |
| `Section / Apply Form` | `sections/ApplyForm.tsx` | `facility-partners/FacilityApply.tsx` | — | legacy |

## Pages

Nav and Footer wrap every page and are omitted from the section lists.

| Page | Slug | Type | Sections in order |
| --- | --- | --- | --- |
| Home | `/` | Static | Hero (Home), Logo Marquee, Two Ways, Partners Map, How It Works (Home), Feature Grid ← `WhatWeOffer`, Testimonials (Slider), Post Grid (Home), CTA (Gallery) |
| Candidates | `/candidates` | Static | Hero (Candidates), Stats Band, How It Works (Candidates), Feature Grid ← `Benefits`, Testimonials (Slider), FAQ, CTA (Simple) |
| Facility partners | `/facility-partners` | Static | Hero (Facility Partners), Logo Marquee, Stats Band, How It Works (Facilities), `ModernFacility` (to classify), Facility Grid, `WhyFacilities` (to classify), Testimonials (Single), Apply Form |
| About | `/about` | Static | Hero (About), Text Panel (Tertiary), Stats Band (Large), Media Split, Logo Grid, Text Panel (Brand Light), Team Grid, CTA (Gallery) |
| Blog | `/blog` | Static | Hero (Blog), Newsletter, Post Index |
| Blog category | `/blog-categories/{slug}` | CMS template (Categories) | Hero (Blog), Post Index (filtered to the current category) |
| Blog post | `/blog/{slug}` | CMS template (Posts) | Article Hero, Article Body, Post Grid (Related) |
| MVP (draft, not in nav, no-index) | `/mvp` | Static | Text Panel (Tertiary), Stats Band (Large), Post Grid (Related) |

Legacy routing sends unknown paths to `/`. In Webflow, use the 404 page instead.

## Known content issues (fix during migration)

- The About `Team` section repeats the Investors copy ("What makes Flint different / Backed by the best").
- Most footer links point nowhere (`#` in `Global / Footer`). "LinkeDin" is fixed in the new footer.
- Every "Apply now" button lacks a destination (legacy buttons had no action). The new Button
  defaults to `#apply` until one is chosen.
- FAQ answers after the first are placeholder copy (see `README.md`).
