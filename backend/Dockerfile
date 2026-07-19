# ─────────────────────────────────────────────────────────────────────────────
# Backend Dockerfile (multi-stage)
# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Stage 2 — Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Security: run as non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 jobhub

COPY --from=deps --chown=jobhub:nodejs /app/node_modules ./node_modules
COPY --chown=jobhub:nodejs . .

# Ensure uploads directory exists (mounted as volume in production)
RUN mkdir -p uploads/resumes && chown -R jobhub:nodejs uploads

USER jobhub

EXPOSE 5000

ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

CMD ["node", "src/server.js"]

