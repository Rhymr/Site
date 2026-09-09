#!/usr/bin/env bash
# Rebuild the web preview (demo/app/) from the PaperEditor submodule.
#
#   git submodule update --init demo/paper-editor
#   demo/build.sh
#   git add demo/app && git commit
#
# demo/index.html is a hand-written wrapper (banner + iframe) and is NOT
# touched by this script.
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
sub="$here/paper-editor"
out="$here/app"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

if [ ! -f "$sub/package.json" ]; then
  echo "submodule missing — run: git submodule update --init demo/paper-editor" >&2
  exit 1
fi

( cd "$sub" && npm ci --no-audit --no-fund )
( cd "$sub" && npx vite build --outDir="$tmp" --emptyOutDir )

rm -rf "$out"
mkdir -p "$out"
cp -R "$tmp/." "$out/"
echo "built -> demo/app/ ($(du -sh "$out" | cut -f1))"
