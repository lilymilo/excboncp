import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { validateTelemetryPayload, computeTelemetrySignature, toCanonicalIoTLayer } from '../src/telemetry-validator.js';

describe('IoT Node Telemetry Validator', () => {
  const samplePayload = {
    node_id: 'ESP32-PHYSICAL-NODE-01',
    timestamp: {
      datetime: '2026-11-03 19:30:00',
      iso8601: '2026-11-03T19:30:00+07:00',
      timezone: 'Asia/Jakarta',
      timezone_abbr: 'WIB',
      utc_offset: '+07:00',
      epoch: 1793709000
    },
    soil_moisture: 45.2,
    temperature: 27.8,
    flame_detected: false
  };

  test('should successfully validate valid JSON string payload', () => {
    const raw = JSON.stringify(samplePayload);
    const result = validateTelemetryPayload(raw);
    assert.equal(result.valid, true);
    assert.equal(result.data.node_id, 'ESP32-PHYSICAL-NODE-01');
    assert.equal(result.data.soil_moisture, 45.2);
    assert.equal(result.data.temperature, 27.8);
    assert.equal(result.data.flame_detected, false);
  });

  test('should successfully validate valid Buffer payload', () => {
    const buf = Buffer.from(JSON.stringify(samplePayload));
    const result = validateTelemetryPayload(buf);
    assert.equal(result.valid, true);
    assert.equal(result.data.node_id, 'ESP32-PHYSICAL-NODE-01');
  });

  test('should reject malformed JSON', () => {
    const malformed = '{"node_id": "test", broken...';
    const result = validateTelemetryPayload(malformed);
    assert.equal(result.valid, false);
    assert.match(result.error, /Invalid JSON/);
  });

  test('should reject payload missing required fields', () => {
    const missingSoil = {
      node_id: 'ESP32-01',
      temperature: 25.0,
      flame_detected: false
    };
    const result = validateTelemetryPayload(JSON.stringify(missingSoil));
    assert.equal(result.valid, false);
    assert.match(result.error, /soil_moisture/);
  });

  test('should compute deterministic SHA-256 signature with 0x prefix', () => {
    const sig1 = computeTelemetrySignature(samplePayload);
    const sig2 = computeTelemetrySignature(samplePayload);
    assert.equal(sig1, sig2);
    assert.ok(sig1.startsWith('0x'));
    assert.equal(sig1.length, 66);
  });

  test('should project into Canonical IoT Layer matching attestation schema', () => {
    const canonical = toCanonicalIoTLayer(samplePayload);
    assert.equal(canonical.node_id, 'ESP32-PHYSICAL-NODE-01');
    assert.equal(typeof canonical.chainsaw_detected, 'boolean');
    assert.equal(typeof canonical.smoke_ppm, 'number');
    assert.equal(typeof canonical.soil_moisture_pct, 'number');
    assert.ok(canonical.sha256_signature.startsWith('0x'));
  });
});

