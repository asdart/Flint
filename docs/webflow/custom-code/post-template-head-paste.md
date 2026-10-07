# Paste: Article + breadcrumb schema on the Posts template (`x-schema-post`)

Designer only (the MCP cannot insert CMS field tokens). About 5 minutes.

## Where

Designer > Pages > **Posts** (CMS template) > page settings (gear) > **Custom code** > **Inside `<head>` tag**.

The box already holds the `<style>` block (`x-related-empty` and `x-article-body`). **Keep it.** Click at the very end of the existing code, add a new line and paste the block below **after** it. Do not replace anything.

## What to paste

The block below, with the `{{ ... }}` placeholders still in it (the HTML comment from `post-template-head.html` is left out on purpose: it would be published in every post's source).

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      "@id": "https://withflint.com/blog/{{Post: Slug}}#article",
      "headline": "{{Post: Name}}",
      "description": "{{Post: Excerpt}}",
      "image": "{{Post: Main image}}",
      "datePublished": "{{Post: Publish date}}",
      "dateModified": "{{Post: Updated On}}",
      "author": {
        "@type": "Organization",
        "name": "{{Author: Name}}"
      },
      "publisher": {
        "@type": "Organization",
        "@id": "https://withflint.com/#organization",
        "name": "Flint",
        "url": "https://withflint.com/"
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://withflint.com/blog/{{Post: Slug}}"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://withflint.com/blog/{{Post: Slug}}#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://withflint.com/" },
        { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://withflint.com/blog" },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "{{Category: Name}}",
          "item": "https://withflint.com/categories/{{Category: Slug}}"
        },
        { "@type": "ListItem", "position": 4, "name": "{{Post: Name}}" }
      ]
    }
  ]
}
</script>
```

## Turn each placeholder into a CMS field

For each `{{ ... }}`: select it with the mouse **including the double braces and nothing else** (leave the quotes), click **+ Add Field** (above the editor), pick the field in the table, **Add Field**. Webflow replaces the selected text with its own token. Do not type tokens by hand. `{{Post: Slug}}` appears 3 times and `{{Post: Name}}` 2 times: repeat for every occurrence.

| Placeholder | Where it appears | Add Field menu choice |
| --- | --- | --- |
| `{{Post: Slug}}` | 3 places: article `@id`, `mainEntityOfPage.@id`, breadcrumb `@id` | **Slug** |
| `{{Post: Name}}` | `headline`, last breadcrumb `name` | **Title** (the Posts name field is called "Title") |
| `{{Post: Excerpt}}` | `description` | **Excerpt** |
| `{{Post: Main image}}` | `image` | **Main image** (must insert the URL only; if the menu asks for a size/format, choose the image URL) |
| `{{Post: Publish date}}` | `datePublished` | **Publish date** |
| `{{Post: Updated On}}` | `dateModified` | **Updated On** (system date field, listed with Created On / Published On; if it is missing, delete the whole `"dateModified"` line, including its comma, and tell us) |
| `{{Author: Name}}` | `author.name` | **Author > Name** (reference field "Author", then its "Name") |
| `{{Category: Name}}` | breadcrumb position 3 `name` | **Category > Name** (reference field "Category", then its "Name") |
| `{{Category: Slug}}` | breadcrumb position 3 `item` | **Category > Slug** |

Then **Save**, and tell us it is done. We publish to the staging subdomain only and check the JSON-LD on several posts (dates in ISO 8601, apostrophes, image URL). Nothing goes to withflint.com.
