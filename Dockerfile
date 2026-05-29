# Build stage
FROM node:20-alpine AS builder

# Install pnpm (pinned to match pnpm-lock.yaml v9.0 / local pnpm 10)
RUN npm install -g pnpm@10.0.0

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Define build arguments for environment variables
ARG ODOO_URL
ARG ODOO_DATABASE
ARG ODOO_USERNAME
ARG ODOO_PASSWORD

# Set environment variables for build
ENV ODOO_URL=$ODOO_URL
ENV ODOO_DATABASE=$ODOO_DATABASE
ENV ODOO_USERNAME=$ODOO_USERNAME
ENV ODOO_PASSWORD=$ODOO_PASSWORD

# Build the application
RUN pnpm run build

# Production stage
FROM node:20-alpine

# Install pnpm (pinned to match pnpm-lock.yaml v9.0 / local pnpm 10)
RUN npm install -g pnpm@10.0.0

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built application from builder stage
COPY --from=builder /app/build ./build

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["node", "build"]
