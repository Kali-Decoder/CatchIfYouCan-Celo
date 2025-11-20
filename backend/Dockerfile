## Node Dockerfile for relayer.cjs (Render-compatible)
FROM node:20-slim

WORKDIR /app

# Install OS deps (optional curl for health/debug)
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy your package manifest
COPY package.json .

# Install production deps only
RUN npm ci --omit=dev || npm install --omit=dev

# Copy the relayer script
COPY relayer.cjs .
# Expose dynamic port for Render
EXPOSE $PORT

# Default environment vars (can be overridden by Render)
ENV NODE_ENV=production

# Start the relayer
CMD ["node", "relayer.cjs"]