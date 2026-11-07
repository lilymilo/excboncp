import http from 'node:http';
import mqtt from 'mqtt';
import { validateTelemetryPayload, toCanonicalIoTLayer } from './telemetry-validator.js';

// Configuration from environment variables
const MQTT_BROKER = process.env.MQTT_BROKER || 'localhost';
const MQTT_PORT = process.env.MQTT_PORT || '1883';
const MQTT_URL = process.env.MQTT_URL || `mqtt://${MQTT_BROKER}:${MQTT_PORT}`;
const MQTT_TOPIC_SUB = process.env.MQTT_TOPIC_SUBSCRIPTION || 'CbonCP/+/telemetry';
const MQTT_TOPIC_PUB = process.env.MQTT_TOPIC_TELEMETRY || 'CbonCP/node-1/telemetry';
const HTTP_PORT = parseInt(process.env.IOT_GATEWAY_PORT || process.env.PORT || '5050', 10);
const SIMULATION_MODE = process.env.SIMULATION_MODE === 'true';
const SIMULATION_INTERVAL_MS = parseInt(process.env.SIMULATION_INTERVAL_MS || '5000', 10);

// In-memory telemetry cache
const telemetryStore = new Map();
let mqttConnected = false;
let messageCount = 0;

console.log(`[IoT-Gateway] Starting CbonCP IoT Gateway Service...`);
console.log(`[IoT-Gateway] MQTT Broker Target: ${MQTT_URL}`);
console.log(`[IoT-Gateway] Subscribing to: ${MQTT_TOPIC_SUB}`);
console.log(`[IoT-Gateway] Simulation Mode: ${SIMULATION_MODE ? 'ENABLED' : 'DISABLED'}`);

// Connect to MQTT Broker
const client = mqtt.connect(MQTT_URL, {
  reconnectPeriod: 2000,
  connectTimeout: 5000,
  clientId: `cboncp-gateway-${Math.random().toString(16).substring(2, 8)}`
});

client.on('connect', () => {
  mqttConnected = true;
  console.log(`[MQTT] Connected successfully to ${MQTT_URL}`);
  client.subscribe(MQTT_TOPIC_SUB, (err) => {
    if (err) {
      console.error(`[MQTT] Failed to subscribe to ${MQTT_TOPIC_SUB}:`, err.message);
    } else {
      console.log(`[MQTT] Subscribed to topic filter: ${MQTT_TOPIC_SUB}`);
    }
  });

  // Also subscribe to legacy topic if different
  if (MQTT_TOPIC_SUB !== 'cboncp/telemetry') {
    client.subscribe('cboncp/telemetry');
  }
});

client.on('error', (err) => {
  mqttConnected = false;
  console.error(`[MQTT Error]: ${err.message}`);
});

client.on('offline', () => {
  mqttConnected = false;
  console.warn(`[MQTT] Connection lost. Reconnecting...`);
});

client.on('message', (topic, message) => {
  messageCount++;
  const validation = validateTelemetryPayload(message);
  if (!validation.valid) {
    console.warn(`[MQTT Ingest] Discarding invalid payload from topic [${topic}]: ${validation.error}`);
    return;
  }

  const data = validation.data;
  const canonical = toCanonicalIoTLayer(data);
  const record = {
    raw: data,
    canonical,
    topic,
    receivedAt: new Date().toISOString()
  };

  telemetryStore.set(data.node_id, record);
  console.log(`[MQTT Ingest] Processed telemetry from ${data.node_id}: Temp=${data.temperature}°C, Soil=${data.soil_moisture}%, Flame=${data.flame_detected}`);
});

// Periodic Simulator (for testing / demo / CI/CD)
let simulationTimer = null;
if (SIMULATION_MODE) {
  console.log(`[Simulator] Starting mock telemetry generator every ${SIMULATION_INTERVAL_MS}ms...`);
  simulationTimer = setInterval(() => {
    if (!client.connected) return;

    const mockPayload = {
      node_id: 'ESP32-SIMULATED-01',
      timestamp: {
        datetime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        iso8601: new Date().toISOString(),
        timezone: 'Asia/Jakarta',
        timezone_abbr: 'WIB',
        utc_offset: '+07:00',
        epoch: Math.floor(Date.now() / 1000)
      },
      soil_moisture: Number((40 + Math.random() * 30).toFixed(1)),
      temperature: Number((24 + Math.random() * 8).toFixed(1)),
      flame_detected: Math.random() < 0.05
    };

    client.publish(MQTT_TOPIC_PUB, JSON.stringify(mockPayload));
    console.log(`[Simulator] Published synthetic telemetry to ${MQTT_TOPIC_PUB}`);
  }, SIMULATION_INTERVAL_MS);
}

// HTTP Server for Healthchecks & Telemetry API
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (url.pathname === '/health' || url.pathname === '/healthz') {
    const isHealthy = true;
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
    const mockPayload = {
      node_id: 'ESP32-TRIGGERED-01',
      timestamp: {
        datetime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        iso8601: new Date().toISOString(),
        timezone: 'Asia/Jakarta',
        timezone_abbr: 'WIB',
        utc_offset: '+07:00',
        epoch: Math.floor(Date.now() / 1000)
      },
      soil_moisture: 42.5,
      temperature: 28.0,
      flame_detected: false
    };

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
  console.log(`[HTTP API] Health endpoint available at http://localhost:${HTTP_PORT}/health`);
  console.log(`[HTTP API] Telemetry API at http://localhost:${HTTP_PORT}/api/telemetry`);
});

// Graceful Shutdown
function shutdown() {
  console.log('[System] Shutting down gracefully...');
  if (simulationTimer) clearInterval(simulationTimer);
  server.close(() => {
    client.end(true, () => {
      console.log('[System] Terminated cleanly.');
      process.exit(0);
    });
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

