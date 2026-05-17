# Viajes GMP — Website

Production-ready marketing website for **Viajes GMP**, a Mexico-based travel agency targeting US and Canadian travelers. Built with Astro 6, Tailwind CSS v4, and static output ready for Netlify.

---

## Stack

| Technology | Purpose |
|---|---|
| [Astro 6](https://astro.build) | Static site framework |
| [Tailwind CSS v4](https://tailwindcss.com) | Utility-first CSS via Vite plugin |
| [@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/) | Auto-generated XML sitemap |
| Netlify Forms | Quote form submissions (zero backend) |
| Google Fonts | Fraunces (headings) + Inter (body) |

---

## Local development

```bash
# Install dependencies
npm install

# Start dev server at http://localhost:4321
npm run dev

# Production build (output: ./dist/)
npm run build

# Preview production build locally
npm run preview
```

---

## Project structure

```
viajes-gmp/
├── public/
│   ├── favicon.svg            # SVG logomark favicon
│   ├── robots.txt             # SEO crawler rules
│   └── images/                # Add real destination photos here
│       ├── dest-cancun.jpg
│       ├── dest-loscabos.jpg
│       ├── dest-oaxaca.jpg
│       ├── dest-mexicocity.jpg
│       ├── dest-sanmiguel.jpg
│       ├── dest-valle.jpg
│       └── og-default.jpg     # 1200×630 Open Graph fallback image
├── src/
│   ├── config/
│   │   └── business.ts        # ← CENTRAL CONFIG — edit all variables here
│   ├── styles/
│   │   └── global.css         # Global styles, design tokens, utilities
│   ├── layouts/
│   │   └── Layout.astro       # Root HTML layout with header/footer
│   ├── components/
│   │   ├── Header.astro       # Sticky nav with mobile drawer
│   │   ├── Footer.astro       # Full footer with links and contact
│   │   ├── SEO.astro          # Meta, OG, Twitter Card tags
│   │   ├── JsonLD.astro       # JSON-LD structured data injector
│   │   ├── TrustBar.astro     # 4-column trust signals bar
│   │   ├── QuoteForm.astro    # Netlify-wired quote request form
│   │   ├── FAQ.astro          # Accessible accordion FAQ component
│   │   ├── CTABand.astro      # Reusable call-to-action section
│   │   └── Breadcrumbs.astro  # Schema.org breadcrumb nav
│   └── pages/
│       ├── index.astro
│       ├── mexico-vacation-packages/index.astro
│       ├── cancun-riviera-maya-vacation-packages/index.astro
│       ├── los-cabos-vacation-packages/index.astro
│       ├── oaxaca-cultural-tours-day-of-the-dead/index.astro
│       ├── mexico-family-vacations/index.astro
│       ├── mexico-group-travel/index.astro
│       ├── destination-weddings-mexico/index.astro
│       ├── about/index.astro
│       ├── contact/index.astro
│       ├── privacy-policy/index.astro
│       └── terms-and-conditions/index.astro
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

---

## Content configuration

**All business details live in one file:** `src/config/business.ts`

Edit this file to update contact info, social links, and URLs across the entire site simultaneously.

```ts
// src/config/business.ts
export const business = {
  name: "Viajes GMP",
  tagline: "Travel Mexico with local experts",
  url: "https://viajesgmp.com",

  phone: "[PHONE]",              // ← Replace
  email: "[EMAIL]",              // ← Replace
  whatsappUrl: "[WHATSAPP_URL]", // ← Replace with wa.me/... link
  addressOrServiceArea: "[BUSINESS_ADDRESS_OR_SERVICE_AREA]", // ← Replace

  googleReviewsUrl: "[GOOGLE_REVIEWS_URL]",
  instagramUrl: "[INSTAGRAM_URL]",
  facebookUrl: "[FACEBOOK_URL]",
  tiktokUrl: "[TIKTOK_URL]",
  youtubeUrl: "[YOUTUBE_URL]",

  businessLicense: "[BUSINESS_LICENSE_OR_REGISTRATION]",
  paymentMethods: "[PAYMENT_METHODS]",
  cancellationPolicyUrl: "[CANCELLATION_POLICY_URL]",
};
```

Social links only render in the footer when the value is not a `[PLACEHOLDER]`.

---

## Netlify deployment

### One-click deploy

1. Push this repository to GitHub (or any Git provider).
2. Connect to Netlify → New site from Git.
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Click Deploy.

### Forms

The quote form is pre-wired for **Netlify Forms**:

- Form name: `trip-quote-request`
- Detection attribute: `data-netlify="true"`
- Hidden field: `<input name="form-name" value="trip-quote-request" />`
- Honeypot: `netlify-honeypot="bot-field"`

After deploying to Netlify, go to **Site → Forms** in the Netlify dashboard to see submissions. You can configure email notifications and integrations from there.

### Environment variables

No environment variables are required for the default Netlify setup. If you add integrations (CRM, analytics, email provider), add keys via **Netlify → Site settings → Environment variables**.

### Custom domain

Set your domain in **Netlify → Domain management** and update `site` in `astro.config.mjs`:

```js
export default defineConfig({
  site: 'https://viajesgmp.com', // ← Must match your live domain for sitemap to work
  ...
});
```

### Switching form providers

If you want to use a different form backend (Formspree, Basin, HubSpot, Airtable, custom API), all form logic is in `src/components/QuoteForm.astro`. The `fetch` call in the `<script>` block can be redirected to any endpoint. The form fields are framework-agnostic HTML.

---

## Images

Destination card images are referenced from `/public/images/`:

| Filename | Used for |
|---|---|
| `dest-cancun.jpg` | Cancún & Riviera Maya card |
| `dest-loscabos.jpg` | Los Cabos card |
| `dest-oaxaca.jpg` | Oaxaca card |
| `dest-mexicocity.jpg` | Mexico City card |
| `dest-sanmiguel.jpg` | San Miguel de Allende card |
| `dest-valle.jpg` | Valle de Guadalupe card |
| `og-default.jpg` | Open Graph fallback (1200×630px) |

Cards display a colored gradient fallback if the image file is missing. Replace these files with real licensed travel photography before launch.

---

## SEO

- Every page has a unique `<title>` and `<meta name="description">`.
- Open Graph tags on all pages.
- Canonical URLs automatically generated from `site` config.
- `sitemap-index.xml` auto-generated by `@astrojs/sitemap`.
- `robots.txt` in `/public/`.
- JSON-LD `TravelAgency` schema on the home page.
- JSON-LD `FAQPage` schema on pages with FAQ sections.
- Breadcrumb schema on all inner pages.
- After deploying: submit `https://viajesgmp.com/sitemap-index.xml` to Google Search Console.

---

## Pre-launch checklist

### Required before going live

- [ ] Replace `[PHONE]` in `src/config/business.ts`
- [ ] Replace `[EMAIL]` in `src/config/business.ts`
- [ ] Replace `[WHATSAPP_URL]` with a valid `https://wa.me/...` link
- [ ] Replace `[BUSINESS_ADDRESS_OR_SERVICE_AREA]` with actual address or service area description
- [ ] Replace `[GOOGLE_REVIEWS_URL]` with your Google Business profile link
- [ ] Replace `[INSTAGRAM_URL]`, `[FACEBOOK_URL]`, `[TIKTOK_URL]`, `[YOUTUBE_URL]` with real social URLs (or delete unused ones)
- [ ] Add real destination photos to `public/images/`
- [ ] Add an `og-default.jpg` Open Graph image (1200×630px)
- [ ] Review and replace Privacy Policy placeholder text (have a legal professional review)
- [ ] Review and replace Terms and Conditions placeholder text (have a legal professional review)
- [ ] Set `[PAYMENT_METHODS]`, `[CANCELLATION_POLICY_URL]`, `[BUSINESS_LICENSE_OR_REGISTRATION]`
- [ ] Replace `[DATE]` on Privacy Policy and Terms pages with actual dates
- [ ] Remove `⚠️ Review before publishing` notices from Privacy Policy and Terms pages

### Team page

- [ ] Replace placeholder role descriptions for Pedro Hernández, Desiree Juárez and Micaela Peñaloza with accurate job titles
- [ ] Add real team member photos (replace the avatar initials)

### Reviews and pricing

- [ ] Add real traveler reviews or remove the review section on the home page
- [ ] Confirm all sample prices in `mexico-vacation-packages` are current and accurate, or remove them
- [ ] Replace `[Replace this answer with the actual response-time promise before publishing]` in FAQ

### Technical

- [ ] Deploy to Netlify and confirm quote form submissions appear in Netlify → Forms dashboard
- [ ] Test all WhatsApp CTA links open the correct number
- [ ] Test quote form: submit a test entry and confirm it arrives
- [ ] Check mobile navigation at 375px, 768px, 1024px, 1440px
- [ ] Run Lighthouse / PageSpeed Insights and address any performance issues
- [ ] Submit `https://viajesgmp.com/sitemap-index.xml` to Google Search Console
- [ ] Connect custom domain in Netlify after staging approval
- [ ] Update `site` in `astro.config.mjs` to the live domain before final build

### Optional enhancements

- [ ] Add Google Analytics or privacy-respecting analytics (Plausible, Fathom)
- [ ] Add cookie consent if required for your jurisdiction
- [ ] Connect Google Business profile reviews to display on site
- [ ] Add more destination pages (Puerto Vallarta, Mexico City, San Miguel de Allende)
- [ ] Add blog or travel guide section for long-tail SEO

---

## Design tokens

All brand colors are defined as CSS custom properties in `src/styles/global.css`:

| Token | Value | Use |
|---|---|---|
| `--color-sand` | `#F7F1E8` | Page backgrounds |
| `--color-warm-white` | `#FFFDF8` | Card and surface backgrounds |
| `--color-ocean` | `#0A4F5A` | Primary brand color, links |
| `--color-terracotta` | `#C7653A` | CTAs, accents |
| `--color-agave` | `#5E7D5A` | Success states, checkmarks |
| `--color-charcoal` | `#1F2523` | Body text, headings |
| `--color-muted` | `#6D716C` | Secondary text |

---

## Files created

```
src/config/business.ts
src/styles/global.css
src/layouts/Layout.astro
src/components/SEO.astro
src/components/JsonLD.astro
src/components/Header.astro
src/components/Footer.astro
src/components/TrustBar.astro
src/components/QuoteForm.astro
src/components/FAQ.astro
src/components/CTABand.astro
src/components/Breadcrumbs.astro
src/pages/index.astro
src/pages/mexico-vacation-packages/index.astro
src/pages/cancun-riviera-maya-vacation-packages/index.astro
src/pages/los-cabos-vacation-packages/index.astro
src/pages/oaxaca-cultural-tours-day-of-the-dead/index.astro
src/pages/mexico-family-vacations/index.astro
src/pages/mexico-group-travel/index.astro
src/pages/destination-weddings-mexico/index.astro
src/pages/about/index.astro
src/pages/contact/index.astro
src/pages/privacy-policy/index.astro
src/pages/terms-and-conditions/index.astro
public/favicon.svg
public/robots.txt
astro.config.mjs
```
