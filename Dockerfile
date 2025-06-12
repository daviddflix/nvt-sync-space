# ─── Stage 1: Build (dependencies + compile) ─────────────────────────────────

# 1. Use an official Node.js runtime as parent image
FROM node:20.5.1-alpine3.18 AS builder

# 2. Set working directory
WORKDIR /usr/src/app

# 3. Configure npm to be more tolerant of registry hiccups
RUN npm config set registry https://registry.npmjs.org/ \
 && npm config set fetch-retries 5 \
 && npm config set fetch-retry-factor 10 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 120000

# 4. Install dependencies
#    Copy package manifests separately to leverage Docker layer cache
COPY package.json package-lock.json ./
RUN npm install

# 5. Copy source code
COPY . .

# 6. (Optional) If you transpile/compile (e.g. TypeScript, Babel), run build here
# RUN npm run build


# ─── Stage 2: Production Image ────────────────────────────────────────────────

FROM node:20.5.1-alpine3.18 AS runner

# 1. Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# 2. Set working directory & switch to non-root
WORKDIR /usr/src/app
USER appuser

# 3. Copy only what we need from the builder
COPY --from=builder --chown=appuser:appgroup /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /usr/src/app ./

# 4. Expose application port
EXPOSE 3000

# 5. Default startup command
CMD ["npm", "start"]
