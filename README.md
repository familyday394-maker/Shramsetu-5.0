# Shram Setu 2.0

**Verified digital work & wage records for India's informal workforce.**

Shram Setu gives daily-wage and construction workers a tamper-evident record of every
shift: a reusable QR pass that carries no personal data, a statutory wage ledger computed
in integer paise, a mutually approved muster roll, and a SHA-256 chained audit trail that
both worker and contractor can verify.

Senior Bal Vigyan Innovation · Division II · Indore, Madhya Pradesh.

---

## Quick start

```bash
npm install          # or: bun install
npm run dev          # http://localhost:3000
npm run build        # production bundle in dist/
npm run lint         # tsc --noEmit
npm run test:all     # unit + server-render + jsdom flow tests
```

The app is offline-first: records persist to `localStorage` **and** IndexedDB, and the
Supabase client is only created when `VITE_SUPABASE_URL` and a publishable key are present
(see `.env.example`). Without keys everything still works locally.

## Routes

| Route | Purpose |
| --- | --- |
| `#/home` | Marketing home: hero pass preview, portals, workflow, FAQ |
| `#/how-it-works` | Six-step custody chain of a shift |
| `#/create-account` · `#/sign-in` · `#/forgot-password` | Account lifecycle |
| `#/worker` · `#/contractor` | Authenticated portals (role-guarded) |
| `#/verify?refToken=…` | Public pass verification, opened by scanning a QR pass |
| `#/about` · `#/privacy` · `#/help` | Editorial + support pages |
| `#/judge-demo` | Isolated evaluation workspace with the cryptographic audit bench |

Unknown hashes render a friendly 404 rather than silently bouncing to the home page.

## Architecture

```
src/
├─ App.tsx                  route + role orchestration, lazy portal chunks
├─ components/
│  ├─ Header, Footer        public + authenticated chrome
│  ├─ ui/                   design-system primitives (Reveal, TiltCard, Accordion, …)
│  ├─ public/               logged-out pages (Home, VerifyPass, auth shell, …)
│  ├─ worker/, contractor/  authenticated portals
│  └─ *.tsx                 judge-demo composition screens
├─ services/
│  ├─ db.ts, indexedDB.ts   local-first repository (wages, muster, disputes)
│  ├─ auth.ts               sessions, hashed credentials, Supabase fallback
│  ├─ wageEngine.ts         statutory pro-rata maths in integer paise
│  ├─ cryptoAudit.ts        canonical serialisation + SHA-256 chain
│  ├─ anomalyEngine.ts      tamper / anomaly scoring
│  ├─ router.ts             hash router
│  ├─ i18n.ts, publicCopy.ts bilingual copy
│  └─ speech.ts             Web Speech readouts
└─ hooks/useModalBehavior.ts  dialog a11y (Escape, scroll lock, focus)
```

## Design system

Tokens are declared once in `src/index.css` through Tailwind v4's `@theme`, so every
component shares the same rhythm:

- **Palette** — `forest` (institutional green), `brass` (award accent), `sand` (warm paper
  neutrals) and `ink` (high-contrast text).
- **Type** — *Fraunces* for display headings, *Plus Jakarta Sans* for UI,
  *JetBrains Mono* for figures and hashes, *Noto Sans Devanagari* for Hindi.
- **Surfaces** — `.card`, `.panel`, `.btn` (`-primary`, `-gold`, `-outline`, `-ghost`,
  `-dark`), `.field`, `.label`, `.eyebrow` plus paper grain, blueprint grids and glows.
- **Motion** — reveal-on-scroll, count-ups, spotlight and tilt cards, aurora backdrops,
  a compliance marquee and a reading-progress bar. Every animation is disabled under
  `prefers-reduced-motion`.

## Accessibility & polish

- Skip-to-content link, visible focus rings, and `aria-current` navigation state.
- Dialogs trap the page (Escape, scroll lock, focus capture/restore) and are labelled.
- Language choice is remembered, defaults to the browser locale, and updates
  `<html lang>`; the public shell and both portals are bilingual, and English-only
  editorial pages say so explicitly.
- Per-route document titles, descriptive link labels and image `alt` text.
- Print stylesheet for the Smart Shram Pass (A4, colour-accurate).

## Offline single-file edition

For an exhibition desk, a labour office or a venue with no reliable internet, the entire
application can be compiled into **one file** that runs by double-clicking — no server, no
install, no network:

```bash
npm run build:offline    # → offline/index.html  (~1.9 MB)
npm run test:offline     # boots that file from disk in jsdom and asserts it renders
```

Everything is embedded: the minified application, the stylesheet, four variable typefaces
(Fraunces, Plus Jakarta Sans, JetBrains Mono, Noto Sans Devanagari) and both photographs as
data URIs. Routing is hash-based, so deep links keep working from `file://`; records live in
`localStorage`, and a shim takes over if the browser blocks storage for local files. The
QR payload falls back to the canonical public address because a `file://` document has no
usable origin.

## Testing

```bash
npm test              # 75 unit tests: wage engine, crypto chain, auth, QR round-trip
npm run test:render   # server-renders every public screen, asserts key content
npm run test:ui       # jsdom client flow: routes, sign-up, portals, demo, modals
npm run test:all      # typecheck + all of the above
npm run test:offline  # boots the single-file offline build from disk
```

## Notes

- This is an independent innovation project, **not** a government portal. It aligns with
  the MP Minimum Wages Act, e-Shram and MP BOCW workflows but does not replace statutory
  registration or perform identity verification.
- `src/backup-restore-point/` is a historical snapshot and is excluded from the build.
