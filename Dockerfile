FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev && npm cache clean --force

FROM node:20-alpine

WORKDIR /app

# użytkownik bez uprawnień root dla bezpieczeństwa
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

COPY --from=builder /app/node_modules ./node_modules

COPY --chown=nodejs:nodejs . .

USER nodejs

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["npm", "start"]
