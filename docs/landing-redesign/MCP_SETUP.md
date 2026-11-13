# EXBON CP — MCP Setup & UI Registry Configuration

## 1. Configured & Verified Active MCP Servers

Inspected workspace and user Antigravity MCP configuration:
- Workspace config: `c:\excboncp\.agents\mcp_config.json`
- Global user config: `C:\Users\asepm\.gemini\config\mcp_config.json`

Active MCP servers verified live in this session:

| Server Name | Transport / Command | Purpose | Verified Live Output |
| :--- | :--- | :--- | :--- |
| `shadcn` | `npx shadcn@latest mcp` | Browse, search, and inspect `@shadcn`, `@react-bits`, `@magicui`, and `@aceternity` registry items directly | `get_project_registries` returned `@shadcn`, `@react-bits`, `@magicui`, `@aceternity` |
| `magicuidesign-mcp` | `npx -y @magicuidesign/mcp@latest` | Inspect Magic UI components, dependencies, examples, and source files | `listRegistryItems` and `getRegistryItem` returned full source & examples |

---

## 2. Updated Registry Configuration (`components.json`)

Both `c:\excboncp\components.json` and `c:\excboncp\src\dapp\components.json` were updated to add `@aceternity` alongside existing `@react-bits` and `@magicui` registries:

```json
"registries": {
  "@react-bits": "https://reactbits.dev/r/{name}.json",
  "@magicui": "https://magicui.design/r/{name}.json",
  "@aceternity": "https://ui.aceternity.com/registry/{name}.json"
}
```

### Commercial / Gated Registries Note (`@reactbits-starter`, `@reactbits-pro`)
- Public `@react-bits` works anonymously without authentication (`1,274` registry variants returned).
- `@reactbits-starter` and `@reactbits-pro` require a paid `REACTBITS_LICENSE_KEY` HTTP header/credential, which is not configured on this machine. No fake keys were added.

---

## 3. 3D Mascot MCP Evaluation (Meshy MCP & Spline MCP)

To satisfy the real 3D Orangutan mascot requirement without guessing or faking credentials:

### 3.1 Meshy MCP (`@meshy-ai/meshy-mcp-server`)
- **Required setup:**
  ```json
  "meshy": {
    "command": "npx",
    "args": ["-y", "@meshy-ai/meshy-mcp-server"],
    "env": { "MESHY_API_KEY": "<user-supplied-key>" }
  }
  ```
- **Observed environment blocker:** `MESHY_API_KEY` is absent in both the shell environment and project `.env*` files. Furthermore, editing `.agents/mcp_config.json` requires restarting/reloading the Antigravity IDE session to spawn a new stdio MCP server.

### 3.2 Spline MCP (`https://mcp.spline.design/mcp` or Desktop MCP)
- **Required setup:**
  ```json
  "spline": {
    "serverUrl": "https://mcp.spline.design/mcp"
  }
  ```
- **Observed environment blocker:** Spline's remote MCP requires interactive OAuth sign-in in Spline and the user's Spline account/scenes; local Spline desktop (`C:\Program Files\Spline`, `%LOCALAPPDATA%\Programs\Spline`) is also not installed on this workstation, and no `.splinecode` / `.glb` assets exist in `src/dapp/public/`.

### 3.3 Approved Execution Fallback for Interactive 3D Mascot
Because Meshy and Spline credentials/sessions are genuinely blocked in the current environment AND static 2D illustrations cannot pass off as 3D, EXBON CP builds a **real-time WebGL interactive 3D Orangutan mascot** directly in `src/dapp/` using **Three.js + React Three Fiber (`three`, `@react-three/fiber`, `@react-three/drei`)**:
- Articulated 3D character mesh hierarchy (torso, head, ears, snout, brow ridge, expressive eyes + eyelids for blinking, articulated shoulders/elbows/forearms/hands, woven botanical leaf badge).
- Genuine 3D cursor tracking (raycast/normalized pointer look-at rotation + eye/head follow on desktop), click/tap wave & nod reactions, hover ear-perk/greet animation, WebGL availability/context-loss handling, `prefers-reduced-motion` static-pose mode, and crisp accessible SVG fallback strictly when WebGL cannot initialize.
- Prepared cleanly so if a user supplies a `.glb` from Meshy/Spline later (at e.g. `/models/orangutan.glb`), the `3D` stage can load it seamlessly while delivering 100% genuine interactive 3D out of the box today.

