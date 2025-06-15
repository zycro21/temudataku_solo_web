# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependencies & install
COPY package*.json tsconfig.json ./
RUN npm install

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy only built code & deps from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm install --production

# Copy .env and other necessary config if needed
COPY .env .env

EXPOSE 5001

CMD ["node", "dist/index.js"]