# Open Source Lab — Experiment Registry

**Purpose:** a compact public index of **independent experiments**, not a list of every installed library, a task tracker, or proof of operational success. The existing Control Tower UI and GPT-Bridge source are kept in place.

## Stable identity and naming

- Allocate one **permanent** `EXP-0001`, `EXP-0002`, ... per clearly scoped experiment **when there is a specific question to test**, not when merely bookmarking an interesting tool. Discovery ideas and next actions stay in the existing Notion project/task owner.
- Use one immutable, lower-case `kebab-case` slug. Display as `EXP-0002 — gpt-bridge`. Do not recycle an ID after failure, cancellation or retirement; keep the row and evidence. If a name truly must change, document the mapping and review links instead of quietly renaming.
- For **new** runnable projects, prefer `experiments/EXP-0003-short-slug/` with a separate environment/lockfile where applicable. **Do not rename** existing `experiments/GPT-Bridge/` or UI code. Prefer upstream URL + a minimal experiment harness over copying an entire third-party repository.
- One product/UI suite can have child cases like `EXP-0001/UI-01`; these are not extra open-source products. Repeating the *same test question* uses `RUN-01`, `RUN-02` in its private result record; a new independent comparison or question may deserve a new EXP ID.
- This Markdown table is the **one and only ID/slug authority**. Private results **reuse** IDs but do not allocate them. Lab index = public technical inventory; private Results = detailed run evidence; Notion = live work status and actions. Do not synchronize or replicate each other's state as a separate ledger.
- Before **merging** a branch with a new ID, inspect the latest `main` and other pending experiment PRs, resolve simultaneous reservations and rerun validation. Unmerged branches do not reserve an ID globally.

**Next EXP ID: `EXP-0003`** (derived from the highest registered ID; change it together with the newly added row).

## Registered experiments

| ID | Slug | Kind | Local source | Original / upstream | Evidence level | Verified limit / unknown |
|---|---|---|---|---|---|---|
| EXP-0001 | `control-tower-ui` | `ui-suite` | [current UI code](../src/ControlTowerShell.jsx) | [this repository](https://github.com/jayjayjayyoon/open-source-test) | `bounded-check` | 2026-09-25 Pages CI recorded success for sample UI. No current real-person project data; live site not independently revisited in this review |
| EXP-0002 | `gpt-bridge` | `developer-tool` | [bundled extension source](GPT-Bridge/README.kr.md) | [DreamURL/GPT-Bridge](https://github.com/DreamURL/GPT-Bridge) is named in bundled instructions; exact source revision and license evidence **unverified** | `source-only` | Source snapshot present; user's PC installation, MCP tunnel and end-to-end tool tests **not verified** |

Evidence level concerns **technical observations**, not Notion task status:
- `source-only` — source/link exists, no directly supported run.
- `bounded-check` — some explicitly scoped CI or local checks exist, but not a full product validation.
- `run-recorded` — one or more actual runs have documented dated evidence in the private Results repo; **not** synonymous with passed or production-ready.

Do not upgrade a level on the basis of an upstream README, an unrelated CI check, or a proposed test plan. If a run fails or is inconclusive, keep its observed failure and decision in Results; never rewrite it as a success.

### EXP-0001 — UI cases (one parent experiment)

| Case ID | Existing public demo | Test subject |
|---|---|---|
| EXP-0001/UI-01 | [Control Tower demo](https://jayjayjayyoon.github.io/open-source-test/) | Home, sample checklist, project map, navigation and board |
| EXP-0001/UI-02 | [Relationship Lab](https://jayjayjayyoon.github.io/open-source-test/relationship-lab.html) | Typed relationship and linked-item navigation |
| EXP-0001/UI-03 | [Scale Lab](https://jayjayjayyoon.github.io/open-source-test/scale-lab.html) | Synthetic 50/200/1,000-node exploration |

## Minimal workflow for the next 100 experiments

1. **Before allocating:** check the table for the same upstream URL, name/alias, goal, or existing child case. Is this a new independent experiment, a new child case or just a later run?
2. **Register on a working branch:** add the next ID, stable slug, exact source/upstream link, honest evidence level and limitations. A project with no local code may link to its original public source; **registration is not execution**.
3. **Review safety before installing or copying:** source provenance, commit/tag, license and obligations, maintenance/security signals, permissions, install scripts, dependency risks, secrets and public/private boundary. Do not run unknown source automatically in GitHub Pages CI or on a credential-bearing machine. Isolate each tool's environment.
4. **Test proportionately:** for a quick install or small feature, one simple observed run can suffice. For comparison, security-sensitive capability, performance or repeated use, record conditions, metrics and counterexamples in more detail. Keep source version and environment so another run can be compared fairly.
5. **Record observed runs privately:** `results/EXP-000N-slug/result.md` in the designated private results repo, with `RUN-01` and later `RUN-02` etc. The archive template distinguishes observed facts, failures, unknowns and reuse decisions. Do not link its private evidence from this public table.
6. **Close the loop:** an adoption decision may reference the result from Notion without copying the evidence into a task card. If not useful, retain the permanent ID and stop rather than generating unnecessary documentation or automations.

**Build isolation:** the root `npm test` checks only the public UI's root `tests/*.test.mjs` files. A new experiment has its own setup/tests that run explicitly, with no automatic coupling to the public site. Do not add experiments to the root package's `workspaces` or Vite imports by default. Do not put third-party installers in the existing Pages deploy workflow.

**Publication/size:** never commit private chats, credentials, identifying personal data, sensitive traces, full unreviewed third-party source, large models or datasets. Public GitHub content is visible; private GitHub is not a secrets vault or guaranteed backup.

### Design references (adapted, not required tooling)

- [MLflow: experiment → run → parameters/metrics/artifacts](https://mlflow.org/docs/latest/tracking/)
- [Reproducible Builds: record source/environment/instructions](https://reproducible-builds.org/docs/definition/)
- [OpenSSF Scorecard: upstream supply-chain/security checks](https://github.com/ossf/scorecard/blob/main/docs/checks.md)
- [GitHub: licensing a repository](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)
- [GitHub: large-file and repository-size guidance](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github)

No MLflow, DVC, npm workspace, database, external sync or new Project board is required for this small personal lab.
