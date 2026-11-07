import crypto from 'node:crypto';

/**
 * Validates and normalizes raw telemetry received from an ESP32 node.
 * 
 * @param {string|Buffer|object} payload
 * @returns {{ valid: boolean, data?: object, error?: string }}
 */
export function validateTelemetryPayload(payload) {
  let parsed;
  if (typeof payload === 'string' || Buffer.isBuffer(payload)) {
    try {
      parsed = JSON.parse(payload.toString('utf-8'));
    } catch (err) {
      return { valid: false, error: `Invalid JSON payload: ${err.message}` };
    }
  } else if (typeof payload === 'object' && payload !== null) {
    parsed = payload;
  } else {
    return { valid: false, error: 'Payload must be a string, Buffer, or Object' };
  }

  // Mandatory fields
  if (!parsed.node_id || typeof parsed.node_id !== 'string') {
    return { valid: false, error: 'Missing or invalid "node_id"' };
  }

  if (typeof parsed.soil_moisture !== 'number' || isNaN(parsed.soil_moisture)) {
    return { valid: false, error: 'Missing or invalid "soil_moisture" (must be number)' };
  }

  if (typeof parsed.temperature !== 'number' || isNaN(parsed.temperature)) {
    return { valid: false, error: 'Missing or invalid "temperature" (must be number)' };
  }

  if (typeof parsed.flame_detected !== 'boolean') {
    return { valid: false, error: 'Missing or invalid "flame_detected" (must be boolean)' };
  }

  return { valid: true, data: parsed };
}

/**
 * Computes a SHA-256 signature for verifiable attestation.
 * 
 * @param {object} payload 
 * @returns {string} 0x-prefixed sha256 hash
 */
export function computeTelemetrySignature(payload) {
  const normalized = JSON.stringify({
    node_id: payload.node_id,
    soil_moisture: payload.soil_moisture,
    temperature: payload.temperature,
    flame_detected: payload.flame_detected
  });
  const hash = crypto.createHash('sha256').update(normalized).digest('hex');
  return `0x${hash}`;
}

/**
 * Transforms validated telemetry into the canonical IoT layer schema.
 * 
 * @param {object} rawTelemetry 
 * @returns {object} Canonical IoT Layer compatible with attestation_payload.json
 */
export function toCanonicalIoTLayer(rawTelemetry) {
  return {
    node_id: rawTelemetry.node_id,
    chainsaw_detected: false, // Default false unless acoustic classifier triggers
    smoke_ppm: rawTelemetry.flame_detected ? 500 : 0, // Inferred or read from sensor
    soil_moisture_pct: Number(rawTelemetry.soil_moisture.toFixed(2)),
    sha256_signature: computeTelemetrySignature(rawTelemetry)
  };
}

