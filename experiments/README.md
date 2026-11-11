# Open Source Lab — Experiment Registry

**Status:** canonical experiment ID/name index for this public repository. This is an inventory, **not** proof that a tool works or a live project/task dashboard.

## Naming and numbering rules

- Give every **independent experiment** one permanent ID: `EXP-0001`, `EXP-0002`, ... (`EXP-9999` max for this format). Use the next number shown below. Never recycle IDs, even when an experiment is stopped; keep its row with a truthful state.
- Give it one lowercase `kebab-case` slug (ASCII letters, digits, hyphens): e.g. `gpt-bridge`. An experiment's canonical display key is `EXP-0002 — gpt-bridge`.
- For **new experiments only**, prefer `experiments/EXP-0003-short-name/`. Existing source paths stay where they are; this registry maps the old path without moving or copying code.
- One app with several UI pages is **one experiment** with subcases such as `EXP-0001/UI-01`; pages are not automatically separate open-source projects.
- A retest of the same goal/tool keeps its experiment ID. Give evidence runs `RUN-01`, `RUN-02` in the result record. A genuinely new goal or independently evaluated product gets the next experiment ID.
- Record the actual upstream repository, exact version/commit, license, platform, steps, observed result and limitations **when verified**. Source code present, existing CI passed, desktop install, live-site operation and full validation are distinct claims.
- The index is the **only ID/name registry**. A private result record uses the same ID, but is not another numbering authority. The Notion project/task owner is separate; merely listing an experiment here does not activate a task.
- This is a **public** repository. Never put private chat exports, personal records, API keys, credentials, confidential logs, or private result links in it. Respect third-party code licenses before copying or redistributing source.

**Next EXP ID: `EXP-0003`**

## Registered experiments

| ID | Slug | Category | Existing source entry | Verified scope / limit | Private result |
|---|---|---|---|---|---|
| EXP-0001 | `control-tower-ui` | `ui-suite` | [public UI source](../src/ControlTowerShell.jsx) | Three public UI pages; 2026-09-25 Pages build/browser workflow passed. Not a live personal dashboard; current live availability not separately rechecked | No signed-off experiment result recorded |
| EXP-0002 | `gpt-bridge` | `developer-tool` | [GPT-Bridge source](GPT-Bridge/README.kr.md) | VS Code MCP extension source exists. Current user-PC installation, end-to-end connection and independent test pass **not verified** | No signed-off experiment result recorded |

### EXP-0001 — UI subcases (not new independent EXP IDs)

| Subcase ID | Existing page | Purpose |
|---|---|---|
| EXP-0001/UI-01 | [Control Tower demo](https://jayjayjayyoon.github.io/open-source-test/) | Home, sample checklist, project map, navigation and board |
| EXP-0001/UI-02 | [Relationship Lab](https://jayjayjayyoon.github.io/open-source-test/relationship-lab.html) | Linked-item/typed-relationship navigation |
| EXP-0001/UI-03 | [Scale Lab](https://jayjayjayyoon.github.io/open-source-test/scale-lab.html) | Synthetic 50/200/1,000-node exploration |

## How to add the next experiment

1. **Before assigning**, search this table by upstream project name/URL and slug to prevent duplicate identities. Decide whether this is a new experiment, an `UI-` subcase, or a `RUN-` retest.
2. Reserve the next ID by adding **one row**. Set the code entry to a path that really exists; if there is no code yet, link to an existing source/reference and explicitly state the experiment is planned. Never invent a successful run.
3. For new code, use the suggested `experiments/EXP-000N-slug/` directory and keep its build/dependencies isolated from the public Vite/Pages app. Do not copy an entire upstream project by default.
4. When results have been **actually tested and evidenced**, store the detailed record privately under `results/EXP-000N-slug/result.md` in the separately designated results repository. Link the public source from that record, not vice versa. Keep the public registry's verification wording evidence-bounded.
5. Increase **Next EXP ID** exactly once for the next registration; do not renumber existing entries. The repository's `npm test` suite checks ID uniqueness, slug format, next number and referenced source paths.

**Storage division:** this public repo = runnable experiments and public ID registry; the user-designated private results repo = verified test evidence and reuse decisions; Notion = project status and next actions. No automatic synchronization is claimed.
