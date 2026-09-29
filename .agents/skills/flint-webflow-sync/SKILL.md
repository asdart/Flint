---
name: flint-webflow-sync
description: Pushes Flint repo changes to the Flint Webflow site and pulls Designer edits back through the Webflow MCP, using tested payload recipes and a list of known pitfalls. Use before calling any Webflow MCP tool, when syncing tokens, classes, components, CMS or pages to Webflow, and whenever a Webflow MCP call fails or behaves unexpectedly.
---

# Flint ⇄ Webflow sync

The contract is `AGENTS.md`; the order of operations and the capability table are in
`docs/webflow/mcp-playbook.md`. This skill holds the **how**: payloads that are known to work
([recipes.md](recipes.md)) and the pitfalls that already cost a detour.

## Before the first call

1. Read `mcp-playbook.md` (order, call conventions) and `docs/webflow/webflow-ids.json` (every
   id created so far on the production site). Never guess an id; never re-create a name that is listed there.
2. Send `session_id: "start"` once, then reuse the returned `ses_…` on every call.
3. Query by name before any create. Destructive actions and publishing need the user's explicit
   confirmation (rule 12). Batch all pending deletions into one question to the user.
4. Interactions: also read `.agents/skills/webflow-mcp-interactions/SKILL.md` (vendored, don't edit).
5. Pages, CMS templates, images and custom code: also read `docs/webflow/seo.md`. Every page you
   build or change must meet it (see "Page SEO checklist" below).

## Pitfalls: symptom → what to do

| Symptom | Do this |
| --- | --- |
| `create_blank_component` result has a `div` root around your markup | Don't use blank components. Build on the draft page and transform it ([recipes → Component](recipes.md#component-from-markup)) |
| `transform_element_to_component` → "Element … not found" | It can't reach elements inside a component definition. Build at page level |
| `<button>` in WHTML comes back as `type: "Link"` | Create a DOM element with `dom_tag: "button"` ([recipes → Native elements](recipes.md#native-elements-button-span)) |
| Binding a prop to a WHTML `<span>` → "Setting text is not applicable" | Use a DOM `span` (or a Text Block); rich-text Spans can't bind |
| Need a variant to add a combo class | Not possible; variants are style overrides. Copy the combo's values into `set_variant_styles` |
| Field got slug `…-2`, or needs a new slug | Slugs are immutable. Create → copy values → repoint sorts/bindings → delete ([recipes → CMS field](recipes.md#replace-a-cms-field)) |
| Creating something that exists returns `-2` or is silently dropped | Creates aren't idempotent. Query first; use update actions |
| WHTML `<img>` → "inserted without a managed asset", even for an uploaded asset | Set the asset after insert: `set_settings` → `assetId` ([recipes → Icons](recipes.md#svg-icons-and-optional-icons)) |
| `remove_style` → "Ensure there are no usages of this style" | Remove the elements first, in an earlier call (not in parallel). Removing a base style also removes its combos |
| A class still carries a raw shorthand (`border-top: 1px solid var(--_flint---…)`) | An old WHTML insert stored it as-is. `remove_properties: ["border-top", …]`, then push the longhands |
| A DOM element (`hr`, custom tag) inserted with WHTML has a `class` attribute next to its styles | Happens on every WHTML insert of a DOM element. Right after inserting, `remove_attribute` `["class"]` on it |
| `update_style` → "Invalid style property -webkit-…" (also `line-clamp`, `font-smoothing`) | Vendor-prefixed properties can't be stored. Move them to `src/styles/exceptions/` and ask per rule 14 |
| Markup copied from the browser preview has `data-cursor-ref` attributes | The browser tool adds them. Strip them before sending the markup to WHTML |
| Not sure whether Webflow still matches the repo | Run the diff ([recipes → Diff](recipes.md#diff-the-repo-against-webflow)) before and after every class push |
| A declaration deleted from the repo CSS is still on the Webflow class | `webflow-style-actions.mjs` only sets. Send `update_style` with `remove_properties` ([recipes → Push classes](recipes.md#push-classes)) |
| A motion looks like it needs custom code (word reveals, marquees, looping tickers, carousels, blur-in) | Check native first: IX3 `splitText` (words/lines/chars, with mask), `repeat: -1` loops, timeline positions for staggers, hover `pause`/`resume`, click `jump` to a time, and class toggles whose CSS transition animates what IX3 can't (`filter`, `height`). Tell subagents about these when they assess feasibility |
| A class-toggle reveal (resting CSS hidden, IX adds the visible class) never shows with reduced motion | `dont-animate` skips the whole interaction, so the class never lands. Use `skip-to-end` on those interactions. GSAP FromTo reveals rest visible and can keep `dont-animate` |
| An infinite loop (marquee, arc, ticker, carousel) shows empty edges mid-cycle | Not enough copies: they must cover the visible area plus one set's travel for the whole cycle (`docs/webflow/archive/test-site/mvp2-home.md` → coverage rule) |
| WHTML → "Expected single root element but found N elements" | Each insert takes one root. Wrap them, or send one action per element (5 per call) |
| A test interaction targets a real class (e.g. toggles a block's base class) | Test with a dedicated lab combo, never a live base class; an unpublished bad test still needs a confirmed delete before the next publish |
| A looping ticker holds its last (duplicate) item twice as long | The cycle length is **unique items × step**, not rows including the duplicate |
| Checking whether an interaction actually plays | Publish to the staging subdomain (with confirmation) and sample `getComputedStyle` over time with CDP `Runtime.evaluate`; synthetic `mouseenter`/`click` events from page script do drive IX3 hover and click triggers |
| An effect Webflow can't do natively (gradient angle, custom property animation) | Don't approximate (rule 14). Ask the user; register an exception in `src/styles/exceptions/` |
| Uploading an asset or font file | `create_asset` / `create_font`, then pipe the result into `scripts/webflow-upload.mjs` ([recipes → Upload](recipes.md#upload-an-asset)) |
| A class you pushed is back to older values (seen: `fk-button` gradient and `transition`), with a newer page `lastUpdated` | A Designer tab opened before the push saved its stale copy. Re-read styles at the start of each task, re-push from the repo, and ask the user to reload the Designer after every push |
| `query_elements` `component_filter` finds no instances that do exist | It only searches the page tree. Instances inside Nav/Footer need `scope_component_id` |
| `element_snapshot_tool` → `{"status":false}` | Snapshots need the Designer with the MCP Bridge app open. Verify with element queries instead and ask the user to review visually |
| Claude Code: `webflow_guide_tool` result (~87k chars) is too large and saved to a file instead | The `ses_…` id is still in it: `grep -o 'ses_[0-9A-Za-z]\{27\}' <saved file> \| head -1`. Read the rest with `jq` only if needed |
| Asked to delete a page | The MCP can't (no page delete action). Ask the user to delete it in the Designer and keep it `draft: true` until then; note it in the `sync-log.md` row so it isn't forgotten |
| Need to change `llms.txt`, robots.txt, the sitemap or the canonical URL | Site settings → SEO, not reachable through the MCP. Edit the repo source (`public/llms.txt`), then ask the user to upload or paste it. `llms.txt` isn't served on the staging domain: check it on the custom domain |
| A refactor moved generic CSS to utilities and something shifted (a collapsed height, a lost mobile gap) | Build the baseline commit in a worktree and the refactor side by side (`vite preview`, two ports), capture `getComputedStyle` + rects for every element under `.fk-page` at 1440/800/600/390, and diff them. Exclude moving carousels and animated tracks. Found 2026-09-27: `height` dropped with `flex: none`, and a responsive `gap` not carried over |
| An interaction stops finding its targets after a class cleanup (Two Ways word reveal) | The markup lost the class it queried. Target a `data-*` attribute instead, and grep `src/ix/` + `interactions.md` before removing any class |
| Validation error about a missing `siteId` / `site_id` / `pageId` | Placement differs per tool; see playbook → Call conventions |
| Media query rejected, tag selectors dropped | Write queries exactly as in `AGENTS.md` §5; typography lives on classes, not tag selectors |
| `0 -1px` minified to `0-1px`, or a shadow/gradient replaced by one color variable | Write `0px -1px`; push with `scripts/webflow-style-actions.mjs`, which resolves compound `var()` values to literals |
| Repo markup puts two base classes on one element (`fk-section fk-cta`, `fk-panel fk-cta-panel`, `fk-icon fk-card-icon`) | Still don't do this for **block** classes: `fk-section fk-cta` mixes two unrelated block identities, and there's no shared rule to reuse. But for **utility** stacking (spike S7, 2026-09-27, `css-system.md` → S7 result), each class keeps applying its own standalone properties — Webflow just also creates an empty combo style object per new combination, which is harmless noise, not a copy of values. So `fk-lab-u-box fk-lab-u-flex fk-lab-u-gap` is fine; `fk-section fk-cta` (two block identities) is not. See [recipes → Stack utility classes](recipes.md#stack-utility-classes) |
| A `<p>` or heading inside a block has no class of its own | Webflow's default stylesheet gives `p` a 10px bottom margin (headings get margins too), and markup pushed to Webflow never relies on tag styles. Give the text a class with `margin: 0` and its typography |
| The Vite dev server serves an old module (a new route redirects to `/`, `curl localhost:5180/src/App.tsx` lacks the change) | Its file watcher stopped after a long session. Restart the dev server before browser QA |
| `set_attributes` with name `data-ix` → "An internal error occurred" (every time; `data-ix-item` works) | `data-ix` is reserved by Webflow's legacy interactions and can only be written by the WHTML builder. Insert a new element with the attribute (`<div class="…" data-ix="…"></div>`), `move_element` the children into it, then remove the old one (with confirmation). Put `data-ix` in the markup of the first insert whenever possible |
| WHTML into a new Collection Item → "Connect this Collection List to a Collection before adding elements" | Set the list's `source` (and `sort`, `limit`) with `data_element_settings_tool` first, then insert the card markup into the DynamoItem |
| `webflow-markup.mjs` / `webflow-css.mjs` throw "No hosted asset for /assets/….webp" | The asset isn't uploaded yet, or `webflow-ids.json` → `assets` still holds an old key (for example a `.png` from before the image moved to WebP). Upload the file and record it under the repo's current key; delete a stale entry only once nothing on the site uses that asset |
| Uploading many assets | Batch `create_asset` in one call, then `node scripts/webflow-upload-batch.mjs <xAmzCredential> < uploads.json` with `{file, key, date, signature}` per asset; run it once with `--check <one verbatim policy>` first |
| Two elements need the same scroll timeline, one offset in time (e.g. the second card +0.12s) | Scroll triggers take no `delay`. Create a second interaction triggered by the other element's combo class with every `position` shifted |
| A subagent stacks a typography class on a block element (`fk-partners-map-row fk-heading-xl`) | Still the two-block-identity problem (unlike the utility case above, `fk-heading-xl` and `fk-partners-map-row` are both meant to fully own an element's typography/geometry, so their empty auto-combo hides a real conflict, not a harmless stack). Copy the typography into the block class, including its breakpoint overrides; check where legacy switches size (`lg:` = 1024 means tablet keeps the small size) |
| A repo preview script needs styled wrapper spans (word masks) that Webflow generates itself | Style them inline from the preview script, not as registered classes, or they show up as permanent diff noise |
| Comparing legacy and contract pages at several widths | Load both pages in same-origin iframes of the target width from one `Runtime.evaluate` and measure inside them; emulate `prefers-reduced-motion: reduce` first so both show end states. Reload after changing the emulation, or already-started scripts keep the old value |
| A browser subagent's parity numbers look off (the same hover state on both pages, a header half as wide) | It likely measured the wrong element. Re-measure the specific boxes yourself with CDP `Runtime.evaluate` before acting on them |
| Need the WHTML for a repo section | Render it, don't scrape the preview: `node scripts/webflow-markup.mjs src/sections/X.tsx` (Vite SSR, hosted asset URLs from `webflow-ids.json`, no runtime state). Then empty component slots (buttons, repeated cards) and native-button spots (pagination) before inserting |
| `create_interaction` → `Trigger "wf:scroll" cannot be combined with other triggers` | A scroll trigger must be the only trigger. A carousel that needs hover pause or click jumps can't also play/pause by visibility: start it on `wf:load` (or ask, rule 14) |
| A carousel's slides are only spread out by a script (resting CSS stacks them) | IX3 `dont-animate` and the first seconds before a step show the resting CSS. Give each slide its resting position as a combo (`fk-testimonials-slide is-slot-n`) so the CSS alone equals the timeline's frame 0 |
| Several FromTo tweens on one element in a looping timeline | Author the actions in reverse chronological order, so each element's earliest tween (whose from-state is the resting CSS) comes last; that stays correct even if a FromTo renders its from-state immediately |
| A spring (Framer duration/bounce) must be matched exactly | Trace it into a `customEase` path ([recipes → Spring as CustomEase](recipes.md#spring-as-a-customease)); `back.out` misses by up to ~18px on a 182px move |
| An interaction payload nears the 65,536-byte budget | The `customEase` string repeats on every action. Use fewer curve segments (8 gave 0.13px error) and short action names |
| `draggable="false"` (and similar) missing after a WHTML insert | WHTML drops it. `set_attributes` on the element afterwards (with `scope_component_id` inside a component) |
| Per-breakpoint geometry for one interaction (phone vs desktop) | Two interactions with `conditionalPlayback` `{type: "breakpoint", breakpoints: [...], behavior: "dont-animate"}`: the listed breakpoints are where it does **not** play (desktop lists `tiny`, phone lists `main`, `medium`, `small`). One row per type, so it sits next to the reduced-motion row |
| `create_style` → "Property gap does not support setting a variable of type length" | The `gap` **shorthand** rejects `variable_as_value`. Send the longhands `grid-row-gap` and `grid-column-gap` with the variable instead, which is what Webflow stores and what `scripts/webflow-style-actions.mjs` already does. Never fall back to a literal px (rule 2). Found in spike S7, `css-system.md` → S7 result |
| Stacking several standalone (global) classes on one element (`class="fk-lab-u-box fk-lab-u-flex fk-lab-u-gap"`) | Works: the element's `styleNames` lists every class and each keeps applying its own properties. Webflow also silently creates an empty combo style per new combination (harmless noise, not a value copy; the published CSS doesn't even contain it, checked on staging). `data_element_tool` → `set_style` can only *reuse* a combo chain that already exists by name (via an earlier WHTML insert or explicit `create_style` at every depth) — it errors "One or more styles not found" on a brand-new combination. See [recipes → Stack utility classes](recipes.md#stack-utility-classes) and `css-system.md` → S7 result (spike, 2026-09-27) |
| A flex child with an explicit fixed `height` collapses to 0px height once its row stacks into a column at a breakpoint | `flex: 1 1 0` sets `flex-basis: 0`, and flex-basis wins over `height` on the main axis — in a column flex container the main axis *is* height, so the explicit height is silently zeroed. Fix: override to `flex: none` on the stacked children at that breakpoint, or better, avoid the explicit height altogether and let content size the card (found while building Section / Pricing: the card was first built with a fixed height, then reworked to a flex + padding layout with no fixed height, which sidesteps the bug entirely) |

## Page SEO checklist

Run it for every page or template you build or change (`AGENTS.md` rule 15, details in `seo.md`):

- **Headings:** exactly one `h1` (the hero title); section titles `h2`, card titles `h3`. Dates,
  authors, quotes, eyebrows and stat values are `p`/`span`. Fix levels with `set_heading_level`.
- **Page settings:** `data_pages_tool` → `update_page_settings` with `seo.title`,
  `seo.description` and `openGraph` (image by `imageAssetId`). Slug lowercase kebab-case.
  Noindex (Sitemap indexing) isn't in the MCP: ask the user to set it in the Designer.
- **Schema:** `FAQPage` through `jsonLdSchema` on pages with an FAQ block, built from the same
  copy. Site and post schema only through `x-schema-site` / `x-schema-post`.
- **Images:** upload resized WebP (`npm run webp -- <files> --width <2× the largest rendered width>`,
  `seo.md` S-10); `width` and `height` on every image; lazy below the fold, eager
  for the hero; alt text per `seo.md` S-16 (logos: facility name, people: their name, decorative:
  empty inside `aria-hidden` art).
- **Controls:** icon-only buttons get an `aria-label`; hit areas at least 24 × 24 px.
- **No head weight:** no Google Fonts from the Designer, no tracking tags outside
  `x-deferred-tracking`, no blocking scripts.
- Anything marked "to verify" in `seo.md` that you check: record the result there and here.

## Record what you learn (mandatory)

Whenever something surprised you (an error, a workaround, a payload shape you had to discover,
a detour that a future agent would repeat), write it down **in the same change, before your
summary**. Put each learning in exactly one place:

| Kind of learning | Where |
| --- | --- |
| A working payload or multi-step procedure | [recipes.md](recipes.md), as a new or corrected recipe |
| A failure symptom and its fix | The pitfalls table above (link to the recipe) |
| What the MCP can or can't do | `mcp-playbook.md` → capability table |
| A rule that changes how the repo is written | `AGENTS.md` (bump the contract version) and the affected registry |
| A registry fact (class, token, component, field, interaction behavior) | The registry in `docs/webflow/` |
| How Webflow meets an SEO, speed or accessibility requirement (a "to verify" item) | `seo.md` (the requirement's row) and a pitfall here if it needed a workaround |
| An id created in Webflow | `webflow-ids.json` |

Write the fix, not the story: symptom, cause if known, and the exact working call. Only record
what you actually ran and saw work. If an existing entry turned out wrong, correct it in place
instead of adding a second one.
