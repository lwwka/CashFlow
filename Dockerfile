FROM node:20-bullseye-slim AS build

WORKDIR /app/backend

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY backend/package.json backend/package-lock.json ./
RUN npm ci

COPY backend ./
RUN npm run prisma:generate:deploy
RUN npm run build

FROM node:20-bullseye-slim AS runtime

WORKDIR /app/backend
ENV NODE_ENV=production

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/backend/package.json ./package.json
COPY --from=build /app/backend/package-lock.json ./package-lock.json
COPY --from=build /app/backend/node_modules ./node_modules
COPY --from=build /app/backend/prisma ./prisma
COPY --from=build /app/backend/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
