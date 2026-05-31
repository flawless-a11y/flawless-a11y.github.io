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
- **Motion (v2 — cinematic):**
  - Per-character hero title reveal (staggered rise/rotate) + mouse-tilt parallax + orbital ring
  - **Horizontal pinned "Signature Builds" gallery** — cards scroll sideways as you scroll down
  - **SVG tachometer gauge** that revs (gradient arc + needle sweep) on scroll
  - Text-**scramble/decode** on the rotating tagline
  - Side **section-rail** with active indicator; **per-section accent shift** (background glow changes per section)
  - **Scroll-velocity marquee** (skews/drifts with scroll speed)
  - Animated **counters** (with a subtle rev/overshoot), parallax, a live **particle-network** hero canvas
  - **Aura cursor** + magnetic buttons + 3D card tilt; animated preloader
  - All scroll-reveals **re-fire on scroll in *and* out** (IntersectionObserver toggling `.in-view`)
- **Accessibility:** respects `prefers-reduced-motion` (disables motion, shows content) and falls back to a normal cursor on touch devices.
- **Responsive:** fluid `clamp()` typography; grids collapse on tablet/mobile; a burger menu under 720px.

## Editing content

All copy lives in `index.html`. To update a metric or a project, edit the relevant
`section` / `.build` / `.tele` block. Animated numbers are driven by `data-to`,
`data-dec`, and `data-suffix` on `.counter` spans.

---
Inspired by the pursuit of performance.
