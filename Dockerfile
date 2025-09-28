# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN corepack enable && corepack prepare pnpm@10.17.1 --activate \
  && pnpm install --frozen-lockfile=false

COPY . .
RUN pnpm build

# ---- Runtime stage ----
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html
COPY --from=builder /app/dist ./

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


