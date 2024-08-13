# Stage 1: Install dependencies only when needed
FROM node:20-alpine AS dependencies

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

# Stage 2: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

COPY . .
COPY --from=dependencies /app/node_modules ./node_modules

RUN yarn build

# Stage 3: Run the application
FROM nginx:alpine-slim

WORKDIR /usr/share/nginx/html

COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build .

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]