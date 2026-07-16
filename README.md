# Flint — Candidates Landing Page

Marketing site for Flint, implemented from the [Figma design](https://www.figma.com/design/bFJIQUAnqKd2ueYqsV8rRd/Flint-Brand--Copy-?node-id=5552-19770) (Candidates page).

## Stack

- [Vite](https://vite.dev) + React 19 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) (design tokens defined in `src/index.css`)
- [Matter.js](https://brm.io/matter-js/) — physics-based avatar gallery in the CTA section
- Fonts: SN Pro (body) and STIX Two Text (headings) via Fontsource

## Getting started

```bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
npm run preview  # preview the production build
```

## Structure

- `src/App.tsx` — page composition
- `src/sections/` — one component per page section (Hero, Stats, HowItWorks, Benefits, Testimonials, Faq, Cta, Footer)
- `src/components/` — shared pieces (`ApplyButton`, `GravityGallery`)
- `public/assets/` — images, icons, and the wordmark exported from Figma

## Notes

- Testimonial cards reveal the written quote on hover (per the component variants in Figma) and the carousel arrows cycle the cards.
- The FAQ is a working accordion; only the first answer came from the design, the rest are placeholder copy to review with the client.
- The "How Flint Works" image slots are empty placeholder panels in the design and are implemented as such.
