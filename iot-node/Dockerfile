FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    IOT_GATEWAY_PORT=5050 \
    MQTT_BROKER=mqtt-broker \
    MQTT_PORT=1883

RUN apk add --no-cache curl

USER node

COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node package*.json ./
COPY --chown=node:node src/ ./src/

EXPOSE 5050

HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5050/health || exit 1

CMD ["node", "src/index.js"]
