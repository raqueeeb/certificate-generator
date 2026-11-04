# Certivo — Digital Certificate Generator UI

> 📘 **Case study:** [raqueeb.dev/projects/certificate-generator](https://raqueeb.dev/projects/certificate-generator) — architecture, stack and implementation notes.

AAT-1 · Full Stack Web Development · HTML + CSS + JavaScript (no frameworks)

A digital certificate generator wrapped in an e-commerce flow. The "products" are
**certificate templates**, and the star feature is a **live generator** on the
landing page: type a recipient's name, pick a template, and the certificate
re-renders instantly — then print it full-page on A4 landscape.

The certificate itself is one reusable component whose layout is done entirely
with **alignment, spacing, borders and dimensions** — exactly what the problem
statement asks for.

## How to run

1. Extract the folder anywhere on your computer.
2. Double-click `index.html` (or right-click → Open with → your browser).
3. No server or installation needed. Internet is only used for Google Fonts;
   everything else works fully offline.

## Folder structure

```
certificate-generator/
├── index.html      → Landing page + live certificate generator
├── products.html   → Product display page (8 templates, filterable)
├── cart.html       → Shopping cart view page
├── payment.html    → Payment page with full form validation
├── css/
│   └── style.css   → One shared stylesheet (tokens + certificate themes)
└── js/
    └── script.js   → One shared script (generator, cart, validation)
```

## How each guideline is covered

- **HTML, CSS, JavaScript only** — no libraries or frameworks anywhere.
- **Responsive** — Grid/Flexbox with media queries at 1020px, 820px and 620px;
  hamburger menu on mobile; the certificate rescales fluidly using `clamp()`.
- **Navigation between all pages** — shared sticky navbar (with a live cart
  badge) plus footer links connect all four pages.
- **Form validation on the Payment page** — JavaScript regex validation for
  name, email, 10-digit mobile, address, city, 6-digit PIN, card name,
  16-digit card number (auto-spaced), MM/YY expiry (rejects past dates) and
  3-digit CVV, with inline errors and a success modal + order ID.
- **Box-model certificate interface** — the `.cert` component (section 12 of
  `style.css`): an outer border, an inner frame positioned with `inset`,
  padding for breathing room, a fixed `aspect-ratio: 1.414/1` (A4 landscape),
  and **four different border-style values** across the themes: `double`
  (Classic, Ivory), `solid` (Royal, Minimal, Blush), `groove` (Emerald),
  `dashed`/`dotted` (Tech, Playful).

## The clever bits (great viva material)

- **em-based scaling** — every measurement inside `.cert` is in `em`, so one
  component renders at three sizes just by changing the container font-size:
  `cert-lg` (generator), `cert-md` (hero), `cert-sm` (product thumbnails).
- **Pure-CSS gold seal** — a radial gradient, an inset ring (`::before`) and a
  star character. No image files in the whole project.
- **Print / Save as PDF** — `window.print()` plus an `@media print` block that
  hides everything except `#printArea`, and `@page { size: A4 landscape }`.
- **Safe live preview** — user input is escaped with a tiny `esc()` helper
  before being injected via `innerHTML`.
- **Cart in localStorage** — key `certivo_cart` as `{ templateId: quantity }`,
  which is why it survives page navigation; paying clears it.
- **Event delegation** — one click listener on the grid keeps working after
  every re-render.

## Easy customisations

- Change the gold: edit `--gold`, `--gold-hi`, `--gold-lo` in `:root`.
- Change the default organisation: `ORG_DEFAULT` in `js/script.js`.
- Add a 9th template: one object in `TEMPLATES` + one `t-yourname { … }`
  theme block in section 12 of the CSS.
- Put your own name/college in the footer.
