# ==========================================
# Multi-stage Dockerfile untuk Angkara
# Menggunakan image lokal: node:22 & nginx:alpine
# ==========================================

# 1. Base stage
FROM node:22 AS base
WORKDIR /app

# Salin definisi dependensi
COPY package.json package-lock.json ./

# ------------------------------------------
# 2. Target: Development (HMR & Live Reload)
# ------------------------------------------
FROM base AS dev
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ------------------------------------------
# 3. Target: Builder (Production Build)
# ------------------------------------------
FROM base AS builder
RUN npm ci
COPY . .

# Build args untuk Supabase URL & Keys
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_PROJECT_ID

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID

RUN npm run build

# ------------------------------------------
# 4. Target: Runner (Production Nginx)
# ------------------------------------------
FROM nginx:alpine AS runner

# Konfigurasi custom Nginx untuk SPA & Security
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Salin artefak hasil build Vite
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
