import test from "node:test";
import assert from "node:assert/strict";
import {
  buildRevenueSeries,
  computeRoleNextAction,
  formatWibDateTime,
  formatWibTime,
  getGreetingWib,
  parseHexBytes,
  toCanonicalStatus,
} from "../src/lib/dashboard-helpers.ts";

test("toCanonicalStatus normalizes parcel verification states consistently", () => {
  assert.equal(toCanonicalStatus("verified"), "VERIFIED");
  assert.equal(toCanonicalStatus("warning"), "WARNING");
  assert.equal(toCanonicalStatus("dispute"), "DISPUTE");
  assert.equal(toCanonicalStatus("blocked"), "BLOCKED");
  assert.equal(toCanonicalStatus("pending"), "BLOCKED");
});

test("formatWibTime and formatWibDateTime format WIB timestamps properly", () => {
  assert.equal(formatWibTime("2026-11-12T07:32:00Z"), "14:32 WIB");
  const full = formatWibDateTime("2026-11-12T07:32:00Z");
  assert.match(full, /12 Nov 2026, 14:32 WIB/);
  assert.equal(formatWibTime("invalid-date"), "12:00 WIB");
});

test("getGreetingWib selects appropriate WIB greeting across time bands", () => {
  assert.equal(getGreetingWib(new Date("2026-11-12T01:00:00Z")).greeting, "Selamat pagi");
  assert.equal(getGreetingWib(new Date("2026-11-12T05:00:00Z")).greeting, "Selamat siang");
  assert.equal(getGreetingWib(new Date("2026-11-12T09:00:00Z")).greeting, "Selamat sore");
  assert.equal(getGreetingWib(new Date("2026-11-12T15:00:00Z")).greeting, "Selamat malam");
});

test("computeRoleNextAction respects role responsibilities and parcel conditions", () => {
  const parcels = [
    { id: "PRCL-A", name: "Lahan A", verificationStatus: "verified", consentStatus: "granted" },
    { id: "PRCL-B", name: "Lahan B", verificationStatus: "warning", consentStatus: "none" },
  ];

  const community = computeRoleNextAction("community", parcels);
  assert.equal(community.href, "/consent?parcel=PRCL-B");

  const manager = computeRoleNextAction("manager", parcels);
  assert.equal(manager.href, "/map?parcel=PRCL-B");

  const recipient = computeRoleNextAction("recipient", parcels);
  assert.equal(recipient.href, "/portfolio");

  const auditor = computeRoleNextAction("auditor", parcels);
  assert.equal(auditor.href, "/approve");

  const guest = computeRoleNextAction("guest", parcels);
  assert.equal(guest.href, "/verify");
});

test("buildRevenueSeries aggregates transaction volume per selected period", () => {
  const txs = [{ volume_tco2e: 15, gross_amount_idr: 2_250_000 }];
  const harian = buildRevenueSeries("Harian", txs);
  const mingguan = buildRevenueSeries("Mingguan", txs);
  const bulanan = buildRevenueSeries("Bulanan", txs);

  assert.equal(harian.points.length, 6);
  assert.equal(mingguan.points.length, 7);
  assert.equal(bulanan.points.length, 4);
  assert.ok(harian.unitsSold > 24);
  assert.equal(harian.marketState, "Aktif simulasi");
});

test("parseHexBytes produces deterministic 32-byte array for HashSeal", () => {
  const sealA = parseHexBytes("0xa1b2c3d4");
  const sealB = parseHexBytes("0xa1b2c3d4");
  const sealModified = parseHexBytes("0xa1b2c3d5");

  assert.equal(sealA.length, 32);
  assert.deepEqual(sealA, sealB);
  assert.notDeepEqual(sealA, sealModified);
  assert.equal(sealA[0], 0xa1);
  assert.equal(sealA[3], 0xd4);
  assert.equal(sealA[4], 0);
});

