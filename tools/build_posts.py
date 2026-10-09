#!/usr/bin/env python3
"""Scan blog/posts/*.md and regenerate blog/posts.json.
Front matter (optional) between --- lines: title / date / tags / excerpt.
Without front matter: title = first '# ' heading, date = filename prefix (YYYY-MM-DD),
tags = [], excerpt = first paragraph.
"""
import os, re, json, glob

POSTS_DIR = "blog/posts"
entries = []

for path in sorted(glob.glob(os.path.join(POSTS_DIR, "*.md"))):
    name = os.path.basename(path)
    stem = name[:-3]  # filename without .md, used as slug
    text = open(path, encoding="utf-8").read()

    meta, body = {}, text
    m = re.match(r"^---\s*\r?\n(.*?)\r?\n---\s*\r?\n?", text, re.S)
    if m:
        for line in m.group(1).splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                meta[k.strip()] = v.strip()
        body = text[m.end():]

    title = meta.get("title", "")
    if not title:
        h = re.search(r"^#\s+(.+?)\s*#*\s*$", body, re.M)
        title = h.group(1).strip() if h else stem

    date = meta.get("date", "")
    if not date:
        dm = re.match(r"(\d{4}-\d{2}-\d{2})", stem)
        date = dm.group(1) if dm else "1970-01-01"

    tags = meta.get("tags", [])
    if isinstance(tags, str):
        tags = [t.strip().strip('"').strip("'") for t in tags.strip().strip("[]").split(",") if t.strip()]

    excerpt = meta.get("excerpt", "")
    if not excerpt:
        for line in body.splitlines():
            s = line.strip()
            if s and not s.startswith("#") and not s.startswith("---"):
                s = re.sub(r"[*_`>\[\]()]", "", s).strip()
                if s:
                    excerpt = s[:120]
                    break

    entries.append({
        "slug": stem, "title": title, "date": date,
        "tags": tags, "excerpt": excerpt, "file": f"posts/{name}"
    })

entries.sort(key=lambda e: e["date"], reverse=True)
with open("blog/posts.json", "w", encoding="utf-8") as f:
    json.dump(entries, f, ensure_ascii=False, indent=2)
    f.write("\n")
print(f"posts.json updated: {len(entries)} post(s)")
