# Rhymr — product site

One static page that sells the macOS build of [Rhymr](https://github.com/Rhymr/win-mac)
and points at the open source. No build step, no framework — `index.html` plus a
local `assets/` folder.

## Deploy

Drop the whole folder at your web root. Works as-is on Netlify, Cloudflare Pages,
GitHub Pages, S3, or `python3 -m http.server` for a local look.

The only external request is the **Archivo** webfont from Google Fonts. Everything
else — JetBrains Mono, the NetIcons, the screenshot — is served from `assets/`.

## Before going live — two edits

Both are flagged in `index.html` with an uppercase `REPLACE:` / `VERSION:` comment.

1. **Checkout link.** Every "Buy" / "Get Rhymr" button points at the placeholder
   `https://rhymr.gumroad.com/l/rhymr`. Search `index.html` for `REPLACE: CHECKOUT_URL`
   (three occurrences: hero, top bar target is `#pricing`, pricing card) and swap
   in your real Gumroad / Lemon Squeezy / Stripe / Polar URL.

2. **Version label.** Search for `VERSION:` — one `<span class="badge">` in the top
   bar reads `2026.1 · beta`. Update it on each cut. The specs table near the
   bottom repeats the version once more.

## What's where

| path | source |
|---|---|
| `assets/showcase.png` | `rhymr-win-mac/assets/github/showcase.png` |
| `assets/rhymr-icon.png` | app icon — favicon and wordmark mark |
| `assets/fonts/JetBrainsMono-*.woff2` | `rhymr-win-mac/assets/fonts/webfonts/` |
| `assets/icons/*.svg` | JetBrains **NetIcons** (Apache-2.0), colour variants, from the [`Rhymr/NetIcons`](https://github.com/Rhymr/NetIcons) mirror and the copy bundled in the app |

## Design notes

- Colours are Rhymr's own: the Darcula / IntelliJ-Light `PALETTE` from
  `src/css.rs` and the 24-hue rhyme palette from `src/rhyme/highlight.rs`. The
  site and the app are meant to read as one product.
- Dark-first in spirit; the page follows the visitor's OS theme and the sun/moon
  button in the top bar overrides it (stored in `localStorage`, key `rhymr-theme`).
- The hero editor pane is live HTML, not an image — the rhyme colours fade in on
  load. The real screenshot is further down.
- Type: **Archivo** for display/UI, **JetBrains Mono** (Rhymr's editor font) for
  labels, data and the demo.

## Attribution / trademarks

The footer carries the required notices: NetIcons © JetBrains s.r.o. under
Apache 2.0, JetBrains Mono under SIL OFL 1.1, and a disclaimer that the
JetBrains-inspired design implies no affiliation or endorsement. Keep them.
