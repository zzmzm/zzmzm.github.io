# zzmzm.github.io — Tiyi website (GitHub Pages user site)

This repo is the **published, static deploy mirror** of the Tiyi marketing +
docs site. It is a GitHub Pages **user site**, served at the root domain:

- https://zzmzm.github.io/

> **This is not the authoring source.** The canonical source of truth is
> `website/` inside the private Tiyi monorepo. Edit the site there, then
> resync into this repo and push. Do not hand-edit pages here.

## How it is published

Pure static HTML/CSS/JS — no build step. Per the GitHub Pages quickstart, this
is a user site (`<username>.github.io`): Pages is configured to **deploy from a
branch**, using the `main` branch at the repository root (`/`). A `.nojekyll`
marker disables Jekyll so every file is served verbatim. Because the site is
served from the domain root and uses only relative links, every page and asset
resolves correctly.

## Resync from the canonical source

From the machine that holds the monorepo:

```sh
# 1. mirror the authoring tree into this repo (delete removed files)
rsync -a --delete \
  --exclude '.git/' --exclude '.nojekyll' --exclude '.gitignore' \
  /waf/tiyi/website/ /waf/zzmzm.github.io/

# 2. commit + push
cd /waf/zzmzm.github.io
git add -A
git commit -m "sync website from monorepo"
git push
```

GitHub Pages redeploys automatically on push (usually within a minute, up to
~10 minutes per GitHub's docs).

## Custom domain

The site is served at **https://www.tiyisec.com/**. The custom domain relies on
two things that must agree:

1. **DNS** — a `CNAME` record for `www.tiyisec.com` pointing at
   `zzmzm.github.io`.
2. **`CNAME` file** — contains `www.tiyisec.com` and now ships from the
   authoring source (`website/CNAME`), so the resync above keeps it in place.
   The resync's `--delete` only excludes `.git/`, `.nojekyll`, and `.gitignore`,
   so a `CNAME` living only here would be wiped on the next sync — keeping it in
   `website/` is what makes it durable.

If the custom domain was set through the repo's Pages settings, GitHub commits
the same `CNAME` file for you; `git pull` before the next resync so histories
don't diverge.
