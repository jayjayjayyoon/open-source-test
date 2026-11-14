# EXP-0003 — youtube-ytdlp

**Question:** Can the free [yt-dlp](https://github.com/yt-dlp/yt-dlp) Python package retrieve **one public YouTube video's metadata and available subtitle language list**, without login, media downloads, or paid APIs?

**Status:** `source-only` until a recorded run. Upstream README/code reviewed; this repository has not established live YouTube success. Upstream source is **not copied** here. The upstream repository uses Unlicense for source code; distributed binaries can carry other licenses.

## Zero-cost browser test via GitHub Actions

1. Open this repository's **Actions** tab.
2. Select **Manual Public Content Probe (EXP-0003 / EXP-0004)** and **Run workflow**.
3. Choose `youtube-ytdlp` and `install-only` first; no URL is needed.
4. Check the job log for dependency installation, version output and `offline-check=passed`. **That does not prove YouTube extraction succeeds.**
5. Run again with `public-url` and **one public HTTPS YouTube video URL**. Read the JSON in the job log. A failure remains a failed test—do not interpret it as success.

**The repository and Actions logs are public.** Never enter a private/unlisted link, session cookie, password, access token or other identifying details. No login, comments, downloads or periodic polling is configured. `workflow_dispatch` is manual only.

## Optional local PC test

Python 3.11+ is recommended. For current YouTube support, yt-dlp also recommends a JavaScript runtime (e.g. Deno), and the `yt-dlp-ejs` dependency.

```powershell
py -m pip install "yt-dlp[default]"
py experiments/EXP-0003-youtube-ytdlp/probe.py --self-test
py experiments/EXP-0003-youtube-ytdlp/probe.py "https://www.youtube.com/watch?v=VIDEO_ID" --output experiments/EXP-0003-youtube-ytdlp/outputs/metadata.json
```

Replace `VIDEO_ID` with a real public video ID. `outputs/` is ignored by Git. By default the script prints a small metadata JSON report only and does **not** download video, audio or full transcripts. Subtitle lists are **availability signals, not actual captions**.

For a *separate local-only* subtitle test with a video you have the right to process, see yt-dlp's [subtitle options](https://github.com/yt-dlp/yt-dlp#subtitle-options).

## Boundaries / next evidence

- A successful offline check validates the URL filter, **not** access to YouTube.
- Actual video retrieval may fail due to YouTube login, token, geographic, network or anti-automation restrictions; GitHub-hosted runner results may differ from local PC results.
- Record first real run as `RUN-01` in the designated **private** Results repository, with date, sanitized error, yt-dlp version, environment and pass/fail. Do not put full downloaded media or unreviewed transcripts in this public repository.
- No ChatGPT web chat direct invocation is configured: GitHub Actions is a separate execution system.
