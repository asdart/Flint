# Handoff: reconcile phases 5 and 6 (2026-10-13)

Written while you slept. The reconcile plan is finished (`reconcile.md` → "Phases 5 and 6 done"). Nothing was written to or read
from Webflow, nothing was committed. Build passes, lint has only its 3 old warnings, `node --test scripts/test-reconcile.mjs`
passes (23 tests, 3 new `gate:` tests).

## Decisions I took, and why

- **New script `scripts/webflow-gate.mjs`** (logic in `scripts/reconcile/gate.mjs`) instead of a flag on the snapshot script: the snapshot
  script knows one dump, not a base. `--plan` prints the reads a gate needs; `--compose` builds a complete dump from them plus the base's
  raw dump. Everything downstream (reconcile, refresh, rebuild) is unchanged.
- **A gate costs 11 calls when nothing moved, about 20 after a page edit and publish, not 8.** The old figure left out the two
  end-of-dump checks (needed to detect an edit during the dump) and component meta. Still far from 58.
- **A full dump is demanded** when there is no base, the base's raw dump folder is gone or changed, or a partial refresh is pending
  (its raw dump no longer equals the base). Keep the folder named in `manifest.json → dump` when you clear `.cache/`.
- **Refresh at the end of a sync is a full rebuild** (`--rebuild --yes --commit HEAD`, then `webflow-map.mjs`) from a dump taken after the
  last write and the commit, after running the reconcile on it once so anyone else's edit is shown to you before it is absorbed.
- **Publish stays step 8 in AGENTS.md §7**; the refresh went into step 7, so no number moved. `/safe-publish` is a plugin skill and is
  untouched: the gate runs before it, in our docs.
- **I left `src/` alone**, including the Style guide sentence that cites "roadmap D-66" (should be D-67) and says "four" fields
  (the page shows three): changing it would make `src/` differ from the base. It is on the to-do list.
- **Contract 1.14, D-66** recorded (roadmap index row, full text in `archive/decisions.md`), `components.md` Style guide row now
  describes the real (partial) Webflow page.

## What went wrong

- Nothing blocked. One test bug (my JSON plan dropped `moved.pages` because of a too-broad replacer) was fixed before finishing.
- The reconcile has had one real run (0 rows). The apply path has only been tested on synthetic edits.

## Open items

1. ~~**Site instruction `rules/flint-contract.md`** on Webflow still says contract 1.13.~~ **Done 2026-10-13:** updated to 1.14 (version 9).
2. `variantStyles` and the site instruction are still missing from the dump; the check that fails a sync writing an unlisted
   variant-style triple is not built.
3. A partial dump misses an asset or font edit that moves no site timestamp (a full dump finds it).
4. The Style guide page is marked `unaligned`, so its element differences are not listed.

## Your to-do, in order

1. Read `.agents/skills/flint-reconcile/SKILL.md` (the "Run a reconcile", "Gate" and "Refresh" sections) and `AGENTS.md` 1.14; say if the
   gate rule is too strict (it stops every sync write on a PULL or CONFLICT row).
2. Triage the drift list from `docs/webflow/reconcile/2026-10-13.md` (summary):
   (Done 2026-10-13, see the sync-log row and the report's Follow-up: items 1-6 resolved; carousel attributes removed.)
   1. Footer links "For nurses" / "For facilities": repo stale (`Footer.tsx:11-12`), Webflow has `/candidates` and `/facility-partners`: pull into the repo.
   2. Webinars: Webflow has `/#webinars` and the Home section `id="webinars"`; the repo has `#` and no id: pull into the repo.
   3. 45 stale IX3 carousel attributes on Webflow (`data-tm-slide` x21, `data-how-*` x12, `data-dot-*` x12): remove at a sync (rule 12: confirm).
   4. Newsletter Form message `role="status"` / `role="alert"` missing on Webflow: set in the Designer (MCP can't).
   5. Quote Card photo `draggable="false"` missing on Webflow: `set_attributes` at the next sync.
   6. `UI / Input Field` template has no `autocomplete="email"`: minor.
3. ~~Next Webflow stage: update the site instruction (`search_instructions`, then `update_instruction`: one line for 1.14), and fix the
   Style guide sentence (D-66 to D-67, "four" to three fields) in repo and Webflow together.~~ Done 2026-10-13.
4. Designer: set Image width / height (rule 15) on the new chevron image; confirm the Select Field options (not readable through the
   MCP); delete the scratch Form Select on the Style guide if still there; set the Style guide to noindex.
5. When you want it committed, say so: the scripts, skills, docs and the report `docs/webflow/reconcile/2026-10-13.md` (+ `.summary.md`) go in.
