# Stage 1: Dependencies & Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies (triggers postinstall → scripts/setup.js)
RUN npm install --legacy-peer-deps

# Copy source (includes content/ if pre-seeded, otherwise setup.js creates it)
COPY . .

# Build Next.js app (also runs setup.js to ensure directories exist)
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Stage 2: Runner (standalone)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Copy standalone build output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# Copy content directory (articles and categories)
COPY --from=builder /app/content ./content

RUN chown -R nextjs:nextjs /app || true

USER nextjs

EXPOSE 8347

CMD ["node", "server.js"]
