# Stage 1: Dependencies & Build
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies needed for Prisma on Alpine
RUN apk add --no-cache openssl libc6-compat

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies (skip postinstall — scripts/ not copied yet)
RUN npm install --legacy-peer-deps --ignore-scripts

# Copy source
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Generate Prisma client, run setup, and build
RUN npx prisma generate && node scripts/setup.js && npx next build

# Stage 2: Runner (standalone)
FROM node:20-alpine AS runner
WORKDIR /app

# Install dependencies needed for Prisma on Alpine
RUN apk add --no-cache openssl libc6-compat

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Install Prisma CLI for migrations
RUN npm install -g prisma

# Copy standalone build output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# Copy content directory (articles and categories)
COPY --from=builder /app/content ./content
# Copy Prisma schema and migrations for runtime migrations
COPY --from=builder /app/prisma ./prisma
# Copy generated Prisma client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

RUN chown -R nextjs:nextjs /app

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
