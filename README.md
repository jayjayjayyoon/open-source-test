# Control Tower — public UI experiment

This repository is a **public interface prototype**, not a personal project database. It does **not** collect ChatGPT conversations, calendar, email, or private files.

## Pages

- [Control Tower home](https://jayjayjayyoon.github.io/open-source-test/): sample daily checklist, project overview and a collapsible left menu for Project / AI / Agent / Data / Daily Brief / Archive.
- [Relationship Lab](https://jayjayjayyoon.github.io/open-source-test/relationship-lab.html): typed relationship and two-step exploration experiment.
- [Scale Lab](https://jayjayjayyoon.github.io/open-source-test/scale-lab.html): synthetic 50/200/1,000-node performance and navigation experiment.

The Project section includes Home, Project Map, Validation Board and Experiment Guide. Its navigation is controlled from the shared left sidebar; embedded links change the same active menu state. Project Map and Validation Board retain in-memory state while switching sections, but reload resets the Validation Board. The Home sample checklist is different: only sample task IDs are stored in this browser's localStorage, scoped to the current Korea date, and reset after the date changes. Tasks disappear when completed; all-complete displays an optional recommended demo experiment. Links go to the corresponding screen. Neither checklist is real personal progress.

PC/mobile buttons at the bottom-right preview layout independently of the device viewport. In mobile preview, the sidebar opens with the menu button and each section can be expanded or collapsed. Scale and Relationship Labs remain separate pages.

## Data safety and current readiness

The Data section displays **actual integration readiness**, not fictitious progress numbers. Conversation ingestion, a private source store and live synchronization are not configured. `src/publicDataContract.js` defines minimal fields (`id`, `type`, `title`, `status`, `sourceRef`, `verifiedAt`, `visibility`). Validation alone never authorizes publication: explicit public approval, a public source and verification are all required. No private export or personal records are included here. A newly requested ChatGPT export must be handled in a separate, approved private environment before any data is considered for public use.

AI / Agent, Daily Brief and Archive are navigation placeholders, not operational integrations. The original 11-node Project Map is a demo rather than verified current project status.

## Development and verification

Requires Node.js 22:

```bash
npm install
npm test
npm run build
npm run test:ui
npm run dev
```

`npm test` checks data, task state and publication gates. `npm run test:ui` starts the built-site preview and tests real navigation, task completion and mobile layout in headless Google Chrome (or Linux Chromium). GitHub Actions requires these checks to pass before deploying Pages. Browser smoke coverage is focused; it does not establish comprehensive usability or verify third-party integrations.

## Rollback

Snapshot taken before the navigation audit changes: [`backup/pre-navigation-audit-fixes-20260922`](https://github.com/jayjayjayyoon/open-source-test/tree/backup/pre-navigation-audit-fixes-20260922), commit [`465e1c6`](https://github.com/jayjayjayyoon/open-source-test/commit/465e1c6df72e5df33e096ec282e760832cac800d). If the revised demo is not useful, restore that snapshot by a new revert commit or a reviewed rollback; do not force-push over unrelated later changes.

The repository is public: never add private messages, credentials, tokens, real calendar entries or raw ChatGPT exports.
