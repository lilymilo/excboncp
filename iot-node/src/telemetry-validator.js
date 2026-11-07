import crypto from 'node:crypto';

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

export function computeTelemetrySignature(payload) {
  const normalized = JSON.stringify({
    node_id: payload.node_id,
    soil_moisture: payload.soil_moisture,
    temperature: payload.temperature,
    flame_detected: payload.flame_detected
  });
  return `0x${crypto.createHash('sha256').update(normalized).digest('hex')}`;
}

export function toCanonicalIoTLayer(rawTelemetry) {
  return {
    node_id: rawTelemetry.node_id,
    chainsaw_detected: false,
    smoke_ppm: rawTelemetry.flame_detected ? 500 : 0,
    soil_moisture_pct: Number(rawTelemetry.soil_moisture.toFixed(2)),
    sha256_signature: computeTelemetrySignature(rawTelemetry)
  };
}
