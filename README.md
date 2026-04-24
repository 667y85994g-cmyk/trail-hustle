# Trail Hustle — Teaser Site

A scroll-driven teaser site. Phase 1 deliverable: put the ethos into the world and see what resonates. This is not a product page. It does not sell. It invites.

See the parent [`../README.md`](../README.md) — the brand operating brief — for all brand decisions (tone, lexicon, colour, type, positioning, the public/internal boundary). This file does not restate them.

## The hard rule — public voice only

Trail Hustle runs on a dual register. This site is the public face. It never uses internal operating language: *doctrine, admissions, rejection, consequences, capacity framework, transfer mechanism,* tier names (*Applicant Track, The Training Ground, The Edge*), pricing numbers, membership logic.

If a sentence could appear in the business case, it does not belong here. See parent brief Section 15 for the explicit boundary.

## Scope — six sections, one quiet scroll

One page. Scroll-driven. Cinematic-but-restrained — the site feels *considered*, not *algorithmic*.

1. **Hero** — the window + topography draw-in. The one line: *"This is where the hustle meets the horizon."*
2. **Ethos reveal** — pinned, line-by-line. The ethos (Section 2 of the brief): *"Trail Hustle is where people come to find out what they're capable of, in the company of others asking the same."*
3. **Three pillars** — Drive, Depth, Discovery. Each word lands, then its paragraph.
4. **Horizon moment** — *"Built, not granted."* A breath. A held frame.
5. **Waitlist CTA** — *"Stay close."* Email field. No promises of what comes next, no product language.
6. **Footer** — Instagram link, waitlist link, minimal meta. The window mark, small.

## What this site is not

- Not a landing page with features, pricing, or a product pitch.
- Not a manifesto. Short moments beat long paragraphs.
- Not heavy with imagery — topography + type carry it.
- Not loud. No secondary-palette colour unless a moment earns it.

## Feel — what we're protecting

- **Scroll pacing is the product here.** Every section's scroll budget is tuned by hand. If anything feels rushed, extend the timeline. If anything drags, shorten it.
- **One asset, used well.** `topography-hero-band.svg` from `/brand/svg/` is the signature. Recolour via CSS, crop, reposition — do not introduce new topography variants.
- **Type carries the weight.** Cal Sans for display, Inter for everything you read. No third face.
- **Paper background.** `#F7F5F1`. Ink `#111111`. Muted `#5A5650`. Earth tones reached for, secondaries rarely.

## Tech

- **Astro** — zero-JS by default, islands for animated sections.
- **Tailwind CSS** — brand colours as theme tokens (`th-black`, `th-white`, `th-sandstone`, `th-burnt-ochre`, `th-clay-red`, `th-forest-green`, `th-sun-dried-yellow`, `th-ocean-slate`, plus the six secondaries). Paper / ink / muted as semantic tokens.
- **GSAP + ScrollTrigger** — the scroll timelines.
- **Lenis** — smooth scroll, so pinning feels like a breath, not a jolt.

## Where things live

```
site/
├── README.md                 ← this file
├── public/
│   └── fonts/                ← CalSans-Regular.ttf (copied from /brand/Fonts/)
└── src/
    ├── layouts/
    │   └── Layout.astro      ← base layout: paper bg, Inter default, Lenis init
    ├── pages/
    │   └── index.astro       ← the single-page scroll
    ├── components/           ← Hero, Ethos, Pillars, Horizon, Waitlist, Footer
    └── styles/
        └── global.css        ← @font-face, CSS custom props, Tailwind layers
```

## Running locally

From `/site/`:

```
npm install      # first time only
npm run dev      # preview at http://localhost:4321
```

## Building the site — the prompt series

The seven-prompt series that builds this site lives in [`../prompts/`](../prompts/). Each prompt is one focused task. Do not combine them. Review the scroll pacing after each before moving on.
