# Test stage summary (phases 0–2)

Moved out of [`roadmap.md`](../roadmap.md) on 2026-09-30. The rest of the test stage records are in [`test-site/`](test-site/README.md).

## What it produced

- **Contract and tooling:** `AGENTS.md` (v1.4), the registries, the `flint-webflow-sync` skill with
  recipes and pitfalls, and the sync scripts (`webflow-css.mjs`, `webflow-style-actions.mjs`,
  `webflow-diff.mjs`, `webflow-markup.mjs`, `webflow-upload*.mjs`).
- **Foundations:** every token in `tokens.md` and every class in `classes.md`, with parity proven by
  `webflow-diff.mjs`. Legacy Tailwind reads the tokens (`@theme reference`). Style guide page `/style-guide`.
- **MVP 1** (a vertical slice, since superseded by the homepage and the registries): Nav, Footer, Text Panel, Stats Band, Post Grid (Related) bound to the CMS
  (Categories, Authors, Posts), and the first interactions.
- **MVP 2**: the full homepage at 1:1 parity with the legacy home (`/legacy`): Hero (Home), Logo
  Marquee, Two Ways, Partners Map, How It Works (Home), Feature Grid, Testimonials (Slider), Post
  Grid (Home), CTA (Art), plus `UI / Button`, `UI / Service Card` and `UI / Testimonial Card`.
- **Spikes**: blur reveal, marquee, arc, ticker, carousels and staggered reveals proven
  native in IX3 (S1–S6), verified on a published test-site page.

## What the MVP proved about the MCP

| # | Question | Answer |
| --- | --- | --- |
| Q1 | Can variables, tag styles, breakpoint styles and states be created headlessly? | **Mostly.** Variables, classes, combos, breakpoint and state styles: yes, linked to variables. Tag styles and Body styles: no, so typography and body defaults live on classes. Compound values (gradients, shadows) store literals, not variables |
| Q2 | Can component props and variants be created and bound headlessly? | **Yes.** Components from elements, props, prop bindings, variants and variant styles all work without the Designer |
| Q3 | Can a Collection List with `UI / Post Card` bindings be built through the MCP? | **Yes, as page markup.** The MCP can't put a bound Collection List inside a component (the Designer can: `Global / Featured post`, built by the user 2026-09-30), so the Post Grid is a page pattern. The canvas needs a reload to show CMS data created during the session, and hides draft items |
| Q4 | Can the interactions be created by class, with reduced motion respected? | **Yes.** Reversing doesn't undo a class toggle, so states that return are pairs (`ix-nav-pill` / `-rest`, `ix-nav-menu` / `-close`). Class-toggle reveals need `skip-to-end` for reduced motion |
| Q5 | Does the Webflow page match the React preview at the four breakpoints? | **Yes, after small fixes** found in the user's reviews and pulled back into the repo |
| Q6 | Is a second sync idempotent? | **No for creates, yes for updates.** Re-creating a name adds `-2` or is dropped. Query first and keep the ids file current |
| Q7 | Which contract rules were wrong or missing? | Fixed in contract v1.1–v1.4 and the registries |
