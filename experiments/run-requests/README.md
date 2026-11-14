# Chat-requested source probes

This directory contains the **explicit trigger file** for the two independently registered public data experiments:

- EXP-0003 \`youtube-ytdlp\`
- EXP-0004 \`instagram-instaloader\`

After a user asks for a specific test, an authorized GitHub editor may update \`current.json\` on \`main\`. A narrowly scoped **push event** runs \`chat-requested-source-probe.yml\`; no special workflow-dispatch API is needed.

The workflow supports:

- \`mode: "install-only"\` with one or both experiments; installs packages and checks syntax, version and offline URL validation. **Does not contact YouTube or Instagram.**
- \`mode: "public-url"\` with exactly one experiment and one user-approved public HTTPS YouTube video or Instagram post/Reel URL; requests a single metadata response. It may fail if the website blocks the server.

The job prints bounded test results; never claim that \`install-only\` proves live extraction. All files, commit history and GitHub Actions logs are **public**. Do not put private links, personal identifiers, session cookies, secrets, unreviewed full media or personal data in the trigger. This workflow must not accept unauthorized content or implement automatic scraping schedules.

Edit \`current.json\` only upon user request; changing unrelated code must not initiate new collection. Each attempt gets a distinct RUN ID, and evidence belongs in the existing private Results process when there is an actual observed run. Updating this trigger is not a substitute for direct real-time ChatGPT-to-MCP access.
