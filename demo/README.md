# demo/ — the web preview

Served at `/demo/` on the site.

| path | what | committed? |
|---|---|---|
| `index.html` | hand-written wrapper: disclaimer banner + `<iframe>` | yes, edit by hand |
| `app/` | built PaperEditor (Vite, `base=/demo/app/`) | yes (built artefact) |
| `paper-editor/` | submodule → `github.com/Rhymr/PaperEditor` (source) | submodule pointer |
| `build.sh` | rebuilds `app/` from the submodule | yes |

## Rebuild after the submodule moves

```bash
git submodule update --init demo/paper-editor
demo/build.sh
git add demo/app demo/paper-editor
git commit -m "demo: rebuild web preview"
```

`app/` is a build output checked into git on purpose — the site is a
static drop with no CI. It's ~9 MB (a bundled CMU pronouncing dictionary +
CodeMirror); regenerate it rather than hand-editing.

## Framing

This is deliberately **not** the macOS app: rhyme colouring, syllable
gutter and Datamuse rhyme search only — no projects, version control,
themes, or offline pronunciation. The banner in `index.html` says so and
links back to `/#pricing`. Restyling it to match the win-mac look is a
later job (edit the submodule, then `build.sh`).
