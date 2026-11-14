#!/usr/bin/env python3
"""Single-public-video YouTube metadata smoke test; no media or cookies."""
import argparse
import json
import re
import sys
from pathlib import Path
from urllib.parse import parse_qs, urlsplit


def validate_url(url: str) -> str:
    url = url.strip()
    if not url or len(url) > 800:
        raise ValueError("Provide one short, public YouTube video URL.")
    parts = urlsplit(url)
    if parts.scheme != "https" or parts.username or parts.password:
        raise ValueError("Only HTTPS public YouTube URLs are allowed.")
    host = (parts.hostname or "").lower()
    path = [p for p in parts.path.split("/") if p]
    video_id = None
    if host == "youtu.be" and len(path) == 1:
        video_id = path[0]
    elif host in {"youtube.com", "www.youtube.com", "m.youtube.com"}:
        if path == ["watch"]:
            video_id = parse_qs(parts.query).get("v", [None])[0]
        elif len(path) == 2 and path[0] in {"shorts", "live"}:
            video_id = path[1]
    if not video_id or not re.fullmatch(r"[A-Za-z0-9_-]{6,32}", video_id):
        raise ValueError("Use a single YouTube watch, Shorts, live or youtu.be link.")
    return url


def offline_check() -> None:
    assert validate_url("https://www.youtube.com/watch?v=BaW_jenozKc")
    assert validate_url("https://youtu.be/BaW_jenozKc")
    for bad in ["https://example.org/watch?v=BaW_jenozKc",
                "https://youtube.com/playlist?list=XYZ",
                "http://youtu.be/BaW_jenozKc"]:
        try:
            validate_url(bad)
        except ValueError:
            continue
        raise AssertionError(f"Unexpected accepted URL: {bad}")
    print("offline-check=passed (URL validation; no live website access)")


def probe(url: str) -> dict:
    from yt_dlp import YoutubeDL
    from yt_dlp.version import __version__ as package_version

    with YoutubeDL({
        "quiet": True,
        "no_warnings": True,
        "noplaylist": True,
        "skip_download": True,
        "cachedir": False,
        "socket_timeout": 20,
        "retries": 0,
        "extractor_retries": 0,
        "fragment_retries": 0,
        "ignoreerrors": False,
    }) as ydl:
        info = ydl.extract_info(validate_url(url), download=False)
    if not isinstance(info, dict) or info.get("_type") == "playlist":
        raise RuntimeError("A single public video was not returned.")
    return {
        "experiment": "EXP-0003",
        "status": "metadata-fetched",
        "yt_dlp_version": package_version,
        "id": info.get("id"),
        "title": info.get("title"),
        "channel": info.get("channel") or info.get("uploader"),
        "duration_seconds": info.get("duration"),
        "upload_date": info.get("upload_date"),
        "url": info.get("webpage_url") or url,
        "manual_subtitle_languages": sorted((info.get("subtitles") or {}).keys()),
        "automatic_subtitle_languages": sorted((info.get("automatic_captions") or {}).keys()),
        "note": "Availability of subtitle tracks is not proof they were downloaded.",
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("url", nargs="?", help="One public YouTube video URL (HTTPS)")
    parser.add_argument("--self-test", action="store_true", help="Offline input validation only")
    parser.add_argument("--output", help="Optional local JSON output file (do not commit)")
    args = parser.parse_args()
    if args.self_test:
        offline_check()
        return 0
    if not args.url:
        parser.error("Provide one video URL, or use --self-test.")
    try:
        result = probe(args.url)
        data = json.dumps(result, ensure_ascii=False, indent=2)
        print(data)
        if args.output:
            destination = Path(args.output)
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_text(data + "\n", encoding="utf-8")
            print(f"local-result={destination}")
        return 0
    except Exception as exc:
        print(f"probe-failed: {type(exc).__name__}: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
