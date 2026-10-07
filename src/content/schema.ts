/** Site-wide and blog-index JSON-LD (seo.md S-06, S-09). One source: the repo preview renders these, and
 * `scripts/build-x-schema-site.mjs` writes the Webflow values (docs/webflow/custom-code/x-schema-site.html for
 * the site head code, blog-index-jsonld.json for the /blog page's `jsonLdSchema`). Production domain per D-62;
 * never the staging URL. Keep the Posts template block (`x-schema-post`) on the same `@id`s and name/url. */
export const SITE_ORIGIN = "https://withflint.com";
export const ORG_ID = `${SITE_ORIGIN}/#organization`;
export const WEBSITE_ID = `${SITE_ORIGIN}/#website`;
export const SITE_NAME = "Flint";

/** The 512 px favicon asset (hosted on the Webflow CDN, crawlable). */
export const ORG_LOGO = {
  "@type": "ImageObject",
  url: "https://cdn.prod.website-files.com/6ab9ba4aeffb3329202448ee/6abbc405742052e3a5f99ca8_Flint-logo-brand-circle.png",
  width: 512,
  height: 512,
};

/** Social profile URLs. Empty until the client sends them (roadmap P-08 / Backlog): add them here and
 * rebuild; `sameAs` is only emitted when the list is not empty. */
export const SAME_AS: string[] = [];

/** `Organization` + `WebSite`, for every page (exception `x-schema-site`, site head code). */
export function siteSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: SITE_NAME,
        url: `${SITE_ORIGIN}/`,
        logo: ORG_LOGO,
        ...(SAME_AS.length ? { sameAs: SAME_AS } : {}),
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: `${SITE_ORIGIN}/`,
        name: SITE_NAME,
        publisher: { "@id": ORG_ID },
      },
    ],
  };
}

/** The live meta description of /blog (read from staging 2026-10-07). */
export const BLOG_DESCRIPTION =
  "Immigration, licensing, and hiring tips for healthcare workers seeking Visa sponsorship. Read guides on green card sponsorship for CNAs, LPNs, and RNs.";

/** `Blog` + `BreadcrumbList` (Home > Blog) for /blog (the page's native JSON-LD setting). */
export function blogIndexSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": `${SITE_ORIGIN}/blog#blog`,
        url: `${SITE_ORIGIN}/blog`,
        name: "Flint Blog",
        description: BLOG_DESCRIPTION,
        isPartOf: { "@id": WEBSITE_ID },
        publisher: { "@id": ORG_ID },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_ORIGIN}/blog#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_ORIGIN}/` },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_ORIGIN}/blog` },
        ],
      },
    ],
  };
}
