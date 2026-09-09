# Rhymr — product site

Sells the macOS build of [Rhymr](https://github.com/Rhymr/WinMac) and points at
the open source. `index.html` is a static page — no build step, no framework.
Two sibling pieces have their own tooling:

| path | what |
|---|---|
| `index.html`, `thanks.html`, `assets/` | the static site — zip and drop at a web root |
| `version.json` | the version string the site reads at runtime (see below) |
| `server/` | Stripe Checkout backend — see `server/README.md` |
| `demo/` | the `/demo/` web preview (PaperEditor submodule + built `app/`) — see `demo/README.md` |

## Deploy

**GitHub Pages** is wired up: `.github/workflows/pages.yml` publishes on every
push to `main` — <https://rhymr.github.io/Site/>. The workflow assembles a clean
`_site` (drops `server/`, the `demo/paper-editor` submodule source, `CLAUDE.md`)
and adds `.nojekyll`; `demo/app/` ships as-is. Every internal link is relative,
so it works both under the `/Site/` project path and at the root of a custom
domain (add a `CNAME` file and set it in repo settings).

Anywhere else — Netlify, Cloudflare Pages, S3, or `python3 -m http.server` for a
local look — just drop `index.html`, `thanks.html`, `version.json`, `assets/` and
`demo/` at the web root. **Zero external requests:** Archivo and JetBrains Mono
are self-hosted, NetIcons and the screenshot are in `assets/`. The `/demo/`
preview must be served over HTTP (its ES-module bundle won't run from `file://`).

## Before going live

1. **Checkout.** Buy buttons carry `data-checkout`; an inline script (search
   `CHECKOUT_API` at the bottom of `index.html`) POSTs to the `server/` Stripe
   service and follows the returned URL. Set `CHECKOUT_API` to that service's
   public origin. Until it's set, the buttons scroll to `#pricing`.

2. **Version.** `version.json` is the single source of truth:

   ```json
   { "version": "0.76.0+build.131.ga432101", "versionShort": "v0.76.0", "channel": "beta" }
   ```

   The page fetches it on load and fills every `[data-rhymr-version]` (full
   string, in the specs table), `[data-rhymr-version-short]` (the top-bar badge)
   and `[data-rhymr-channel]`. The values hard-coded in the HTML are only the
   fallback if the fetch fails. Update `version.json` on each cut — e.g. a
   release step running `Build/version.sh` from the app repo and writing its
   output here.

## What's where

| path | source |
|---|---|
| `assets/showcase.png` | `rhymr-win-mac/assets/github/showcase.png` |
| `assets/rhymr-icon.png` | app icon — favicon and wordmark mark |
| `assets/fonts/JetBrainsMono-*.woff2` | `rhymr-win-mac/assets/fonts/webfonts/` |
| `assets/fonts/Archivo-*.woff2` | Google Fonts (variable, SIL OFL 1.1), self-hosted |
| `assets/icons/*.svg` | JetBrains **NetIcons** (Apache-2.0), colour variants, from [`Rhymr/NetIcons`](https://github.com/Rhymr/NetIcons) |

## Design notes

- Colours are Rhymr's own: the Darcula / IntelliJ-Light `PALETTE` from
  `src/css.rs` and the 24-hue rhyme palette from `src/rhyme/highlight.rs`.
- Dark-first in spirit; the page follows the visitor's OS theme and the top-bar
  button overrides it (`localStorage` key `rhymr-theme`).
- Hero is copy-only; the real macOS screenshot sits under it, then the 24-hue
  rhyme rule divides it from the feature list.
- Type: **Archivo** for display/UI, **JetBrains Mono** (Rhymr's editor font) for
  labels, data, eyebrows.

## Attribution / trademarks

The footer carries the required notices: NetIcons © JetBrains s.r.o. under
Apache 2.0, JetBrains Mono under SIL OFL 1.1, and a disclaimer that the
JetBrains-inspired design implies no affiliation or endorsement. Keep them.
