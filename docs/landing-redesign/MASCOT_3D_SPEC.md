# EXBON CP — Interactive 3D Orangutan Mascot Specification

## 1. Strategic Architecture Decision (Evidence-Based)

- **Meshy MCP & Spline MCP Evaluation:**
  - Verified environment status: `MESHY_API_KEY` is absent, Spline OAuth / desktop installation is absent, and zero `.glb`/`.gltf`/`.splinecode` model assets exist inside `src/dapp/public/`.
  - Adding unauthenticated MCP blocks cannot fetch external meshes during this build without user login / IDE reload.
- **Chosen Solution (Genuine Real-Time WebGL 3D):**
  - Build a bespoke, high-craft **interactive 3D Stylized Orangutan Guardian** natively in WebGL using **Three.js + React Three Fiber (`three`, `@react-three/fiber@8`, `@react-three/drei@9`)** matched to React `18.3.1` and Next.js `14.2.23`.
  - Why this passes the 3D quality bar: it renders a real hardware-accelerated WebGL `<canvas>` with volumetric shaded geometry, soft directional key/fill/rim canopy lighting, contact ground shadow, multi-joint skeletal transform hierarchy, live pointer coordinate tracking, interactive hover/click state animations, and zero 2D image/GIF/video fakery.

---

## 2. Character Visual Design ("Penjaga Rimba EXBON CP")

Maintains clear species continuity with the approved warm orange-terracotta mascot identity while elevating it to sculptural 3D proportions:
- **Fur Coat:** Warm terracotta-copper matte-satin PBR (`#C85A28` primary coat, `#9E4016` deeper limb/shoulder fur, `#E07640` cheek & crest tufts).
- **Face & Muzzle:** Warm parchment-peach soft skin (`#F1D2B4`) with characteristic broad orangutan cheek pads (`flanges` subtle contoured capsules for recognizable mature guardian character), dark espresso nose/mouth expression, and expressive brow ridge.
- **Eyes:** Glossy dark obsidian irises (`#141A15`) inside cream sclera rims with subtle specular catchlights (`roughness: 0.12`, `metalness: 0.1`) + animated upper eyelids that perform natural randomized blinking (`every ~3.8s`).
- **Botanical Tech Collar / Charm:** Woven deep canopy green scarf band (`#215C35`) carrying a miniature glowing verification leaf badge (`#4EA868` / `#1F5A94` seal trim) tying the orangutan directly to EXBON CP's "Nature meets technology" story.
- **Pedestal / Environment:** Subtle mossy forest stone ring (`#203B29` / `#2E5238`) with floating botanical spores / subtle shadow catcher inside the Deep Canopy hero frame (`#12261A`).

---

## 3. Articulated Group Hierarchy & Behavioral State Machine

Component structure under `src/dapp/src/components/landing/mascot/`:
- `OrangutanStage.tsx` — Client wrapper managing WebGL support check, React `ErrorBoundary`, `<Suspense>` loading state, `prefers-reduced-motion` detection, keyboard-accessible interactive trigger button (`min-h-[44px]`), active speech bubble feedback, and accessible SVG fallback strictly if WebGL fails.
- `OrangutanCanvas.tsx` — Dynamically imported (`ssr: false`) `@react-three/fiber` `<Canvas>` (`dpr={[1, 2]}`, `camera={{ position: [0, 0.28, 4.1], fov: 36 }}`, ACES Filmic tone mapping, key/fill/rim light rig + `<ContactShadows>`).
- `OrangutanModel.tsx` — Articulated Three.js `<group>` hierarchy:
  - `rootGroup`: subtle breathing vertical float (`Math.sin(t * 1.6) * 0.035`) and scroll/idle sway.
  - `torsoGroup`: chest scale breathing + gentle lean toward pointer/click.
  - `headGroup`: smoothed `THREE.MathUtils.damp` pitch & yaw tracking desktop mouse pointer (`pointer.x`, `pointer.y`), plus head tilt on hover (`attention` state).
  - `leftEyePupil` / `rightEyePupil` & `eyelids`: eye gaze offset subtly tracks pointer beyond head rotation + periodic smooth blink (`scaleY` close/open).
  - `rightArmGroup` (`shoulder -> forearm + hand`): relaxed botanical rest pose in `idle`, lifts cleanly and waves with forearm oscillation when `mood === "greeting"` (triggered by click/tap/keyboard `"Sapa Maskot"`).
  - `leftArmGroup`: rests calmly near chest leaf badge / gestures balance on click/wave.
  - `leafBadgeGroup`: gentle orbital shimmer tilt + brightens subtly when verified simulation state is interacted with.

---

## 4. Interaction, Accessibility & Safety Rules

1. **Desktop Pointer Tracking:** Updates normalized pointer coords (`-1..1`) across the hero/canvas container using lightweight React refs (zero React re-renders per mousemove frame).
2. **Hover State:** Subtle body lean forward + ear perk + warm botanical rim brightness + micro status caption update.
3. **Click / Touch / Keyboard Reaction:** Clicking the 3D stage or pressing the accessible `"Sapa Penjaga Rimba"` button triggers a `2.2s` friendly right-arm wave + head nod + cycling concise domain tip (e.g., `"Sensor IoT & satelit memantau kanopi real-time."`, `"Izin warga adat wajib sebelum segel terbit."`, `"Semua angka di halaman ini masih simulasi testnet."`).
4. **Reduced Motion (`prefers-reduced-motion`):** Stops automatic bobbing, swaying, waves, and blinking loops immediately; allows gentle instant static pose change when user explicitly clicks; also exposes a lightweight `"Kurangi Gerak 3D"` toggle inside the stage control bar.
5. **Graceful Degradation / Fallback:** If WebGL initialization fails (checked via canvas `webgl2`/`webgl` context probe + R3F `ErrorBoundary` + `webglcontextlost` listener), cleanly renders an accessible branded illustration using `/maskot/potret.svg` with clear label `"Pratinjau 2D (WebGL tidak tersedia di perangkat ini)"`. Normal desktop/mobile WebGL devices ALWAYS display the real interactive 3D `<canvas>`.

