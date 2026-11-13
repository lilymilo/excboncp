# EXBON CP — Landing Page Blueprint (`/`)

## 1. Architecture Summary (`8` Cohesive Sections)

Every link targets a verified real route in `src/dapp/src/app/`: `/peta`, `/screener`, `/app`, `/verifikasi`, `/bantuan`, `/login`, `/register`. No `/masuk`, `/daftar`, `/dasbor`, or `/panduan-juri` 404 links exist.

| # | Section Component | Purpose & Core Job | Key Interactive / MCP Feature |
| :--- | :--- | :--- | :--- |
| 1 | `LandingNavbar` | Minimal brand bar (`EXBON CP`), smooth section anchors, direct utility links (`/peta`, `/screener`, `/login`, `/app`), mobile drawer (`>= 44px` tap targets) | Sticky warm frosted paper bar, keyboard Escape/focus-safe mobile drawer |
| 2 | `LandingHero` | Clear H1 + core thesis (`"Kami membangun bukti dulu, baru nilai."`), concise subcopy, primary CTA (`/peta` + `/app`), honest testnet cue, and **Interactive 3D Orangutan Mascot Stage** | Three.js / React Three Fiber interactive 3D Orangutan (cursor follow, hover ear-perk/greet, click wave/nod, status speech cue, reduced-motion switch) + `Highlighter` stroke accent |
| 3 | `LandingProblemSection` | Explains the gap in legacy environmental claims vs verifiable proof before value assignment, anchored in concrete MRV risks | Interactive side-by-side comparison toggle (`Klaim Tanpa Bukti` vs `Alur EXBON CP`) using real parcel validation criteria |
| 4 | `LandingPipelineSection` | Shows how EXBON CP works from forest floor to cryptographic ledger across 4 deterministic stages | MCP `AnimatedBeam` connecting `IoT ESP32 + Sentinel-2` + `Izin Warga FPIC` into `Mesin Status Deterministik + AI Explainer` and `Segel SHA-256 & EAS` + `Simulasi 60/40` |
| 5 | `LandingShowcaseSection` | Live **Simulasi & Pratinjau Testnet** workbench using real `MOCK_PARCELS` (`lahan-a` & `lahan-b`) + real browser WebCrypto SHA-256 check | 3 interactive tabs: (1) Pratinjau Lahan A vs B (`HashSeal` preview), (2) Uji Manipulasi Hash SHA-256 real-time, (3) Simulator Pemulihan 60/40 + Pembekuan Kebakaran (`Api = 1`) -> deep links into `/peta`, `/verifikasi`, `/screener` |
| 6 | `LandingEvidenceSection` | Transparent architecture & verification boundaries: shows exact deterministic rules (`R5`, `R7`, `R9`), telemetry schemas, and what is currently real vs simulated on Base Sepolia | Expandable technical rule cards (`SpotlightCard` surface light) + strict zero-fabrication boundary card |
| 7 | `LandingConversionSection` | Invites judges, auditors, communities, and explorers to enter the live workspace or preview specific roles (`Publik / Pembeli`, `Warga Adat`, `Petugas / Admin`, `Verifikator`) | Direct action cards linking to `/app`, `/peta`, `/login`, `/register`, `/bantuan` |
| 8 | `LandingFooter` | Clean 3-column botanical footer with **EXBON CP** brand identity, verified product/auth links, and explicit hackathon testnet disclaimer | Sticky notice: `"Simulasi, testnet. Belum ada dukungan resmi dari pihak mana pun."` |

---

## 2. Responsive Layout & Accessibility Grid

- **320px / 375px Mobile:** Single column stacked cleanly (`px-4`, zero horizontal overflow). Hero stacks headline + CTAs immediately visible at top, followed smoothly by compact `280px–320px` 3D Orangutan stage with `"Sentuh maskot"` touch button (`>= 44x44px`).
- **768px Tablet:** `2`-column balanced flow where Showcase controls stack comfortably cleanly above visual preview cards.
- **1024px / 1440px Desktop:** Max container width `1200px` (`max-w-[1200px] mx-auto px-6 lg:px-8`). Hero uses `lg:grid-cols-12` (`7` cols editorial left, `5` cols sculptural 3D stage right).
- **Focus & Contrast:** Every interactive button, tab, link, and 3D mascot trigger supports visible `:focus-visible` `2px` forest ring (`#215C35`), `>= 44px` hit height, ARIA labels, and `prefers-reduced-motion`.

---

## 3. Section-by-Section Indonesian Copy Plan (Zero Em-Dashes, Zero Banned Words)

- **Hero Eyebrow:** `Simulasi & Pratinjau Testnet · Pemantauan Hutan Berbasis Bukti`
- **Hero H1:** `Kami membangun bukti dulu, baru nilai.`
- **Hero Subcopy:** `EXBON CP memadukan sensor lapangan IoT, citra satelit Sentinel-2, persetujuan warga adat (FPIC), dan segel kriptografis Base Sepolia agar kondisi hutan bisa diaudit siapa saja sebelum dinilai.`
- **Primary CTA:** `Jelajahi Peta Hutan` (`/peta`)
- **Secondary CTA:** `Buka Ruang Kerja` (`/app`)
- **Mascot Caption Pill:** `Maskot Penjaga Rimba 3D · Arahkan kursor atau klik untuk menyapa`

