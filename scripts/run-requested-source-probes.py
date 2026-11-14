#!/usr/bin/env python3
"""Execute one reviewed, public, opt-in GitHub Actions source probe request.

This file runs only after an explicitly committed request. It never handles cookies,
credentials, private content, media downloads, or background scheduling.
"""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REQUEST = ROOT / "experiments" / "run-requests" / "current.json"
PROBES = {
    "youtube-ytdlp": {
        "file": ROOT / "experiments" / "EXP-0003-youtube-ytdlp" / "probe.py",
        "package": "yt-dlp[default]",
        "version": [sys.executable, "-m", "yt_dlp", "--version"],
    },
    "instagram-instaloader": {
        "file": ROOT / "experiments" / "EXP-0004-instagram-instaloader" / "probe.py",
        "package": "instaloader",
        "version": [sys.executable, "-m", "instaloader", "--version"],
    },
}


def exec_step(label: str, args: list[str]) -> None:
    print(f"::group::{label}", flush=True)
    try:
        subprocess.run(args, cwd=ROOT, check=True, timeout=180)
    finally:
        print("::endgroup::", flush=True)


def main() -> int:
    request = json.loads(REQUEST.read_text(encoding="utf-8"))
    if set(request) != {"schema_version", "request_id", "experiments", "mode", "public_url"}:
        raise ValueError("Unexpected request fields.")
    if request["schema_version"] != 1 or not isinstance(request["request_id"], str):
        raise ValueError("Invalid request version/id.")
    if not (request["request_id"].startswith("RUN-") and len(request["request_id"]) <= 100):
        raise ValueError("Invalid request ID.")
    experiments = request["experiments"]
    if not isinstance(experiments, list) or not experiments or len(experiments) != len(set(experiments)):
        raise ValueError("Experiments must be a nonempty unique list.")
    if any(exp not in PROBES for exp in experiments):
        raise ValueError("Unknown experiment.")
    mode = request["mode"]
    url = request["public_url"]
    if mode not in {"install-only", "public-url"}:
        raise ValueError("Unknown mode.")
    if mode == "install-only":
        if url is not None:
            raise ValueError("install-only must not provide a URL.")
    else:
        if len(experiments) != 1 or not isinstance(url, str):
            raise ValueError("public-url requires exactly one experiment and one URL.")
        # Local scripts also validate allowed HTTPS hosts and public post/video paths.
        if len(url) > 800 or not url.startswith("https://"):
            raise ValueError("Invalid URL.")
    print(f"Request {request['request_id']} | mode={mode} | experiments={experiments}", flush=True)
    for exp in experiments:
        probe = PROBES[exp]
        exec_step(f"{exp}: compile", [sys.executable, "-m", "py_compile", str(probe["file"])])
        exec_step(f"{exp}: dependency install", [
            sys.executable, "-m", "pip", "install", "--disable-pip-version-check", probe["package"]])
        exec_step(f"{exp}: version", probe["version"])
        exec_step(f"{exp}: offline input check", [sys.executable, str(probe["file"]), "--self-test"])
        if mode == "public-url":
            exec_step(f"{exp}: one public URL", [sys.executable, str(probe["file"]), url])
    print("All requested checks completed. Offline checks are NOT proof of live website access.", flush=True)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (ValueError, RuntimeError, subprocess.CalledProcessError, subprocess.TimeoutExpired) as exc:
        print(f"REQUEST FAILED: {type(exc).__name__}: {exc}", file=sys.stderr)
        raise SystemExit(1)
