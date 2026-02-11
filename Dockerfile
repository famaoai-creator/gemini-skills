# Stage 1: Base & Dependencies
FROM node:20-slim AS base
WORKDIR /app
COPY package*.json ./
# Install production dependencies only initially
RUN npm install --omit=dev

# Stage 2: Development & Testing
FROM base AS development
# Install devDependencies for testing and linting
RUN npm install
COPY . .
# Run validation and smoke tests as part of the build quality gate
RUN npm run validate && npm run test

# Stage 3: Production Runtime
FROM base AS production
COPY . .
# Final cleanup: ensure only necessary files remain
RUN rm -rf tests scripts/templates

# Environment setup
ENV NODE_ENV=production
# Default entrypoint for the CLI
ENTRYPOINT ["npm", "run", "cli", "--"]
CMD ["list"]
