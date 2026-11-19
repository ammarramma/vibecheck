# Vibe-Check — Web Security & Leak Scanner

Frontend for **Vibe-Check**, a passive security and leak scanner for public
websites. It reads only what a site already serves: TLS, security headers,
exposed files, and leaked secrets. No brute force, no exploitation, no stored
results.

Built as a decoupled client for the Go/Gin `mapi` backend, intended to run at
`https://scan.ammarramma.dev`.

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4 via `@tailwindcss/vite`
- Lucide React icons
- Catppuccin Latte / Mocha design tokens (dark by default)
- Montserrat + Fira Code loaded from Google Fonts

## Quick start

```bash
npm install
cp env.example .env
npm run dev
```

Open the URL printed by Vite.

### Environment variables

Every backend URL and outbound link is environment-driven. Nothing is hardcoded
in component code.

| Variable | Purpose | Example |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Base URL of the `mapi` backend, no trailing slash | `https://api.ammarramma.dev` |
| `VITE_SPONSORS` | JSON array of sponsor buttons; first entry is primary; empty hides the section | See below |
| `VITE_PORTFOLIO_URL` | Portfolio link; empty hides it | `https://ammarramma.dev` |
| `VITE_SITE_URL` | Public URL used for canonical/OG tags at build time | `https://scan.ammarramma.dev` |
| `VITE_DEV_USE_PROXY` | Local only: proxy API calls through Vite | `true` |
| `VITE_DEV_API_TARGET` | Local only: proxy destination | `https://api.ammarramma.dev` |

Add or remove sponsors by editing `VITE_SPONSORS` only — no component changes.
The value must be a single-line JSON array. Supported icons: `coffee`, `heart`,
`github`, `star`, `link`.

```env
VITE_SPONSORS='[{"label":"Buy Ammar a Coffee","url":"https://ko-fi.com/ammarramma","icon":"coffee"},{"label":"Join the Tribe","url":"https://sociabuzz.com/ammarramma/tribe","icon":"heart"},{"label":"Sponsor on GitHub","url":"https://github.com/sponsors/ammarramma","icon":"github"}]'
```

### Local development and CORS

The production API only allows the deployed origin
(`https://scan.ammarramma.dev`). A browser on `localhost` cannot call it
directly, so development uses a Vite proxy:

```env
# .env.local
VITE_DEV_USE_PROXY=true
VITE_DEV_API_TARGET=https://api.ammarramma.dev
```

With this enabled, the app calls `/v1/...` and `/healthz` on the Vite dev server,
which forwards them to the API. Production builds ignore both variables. If you
deploy the frontend elsewhere, add that origin to the backend CORS allowlist
instead.

## Scripts

```bash
npm run dev        # Vite dev server
npm run typecheck  # TypeScript project build check
npm run build      # tsc -b && vite build
npm run preview    # preview the production build
npm run deploy     # build, then wrangler deploy
```

## Deploy to Cloudflare

The app is a static SPA. `wrangler.jsonc` points Workers static assets at
`./dist` with SPA fallback.

```bash
npm run deploy
```

Then attach the custom domain `scan.ammarramma.dev` in the Cloudflare dashboard.

For Cloudflare Pages instead:

```bash
npm run build
npx wrangler pages deploy dist --project-name vibecheck
```

Build-time environment variables must be available when `npm run build` runs.
`VITE_SITE_URL` is substituted into `index.html` during the Vite build, so set
it in your CI/deploy environment (or `.env`) before building.

## API contract

The client mirrors `mapi/internal/services/vibecheck/model.go` and the shared
envelope in `mapi/internal/shared/response.go`.

### Scan

```http
POST ${VITE_API_BASE_URL}/v1/vibecheck/scan
Content-Type: application/json

{ "url": "https://example.com" }
```

Success (`200`) returns:

```json
{
  "success": true,
  "data": {
    "target": {
      "url": "https://example.com",
      "final_url": "https://example.com/",
      "status_code": 200,
      "server": "cloudflare",
      "tls_version": "TLS 1.3"
    },
    "scanned_at": "2026-11-19T00:00:00Z",
    "duration_ms": 168,
    "score": 89,
    "grade": "B",
    "summary": {
      "total": 27,
      "passed": 19,
      "warnings": 5,
      "failed": 3,
      "skipped": 0,
      "info": 0
    },
    "categories": [
      {
        "category": "transport",
        "score": 85,
        "passed": 3,
        "warnings": 0,
        "failed": 1,
        "skipped": 0
      }
    ],
    "checks": [
      {
        "id": "https_redirect",
        "category": "transport",
        "title": "HTTP to HTTPS redirect",
        "status": "fail",
        "detail": "Plain HTTP requests are answered without redirecting to HTTPS.",
        "evidence": "http://example.com/"
      }
    ]
  },
  "error": null,
  "meta": {
    "request_id": "…",
    "timestamp": "2026-11-19T00:00:00Z"
  }
}
```

`status` is one of `pass`, `warn`, `fail`, `skip`, `info`. Categories are
`transport`, `headers`, `exposure`, and `secrets`.

### Health

```http
GET ${VITE_API_BASE_URL}/healthz
```

Used by the navbar live indicator. It polls every 45 seconds and when the tab
becomes visible again.

### Errors

Failures use the shared envelope with `success: false`, `data: null`, and an
`error` object (`code`, `message`, optional `details`). The UI handles these
codes explicitly:

| Status | Codes | UI |
| --- | --- | --- |
| 400 | `invalid_request`, `invalid_url`, `blocked_target` | Invalid target / target blocked (SSRF protection) |
| 408 | `scan_cancelled` | Scan cancelled |
| 413 | `payload_too_large` | Request too large |
| 429 | `rate_limited` | Countdown using `Retry-After` or `details.retry_after_seconds` |
| 502 | `dns_error`, `tls_error`, `target_unreachable` | DNS/TLS/unreachable specific message |
| 503 | `server_busy` | Scanner is busy |
| 504 | `scan_timeout` | Scan timed out |
| 500 | `internal_error` | Generic scanner error |

The client also reads `X-Request-ID`, `X-RateLimit-*`, and `Retry-After` when
exposed. Request IDs are shown on results and errors.

## Features

- **Live API badge** in the navbar via `GET /healthz` (online / checking /
  offline).
- **URL scanner** with normalization, Enter-to-submit, inline validation, and
  quick targets.
- **Bento result view**: grade gauge, score progress, normalized target,
  duration, timestamp, and request ID.
- **TLS & redirect card**: protocol, certificate status, subject, issuer,
  expiry, and HTTP→HTTPS redirect evidence.
- **Findings explorer**: status tabs (All / Issues / Passed / Info / Skipped),
  category filters, search, expandable detail and evidence, copy buttons.
- **Copy Markdown report**: a structured report made for pasting into an AI
  coding agent, plus JSON download.
- **Code-aware errors** with retry countdown and request ID.
- **Dark/light theme** (Mocha/Latte) persisted in localStorage, with a
  pre-paint script to avoid a flash.
- **Data-driven support CTA** with Ko-fi, Sociabuzz, GitHub Sponsors, and any
  future sponsor added via `VITE_SPONSORS`, plus portfolio credit from
  `VITE_PORTFOLIO_URL`.

## Design system

`src/index.css` is the single source of truth for color, typography, radius,
and shadow tokens. Components use semantic utilities (`bg-background`,
`bg-card`, `text-primary`, `border-border`, `font-mono`, `text-destructive`,
etc.) and never hardcoded hex/rgb values.

- Default theme: **Mocha** (`class="dark"` on `<html>`)
- Light theme: **Latte** (`.dark` removed)
- Persisted key: `vibecheck-theme`
- Fonts: `--font-sans` Montserrat, `--font-mono` Fira Code

## Project structure

```text
src/
  components/        UI: Header, Hero, ScanForm, result cards, findings, errors
  components/ui/     Shared Button primitives
  hooks/             useScan, useTheme, useApiHealth
  lib/               API client, types, formatting, env, report builder
  App.tsx            Page composition and state wiring
  index.css          Catppuccin theme + custom utilities/animations
public/
  _headers           Security headers + CSP for Cloudflare
  _redirects         SPA fallback
  robots.txt
wrangler.jsonc       Cloudflare Workers static assets config
```

## Security notes

- The frontend is passive; it never crawls aggressively or exploits targets.
- `public/_headers` sets CSP, frame denial, nosniff, and a restrictive
  permissions policy. `connect-src` allows HTTPS API calls; Google Fonts are
  allowed for styles/fonts.
- Findings are indicators, not a full penetration test. Verify anything
  critical before acting on it.
