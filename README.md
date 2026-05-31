# Prashant Chauhan — Portfolio

A single-page portfolio site. Aesthetic direction: **"precision engineering as haute couture"** —
a cinematic, dark, editorial-luxury homage to Bugatti (bugatti.com), adapted for a backend
software engineer. Engineering achievements are presented like hypercar **performance figures**.

Built from scratch — **vanilla HTML / CSS / JS**, no build step, no frameworks, no dependencies.

## Run it locally

The site is already designed to be served over `localhost`.

```bash
# from this folder:
python3 -m http.server 8080
# then open:
#   http://localhost:8080
```

Or, with the absolute path from anywhere:

```bash
python3 -m http.server 8080 --directory "/Users/prashant.chauhan/Desktop/resume/portfolio"
```

(You can also just double-click `index.html` to open it via `file://`, but a local server is recommended.)

To stop the server: `Ctrl-C` in the terminal running it.

## What's inside

| File | Purpose |
|------|---------|
| `index.html` | Markup & content (pulled from the résumé + LinkedIn) |
| `styles.css` | All styling, the palette/typography system, and the animation/keyframe definitions |
| `script.js`  | Preloader, custom cursor, scroll-progress, reveal engine, counters, parallax, particle-network hero canvas, magnetic buttons, card tilt, rotating tagline, timeline fill |

## Design notes

- **Type:** Cormorant Garamond (display serif) + Hanken Grotesk (body) + JetBrains Mono (telemetry/labels) — via Google Fonts.
- **Palette:** midnight navy base, electric-blue (`#2F5DFF`) + champagne-gold (`#C9A769`) accents, platinum text.
- **Motion:** scroll-reveal animations **re-fire on scroll in *and* out** (IntersectionObserver toggling `.in-view`); animated counters; parallax; a live particle-network canvas in the hero; magnetic buttons; subtle 3D card tilt.
- **Accessibility:** respects `prefers-reduced-motion` (disables motion, shows content) and falls back to a normal cursor on touch devices.
- **Responsive:** fluid `clamp()` typography; grids collapse on tablet/mobile; a burger menu under 720px.

## Editing content

All copy lives in `index.html`. To update a metric or a project, edit the relevant
`section` / `.build` / `.tele` block. Animated numbers are driven by `data-to`,
`data-dec`, and `data-suffix` on `.counter` spans.

---
Inspired by the pursuit of performance.
