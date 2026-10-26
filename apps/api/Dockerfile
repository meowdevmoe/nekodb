FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
RUN npm ci --workspace @nekodb/api --no-audit --no-fund
COPY apps/api apps/api
RUN npm run build --workspace @nekodb/api && npm prune --omit=dev --workspace @nekodb/api --no-audit --no-fund

FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/apps/api/package.json apps/api/
COPY --from=build /app/apps/api/dist apps/api/dist
COPY apps/api/assets apps/api/assets
USER node
EXPOSE 3741
CMD ["node", "apps/api/dist/index.js"]
