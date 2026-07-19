# ─────────────────────────────────────────────────────────────────────────────
# Frontend Dockerfile (multi-stage: build → nginx)
# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — Build the Vite app
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# Build-time env: set the API URL to use the backend service name
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# Stage 2 — Serve with nginx
FROM nginx:1.27-alpine AS runner

# Copy custom nginx config (single-page app routing + security headers)
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

