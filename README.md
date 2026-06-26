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

The intended canonical host is `tiyi.io`. To switch from `zzmzm.github.io` to
the apex domain, add a `CNAME` file containing `tiyi.io` and point DNS at
GitHub Pages — only after DNS is ready, otherwise the default URL stops
resolving.
