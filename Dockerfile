FROM node:20-alpine AS build

WORKDIR /app/backend

COPY backend/package.json backend/package-lock.json ./
RUN npm ci

COPY backend ./
RUN npm run prisma:generate
RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /app/backend
ENV NODE_ENV=production

COPY --from=build /app/backend/package.json ./package.json
COPY --from=build /app/backend/package-lock.json ./package-lock.json
COPY --from=build /app/backend/node_modules ./node_modules
COPY --from=build /app/backend/prisma ./prisma
COPY --from=build /app/backend/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
