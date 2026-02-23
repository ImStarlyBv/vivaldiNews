# Stage 1: Dependencies & Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json ./

# Install all dependencies
RUN npm install --legacy-peer-deps

# Copy source
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js app
ARG COOLIFY_URL
ARG COOLIFY_FQDN
ARG AI_API_KEY
ARG AI_API_URL
ARG BRAVE_API_KEY
ARG CRON_SECRET
ARG DATABASE_URL
ARG NEXT_PUBLIC_SITE_URL
ARG COOLIFY_BUILD_SECRETS_HASH

ENV COOLIFY_URL=$COOLIFY_URL
ENV COOLIFY_FQDN=$COOLIFY_FQDN
ENV AI_API_KEY=$AI_API_KEY
ENV AI_API_URL=$AI_API_URL
ENV BRAVE_API_KEY=$BRAVE_API_KEY
ENV CRON_SECRET=$CRON_SECRET
ENV DATABASE_URL=$DATABASE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV COOLIFY_BUILD_SECRETS_HASH=$COOLIFY_BUILD_SECRETS_HASH
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Copy built app from builder
COPY --from=builder /app .

# Use non-root user
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the Next.js production server
CMD ["npm", "run", "start"]
