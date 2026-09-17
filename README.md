# Modern World Time 🌍⏱️

A mobile-first, edge-native world clock, geographical explorer, and AI-powered country insights application inspired by modern iOS UI/UX design.

Deployed to **Cloudflare Pages** and powered by **Cloudflare Workers AI** using `@cf/meta/llama-3-8b-instruct`.

---

## Features

- **iOS-Inspired Aesthetics**:
  - Dynamic Island status bar with system indicators.
  - Floating glassmorphism pill bottom dock.
  - City story avatar reel with instant city switching.
  - High-contrast card design matching the design specification.
- **Dynamic Time & Weather Theming**:
  - **Time-Based Transitions**: Automatically toggles between daylight luminous mode and deep obsidian Dark Mode depending on the selected city's local time (day/night detection via `Intl.DateTimeFormat` and solar position).
  - **Weather-Based Transitions**:
    - **Sunny**: Warm radial gradients scaled to local temperature and UV index.
    - **Snow**: Smooth, lightweight canvas-driven snowfall particles.
    - **Rain/Storm**: Atmospheric slate-blue tint with falling raindrops and drizzle effects.
    - **Cloudy**: Subtle overcast fog mist.
- **Dual Toggleable Views**:
  - **List View**: Card list displaying UTC offset, local time, weather badge, and day/night icons.
  - **Map View**: Interactive world map featuring real-time solar terminator shading (day vs. night hatched regions), timezone markers (`UTC-4`, `UTC-2`, `UTC+0`, `UTC+2`, `UTC+4`), and active location timeline cursor.
- **Global Time Travel**:
  - Real-time time scrubber slider to preview time shifts (-12h to +12h) across all global timezones simultaneously.
- **Cloudflare Workers AI Country Insights**:
  - When clicking on any location pin or card, an iOS bottom sheet drawer slides up displaying:
    1. Exact current time with ticking seconds & timezone offset.
    2. Real-time atmospheric conditions (temperature, apparent temp, UV index, humidity, wind speed) from Open-Meteo.
    3. Country insights generated via Cloudflare Workers AI (`@cf/meta/llama-3-8b-instruct`):
       - Current President / Head of State.
       - "The Good": 3 positive aspects of living in or visiting that country.
       - "The Bad": 3 challenges or caveats.

---

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion
- **Weather API**: Open-Meteo (free, keyless API with Cloudflare Worker proxy)
- **Time Utilities**: Native `Intl.DateTimeFormat` & Solar Position Algorithm
- **Edge Backend**: Cloudflare Workers / Pages Functions
- **AI Model**: `@cf/meta/llama-3-8b-instruct` via Cloudflare Workers AI

---

## Cloudflare Deployment

### 1. Prerequisites
- Node.js 18+
- Cloudflare Account with Workers AI enabled
- Wrangler CLI installed (`npm install -g wrangler`)

### 2. Deploy to Cloudflare Pages with Workers AI Binding

```bash
# Login to Cloudflare
npx wrangler login

# Build static frontend
npm run build

# Deploy directly to Cloudflare Pages with Functions enabled
npx wrangler pages deploy dist --project-name modern-world-time
```

In the Cloudflare Dashboard:
1. Navigate to **Compute (Workers) > Pages > modern-world-time**.
2. Go to **Settings > Functions > Workers AI Bindings**.
3. Add a binding named `AI` pointing to Workers AI.

### 3. Deploy as Standalone Worker (Optional)

You can also deploy the standalone `worker.js` as an API backend:
```bash
npx wrangler deploy
```

---

## Local Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit `http://localhost:5173` in your browser.
The app includes an intelligent client-side edge fallback engine so all AI insights and weather features work immediately during local development even before deploying to Cloudflare!
