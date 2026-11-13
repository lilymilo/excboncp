# EXBON CP — Landing Page Design Direction

> **Mode & Skills Applied:** `antislop: during` (workspace rule), `impeccable` (`mode-persuade`, `craft-floor`), `frontend-design`, `ui-ux-pro-max`, `design-system`, `brand`, `ui-animation`, `motion-design`.

---

## 1. Visual Concept & Brand Thesis

**"Nature meets deterministic proof."**

Instead of a dark-neon "crypto terminal" landing page that clashes with EXBON CP's light **Soft Botanical Intelligence** application (`/app`), the redesigned `/` Marketing Experience establishes an editorial **"Botanical Field Atlas & Verification Ledger"** aesthetic:
- Bright, calm, breathable warm botanical paper (`#F5F7F1`) reminiscent of field reports and cartographic plates.
- Deep Kalimantan rainforest ink (`#12261A`) used selectively as structural contrast for the **3D Orangutan Stage pedestal** and closing conversion anchor — never dark-mode neon or acid-lime glow.
- Forest Emerald (`#235B35` / `#2E6B3F`) for verified ecological status and primary action authority.
- Cryptographic Seal Slate-Blue (`#1F5A94`) exclusively for SHA-256 hash sealing & Base Sepolia EAS proofs.
- Warm Orangutan Copper-Amber (`#C85A28` / `#E0733C`) reserved almost strictly for the **3D Orangutan Mascot** and its living canopy badge so the mascot commands emotional focus rather than dissolving into UI noise.

---

## 2. Three Design Dials (Grounded Explicit Decisions)

1. **Variance (`6 / 10` — Structured Editorial Asymmetry):**
   - Hero uses an asymmetrical `12`-column editorial grid (`7` cols typography + real proof strip & CTAs, `5` cols interactive 3D Orangutan WebGL stage).
   - Lower bands alternate intentionally between asymmetric problem-contrast split, horizontal 4-stage pipeline diagram with animated telemetry beams, full-width interactive tabbed Simulation & Proof Workbench (`Simulasi & Pratinjau Testnet`), and clean typographic evidence matrix. No repetitive 3-card bento SaaS clones.
2. **Motion (`5 / 10` — Crisp, Purposeful Mechanical & Living Motion):**
   - `100%` of scroll and hover reveals use exponential deceleration (`cubic-bezier(0.22, 1, 0.36, 1)`) — zero bounce/elastic easing slop.
   - Motion is concentrated in two high-meaning focal points: (a) the **Interactive 3D Orangutan** breathing, blinking, tracking the cursor, and waving/nodding on interaction, and (b) the **Animated Pipeline Beam** showing telemetry + FPIC flowing into a sealed proof.
   - Strict `prefers-reduced-motion` compliance (disables continuous WebGL idle bobbing, animated beams, and count-up transitions, preserving full static interactive controls).
3. **Density (`4 / 10` — Generous Editorial Breathing Room):**
   - `16px+` body prose (`line-height: 1.65`, constrained to `<= 66ch` per column).
   - Spacious section rhythm (`py-16 md:py-24`) with subtle card border contrast (`1px solid #D7E2D4`) and zero crowded pill-cloud clutter.

---

## 3. Scoped Color Palette & Token Architecture (`.xb-landing`)

All landing CSS custom properties are scoped strictly inside `.xb-landing` in `src/dapp/src/styles/landing.css` so global `/login`, `/register`, and `.xb-botanical` workspace styles remain `100%` untouched.

| Token | Hex | Role | Contrast Check Target |
| :--- | :--- | :--- | :--- |
| `--xb-land-bg` | `#F5F7F1` | Warm botanical paper page canvas | Base canvas |
| `--xb-land-surface` | `#FFFFFF` | Elevated card & workbench surface | Against `--xb-land-ink` |
| `--xb-land-surface-soft` | `#E8F0E5` | Subtle canopy sage block fill | Against `--xb-land-ink` |
| `--xb-land-canopy` | `#12261A` | Deep forest pedestal & high-contrast band | Against `#F5F7F1` |
| `--xb-land-ink` | `#122419` | Primary headings & body prose | `> 13:1` on paper/white |
| `--xb-land-ink-muted` | `#43574A` | Secondary captions & labels | `>= 6.5:1` on paper/white |
| `--xb-land-forest` | `#215C35` | Primary CTA fill & verified forest state | `>= 7.2:1` with `#FFFFFF` text |
| `--xb-land-forest-hover` | `#194729` | Primary CTA hover press | `>= 9.0:1` with `#FFFFFF` text |
| `--xb-land-seal` | `#1F5A94` | SHA-256 / Base Sepolia EAS attestation cue | `>= 6.6:1` with `#FFFFFF` text |
| `--xb-land-amber` | `#9A4D10` | Blocked/warning text accent (WCAG AA on light) | `>= 5.3:1` on white/paper |
| `--xb-land-border` | `#D4DFD1` | Clean architectural hairline stroke | Clear boundary |

---

## 4. Typography System

Reuses the self-hosted font stack loaded in `src/dapp/src/styles/fonts.ts` (`Sora`, `Geist Sans`, `Geist Mono`):
- **Display (`font-display` / Sora):** Hero H1 `clamp(2.25rem, 4.3vw, 3.65rem)`, tracking `-0.03em`, line-height `1.08`, weight `600`/`700`.
- **Section Headings (`font-display`):** `clamp(1.75rem, 2.8vw, 2.5rem)`, weight `600`, tight optical rhythm.
- **Body (`font-sans` / Geist Sans):** `1rem` (`16px`) to `1.0625rem` (`17px`), line-height `1.65`.
- **Hashes, Coordinates & Numeric Metrics (`font-mono` / Geist Mono + `tabular-nums`):** crisp alignment inside parcel comparisons, SHA-256 previews, and testnet logs.

---

## 5. Strict Compliance & Copy Guardrails

- **Brand Name:** Always **EXBON CP** (never `excboncp` or `Excboncp` in user-facing copy).
- **Mandatory Core Tagline:** Preserve `"Kami membangun bukti dulu, baru nilai."` prominently in Hero / Proof positioning.
- **Banned Trading Words (Zero occurrences):** Never use `DEX`, `bursa`, `exchange`, `token`, `dompet`, `coin`, `ICO`, `airdrop`, or buy/sell/swap CTAs anywhere on `/`.
- **Banned Typography / Slop:** Zero em-dashes (`—`), zero AI sparkles icons, zero fabricated stats/partner logos/testimonials/government endorsements.
- **Simulation Transparency:** Explicitly label simulated data/outputs `"Simulasi & Pratinjau Testnet"` / `"Simulasi, testnet. Belum ada dukungan resmi dari pihak mana pun."`

