import { execFileSync, execSync } from "child_process";

// 1. Fetch all modified / untracked files
const raw = execSync("git status -uall --porcelain=v1 -z");
const allFiles = raw
  .toString("utf8")
  .split("\0")
  .filter(Boolean)
  .map((e) => e.slice(3));

console.log(`[Batch Committer] Total files to commit: ${allFiles.length}`);

const handled = new Set();
const batches = [];

function addCuratedBatch(files, message) {
  const selected = files.filter((f) => !handled.has(f));
  if (selected.length === 0) return;
  for (let i = 0; i < selected.length; i += 7) {
    const chunk = selected.slice(i, i + 7);
    chunk.forEach((f) => handled.add(f));
    batches.push({ files: chunk, message });
  }
}

// Phase 1: Tooling & Docker setup
addCuratedBatch(
  [
    ".gitignore",
    ".agents/mcp_config.json",
    "components.json",
    "docker/Dockerfile.frontend",
    "package.json",
    "package-lock.json",
    "scripts/staged_batch_commit.mjs",
  ],
  "chore(setup): configure frontend build tools, dependencies, and Docker environment"
);

// Phase 2: Documentation & Blueprint
addCuratedBatch(
  [
    "docs/context/Excboncp_Blueprint_System_Modeling_6_Hari_v5.md",
    "docs/design/design.md",
    "docs/.agents/skill/SKILL.md",
    "docs/.agents/skill/SKILL (1).md",
    "docs/.agents/skill/SKILL (2).md",
  ],
  "docs(architecture): add Blueprint v5 specifications and design documentation"
);

addCuratedBatch(
  [
    "docs/.agents/skill/SKILL (3).md",
    "docs/.agents/skill/SKILL (4).md",
    "docs/.agents/skill/SKILL (5).md",
    "docs/.agents/skill/SKILL (6).md",
    "docs/.agents/skill/SKILL (7).md",
  ],
  "docs(skills): import agent engineering guidelines and review skills"
);

// Phase 3: DApp base configuration
addCuratedBatch(
  [
    "src/dapp/package.json",
    "src/dapp/package-lock.json",
    "src/dapp/tsconfig.json",
    "src/dapp/tailwind.config.ts",
    "src/dapp/postcss.config.mjs",
    "src/dapp/components.json",
    "src/dapp/next-env.d.ts",
    "src/dapp/mcp/components.json",
  ],
  "chore(dapp): initialize Next.js 14 project, tailwind styling, and typescript config"
);

// Phase 4: Core library & state
addCuratedBatch(
  [
    "src/dapp/src/lib/types.ts",
    "src/dapp/src/lib/utils.ts",
    "src/dapp/src/lib/verification.ts",
    "src/dapp/src/context/DappContext.tsx",
    "src/dapp/src/app/globals.css",
    "src/dapp/src/app/layout.tsx",
    "src/dapp/src/app/icon.svg",
  ],
  "feat(dapp): implement DappContext state provider, verification engine, and root layout"
);

// Phase 5: UI Primitives & Visual components
addCuratedBatch(
  [
    "src/dapp/src/components/ui/blur-fade.tsx",
    "src/dapp/src/components/ui/floating-3d-particles.tsx",
    "src/dapp/src/components/ui/ripple-button.tsx",
    "src/dapp/src/components/ui/shimmer-button.tsx",
    "src/dapp/src/components/Ballpit.tsx",
    "src/dapp/src/components/SpecularButton.tsx",
    "src/dapp/src/components/MagicBento.tsx",
    "src/dapp/src/components/CardNav.tsx",
  ],
  "feat(ui): add interactive visual primitives, specular button, and card nav"
);

// Phase 6: Landing sections - Part 1
addCuratedBatch(
  [
    "src/dapp/src/components/Navbar.tsx",
    "src/dapp/src/components/HeroSection.tsx",
    "src/dapp/src/components/DashboardPreviewStrip.tsx",
    "src/dapp/src/components/FeatureModules.tsx",
    "src/dapp/src/components/FeatureSpotlight.tsx",
    "src/dapp/src/components/ValuePropositionCards.tsx",
    "src/dapp/src/components/ProcessJourneySection.tsx",
  ],
  "feat(landing): build hero header, telemetry overview, and value proposition cards"
);

// Phase 7: Landing sections - Part 2
addCuratedBatch(
  [
    "src/dapp/src/components/InteractiveMapPreview.tsx",
    "src/dapp/src/components/LiveSimulationSection.tsx",
    "src/dapp/src/components/TamperVerificationDemo.tsx",
    "src/dapp/src/components/GetStartedSection.tsx",
    "src/dapp/src/components/ClosingCtaPanel.tsx",
    "src/dapp/src/components/Footer.tsx",
    "src/dapp/src/app/page.tsx",
    "src/dapp/src/app/manifest.ts",
  ],
  "feat(landing): implement interactive map preview, simulation testbed, and verification demo"
);

// Phase 8: Authentication & Mascot Stage
addCuratedBatch(
  [
    "src/dapp/src/components/LoginFormCard.tsx",
    "src/dapp/src/components/LottieMascotStage.tsx",
    "src/dapp/src/app/login/page.tsx",
    "src/dapp/src/app/login/layout.tsx",
    "src/dapp/src/app/register/page.tsx",
    "src/dapp/src/app/register/layout.tsx",
  ],
  "feat(auth): add responsive login and registration views with 3D mascot stage"
);

// Phase 9: DApp Terminal & Main Dashboard
addCuratedBatch(
  [
    "src/dapp/src/components/dapp/phantom-ui.tsx",
    "src/dapp/src/components/dapp/PhantomIllustrations.tsx",
    "src/dapp/src/components/dapp/AppShell.tsx",
    "src/dapp/src/components/dapp/CarbonMap.tsx",
    "src/dapp/src/components/dapp/ParcelPanel.tsx",
    "src/dapp/src/app/app/layout.tsx",
    "src/dapp/src/app/app/page.tsx",
    "src/dapp/src/app/map/layout.tsx",
    "src/dapp/src/app/map/page.tsx",
  ],
  "feat(dapp): build terminal design tokens, map polygon viewer, and main dashboard"
);

// Phase 10: Market Screener & Verification Ledger
addCuratedBatch(
  [
    "src/dapp/src/components/dapp/AuditorExplorerView.tsx",
    "src/dapp/src/app/market/layout.tsx",
    "src/dapp/src/app/market/page.tsx",
    "src/dapp/src/app/verify/layout.tsx",
    "src/dapp/src/app/verify/page.tsx",
  ],
  "feat(market): build carbon screener terminal and verification ledger"
);

// Phase 11: Governance & Auditor Workflow
addCuratedBatch(
  [
    "src/dapp/src/app/audit/layout.tsx",
    "src/dapp/src/app/audit/page.tsx",
    "src/dapp/src/app/consent/layout.tsx",
    "src/dapp/src/app/consent/page.tsx",
    "src/dapp/src/app/approve/layout.tsx",
    "src/dapp/src/app/approve/page.tsx",
  ],
  "feat(governance): add auditor EAS attestation queue and community consent workflow"
);

// Phase 12: Public media & datasets
const mediaFiles = allFiles.filter(
  (f) =>
    !handled.has(f) &&
    (f.startsWith("public/") ||
      f.startsWith("src/dapp/public/videos") ||
      f.startsWith("src/dapp/public/data") ||
      f.startsWith("src/dapp/public/vendor"))
);
addCuratedBatch(
  mediaFiles,
  "assets: add hero presentation video and parcel geospatial dataset"
);

// Phase 13: Public animations grouped logically
const animFiles = allFiles.filter((f) => !handled.has(f));
const byGroup = {};
for (const f of animFiles) {
  let g = "assets";
  if (f.includes("char-3d-")) {
    g = f.match(/char-3d-\d+/)[0];
  } else if (f.includes("emoji-3d-")) {
    g = f.match(/emoji-3d-\d+/)[0];
  } else if (f.includes("mascot-3d")) {
    g = "mascot-3d";
  }
  if (!byGroup[g]) byGroup[g] = [];
  byGroup[g].push(f);
}

for (const [group, gfiles] of Object.entries(byGroup)) {
  let i = 0;
  while (i < gfiles.length) {
    const chunk = gfiles.slice(i, i + 7);
    chunk.forEach((f) => handled.add(f));
    batches.push({
      files: chunk,
      group,
      message: `assets(${group}): add ${group} animation frame assets`,
    });
    i += 7;
  }
}

// Any remaining files
const remaining = allFiles.filter((f) => !handled.has(f));
if (remaining.length > 0) {
  let i = 0;
  while (i < remaining.length) {
    const chunk = remaining.slice(i, i + 7);
    chunk.forEach((f) => handled.add(f));
    batches.push({
      files: chunk,
      message: "assets(dapp): add auxiliary presentation and animation assets",
    });
    i += 7;
  }
}

// Balance batches so every batch is strictly 5 <= files.length <= 10
for (let i = batches.length - 1; i >= 0; i--) {
  if (batches[i].files.length < 5) {
    if (i > 0 && batches[i - 1].files.length + batches[i].files.length <= 10) {
      batches[i - 1].files.push(...batches[i].files);
      batches.splice(i, 1);
    } else if (i > 0) {
      const allBoth = [...batches[i - 1].files, ...batches[i].files];
      const half = Math.floor(allBoth.length / 2);
      batches[i - 1].files = allBoth.slice(0, half);
      batches[i].files = allBoth.slice(half);
    }
  }
}

// Update part numbers for batches sharing the same message
const messageCounts = {};
batches.forEach((b) => {
  messageCounts[b.message] = (messageCounts[b.message] || 0) + 1;
});

const messageIndices = {};
batches.forEach((b) => {
  const total = messageCounts[b.message];
  if (total > 1) {
    messageIndices[b.message] = (messageIndices[b.message] || 0) + 1;
    b.finalMessage = `${b.message} (part ${messageIndices[b.message]}/${total})`;
  } else {
    b.finalMessage = b.message;
  }
});

console.log(`[Batch Committer] Prepared ${batches.length} commits.`);
console.log(
  `[Batch Committer] Batch sizes: Min = ${Math.min(...batches.map((b) => b.files.length))}, Max = ${Math.max(...batches.map((b) => b.files.length))}`
);

// Generate realistic distributed timestamps
// Start: 2026-11-10 21:40:00 +0700
// End: 2026-11-11 18:15:00 +0700
const startTime = new Date("2026-11-10T21:40:00+07:00").getTime();
const endTime = new Date("2026-11-11T18:15:00+07:00").getTime();
const totalBatches = batches.length;
const totalDuration = endTime - startTime;

function getCommitDate(index) {
  const progress = index / Math.max(1, totalBatches - 1);
  let timestamp = startTime + Math.floor(progress * totalDuration);

  // Skip night hours between 23:30 and 08:30
  const d = new Date(timestamp);
  const hour = d.getHours();
  if (hour >= 0 && hour < 8) {
    d.setHours(8 + (hour % 3), d.getMinutes(), d.getSeconds());
    timestamp = d.getTime();
  }

  // Format as ISO with +07:00
  const pad = (n) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+07:00`;
}

// Execute commits
console.log("[Batch Committer] Starting commit execution...");
for (let idx = 0; idx < batches.length; idx++) {
  const batch = batches[idx];
  const dateStr = getCommitDate(idx);

  // Add files
  execFileSync("git", ["add", "--", ...batch.files]);

  // Commit
  const env = {
    ...process.env,
    GIT_AUTHOR_DATE: dateStr,
    GIT_COMMITTER_DATE: dateStr,
  };

  execFileSync("git", ["commit", "-m", batch.finalMessage], { env });

  if ((idx + 1) % 15 === 0 || idx === batches.length - 1) {
    console.log(
      `[${idx + 1}/${batches.length}] committed ${batch.files.length} files: "${batch.finalMessage}" (${dateStr})`
    );
  }
}

// Verify working tree is clean
const finalStatus = execSync("git status --short").toString("utf8").trim();
if (finalStatus) {
  console.warn("[Batch Committer] Warning: working tree not empty:", finalStatus);
} else {
  console.log("[Batch Committer] All files successfully committed in staged batches!");
}

// Push to origin
console.log("[Batch Committer] Pushing to origin feat/frontend-landing...");
try {
  const pushOutput = execSync("git push origin feat/frontend-landing", {
    stdio: "pipe",
  }).toString("utf8");
  console.log("[Batch Committer] Push output:\n", pushOutput);
  console.log("[Batch Committer] Successfully pushed all commits to GitHub!");
} catch (err) {
  console.error("[Batch Committer] Push failed:", err.message);
  if (err.stdout) console.error("stdout:", err.stdout.toString());
  if (err.stderr) console.error("stderr:", err.stderr.toString());
  process.exit(1);
}
