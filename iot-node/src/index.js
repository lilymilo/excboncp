import http from 'node:http';
import mqtt from 'mqtt';
import { validateTelemetryPayload, toCanonicalIoTLayer, computeTelemetrySignature } from './telemetry-validator.js';

const MQTT_BROKER = process.env.MQTT_BROKER || 'localhost';
const MQTT_PORT = process.env.MQTT_PORT || '1883';
const MQTT_URL = process.env.MQTT_URL || `mqtt://${MQTT_BROKER}:${MQTT_PORT}`;
const MQTT_TOPIC_SUB = process.env.MQTT_TOPIC_SUBSCRIPTION || 'CbonCP/+/telemetry';
const MQTT_TOPIC_PUB = process.env.MQTT_TOPIC_TELEMETRY || 'CbonCP/node-1/telemetry';
const HTTP_PORT = parseInt(process.env.IOT_GATEWAY_PORT || process.env.PORT || '5050', 10);
const SIMULATION_MODE = process.env.SIMULATION_MODE === 'true';
const SIMULATION_INTERVAL_MS = parseInt(process.env.SIMULATION_INTERVAL_MS || '5000', 10);

const telemetryStore = new Map();
let mqttConnected = false;
let messageCount = 0;

const client = mqtt.connect(MQTT_URL, {
  reconnectPeriod: 2000,
  connectTimeout: 5000,
  clientId: `cboncp-gateway-${Math.random().toString(16).substring(2, 8)}`
});

client.on('connect', () => {
  mqttConnected = true;
  console.log(`[MQTT] Connected to ${MQTT_URL}`);
  client.subscribe(MQTT_TOPIC_SUB, (err) => {
    if (err) console.error(`[MQTT] Subscription failed: ${err.message}`);
  });

  if (MQTT_TOPIC_SUB !== 'cboncp/telemetry') {
    client.subscribe('cboncp/telemetry');
  }
});

client.on('error', (err) => {
  mqttConnected = false;
  console.error(`[MQTT] Error: ${err.message}`);
});

client.on('offline', () => {
  mqttConnected = false;
});

client.on('message', (topic, message) => {
  messageCount++;
  const validation = validateTelemetryPayload(message);
  if (!validation.valid) {
    console.warn(`[MQTT] Discarding invalid payload: ${validation.error}`);
    return;
  }

  const data = validation.data;
  telemetryStore.set(data.node_id, {
    raw: data,
    canonical: toCanonicalIoTLayer(data),
    topic,
    receivedAt: new Date().toISOString()
  });
});

let simulationTimer = null;
if (SIMULATION_MODE) {
  simulationTimer = setInterval(() => {
    if (!client.connected) return;

    const flameDetected = Math.random() < 0.05;
    const epoch = Math.floor(Date.now() / 1000);
    const temp = Number((24 + Math.random() * 8).toFixed(1));

    const mockPayload = {
      node_id: 'ESP32-SIMULATED-01',
      device_id: 'ESP32-SIMULATED-01',
      ts: epoch,
      timestamp: {
        datetime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        iso8601: new Date().toISOString(),
        timezone: 'Asia/Jakarta',
        timezone_abbr: 'WIB',
        utc_offset: '+07:00',
        epoch
      },
      soil_moisture: Number((40 + Math.random() * 30).toFixed(1)),
      temperature: temp,
      temp_c: temp,
      smoke: flameDetected ? 500 : 25,
      sound: flameDetected ? 75 : 30,
      flame_detected: flameDetected
    };
    mockPayload.sig = computeTelemetrySignature(mockPayload);

    client.publish(MQTT_TOPIC_PUB, JSON.stringify(mockPayload));
  }, SIMULATION_INTERVAL_MS);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (url.pathname === '/health' || url.pathname === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'UP',
      mqtt: mqttConnected ? 'CONNECTED' : 'DISCONNECTED',
      uptime_seconds: Math.floor(process.uptime()),
      messages_received: messageCount,
      active_nodes: telemetryStore.size,
      simulation_mode: SIMULATION_MODE
    }));
    return;
  }

  if (url.pathname === '/api/telemetry') {
    const result = Array.from(telemetryStore.values());
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      total: result.length,
      data: result
    }));
    return;
  }

  if (url.pathname === '/api/telemetry/simulate' && req.method === 'POST') {
    const epoch = Math.floor(Date.now() / 1000);
    const mockPayload = {
      node_id: 'ESP32-TRIGGERED-01',
      device_id: 'ESP32-TRIGGERED-01',
      ts: epoch,
      timestamp: {
        datetime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        iso8601: new Date().toISOString(),
        timezone: 'Asia/Jakarta',
        timezone_abbr: 'WIB',
        utc_offset: '+07:00',
        epoch
      },
      soil_moisture: 42.5,
      temperature: 28.0,
      temp_c: 28.0,
      smoke: 25,
      sound: 30,
      flame_detected: false
    };
    mockPayload.sig = computeTelemetrySignature(mockPayload);

    if (client.connected) {
      client.publish(MQTT_TOPIC_PUB, JSON.stringify(mockPayload));
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, payload: mockPayload }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(HTTP_PORT, '0.0.0.0', () => {
  console.log(`[HTTP API] Server listening on port ${HTTP_PORT}`);
});

function shutdown() {
  if (simulationTimer) clearInterval(simulationTimer);
  server.close(() => {
    client.end(true, () => process.exit(0));
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
