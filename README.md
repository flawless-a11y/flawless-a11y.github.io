# Prashant Chauhan — Portfolio

Live at **https://flawless-a11y.github.io** (GitHub Pages, deployed from `main`).

Vanilla HTML / CSS — no build step, no dependencies beyond Google Fonts.

## Editions

| File | What it is |
|------|------------|
| **`index.html`** + `site.css` | ★ The live site. Recruiter-first: content from the résumé, ledger-style figures, light/dark themes, mobile-first. Edit this. |
| `Prashant_Chauhan_Resume.pdf` | The résumé the site links to. Copy the canonical PDF over it whenever the résumé changes. |
| `cinematic.html` + `styles.css` + `script.js` | Earlier v2 edition — Bugatti-inspired, animation-dense. Kept as a lab piece (linked from the footer). |
| `studio.html` + `studio.css` + `studio.js` | Earlier light/minimal edition (cyrillic.digital-inspired). Lab piece. |
| `fusion.html` + `fusion.css` + `fusion.js` | Earlier "Fusion" edition — Architect/Operator duel, pinned gallery, gauge. Lab piece. |
| `banner.html` | Generator for the LinkedIn banner image. |
| `assets/` | Images/video used by the lab editions. |

## Run locally

```bash
python -m http.server 8080 --directory .
# open http://localhost:8080
```

## Editing content

All copy lives in `index.html`. Facts and metrics come from `../RESUME-MAINTENANCE-GUIDE.md` (single source of truth) —
keep the site, the résumé, and LinkedIn saying the same numbers. Theme tokens live at the top of `site.css`.

## Deploy

Push to `main`; GitHub Pages serves the repo root. Nothing to build.
