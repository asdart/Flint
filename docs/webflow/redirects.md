# 301 redirects (launch)

Legacy `withflint.com` URLs that don't exist on the new site and must redirect when the domain is
connected (roadmap P-06, `seo.md` S-05). Entered in Webflow at launch (Site settings → Publishing →
301 redirects); site settings stay untouched until then (D-62). Paths are relative to
`https://withflint.com`. Every old path below answered 200 on the live site on 2026-10-10.

## Confirmed (user, 2026-10-10)

The last four are renamed pages and posts found in the live sitemap (2026-10-10 comparison: `https://withflint.com/sitemap.xml`, 40 URLs, against the staging sitemap, 35 URLs).

| Old path | Redirect to |
| --- | --- |
| `/referall-john-njunung` (sic) | `/candidates` |
| `/joan-kinyuas-flint-page` | `/candidates` |
| `/dieunold-toussaint-flint-page` | `/candidates` |
| `/referral-love-genie` | `/candidates` |
| `/referral-ben-kamanga` | `/candidates` |
| `/referral-noma` | `/candidates` |
| `/referral-peter-mahowe` | `/candidates` |
| `/two-rivers-care-training` | `/candidates` |
| `/vital-healthcare-training-center` | `/candidates` |
| `/care-connection-flint-page` | `/candidates` |
| `/excelcna` | `/candidates` |
| `/caregiver-for-hire` | `/candidates` |
| `/registered-nurse-sponsorship` | `/candidates` |
| `/thank-you-overview-rn` | `/thank-you` |
| `/thank-you-overview` | `/thank-you` |
| `/thanks` | `/thank-you` |
| `/next-steps` | `/thank-you` |
| `/facility-thank-you` | `/thank-you` |
| `/facility-thanks` | `/thank-you` |
| `/facilitypartners` | `/facility-partners` |
| `/blog/direct-hire-nursing-jobs-in-the-usa-for-internationally-trained-nurses-already-in-the-u-s` | `/blog/direct-hire-nursing-jobs-in-the-usa-for-foreign-nurses-already-in-the-u-s` |
| `/blog/nclex-for-internationally-educated-nurses-what-you-need-to-know` | `/blog/nclex-for-foreign-educated-nurses-what-you-need-to-know` |
| `/blog/us-nursing-jobs` | `/blog/us-nursing-jobs-for-foreign-nurses-direct-hire-opportunities-with-flint` |

`/thank-you` is the new Thank You page (`src/pages/ThankYouPage.tsx`, `components.md` → Pages):
`noindex`, out of the sitemap.

## Not redirected: published instead (user, 2026-10-10)

These three posts are live on the current site and were drafts on the new one; the user chose to
publish them, so their URLs keep working without a redirect:

- `/blog/green-card-sponsorship-for-healthcare-workers`
- `/blog/how-to-apply-for-nurse-green-card-sponsorship-today-step-by-step-eligibility-check`
- `/blog/nursing-agencies-that-offer-sponsorship-in-the-usa-how-they-work`

Webflow already redirects trailing slashes (`/about/` → `/about`); other paths are the same on both
sites.
