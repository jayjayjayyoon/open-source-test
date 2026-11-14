# EXP-0003 — free hosted transcript retrieval check

Purpose: for the exact user-supplied public YouTube video ID `76js2AphU5g`, test access to **actual captions**, not only title/channel.

**Do not confuse an HTTP 200 response or marketing page with a validated video transcript.**

Test methods (one bounded request each):

- [TranscriptFetch free MCP trial](https://transcriptfetch.com/blog/youtube-transcript-api-no-key) — documented public `get_transcript` JSON-RPC example; daily limits apply.
- [API Tool Calls free transcript MCP](https://apitoolcalls.com/transcript/) — documented public `get_transcript`; 20 calls/day/IP shared.
- [YouTubeToTranscription free JSON API](https://youtubetotranscription.com/) — documented `/api/transcript?v=VIDEO_ID`, 30/hr/IP.
- [Prepublish public transcript pages](https://prepublish.ai/youtube-transcript) — page-level access only, not necessarily cached for this ID.
- [2outube free transcript web page](https://2outube.com/youtube-transcript) — one new video/day; may require browser verification.
- [WithTranscript cached transcript page](https://www.withtranscript.ai/youtube-transcript) — existing public library pages without account; uncached videos require free account.

These are **third-party hosted services**, not fully self-hosted open-source software. A free allowance is not a permanent service guarantee. The request contains only the public video ID, no login credentials, scraping circumvention, proxy, account cookie, purchased service, downloaded media, or private information.

Execution via the existing GitHub Actions run-request JSON: `mode: hosted-free-transcripts`. The script prints only bounded response status, title/segments and distributed short excerpts for evidence; it does not publish or save a full third-party transcript.

**Evidence status:** source preparation only, until an actual run. Real results go in the designated private `Private-archive` RUN records.
