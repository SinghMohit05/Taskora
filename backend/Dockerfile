# Multi-stage Dockerfile for TaskForge Backend Service
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace configurations
COPY package.json package-lock.json tsconfig.base.json ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/

# Install dependencies for shared and backend workspaces
RUN npm ci --workspace=shared --workspace=backend

# Copy shared package source and build it
COPY shared ./shared
RUN npm run build:shared

# Copy backend source and prisma schemas
COPY backend ./backend

# Generate Prisma Client and compile TypeScript backend
WORKDIR /app/backend
RUN npx prisma generate
RUN npm run build

# ----------------------------------------------------
# Production Runner Image
# ----------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy root configurations and installed node_modules
COPY package.json package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/package.json ./backend/package.json
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/backend/node_modules ./backend/node_modules

WORKDIR /app/backend

EXPOSE 5000

# Run prisma migration deploy and start the Express production server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
