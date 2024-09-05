# Build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY package*.json ./
COPY .env.prod ./

# Install only production dependencies
RUN npm ci --only=production

EXPOSE 3005

CMD ["npm", "run", "start:prod"]