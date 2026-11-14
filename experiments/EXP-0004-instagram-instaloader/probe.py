#!/usr/bin/env python3
"""Single-public-post Instagram metadata smoke test; no login or media."""
import argparse
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlsplit


def parse_public_post_url(url: str) -> tuple[str, str]:
    url = url.strip()
    if not url or len(url) > 800:
        raise ValueError("Provide one short, public Instagram post or Reel URL.")
    parts = urlsplit(url)
    if parts.scheme != "https" or parts.username or parts.password:
        raise ValueError("Only HTTPS public Instagram URLs are allowed.")
    if (parts.hostname or "").lower() not in {"instagram.com", "www.instagram.com"}:
        raise ValueError("The URL must be on instagram.com.")
    segments = [segment for segment in parts.path.split("/") if segment]
    if len(segments) != 2 or segments[0] not in {"p", "reel", "tv"}:
        raise ValueError("Use a single public /p/, /reel/ or /tv/ URL.")
    if not re.fullmatch(r"[A-Za-z0-9_-]{3,40}", segments[1]):
        raise ValueError("Invalid Instagram post shortcode.")
    return segments[0], segments[1]


def offline_check() -> None:
    assert parse_public_post_url("https://www.instagram.com/reel/AbC123xyz/") == ("reel", "AbC123xyz")
    assert parse_public_post_url("https://instagram.com/p/AbC123xyz/?igsh=xyz") == ("p", "AbC123xyz")
    for bad in ["https://other.example/reel/AbC123xyz",
                "https://www.instagram.com/some_profile/",
                "http://www.instagram.com/p/AbC123xyz/"]:
        try:
            parse_public_post_url(bad)
        except ValueError:
            continue
        raise AssertionError(f"Unexpected accepted URL: {bad}")
    print("offline-check=passed (URL validation; no live website access)")


def probe(url: str) -> dict:
    from instaloader import Instaloader, Post, __version__ as package_version

    kind, shortcode = parse_public_post_url(url)
    loader = Instaloader(
        download_pictures=False,
        download_videos=False,
        download_video_thumbnails=False,
        download_comments=False,
        download_geotags=False,
        save_metadata=False,
        compress_json=False,
        max_connection_attempts=1,
        request_timeout=20,
        iphone_support=False,
    )
    post = Post.from_shortcode(loader.context, shortcode)
    caption = post.caption or ""
    return {
        "experiment": "EXP-0004",
        "status": "metadata-fetched",
        "instaloader_version": package_version,
        "url": f"https://www.instagram.com/{kind}/{shortcode}/",
        "shortcode": shortcode,
        "author": post.owner_username,
        "published_at_utc": post.date_utc.isoformat(),
        "is_video": bool(post.is_video),
        "caption_length": len(caption),
        "caption_preview": caption[:120],
        "caption": caption,
        "note": "No login, media files, comments or private posts are fetched by this probe.",
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("url", nargs="?", help="One public Instagram post/Reel URL (HTTPS)")
    parser.add_argument("--self-test", action="store_true", help="Offline input validation only")
    parser.add_argument("--output", help="Optional local full JSON output file (do not commit)")
    args = parser.parse_args()
    if args.self_test:
        offline_check()
        return 0
    if not args.url:
        parser.error("Provide one public post URL, or use --self-test.")
    try:
        result = probe(args.url)
        # Public GitHub Actions logs contain only a short excerpt, never a full caption.
        preview = {key: val for key, val in result.items() if key != "caption"}
        print(json.dumps(preview, ensure_ascii=False, indent=2))
        if args.output:
            destination = Path(args.output)
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            print(f"local-result={destination}")
        return 0
    except Exception as exc:
        print(f"probe-failed: {type(exc).__name__}: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
