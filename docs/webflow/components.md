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

## Global

| Component | React target | Legacy source | Props | Variants | Status |
| --- | --- | --- | --- | --- | --- |
| `Global / Nav` | `components/global/Nav.tsx` | `components/SiteNav.tsx`, `nav.ts` (rendered inside 6 heroes) | CTA Label, CTA Link | Light (default), Dark | legacy |
| `Global / Footer` | `components/global/Footer.tsx` | `sections/Footer.tsx` | CTA Title, CTA Body | — | legacy |

Nav links (static, in this order): Home `/`, Candidates `/candidates`, Facility partners
`/facility-partners`, About `/about`, Blog `/blog`. The active link uses Webflow's automatic
`w--current` state, styled on `fk-nav-link`. There is no per-page prop.

**Placement:** Nav is the first child of the page body on every page, outside every section. Heroes
reserve its height through padding. Footer is the last child.

## UI

| Component | React target | Legacy source | Props | Variants | Status |
| --- | --- | --- | --- | --- | --- |
| `UI / Button` | `components/ui/Button.tsx` | `components/ApplyButton.tsx`, inline button in `Footer.tsx` | Label, Link | Primary, Secondary · Size: Default, Small | legacy |
| `UI / Section Header` | `components/ui/SectionHeader.tsx` | repeated inline in most sections | Eyebrow, Title, Body, Show Body | Left, Center · Inverse | legacy |
| `UI / Post Card` | `components/ui/PostCard.tsx` | `sections/blog/BlogPostCard.tsx` | (CMS-bound) | Default, Featured | legacy |
| `UI / Stat` | `components/ui/Stat.tsx` | inline in `Stats.tsx`, `FacilityStats.tsx`, `AboutPage.tsx` | Value, Suffix, Label | — | legacy |
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
| `Section / Stats Band` | `sections/StatsBand.tsx` | `Stats.tsx`, `facility-partners/FacilityStats.tsx`, `ImpactStats` (in `AboutPage.tsx`) | Default, Large | legacy |
| `Section / Testimonials` | `sections/Testimonials.tsx` | `Testimonials.tsx`, `facility-partners/FacilityTestimonial.tsx` | Slider, Single | legacy |
| `Section / FAQ` | `sections/Faq.tsx` | `Faq.tsx` | — | legacy |
| `Section / Facility Grid` | `sections/FacilityGrid.tsx` | `facility-partners/FeaturedFacilities.tsx`, `facility-partners/FacilityCardGrid.tsx` | — | legacy |
| `Section / Text Panel` | `sections/TextPanel.tsx` | `Mission`, `Story` (in `AboutPage.tsx`) | Tertiary, Brand Light | legacy |
| `Section / Media Split` | `sections/MediaSplit.tsx` | `Residency` (in `AboutPage.tsx`) | Image Right, Image Left | legacy |
| `Section / Logo Grid` | `sections/LogoGrid.tsx` | `Investors` (in `AboutPage.tsx`) | — | legacy |
| `Section / Team Grid` | `sections/TeamGrid.tsx` | `Team` (in `AboutPage.tsx`) | — | legacy |
| `Section / Post Grid` | `sections/PostGrid.tsx` | `Blog.tsx`, `blog/RelatedInsights.tsx` | Home, Related | legacy |
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

Legacy routing sends unknown paths to `/`. In Webflow, use the 404 page instead.

## Known content issues (fix during migration)

- The About `Team` section repeats the Investors copy ("What makes Flint different / Backed by the best").
- The footer label "LinkeDin" should be "LinkedIn". Most footer links point to `/`.
- FAQ answers after the first are placeholder copy (see `README.md`).
