import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  formatPeriodHeading,
  getMondayOfWibWeek,
  isRouteAllowedForRole,
  normalizePeriodKey,
  shiftPeriodDate,
} from "../src/lib/copy.ts";

test("normalizePeriodKey normalizes Indonesian and English period slugs", () => {
  assert.equal(normalizePeriodKey("harian"), "harian");
  assert.equal(normalizePeriodKey("day"), "harian");
  assert.equal(normalizePeriodKey("mingguan"), "mingguan");
  assert.equal(normalizePeriodKey("week"), "mingguan");
  assert.equal(normalizePeriodKey("bulanan"), "bulanan");
  assert.equal(normalizePeriodKey("month"), "bulanan");
  assert.equal(normalizePeriodKey("tahunan"), "tahunan");
  assert.equal(normalizePeriodKey("year"), "tahunan");
  assert.equal(normalizePeriodKey("unknown"), "harian");
});

test("getMondayOfWibWeek snaps WIB dates back to Monday", () => {
  // 2026-11-12 is Thursday -> Monday is 2026-11-09
  assert.equal(getMondayOfWibWeek("2026-11-12"), "2026-11-09");
  // 2026-11-15 is Sunday -> Monday is still 2026-11-09
  assert.equal(getMondayOfWibWeek("2026-11-15"), "2026-11-09");
  // Monday maps to itself
  assert.equal(getMondayOfWibWeek("2026-11-09"), "2026-11-09");
});

test("shiftPeriodDate advances days, weeks, and months cleanly", () => {
  assert.equal(shiftPeriodDate("harian", "2026-11-12", 1), "2026-11-13");
  assert.equal(shiftPeriodDate("harian", "2026-11-12", -2), "2026-11-10");
  assert.equal(shiftPeriodDate("mingguan", "2026-11-09", 1), "2026-11-16");
  assert.equal(shiftPeriodDate("bulanan", "2026-11-12", -1), "2026-10-12");
  assert.ok(formatPeriodHeading("mingguan", "2026-11-12").includes("2026"));
});

test("isRouteAllowedForRole enforces route visibility matrix strictly", () => {
  assert.equal(isRouteAllowedForRole("/izin", "community").allowed, true);
  assert.equal(isRouteAllowedForRole("/izin/PARCEL-A", "manager").allowed, false);
  assert.equal(isRouteAllowedForRole("/consent", "auditor").allowed, false);

  assert.equal(isRouteAllowedForRole("/tinjau", "auditor").allowed, true);
  assert.equal(isRouteAllowedForRole("/approve", "community").allowed, false);
  assert.equal(isRouteAllowedForRole("/audit", "guest").allowed, false);

  assert.equal(isRouteAllowedForRole("/zona/ZONE-DEMO-A", "recipient").allowed, true);
  assert.equal(isRouteAllowedForRole("/zona/ZONE-DEMO-A", "community").allowed, false);

  // Public inspection routes stay open to guests
  assert.equal(isRouteAllowedForRole("/peta", "guest").allowed, true);
  assert.equal(isRouteAllowedForRole("/screener", "guest").allowed, true);
  assert.equal(isRouteAllowedForRole("/langsung", "guest").allowed, true);
  assert.equal(isRouteAllowedForRole("/verifikasi/1247", "guest").allowed, true);
  assert.equal(isRouteAllowedForRole("/indikator", "guest").allowed, true);
  assert.equal(isRouteAllowedForRole("/bantuan", "guest").allowed, true);
});

test("new Soft Botanical copy and page components omit forbidden trading/AI terms and em-dashes", () => {
  const root = path.resolve(process.cwd(), "src");
  const targets = [
    path.join(root, "lib", "copy.ts"),
    ...fs
      .readdirSync(path.join(root, "components", "pages"))
      .filter((f) => f.endsWith(".tsx"))
      .map((f) => path.join(root, "components", "pages", f)),
  ];

  const forbiddenWordRegex = /\b(bursa|exchange|dex|token|dompet)\b/i;
  for (const filePath of targets) {
    const content = fs.readFileSync(filePath, "utf8");
    const strippedComments = content
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");
    assert.equal(
      strippedComments.includes("\u2014"),
      false,
      `Found forbidden em-dash in ${path.basename(filePath)}`
    );
    assert.equal(
      forbiddenWordRegex.test(strippedComments),
      false,
      `Found forbidden trading term in ${path.basename(filePath)}: ${strippedComments.match(forbiddenWordRegex)?.[0]}`
    );
  }
});

test("VerifikasiView accepts both ?id= and ?q= search params used by DashboardOverview links", () => {
  const verifyViewPath = path.resolve(process.cwd(), "src", "components", "pages", "VerifikasiView.tsx");
  const content = fs.readFileSync(verifyViewPath, "utf8");
  assert.ok(content.includes('searchParams.get("id")'));
  assert.ok(content.includes('searchParams.get("q")'));
});


