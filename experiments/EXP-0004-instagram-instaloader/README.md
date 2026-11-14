# EXP-0004 — instagram-instaloader

**Question:** Can the free [Instaloader](https://github.com/instaloader/instaloader) Python package read **one publicly accessible Instagram post or Reel's metadata and caption** without login or media downloads?

**Status:** `source-only` until a recorded run. Upstream README/code reviewed; this repository has not established live Instagram success. Upstream source is **not copied** here; Instaloader is MIT-licensed.

## Zero-cost browser test via GitHub Actions

1. Open **Actions** in this GitHub repository.
2. Select **Manual Public Content Probe (EXP-0003 / EXP-0004)** and click **Run workflow**.
3. Choose `instagram-instaloader` and `install-only` to verify installation and offline URL checks.
4. To attempt access, choose `public-url` and enter a **single public** Instagram `/p/...` or `/reel/...` HTTPS URL.
5. Read the job log: it prints a brief public caption preview, not the full caption/media. Access errors (including 429) must be recorded as failures or limits.

**Public warning:** Workflow inputs and logs are publicly visible. Never use personal, private, unauthorized or sensitive links. This test never asks for a login and does not retrieve comments, private content, or media files. No scheduled run or repeated scraping is configured.

## Optional local PC test

```powershell
py -m pip install instaloader
py experiments/EXP-0004-instagram-instaloader/probe.py --self-test
py experiments/EXP-0004-instagram-instaloader/probe.py "https://www.instagram.com/reel/POST_SHORTCODE/" --output experiments/EXP-0004-instagram-instaloader/outputs/metadata.json
```

Replace `POST_SHORTCODE` with a real public shortcode. Only the **optional local output** contains the complete caption; `outputs/` is gitignored. No media downloading or login takes place.

## Boundaries / next evidence

- Instagram can block anonymous/automated requests. This is an **unofficial** tool; public content does not imply that automated collection is permitted. Follow applicable terms and creators' rights.
- A local success is **not** proof GitHub-hosted Actions will succeed, and vice versa.
- If blocked, do not add account cookies or proxies to GitHub. Stop and record the observed limitation.
- Record the actual attempt as `RUN-01` in the **private** Results repository. No claim of live access until observed.
- GitHub source availability alone does not enable ChatGPT web chat to execute Instaloader.
