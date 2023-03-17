# Install dependencies only when needed
FROM --platform=linux/amd64 node:16-alpine3.16 AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk add --update --no-cache \
        libressl-dev \
        musl-dev \
        libffi-dev \
        python3 \
        make \
        g++

WORKDIR /app
# COPY ./frontend/prisma ./prisma
COPY ./package.json ./yarn.lock ./
RUN yarn install --frozen-lockfile

FROM --platform=linux/amd64 node:16-alpine3.16 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN yarn build

# Production image, copy all the files and run next
FROM --platform=linux/amd64 node:16-alpine3.16 AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# COPY --from=builder ./app/prisma ./prisma

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/uploads ./uploads
COPY --from=builder --chown=nextjs:nodejs /app/src/embeddings ./src/embeddings

# COPY --chown=nextjs:nodejs ./compose/production/frontend/start-prisma-studio /start-prisma-studio

# RUN sed -i 's/\r$//g' /start-prisma-studio
# RUN chmod +x /start-prisma-studio

USER nextjs


EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
