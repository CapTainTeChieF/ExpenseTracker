# Example Docker build (not a claim that this image has been built/tested here).
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit
COPY tsconfig.json nest-cli.json ./
COPY src ./src
RUN npm run build
FROM node:24-alpine
ENV NODE_ENV=production PORT=10000
WORKDIR /app
COPY --from=build /app/package*.json ./
RUN npm install --omit=dev --no-audit && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY migrations ./migrations
COPY scripts ./scripts
USER node
EXPOSE 10000
CMD ["node", "dist/main.js"]
