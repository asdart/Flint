# Test site archive (read-only)

Records of the **test** Webflow site used in the test stage (roadmap phases 0–2, closed
2026-09-25; archived 2026-09-28). It proved the contract and the MCP recipes; what it taught lives
on in the [`flint-webflow-sync`](../../../../.agents/skills/flint-webflow-sync/SKILL.md) skill,
[`mcp-playbook.md`](../../mcp-playbook.md) and the roadmap's "What the MVP proved" section.
Nothing here is a sync target: production is populated from scratch from the repo (roadmap track P).

| File | What it was |
| --- | --- |
| `webflow-ids.json` | Ids of everything created on the test site (site `6ab46032460da07da9dc6231`, `flint-4167fa.webflow.io`, workspace `paulos-workspace-442e65`) |
| `sync-log.md` | Every MCP sync to the test site, 2026-09-23 → 2026-09-27 |
| `mvp2-home.md` | The MVP 2 homepage plan and measurements |
| `mvp2-assets.json` | The legacy homepage assets uploaded in MVP 2 (still PNG; the repo now uses WebP) |

The test site still exists in the Webflow workspace, with the `/mvp` page and the `width-header`
variable left over. Deleting it or anything in it is the user's call (`AGENTS.md` rule 12).
