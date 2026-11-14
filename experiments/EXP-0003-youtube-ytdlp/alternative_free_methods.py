#!/usr/bin/env python3
"""Compare free/no-login approaches for ONE public YouTube video.

No cookies, login, tokens, proxies, media downloads, or bulk scraping.
Each method runs once in its own process with a short timeout.
"""
import argparse
import html
import json
import re
import subprocess
import sys
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen

VIDEO_ID_RE = re.compile(r"^[A-Za-z0-9_-]{11}$")
METHODS = [
    "youtube-oembed",
    "noembed",
    "watch-page",
    "privacy-enhanced-embed",
    "public-thumbnail",
    "youtube-transcript-api",
    "pytubefix",
]
HEADERS = {"User-Agent": "OpenSourceLab-ResearchCheck/1.0 (single public video)"}


def read_url(url: str, limit: int = 250_000):
    req = Request(url, headers=HEADERS)
    with urlopen(req, timeout=15) as response:
        code = response.status
        content_type = response.headers.get("Content-Type", "")
        raw = response.read(limit + 1)
    if len(raw) > limit:
        return code, content_type, raw[:limit], True
    return code, content_type, raw, False


def probe_oembed(video_id: str, host: str):
    video_url = f"https://www.youtube.com/watch?v={video_id}"
    if host == "youtube-oembed":
        url = "https://www.youtube.com/oembed?" + urlencode({"url": video_url, "format": "json"})
    else:
        url = "https://noembed.com/embed?" + urlencode({"url": video_url})
    code, content_type, raw, _ = read_url(url, 100_000)
    data = json.loads(raw.decode("utf-8", errors="replace"))
    title = data.get("title")
    author = data.get("author_name")
    if not title or not author:
        return {"status": "failed", "http_status": code,
                "reason": str(data.get("error") or "no title/author fields")[:220]}
    return {"status": "partial-success", "http_status": code, "title": title,
            "channel": author, "has_thumbnail": bool(data.get("thumbnail_url")),
            "transcript": False, "note": "Only embed metadata, not full description/captions."}


def probe_html(video_id: str, host: str):
    if host == "watch-page":
        url = f"https://www.youtube.com/watch?v={video_id}"
    else:
        url = f"https://www.youtube-nocookie.com/embed/{video_id}"
    code, content_type, raw, truncated = read_url(url, 400_000)
    body = raw.decode("utf-8", errors="replace")
    if "Sign in to confirm you're not a bot" in body or "Sign in to confirm you’re not a bot" in body:
        return {"status": "blocked", "http_status": code, "reason": "YouTube bot sign-in gate"}
    m = re.search(r'<meta\s+property="og:title"\s+content="([^"]+)"', body, re.I)
    if not m:
        m = re.search(r'<meta\s+content="([^"]+)"\s+property="og:title"', body, re.I)
    if m and m.group(1) not in {"YouTube", "YouTube video player"}:
        return {"status": "partial-success", "http_status": code,
                "title": html.unescape(m.group(1)), "transcript": False,
                "note": "Page meta title only; content/body not validated."}
    return {"status": "not-useful", "http_status": code, "body_bytes_read": len(raw),
            "truncated": truncated, "reason": "No video-specific OG title found."}


def probe_thumbnail(video_id: str):
    url = f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"
    code, content_type, raw, truncated = read_url(url, 256_000)
    is_image = content_type.startswith("image/") and raw[:3] == b"\xff\xd8\xff"
    return {"status": "partial-success" if is_image else "failed",
            "http_status": code, "content_type": content_type,
            "image_bytes_read": len(raw), "has_thumbnail": is_image,
            "transcript": False,
            "note": "Thumbnail endpoint alone cannot confirm access to video/audio/description."}


def probe_transcript(video_id: str):
    from youtube_transcript_api import YouTubeTranscriptApi
    try:
        transcript = YouTubeTranscriptApi().fetch(video_id)
    except Exception as exc:
        return {"status": "blocked-or-unavailable", "exception": type(exc).__name__,
                "reason": str(exc).strip().replace("\n", " ")[:220]}
    items = list(transcript)
    return {"status": "success" if items else "empty", "segments": len(items),
            "language": getattr(transcript, "language_code", None),
            "transcript": bool(items),
            "note": "Transcript availability confirmed, content intentionally not printed."}


def probe_pytubefix(video_id: str):
    from pytubefix import YouTube
    try:
        obj = YouTube(f"https://www.youtube.com/watch?v={video_id}")
        title, channel = obj.title, obj.author
        if not title:
            return {"status": "failed", "reason": "no video title"}
        return {"status": "partial-success", "title": title, "channel": channel,
                "transcript": False,
                "note": "Read video metadata only; caption download not attempted."}
    except Exception as exc:
        return {"status": "blocked-or-unavailable", "exception": type(exc).__name__,
                "reason": str(exc).strip().replace("\n", " ")[:220]}


def single(method: str, video_id: str):
    if method in {"youtube-oembed", "noembed"}:
        return probe_oembed(video_id, method)
    if method in {"watch-page", "privacy-enhanced-embed"}:
        return probe_html(video_id, method)
    if method == "public-thumbnail":
        return probe_thumbnail(video_id)
    if method == "youtube-transcript-api":
        return probe_transcript(video_id)
    if method == "pytubefix":
        return probe_pytubefix(video_id)
    raise ValueError("Unknown method")


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--video-id", required=True)
    p.add_argument("--single", choices=METHODS)
    args = p.parse_args()
    if not VIDEO_ID_RE.fullmatch(args.video_id):
        raise SystemExit("Invalid public YouTube video ID")
    if args.single:
        try:
            result = single(args.single, args.video_id)
        except (HTTPError, URLError, TimeoutError, ValueError, OSError) as exc:
            result = {"status": "failed", "exception": type(exc).__name__,
                      "reason": str(exc).strip().replace("\n", " ")[:220]}
        except Exception as exc:
            result = {"status": "failed", "exception": type(exc).__name__,
                      "reason": str(exc).strip().replace("\n", " ")[:220]}
        print(json.dumps({"method": args.single, **result}, ensure_ascii=False, sort_keys=True))
        return 0

    results = []
    for method in METHODS:
        command = [sys.executable, __file__, "--video-id", args.video_id, "--single", method]
        try:
            process = subprocess.run(command, capture_output=True, text=True, timeout=30, check=False)
            lines = [line for line in process.stdout.splitlines() if line.lstrip().startswith('{') and '"method"' in line]
            result = json.loads(lines[-1]) if lines else {
                "method": method, "status": "failed",
                "reason": ("child exit: " + str(process.returncode))}
        except subprocess.TimeoutExpired:
            result = {"method": method, "status": "timeout", "reason": "30 second per-method timeout"}
        except (json.JSONDecodeError, ValueError) as exc:
            result = {"method": method, "status": "failed", "reason": type(exc).__name__}
        results.append(result)
        print("METHOD_RESULT " + json.dumps(result, ensure_ascii=False, sort_keys=True), flush=True)
    print("SUMMARY_JSON " + json.dumps({
        "experiment": "EXP-0003", "video_id": args.video_id, "results": results,
        "note": "No API key, cookies, proxy or paid service; one public URL per approach.",
    }, ensure_ascii=False, sort_keys=True), flush=True)


if __name__ == "__main__":
    main()
