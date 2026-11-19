<div align="center">

# >_ Vibe-Check Scanner

**Shipped with AI? Audit your site's security headers, TLS posture, exposed files, and leaked secrets in seconds.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-scan.ammarramma.dev-a6e3a1?style=for-the-badge&logo=cloudflare&logoColor=1e1e2e)](https://scan.ammarramma.dev)
[![API Status](https://img.shields.io/badge/API-api.ammarramma.dev-89b4fa?style=for-the-badge&logo=go&logoColor=1e1e2e)](https://api.ammarramma.dev/healthz)
[![License: MIT](https://img.shields.io/badge/License-MIT-cba6f7?style=for-the-badge)](LICENSE)

[![React](https://img.shields.io/badge/React-19-1e1e2e?style=flat-square&logo=react&logoColor=89dceb)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-7-1e1e2e?style=flat-square&logo=typescript&logoColor=89b4fa)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-1e1e2e?style=flat-square&logo=vite&logoColor=f9e2af)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-1e1e2e?style=flat-square&logo=tailwindcss&logoColor=94e2d5)](https://tailwindcss.com)

[Live App](https://scan.ammarramma.dev) · [API Health](https://api.ammarramma.dev/healthz) · [Portfolio](https://ammarramma.dev) · [Sponsor](https://github.com/sponsors/ammarramma)

</div>

Vibe-Check checks what a site already exposes: TLS configuration, security
headers, publicly reachable files, and accidentally leaked secrets. It turns
those findings into a clear security score with actionable next steps.

The scanner is passive by design. It does not brute-force endpoints, exploit
targets, or store scan results.

This repository contains the web client. The Go/Gin scanning service is
maintained separately.

## Features

- **One-scan security overview** with an A–F grade and a 0–100 score.
- **TLS and redirect analysis**, including certificate details, protocol
  version, and HTTP-to-HTTPS redirect behavior.
- **Security header checks** for the headers that matter in production.
- **Exposure checks** for commonly forgotten public files and paths.
- **Secret detection** for credentials and tokens exposed in public assets.
- **Prioritized findings** with evidence, explanations, and expandable detail.
- **AI-ready reports** that can be copied as Markdown or downloaded as JSON.
- **Live API status** in the navigation bar.
- **Light and dark themes** with the Catppuccin Latte and Mocha palettes.
- **Responsive interface** designed for desktop and mobile.

## How it works

1. Enter a public URL or pick one of the quick examples.
2. The frontend sends the target to the scanner API.
3. The backend performs passive checks across transport, headers, exposure, and
   secrets.
4. Results are scored, grouped by category, and presented with the issues worth
   fixing first.

Scans are intentionally read-only. Findings are indicators, not a replacement
for a full penetration test.

## Tech stack

| Layer | Technology |
| --- | --- |
| UI | React 19, TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Theme | Catppuccin Latte / Mocha |
| Typography | Montserrat, Fira Code |
| Deployment | Cloudflare Workers static assets |
| API | Go/Gin `mapi` service (separate service) |

## Getting started

### Requirements

- Node.js 20.19+ or 22.12+
- npm

### Install and run

```bash
npm install
cp env.example .env
npm run dev
```

Vite prints the local development URL. The app is ready to use once the API
environment variables are configured.

## Configuration

Runtime configuration is provided through Vite environment variables. Start
from the tracked example file:

```bash
cp env.example .env
```

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Yes | Base URL of the scanner API, without a trailing slash. |
| `VITE_SITE_URL` | Recommended | Public URL used for canonical and Open Graph metadata at build time. |
| `VITE_PORTFOLIO_URL` | Optional | Portfolio link shown in the header and footer. |
| `VITE_SPONSORS` | Optional | JSON array of support links. The first entry is the primary call to action. |
| `VITE_DEV_USE_PROXY` | Local only | Set to `true` to proxy API requests through Vite during development. |
| `VITE_DEV_API_TARGET` | Local only | API origin used by the development proxy. |

### Sponsor links

Support links are rendered from `VITE_SPONSORS`. Add or remove an entry without
changing the UI code. The value must be a single-line JSON array. Supported icon
names are `coffee`, `heart`, `github`, `star`, and `link`.

```env
VITE_SPONSORS='[{"label":"Buy Ammar a Coffee","url":"https://ko-fi.com/ammarramma","icon":"coffee"},{"label":"Join the Tribe","url":"https://sociabuzz.com/ammarramma/tribe","icon":"heart"},{"label":"Sponsor on GitHub","url":"https://github.com/sponsors/ammarramma","icon":"github"}]'
```

Invalid or empty entries are ignored. If `VITE_SPONSORS` is empty, the support
section is hidden.

### Local API access

The hosted API has a CORS allowlist limited to the production origin. To call it
from localhost, use Vite's development proxy. Add the following to
`.env.local`:

```env
VITE_DEV_USE_PROXY=true
VITE_DEV_API_TARGET=https://api.ammarramma.dev
```

The browser then calls `/v1/*` and `/healthz` on the Vite server, which forwards
those requests to the API. These variables are ignored in production builds.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run typecheck` | Run the TypeScript project checks. |
| `npm run build` | Type-check and create a production build in `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm run deploy` | Build the app and deploy it with Wrangler. |

## API overview

The frontend talks to the following endpoints:

### Scan

```http
POST ${VITE_API_BASE_URL}/v1/vibecheck/scan
Content-Type: application/json

{ "url": "https://example.com" }
```

A successful response follows a shared envelope:

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
    "categories": [],
    "checks": []
  },
  "error": null,
  "meta": {
    "request_id": "…",
    "timestamp": "2026-11-19T00:00:00Z"
  }
}
```

The scan result includes four categories (`transport`, `headers`, `exposure`,
and `secrets`) and check statuses of `pass`, `warn`, `fail`, `skip`, or `info`.

### Health

```http
GET ${VITE_API_BASE_URL}/healthz
```

Used by the live API indicator in the navigation bar. The client checks the
endpoint periodically and when the browser tab becomes visible again.

### Errors

Failures use the same envelope with `success: false` and an `error` object.
Important cases include:

| Status | Meaning |
| --- | --- |
| `400` | Invalid request, invalid URL, or blocked target. |
| `408` | The scan was cancelled. |
| `413` | The request payload was too large. |
| `429` | Rate limited. The UI shows a countdown from `Retry-After`. |
| `502` | DNS, TLS, or target reachability failure. |
| `503` | The scanner is busy. |
| `504` | The scan timed out. |
| `500` | Internal scanner error. |

Request IDs are displayed on both results and errors to make support and
debugging easier.

## Deployment

The application is a static single-page app deployed to Cloudflare Workers
static assets.

```bash
npm run deploy
```

`wrangler.jsonc` serves the contents of `dist/` with SPA fallback handling.
Attach the custom domain in the Cloudflare dashboard after the first deployment.

For Cloudflare Pages, deploy the generated `dist/` directory with:

```bash
npm run build
npx wrangler pages deploy dist --project-name vibecheck
```

Build-time variables such as `VITE_SITE_URL` must be available when the build
runs. They are embedded into the generated assets.

## Project structure

```text
src/
  components/     UI components and result views
  hooks/          Scan, theme, and API health hooks
  lib/            API client, types, formatting, sponsors, reports
  App.tsx         Page composition
  index.css       Design tokens, theme, and utilities
public/           Static assets and security headers
env.example       Environment variable reference
wrangler.jsonc    Cloudflare Workers configuration and SPA fallback
```

## Security and privacy

- Scanning is passive and read-only.
- Targets on private, loopback, and link-local addresses are rejected by the
  API to reduce SSRF risk.
- The frontend does not store scan results.
- Security headers and a content security policy are configured in
  `public/_headers`.
- Findings are indicators, not a guarantee that a site is secure. Verify
  critical issues before acting on them.

## Support

Vibe-Check is free to use. If it saved you time, you can support the project
through [Ko-fi](https://ko-fi.com/ammarramma),
[the Sociabuzz tribe](https://sociabuzz.com/ammarramma/tribe), or
[GitHub Sponsors](https://github.com/sponsors/ammarramma).

## Contributing

Issues and pull requests are welcome. Please keep changes focused, preserve the
passive-scanning model, and verify the production build before opening a pull
request:

```bash
npm run build
```
