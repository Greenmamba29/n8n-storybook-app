# Multi-stage Docker build for N8N Interactive Storybook
# Stage 1: Dependencies and build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine AS runner

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy additional runtime files
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Create uploads directory for file uploads
RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health/ping || exit 1

# Start the application
CMD ["node", "server.js"]

# Labels for image metadata
LABEL maintainer="N8N Interactive Storybook Team"
LABEL version="1.0.0"
LABEL description="AI-powered interactive educational platform for N8N workflows"
LABEL org.opencontainers.image.source="https://github.com/your-username/n8n-storybook-app"
