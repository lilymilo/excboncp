# EXBON CP — Landing Page Redesign Project Audit

## 1. Concise Initial Audit Summary (11 lines)

1. Active workspace `c:\excboncp` (`feat/frontend-landing`) runs a Next.js 14.2.23 App Router frontend under `src/dapp/` with TypeScript 5.7, Tailwind CSS 3.4, Framer Motion 11.15, Leaflet 1.9, Recharts 3.10, and self-hosted `Sora`, `Geist Sans`, and `Geist Mono`.
2. The authenticated/interactive workspace pages (`/app`, `/peta`, `/screener`, `/langsung`, `/pasar`, `/verifikasi`, `/bantuan`, `/akun`) already use the cohesive light **Soft Botanical Intelligence** system (`#EEF5EC`, `#FFFFFF`, `#14261A`, `#2E6B3F`, `#1F5A94`).
3. By stark contrast, the public landing page (`/`, composed of `HeroSection.tsx`, `Navbar.tsx`, `MagicBento.tsx`, and 8 other dark-neon sections) renders an unrelated `#0B100C` + `#AEDA2D` acid-lime SaaS dark theme with zero cohesive transition into the actual product.
4. Old landing copy contains explicit domain and compliance violations: `"Terminal DEX Karbon"`, `"DEX Carbon Screener"`, lowercase `"excboncp"`, generic SaaS app icons (Figma/Slack/Notion/GitHub inside `MagicBento.tsx`), and static/fake hash literals in `TamperVerificationDemo.tsx`.
5. Zero `.glb`, `.gltf`, or Spline scene assets exist in `src/dapp/public/`; existing mascot art is strictly 2D SVG/raster/Lottie (`public/maskot/potret.svg`, `public/illustrations/orangutan-*`, `public/animations/`).
6. Official `shadcn` (`@react-bits`, `@magicui`) and `magicuidesign-mcp` MCP servers are live and verified in this session; `@aceternity` only requires adding its public registry URL to `components.json`.
7. `@reactbits-pro` / `@reactbits-starter` require `REACTBITS_LICENSE_KEY`, Meshy MCP requires `MESHY_API_KEY`, and Spline MCP requires Spline OAuth / desktop app — none of these credentials are present on disk or in environment variables.
8. Baseline quality checks pass prior to landing edits: `npx tsc --noEmit` exits cleanly (`0`) and `node --test tests/*.mjs` passes `12/12` tests (no Playwright/Next production server is running yet).
9. Older docs (`Brief Frontend`) reference `/masuk`, `/daftar`, `/dasbor`, `/panduan-juri`, whereas the real compiled Next.js routes are `/login`, `/register`, `/app`, `/bantuan`, `/peta`, `/screener`, `/verifikasi`.
10. Scoped plan: build a dedicated botanical-editorial Marketing Experience on `/` (tokens scoped cleanly so `/app`, `/login`, `/register`, and multipage routes stay untouched), featuring MCP-sourced UI primitives and a real interactive WebGL Three.js / React Three Fiber 3D Orangutan mascot.
11. `antislop` is active in `during` mode (resolved via workspace standard `AGENTS.md` rule 10) alongside `impeccable` (`mode-persuade`, `craft-floor`), `frontend-design`, `ui-ux-pro-max`, `ui-animation`, and `web-design-guidelines`.

---

## 2. Detected Conflicts & Authoritative Resolutions

| Area | Conflict / Gap Found | Authoritative Resolution |
| :--- | :--- | :--- |
| **Brand Name** | Old landing uses `excboncp` / `Excboncp` in titles, nav, footer, and metadata | Standardize every public mention to **EXBON CP** while keeping repository internal folder/package paths unchanged (`excboncp-dapp`) |
| **Forbidden Trading Terms** | Old `HeroSection.tsx:63` (`"Buka Terminal DEX Karbon"`) and `Navbar.tsx:9,13` (`"DEX Carbon Screener"`, `"Terminal DEX Karbon"`) trigger banned-term rules (`bursa`, `exchange`, `dex`, `token`, `dompet`) | Purge every occurrence of `DEX`, `exchange`, `bursa`, `token`, `dompet`, and buy/sell/swap framing from landing copy and component props |
| **Route Naming Drift** | Blueprint docs list `/masuk`, `/daftar`, `/dasbor`, `/panduan-juri` while `src/dapp/src/app` implements `/login`, `/register`, `/app`, `/bantuan`, `/peta`, `/screener`, `/verifikasi` | Link all landing CTAs and footer items exclusively to verified real App Router paths (`/peta`, `/screener`, `/app`, `/verifikasi`, `/bantuan`, `/login`, `/register`) |
| **Global StylingBleed** | `src/dapp/src/app/layout.tsx` puts dark classes (`bg-xb-bg text-xb-text`) on `<body>` and imports dark `#0B100C` vars in `globals.css` | Scope all redesigned landing tokens/styles under `.xb-landing` (`src/styles/landing.css`) and preserve existing classes/behavior for `/login`, `/register`, `/app`, and `.xb-botanical` |
| **Em-Dash / Typography Hygiene** | `tests/multipage-helpers.test.mjs` and `antislop` prohibit `\u2014` em-dashes and slop markers | Enforce zero em-dashes (`—`) across all landing copy, components, and tests; expand `tests/` assertions to cover landing copy |
| **MCP 3D Asset Credentials** | `MESHY_API_KEY`, `REACTBITS_LICENSE_KEY`, and Spline desktop/OAuth are absent in this environment, plus `.agents/mcp_config.json` changes require IDE restart to register new servers | Document exact setup + missing credential/restart blockers transparently in `MCP_SETUP.md`; deliver a real, non-faked interactive Three.js / React Three Fiber (`three`, `@react-three/fiber`, `@react-three/drei`) 3D Orangutan mascot with WebGL fallback |
| **Slop & Misleading Demos** | Old `MagicBento.tsx` shows unrelated SaaS icons (Slack, Figma, Notion, GitHub), particle trails, and `TamperVerificationDemo.tsx` compares static string `'4a18df...'` | Replace with genuine EXBON CP MRV workflows and real browser WebCrypto SHA-256 tamper recalculation, clearly badged as **Simulasi & Pratinjau Testnet** |

---

## 3. Verified Real Application Routes (`src/dapp/src/app`)

- Public Marketing: `/` (`src/app/page.tsx`)
- Authentication (Demo/Role): `/login`, `/register`
- Main App Workspace: `/app` (plus `/dashboard` -> check redirect? Let's verify `/app` primary; `/peta`, `/map`, `/peta/[parcelId]`, `/screener`, `/market`, `/langsung`, `/activity`, `/pasar`, `/pasar/[parcelId]`, `/rekap`, `/rekap/[periode]`, `/portfolio`, `/zona`, `/zona/[zoneId]`, `/izin`, `/izin/[parcelId]`, `/consent`, `/tinjau`, `/approve`, `/audit`, `/verifikasi`, `/verifikasi/[id]`, `/verify`, `/indikator`, `/bantuan`, `/akun`)

---

## 4. Pre-Edit Baseline Checks (Observed 2026-11-13)

- `npx tsc --noEmit` (in `c:\excboncp\src\dapp`): **PASS** (exit code `0`)
- `node --test tests/*.mjs` (in `c:\excboncp\src\dapp`): **PASS** (`12/12` passed, `0` failed)
- `impeccable detect --json` on existing landing files: `5` advisory findings in `src/components/MagicBento.tsx` (`bounce-easing` via `cubic-bezier(0.34, 1.4, 0.64, 1)` & `--mb-spring`)

---

## 5. Planned Skill & Tool Stack

- **Design Direction & Persuasion:** `impeccable` (`mode-persuade`, `craft-floor`), `frontend-design`, `ui-ux-pro-max`, `brand`, `design-system`, `awesome-design`
- **Motion & Interaction:** `ui-animation`, `motion-design`
- **Engineering, Composition & Accessibility:** `vercel-composition-patterns`, `web-design-guidelines`, `ui-styling`
- **Anti-Slop Enforcement (`during` mode):** `antislop`, `antislop-ui`, `antislop-copywriting`, `antislop-human`, `antislop-layoutmobile` (`contrast-check.py`)
- **MCP Registries:** `shadcn` (`@react-bits`, `@magicui`, `@aceternity`), `magicuidesign-mcp`

