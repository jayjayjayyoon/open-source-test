# EXP-0005 — youtube-transcript-bridge

**Question:** Can ChatGPT-requested GitHub Actions retrieve a useful caption body for one public YouTube video **without** a user's local setup, paid API, login cookies or direct yt-dlp extraction?

## Role and origin

This is the **current default** for public YouTube video spoken-content retrieval in Open Source Lab. It is **our own small Python adapter**, *not* the yt-dlp upstream project and *not* an official YouTube Data API client. It calls three **third-party hosted free-tier services**; their internal extraction technology and licensing cannot be assumed to be open source.

- Primary: [API Tool Calls public free MCP](https://apitoolcalls.com/transcript/) — explicitly requests Korean `lang=ko`; this returned Korean timestamps for both tested Korean videos
- Fallback 1: [YouTubeToTranscription public JSON API](https://youtubetotranscription.com/) — confirms exact `videoId`, reports caption language, cue count, auto-generated metadata; sometimes returns **English translation** of Korean speech
- Fallback 2: [TranscriptFetch free MCP trial](https://transcriptfetch.com/) — retrieves caption segments; sometimes returns English text for Korean videos

Order is **Korean first**. The script stops on the first usable Korean-text candidate; when only non-Korean providers respond, it marks the fallback as non-Korean. It never silently labels an English caption as Korean.

The script validates a public YouTube URL, refuses unrelated sites and invalid video IDs, checks response text length, emits source/language/timestamp-count/content fingerprint and returns nonzero when all three providers fail. **It does not output raw full captions to public GitHub Actions logs.** A 200 HTTP result or a matching text hash is not proof of perfect original-audio accuracy.

## How to use in ordinary ChatGPT web chat

Ask ChatGPT to test one public YouTube link. The GitHub-linked chat workflow updates **only**
`experiments/run-requests/current.json` with:

```json
{
  "schema_version": 1,
  "request_id": "RUN-EXAMPLE-ONE-OFF",
  "experiments": ["youtube-transcript-bridge"],
  "mode": "public-url",
  "public_url": "https://www.youtube.com/watch?v=qEVZ7AgB7zI"
}
```

A GitHub Actions push trigger then calls `scripts/run-requested-source-probes.py` which installs `requests`, checks the Python script offline and performs a single-video public URL request. Read `SELECTED_RESULT` or `PROBE_FAILED` in the job log. This file in a public repository and the Actions logs are **public**. Do not supply login, cookies, API keys, private video IDs, or full copyrighted transcripts.

There is also a manual workflow under Actions: **Manual Public Content Probe** → `youtube-transcript-bridge` (now the default) → `public-url`.

For a paraphrased **ChatGPT video summary**, the returned **full** caption text must be read through a separately permissioned/private workflow or user-provided transcript; the public metadata-only run cannot itself supply complete speech text to ChatGPT. The existing private results archive holds earlier bounded transcript evidence. Work to unify the private/full-text path remains separate, and private Actions logs are subject to retention policies.

## Evidence and limits

- Proven prior to the split: legacy EXP-0003 RUN-05 through RUN-08 exercised these three provider endpoints on two user-given public videos. That comparison motivated creating this independent experiment. These historical RUN IDs retain their original identity in EXP-0003.
- New EXP-0005 evidence is recorded *only after* its own real execution in `Private-archive/results/EXP-0005-youtube-transcript-bridge/result.md`.
- Anonymous hosted free endpoints have shared rate limits and may disappear or change behavior; they are not unlimited free resources.
- Auto-generated subtitles can omit quoted English speech or mistranscribe numbers/names. Compare with user-supplied video transcript or original audio for high-stakes claims; citation of narration is not proof of the underlying research.
- yt-dlp's broad audio/video downloader remains intact as **EXP-0003**, with failure on the tested GitHub-hosted runner preserved. Do not delete or rename it into this service.

**Adoption:** operational default for small, explicitly user-requested one-video public transcript probes; still experimental, not production-ready.
